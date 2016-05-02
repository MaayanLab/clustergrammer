def main():
  from clustergrammer import Network

  net = Network()

  net.load_file('txt/rc_two_cats.txt')

  tmp_size = 50

  inst_dm = make_distance_matrix(net, tmp_size)

  randomly_sample_rows(net, inst_dm, tmp_size)

def randomly_sample_rows(net, inst_dm, tmp_size):
  import numpy as np
  import pandas as pd 
  from copy import deepcopy
  inst_rows = net.dat['nodes']['row']

  inst_rows = np.asarray(inst_rows[:tmp_size])

  df = pd.DataFrame(data=inst_dm)

  inst_rows = df.index.tolist()

  mean_dist = []

  num_null = 2000
  num_points = 10

  np.random.seed(100)
  for i in range(num_null):
    tmp = np.random.choice(inst_rows, num_points, replace=False)

    # print( df[tmp].ix[tmp] )
    # print('mean: \n------------')
    mean_dist.append( np.mean(df[tmp].ix[tmp].values) )
    # print('------------\n')

  tmp = sorted(list(set(deepcopy(mean_dist))))
  print(len(tmp))
  mean_dist = np.asarray(mean_dist)

  s1 = pd.Series(mean_dist)
  hist = np.histogram(s1, bins=20)

  print(hist[0]/np.float(num_null))
  print(hist[1])

  # count, division = np.histogramm(mea?n_dist)

  # print(count)


def make_distance_matrix(net, tmp_size):
  import numpy as np 

  mat = np.zeros([tmp_size,1])
  mat[:,0] = range(tmp_size)

  inst_rc = 'row'
  dist_type = 'euclidean'

  from scipy.spatial.distance import pdist, squareform
  import numpy as np
  if inst_rc == 'row':
    inst_dm = pdist(mat, metric=dist_type)
  elif inst_rc == 'col':
    inst_dm = pdist(mat.transpose(), metric=dist_type)

  inst_dm[inst_dm < 0] = float(0)

  inst_dm = squareform(inst_dm)

  tmp_mean = np.mean(inst_dm)
  return inst_dm

main()