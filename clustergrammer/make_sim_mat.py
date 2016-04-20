def main(net, inst_dm, filter_sim):

  from __init__ import Network
  from copy import deepcopy
  import calc_clust

  inst_sim_mat = {}

  for inst_rc in ['row','col']:
    inst_sim_mat[inst_rc] = dm_to_sim(inst_dm[inst_rc], make_squareform=True, 
                             filter_sim=filter_sim)

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

def dm_to_sim(inst_dm, make_squareform=False, filter_sim=False):
  import numpy as np
  from scipy.spatial.distance import squareform

  if make_squareform is True:
    inst_dm = squareform(inst_dm)

  inst_dm = 1 - inst_dm

  if filter_sim !=False:
    inst_dm[ np.abs(inst_dm) < filter_sim] = 0

  return inst_dm