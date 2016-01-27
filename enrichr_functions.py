# make the get request to enrichr using the requests library 
# this is done before making the get request with the gmt name 
def enrichr_post_request( input_genes, meta=''):
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
def enrichr_get_request( gmt, userListId, max_num_term=50 ):
  import requests
  import json

  # convert userListId to string 
  userListId = str(userListId)

  # define the get url 
  get_url = 'http://amp.pharm.mssm.edu/Enrichr/enrich'

  # get parameters 
  params = {'backgroundType':gmt,'userListId':userListId}

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
  enr = transfer_to_enr_dict( response_list, max_num_term )

  # return enrichment json and userListId
  return enr 

# transfer the response_list to a list of dictionaries 
def transfer_to_enr_dict(response_list, max_num_term=50):

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
  if num_enr_term > max_num_term:
    num_enr_term = max_num_term

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

def enrichr_clust_from_response(response_list):
  from clustergrammer import Network
  import scipy
  import json 

  print('\nenrichr_clust_from_response\n')

  ini_enr = transfer_to_enr_dict( response_list )

  enr = []
  for inst_enr in ini_enr:
    if inst_enr['combined_score'] > 0:
      enr.append(inst_enr)

  threshold = 0.001 
  num_thresh = 1
  dendro=False

  # only keep the top 20 terms 
  if len(enr)>15:
    enr = enr[0:15]

  # genes 
  row_node_names = []
  # enriched terms 
  col_node_names = []

  # gather information from the list of enriched terms 
  for inst_enr in enr:

    # name 
    col_node_names.append(inst_enr['name'])
    
    # int_genes 
    row_node_names.extend(inst_enr['int_genes'])
    # combined score 

  row_node_names = sorted(list(set(row_node_names)))

  # fill in matrix 
  net = Network()

  # save row and col nodes 
  net.dat['nodes']['row'] = row_node_names
  net.dat['nodes']['col'] = col_node_names

  net.dat['mat'] = scipy.zeros([len(row_node_names),len(col_node_names)])

  for inst_enr in enr:

    inst_term = inst_enr['name']
    col_index = col_node_names.index(inst_term)

    net.dat['node_info']['col']['value'].append(inst_enr['combined_score'])

    for inst_gene in inst_enr['int_genes']:
      row_index = row_node_names.index(inst_gene)

      # save association 
      net.dat['mat'][row_index, col_index] = 1

  # make multiple views
  views = ['N_row_sum']
  net.make_filtered_views(dist_type='cosine', views=views, dendro=False)

  # keep the original column order in rank 
  for inst_col in net.viz['col_nodes']:
    inst_col['rank'] = inst_col['ini']

  return net  
