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