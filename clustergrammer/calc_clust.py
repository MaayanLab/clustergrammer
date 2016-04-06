def clust_and_group(net, node_dm, linkage_type='average'):
  print('clust_and_group')
  import scipy.cluster.hierarchy as hier

  Y = hier.linkage(node_dm, method=linkage_type)
  Z = hier.dendrogram(Y, no_plot=True)
  inst_clust_order = Z['leaves']
  all_dist = net.group_cutoffs()

  inst_groups = {}
  for inst_dist in all_dist:
    inst_key = str(inst_dist).replace('.', '')
    inst_groups[inst_key] = hier.fcluster(Y, inst_dist * node_dm.max(),
                                          'distance')
    inst_groups[inst_key] = inst_groups[inst_key].tolist()

  return inst_clust_order, inst_groups