# import network class from Network.py
from clustergrammer import Network

net = Network()

# net.load_tsv_to_net('txt/example_tsv_network.txt')
print('loading')
net.load_tsv_to_net('txt/mat_2kb.txt')
print('working on views')
net.make_mult_views(dist_type='cos',filter_row=['num'])

net.write_json_to_file('viz', 'json/mult_view.json', 'indent')