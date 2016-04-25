def df_to_dat(net, df):
  import categories

  net.dat['mat'] = df['mat'].values
  net.dat['nodes']['row'] = df['mat'].index.tolist()
  net.dat['nodes']['col'] = df['mat'].columns.tolist()

  for inst_rc in ['row', 'col']:

    if type(net.dat['nodes'][inst_rc][0]) is tuple:
      # get the number of categories from the length of the tuple
      # subtract 1 because the name is the first element of the tuple
      num_cat = len(net.dat['nodes'][inst_rc][0]) - 1

      net.dat['node_info'][inst_rc]['full_names'] = net.dat['nodes']\
          [inst_rc]

      for inst_rcat in range(num_cat):
        net.dat['node_info'][inst_rc]['cat-' + str(inst_rcat)] = \
          [i[inst_rcat + 1] for i in net.dat['nodes'][inst_rc]]

      net.dat['nodes'][inst_rc] = [i[0] for i in net.dat['nodes'][inst_rc]]

  if 'mat_up' in df:
    net.dat['mat_up'] = df['mat_up'].values
    net.dat['mat_dn'] = df['mat_dn'].values

  if 'mat_orig' in df:
    net.dat['mat_orig'] = df['mat_orig'].values

  categories.dict_cat(net)

def dat_to_df(net):
  import pandas as pd

  df = {}
  nodes = {}
  for inst_rc in ['row', 'col']:
    if 'full_names' in net.dat['node_info'][inst_rc]:
      nodes[inst_rc] = net.dat['node_info'][inst_rc]['full_names']
    else:
      nodes[inst_rc] = net.dat['nodes'][inst_rc]

  df['mat'] = pd.DataFrame(data=net.dat['mat'], columns=nodes['col'],
      index=nodes['row'])

  if 'mat_up' in net.dat:

    df['mat_up'] = pd.DataFrame(data=net.dat['mat_up'],
      columns=nodes['col'], index=nodes['row'])

    df['mat_dn'] = pd.DataFrame(data=net.dat['mat_dn'],
      columns=nodes['col'], index=nodes['row'])

  if 'mat_orig' in net.dat:
    df['mat_orig'] = pd.DataFrame(data=net.dat['mat_orig'], 
      columns=nodes['col'], index=nodes['row'])

  return df  

def mat_to_numpy_arr(self):
  ''' convert list to numpy array - numpy arrays can not be saved as json '''
  import numpy as np
  self.dat['mat'] = np.asarray(self.dat['mat'])