# import network class from Network.py
from clustergrammer import Network
from copy import deepcopy

# filter between 0 and 90% of max value 
all_filt = range(10)
all_filt = [i/float(10) for i in all_filt]

inst_meet = 1

print('something')

# calc mult_view net 
net_view = deepcopy(Network())
net_view.load_tsv_to_net('txt/example_tsv_network.txt')
# net_view.pandas_load_tsv_to_net('txt/ccle_example.txt')
net_view.cluster_row_and_col('cos')

mat = net_view.dat['mat']
max_mat = max(mat.min(), mat.max(), key=abs)

net_view.viz['views'] = []

all_views = []

for inst_filt in all_filt:

  print('\ninst_filt\t'+str(inst_filt))

  # load network from tsv file
  #############################
  net = deepcopy(Network())

  net.dat = deepcopy(net_view.dat)

  filt_value = inst_filt * max_mat

  net.filter_network_thresh(filt_value,inst_meet)

  mat_shape = net.dat['mat'].shape

  try:
    # cluster
    #############
    # only compare vectors with at least min_num_comp common data points
    # with absolute values above cutoff_comp
    net.cluster_row_and_col('cos')

    # add view 
    inst_view = {}
    inst_view['filt'] = inst_filt
    inst_view['num_meet'] = inst_meet
    inst_view['dist'] = 'cos'
    inst_view['nodes'] = {}
    inst_view['nodes']['row_nodes'] = net.viz['row_nodes']
    inst_view['nodes']['col_nodes'] = net.viz['col_nodes']

    all_views.append(inst_view)

  except:
    print('\n\ndo not make clustergram\n\n')

# add views to viz
net_view.viz['views'] = all_views

# export data visualization to file
######################################
net_view.write_json_to_file('viz', 'json/mult_view.json', 'indent')