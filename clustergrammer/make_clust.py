def make_clust(net, dist_type='cosine', run_clustering=True,
                          dendro=True, views=['pct_row_sum', 'N_row_sum'],
                          linkage_type='average'):

  ''' This will calculate multiple views of a clustergram by filtering the 
  data and clustering after each filtering. This filtering will keep the top 
  N rows based on some quantity (sum, num-non-zero, etc). '''

  import make_views
  from copy import deepcopy
  import calc_clust
  import run_filter

  df = net.dat_to_df()

  threshold = 0.0001
  df = run_filter.df_filter_row(df, threshold)
  df = run_filter.df_filter_col(df, threshold)

  # calculate initial view with no row filtering
  net.df_to_dat(df)
  calc_clust.cluster_row_and_col(net, dist_type=dist_type, linkage_type=linkage_type,
                           run_clustering=run_clustering, dendro=dendro)

  all_views = []
  send_df = deepcopy(df)

  if 'N_row_sum' in views:
    all_views = make_views.N_rows(net, send_df, all_views,
                                     dist_type=dist_type, rank_type='sum')

  if 'N_row_var' in views:
    all_views = make_views.N_rows(net, send_df, all_views,
                                     dist_type=dist_type, rank_type='var')

  if 'pct_row_sum' in views:
    all_views = make_views.pct_rows(net, send_df, all_views,
                                       dist_type=dist_type, rank_type='sum')

  if 'pct_row_var' in views:
    all_views = make_views.pct_rows(net, send_df, all_views,
                                       dist_type=dist_type, rank_type='var')

  net.viz['views'] = all_views