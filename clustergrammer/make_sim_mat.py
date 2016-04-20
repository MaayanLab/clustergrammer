def main(net, inst_sim_mat):
  from __init__ import Network
  from copy import deepcopy
  import calc_clust
  # import run_filter

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
