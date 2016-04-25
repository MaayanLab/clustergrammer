import time
# import StringIO

start_time = time.time()

# import network class from Network.py

from clustergrammer import Network
net = Network()

net.load_file('txt/rc_two_cats.txt')
# net.load_file('txt/missing_values.txt')
# net.load_file('txt/example_tsv.txt')
# net.load_file('txt/col_categories.txt')
# net.load_file('txt/mat_cats.tsv')
# net.load_file('txt/mat_1mb.Txt')
# net.load_file('txt/mnist.txt')
# net.load_file('txt/sim_mat_4_cats.txt')
# net.load_file('txt/number_names.txt')



# # filtering rows and cols by sum 
# net.filter_sum('row', threshold=20)
# net.filter_sum('col', threshold=30)

# # quantile normalize to normalize cell lines
# net.normalize(axis='col', norm_type='qn')

# # only keep most differentially expressed genes
# net.filter_N_top('row', 700, 'sum')

# # take zscore
# net.normalize(axis='row', norm_type='zscore')


net.swap_nan_for_zero()
  
# views = ['N_row_sum', 'N_row_var']
views = []

net.make_clust(dist_type='cos',views=views , dendro=True,
               sim_mat=True, filter_sim=0.1)

# net.produce_view({'N_row_sum':10,'dist':'euclidean'})

net.write_json_to_file('viz', 'json/mult_view.json', 'no-indent')
net.write_json_to_file('sim_row', 'json/mult_view_sim_row.json', 'no-indent')
net.write_json_to_file('sim_col', 'json/mult_view_sim_col.json', 'no-indent')

elapsed_time = time.time() - start_time

print('\n\nelapsed time')
print(elapsed_time)
