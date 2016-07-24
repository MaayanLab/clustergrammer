import time
start_time = time.time()

from clustergrammer import Network
net = Network()

# choose tsv file
####################
net.load_file('txt/rc_two_cats.txt')
# net.load_file('txt/ccle_example.txt')
# net.load_file('txt/true_false_cats.txt')
# net.load_file('txt/tuple_cats.txt')
# net.load_file('txt/tuple_names.txt')
# net.load_file('txt/missing_values.txt')
# net.load_file('txt/example_tsv.txt')
# net.load_file('txt/col_categories.txt')
# net.load_file('txt/mat_cats.tsv')
# net.load_file('txt/mat_1mb.txt')
# net.load_file('txt/mnist.txt')
# net.load_file('txt/sim_mat_4_cats.txt')
# net.load_file('txt/number_names.txt')
# net.load_file('txt/example_tsv.txt')

# # upload vector format
# ########################
# vect_format = net.load_json_to_dict('json/fake_vect_post.json')
# net.load_vect_post_to_net(vect_format)

# link = net.Iframe_web_app('txt/rc_two_cats.txt', width=1000, height=800)
# link = net.Iframe_web_app( width=1000, height=800)

# print(link)

# possible filtering and normalization
##########################################
# net.filter_sum('row', threshold=20)
# net.filter_sum('col', threshold=30)

# net.normalize(axis='row', norm_type='qn')
# net.normalize(axis='col', norm_type='zscore', keep_orig=True)

# net.filter_N_top('row', 250, rank_type='sum')
# net.filter_N_top('col', 3, rank_type='var')

# net.filter_threShold('col', threshold=2, num_occur=3
# net.filter_threshold('row', threshold=3.0, num_occur=4)

net.swap_nan_for_zero()

# df = net.dat_to_df()

views = ['N_row_sum', 'N_row_var']

net.make_clust(dist_type='cos',views=views , dendro=True,
               sim_mat=True, filter_sim=0.1, calc_cat_pval=False)
               # run_enrichr=['KEA_2015'])
               # run_enrichr=['ENCODE_TF_ChIP-seq_2014'])
               # run_enrichr=['GO_Biological_Process_2015'])

net.write_json_to_file('viz', 'json/mult_view.json', 'no-indent')
net.write_json_to_file('sim_row', 'json/mult_view_sim_row.json', 'no-indent')
net.write_json_to_file('sim_col', 'json/mult_view_sim_col.json', 'no-indent')

# net.write_matrix_to_tsv ('txt/export_tmp.txt')

elapsed_time = time.time() - start_time
print('\n\nelapsed time: '+str(elapsed_time))
