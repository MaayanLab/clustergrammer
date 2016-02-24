def make_mult_views(self, dist_type='cos',filter_row=['value'], filter_col=False, run_clustering=True, dendro=True):
  ''' 
  This will calculate multiple views of a clustergram by filtering the 
  data and clustering after each fitlering. By default row filtering will 
  be turned on and column filteirng will not. The filtering steps are defined
  as a percentage of the maximum value found in the network. 
  '''
  from clustergrammer import Network
  from copy import deepcopy 

  # filter between 0% and 90% of some to be determined value 
  all_filt = range(10)
  all_filt = [i/float(10) for i in all_filt]

  # cluster default view 
  self.cluster_row_and_col('cos', run_clustering=run_clustering, dendro=dendro)

  self.viz['views'] = []

  all_views = []

  # Perform row filterings 
  ###########################
  if len(filter_row) > 0:

    # perform multiple types of row filtering 
    ###########################################
    for inst_type in filter_row:
      
      for row_filt_int in all_filt:

        # initialize new net 
        net = deepcopy(Network())
        net.dat = deepcopy(self.dat)
        # filter rows 
        net.filter_row_thresh(row_filt_int, filter_type=inst_type)

        # filter columns since some columns might be all zero 
        net.filter_col_thresh(0.001,1)

        # try to cluster - will not work if there is one row
        try:

          # cluster 
          net.cluster_row_and_col('cos')

          inst_name = 'filter_row'+'_'+inst_type

          # add view 
          inst_view = {}
          inst_view[inst_name] = row_filt_int
          inst_view['dist'] = 'cos'
          inst_view['nodes'] = {}
          inst_view['nodes']['row_nodes'] = net.viz['row_nodes']
          inst_view['nodes']['col_nodes'] = net.viz['col_nodes']

          all_views.append(inst_view)

        except:
          print('\t***did not cluster filtered view')

  # Default col Filtering 
  ###########################
  inst_meet = 1
  if filter_col == True:
    # col filtering 
    #####################
    for col_filt in all_filt:
      # print(col_filt)
      # initialize new net 
      net = deepcopy(Network())
      net.dat = deepcopy(self.dat)
      filt_value = col_filt * max_mat
      # filter cols 
      net.filter_col_thresh(filt_value, inst_meet)

      # try to cluster - will not work if there is one col
      try:

        # cluster 
        net.cluster_row_and_col('cos')

        # add view 
        inst_view = {}
        inst_view['filter_col'] = col_filt
        inst_view['dist'] = 'cos'
        inst_view['nodes'] = {}
        inst_view['nodes']['row_nodes'] = net.viz['row_nodes']
        inst_view['nodes']['col_nodes'] = net.viz['col_nodes']

        all_views.append(inst_view)

      except:
        print('did not cluster filtered view')    


  # add views to viz
  self.viz['views'] = all_views

  def filter_row_thresh( self, row_filt_int, filter_type='value' ):
  ''' 
  Remove rows from matrix that do not meet some threshold

  value: The default filtering is value, in that at least one value in the row 
  has to be higher than some threshold. 

  num: Rows can be filtered by the number of non-zero values it has. 

  sum: Rows can be filtered by the sum of the values 

  '''
  import scipy
  import numpy as np

  # max vlue in matrix 
  mat = self.dat['mat']
  max_mat = abs(max(mat.min(), mat.max(), key=abs))
  # maximum number of measurements 
  max_num = len(self.dat['nodes']['col'])

  mat_abs = abs(mat)
  sum_row = np.sum(mat_abs, axis=1)
  max_sum = max(sum_row)

  # transfer the nodes 
  nodes = {}
  nodes['row'] = []
  nodes['col'] = self.dat['nodes']['col']

  # transfer the 'info' part of node_info if necessary 
  node_info = {}
  node_info['row'] = []
  node_info['col'] = self.dat['node_info']['col']['info']

  # filter rows  
  #################################
  for i in range(len(self.dat['nodes']['row'])):

    # get row name 
    inst_nodes_row = self.dat['nodes']['row'][i]

    # get node info - disregard ini, clust, and rank orders
    if len(self.dat['node_info']['row']['info']) > 0:
      inst_node_info = self.dat['node_info']['row']['info'][i]

    # get absolute value of row data 
    row_vect = np.absolute(self.dat['mat'][i,:])

    # value: is there at least one value over cutoff 
    ##################################################
    if filter_type == 'value':

      # calc cutoff 
      cutoff = row_filt_int * max_mat

      # count the number of values above some thresh 
      found_tuple = np.where(row_vect >= cutoff)
      if len(found_tuple[0])>=1:
        # add name 
        nodes['row'].append(inst_nodes_row)
        # add info if necessary 
        if len(self.dat['node_info']['row']['info']) > 0:
          node_info['row'].append(inst_node_info)

    elif filter_type == 'num':

      num_nonzero = np.count_nonzero(row_vect)
      # use integer number of non-zero measurements
      cutoff = row_filt_int * 10

      if num_nonzero>= cutoff:
        # add name 
        nodes['row'].append(inst_nodes_row)
        # add info if necessary 
        if len(self.dat['node_info']['row']['info']) > 0:
          node_info['row'].append(inst_node_info)

    elif filter_type == 'sum':

      inst_row_sum = sum(abs(row_vect))

      if inst_row_sum > row_filt_int*max_sum:
        # add name 
        nodes['row'].append(inst_nodes_row)
        # add info if necessary 
        if len(self.dat['node_info']['row']['info']) > 0:
          node_info['row'].append(inst_node_info)

  # cherrypick data from self.dat['mat'] 
  ##################################
  # filtered matrix 
  filt_mat = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])
  if 'mat_up' in self.dat:  
    filt_mat_up = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])
    filt_mat_dn = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])
  if 'mat_info' in self.dat:
    # initialize filtered mat_info dictionary with tuple keys 
    filt_mat_info = {}

  # loop through the rows
  for i in range(len(nodes['row'])):
    inst_row = nodes['row'][i]

    # loop through the cols
    for j in range(len(nodes['col'])):

      inst_col = nodes['col'][j]

      # get row and col index
      pick_row = self.dat['nodes']['row'].index(inst_row)
      pick_col = self.dat['nodes']['col'].index(inst_col)

      # cherrypick 
      ###############
      filt_mat[i,j] = self.dat['mat'][pick_row, pick_col]
      if 'mat_up' in self.dat:  
        filt_mat_up[i,j] = self.dat['mat_up'][pick_row, pick_col]
        filt_mat_dn[i,j] = self.dat['mat_dn'][pick_row, pick_col]
      if 'mat_info' in self.dat:
        filt_mat_info[str((i,j))] = self.dat['mat_info'][str((pick_row,pick_col))]

  # save nodes array - list of node names 
  self.dat['nodes'] = nodes

  # save node_info array - list of node infos 
  self.dat['node_info']['row']['info'] = node_info['row']
  self.dat['node_info']['col']['info'] = node_info['col']

  # overwrite with new filtered data 
  self.dat['mat'] = filt_mat
  # overwrite with up/dn data if necessary 
  if 'mat_up' in self.dat:  
    self.dat['mat_up'] = filt_mat_up
    self.dat['mat_dn'] = filt_mat_dn
  # overwrite mat_info if necessary 
  if 'mat_info' in self.dat:
    self.dat['mat_info'] = filt_mat_info

  print( 'final mat shape' + str(self.dat['mat'].shape ) + '\n')

def filter_col_thresh( self, cutoff, min_num_meet ):
  ''' 
  remove rows and columns from matrix that do not have at least 
  min_num_meet instances of a value with an absolute value above cutoff 
  '''
  import scipy
  import numpy as np

  # transfer the nodes 
  nodes = {}
  nodes['row'] = self.dat['nodes']['row']
  nodes['col'] = []

  # transfer the 'info' part of node_info if necessary 
  node_info = {}
  node_info['row'] = self.dat['node_info']['row']['info']
  node_info['col'] = []

  # add cols with non-zero values 
  #################################
  for i in range(len(self.dat['nodes']['col'])):

    # get col name
    inst_nodes_col = self.dat['nodes']['col'][i]

    # get node info - disregard ini, clust, and rank orders
    if len(self.dat['node_info']['col']['info']) > 0:
      inst_node_info = self.dat['node_info']['col']['info'][i]

    # get col vect 
    col_vect = np.absolute(self.dat['mat'][:,i])

    # check if there are nonzero values
    found_tuple = np.where(col_vect >= cutoff)
    if len(found_tuple[0])>=min_num_meet:

      # add name
      nodes['col'].append(inst_nodes_col)

      # add info if necessary 
      if len(self.dat['node_info']['col']['info']) > 0:
        node_info['col'].append(inst_node_info)

  # cherrypick data from self.dat['mat'] 
  ##################################
  # filtered matrix 
  filt_mat = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])
  if 'mat_up' in self.dat:  
    filt_mat_up = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])
    filt_mat_dn = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])
  if 'mat_info' in self.dat:
    # initialize filtered mat_info dictionary with tuple keys 
    filt_mat_info = {}

  # loop through the rows
  for i in range(len(nodes['row'])):
    inst_row = nodes['row'][i]
    # loop through the cols
    for j in range(len(nodes['col'])):
      inst_col = nodes['col'][j]

      # get row and col index
      pick_row = self.dat['nodes']['row'].index(inst_row)
      pick_col = self.dat['nodes']['col'].index(inst_col)

      # cherrypick 
      ###############
      filt_mat[i,j] = self.dat['mat'][pick_row, pick_col]
      if 'mat_up' in self.dat:  
        filt_mat_up[i,j] = self.dat['mat_up'][pick_row, pick_col]
        filt_mat_dn[i,j] = self.dat['mat_dn'][pick_row, pick_col]
      if 'mat_info' in self.dat:
        filt_mat_info[str((i,j))] = self.dat['mat_info'][str((pick_row,pick_col))]

  # save nodes array - list of node names 
  self.dat['nodes'] = nodes

  # save node_info array - list of node infos 
  self.dat['node_info']['row']['info'] = node_info['row']
  self.dat['node_info']['col']['info'] = node_info['col']

  # overwrite with new filtered data 
  self.dat['mat'] = filt_mat
  # overwrite with up/dn data if necessary 
  if 'mat_up' in self.dat:  
    self.dat['mat_up'] = filt_mat_up
    self.dat['mat_dn'] = filt_mat_dn
  # overwrite mat_info if necessary 
  if 'mat_info' in self.dat:
    self.dat['mat_info'] = filt_mat_info

  print( 'final mat shape' + str(self.dat['mat'].shape ) + '\n')