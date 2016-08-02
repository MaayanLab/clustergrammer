# define a class for networks
class Network(object):
  '''
  Networks have two states:

  1) the data state, where they are stored as a matrix and nodes

  2) the viz state where they are stored as viz.links, viz.row_nodes, and
  viz.col_nodes.

  The goal is to start in a data-state and produce a viz-state of
  the network that will be used as input to clustergram.js.
  '''

  def __init__(self):
    import initialize_net
    initialize_net.main(self)

  def load_file(self, filename):
    '''
    load file to network, currently supporting only tsv
    '''
    import load_data
    load_data.load_file(self, filename)

  def load_tsv_to_net(self, file_buffer, filename=None):
    '''
    This will load a tsv matrix file buffer, this is exposed so that it will
    be possible to load data without having to read from a file.
    '''
    import load_data
    load_data.load_tsv_to_net(self, file_buffer, filename)

  def load_vect_post_to_net(self, vect_post):
    '''
    load vector format to network
    '''
    import load_vect_post
    load_vect_post.main(self, vect_post)

  def load_data_file_to_net(self, filename):
    '''
    load my .dat format (saved as json) for a network to a netowrk
    '''

    import load_data
    inst_dat = self.load_json_to_dict(filename)
    load_data.load_data_to_net(self, inst_dat)

  def make_clust(self, dist_type='cosine', run_clustering=True,
                 dendro=True, views=['N_row_sum', 'N_row_var'],
                 linkage_type='average', sim_mat=False, filter_sim=0.1,
                 calc_cat_pval=False, run_enrichr=None):
    '''
    The main function run by the user to make their clustergram.
    views is later referred to as requested_views.
    '''
    import make_clust_fun
    make_clust_fun.make_clust(self, dist_type=dist_type, run_clustering=run_clustering,
                                   dendro=dendro,
                                   requested_views=views,
                                   linkage_type=linkage_type,
                                   sim_mat=sim_mat,
                                   filter_sim=filter_sim,
                                   calc_cat_pval=calc_cat_pval,
                                   run_enrichr=run_enrichr)

  def produce_view(self, requested_view=None):
    '''
    under development, will produce a single view on demand from .dat data
    '''
    print('\tproduce a single view of a matrix, will be used for get requests')

    if requested_view != None:
      print('requested_view')
      print(requested_view)

  def swap_nan_for_zero(self):
    '''
    Expose this to user for their optional use
    '''
    import numpy as np
    self.dat['mat'][np.isnan(self.dat['mat'])] = 0

  def df_to_dat(self, df):
    '''
    Convert from pandas dataframe to clustergrammers dat format
    '''
    import data_formats
    data_formats.df_to_dat(self, df)

  def dat_to_df(self):
    '''
    convert from clusergrammers dat format to pandas dataframe
    '''
    import data_formats
    return data_formats.dat_to_df(self)

  def export_net_json(self, net_type='viz', indent='no-indent'):
    import export_data
    return export_data.export_net_json(self, net_type, indent)

  def write_json_to_file(self, net_type, filename, indent='no-indent'):
    import export_data
    export_data.write_json_to_file(self, net_type, filename, indent)

  def write_matrix_to_tsv(self, filename=None, df=None):
    import export_data
    return export_data.write_matrix_to_tsv(self, filename, df)

  def filter_sum(self, inst_rc, threshold, take_abs=True):
    '''
    Filter a network's rows or columns based on the sum across rows or columns
    Works on the network object
    '''
    import run_filter
    inst_df = self.dat_to_df()
    if inst_rc == 'row':
      inst_df = run_filter.df_filter_row_sum(inst_df, threshold, take_abs)
    elif inst_rc == 'col':
      inst_df = run_filter.df_filter_col_sum(inst_df, threshold, take_abs)
    self.df_to_dat(inst_df)

  def filter_N_top(self, inst_rc, N_top, rank_type='sum'):
    '''
    Filter a network's rows or cols based on sum/variance, and only keep the top
    N
    '''
    import run_filter

    inst_df = self.dat_to_df()

    inst_df = run_filter.filter_N_top(inst_rc, inst_df, N_top, rank_type)

    self.df_to_dat(inst_df)

  def filter_threshold(self, inst_rc, threshold, num_occur=1):
    '''
    Filter a network's rows or cols based on num_occur values being above a
    threshold (in absolute value)
    '''
    import run_filter

    inst_df = self.dat_to_df()

    inst_df = run_filter.filter_threshold(inst_df, inst_rc, threshold,
      num_occur)

    self.df_to_dat(inst_df)

  def normalize(self, df=None, norm_type='zscore', axis='row', keep_orig=False):
    '''
    under development, normalize the network rows/cols using zscore
    '''
    import normalize_fun

    normalize_fun.run_norm(self, df, norm_type, axis, keep_orig)

  def Iframe_web_app(self, filename=None, width=1000, height=800):
    import iframe_web_app

    link = iframe_web_app.main(self, filename, width, height)

    return link

  def enrichr(self, req_type, gene_list=None, lib=None, list_id=None,
    max_terms=None):
    '''
    under development, get enrichment results from Enrichr and add them to
    clustergram
    '''

    import enrichr_functions as enr_fun

    if req_type == 'post':
      return enr_fun.post_request(gene_list)

    if req_type == 'get':
      return enr_fun.get_request(lib, list_id, max_terms)

    # if req_type == ''

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
