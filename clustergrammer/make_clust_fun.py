def make_clust(net, dist_type='cosine', run_clustering=True,
                          dendro=True, requested_views=['pct_row_sum', 'N_row_sum'],
                          linkage_type='average', sim_mat=False):

  ''' This will calculate multiple views of a clustergram by filtering the 
  data and clustering after each filtering. This filtering will keep the top 
  N rows based on some quantity (sum, num-non-zero, etc). '''

  from copy import deepcopy
  import calc_clust
  import run_filter
  import make_views
  import scipy

  df = net.dat_to_df()

  threshold = 0.0001
  df = run_filter.df_filter_row(df, threshold)
  df = run_filter.df_filter_col(df, threshold)

  # calculate initial view with no row filtering
  net.df_to_dat(df)

  # # preparing to make similarity matrices of rows and cols 
  # ###########################################################
  # sim_type = 'col'
  # if sim_type == 'row':
  #   new_row = 'col'
  #   new_col = 'row'
  # else:
  #   new_row = 'row'
  #   new_col = 'col'

  # tmp_dist_mat = calc_clust.calc_distance_matrix(net.dat['mat'], sim_type, 
  #                                                get_sim=True, 
  #                                                make_squareform=True, 
  #                                                filter_sim_below=0.1)

  # # save the distance matrix for use later 
  # net.dat['nodes'][new_row] = net.dat['nodes'][new_col]
  # net.dat['node_info'][new_row] = net.dat['node_info'][new_col]
  # net.dat['mat'] = tmp_dist_mat

  # ##################################################


  tmp_sim = calc_clust.cluster_row_and_col(net, dist_type=dist_type, 
                                linkage_type=linkage_type, 
                                run_clustering=run_clustering, 
                                dendro=dendro, ignore_cat=False, get_sim=True,
                                filter_sim_below=0.1)

  print(tmp_sim['row'].shape)
  print(tmp_sim['col'].shape)

  all_views = []
  send_df = deepcopy(df)

  if 'N_row_sum' in requested_views:
    all_views = make_views.N_rows(net, send_df, all_views,
                                  dist_type=dist_type, rank_type='sum')

  if 'N_row_var' in requested_views:
    all_views = make_views.N_rows(net, send_df, all_views,
                                  dist_type=dist_type, rank_type='var')

  if 'pct_row_sum' in requested_views:
    all_views = make_views.pct_rows(net, send_df, all_views,
                                    dist_type=dist_type, rank_type='sum')

  if 'pct_row_var' in requested_views:
    all_views = make_views.pct_rows(net, send_df, all_views,
                                    dist_type=dist_type, rank_type='var')

  if sim_mat is True:
    print('make similarity matrices of rows and columns, add to viz data structure')

  net.viz['views'] = all_views