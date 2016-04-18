def main(net, inst_sim_mat):
  from __init__ import Network
  from copy import deepcopy
  import calc_clust

  print('making sim mat main')

  sim_net = {}

  for inst_rc in ['row','col']:

    sim_net[inst_rc] = deepcopy(Network())

    sim_net[inst_rc].dat['mat'] = inst_sim_mat[inst_rc]

    sim_net[inst_rc].dat['nodes']['row'] = net.dat['nodes'][inst_rc]
    sim_net[inst_rc].dat['nodes']['col'] = net.dat['nodes'][inst_rc]

    sim_net[inst_rc].dat['node_info']['row'] = net.dat['node_info'][inst_rc]
    sim_net[inst_rc].dat['node_info']['col'] = net.dat['node_info'][inst_rc]

    calc_clust.cluster_row_and_col(sim_net[inst_rc])

  return sim_net
