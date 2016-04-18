import time
# import StringIO

start_time = time.time()

# import network class from Network.py

from clustergrammer import Network
net = Network()

net.load_file('txt/rc_two_cats.txt')
# net.load_file('txt/example_tsv.txt')
# net.load_file('txt/col_categories.txt')
# net.load_file('txt/mat_cats.tsv')
# net.load_file('txt/mat_1mb.Txt')
# net.load_file('txt/mnist.txt')
# net.load_file('txt/sim_mat_4_cats.txt')

views = ['N_row_sum','N_row_var']

threshold = 0
net.filter_sum('row', threshold)
threshold = 0
net.filter_sum('col', threshold)

net.make_clust(dist_type='cos',views=views , dendro=True,
               sim_mat=True)


# net.produce_view({'N_row_sum':10,'dist':'euclidean'})

net.write_json_to_file('viz', 'json/mult_view.json', 'indent')

# your code
elapsed_time = time.time() - start_time

print('\n\nelapsed time')
print(elapsed_time)
