def add_enrichr_cats(df, inst_rc, run_enrichr, num_terms=10):
  from copy import deepcopy
  print('add enrichr categories to genes')

  tmp_gene_list = deepcopy(df['mat'].index.tolist())

  gene_list = []
  if type(tmp_gene_list[0]) is tuple:
    for inst_tuple in tmp_gene_list:
      gene_list.append(inst_tuple[0])
  else:
    gene_list = tmp_gene_list

  # set up for non-tuple case first
  if ': ' in  gene_list[0]:
    gene_list = [inst_gene.split(': ')[1] for inst_gene in gene_list]

  user_list_id = post_request(gene_list)

  print(user_list_id)

  enr, response_list = get_request(run_enrichr[0], user_list_id, max_terms=20)

  print(type(response_list))

  # import pdb; pdb.set_trace()

  # p-value, adjusted pvalue, z-score, combined score, genes
  # 1: Term
  # 2: P-value
  # 3: Z-score
  # 4: Combined Score
  # 5: Genes
  # 6: pval_bh

  cat_list = []
  for inst_gene in gene_list:
    cat_list.append([inst_gene])

  for inst_enr in response_list[0:num_terms]:
    inst_term = inst_enr[1]
    inst_list = inst_enr[5]

    for inst_info in cat_list:

      gene_name = inst_info[0].split(': ')[-1]

      print(gene_name)


      if gene_name in inst_list:
        inst_info.append(inst_term+': '+inst_term)
      else:
        inst_info.append(inst_term+': Not '+inst_term)

  cat_list = [tuple(x) for x in cat_list]

  # df = deepcopy(net.dat_to_df())
  df['mat'].index = cat_list
  # net.df_to_dat(df)

  # net.dat['nodes'][inst_rc] = cat_list

  return df

def clust_from_response(response_list):
  from clustergrammer import Network
  import scipy
  import json
  import pandas as pd
  import math
  from copy import deepcopy

  print('----------------------')
  print('enrichr_clust_from_response')
  print('----------------------')

  ini_enr = transfer_to_enr_dict( response_list )

  enr = []
  scores = {}
  score_types = ['combined_score','pval','zscore']

  for score_type in score_types:
    scores[score_type] = pd.Series()

  for inst_enr in ini_enr:
    if inst_enr['combined_score'] > 0:

      # make series of enriched terms with scores
      for score_type in score_types:

        # collect the scores of the enriched terms
        if score_type == 'combined_score':
          scores[score_type][inst_enr['name']] = inst_enr[score_type]
        if score_type == 'pval':
          scores[score_type][inst_enr['name']] = -math.log(inst_enr[score_type])
        if score_type == 'zscore':
          scores[score_type][inst_enr['name']] = -inst_enr[score_type]

      # keep enrichement values
      enr.append(inst_enr)

  # sort and normalize the scores
  for score_type in score_types:
    scores[score_type] = scores[score_type]/scores[score_type].max()
    scores[score_type].sort(ascending=False)

  number_of_enriched_terms = len(scores['combined_score'])

  enr_score_types = ['combined_score','pval','zscore']

  if number_of_enriched_terms <10:
    num_dict = {'ten':10}
  elif number_of_enriched_terms <20:
    num_dict = {'ten':10, 'twenty':20}
  else:
    num_dict = {'ten':10, 'twenty':20, 'thirty':30}

  # gather lists of top scores
  top_terms = {}
  for enr_type in enr_score_types:
    top_terms[enr_type] = {}
    for num_terms in num_dict.keys():
      inst_num = num_dict[num_terms]
      top_terms[enr_type][num_terms] = scores[enr_type].index.tolist()[: inst_num]

  # gather the terms that should be kept - they are at the top of the score list
  keep_terms = []
  for inst_enr_score in top_terms:
    for tmp_num in num_dict.keys():
      keep_terms.extend( top_terms[inst_enr_score][tmp_num] )

  keep_terms = list(set(keep_terms))

  # keep enriched terms that are at the top 10 based on at least one score
  keep_enr = []
  for inst_enr in enr:
    if inst_enr['name'] in keep_terms:
      keep_enr.append(inst_enr)


  # fill in full matrix
  #######################

  # genes
  row_node_names = []
  # enriched terms
  col_node_names = []

  # gather information from the list of enriched terms
  for inst_enr in keep_enr:
    col_node_names.append(inst_enr['name'])
    row_node_names.extend(inst_enr['int_genes'])

  row_node_names = sorted(list(set(row_node_names)))

  net = Network()
  net.dat['nodes']['row'] = row_node_names
  net.dat['nodes']['col'] = col_node_names
  net.dat['mat'] = scipy.zeros([len(row_node_names),len(col_node_names)])

  for inst_enr in keep_enr:

    inst_term = inst_enr['name']
    col_index = col_node_names.index(inst_term)

    # use combined score for full matrix - will not be seen in viz
    tmp_score = scores['combined_score'][inst_term]
    net.dat['node_info']['col']['value'].append(tmp_score)

    for inst_gene in inst_enr['int_genes']:
      row_index = row_node_names.index(inst_gene)

      # save association
      net.dat['mat'][row_index, col_index] = 1

  # cluster full matrix
  #############################
  # do not make multiple views
  views = ['']

  if len(net.dat['nodes']['row']) > 1:
    net.make_clust(dist_type='jaccard', views=views, dendro=False)
  else:
    net.make_clust(dist_type='jaccard', views=views, dendro=False, run_clustering=False)

  # get dataframe from full matrix
  df = net.dat_to_df()

  for score_type in score_types:

    for num_terms in num_dict:

      inst_df = deepcopy(df)
      inst_net = deepcopy(Network())

      inst_df['mat'] = inst_df['mat'][top_terms[score_type][num_terms]]

      # load back into net
      inst_net.df_to_dat(inst_df)

      # make views
      if len(net.dat['nodes']['row']) > 1:
        inst_net.make_clust(dist_type='jaccard', views=['N_row_sum'], dendro=False)
      else:
        inst_net.make_clust(dist_type='jaccard', views=['N_row_sum'], dendro=False, run_clustering = False)

      inst_views = inst_net.viz['views']

      # add score_type to views
      for inst_view in inst_views:

        inst_view['N_col_sum'] = num_dict[num_terms]

        inst_view['enr_score_type'] = score_type

        # add values to col_nodes and order according to rank
        for inst_col in inst_view['nodes']['col_nodes']:

          inst_col['rank'] = len(top_terms[score_type][num_terms]) - top_terms[score_type][num_terms].index(inst_col['name'])

          inst_name = inst_col['name']
          inst_col['value'] = scores[score_type][inst_name]

      # add views to main network
      net.viz['views'].extend(inst_views)

  return net

# make the get request to enrichr using the requests library
# this is done before making the get request with the lib name
def post_request(input_genes, meta=''):
  # get metadata
  import requests
  import json

  # stringify list
  input_genes = '\n'.join(input_genes)

  # define post url
  post_url = 'http://amp.pharm.mssm.edu/Enrichr/addList'

  # define parameters
  params = {'list':input_genes, 'description':''}

  # make request: post the gene list
  post_response = requests.post( post_url, files=params)

  # load json
  inst_dict = json.loads( post_response.text )
  userListId = str(inst_dict['userListId'])

  # return the userListId that is needed to reference the list later
  return userListId

# make the get request to enrichr using the requests library
# this is done after submitting post request with the input gene list
def get_request( lib, userListId, max_terms=50 ):
  import requests
  import json

  # convert userListId to string
  userListId = str(userListId)

  # define the get url
  get_url = 'http://amp.pharm.mssm.edu/Enrichr/enrich'

  # get parameters
  params = {'backgroundType':lib,'userListId':userListId}

  # try get request until status code is 200
  inst_status_code = 400

  # wait until okay status code is returned
  num_try = 0
  print('\tEnrichr enrichment get req userListId: '+str(userListId))
  while inst_status_code == 400 and num_try < 100:
    num_try = num_try +1
    try:
      # make the get request to get the enrichr results

      try:
        get_response = requests.get( get_url, params=params )

        # get status_code
        inst_status_code = get_response.status_code

      except:
        print('retry get request')

    except:
      print('get requests failed')

  # load as dictionary
  resp_json = json.loads( get_response.text )

  # get the key
  only_key = resp_json.keys()[0]

  # get response_list
  response_list = resp_json[only_key]

  # transfer the response_list to the enr_dict
  enr = transfer_to_enr_dict( response_list, max_terms )

  # return enrichment json and userListId
  return enr, response_list

# transfer the response_list to a list of dictionaries
def transfer_to_enr_dict(response_list, max_terms=50):

  # # reduce the number of enriched terms if necessary
  # if len(response_list) < num_terms:
  #   num_terms = len(response_list)

  # p-value, adjusted pvalue, z-score, combined score, genes
  # 1: Term
  # 2: P-value
  # 3: Z-score
  # 4: Combined Score
  # 5: Genes
  # 6: pval_bh

  num_enr_term = len(response_list)
  if num_enr_term > max_terms:
    num_enr_term = max_terms

  # transfer response_list to enr structure
  # and only keep the top terms
  #
  # initialize enr
  enr = []
  for i in range(num_enr_term):

    # get list element
    inst_enr = response_list[i]

    # initialize dict
    inst_dict = {}

    # transfer term
    inst_dict['name'] = inst_enr[1]
    # transfer pval
    inst_dict['pval'] = inst_enr[2]
    # transfer zscore
    inst_dict['zscore'] = inst_enr[3]
    # transfer combined_score
    inst_dict['combined_score'] = inst_enr[4]
    # transfer int_genes
    inst_dict['int_genes'] = inst_enr[5]
    # adjusted pval
    inst_dict['pval_bh'] = inst_enr[6]

    # append dict
    enr.append(inst_dict)

  return enr

