def main():
  from clustergrammer import Network

  net = Network()

  gene_list = ['EGFR', 'TP53', 'SMARCA4', 'CLASP1']
  list_id = net.enrichr('post', gene_list)

  print(list_id)

  enr, response_list = net.enrichr('get', lib='ChEA_2015', list_id=list_id,
    max_terms=10)

  print(response_list)

main()