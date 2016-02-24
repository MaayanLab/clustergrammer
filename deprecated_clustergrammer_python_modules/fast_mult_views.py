def fast_mult_views(self, dist_type='cos', run_clustering=True, dendro=True):
  import numpy as np
  import pandas as pd
  from clustergrammer import Network
  from copy import deepcopy
  ''' 
  This will use Pandas to calculte multiple views of a clustergram 
  Currently, it is only filtering based on row-sum and it is disregarding 
  link information (used to add click functionality). 
  '''

  # gather category key 
  is_col_cat = False
  if len(self.dat['node_info']['col']['cl']) > 0:
    is_col_cat = True
    cat_key_col = {}
    for i in range(len(self.dat['nodes']['col'])):
      cat_key_col[ self.dat['nodes']['col'][i] ] = self.dat['node_info']['col']['cl'][i]

  # get dataframe dictionary of network and remove rows/cols with all zero values 
  df = self.dat_to_df()
  # each row or column must have at least one non-zero value  
  threshold = 0.001
  df = self.df_filter_row(df, threshold)
  df = self.df_filter_col(df, threshold)

  # calculate initial view with no row filtering
  #################################################
  # swap back in filtered df to dat 
  self.df_to_dat(df)

  # cluster initial view 
  self.cluster_row_and_col('cos',run_clustering=run_clustering, dendro=dendro)

  # set up views 
  all_views = []

  # set up initial view 
  inst_view = {}
  inst_view['pct_row_sum'] = 0
  inst_view['dist'] = 'cos'
  inst_view['nodes'] = {}
  inst_view['nodes']['row_nodes'] = self.viz['row_nodes']
  inst_view['nodes']['col_nodes'] = self.viz['col_nodes']

  # add view with no filtering 
  all_views.append(inst_view)

  # filter between 0% and 90% of some threshoold 
  all_filt = range(10)
  all_filt = [i/float(10) for i in all_filt]

  # row filtering values 
  mat = self.dat['mat']
  mat_abs = abs(mat)
  sum_row = np.sum(mat_abs, axis=1)
  max_sum = max(sum_row)

  for inst_filt in all_filt:
    
    # skip zero filtering 
    if inst_filt > 0:

      cutoff = inst_filt * max_sum

      # filter row 
      df = self.df_filter_row(df, cutoff, take_abs=True)

      print('\tfiltering at cutoff ' + str(inst_filt) + ' mat shape: ' + str(df['mat'].shape))

      # ini net 
      net = deepcopy(Network())

      # transfer to dat 
      net.df_to_dat(df)

      # add col categories if necessary 
      if is_col_cat: 
        inst_col_cats = []

        for inst_col_name in self.dat['nodes']['col']:
          inst_col_cats.append( cat_key_col[inst_col_name] )

        net.dat['node_info']['col']['cl'] = inst_col_cats

      # try to cluster 
      try: 

        # cluster
        net.cluster_row_and_col('cos')

        # add view 
        inst_view = {}
        inst_view['pct_row_sum'] = inst_filt
        inst_view['dist'] = 'cos'
        inst_view['nodes'] = {}
        inst_view['nodes']['row_nodes'] = net.viz['row_nodes']
        inst_view['nodes']['col_nodes'] = net.viz['col_nodes']
        all_views.append(inst_view)          

      except:
        print('\t*** did not cluster filtered view')

  # add views to viz
  self.viz['views'] = all_views

  print('\tfinished fast_mult_views')