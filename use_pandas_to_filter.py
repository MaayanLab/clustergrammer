def main():

  import time
  start_time = time.time()
  import pandas as pd

  # import network class from Network.py
  from clustergrammer import Network

  net = Network()

  # load data to dataframe 
  net.load_tsv_to_net('txt/example_tsv_network.txt')

  # perform fast row filtering 
  net.fast_mult_views()

  net.write_json_to_file('viz', 'json/mult_view.json', 'indent')

  # your code
  elapsed_time = time.time() - start_time
  print('\n\n\nelapsed time: '+str(elapsed_time))


main()