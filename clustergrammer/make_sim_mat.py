def main(net, inst_dm, filter_sim, sim_mat_views=['N_row_sum']):
  from __init__ import Network
  from copy import deepcopy
  import calc_clust, make_views

  sim_dict = {}

  for inst_rc in ['row','col']:

    sim_dict[inst_rc] = dm_to_sim(inst_dm[inst_rc], make_squareform=True,
                             filter_sim=filter_sim)

  sim_net = {}

  for inst_rc in ['row','col']:

    sim_net[inst_rc] = deepcopy(Network())

    sim_net[inst_rc].dat['mat'] = sim_dict[inst_rc]

    sim_net[inst_rc].dat['nodes']['row'] = net.dat['nodes'][inst_rc]
    sim_net[inst_rc].dat['nodes']['col'] = net.dat['nodes'][inst_rc]

    sim_net[inst_rc].dat['node_info']['row'] = net.dat['node_info'][inst_rc]
    sim_net[inst_rc].dat['node_info']['col'] = net.dat['node_info'][inst_rc]

    calc_clust.cluster_row_and_col(sim_net[inst_rc])

    all_views = []
    df = sim_net[inst_rc].dat_to_df()
    send_df = deepcopy(df)

    if 'N_row_sum' in sim_mat_views:
      all_views = make_views.N_rows(net, send_df, all_views,
                                    dist_type='cos', rank_type='sum')

    sim_net[inst_rc].viz['views'] = all_views

  return sim_net

def dm_to_sim(inst_dm, make_squareform=False, filter_sim=0):
  import numpy as np
  from scipy.spatial.distance import squareform

  if make_squareform is True:
    inst_dm = squareform(inst_dm)

  inst_sim_mat = 1 - inst_dm

  if filter_sim > 0:
    filter_sim = adjust_filter_sim(inst_sim_mat, filter_sim)
    inst_sim_mat[ np.abs(inst_sim_mat) < filter_sim] = 0

  return inst_sim_mat

def adjust_filter_sim(inst_dm, filter_sim, keep_top=20000):
  import pandas as pd
  import numpy as np

  inst_df = pd.DataFrame(inst_dm)
  val_vect = np.abs(inst_df.values.flatten())

  val_vect = val_vect[val_vect > 0.01]

  if len(val_vect) > keep_top:


    inst_series = pd.Series(val_vect)
    inst_series.sort(ascending=False)

    sort_values = inst_series.values

    filter_sim = sort_values[keep_top]

  return filter_sim