# d3_clustergram.py has functions that will generate a d3 clustergram 

def write_json_single_value(nodes, clust_order, LDR, full_path, row_class={}, col_class={}, link_hl={} ):
	import json
	import json_scripts
	import d3_clustergram

	#!! special case, encode extra released information for LDR 
	mat = LDR['mat']
	# get release data 
	rl = LDR['rl']
	print('\n\nchecking rl\n\n')

	# print(rl['t'])

	# initialize dict
	d3_json = d3_clustergram.ini_d3_json()

	# generate distance cutoffs 
	all_dist = []
	for i in range(11):
		all_dist.append(float(i)/10)

	#!! generate tmp classes 
	import random
	random.seed(122341)

	# append row dicts to array 
	for i in range(len(nodes['row'])):
		inst_dict = {}
		inst_dict['name'] = nodes['row'][i]
		inst_dict['clust'] = clust_order['clust']['row'].index(i)
		# do not need to get index
		inst_dict['rank'] = clust_order['rank']['row'][i]

		# # save group 
		# inst_dict['group'] = []
		# for inst_dist in all_dist:
		# 	inst_dict['group'].append( float(clust_order['group']['row'][inst_dist][i]) )

		# # save value for bar 
		# inst_dict['value'] = random.random()

		# # add class information 
		# inst_dict['class'] = row_class[nodes['row'][i]]

		# append dictionary 
		d3_json['row_nodes'].append(inst_dict)
				

	# append col dicts to array 
	for i in range(len(nodes['col'])):
		inst_dict = {}
		inst_dict['name'] = nodes['col'][i]
		inst_dict['clust'] = clust_order['clust']['col'].index(i)
		# do not need to get index
		inst_dict['rank'] = clust_order['rank']['col'][i]
		
		# # save group data for different cutoffs
		# inst_dict['group'] = []
		# for inst_dist in all_dist:
		# 	inst_dict['group'].append( float(clust_order['group']['col'][inst_dist][i]) )

		# # save value for bar 
		# inst_dict['value'] = random.random()

		# # add class information 
		# inst_dict['class'] = col_class[nodes['col'][i]]

		# append dictionary 
		d3_json['col_nodes'].append(inst_dict)

	# links - generate edge list 
	for i in range(len(nodes['row'])):
		for j in range(len(nodes['col'])):
			if abs(mat[i,j]) > 0:
				inst_dict = {}
				inst_dict['source'] = i
				inst_dict['target'] = j
				inst_dict['value'] = mat[i,j]
				# !! custom change for LDRgram
				inst_dict['value_up'] = rl['t'][i,j]
				inst_dict['value_dn'] = -rl['f'][i,j]

				d3_json['links'].append( inst_dict )

	# write json 
	##############
	json_scripts.save_to_json(d3_json, full_path, 'indent')

def make_network_json_single_value(nodes, clust_order, mat ):
	import json
	import d3_clustergram

	# initialize dict
	d3_json = d3_clustergram.ini_d3_json()

	# append row dicts to array 
	for i in range(len(nodes['row'])):
		inst_dict = {}
		inst_dict['name'] = nodes['row'][i]
		inst_dict['sort'] = clust_order['row'].index(i)
		d3_json['row_nodes'].append(inst_dict)

	# append col dicts to array 
	for i in range(len(nodes['col'])):
		inst_dict = {}
		inst_dict['name'] = nodes['col'][i]
		inst_dict['sort'] = clust_order['col'].index(i)
		d3_json['col_nodes'].append(inst_dict)

	# links - generate edge list 
	for i in range(len(nodes['row'])):
		for j in range(len(nodes['col'])):
			inst_dict = {}
			inst_dict['source'] = i
			inst_dict['target'] = j
			inst_dict['value'] = mat[i,j]
			d3_json['links'].append( inst_dict )

	# return the json 
	return d3_json 

# cluster rows and columns
def cluster_row_and_column( nodes, data_mat, dist_type, compare_cutoff, min_num_compare ):
	# import find_dict_in_list
	import scipy
	import scipy.cluster.hierarchy as hier
	import numpy as np 
	from operator import itemgetter

	num_row = len(nodes['row'])
	num_col = len(nodes['col'])

	########################
	# cluster 
	########################

	# Generate Row and Column Distance Matrices 
	############################################
	# initialize distance matrices 
	row_dm = scipy.zeros([num_row, num_row])
	col_dm = scipy.zeros([num_col, num_col])

	# print('making distance matrices')

	# row dist_mat
	for i in range(num_row):
		for j in range(num_row):

			# replace with calc_thresh_cos_dist 
			inst_dist = calc_thresh_cos_dist('dist', data_mat[i,:], data_mat[j,:], compare_cutoff, min_num_compare )

			# save the distance in the row distance matrix 
			row_dm[i,j] = inst_dist 

	# col dist_mat 
	for i in range(num_col):
		for j in range(num_col):

			# replace with calc_thresh_cos_dist 
			inst_dist = calc_thresh_cos_dist('dist', data_mat[:,i], data_mat[:,j], compare_cutoff, min_num_compare )

			# save the distance in the col distance matrix 
			col_dm[i,j] = inst_dist 

	# initialize index
	clust_order = {}
	clust_order['clust'] = {}
	clust_order['rank'] = {}
	clust_order['group'] = {}

	# Cluster Rows
	###############
	cluster_method = 'centroid'
	# calculate linkage 
	Y = hier.linkage( row_dm, method=cluster_method)
	# getting error at dendrogram 
	Z = hier.dendrogram( Y, no_plot=True  )
	# get ordering
	clust_order['clust']['row'] = Z['leaves']

	# generate distance cutoffs 
	all_dist = []
	for i in range(11):
		all_dist.append(float(i)/10)

	# initialize dictionary of lists 
	clust_order['group']['row'] = {}
	for inst_dist in all_dist:
		clust_order['group']['row'][inst_dist] = hier.fcluster(Y, inst_dist*row_dm.max(), 'inconsistent')

	# Cluster Columns 
	##################
	# calculate linkage 
	# print('clustering columns')
	Y = hier.linkage( col_dm, method=cluster_method)
	Z = hier.dendrogram( Y, no_plot=True )
	# get ordering
	clust_order['clust']['col'] = Z['leaves']

	# initialize dictionary of lists 
	clust_order['group']['col'] = {}


	for inst_dist in all_dist:
		clust_order['group']['col'][inst_dist] = hier.fcluster(Y, inst_dist*col_dm.max(), 'inconsistent')

	########################
	# rank 
	########################

	# rank rows by number 
	#######################################################
	# rank rows by numer 
	# loop through genes 
	sum_term = []
	for i in range(len(nodes['row'])):
		
		# initialize dict 
		inst_dict = {}

		# get the name of the gene 
		inst_dict['name'] = nodes['row'][i] 

		# sum the number of terms that the gene is found in 
		inst_dict['num_term'] = np.sum(data_mat[i,:]) 

		# add this to the list of dicts
		sum_term.append(inst_dict)

	# sort the dictionary by the number of terms 
	sum_term = sorted(sum_term, key=itemgetter('num_term'), reverse=False)
	# print('row')
	# print(sum_term)
	
	# get list of sorted genes 
	tmp_sort_genes = []
	for inst_dict in sum_term:
		tmp_sort_genes.append(inst_dict['name']) 

	# print('tmp_sort_genes')
	# print(tmp_sort_genes)

	# get the sorted index 
	sort_index = []
	for inst_gene in nodes['row']:
		sort_index.append( tmp_sort_genes.index(inst_gene) )

	# save the sorted indexes 
	clust_order['rank']['row'] = sort_index

	# rank cols by number 
	#######################################################
	# loop through cols 
	sum_term = []
	for i in range(len(nodes['col'])):
		
		# initialize dict 
		inst_dict = {}

		# get the name of the gene 
		inst_dict['name'] = nodes['col'][i] 

		# sum the number of terms that the gene is found in 
		inst_dict['num_term'] = np.sum(data_mat[:,i]) 

		# add this to the list of dicts
		sum_term.append(inst_dict)

	# sort the dictionary by the number of terms 
	sum_term = sorted(sum_term, key=itemgetter('num_term'), reverse=False)
	
	# print('col')
	# print(sum_term)

	# get list of sorted genes 
	tmp_sort_genes = []
	for inst_dict in sum_term:
		tmp_sort_genes.append(inst_dict['name']) 

	# print(tmp_sort_genes)

	# get the sorted index 
	sort_index = []
	for inst_gene in nodes['col']:
		sort_index.append( tmp_sort_genes.index(inst_gene) )

	# save the sorted indexes 
	clust_order['rank']['col'] = sort_index	

	# print('\n')

	# print(clust_order)

	# return clustering orders: clust and rank 
	return clust_order

# initialize d3 json 
def ini_d3_json():

	# initialize dict
	d3_json = {}
	# row_nodes
	d3_json['row_nodes'] = []
	# col_nodes
	d3_json['col_nodes'] = []
	# set links
	d3_json['links'] = []


	return d3_json

# generate data mat from node lists and ccle dict
def generate_data_mat_array( nodes, primary_data, row_name, col_name, data_name ):
	import scipy

	# initialize data_mat 
	data_mat = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])

	# loop through rows
	for i in range(len(nodes['row'])):
		# loop through cols
		for j in range(len(nodes['col'])):

			# get inst_row and inst_col
			inst_row = nodes['row'][i]
			inst_col = nodes['col'][j]

			# find gene and cl index in zscored data 
			index_x = primary_data[row_name].index(inst_row)
			index_y = primary_data[col_name].index(inst_col)

			# map primary data to data_mat
			data_mat[i,j] = primary_data[data_name][ index_x, index_y ]

	# return data matrix 
	return data_mat 

def generate_sim_mat_array( nodes, primary_data, row_name, col_name, data_name, num_comp, zscore_cutoff, sim_cutoff, min_meet_thresh ):
	import scipy

	# initialize sim_mat
	sim_mat = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])

	# loop through the rows
	for i in range(len(nodes['row'])):
		# loop through the cols 
		for j in range(len(nodes['col'])):

			# get the inst_gene_row and inst_gene_col names
			inst_gene_row = nodes['row'][i]
			inst_gene_col = nodes['col'][j]

			# find the index of the data in ccle zscored data 
			index_row = primary_data[row_name].index(inst_gene_row)
			index_col = primary_data[col_name].index(inst_gene_col)

			# get expression vector for inst_gene_row, i, and inst_gene_col, j
			vect_row = primary_data[data_name][index_row,:]
			vect_col = primary_data[data_name][index_col,:]

			# calculate threshold version of cosine distance 
			inst_dist = calc_thresh_cos_dist('sim', vect_row, vect_col, zscore_cutoff, num_comp)

			# save the similarity in the sim_mat
			sim_mat[i,j] = inst_dist

	# filter sim_mat - remove rows and columns that have all zeros 
	# set the sim_cutoff to 0.5, only include similarity values that
	# have an absolute value greater than 0.5 
	sim_mat, nodes = filter_sim_mat(sim_mat, nodes, sim_cutoff, min_meet_thresh)

	# # apply second filtering
	# min_meeet_thresh = 5
	# sim_mat, nodes = filter_sim_mat(sim_mat, nodes, sim_cutoff, min_meeet_thresh)

	# return similarity matrix 
	return sim_mat, nodes

def calc_thresh_cos_dist(simdist, vect_row, vect_col, zscore_cutoff, num_comp):
	import scipy.spatial
	# apply threshold of for zscore cutoff 
	vect_row, vect_col = threshold_vect_comparison(vect_row, vect_col, zscore_cutoff)

	# only calculate distance if there are three or more comparisons
	if len(vect_row) >= num_comp:
		# measure the cosine similarity between the vectors
		# the similarity is 1 minus the distance
		# a distance of 0 gives a similarity of 1
		# a distance of 1 gives a similarity of 0
		# a distance of 2 gives a similarity of -1
		if simdist == 'sim':
			inst_dist = 1 - scipy.spatial.distance.cosine(vect_row, vect_col)
		else:
			# keep as distance 
			inst_dist = scipy.spatial.distance.cosine(vect_row, vect_col)
	else:
		inst_dist = 0
	
	return inst_dist

def cherrypick_mat_from_nodes(nodes_uf, nodes, mat_uf):
	import scipy 

	# cherrypick data from sim_mat_uf 
	##################################
	# initialize mat with filtered nodes 
	mat = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])

	# loop through the rows
	for i in range(len(nodes['row'])):
		inst_row = nodes['row'][i]
		# loop through the cols
		for j in range(len(nodes['col'])):
			inst_col = nodes['col'][j]

			# get row and col index
			pick_row = nodes_uf['row'].index(inst_row)
			pick_col = nodes_uf['col'].index(inst_col)

			# cherrypick 
			###############
			mat[i,j] = mat_uf[pick_row, pick_col]

	return mat 

def filter_sim_mat(sim_mat_uf, nodes_uf, sim_cutoff, min_meet_thresh):
	import scipy
	import numpy as np
	print('filtering sim_mat')

	# rename unfiltered 
	sim_mat = sim_mat_uf

	# # rename unfiltered
	# nodes = nodes_uf

	# initialize nodes 
	nodes = {}
	nodes['row'] = []
	nodes['col'] = []

	# add rows with non-zero values 
	#################################
	for i in range(len(nodes_uf['row'])):
		# get row name 
		inst_row = nodes_uf['row'][i]
		# get row vect 
		row_vect = np.absolute(sim_mat_uf[i,:])
		# check if there are nonzero values 
		found_tuple = np.where(row_vect >= sim_cutoff)
		if len(found_tuple[0])>=min_meet_thresh:
			# add name 
			nodes['row'].append(inst_row)
		# else:
		# 	print('eliminated row')

	# add cols with non-zero values 
	#################################
	for i in range(len(nodes_uf['col'])):
		# get col name
		inst_col = nodes_uf['col'][i]
		# get col vect 
		col_vect = np.absolute(sim_mat_uf[:,i])
		# check if there are nonzero values
		found_tuple = np.where(col_vect >= sim_cutoff)
		if len(found_tuple[0])>=min_meet_thresh:
			# add name
			nodes['col'].append(inst_col)
		# else:
		# 	print('eliminated col')

	# cherrypick data from sim_mat_uf 
	##################################
	# initialize sim_mat 
	sim_mat = scipy.zeros([ len(nodes['row']), len(nodes['col']) ])

	# loop through the rows
	for i in range(len(nodes['row'])):
		inst_row = nodes['row'][i]
		# loop through the cols
		for j in range(len(nodes['col'])):
			inst_col = nodes['col'][j]

			# get row and col index
			pick_row = nodes_uf['row'].index(inst_row)
			pick_col = nodes_uf['col'].index(inst_col)

			# cherrypick 
			###############
			sim_mat[i,j] = sim_mat_uf[pick_row, pick_col]

	return sim_mat, nodes

def threshold_vect_comparison(x, y, cutoff):
	import numpy as np 

	# x vector 
	############
	# take absolute value of x
	x_abs = np.absolute(x)
	# this returns a tuple 
	found_tuple = np.where(x_abs >= cutoff)
	# get index array 
	found_index_x = found_tuple[0]

	# y vector 
	############
	# take absolute value of y
	y_abs = np.absolute(y)
	# this returns a tuple 
	found_tuple = np.where(y_abs >= cutoff)
	# get index array 
	found_index_y = found_tuple[0]

	# get common intersection 
	found_common = np.intersect1d(found_index_x, found_index_y)

	# apply cutoff 
	thresh_x = x[found_common]
	thresh_y = y[found_common]

	# return the threshold data 
	return thresh_x, thresh_y

# convert enrichment results from dict format to array format 
def convert_enr_dict_to_array(enr, pval_cutoff):
	import scipy
	# import find_dict_in_list
	import numpy as np

	# enr - data structure 
		# cell lines 
			# up_genes, dn_genes
				# name, pval, pval_bon, pva_bh, int_genes 

	# the columns are the cell lines 
	all_col = sorted(enr.keys())

	# the rows are the enriched terms 
	all_row = []

	# gather all genes with significantly enriched pval_bh 
	#######################################################
	updn = ['up_genes','dn_genes']
	# loop through cell lines 
	for inst_cl in enr:
		# loop through up/dn genes 
		for inst_updn in updn:

			# get inst_enr: the enrichment results from a cell line in either up/dn
			inst_enr = enr[inst_cl][inst_updn]

			# loop through enriched terms 
			for i in range(len(inst_enr)):

				# # append name if pval is significant 
				# if inst_enr[i]['pval_bh'] <= pval_cutoff:

				# append name to all terms 
				all_row.append(inst_enr[i]['name'])

	# get unique terms, sort them
	all_row = sorted(list(set(all_row)))

	# save row and column data to nodes 
	nodes = {}
	nodes['row'] = all_row
	nodes['col'] = all_col

	# gather data into matrix 
	#############################
	# initialize data_mat
	data_mat = {}
	data_mat['merge'] = scipy.zeros([ len(all_row), len(all_col) ])
	data_mat['up']    = scipy.zeros([ len(all_row), len(all_col) ])
	data_mat['dn']    = scipy.zeros([ len(all_row), len(all_col) ])	

	# loop through the rows (genes)
	for i in range(len(all_row)):
		
		# get inst row: gene 
		inst_gene = all_row[i]

		# loop through the columns (cell lines)
		for j in range(len(all_col)):

			# get inst col: cell line 
			inst_cl = all_col[j]

			# initialize pval_nl negative log up/dn
			pval_nl = {}

			# get enrichment from up/dn genes
			for inst_updn in updn:

				# initialize pval_nl[inst_updn] = np.nan
				pval_nl[inst_updn] = np.nan

				# gather the current set of enrichment results
				# from the cell line 
				inst_enr = enr[inst_cl][inst_updn]

				# check if gene is in list of enriched results 
				if any(d['name'] == inst_gene for d in inst_enr):

					# get the dict from the list
					inst_dict = find_dict_in_list( inst_enr, 'name', inst_gene)
					
					# only include significant pvalues
					if inst_dict['pval_bh'] <= 0.05:

						# retrieve the negative log pval_
						pval_nl[inst_updn] = -np.log2( inst_dict['pval_bh'] )

					else:
						# set nan pval
						pval_nl[inst_updn] = np.nan

			# set value for data_mat 
			###########################
			# now that the enrichment results have been gathered
			# for up/dn genes save the results 

			# there is both up and down enrichment 
			if np.isnan(pval_nl['up_genes']) == False and np.isnan(pval_nl['dn_genes']) == False:
				
				# set value of data_mat['merge'] as the mean of up/dn enrichment 
				data_mat['merge'][i,j] = np.mean([ pval_nl['up_genes'], -pval_nl['dn_genes'] ])

				# set values of up/dn
				data_mat['up'][i,j] =  pval_nl['up_genes']
				data_mat['dn'][i,j] = -pval_nl['dn_genes']

			# there is only up enrichment 
			elif np.isnan(pval_nl['up_genes']) == False:
				# set value of data_mat as up enrichment 
				data_mat['merge'][i,j] = pval_nl['up_genes'] 
				data_mat['up'   ][i,j] = pval_nl['up_genes']

			# there is only dn enrichment
			elif np.isnan(pval_nl['dn_genes']) == False:
				# set value of data_mat as the mean of up/dn enrichment 
				data_mat['merge'][i,j] = -pval_nl['dn_genes']
				data_mat['dn'   ][i,j] = -pval_nl['dn_genes']


	# return nodes, and data_mat 
	return nodes, data_mat

# convert enr array into gene rows and term columns 
def convert_enr_to_nodes_mat(enr):
	import scipy
	# import find_dict_in_list
	import numpy as np

	# enr - data structure 
		# name, pval, pval_bon, pva_bh, int_genes 

	# gather all enriched terms 
	all_col = []
	for i in range(len(enr)):
		all_col.append(enr[i]['name'])

	# the rows are the input genes 
	all_row = []

	# gather terms significantly enriched terms 
	############################################# 
	# loop through the enriched terms 
	for i in range(len(enr)):

		# load inst_enr dict from the list of dicts, enr
		inst_enr = enr[i]

		# extend genes to all_row
		all_row.extend( inst_enr['int_genes'] )

	# get unique terms, sort them
	all_row = sorted(list(set(all_row)))

	# print( 'there are ' + str(len(all_row)) + ' input genes ')

	# save row and column data to nodes 
	nodes = {}
	nodes['row'] = all_row
	nodes['col'] = all_col

	# gather data into matrix 
	#############################
	# initialize data_mat
	data_mat = scipy.zeros([ len(all_row), len(all_col) ])

	# loop through the enriched terms (columns) and fill in data_mat 
	for inst_col in all_col:

		# get col index
		j = all_col.index(inst_col)

		# get the enrichment dict 
		inst_enr = find_dict_in_list( enr, 'name', inst_col )

		# grab the intersecting genes 
		inst_gene_list = inst_enr['int_genes']

		# loop through the intersecting genes 
		for inst_gene in inst_gene_list:

			# get the row index 
			i = all_row.index(inst_gene)

			# fill in 1 for the position i,j in data_mat 
			data_mat[i,j] = 1 

	# return nodes, and data_mat 
	return nodes, data_mat

# combine enrichment and expression data 
def combine_enr_exp(nodes, data_mat):
	import scipy
	import numpy as np


	# exp
	#	nodes: col, row 
	# data_mat: array

	# enr
	#	nodes: col, row 
	# data_mat: up, dn, merge

	# keep intersecting rows (genes)
	row_intersect = list(set(nodes['exp']['row']).intersection(nodes['enr']['row']))

	# make new_nodes 
	new_nodes = {}
	new_nodes['row'] = row_intersect
	new_nodes['col'] = nodes['exp']['col']

	# collect data_mats from exp and enr 
	tmp_mat = {}
	tmp_mat['exp']       = data_mat['exp']
	tmp_mat['enr_up']    = data_mat['enr']['up']
	tmp_mat['enr_dn']    = data_mat['enr']['dn']
	tmp_mat['enr_merge'] = data_mat['enr']['merge']
	
	# initialize array 
	new_mat = {}
	for inst_mat in tmp_mat:
		new_mat[inst_mat] = scipy.zeros([ 1, len(nodes['exp']['col']) ])

	# collect the data from the different data mats 
	for inst_mat in tmp_mat:
		# loop through the intersecting rows 
		for inst_row_name in row_intersect:

			# get index 
			if inst_mat == 'exp':
				index_x = nodes['exp']['row'].index(inst_row_name)
			else: 
				index_x = nodes['enr']['row'].index(inst_row_name)

			# get row and col indexes 
			inst_row_data = tmp_mat[inst_mat][index_x,:]

			# fill in row data
			if new_mat[inst_mat].shape[0] == 1:
				new_mat[inst_mat] = inst_row_data
			else:
				new_mat[inst_mat] = np.vstack([ new_mat[inst_mat], inst_row_data])

	return new_nodes, new_mat

# find a dict in a list of dicts by searching for a value 
def find_dict_in_list(list_dict, search_value, search_string):

	# get all the possible values of search_value
	all_values = [d[search_value] for d in list_dict]

	# check if the search value is in the keys 
	if search_string in all_values:
		# find the dict 
		found_dict = (item for item in list_dict if item[search_value] == search_string).next()
	else:
		found_dict = {}

	# return the found dictionary
	return found_dict
		