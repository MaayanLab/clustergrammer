  def load_vect_post_to_net(self, vect_post):
    import numpy as np

    # get all signatures (a.k.a. columns)
    sigs = vect_post['columns']

    # get all rows from signatures 
    all_rows = []
    all_sigs = []
    for inst_sig in sigs:

      # gather sig names 
      all_sigs.append(inst_sig['col_name']) 

      # get column 
      col_data = inst_sig['data']

      # gather row names
      for inst_row_data in col_data:

        # get gene name 
        all_rows.append( inst_row_data['row_name'] )

    # get unique sorted list of genes 
    all_rows = sorted(list(set(all_rows)))
    all_sigs = sorted(list(set(all_sigs)))
    print( 'found ' + str(len(all_rows)) + ' rows' )
    print( 'found ' + str(len(all_sigs)) + ' columns\n'  )

    # save genes and sigs to nodes 
    self.dat['nodes']['row'] = all_rows
    self.dat['nodes']['col'] = all_sigs

    # initialize numpy matrix of nans
    self.dat['mat'] = np.empty((len(all_rows),len(all_sigs)))
    self.dat['mat'][:] = np.nan

    is_up_down = False 

    if 'is_up_down' in vect_post:
      if vect_post['is_up_down'] == True:
        is_up_down = True

    if is_up_down == True:
      self.dat['mat_up'] = np.empty((len(all_rows),len(all_sigs)))
      self.dat['mat_up'][:] = np.nan

      self.dat['mat_dn'] = np.empty((len(all_rows),len(all_sigs)))
      self.dat['mat_dn'][:] = np.nan

    # loop through all signatures and rows
    # and place information into self.dat
    for inst_sig in sigs:

      # get sig name 
      inst_sig_name = inst_sig['col_name']

      # get row data
      col_data = inst_sig['data']

      # loop through column  
      for inst_row_data in col_data:

        # add row data to signature matrix 
        inst_row = inst_row_data['row_name']
        inst_value = inst_row_data['val']

        # find index of row and sig in matrix 
        row_index = all_rows.index(inst_row)
        col_index  = all_sigs.index(inst_sig_name)

        # save inst_value to matrix 
        self.dat['mat'][row_index, col_index] = inst_value

        if is_up_down == True:
          self.dat['mat_up'][row_index, col_index] = inst_row_data['val_up']
          self.dat['mat_dn'][row_index, col_index] = inst_row_data['val_dn']