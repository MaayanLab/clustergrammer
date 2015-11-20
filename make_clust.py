# import network class from Network.py
from d3_clustergram import Network

# get instance of Network
net = Network()
print(net.__doc__)
print('make tsv clustergram')


inst_filt = 0.001
inst_meet = 1

# load network from tsv file
##############################
net.load_tsv_to_net('txt/example_tsv_network.txt')

net.filter_network_thresh(inst_filt,inst_meet)

mat_shape = net.dat['mat'].shape

# cluster
#############
# only compare vectors with at least in_num_comp common data points
# with absolute values above cutoff_comp
net.cluster_row_and_col('cos')

# export data visualization to file
######################################
net.write_json_to_file('viz', 'json/default_example.json', 'indent')