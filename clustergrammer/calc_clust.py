def cluster_row_and_col(net, dist_type='cosine', linkage_type='average', 
                        dendro=True, run_clustering=True, run_rank=True):
  ''' cluster net.dat and make visualization json, net.viz.
  optionally leave out dendrogram colorbar groups with dendro argument '''

  import scipy
  from scipy.spatial.distance import pdist
  from copy import deepcopy
  import categories, make_viz

  if run_clustering is False:
    dendro = False

  for inst_rc in ['row', 'col']:
    num_nodes = len(net.dat['nodes'][inst_rc])

    tmp_mat = deepcopy(net.dat['mat'])

    if inst_rc == 'row':
      inst_dm = pdist(tmp_mat, metric=dist_type)
    elif inst_rc == 'col':
      inst_dm = pdist(tmp_mat.transpose(), metric=dist_type)

    inst_dm[inst_dm < 0] = float(0)

    clust_order = ini_clust_order()

    clust_order[inst_rc]['ini'] = range(num_nodes, -1, -1)

    if run_clustering is True:
      
      clust_order[inst_rc]['clust'], clust_order[inst_rc]['group'] = \
          clust_and_group(net, inst_dm, linkage_type=linkage_type)

      net.dat['node_info'][inst_rc]['clust'] = clust_order[inst_rc]['clust']
    else:
      net.dat['node_info'][inst_rc]['clust'] = clust_order[inst_rc]['ini']

    if run_rank is True:
      clust_order[inst_rc]['rank'] = sort_rank_nodes(net, inst_rc, 'sum')
      clust_order[inst_rc]['rankvar'] = sort_rank_nodes(net, inst_rc, 'var')

      net.dat['node_info'][inst_rc]['rank'] = clust_order[inst_rc]['rank']
      net.dat['node_info'][inst_rc]['rankvar'] = clust_order[inst_rc]['rankvar']
    else:
      net.dat['node_info'][inst_rc]['rank'] = clust_order[inst_rc]['ini']
      net.dat['node_info'][inst_rc]['rankvar'] = clust_order[inst_rc]['ini']

    net.dat['node_info'][inst_rc]['ini'] = clust_order[inst_rc]['ini']
    net.dat['node_info'][inst_rc]['group'] = clust_order[inst_rc]['group']

    categories.calc_cat_clust_order(net, inst_rc)

  make_viz.viz_json(net, dendro)

def clust_and_group(net, inst_dm, linkage_type='average'):
  import scipy.cluster.hierarchy as hier

  Y = hier.linkage(inst_dm, method=linkage_type)
  Z = hier.dendrogram(Y, no_plot=True)
  inst_clust_order = Z['leaves']
  all_dist = group_cutoffs()

  groups = {}
  for inst_dist in all_dist:
    inst_key = str(inst_dist).replace('.', '')
    groups[inst_key] = hier.fcluster(Y, inst_dist * inst_dm.max(), 'distance')
    groups[inst_key] = groups[inst_key].tolist()

  return inst_clust_order, groups

def sort_rank_nodes(net, rowcol, rank_type):
  import numpy as np
  from operator import itemgetter
  from copy import deepcopy

  tmp_nodes = deepcopy(net.dat['nodes'][rowcol])
  inst_mat = deepcopy(net.dat['mat'])

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

def group_cutoffs():
  all_dist = []
  for i in range(11):
    all_dist.append(float(i) / 10)
  return all_dist  

def ini_clust_order():
  rowcol = ['row', 'col']
  orderings = ['clust', 'rank', 'group', 'ini']
  clust_order = {}
  for inst_node in rowcol:
    clust_order[inst_node] = {}
    for inst_order in orderings:
      clust_order[inst_node][inst_order] = []
  return clust_order  