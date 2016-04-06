def main(net, vect_post):
  import numpy as np
  import categories

  sigs = vect_post['columns']

  all_rows = []
  all_sigs = []
  tmp_col_cat = {}
  is_col_cat = False
  for inst_sig in sigs:
    all_sigs.append(inst_sig['col_name'])

    if 'cat' in inst_sig:
      is_col_cat = True
      tmp_col_cat[inst_sig['col_name']] = inst_sig['cat']

    col_data = inst_sig['data']

    for inst_row_data in col_data:
      all_rows.append(inst_row_data['row_name'])

  all_rows = sorted(list(set(all_rows)))
  all_sigs = sorted(list(set(all_sigs)))

  net.dat['nodes']['row'] = all_rows
  net.dat['nodes']['col'] = all_sigs

  if is_col_cat:
    all_cat = []

    for tmp_sig in all_sigs:
      all_cat.append(tmp_col_cat[tmp_sig])

    net.dat['node_info']['col']['cat-0'] = all_cat
    
    categories.dict_cat(net)

    net.dat['node_info']['col']['full_names'] = []

    # construct full_names from single column category
    # need to improve
    for inst_index in range(len(all_cat)):
      inst_cat = all_cat[inst_index]
      inst_name = net.dat['nodes']['col'][inst_index]
      inst_tuple = (inst_name, inst_cat)
      net.dat['node_info']['col']['full_names'].append(inst_tuple)

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