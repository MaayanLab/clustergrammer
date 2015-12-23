def main():

  import time
  start_time = time.time()
  import pandas as pd

  # import network class from Network.py
  from clustergrammer import Network

  net = Network()

  # load data to dataframe 
  net.load_tsv_to_net('txt/mat_1mb.txt')

  # perform fast row filtering 
  net.fast_mult_views()

  net.write_json_to_file('viz', 'json/mult_view_fast.json', 'indent')

  # your code
  elapsed_time = time.time() - start_time

  print('\n\n\nelapsed time')
  print(elapsed_time)

  # print(df)

  # print('\n\nafter filtering')

  # inst_cols = ['Col-1','Col-2']
  # df = df[inst_cols]

  # df = df.abs()

  # print(df)

  # inst_rows = ['CDK4','EGFR']
  # df = df.loc('EGFR')

  # print(df.shape[0])
  # print(df.shape[1])


  # net.fast_mult_views()

  # print(df)

  # print('filter rows')

  # # filter rows 
  # df = df[df.sum(axis=1) > 10]

  # # filter columns, first transpose 
  # df = df.transpose()

  # df = df[df.sum(axis=1) > 10]

  # df = df.transpose()

  # # load the data back to dat
  # net.df_to_dat(df)

  # print(net.dat)

  # net.make_mult_views(dist_type='cos',filter_row=['sum'])

  # net.write_json_to_file('viz', 'json/mult_view.json', 'indent')

main()