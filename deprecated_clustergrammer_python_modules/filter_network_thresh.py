def filter_network_thresh( self, cutoff, min_num_meet ):
  ''' 
  remove rows and columns from matrix that do not have at least 
  min_num_meet instances of a value with an absolute value above cutoff 
  '''
  import scipy
  import numpy as np

  # transfer the nodes 
  nodes = {}
  nodes['row'] = []
  nodes['col'] = []

  # transfer the 'info' part of node_info if necessary 
  node_info = {}
  node_info['row'] = []
  node_info['col'] = []

  # add rows with non-zero values 
  #################################
  for i in range(len(self.dat['nodes']['row'])):

    # get row name 
    inst_nodes_row = self.dat['nodes']['row'][i]

    # get node info - disregard ini, clust, and rank orders
    if len(self.dat['node_info']['row']['info']) > 0:
      inst_node_info = self.dat['node_info']['row']['info'][i]

    # get row vect 
    row_vect = np.absolute(self.dat['mat'][i,:])

    # check if there are nonzero values 
    found_tuple = np.where(row_vect >= cutoff)
    if len(found_tuple[0])>=min_num_meet:

      # add name 
      nodes['row'].append(inst_nodes_row)

      # add info if necessary 
      if len(self.dat['node_info']['row']['info']) > 0:
        node_info['row'].append(inst_node_info)

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