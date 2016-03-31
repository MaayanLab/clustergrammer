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
    self.dat = {}
    self.dat['nodes'] = {}
    self.dat['nodes']['row'] = []
    self.dat['nodes']['col'] = []
    self.dat['mat'] = []

    self.dat['node_info'] = {}
    for inst_rc in self.dat['nodes']:
      self.dat['node_info'][inst_rc] = {}
      self.dat['node_info'][inst_rc]['ini'] = []
      self.dat['node_info'][inst_rc]['clust'] = []
      self.dat['node_info'][inst_rc]['rank'] = []
      self.dat['node_info'][inst_rc]['info'] = []
      self.dat['node_info'][inst_rc]['cat'] = []
      self.dat['node_info'][inst_rc]['value'] = []

    self.viz = {}
    self.viz['row_nodes'] = []
    self.viz['col_nodes'] = []
    self.viz['links'] = []

  def pandas_load_file(self, filename):
    import StringIO
    f = open(filename,'r')
    buff = StringIO.StringIO(f.read())
    f.close()
    self.pandas_load_tsv_to_net(buff)

  def pandas_load_tsv_to_net(self, file_buffer):
    import pandas as pd 

    lines = file_buffer.getvalue().split('\n')
    num_labels = self.check_categories(lines)

    row_arr = range(num_labels['row'])
    col_arr = range(num_labels['col'])
    tmp_df = {}

    # use header if there are col categories
    if len(col_arr) > 1:
      tmp_df['mat'] = pd.read_table(file_buffer, index_col=row_arr, header=col_arr)
    else:
      tmp_df['mat'] = pd.read_table(file_buffer, index_col=row_arr )

    # remove columns with all nans, occurs when there are trailing tabs on rows
    tmp_df['mat'] = tmp_df['mat'].dropna(axis=1)

    self.df_to_dat(tmp_df)

  @staticmethod
  def check_categories(lines):
    # count the number of row categories 
    rcat_line = lines[0].split('\t')

    # calc the number of row names and categories 
    num_rc = 0
    found_end = False

    # skip first tab 
    for inst_string in rcat_line[1:]:
      if inst_string == '':
        if found_end == False:
          num_rc = num_rc + 1
      else:
        found_end = True

    max_rcat = 10
    num_cc = 0 
    for i in range(max_rcat):
      ccat_line = lines[i+1].split('\t')
      if ccat_line[0] == '':
        num_cc  = num_cc + 1

    num_labels = {}
    num_labels['row'] = num_rc + 1
    num_labels['col'] = num_cc + 1

    print('found '+str(num_rc)+' row cats')
    print('found '+str(num_cc)+' col cats')

    return num_labels

  def dict_cat(self):
    
    for inst_rc in ['row','col']:
      inst_keys = self.dat['node_info'][inst_rc].keys()
      all_cats = [x for x in inst_keys if 'cat-' in x]

      for inst_name_cat in all_cats:
        dict_cat = {}
        tmp_cats = self.dat['node_info'][inst_rc][inst_name_cat]
        tmp_nodes = self.dat['nodes'][inst_rc]

        for i in range(len(tmp_cats)):
          inst_cat = tmp_cats[i]
          inst_node = tmp_nodes[i]

          if inst_cat not in dict_cat:
            dict_cat[inst_cat] = []

          dict_cat[inst_cat].append(inst_node)

        self.dat['node_info'][inst_rc]['dict_'+inst_name_cat.replace('-','_')] = dict_cat

  def load_vect_post_to_net(self, vect_post):
    import numpy as np

    sigs = vect_post['columns']

    all_rows = []
    all_sigs = []
    tmp_col_cat = {}
    is_col_cat = False
    for inst_sig in sigs:
      all_sigs.append(inst_sig['col_name']) 

      if 'cat' in inst_sig:
        is_col_cat = True
        tmp_col_cat[inst_sig['col_name']] = inst_sig['cat']

      col_data = inst_sig['data']

      for inst_row_data in col_data:
        all_rows.append( inst_row_data['row_name'] )

    all_rows = sorted(list(set(all_rows)))
    all_sigs = sorted(list(set(all_sigs)))

    self.dat['nodes']['row'] = all_rows
    self.dat['nodes']['col'] = all_sigs

    if is_col_cat:
      all_cat = []

      for tmp_sig in all_sigs:
        all_cat.append( tmp_col_cat[tmp_sig] )

      self.dat['node_info']['col']['cat-0'] = all_cat
      self.dict_cat()

      self.dat['node_info']['col']['full_names'] = []

      # construct full_names from single column category 
      # need to improve 
      for inst_index in range(len(all_cat)):
        inst_cat = all_cat[inst_index]
        inst_name = self.dat['nodes']['col'][inst_index]
        inst_tuple = ( inst_name, inst_cat )
        self.dat['node_info']['col']['full_names'].append( inst_tuple )

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

    for inst_sig in sigs:
      inst_sig_name = inst_sig['col_name']
      col_data = inst_sig['data']

      for inst_row_data in col_data:
        inst_row = inst_row_data['row_name']
        inst_value = inst_row_data['val']

        row_index = all_rows.index(inst_row)
        col_index  = all_sigs.index(inst_sig_name)

        self.dat['mat'][row_index, col_index] = inst_value

        if is_up_down == True:
          self.dat['mat_up'][row_index, col_index] = inst_row_data['val_up']
          self.dat['mat_dn'][row_index, col_index] = inst_row_data['val_dn']

  def load_data_file_to_net(self, filename):
    inst_dat = self.load_json_to_dict(filename)
    self.load_data_to_net(inst_dat)

  def load_data_to_net(self, inst_net):
    ''' load data into nodes and mat, also convert mat to numpy array''' 
    self.dat['nodes'] = inst_net['nodes']
    self.dat['mat'] = inst_net['mat']
    self.mat_to_numpy_arr()

  def set_node_names(self, row_name, col_name):
    '''give names to the rows and columns'''
    self.dat['node_names'] = {}
    self.dat['node_names']['row'] = row_name
    self.dat['node_names']['col'] = col_name

  def make_filtered_views(self, dist_type='cosine', run_clustering=True, \
    dendro=True, views=['pct_row_sum','N_row_sum'], linkage_type='average'):
    ''' This will calculate multiple views of a clustergram by filtering the data 
    and clustering after each filtering. This filtering will keep the top N 
    rows based on some quantity (sum, num-non-zero, etc). '''

    print('\n\n--- start make_filtered_views')

    from copy import deepcopy
    df = self.dat_to_df()

    threshold = 0.0001
    df = self.df_filter_row(df, threshold)
    df = self.df_filter_col(df, threshold)

    # calculate initial view with no row filtering
    self.df_to_dat(df)
    self.cluster_row_and_col(dist_type=dist_type, linkage_type=linkage_type, \
      run_clustering=run_clustering, dendro=dendro)

    all_views = []
    send_df = deepcopy(df)

    # print('\nchecking column keys')
    # print(self.dat['node_info']['col'].keys())

    # print(send_df['mat'].columns.tolist())
    
    if 'N_row_sum' in views:
      print('\nadd N_row_sum')
      all_views = self.add_N_top_views( send_df, all_views, \
        dist_type=dist_type, rank_type='sum' )

    if 'N_row_var' in views:
      print('\nadd N_row_var')
      all_views = self.add_N_top_views( send_df, all_views, \
        dist_type=dist_type, rank_type='var' )

    if 'pct_row_sum' in views:
      print('add pct_row_sum')
      all_views = self.add_pct_top_views( send_df, all_views, \
        dist_type=dist_type, rank_type='sum' )

    if 'pct_row_var' in views:
      print('add pct_row_var')
      all_views = self.add_pct_top_views( send_df, all_views, \
        dist_type=dist_type, rank_type='var' )        

    # for inst_view in all_views:
    #   pass

    self.viz['views'] = all_views

    print('\n--- end make_filtered_views')

  def add_pct_top_views(self, df, all_views, dist_type='cosine', rank_type='sum'):

    from clustergrammer import Network 
    from copy import deepcopy 
    import numpy as np

    copy_net = deepcopy(self)

    is_col_cat = False
    if len(self.dat['node_info']['col']['cat']) > 0:
      is_col_cat = True
      cat_key_col = {}
      for i in range(len(self.dat['nodes']['col'])):
        cat_key_col[ self.dat['nodes']['col'][i] ] = self.dat['node_info']['col']['cat'][i]

    all_filt = range(10)
    all_filt = [i/float(10) for i in all_filt]

    mat = deepcopy(df['mat'])
    sum_row = np.sum(mat, axis=1)
    max_sum = max(sum_row)

    for inst_filt in all_filt:

      cutoff = inst_filt * max_sum
      copy_net = deepcopy(self)
      inst_df = deepcopy(df)
      inst_df = copy_net.df_filter_row(inst_df, cutoff, take_abs=False)
      net = deepcopy(Network())
      net.df_to_dat(inst_df)

      try: 
        try:
          net.cluster_row_and_col(dist_type=dist_type,run_clustering=True)
        except:
          net.cluster_row_and_col(dist_type=dist_type,run_clustering=False)

        inst_view = {}
        inst_view['pct_row_'+rank_type] = inst_filt
        inst_view['dist'] = 'cos'
        inst_view['nodes'] = {}
        inst_view['nodes']['row_nodes'] = net.viz['row_nodes']
        inst_view['nodes']['col_nodes'] = net.viz['col_nodes']

        all_views.append(inst_view)          

      except:
        print('\t*** did not cluster pct filtered view')

    return all_views

  def add_N_top_views(self, df, all_views, dist_type='cosine', rank_type='sum'):
    from clustergrammer import Network
    from copy import deepcopy 

    copy_net = deepcopy(self)
    keep_top = ['all',500,400,300,200,100,80,60,40,20,10]
    df_abs = deepcopy(df['mat'])
    df_abs = df_abs.transpose()

    if rank_type == 'sum':
      tmp_sum = df_abs.sum(axis=0)
    elif rank_type == 'var':
      tmp_sum = df_abs.var(axis=0)

    tmp_sum = tmp_sum.abs()
    tmp_sum.sort_values(inplace=True, ascending=False)
    rows_sorted = tmp_sum.index.values.tolist()

    for inst_keep in keep_top:

      tmp_df = deepcopy(df)

      if inst_keep < len(rows_sorted) or inst_keep == 'all':

        net = deepcopy(Network())

        if inst_keep != 'all':

          keep_rows = rows_sorted[0:inst_keep]
          tmp_df['mat'] = tmp_df['mat'].ix[keep_rows]

          if 'mat_up' in tmp_df:
            tmp_df['mat_up'] = tmp_df['mat_up'].ix[keep_rows] 
            tmp_df['mat_dn'] = tmp_df['mat_dn'].ix[keep_rows] 

          tmp_df = self.df_filter_col(tmp_df,0.001)
          net.df_to_dat(tmp_df)

        else:
          net.df_to_dat(tmp_df)

        try: 

          try:
            net.cluster_row_and_col(dist_type,run_clustering=True)
          except:
            net.cluster_row_and_col(dist_type,run_clustering=False)

          # add view 
          inst_view = {}
          inst_view['N_row_'+rank_type] = inst_keep
          inst_view['dist'] = 'cos'
          inst_view['nodes'] = {}
          inst_view['nodes']['row_nodes'] = net.viz['row_nodes']
          inst_view['nodes']['col_nodes'] = net.viz['col_nodes']
          all_views.append(inst_view)
        except:
          print('\t*** did not cluster N filtered view') 

    return all_views

  def mat_to_numpy_arr(self):
    ''' convert list to numpy array - numpy arrays can not be saved as json '''
    import numpy as np
    self.dat['mat'] = np.asarray( self.dat['mat'] )

  def swap_nan_for_zero(self):
    import numpy as np
    self.dat['mat'][ np.isnan( self.dat['mat'] ) ] = 0

  def cluster_row_and_col(self, dist_type='cosine', linkage_type='average', dendro=True, \
    run_clustering=True, run_rank=True):
    ''' cluster net.dat and make visualization json, net.viz. 
    optionally leave out dendrogram colorbar groups with dendro argument '''

    import scipy
    import numpy as np 
    from scipy.spatial.distance import pdist
    from copy import deepcopy

    if run_clustering == False:
      dendro = False

    for inst_rc in ['row','col']:
      num_nodes = len(self.dat['nodes'][inst_rc])
      node_dm = scipy.zeros([num_nodes,num_nodes])
      tmp_mat = deepcopy(self.dat['mat'])

      if inst_rc == 'row':
        node_dm = pdist( tmp_mat, metric=dist_type )
      elif inst_rc == 'col':
        node_dm = pdist( tmp_mat.transpose(), metric=dist_type )

      node_dm[node_dm < 0] = float(0)

      clust_order = self.ini_clust_order()
      clust_order[inst_rc]['ini'] = range(num_nodes, -1, -1)

      if run_clustering == True:
        clust_order[inst_rc]['clust'], clust_order[inst_rc]['group'] = \
        self.clust_and_group(node_dm, linkage_type=linkage_type)

      if run_rank == True:
        clust_order[inst_rc]['rank'] = self.sort_rank_nodes(inst_rc,'sum')
        clust_order[inst_rc]['rankvar'] = self.sort_rank_nodes(inst_rc,'var')

      if run_clustering == True:
        self.dat['node_info'][inst_rc]['clust'] = clust_order[inst_rc]['clust']
      else:
        self.dat['node_info'][inst_rc]['clust'] = clust_order[inst_rc]['ini']

      if run_rank == True:
        self.dat['node_info'][inst_rc]['rank'] = clust_order[inst_rc]['rank']
        self.dat['node_info'][inst_rc]['rankvar'] = clust_order[inst_rc]['rankvar']
      else:
        self.dat['node_info'][inst_rc]['rank'] = clust_order[inst_rc]['ini']
        self.dat['node_info'][inst_rc]['rankvar'] = clust_order[inst_rc]['ini']

      self.dat['node_info'][inst_rc]['ini'] = clust_order[inst_rc]['ini']
      self.dat['node_info'][inst_rc]['group'] = clust_order[inst_rc]['group']

      self.calc_cat_clust_order(inst_rc)

    self.viz_json(dendro)

  def calc_cat_clust_order(self, inst_rc):
    # print('calc_cat_clust_order')
    from clustergrammer import Network 
    from copy import deepcopy 

    inst_keys = self.dat['node_info'][inst_rc].keys()
    all_cats = [x for x in inst_keys if 'cat-' in x]

    # print('node_info '+str(inst_rc))
    # print(self.dat['node_info'][inst_rc].keys())
    # print('all_cats')
    # print(all_cats)

    if len(all_cats) > 0:
      
      for inst_name_cat in all_cats:

        dict_cat = self.dat['node_info'][inst_rc]['dict_'+inst_name_cat.replace('-','_')]

        all_cats = sorted(dict_cat.keys())

        # this is the ordering of the columns based on their category, not 
        # including their clustering ordering within category 
        all_cat_orders = []
        tmp_names_list = []
        for inst_cat in all_cats:

          # print(inst_cat)

          inst_nodes = dict_cat[inst_cat]

          tmp_names_list.extend(inst_nodes)

          cat_net = deepcopy(Network())

          cat_net.dat['mat'] = deepcopy(self.dat['mat'])
          cat_net.dat['nodes'] = deepcopy(self.dat['nodes'])

          cat_df = cat_net.dat_to_df()

          sub_df = {}
          if inst_rc == 'col':
            sub_df['mat'] = cat_df['mat'][inst_nodes]
          elif inst_rc == 'row':
            # need to transpose df 
            cat_df['mat'] = cat_df['mat'].transpose()
            sub_df['mat'] = cat_df['mat'][inst_nodes]
            sub_df['mat'] = sub_df['mat'].transpose()

          # load back to dat 
          cat_net.df_to_dat(sub_df)

          try:
            cat_net.cluster_row_and_col('cos')
            #!!!! tmp 
            # inst_cat_order = cat_net.dat['node_info'][inst_rc]
            inst_cat_order = range(len(cat_net.dat['nodes'][inst_rc]))
          except:
            inst_cat_order = range(len(cat_net.dat['nodes'][inst_rc]))

          prev_order_len = len(all_cat_orders)

          # add prev order length to the current order number 
          # print('inst_cat_order '+str(inst_cat_order))
          inst_cat_order = [i+prev_order_len for i in inst_cat_order]
          all_cat_orders.extend(inst_cat_order)


        # print('all_cat_orders')
        # print(all_cat_orders)

        names_clust_list = [x for (y,x) in sorted(zip(all_cat_orders,tmp_names_list))]
        # print('names_clust_list')
        # print(names_clust_list)

        # calc category-cluster order 
        final_order = []

        for i in range(len(self.dat['nodes'][inst_rc])):

          inst_node_name = self.dat['nodes'][inst_rc][i]
          inst_node_num = names_clust_list.index(inst_node_name)
          final_order.append(inst_node_num)

        self.dat['node_info'][inst_rc][inst_name_cat.replace('-','_')+'_index'] = final_order

  def clust_and_group( self, dm, linkage_type='average' ):
    import scipy.cluster.hierarchy as hier

    Y = hier.linkage( dm, method=linkage_type )
    Z = hier.dendrogram( Y, no_plot=True )
    inst_clust_order = Z['leaves']
    all_dist = self.group_cutoffs()

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

    tmp_nodes = deepcopy(self.dat['nodes'][rowcol])
    inst_mat   = deepcopy(self.dat['mat'])

    sum_term = []
    for i in range(len(tmp_nodes)):
      inst_dict = {}
      inst_dict['name'] = tmp_nodes[i]

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

      sum_term.append(inst_dict)

    sum_term = sorted( sum_term, key=itemgetter('rank'), reverse=False )

    tmp_sort_nodes = []
    for inst_dict in sum_term:
      tmp_sort_nodes.append(inst_dict['name'])

    sort_index = []
    for inst_node in tmp_nodes:
      sort_index.append( tmp_sort_nodes.index(inst_node) )

    return sort_index

  def viz_json(self, dendro=True):
    ''' make the dictionary for the clustergram.js visualization '''

    all_dist = self.group_cutoffs()

    for inst_rc in self.dat['nodes']:

      inst_keys = self.dat['node_info'][inst_rc]
      all_cats = [x for x in inst_keys if 'cat-' in x]

      for i in range(len( self.dat['nodes'][inst_rc] )):
        inst_dict = {}
        inst_dict['name']  = self.dat['nodes'][inst_rc][i]
        inst_dict['ini']   = self.dat['node_info'][inst_rc]['ini'][i]
        inst_dict['clust'] = self.dat['node_info'][inst_rc]['clust'].index(i)
        inst_dict['rank']  = self.dat['node_info'][inst_rc]['rank'][i]

        if 'rankvar' in inst_keys:
          inst_dict['rankvar']  = self.dat['node_info'][inst_rc]['rankvar'][i]

        if len(all_cats) > 0:

          for inst_name_cat in all_cats:
            inst_dict[inst_name_cat] = self.dat['node_info'][inst_rc][inst_name_cat][i]
            tmp_index_name = inst_name_cat.replace('-','_')+'_index'
            inst_dict[tmp_index_name] = self.dat['node_info'][inst_rc][tmp_index_name][i]

        if len(self.dat['node_info'][inst_rc]['value']) > 0:
          inst_dict['value'] = self.dat['node_info'][inst_rc]['value'][i]

        if len(self.dat['node_info'][inst_rc]['info']) > 0:
          inst_dict['info'] = self.dat['node_info'][inst_rc]['info'][i]

        if dendro==True:
          inst_dict['group'] = []
          for tmp_dist in all_dist:
            tmp_dist = str(tmp_dist).replace('.','')
            tmp_append = float(self.dat['node_info'][inst_rc]['group'][tmp_dist][i])
            inst_dict['group'].append( tmp_append )

        self.viz[inst_rc+'_nodes'].append(inst_dict)

    for i in range(len( self.dat['nodes']['row'] )):
      for j in range(len( self.dat['nodes']['col'] )):
        if abs( self.dat['mat'][i,j] ) > 0:
          inst_dict = {}
          inst_dict['source'] = i
          inst_dict['target'] = j 
          inst_dict['value'] = self.dat['mat'][i,j]

          if 'mat_up' in self.dat:
            inst_dict['value_up'] = self.dat['mat_up'][i,j]
          if 'mat_up' in self.dat:
            inst_dict['value_dn'] = self.dat['mat_dn'][i,j]

          if 'mat_info' in self.dat:
            inst_dict['info'] = self.dat['mat_info'][str((i,j))]

          if 'mat_hl' in self.dat:
            inst_dict['highlight'] = self.dat['mat_hl'][i,j]

          self.viz['links'].append( inst_dict )

  def df_to_dat(self, df):
    import numpy as np 
    import pandas as pd 

    self.dat['mat'] = df['mat'].values
    self.dat['nodes']['row'] = df['mat'].index.tolist()
    self.dat['nodes']['col'] = df['mat'].columns.tolist()

    for inst_rc in ['row','col']:

      if type(self.dat['nodes'][inst_rc][0]) is tuple:
        # get the number of categories from the length of the tuple 
        # subtract 1 because the name is the first element of the tuple 
        num_cat = len(self.dat['nodes'][inst_rc][0]) - 1
        print(self.dat['nodes'][inst_rc][0])
        print(len(self.dat['nodes'][inst_rc][0]))
        print('num_cat')
        print(num_cat)
        print('\n\n')
        self.dat['node_info'][inst_rc]['full_names'] = self.dat['nodes'][inst_rc]

        for inst_rcat in range(num_cat):
          self.dat['node_info'][inst_rc]['cat-'+str(inst_rcat)] = [i[inst_rcat+1] for i in self.dat['nodes'][inst_rc]]

        self.dat['nodes'][inst_rc] = [i[0] for i in self.dat['nodes'][inst_rc]]

    if 'mat_up' in df:
      self.dat['mat_up'] = df['mat_up'].values
      self.dat['mat_dn'] = df['mat_dn'].values

    self.dict_cat()

  def dat_to_df(self):
    import numpy as np
    import pandas as pd

    df = {}
    nodes = {}
    for inst_rc in ['row','col']:
      if 'full_names' in self.dat['node_info'][inst_rc]:
        nodes[inst_rc] = self.dat['node_info'][inst_rc]['full_names']
      else:
        nodes[inst_rc] = self.dat['nodes'][inst_rc]

    df['mat'] = pd.DataFrame(data = self.dat['mat'], columns=nodes['col'], index=nodes['row'])

    if 'mat_up' in self.dat:

      df['mat_up'] = pd.DataFrame(data = self.dat['mat_up'], columns=nodes['col'], index=nodes['row'])
      df['mat_dn'] = pd.DataFrame(data = self.dat['mat_dn'], columns=nodes['col'], index=nodes['row'])

    return df 
  
  def export_net_json(self, net_type, indent='no-indent'):
    ''' export json string of dat '''
    import json 
    from copy import deepcopy

    if net_type == 'dat':
      exp_dict = deepcopy(self.dat)
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

    if net_type == 'dat':
      exp_json = self.export_net_json('dat', indent)
    elif net_type == 'viz':
      exp_json = self.export_net_json('viz', indent)

    fw = open(filename, 'w')
    fw.write( exp_json ) 
    fw.close()

  @staticmethod
  def df_filter_row(df, threshold, take_abs=True):
    ''' filter rows in matrix at some threshold
    and remove columns that have a sum below this threshold '''

    import pandas as pd 
    from copy import deepcopy 
    from clustergrammer import Network
    net = Network()

    if take_abs == True:
      df_copy = deepcopy(df['mat'].abs())
    else:
      df_copy = deepcopy(df['mat'])

    ini_rows = df_copy.index.values.tolist()
    df_copy = df_copy.transpose()
    tmp_sum = df_copy.sum(axis=0)
    tmp_sum = tmp_sum.abs()
    tmp_sum.sort_values(inplace=True, ascending=False)

    tmp_sum = tmp_sum[tmp_sum>threshold]
    keep_rows = sorted(tmp_sum.index.values.tolist())

    if len(keep_rows) < len(ini_rows):
      df['mat'] = net.grab_df_subset(df['mat'], keep_rows=keep_rows)

      if 'mat_up' in df:
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

    if take_abs == True:
      df_copy = deepcopy(df['mat'].abs())
    else:
      df_copy = deepcopy(df['mat'])

    df_copy = df_copy.transpose()
    df_copy = df_copy[df_copy.sum(axis=1) > threshold]
    df_copy = df_copy.transpose()
    df_copy = df_copy[df_copy.sum(axis=1) > 0]

    if take_abs == True:
      inst_rows = df_copy.index.tolist()
      inst_cols = df_copy.columns.tolist()
      df['mat'] = net.grab_df_subset(df['mat'], inst_rows, inst_cols)

    else:
      df['mat'] = df_copy

    return df   

  @staticmethod
  def grab_df_subset(df, keep_rows='all', keep_cols='all'):
    if keep_cols != 'all':
      df = df[keep_cols]
    if keep_rows != 'all':
      df = df.ix[keep_rows]
    return df

  @staticmethod
  def load_gmt(filename):
    f = open(filename, 'r')
    lines = f.readlines()
    f.close()
    gmt = {}
    for i in range(len(lines)):
      inst_line = lines[i].rstrip()
      inst_term = inst_line.split('\t')[0]
      inst_elems = inst_line.split('\t')[2:]
      gmt[inst_term] = inst_elems

    return gmt

  @staticmethod
  def load_json_to_dict(filename):
    import json
    f = open(filename, 'r')
    inst_dict = json.load(f)
    f.close()
    return inst_dict 

  @staticmethod
  def save_dict_to_json(inst_dict, filename, indent='no-indent'):
    import json
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
  def group_cutoffs():
    all_dist = []
    for i in range(11):
      all_dist.append(float(i)/10)
    return all_dist