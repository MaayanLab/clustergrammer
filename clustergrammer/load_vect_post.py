def main(real_net, vect_post):
  import numpy as np
  from copy import deepcopy
  from __init__ import Network
  import proc_df_labels

  net = deepcopy(Network())

  sigs = vect_post['columns']

  all_rows = []
  all_sigs = []
  for inst_sig in sigs:
    all_sigs.append(inst_sig['col_name'])

    col_data = inst_sig['data']

    for inst_row_data in col_data:
      all_rows.append(inst_row_data['row_name'])

  all_rows = sorted(list(set(all_rows)))
  all_sigs = sorted(list(set(all_sigs)))

  net.dat['nodes']['row'] = all_rows
  net.dat['nodes']['col'] = all_sigs

  net.dat['mat'] = np.empty((len(all_rows), len(all_sigs)))
  net.dat['mat'][:] = np.nan

  is_up_down = False
  if 'is_up_down' in vect_post:
    if vect_post['is_up_down'] is True:
      is_up_down = True

  if is_up_down is True:
    net.dat['mat_up'] = np.empty((len(all_rows), len(all_sigs)))
    net.dat['mat_up'][:] = np.nan

    net.dat['mat_dn'] = np.empty((len(all_rows), len(all_sigs)))
    net.dat['mat_dn'][:] = np.nan

  for inst_sig in sigs:
    inst_sig_name = inst_sig['col_name']
    col_data = inst_sig['data']

    for inst_row_data in col_data:
      inst_row = inst_row_data['row_name']
      inst_value = inst_row_data['val']

      row_index = all_rows.index(inst_row)
      col_index = all_sigs.index(inst_sig_name)

      net.dat['mat'][row_index, col_index] = inst_value

      if is_up_down is True:
        net.dat['mat_up'][row_index, col_index] = inst_row_data['val_up']
        net.dat['mat_dn'][row_index, col_index] = inst_row_data['val_dn']

  tmp_df = net.dat_to_df()
  tmp_df = proc_df_labels.main(tmp_df)

  real_net.df_to_dat(tmp_df)
