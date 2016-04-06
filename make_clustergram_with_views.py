import time
# import StringIO

start_time = time.time()

# import network class from Network.py

from clustergrammer import Network
net = Network()

net.pandas_load_file('txt/rc_two_cats.txt')
# net.pandas_load_file('txt/example_tsv.txt')
# net.pandas_load_file('txt/col_categories.txt')
# net.pandas_load_file('txt/mat_cats.tsv')
# net.pandas_load_file('txt/mat_1mb.txt')
# net.pandas_load_file('txt/mnist.txt')

net.make_filtered_views(dist_type='cos',views=['N_row_sum','N_row_var'], 
                        dendro=True)

net.write_json_to_file('viz', 'json/mult_view.json', 'indent')

# your code
elapsed_time = time.time() - start_time

print('\n\nelapsed time')
print(elapsed_time)
