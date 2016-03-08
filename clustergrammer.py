# define a class for networks 
class Network(object):
  '''
  Networks have two states: the data state where they are stored as: matrix and
  nodes and a viz state where they are stored as: viz.links, viz.row_nodes, viz.
  col_nodes.

  The goal is to start in a data-state and produce a viz-state of the network 
  that will be used as input to clustergram.js.
  '''

  def __init__(self):
    # network: data-state
    self.dat = {}
    self.dat['nodes'] = {}
    self.dat['nodes']['row'] = []
    self.dat['nodes']['col'] = []

    # node_info holds the orderings (ini, clust, rank), classification ('cl'), 
    # and other general information 
    self.dat['node_info'] = {}
    for inst_rc in self.dat['nodes']:
      self.dat['node_info'][inst_rc] = {}
      self.dat['node_info'][inst_rc]['ini'] = []
      self.dat['node_info'][inst_rc]['clust'] = []
      self.dat['node_info'][inst_rc]['rank'] = []
      self.dat['node_info'][inst_rc]['info'] = []
      # classification is specifically used to color the class triangles 
      self.dat['node_info'][inst_rc]['cl'] = []
      self.dat['node_info'][inst_rc]['value'] = []

    # initialize matrix 
    self.dat['mat'] = []
    # mat_info is an optional dictionary 
    # so I'm not including it by default 

    # network: viz-state
    self.viz = {}
    self.viz['row_nodes'] = []
    self.viz['col_nodes'] = []
    self.viz['links'] = []

  def load_tsv_to_net(self, filename):

    f = open(filename,'r')
    lines = f.readlines()
    f.close()

    self.load_lines_from_tsv_to_net(lines)

  def pandas_load_file(self, filename):
    import StringIO

    f = open(filename,'r')
    buff = StringIO.StringIO(f.read())
    f.close()

    self.pandas_load_tsv_to_net(buff)

  def pandas_load_tsv_to_net(self, file_buffer):
    '''
    A user can add category information to the columns 
    '''
    import pandas as pd 

    # get lines and check for category and value info 
    lines = file_buffer.getvalue().split('\n')

    # check for category info in headers
    cat_line = lines[1].split('\t')

    add_cat = False
    if cat_line[0] == '': 
      add_cat = True

    tmp_df = {}
    if add_cat:
      # read in names and categories 
      tmp_df['mat'] = pd.read_table(file_buffer, index_col=0, header=[0,1])
    else:
      # read in names only 
      tmp_df['mat'] = pd.read_table(file_buffer, index_col=0, header=0)

    # save to self
    self.df_to_dat(tmp_df)

    # add categories if necessary 
    if add_cat:
      cat_line = [i.strip() for i in cat_line]
      self.dat['node_info']['col']['cl'] = cat_line[1:]

    # make a dict of columns in categories 
    ##########################################
    col_in_cat = {}
    for i in range(len(self.dat['node_info']['col']['cl'])):

      inst_cat = self.dat['node_info']['col']['cl'][i]
      inst_col = self.dat['nodes']['col'][i]

      if inst_cat not in col_in_cat:
        col_in_cat[inst_cat] = []

      # collect col names for categories 
      col_in_cat[inst_cat].append(inst_col)      

    # save to node_info
    self.dat['node_info']['col_in_cat'] = col_in_cat

  def load_lines_from_tsv_to_net(self, lines):
    import numpy as np
    # get row/col labels and data from lines 
    for i in range(len(lines)):

      # get inst_line
      inst_line = lines[i].rstrip().split('\t')
      # strip each element 
      inst_line = [z.strip() for z in inst_line]

      # get column labels from first row 
      if i == 0:
        tmp_col_labels = inst_line

        # add the labels 
        for inst_elem in range(len(tmp_col_labels)):

          # skip the first element 
          if inst_elem > 0:
            # get the column label 
            inst_col_label = tmp_col_labels[inst_elem]

            # add to network data 
            self.dat['nodes']['col'].append(inst_col_label)

      # get row info 
      if i > 0:

        # save row labels 
        self.dat['nodes']['row'].append(inst_line[0])

        # get data - still strings 
        inst_data_row = inst_line[1:]

        # convert to float
        inst_data_row = [float(tmp_dat) for tmp_dat in inst_data_row]

        # save the row data as an array 
        inst_data_row = np.asarray(inst_data_row)

        # initailize matrix 
        if i == 1:
          self.dat['mat'] = inst_data_row

        # add rows to matrix
        if i > 1: 
          self.dat['mat'] = np.vstack( ( self.dat['mat'], inst_data_row ) )

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

  def load_data_file_to_net(self, filename):
    # load json from file to new dictionary 
    inst_dat = self.load_json_to_dict(filename)
    # convert dat['mat'] to numpy array and add to network 
    self.load_data_to_net(inst_dat)

  def load_data_to_net(self, inst_net):
    ''' load data into nodes and mat, also convert mat to numpy array''' 
    self.dat['nodes'] = inst_net['nodes']
    self.dat['mat'] = inst_net['mat']
    # convert to numpy array 
    self.mat_to_numpy_arr()

  def export_net_json(self, net_type, indent='no-indent'):
    ''' export json string of dat '''
    import json 
    from copy import deepcopy

    if net_type == 'dat':
      exp_dict = deepcopy(self.dat)

      # convert numpy array to list 
      if type(exp_dict['mat']) is not list:
        exp_dict['mat'] = exp_dict['mat'].tolist()

    elif net_type == 'viz':
      exp_dict = self.viz

    # make json 
    if indent == 'indent':
      exp_json = json.dumps(exp_dict, indent=2)
    else:
      exp_json = json.dumps(exp_dict)

    return exp_json

  def write_json_to_file(self, net_type, filename, indent='no-indent'):
    import json 

    # get dat or viz representation as json string 
    if net_type == 'dat':
      exp_json = self.export_net_json('dat', indent)
    elif net_type == 'viz':
      exp_json = self.export_net_json('viz', indent)

    # save to file 
    fw = open(filename, 'w')
    fw.write( exp_json ) 
    fw.close()

  def set_node_names(self, row_name, col_name):
    '''give names to the rows and columns'''
    self.dat['node_names'] = {}
    self.dat['node_names']['row'] = row_name
    self.dat['node_names']['col'] = col_name

  def mat_to_numpy_arr(self):
    ''' convert list to numpy array - numpy arrays can not be saved as json '''
    import numpy as np
    self.dat['mat'] = np.asarray( self.dat['mat'] )

  def swap_nan_for_zero(self):
    import numpy as np
    self.dat['mat'][ np.isnan( self.dat['mat'] ) ] = 0

  def keep_max_num_links(self, keep_num_links):

    print('\trun keep_max_num_links')
    max_mat_value = abs(self.dat['mat']).max()

    # check the total number of links 
    inst_thresh = 0
    inst_pct_max = 0
    inst_num_links = (abs(self.dat['mat'])>inst_thresh).sum()
    print('initially there are '+str(inst_num_links)+' links ')

    print('there are initially '+str(inst_num_links)+'\n')

    thresh_fraction = 100

    while (inst_num_links > keep_num_links):

      # increase the threshold as a pct of max value in mat 
      inst_pct_max = inst_pct_max + 1 

      # increase threshold 
      inst_thresh = max_mat_value*(float(inst_pct_max)/thresh_fraction)

      # check the number of links above the curr threshold 
      inst_num_links = (abs(self.dat['mat'])>inst_thresh).sum()

      print('there are '+str(inst_num_links)+ ' links at threshold '+str(inst_pct_max)+'pct and value of ' +str(inst_thresh)+'\n')

    # if there are no links then increas thresh back up 
    if inst_num_links == 0:
      inst_pct_max = inst_pct_max - 1 
      inst_thresh = max_mat_value*(float(inst_pct_max)/thresh_fraction)

    print('final number of links '+str(inst_num_links))

    # replace values that are less than thresh with zero 
    self.dat['mat'][ abs(self.dat['mat']) < inst_thresh] = 0

    # return number of links 
    return (abs(self.dat['mat'])>inst_thresh).sum()

  def cluster_row_and_col(self, dist_type='cosine', linkage_type='average', dendro=True, \
    run_clustering=True, run_rank=True):

    ''' 
    cluster net.dat and make visualization json, net.viz. 
    optionally leave out dendrogram colorbar groups with dendro argument 
    '''
    import scipy
    import numpy as np 
    from scipy.spatial.distance import pdist
    from copy import deepcopy

    # do not make dendrogram is you are not running clusttering 
    if run_clustering == False:
      dendro = False

    # make distance matrices 
    ##########################

    # get number of rows and columns from self.dat 
    num_row = len(self.dat['nodes']['row'])
    num_col = len(self.dat['nodes']['col'])

    # initialize distance matrices 
    row_dm = scipy.zeros([num_row,num_row])
    col_dm = scipy.zeros([num_col,num_col])

    # make copy of matrix 
    tmp_mat = deepcopy(self.dat['mat'])

    # calculate distance matrix 
    row_dm = pdist( tmp_mat, metric=dist_type )
    col_dm = pdist( tmp_mat.transpose(), metric=dist_type )

    # prevent negative values 
    row_dm[row_dm < 0] = float(0)
    col_dm[col_dm < 0] = float(0)

    # initialize clust order 
    clust_order = self.ini_clust_order()

    # initial ordering
    ###################
    clust_order['row']['ini'] = range(num_row, -1, -1)
    clust_order['col']['ini'] = range(num_col, -1, -1)

    # cluster 
    if run_clustering == True:

      clust_order['row']['clust'], clust_order['row']['group'] = \
      self.clust_and_group(row_dm, linkage_type=linkage_type)

      clust_order['col']['clust'], clust_order['col']['group'] = \
      self.clust_and_group(col_dm, linkage_type=linkage_type)

    # rank 
    if run_rank == True:
      # rank based on sum 
      clust_order['row']['rank'] = self.sort_rank_nodes('row','sum')
      clust_order['col']['rank'] = self.sort_rank_nodes('col','sum')

      # rank based on variance 
      clust_order['row']['rankvar'] = self.sort_rank_nodes('row','var')
      clust_order['col']['rankvar'] = self.sort_rank_nodes('col','var')

    # save clustering orders to node_info 
    if run_clustering == True:
      self.dat['node_info']['row']['clust'] = clust_order['row']['clust']
      self.dat['node_info']['col']['clust'] = clust_order['col']['clust']
    else:
      self.dat['node_info']['row']['clust'] = clust_order['row']['ini']
      self.dat['node_info']['col']['clust'] = clust_order['col']['ini']

    if run_rank == True:
      # sum rank 
      self.dat['node_info']['row']['rank']  = clust_order['row']['rank']
      self.dat['node_info']['col']['rank']  = clust_order['col']['rank']

      # variance rank 
      self.dat['node_info']['row']['rankvar']  = clust_order['row']['rankvar']
      self.dat['node_info']['col']['rankvar']  = clust_order['col']['rankvar']

    else:
      self.dat['node_info']['row']['rank']  = clust_order['row']['ini']
      self.dat['node_info']['col']['rank']  = clust_order['col']['ini']

    # transfer ordereings
    # row
    self.dat['node_info']['row']['ini']   = clust_order['row']['ini']
    self.dat['node_info']['row']['group'] = clust_order['row']['group']
    # col 
    self.dat['node_info']['col']['ini']   = clust_order['col']['ini']
    self.dat['node_info']['col']['group'] = clust_order['col']['group']

    if len(self.dat['node_info']['col']['cl']) > 0:
      self.calc_cat_clust_order()

    # make the viz json - can optionally leave out dendrogram
    self.viz_json(dendro)

  def calc_cat_clust_order(self):
    from clustergrammer import Network 
    from copy import deepcopy 

    col_in_cat = self.dat['node_info']['col_in_cat']

    # alpha order categories 
    all_cats = sorted(col_in_cat.keys())

    # cluster each category
    ##############################

    # calc clustering of each category 
    all_cat_orders = []
    # this is the ordering of the columns based on their category, not 
    # including their clustering order on top of their category 
    tmp_col_names_list = []
    for inst_cat in all_cats:

      inst_cols = col_in_cat[inst_cat]

      # keep a list of the columns 
      tmp_col_names_list.extend(inst_cols)

      cat_net = deepcopy(Network())

      cat_net.dat['mat'] = deepcopy(self.dat['mat'])
      cat_net.dat['nodes'] = deepcopy(self.dat['nodes'])

      # get dataframe, to simplify column filtering 
      cat_df = cat_net.dat_to_df()

      # get subset of dataframe 
      sub_df = {}
      sub_df['mat'] = cat_df['mat'][inst_cols]

      # load back to dat 
      cat_net.df_to_dat(sub_df)

      try:
        cat_net.cluster_row_and_col('cos')
        inst_cat_order = cat_net.dat['node_info']['col']['clust']

      except:
        inst_cat_order = range(len(cat_net.dat['nodes']['col']))

      prev_order_len = len(all_cat_orders) 

      # add previous order length to the current order number
      inst_cat_order = [i+prev_order_len for i in inst_cat_order]
      all_cat_orders.extend(inst_cat_order)

    # sort tmp_col_names_lust by the integers in all_cat_orders 
    names_col_cat_clust = [x for (y,x) in sorted(zip(all_cat_orders,tmp_col_names_list))]

    # calc category-cluster order 
    ##############################
    final_order = []
    for i in range(len(self.dat['nodes']['col'])):

      # get the rank of the col in the order of col_nodes 
      inst_col_name = self.dat['nodes']['col'][i]

      inst_col_num = names_col_cat_clust.index(inst_col_name)

      final_order.append(inst_col_num)

    self.dat['node_info']['col']['cl_index'] = final_order    

  def clust_and_group( self, dm, linkage_type='average' ):
    import scipy.cluster.hierarchy as hier

    # calculate linkage 
    Y = hier.linkage( dm, method=linkage_type )
    Z = hier.dendrogram( Y, no_plot=True )
    # get ordering
    inst_clust_order = Z['leaves']

    all_dist = self.group_cutoffs()

    # generate distance cutoffs 
    inst_groups = {}
    for inst_dist in all_dist:
      inst_key = str(inst_dist).replace('.','')
      inst_groups[inst_key] = hier.fcluster(Y, inst_dist*dm.max(), 'distance') 
      inst_groups[inst_key] = inst_groups[inst_key].tolist()

    return inst_clust_order, inst_groups

  def sort_rank_nodes( self, rowcol, rank_type ):
    import numpy as np
    from operator import itemgetter
    from copy import deepcopy

    # make a copy of node information 
    inst_nodes = deepcopy(self.dat['nodes'][rowcol])
    inst_mat   = deepcopy(self.dat['mat'])

    sum_term = []
    for i in range(len(inst_nodes)):
      inst_dict = {}
      # get name of the node 
      inst_dict['name'] = inst_nodes[i]
      # sum values of the node
      if rowcol == 'row':
        if rank_type == 'sum':
          inst_dict['rank'] = np.sum(inst_mat[i,:])
        elif rank_type == 'var':
          inst_dict['rank'] = np.var(inst_mat[i,:])
      else:
        if rank_type == 'sum':
          inst_dict['rank'] = np.sum(inst_mat[:,i])
        elif rank_type == 'var':
          inst_dict['rank'] = np.var(inst_mat[:,i])
      # add this to the list of dicts 
      sum_term.append(inst_dict)


    # sort dictionary by number of terms 
    sum_term = sorted( sum_term, key=itemgetter('rank'), reverse=False )

    # get list of sorted nodes 
    tmp_sort_nodes = []
    for inst_dict in sum_term:
      tmp_sort_nodes.append(inst_dict['name'])

    # get the sorted index
    sort_index = []
    for inst_node in inst_nodes:
      sort_index.append( tmp_sort_nodes.index(inst_node) )

    return sort_index

  def viz_json(self, dendro=True):
    ''' make the dictionary for the clustergram.js visualization '''

    # get dendrogram cutoff distances 
    all_dist = self.group_cutoffs()

    # make nodes for viz
    #####################
    # make rows and cols 
    for inst_rc in self.dat['nodes']:

      for i in range(len( self.dat['nodes'][inst_rc] )):
        inst_dict = {}
        inst_dict['name']  = self.dat['nodes'][inst_rc][i]
        inst_dict['ini']   = self.dat['node_info'][inst_rc]['ini'][i]

        #!! clean this up so I do not have to get the index here 
        inst_dict['clust'] = self.dat['node_info'][inst_rc]['clust'].index(i)

        inst_dict['rank']  = self.dat['node_info'][inst_rc]['rank'][i]

        if 'rankvar' in self.dat['node_info'][inst_rc]:
          inst_dict['rankvar']  = self.dat['node_info'][inst_rc]['rankvar'][i]


        # add node class cl 
        if len(self.dat['node_info'][inst_rc]['cl']) > 0:
          inst_dict['cl'] = self.dat['node_info'][inst_rc]['cl'][i]

        # add node class cl_index
        if 'cl_index' in self.dat['node_info'][inst_rc] > 0:
          inst_dict['cl_index'] = self.dat['node_info'][inst_rc]['cl_index'][i]

        # add node class val   
        if len(self.dat['node_info'][inst_rc]['value']) > 0:
          inst_dict['value'] = self.dat['node_info'][inst_rc]['value'][i]

        # add node information 
        # if 'info' in self.dat['node_info'][inst_rc]:
        if len(self.dat['node_info'][inst_rc]['info']) > 0:
          inst_dict['info'] = self.dat['node_info'][inst_rc]['info'][i]

        # group info 
        if dendro==True:
          inst_dict['group'] = []
          for tmp_dist in all_dist:
            # read group info in correct order 
            tmp_dist = str(tmp_dist).replace('.','')
            inst_dict['group'].append( float( self.dat['node_info'][inst_rc]['group'][tmp_dist][i] ) )

        # append dictionary to list of nodes
        self.viz[inst_rc+'_nodes'].append(inst_dict)

    # links 
    ########
    for i in range(len( self.dat['nodes']['row'] )):
      for j in range(len( self.dat['nodes']['col'] )):
        if abs( self.dat['mat'][i,j] ) > 0:
          inst_dict = {}
          inst_dict['source'] = i
          inst_dict['target'] = j 
          inst_dict['value'] = self.dat['mat'][i,j]

          # add up/dn values if necessary 
          if 'mat_up' in self.dat:
            inst_dict['value_up'] = self.dat['mat_up'][i,j]
          if 'mat_up' in self.dat:
            inst_dict['value_dn'] = self.dat['mat_dn'][i,j]

          # add information if necessary - use dictionary with tuple key
          # each element of the matrix needs to have information 
          if 'mat_info' in self.dat:

            # use tuple string 
            inst_dict['info'] = self.dat['mat_info'][str((i,j))]

          # add highlight if necessary - use dictionary with tuple key 
          if 'mat_hl' in self.dat:
            inst_dict['highlight'] = self.dat['mat_hl'][i,j]

          # append link 
          self.viz['links'].append( inst_dict )

  def df_to_dat(self, df):
    import numpy as np 
    import pandas as pd 

    self.dat['mat'] = df['mat'].values
    self.dat['nodes']['row'] = df['mat'].index.tolist()
    self.dat['nodes']['col'] = df['mat'].columns.tolist()

    # check if there is category information in the column names  
    if type(self.dat['nodes']['col'][0]) is tuple:
      self.dat['nodes']['col'] = [i[0] for i in self.dat['nodes']['col']]

    if 'mat_up' in df:
      self.dat['mat_up'] = df['mat_up'].values
      self.dat['mat_dn'] = df['mat_dn'].values

  def dat_to_df(self):
    import numpy as np
    import pandas as pd

    df = {}
  
    # always return 'mat' dataframe     
    df['mat'] = pd.DataFrame(data = self.dat['mat'], columns=self.dat['nodes']['col'], index=self.dat['nodes']['row'])

    if 'mat_up' in self.dat:

      df['mat_up'] = pd.DataFrame(data = self.dat['mat_up'], columns=self.dat['nodes']['col'], index=self.dat['nodes']['row'])
      df['mat_dn'] = pd.DataFrame(data = self.dat['mat_dn'], columns=self.dat['nodes']['col'], index=self.dat['nodes']['row'])

    return df 

  def make_filtered_views(self, dist_type='cosine', run_clustering=True, \
    dendro=True, views=['pct_row_sum','N_row_sum'], calc_col_cats=True, \
    linkage_type='average'):

    from copy import deepcopy
    '''
    This will calculate multiple views of a clustergram by filtering the data 
    and clustering after each filtering. This filtering will keep the top N 
    rows based on some quantity (sum, num-non-zero, etc). 

    pct_row_sum was formerly called filter_row_sum
    '''

    print('running make_filtered_views')

    print('dist_type '+str(dist_type))

    # get dataframe dictionary of network and remove rows/cols with all zero values 
    df = self.dat_to_df()

    # each row or column must have at least one non-zero value 
    threshold = 0.0001
    df = self.df_filter_row(df, threshold)
    df = self.df_filter_col(df, threshold)

    # calculate initial view with no row filtering
    ##################################################
    # swap back in the filtered df to dat 
    self.df_to_dat(df)

    # cluster initial view 
    self.cluster_row_and_col(dist_type=dist_type, linkage_type=linkage_type, \
      run_clustering=run_clustering, dendro=dendro)

    # set up views 
    all_views = []

    # generate views for each column category (default to only one)
    all_col_cat = ['all_category']

    # check for column categories and check whether category specific clustering
    # should be calculated 
    if len(self.dat['node_info']['col']['cl']) > 0 and calc_col_cats:
      tmp_cats = sorted(list(set(self.dat['node_info']['col']['cl'])))

      # gather all col_cats 
      all_col_cat.extend(tmp_cats)

    for inst_col_cat in all_col_cat:

      # make a copy of df to send to filters
      send_df = deepcopy(df)

      # add N_row_sum views 
      if 'N_row_sum' in views:
        print('add N_row_sum')
        all_views = self.add_N_top_views( send_df, all_views, \
          dist_type=dist_type, current_col_cat=inst_col_cat, rank_type='sum' )

      # add N_row_var views 
      if 'N_row_var' in views:
        print('add N_row_var')
        all_views = self.add_N_top_views( send_df, all_views, \
          dist_type=dist_type, current_col_cat=inst_col_cat, rank_type='var' )

      if 'pct_row_sum' in views:
        print('add pct_row_sum')
        all_views = self.add_pct_top_views( send_df, all_views, \
          dist_type=dist_type, current_col_cat=inst_col_cat, rank_type='sum' )

      if 'pct_row_var' in views:
        print('add pct_row_var')
        all_views = self.add_pct_top_views( send_df, all_views, \
          dist_type=dist_type, current_col_cat=inst_col_cat, rank_type='var' )        

    # add views to viz 
    self.viz['views'] = all_views

    print('finished make_filtered_views')

  def add_pct_top_views(self, df, all_views, dist_type='cosine', \
    current_col_cat='all_category', rank_type='sum'):

    from clustergrammer import Network 
    from copy import deepcopy 
    import numpy as np

    # make a copy of the network so that filtering is not propagated 
    copy_net = deepcopy(self)

    # filter columns by category if necessary - do this on df, which is a copy
    if current_col_cat != 'all_category':
      keep_cols = copy_net.dat['node_info']['col_in_cat'][current_col_cat]
      df['mat'] = copy_net.grab_df_subset(df['mat'], keep_rows='all', keep_cols=keep_cols)

    # gather category key 
    is_col_cat = False
    if len(self.dat['node_info']['col']['cl']) > 0 and current_col_cat=='all_category':
      is_col_cat = True
      cat_key_col = {}
      for i in range(len(self.dat['nodes']['col'])):
        cat_key_col[ self.dat['nodes']['col'][i] ] = self.dat['node_info']['col']['cl'][i]

    # filter between 0% and 90% of some threshoold 
    all_filt = range(10)
    all_filt = [i/float(10) for i in all_filt]

    # row filtering values 
    mat = deepcopy(df['mat'])
    sum_row = np.sum(mat, axis=1)
    max_sum = max(sum_row)

    for inst_filt in all_filt:

      cutoff = inst_filt * max_sum

      # make a copy of the network so that filtering is not propagated 
      copy_net = deepcopy(self)

      # make copy of df
      inst_df = deepcopy(df)

      # filter row in df 
      inst_df = copy_net.df_filter_row(inst_df, cutoff, take_abs=False)

      # filter columns by category if necessary 
      if current_col_cat != 'all_category':
        keep_cols = copy_net.dat['node_info']['col_in_cat'][current_col_cat]
        inst_df['mat'] = copy_net.grab_df_subset(inst_df['mat'], keep_rows='all', keep_cols=keep_cols)

        if 'mat_up' in inst_df:
          # grab up and down data 
          inst_df['mat_up'] = copy_net.grab_df_subset(inst_df['mat_up'], keep_rows='all', keep_cols=keep_cols)
          inst_df['mat_dn'] = copy_net.grab_df_subset(inst_df['mat_dn'], keep_rows='all', keep_cols=keep_cols)

      # ini net 
      net = deepcopy(Network())

      # transfer to dat 
      net.df_to_dat(inst_df)

      # add col categories if necessary 
      if is_col_cat: 
        inst_col_cats = []

        for inst_col_name in copy_net.dat['nodes']['col']:
          inst_col_cats.append( cat_key_col[inst_col_name] )

        # transfer category information 
        net.dat['node_info']['col']['cl'] = inst_col_cats

        # add col_in_cat
        net.dat['node_info']['col_in_cat'] = copy_net.dat['node_info']['col_in_cat']

      # try to cluster 
      try: 

        try:
          # cluster
          net.cluster_row_and_col(dist_type=dist_type,run_clustering=True)
        except:
          # cluster
          net.cluster_row_and_col(dist_type=dist_type,run_clustering=False)

        # add view 
        inst_view = {}
        inst_view['pct_row_'+rank_type] = inst_filt
        inst_view['dist'] = 'cos'
        inst_view['col_cat'] = current_col_cat
        inst_view['nodes'] = {}
        inst_view['nodes']['row_nodes'] = net.viz['row_nodes']
        inst_view['nodes']['col_nodes'] = net.viz['col_nodes']
        all_views.append(inst_view)          

      except:
        print('\t*** did not cluster pct filtered view')

    return all_views

  def add_N_top_views(self, df, all_views, dist_type='cosine',\
    current_col_cat='all_category', rank_type='sum'):

    from clustergrammer import Network
    from copy import deepcopy 

    # make a copy of hte network 
    copy_net = deepcopy(self)
    
    # filter columns by category if necessary 
    if current_col_cat != 'all_category':
      keep_cols = copy_net.dat['node_info']['col_in_cat'][current_col_cat]

      df['mat'] = copy_net.grab_df_subset(df['mat'], keep_rows='all', keep_cols=keep_cols)    

    # gather category key 
    is_col_cat = False
    if len(self.dat['node_info']['col']['cl']) > 0 and current_col_cat=='all_category':
      is_col_cat = True
      cat_key_col = {}
      for i in range(len(self.dat['nodes']['col'])):
        cat_key_col[ self.dat['nodes']['col'][i] ] = self.dat['node_info']['col']['cl'][i]

    # keep the following number of top rows 
    keep_top = ['all',500,400,300,200,100,90,80,70,60,50,40,30,20,10]

    # get copy of df and take abs value, cell line cols and gene rows
    df_abs = deepcopy(df['mat'])

    # transpose to get gene columns 
    df_abs = df_abs.transpose()

    # sum the values of the genes in the cell lines 
    if rank_type == 'sum':
      tmp_sum = df_abs.sum(axis=0)
    elif rank_type == 'var':
      tmp_sum = df_abs.var(axis=0)

    # take absolute value to keep most positive and most negative rows 
    tmp_sum = tmp_sum.abs()

    # sort rows by value 
    tmp_sum.sort_values(inplace=True, ascending=False)

    rows_sorted = tmp_sum.index.values.tolist()

    for inst_keep in keep_top:

      # initialize df
      tmp_df = deepcopy(df)

      # filter columns by category if necessary 
      if current_col_cat != 'all_category':
        keep_cols = copy_net.dat['node_info']['col_in_cat'][current_col_cat]

        tmp_df['mat'] = copy_net.grab_df_subset(tmp_df['mat'], keep_rows='all', keep_cols=keep_cols)

        if 'mat_up' in df:
          # grab up and down data 
          tmp_df['mat_up'] = copy_net.grab_df_subset(tmp_df['mat_up'], keep_rows='all', keep_cols=keep_cols)
          tmp_df['mat_dn'] = copy_net.grab_df_subset(tmp_df['mat_dn'], keep_rows='all', keep_cols=keep_cols)      

      if inst_keep < len(rows_sorted) or inst_keep == 'all':

        # initialize netowrk 
        net = deepcopy(Network())

        # filter the rows 
        if inst_keep != 'all':

          # get the labels of the rows that will be kept 
          keep_rows = rows_sorted[0:inst_keep]

          # filter the matrix 
          tmp_df['mat'] = tmp_df['mat'].ix[keep_rows]

          if 'mat_up' in tmp_df:
            tmp_df['mat_up'] = tmp_df['mat_up'].ix[keep_rows] 
            tmp_df['mat_dn'] = tmp_df['mat_dn'].ix[keep_rows] 

          # filter columns - some columns may have all zero values 
          tmp_df = self.df_filter_col(tmp_df,0.001)

          # transfer to dat 
          net.df_to_dat(tmp_df)

        else:
          net.df_to_dat(tmp_df)

        # add col categories if necessary 
        if is_col_cat: 
          inst_col_cats = []

          for inst_col_name in self.dat['nodes']['col']:

            inst_col_cats.append( cat_key_col[inst_col_name] )

          # transfer category information 
          net.dat['node_info']['col']['cl'] = inst_col_cats

          # add col_in_cat 
          net.dat['node_info']['col_in_cat'] = copy_net.dat['node_info']['col_in_cat']

        # try to cluster 
        try: 

          try:
            # cluster 
            net.cluster_row_and_col(dist_type,run_clustering=True)
          except:
            # cluster 
            net.cluster_row_and_col(dist_type,run_clustering=False)

          # add view 
          inst_view = {}
          inst_view['N_row_'+rank_type] = inst_keep
          inst_view['dist'] = 'cos'
          inst_view['col_cat'] = current_col_cat
          inst_view['nodes'] = {}
          inst_view['nodes']['row_nodes'] = net.viz['row_nodes']
          inst_view['nodes']['col_nodes'] = net.viz['col_nodes']
          all_views.append(inst_view)
        except:
          print('\t*** did not cluster N filtered view') 

    return all_views

  @staticmethod
  def df_filter_row(df, threshold, take_abs=True):
    ''' filter rows in matrix at some threshold
    and remove columns that have a sum below this threshold '''

    import pandas as pd 
    from copy import deepcopy 
    from clustergrammer import Network
    net = Network()

    # take absolute value if necessary 
    if take_abs == True:
      df_copy = deepcopy(df['mat'].abs())
    else:
      df_copy = deepcopy(df['mat'])

    ini_rows = df_copy.index.values.tolist()

    # transpose df 
    df_copy = df_copy.transpose()

    # sum the values of the rows 
    tmp_sum = df_copy.sum(axis=0)

    # take absolute value to keep most positive and most negative rows 
    tmp_sum = tmp_sum.abs()

    # sort rows by value 
    # tmp_sum.sort(ascending=False)
    tmp_sum.sort_values(inplace=True, ascending=False)

    # filter series using threshold 
    tmp_sum = tmp_sum[tmp_sum>threshold]

    # get keep_row names 
    keep_rows = sorted(tmp_sum.index.values.tolist())

    if len(keep_rows) < len(ini_rows):
      # grab the subset of the data 
      df['mat'] = net.grab_df_subset(df['mat'], keep_rows=keep_rows)

      if 'mat_up' in df:
        # grab up and down data 
        df['mat_up'] = net.grab_df_subset(df['mat_up'], keep_rows=keep_rows)
        df['mat_dn'] = net.grab_df_subset(df['mat_dn'], keep_rows=keep_rows)

    return df   

  @staticmethod
  def df_filter_col(df, threshold, take_abs=True):
    ''' filter columns in matrix at some threshold
    and remove rows that have all zero values '''

    import pandas 
    from copy import deepcopy 
    from clustergrammer import Network
    net = Network()

    # take absolute value if necessary 
    if take_abs == True:
      df_copy = deepcopy(df['mat'].abs())
    else:
      df_copy = deepcopy(df['mat'])

    # filter columns to remove columns with all zero values 
    # transpose 
    df_copy = df_copy.transpose()
    df_copy = df_copy[df_copy.sum(axis=1) > threshold]
    # transpose back 
    df_copy = df_copy.transpose()

    # filter rows 
    df_copy = df_copy[df_copy.sum(axis=1) > 0]

    # get df ready for export 
    if take_abs == True:

      inst_rows = df_copy.index.tolist()
      inst_cols = df_copy.columns.tolist()

      df['mat'] = net.grab_df_subset(df['mat'], inst_rows, inst_cols)

    else:
      # just transfer the copied data 
      df['mat'] = df_copy

    return df   

  @staticmethod
  def grab_df_subset(df, keep_rows='all', keep_cols='all'):

    if keep_cols != 'all':
      # filter columns 
      df = df[keep_cols]

    if keep_rows != 'all':
      # filter rows 
      df = df.ix[keep_rows]

    return df

  @staticmethod
  def load_gmt(filename):

    f = open(filename, 'r')
    lines = f.readlines()
    f.close()

    gmt = {}

    # loop through the lines of the gmt 
    for i in range(len(lines)):

      # get the inst line, strip off the new line character 
      inst_line = lines[i].rstrip()

      inst_term = inst_line.split('\t')[0]

      # get the elements 
      inst_elems = inst_line.split('\t')[2:]

      # save the drug-kinase sets 
      gmt[inst_term] = inst_elems

    return gmt

  @staticmethod
  def load_json_to_dict(filename):
    ''' load json to python dict and return dict '''
    import json

    f = open(filename, 'r')
    inst_dict = json.load(f)
    f.close()
    return inst_dict 

  @staticmethod
  def save_dict_to_json(inst_dict, filename, indent='no-indent'):
    import json

    # save as a json 
    fw = open(filename, 'w')
    if indent == 'indent':
      fw.write( json.dumps(inst_dict, indent=2) )
    else:
      fw.write( json.dumps(inst_dict) )
    fw.close()

  @staticmethod
  def ini_clust_order():
    rowcol = ['row','col']
    orderings = ['clust','rank','group','ini']
    clust_order = {}
    for inst_node in rowcol:
      clust_order[inst_node] = {}

      for inst_order in orderings:
        clust_order[inst_node][inst_order] = []

    return clust_order

  @staticmethod
  def threshold_vect_comparison(x, y, cutoff):
    import numpy as np 

    # x vector 
    ############
    # take absolute value of x
    x_abs = np.absolute(x)
    # this returns a tuple 
    found_tuple = np.where(x_abs >= cutoff)
    # get index array 
    found_index_x = found_tuple[0]

    # y vector 
    ############
    # take absolute value of y
    y_abs = np.absolute(y)
    # this returns a tuple 
    found_tuple = np.where(y_abs >= cutoff)
    # get index array 
    found_index_y = found_tuple[0]

    # get common intersection 
    found_common = np.intersect1d(found_index_x, found_index_y)

    # apply cutoff 
    thresh_x = x[found_common]
    thresh_y = y[found_common]

    # return the threshold data 
    return thresh_x, thresh_y

  @staticmethod
  def group_cutoffs():
    # generate distance cutoffs
    all_dist = []
    for i in range(11):
      all_dist.append(float(i)/10)

    return all_dist

  @staticmethod
  def find_dict_in_list(list_dict, search_value, search_string):
    ''' find a dict in a list of dicts by searching for a value '''
    # get all the possible values of search_value
    all_values = [d[search_value] for d in list_dict]

    # check if the search value is in the keys 
    if search_string in all_values:
      # find the dict 
      found_dict = (item for item in list_dict if item[search_value] == search_string).next()
    else:
      found_dict = {}

    # return the found dictionary
    return found_dict

  