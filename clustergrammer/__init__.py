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

  def make_clust(self, dist_type='cosine', run_clustering=True,
                          dendro=True, views=['pct_row_sum', 'N_row_sum'],
                          linkage_type='average'):
    import make_clust_fun

    make_clust_fun.make_clust(self, dist_type, run_clustering, dendro, 
                                   views, linkage_type)

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
