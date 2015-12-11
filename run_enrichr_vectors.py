def main():
  make_enr_vect_clust()

def example_mult_views():
  from clustergrammer import Network

  net = Network()

  # load data 
  net.load_tsv_to_net('txt/example_tsv_network.txt')

  # make multple clusterings 
  net.make_mult_views(dist_type='cos', filter_row=True)

  # 
  net.write_json_to_file('viz','json/mult_view.json','indent')

  # net.mult_views()


def make_enr_vect_clust():
  import enrichr_functions as enr_fun
  from clustergrammer import Network
  ''' 
  I'll be making an clustergram of enrichr results from several gene lists.

  I'll receive user_list_ids from g2o2enrichr which I'll use to get results from 
  Enrichr. Each signature will consist of up and down genes. I'll request 
  Enrichr results from both up and down lists, then combine their results into 
  a clustergram. I'll use split tiles to indicate terms that are enriched based
  on up and down lists. 
  ''' 

  ####################################################### 
  # mock g2e data 
  ####################################################### 
  user_list_ids = [
    {"col_title":'something else ',"user_list_id":100},
    {"col_title":'Lung Spot Check 2',"user_list_id":101}
  ]

  gmt = 'ChEA_2015'
  g2e_post = { "user_list_ids": user_list_ids, "background_type": gmt }

  print(g2e_post)

  threshold = 0.001
  num_thresh = 1
  net = enr_fun.make_enr_vect_clust(g2e_post, threshold, num_thresh)

  # write network to json 
  net.write_json_to_file('viz','json/enr_vect_example.json')

main()