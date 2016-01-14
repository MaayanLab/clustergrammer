def main():

  import time
  start_time = time.time()
  import pandas as pd
  import StringIO

  # import network class from Network.py
  from clustergrammer import Network

  net = Network()

  # load data to dataframe 
  # net.load_tsv_to_net('txt/example_tsv_network.txt')
  # net.load_tsv_to_net('txt/mat_1mb.txt')

  file_buffer = open('txt/col_categories.txt')
  # file_buffer = open('txt/example_tsv_network.txt')
  buff = StringIO.StringIO( file_buffer.read() )
  net.pandas_load_tsv_to_net(buff)

  # filter rows 
  net.make_filtered_views(views=['filter_row_sum','N_row_sum'], calc_col_cats=True)
  net.write_json_to_file('viz', 'json/mult_view.json', 'no-indent')

  elapsed_time = time.time() - start_time
  print('\n\n\nelapsed time: '+str(elapsed_time))


main()