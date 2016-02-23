import time
start_time = time.time()

# import network class from Network.py
from clustergrammer import Network

net = Network()

net.load_tsv_to_net('txt/example_tsv.txt')

net.make_filtered_views(dist_type='cos',views=['N_row_sum','pct_row_sum'], dendro=True)

net.write_json_to_file('viz', 'json/mult_view.json', 'indent')

# your code
elapsed_time = time.time() - start_time

print('\n\n\nelapsed time')
print(elapsed_time)