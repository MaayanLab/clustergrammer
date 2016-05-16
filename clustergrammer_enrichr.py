def main():
  from clustergrammer import Network

  net = Network()

  net.enrichr()



# import enrichr_functions as enr_fun 

# gene_list = ['EGFR', 'TP53', 'SMARCA4', 'CLASP1']

# # list_id = enr_fun.enrichr_post_request(gene_list)

# list_id =  1163758

# print(list_id)

# enr_libs = ['ChEA_2015', 'KEA_2015', 'KEGG_2016']

# enr, response_list = enr_fun.enrichr_get_request(enr_libs[0], list_id, max_num_term=20)

# # print('enr object')
# # print(enr)
# # print('\n\n')
# # print('response_list')
# # print(response_list)

# net = enr_fun.enrichr_clust_from_response(response_list)

# print(net)

main()