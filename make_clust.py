# import network class from Network.py
from d3_clustergram_class import Network

# get instance of Network  
net = Network()
print(net.__doc__)
print('make tsv clustergram')	

# load network from tsv file 
##############################
net.load_tsv_to_net('example_tsv_network.txt')

# cluster 
#############
# only compare vectors with at least min_num_comp common data points
# with absolute values above cutoff_comp 
cutoff_comp = 0
min_num_comp = 2
net.cluster_row_and_col('cos', cutoff_comp, min_num_comp)

# export data visualization to file 
######################################
net.write_json_to_file('viz', 'example_network.json','indent')