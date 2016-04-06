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

  # make json
  if indent == 'indent':
    exp_json = json.dumps(exp_dict, indent=2)
  else:
    exp_json = json.dumps(exp_dict)

  return exp_json  

def write_json_to_file(net, net_type, filename, indent='no-indent'):
  if net_type == 'dat':
    exp_json = net.export_net_json('dat', indent)
  elif net_type == 'viz':
    exp_json = net.export_net_json('viz', indent)

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