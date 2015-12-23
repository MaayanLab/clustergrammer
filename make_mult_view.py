import time
start_time = time.time()

# import network class from Network.py
from clustergrammer import Network

net = Network()

net.load_tsv_to_net('txt/mat_1mb.txt')

net.make_mult_views(dist_type='cos',filter_row=['sum'])

net.write_json_to_file('viz', 'json/mult_view.json', 'indent')

# your code
elapsed_time = time.time() - start_time

print('\n\n\nelapsed time')
print(elapsed_time)