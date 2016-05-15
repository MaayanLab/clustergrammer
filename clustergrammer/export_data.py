def export_net_json(net, net_type, indent='no-indent'):
  ''' export json string of dat '''
  import json
  from copy import deepcopy

  if net_type == 'dat':
    exp_dict = deepcopy(net.dat)
    if type(exp_dict['mat']) is not list:
      exp_dict['mat'] = exp_dict['mat'].tolist()

  elif net_type == 'viz':
    exp_dict = net.viz

  elif net_type == 'sim_row':
    exp_dict = net.sim['row']

  elif net_type == 'sim_col':
    exp_dict = net.sim['col']

  # make json
  if indent == 'indent':
    exp_json = json.dumps(exp_dict, indent=2)
  else:
    exp_json = json.dumps(exp_dict)

  return exp_json  

def write_matrix_to_tsv(net, filename=None, df=None):
  '''
  This will export the matrix in net.dat or a dataframe (optional df in 
  arguments) as a tsv file. Row/column categories will be saved as tuples in 
  tsv, which can be read back into the network object. 
  '''
  import pandas as pd 

  if df is None:
    df = net.dat_to_df()

  return df['mat'].to_csv(filename, sep='\t')

def write_json_to_file(net, net_type, filename, indent='no-indent'):

  exp_json = net.export_net_json(net_type, indent)

  fw = open(filename, 'w')
  fw.write(exp_json)
  fw.close()  

def save_dict_to_json(inst_dict, filename, indent='no-indent'):
  import json
  fw = open(filename, 'w')
  if indent == 'indent':
    fw.write(json.dumps(inst_dict, indent=2))
  else:
    fw.write(json.dumps(inst_dict))
  fw.close()