# import network class from Network.py
from clustergrammer import Network

# get instance of Network
net = Network()
print(net.__doc__)
print('make tsv clustergram')

# load network from tsv file
##############################
net.load_tsv_to_net('txt/example_tsv_network.txt')

inst_filt = 0.001
inst_meet = 1
net.filter_network_thresh(inst_filt,inst_meet)

# cluster
#############
net.cluster_row_and_col('cos')

# export data visualization to file
######################################
net.write_json_to_file('viz', 'json/default_example.json', 'indent')