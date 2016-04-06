def main():

  make_mult_cat_tsv(rc_num=0, cc_num=1)

  # load_tsv()

  clustergrammer_load()

def clustergrammer_load():
  # import network class from Network.py
  from clustergrammer import Network

  net = Network()

  net.pandas_load_file('mat_cats.tsv')  

  net.make_clust(dist_type='cos',views=['N_row_sum','N_row_var'])

  net.write_json_to_file('viz','json/mult_cats.json','indent')  

  print('\n**********************')
  print(net.dat['node_info']['row'].keys())

  print('\n\n')

def load_tsv():
  import pandas as pd

  print('loading with pandas')

  filename = 'mat_cats.tsv'
  tmp = pd.read_table(filename, sep='\t', index_col=[0,1], skipinitialspace=True, na_values='NaN', keep_default_na=False, usecols=range(12), skip_blank_lines=True)

  # filename = 'mat_2cc_1rc.txt'
  # tmp = pd.read_table(filename, index_col=[0,1], header=[0,1])

  mat = tmp.values
  row_names = tmp.index.tolist()
  col_names = tmp.columns.tolist()

  print(mat)
  print('\nrow_names')
  print(row_names)
  print(len(row_names))
  print('\ncol names')
  print(col_names)
  print(len(col_names))

def make_mult_cat_tsv(rc_num=1, cc_num=1):
  print('make tsv file with '+str(rc_num)+' row and '+str(cc_num)+' col labels')

  tmp = range(30)

  fw = open('txt/mat_cats.tsv','w')

  num_tab = rc_num + 1
  
  # write name 
  #######################
  
  for inst_tab in range(num_tab):
    fw.write('\t')

  for inst_num in tmp:
    inst_name = 'cn_'+str(inst_num)+'\t'

    fw.write(inst_name)
  fw.write('\n')  

  # write categories 
  ######################
  for inst_cc in range(cc_num):
    # write tabs in front of categories 
    for inst_tab in range(num_tab):
      fw.write('\t')
    # write categories 
    for col in tmp:
      inst_cat = 'cc_'+str(inst_cc)+'_'+str(col)+'\t'
      fw.write(inst_cat)

    fw.write('\n')

  for i in tmp:
    inst_name = 'rn_'+str(i)

    inst_row = inst_name + '\t' 

    for inst_rc in range(rc_num):
      row_cat = 'rc_'+str(inst_rc)+'_'+str(i) + '\t'

      inst_row = inst_row + row_cat


    # fw.write(inst_name+'\t'+row_cat+'\t')
    fw.write(inst_row)

    for j in tmp:
      fw.write(str(j)+'\t')

    if int(i) < len(tmp)-1:
      fw.write('\n')

  fw.close()


main()