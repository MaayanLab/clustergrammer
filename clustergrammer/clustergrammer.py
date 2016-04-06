# define a class for networks
class Network(object):
  '''
  Networks have two states: the data state where they are stored
  as: matrix and nodes and a viz state where they are stored as:
  viz.links, viz.row_nodes, viz.col_nodes.

  The goal is to start in a data-state and produce a viz-state of
  the network that will be used as input to clustergram.js.
  '''

  def __init__(self):
    import initialize_net
    initialize_net.main(self)

  def load_file(self, filename):
    import load_data
    load_data.load_file(self, filename)

  def load_tsv_to_net(self, file_buffer):
    ''' This will load a tsv matrix file buffer, this is exposed so that it will
    be possible to load data without having to read from a file. ''' 
    import load_data
    load_data.load_tsv_to_net(self, file_buffer)

  def load_vect_post_to_net(self, vect_post):
    import load_vect_post
    load_vect_post.main(self, vect_post)

  def load_data_file_to_net(self, filename):
    inst_dat = self.load_json_to_dict(filename)
    self.load_data_to_net(inst_dat)

  def load_data_to_net(self, inst_net):
    ''' load data into nodes and mat, also convert mat to numpy array'''
    self.dat['nodes'] = inst_net['nodes']
    self.dat['mat'] = inst_net['mat']
    self.mat_to_numpy_arr()

  def dict_cat(self):
    import categories 
    categories.dict_cat(self)

  def set_node_names(self, row_name, col_name):
    '''give names to the rows and columns'''
    self.dat['node_names'] = {}
    self.dat['node_names']['row'] = row_name
    self.dat['node_names']['col'] = col_name

  def make_filtered_views(self, dist_type='cosine', run_clustering=True,
                          dendro=True, views=['pct_row_sum', 'N_row_sum'],
                          linkage_type='average'):
    ''' This will calculate multiple views of a clustergram by filtering the 
    data and clustering after each filtering. This filtering will keep the top 
    N rows based on some quantity (sum, num-non-zero, etc). '''

    import make_views
    from copy import deepcopy
    df = self.dat_to_df()

    threshold = 0.0001
    df = self.df_filter_row(df, threshold)
    df = self.df_filter_col(df, threshold)

    # calculate initial view with no row filtering
    self.df_to_dat(df)
    self.cluster_row_and_col(dist_type=dist_type, linkage_type=linkage_type,
                             run_clustering=run_clustering, dendro=dendro)

    all_views = []
    send_df = deepcopy(df)

    if 'N_row_sum' in views:
      all_views = make_views.N_rows(self, send_df, all_views,
                                       dist_type=dist_type, rank_type='sum')

    if 'N_row_var' in views:
      all_views = make_views.N_rows(self, send_df, all_views,
                                       dist_type=dist_type, rank_type='var')

    if 'pct_row_sum' in views:
      all_views = make_views.pct_rows(self, send_df, all_views,
                                         dist_type=dist_type, rank_type='sum')

    if 'pct_row_var' in views:
      all_views = make_views.pct_rows(self, send_df, all_views,
                                         dist_type=dist_type, rank_type='var')

    self.viz['views'] = all_views

  def mat_to_numpy_arr(self):
    ''' convert list to numpy array - numpy arrays can not be saved as json '''
    import numpy as np
    self.dat['mat'] = np.asarray(self.dat['mat'])

  def swap_nan_for_zero(self):
    import numpy as np
    self.dat['mat'][np.isnan(self.dat['mat'])] = 0

  def cluster_row_and_col(self, dist_type='cosine',
                          linkage_type='average', dendro=True,
                          run_clustering=True, run_rank=True):
    ''' cluster net.dat and make visualization json, net.viz.
    optionally leave out dendrogram colorbar groups with dendro argument '''

    import scipy
    from scipy.spatial.distance import pdist
    from copy import deepcopy

    if run_clustering is False:
      dendro = False

    for inst_rc in ['row', 'col']:
      num_nodes = len(self.dat['nodes'][inst_rc])
      node_dm = scipy.zeros([num_nodes, num_nodes])
      tmp_mat = deepcopy(self.dat['mat'])

      if inst_rc == 'row':
        node_dm = pdist(tmp_mat, metric=dist_type)
      elif inst_rc == 'col':
        node_dm = pdist(tmp_mat.transpose(), metric=dist_type)

      node_dm[node_dm < 0] = float(0)

      clust_order = self.ini_clust_order()
      clust_order[inst_rc]['ini'] = range(num_nodes, -1, -1)

      if run_clustering is True:
        clust_order[inst_rc]['clust'], clust_order[inst_rc]['group'] = \
            self.clust_and_group(node_dm, linkage_type=linkage_type)

      if run_rank is True:
        clust_order[inst_rc]['rank'] = self.sort_rank_nodes(inst_rc, 'sum')
        clust_order[inst_rc]['rankvar'] = self.sort_rank_nodes(inst_rc, 'var')

      if run_clustering is True:
        self.dat['node_info'][inst_rc]['clust'] = clust_order[inst_rc]['clust']
      else:
        self.dat['node_info'][inst_rc]['clust'] = clust_order[inst_rc]['ini']

      if run_rank is True:
        self.dat['node_info'][inst_rc]['rank'] = clust_order[inst_rc]['rank']
        self.dat['node_info'][inst_rc]['rankvar'] = \
            clust_order[inst_rc]['rankvar']
      else:
        self.dat['node_info'][inst_rc]['rank'] = clust_order[inst_rc]['ini']
        self.dat['node_info'][inst_rc]['rankvar'] = clust_order[inst_rc]['ini']

      self.dat['node_info'][inst_rc]['ini'] = clust_order[inst_rc]['ini']
      self.dat['node_info'][inst_rc]['group'] = clust_order[inst_rc]['group']

      self.calc_cat_clust_order(inst_rc)

    self.viz_json(dendro)

  def calc_cat_clust_order(self, inst_rc):
    import categories
    categories.calc_cat_clust_order(self, inst_rc)

  def clust_and_group(self, dm, linkage_type='average'):
    import scipy.cluster.hierarchy as hier

    Y = hier.linkage(dm, method=linkage_type)
    Z = hier.dendrogram(Y, no_plot=True)
    inst_clust_order = Z['leaves']
    all_dist = self.group_cutoffs()

    inst_groups = {}
    for inst_dist in all_dist:
      inst_key = str(inst_dist).replace('.', '')
      inst_groups[inst_key] = hier.fcluster(Y, inst_dist * dm.max(),
                                            'distance')
      inst_groups[inst_key] = inst_groups[inst_key].tolist()

    return inst_clust_order, inst_groups

  def sort_rank_nodes(self, rowcol, rank_type):
    import numpy as np
    from operator import itemgetter
    from copy import deepcopy

    tmp_nodes = deepcopy(self.dat['nodes'][rowcol])
    inst_mat = deepcopy(self.dat['mat'])

    sum_term = []
    for i in range(len(tmp_nodes)):
      inst_dict = {}
      inst_dict['name'] = tmp_nodes[i]

      if rowcol == 'row':
        if rank_type == 'sum':
          inst_dict['rank'] = np.sum(inst_mat[i, :])
        elif rank_type == 'var':
          inst_dict['rank'] = np.var(inst_mat[i, :])
      else:
        if rank_type == 'sum':
          inst_dict['rank'] = np.sum(inst_mat[:, i])
        elif rank_type == 'var':
          inst_dict['rank'] = np.var(inst_mat[:, i])

      sum_term.append(inst_dict)

    sum_term = sorted(sum_term, key=itemgetter('rank'), reverse=False)

    tmp_sort_nodes = []
    for inst_dict in sum_term:
      tmp_sort_nodes.append(inst_dict['name'])

    sort_index = []
    for inst_node in tmp_nodes:
      sort_index.append(tmp_sort_nodes.index(inst_node))

    return sort_index

  def viz_json(self, dendro=True):
    ''' make the dictionary for the clustergram.js visualization '''

    all_dist = self.group_cutoffs()

    for inst_rc in self.dat['nodes']:

      inst_keys = self.dat['node_info'][inst_rc]
      all_cats = [x for x in inst_keys if 'cat-' in x]

      for i in range(len(self.dat['nodes'][inst_rc])):
        inst_dict = {}
        inst_dict['name'] = self.dat['nodes'][inst_rc][i]
        inst_dict['ini'] = self.dat['node_info'][inst_rc]['ini'][i]
        inst_dict['clust'] = self.dat['node_info'][inst_rc]['clust'].index(i)
        inst_dict['rank'] = self.dat['node_info'][inst_rc]['rank'][i]

        if 'rankvar' in inst_keys:
          inst_dict['rankvar'] = self.dat['node_info'][inst_rc]['rankvar'][i]

        if len(all_cats) > 0:

          for inst_name_cat in all_cats:
            inst_dict[inst_name_cat] = self.dat['node_info'][inst_rc] \
                [inst_name_cat][i]

            tmp_index_name = inst_name_cat.replace('-', '_') + '_index'
            inst_dict[tmp_index_name] = self.dat['node_info'][inst_rc] \
                [tmp_index_name][i]

        if len(self.dat['node_info'][inst_rc]['value']) > 0:
          inst_dict['value'] = self.dat['node_info'][inst_rc]['value'][i]

        if len(self.dat['node_info'][inst_rc]['info']) > 0:
          inst_dict['info'] = self.dat['node_info'][inst_rc]['info'][i]

        if dendro is True:
          inst_dict['group'] = []
          for tmp_dist in all_dist:
            tmp_dist = str(tmp_dist).replace('.', '')
            tmp_append = float(
                self.dat['node_info'][inst_rc]['group'][tmp_dist][i])
            inst_dict['group'].append(tmp_append)

        self.viz[inst_rc + '_nodes'].append(inst_dict)

    for i in range(len(self.dat['nodes']['row'])):
      for j in range(len(self.dat['nodes']['col'])):
        if abs(self.dat['mat'][i, j]) > 0:
          inst_dict = {}
          inst_dict['source'] = i
          inst_dict['target'] = j
          inst_dict['value'] = self.dat['mat'][i, j]

          if 'mat_up' in self.dat:
            inst_dict['value_up'] = self.dat['mat_up'][i, j]
          if 'mat_up' in self.dat:
            inst_dict['value_dn'] = self.dat['mat_dn'][i, j]

          if 'mat_info' in self.dat:
            inst_dict['info'] = self.dat['mat_info'][str((i, j))]

          if 'mat_hl' in self.dat:
            inst_dict['highlight'] = self.dat['mat_hl'][i, j]

          self.viz['links'].append(inst_dict)

  def df_to_dat(self, df):

    self.dat['mat'] = df['mat'].values
    self.dat['nodes']['row'] = df['mat'].index.tolist()
    self.dat['nodes']['col'] = df['mat'].columns.tolist()

    for inst_rc in ['row', 'col']:

      if type(self.dat['nodes'][inst_rc][0]) is tuple:
        # get the number of categories from the length of the tuple
        # subtract 1 because the name is the first element of the tuple
        num_cat = len(self.dat['nodes'][inst_rc][0]) - 1

        self.dat['node_info'][inst_rc]['full_names'] = self.dat['nodes']\
            [inst_rc]

        for inst_rcat in range(num_cat):
          self.dat['node_info'][inst_rc]['cat-' + str(inst_rcat)] = \
            [i[inst_rcat + 1] for i in self.dat['nodes'][inst_rc]]

        self.dat['nodes'][inst_rc] = [i[0] for i in self.dat['nodes'][inst_rc]]

    if 'mat_up' in df:
      self.dat['mat_up'] = df['mat_up'].values
      self.dat['mat_dn'] = df['mat_dn'].values

    self.dict_cat()

  def dat_to_df(self):
    import pandas as pd

    df = {}
    nodes = {}
    for inst_rc in ['row', 'col']:
      if 'full_names' in self.dat['node_info'][inst_rc]:
        nodes[inst_rc] = self.dat['node_info'][inst_rc]['full_names']
      else:
        nodes[inst_rc] = self.dat['nodes'][inst_rc]

    df['mat'] = pd.DataFrame(data=self.dat['mat'], columns=nodes['col'],
        index=nodes['row'])

    if 'mat_up' in self.dat:

      df['mat_up'] = pd.DataFrame(data=self.dat['mat_up'],
        columns=nodes['col'], index=nodes['row'])
      df['mat_dn'] = pd.DataFrame(data=self.dat['mat_dn'],
        columns=nodes['col'], index=nodes['row'])

    return df

  def export_net_json(self, net_type, indent='no-indent'):
    import export_data
    return export_data.export_net_json(self, net_type, indent)

  def write_json_to_file(self, net_type, filename, indent='no-indent'):
    import export_data
    export_data.write_json_to_file(self, net_type, filename, indent)

  @staticmethod
  def check_categories(lines):
    import categories
    return categories.check_categories(lines)

  @staticmethod
  def df_filter_row(df, threshold, take_abs=True):
    ''' filter rows in matrix at some threshold
    and remove columns that have a sum below this threshold '''

    from copy import deepcopy
    from clustergrammer import Network
    net = Network()

    if take_abs is True:
      df_copy = deepcopy(df['mat'].abs())
    else:
      df_copy = deepcopy(df['mat'])

    ini_rows = df_copy.index.values.tolist()
    df_copy = df_copy.transpose()
    tmp_sum = df_copy.sum(axis=0)
    tmp_sum = tmp_sum.abs()
    tmp_sum.sort_values(inplace=True, ascending=False)

    tmp_sum = tmp_sum[tmp_sum > threshold]
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

    from copy import deepcopy
    from clustergrammer import Network
    net = Network()

    if take_abs is True:
      df_copy = deepcopy(df['mat'].abs())
    else:
      df_copy = deepcopy(df['mat'])

    df_copy = df_copy.transpose()
    df_copy = df_copy[df_copy.sum(axis=1) > threshold]
    df_copy = df_copy.transpose()
    df_copy = df_copy[df_copy.sum(axis=1) > 0]

    if take_abs is True:
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
    import load_data
    return load_data.load_gmt(filename)

  @staticmethod
  def load_json_to_dict(filename):
    import load_data
    return load_data.load_json_to_dict(filename)

  @staticmethod
  def save_dict_to_json(inst_dict, filename, indent='no-indent'):
    import export_data
    export_data.save_dict_to_json(inst_dict, filename, indent)

  @staticmethod
  def ini_clust_order():
    rowcol = ['row', 'col']
    orderings = ['clust', 'rank', 'group', 'ini']
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
      all_dist.append(float(i) / 10)
    return all_dist
