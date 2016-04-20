def main(net, inst_dm, filter_sim_below):

  from __init__ import Network
  from copy import deepcopy
  import calc_clust
  # import run_filter


  inst_sim_mat = {}

  for inst_rc in ['row','col']:
    inst_sim_mat[inst_rc] = dm_to_sim(inst_dm[inst_rc], make_squareform=True, 
                             filter_sim_below=filter_sim_below)


  sim_net = {}

  for inst_rc in ['row','col']:

    sim_net[inst_rc] = deepcopy(Network())

    sim_net[inst_rc].dat['mat'] = inst_sim_mat[inst_rc]

    sim_net[inst_rc].dat['nodes']['row'] = net.dat['nodes'][inst_rc]
    sim_net[inst_rc].dat['nodes']['col'] = net.dat['nodes'][inst_rc]

    sim_net[inst_rc].dat['node_info']['row'] = net.dat['node_info'][inst_rc]
    sim_net[inst_rc].dat['node_info']['col'] = net.dat['node_info'][inst_rc]

    # tmp_df = sim_net[inst_rc].dat_to_df()
    # print(tmp_df['mat'].shape)
    # tmp_df = run_filter.df_filter_col_sum(tmp_df, 0.001)
    # tmp_df = run_filter.df_filter_row_sum(tmp_df, 0.001)
    # sim_net[inst_rc].df_to_dat(tmp_df)

    calc_clust.cluster_row_and_col(sim_net[inst_rc])

  return sim_net


def dm_to_sim(inst_dm, make_squareform=False, filter_sim_below=False):
  import numpy as np
  from scipy.spatial.distance import squareform

  if make_squareform is True:
    inst_dm = squareform(inst_dm)

  inst_dm = 1 - inst_dm

  if filter_sim_below !=False:
    inst_dm[ np.abs(inst_dm) < filter_sim_below] = 0

  return inst_dm