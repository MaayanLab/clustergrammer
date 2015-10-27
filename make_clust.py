# import network class from Network.py
from d3_clustergram import Network
from copy import deepcopy

# get instance of Network
net = Network()
print(net.__doc__)
print('make tsv clustergram')


inst_filt = 0

all_filt = [1,2,3,4,5,6,7,8,9]
inst_meet = 1

for inst_filt in all_filt:

  # load network from tsv file
  ##############################
  net = deepcopy(Network())
  net.load_tsv_to_net('txt/example_tsv_network.txt')

  net.filter_network_thresh(inst_filt,inst_meet)

  # cluster
  #############
  # only compare vectors with at least min_num_comp common data points
  # with absolute values above cutoff_comp
  net.cluster_row_and_col('cos')

  # export data visualization to file
  ######################################
  net.write_json_to_file('viz', 'json/default_example_f'+str(inst_filt)+\
    '.json', 'indent')