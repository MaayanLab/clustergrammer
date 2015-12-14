# import network class from Network.py
from clustergrammer import Network

net = Network()

net.load_tsv_to_net('txt/example_tsv_network.txt')

net.make_mult_views(dist_type='cos',filter_row=['value','num','sum'])

net.write_json_to_file('viz', 'json/mult_view.json', 'indent')