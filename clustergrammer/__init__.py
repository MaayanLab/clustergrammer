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
    import load_data
    inst_dat = self.load_json_to_dict(filename)
    load_data.load_data_to_net(self, inst_dat)

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
    import calc_clust

    df = self.dat_to_df()

    threshold = 0.0001
    df = self.df_filter_row(df, threshold)
    df = self.df_filter_col(df, threshold)

    # calculate initial view with no row filtering
    self.df_to_dat(df)
    calc_clust.cluster_row_and_col(self, dist_type=dist_type, linkage_type=linkage_type,
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

  def swap_nan_for_zero(self):
    ''' Expose this to user for their optional use ''' 
    import numpy as np
    self.dat['mat'][np.isnan(self.dat['mat'])] = 0

  def df_to_dat(self, df):
    ''' Convert from pandas dataframe to clustergrammers dat format ''' 
    import data_formats
    data_formats.df_to_dat(self, df)

  def dat_to_df(self):
    ''' convert from clusergrammers dat format to pandas dataframe '''
    import data_formats
    return data_formats.dat_to_df(self)

  def export_net_json(self, net_type, indent='no-indent'):
    import export_data
    return export_data.export_net_json(self, net_type, indent)

  def write_json_to_file(self, net_type, filename, indent='no-indent'):
    import export_data
    export_data.write_json_to_file(self, net_type, filename, indent)

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
