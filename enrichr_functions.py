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
def enrichr_get_request( gmt, userListId ):
  # get metadata 
  import requests
  import json

  # define the get url 
  get_url = 'http://amp.pharm.mssm.edu/Enrichr/enrich'

  # get parameters 
  params = {'backgroundType':gmt,'userListId':userListId}

  # try get request until status code is 200 
  inst_status_code = 400

  # wait until okay status code is returned 
  while inst_status_code == 400:
    try:
      # make the get request to get the enrichr results 
      get_response = requests.get( get_url, params=params )

      # get status_code
      inst_status_code = get_response.status_code

    except:
      pass

  # load as dictionary 
  resp_json = json.loads( get_response.text )

  # get the key 
  only_key = resp_json.keys()[0]

  # get response_list 
  response_list = resp_json[only_key]

  # transfer the response_list to the enr_dict 
  enr = transfer_to_enr_dict( response_list )

  # return enrichment json and userListId
  return enr 

# transfer the response_list to a list of dictionaries 
def transfer_to_enr_dict(response_list):

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

  # transfer response_list to enr structure 
  # and only keep the top terms 
  #
  # initialize enr
  enr = []
  for i in range(len(response_list)):

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

def make_enr_clust(sig_id, inst_gmt, threshold, num_thresh):
  '''
  Make clustergram of enriched terms vs genes  
  '''
  from clustergrammer import Network
  import scipy

  print('\n\nGMT')
  print(inst_gmt)
  print('\n')

  ini_enr = enrichr_get_request(inst_gmt, sig_id)

  enr = []
  for inst_enr in ini_enr:
    if inst_enr['combined_score'] > 0:
      enr.append(inst_enr)

  # only keep the top 20 terms 
  if len(enr)>15:
    enr = enr[0:15]

  # print

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

  net.filter_network_thresh(threshold, num_thresh)
  net.cluster_row_and_col(dist_type='cos',run_clustering=True,dendro=False)

  # keep the original column order in rank 
  for inst_col in net.viz['col_nodes']:
    inst_col['rank'] = inst_col['ini']

  return net  

def make_enr_vect_clust(sig_enr_info, threshold, num_thresh):
  ''' 
  Make clustergram of enrichment results from Enrichr using a set of input 
  gene lists that have already been uploaded to Enrichr - up and down lists. 

  I'll be sent a list of userListIds with column titles and the requested gmt. 
  I'll then make get requests to Enrichr to get enriched terms. Then I'll make a 
  clustergram with gene signature columns and enriched term rows and combined 
  score tiles.
  '''
  from clustergrammer import Network
  import scipy 
  
  print('\n\nGMT')
  print(sig_enr_info['background_type'])
  print('\n')

  # process sig_enr_info
  ####################
  all_ids = []
  all_col_titles = []
  id_to_title = {}

  for inst_gs in sig_enr_info['signature_ids']:
    for inst_updn in ['up','dn']:

      # keep all ids 
      all_ids.append(inst_gs['enr_id_'+inst_updn])
      all_col_titles.append(inst_gs['col_title'])

      # keep association between id and col title 
      id_to_title[ inst_gs['enr_id_'+inst_updn] ] = inst_gs['col_title']+'_'+inst_updn

  # get unique columns 
  all_col_titles = list(set(all_col_titles))

  inst_gmt = sig_enr_info['background_type']

  # calc enrichment for all input gene lists 
  ############################################
  all_enr = []
  for inst_id in all_ids:
    # calc enrichment 
    enr = enrichr_get_request(inst_gmt, inst_id)

    # save enrichment obj: name and enr data 
    enr_obj = {}
    enr_obj['name'] = id_to_title[inst_id]
    enr_obj['enr'] = enr

    all_enr.append(enr_obj)

  # collect information into network data structure 
  ##################################################
  # rows: all enriched terms 
  row_node_names = []
  # cols: all gene lists 
  col_node_names = all_col_titles
  
  # loop through the gene signatures 
  for inst_gs in all_enr:
    # loop through the enriched terms for the gs 
    for inst_enr in inst_gs['enr']:
      # gather enriched terms 
      row_node_names.append(inst_enr['name'])

  # initialize network 
  net = Network()

  row_node_names = list(set(row_node_names))

  # save row and col nodes 
  net.dat['nodes']['row'] = row_node_names
  net.dat['nodes']['col'] = col_node_names

  net.dat['mat'] = scipy.zeros([len(row_node_names),len(col_node_names)])
  net.dat['mat_up'] = scipy.zeros([len(row_node_names),len(col_node_names)])
  net.dat['mat_dn'] = scipy.zeros([len(row_node_names),len(col_node_names)])

  print('\ngathering enrichment information\n----------------------\n')
  net.dat['mat_info'] = {}
  for i in range(len(row_node_names)):
    for j in range(len(col_node_names)):
      net.dat['mat_info'][str((i,j))] = {}
      for inst_updn in ['up','dn']:
        net.dat['mat_info'][str((i,j))][inst_updn] = []

  # fill in mat using all_enr, includes up/dn 
  for inst_gs in all_enr:

    inst_gs_name = inst_gs['name'].split('_')[0]
    inst_updn = inst_gs['name'].split('_')[1]

    # loop through the enriched terms for the gs 
    for inst_enr in inst_gs['enr']:

      inst_term = inst_enr['name']
      inst_cs = inst_enr['combined_score']
      inst_genes = inst_enr['int_genes']

      # save in mat 
      ###############

      row_index = row_node_names.index(inst_term)
      col_index = col_node_names.index(inst_gs_name)


      if inst_cs > 0:
        if inst_updn == 'up':
          net.dat['mat'][row_index, col_index] = net.dat['mat'][row_index, col_index] + inst_cs
          net.dat['mat_up'][row_index, col_index] = inst_cs
          net.dat['mat_info'][str((row_index,col_index))][inst_updn] = inst_genes
        elif inst_updn == 'dn':
          net.dat['mat'][row_index, col_index] = net.dat['mat'][row_index, col_index] - inst_cs
          net.dat['mat_dn'][row_index, col_index] = -inst_cs
          net.dat['mat_info'][str((row_index,col_index))][inst_updn] = inst_genes

  # filter and cluster network 
  print('\n  filtering network')
  net.filter_network_thresh(threshold,num_thresh)
  print('\n  clustering network')
  # net.cluster_row_and_col('cos')
  net.make_mult_views(dist_type='cos',filter_row=True)
  print('\n  finished clustering Enrichr vectors\n---------------------')

  return net 