def main():
  from clustergrammer import Network

  net = Network()

  net.load_file('txt/rc_two_cats.txt')

  # make_distance_matrix(net)

  randomly_sample_rows(net)

def randomly_sample_rows(net):
  import numpy as np
  inst_rows = net.dat['nodes']['row']

  # print(inst_rows)

  inst_rows = np.asarray(inst_rows[:10])

  np.random.seed(100)
  for i in range(10):
    tmp = np.random.choice(inst_rows, 3)
    print(tmp)

def make_distance_matrix(net):
  import numpy as np 
  inst_cols = net.dat['nodes']['col']

  # mat = np.asarray(range(len(inst_cols)))

  mat = net.dat['mat']

  # mat = mat[0:10, 0:1]
  # print(mat)
  # print('\n')
  # print(mat.shape)

  mat = np.zeros([10,1])
  mat[:,0] = range(10)

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

  print(inst_dm.shape)
  print(inst_dm)
  tmp_mean = np.mean(inst_dm)
  print(inst_dm.shape)
  print(tmp_mean)


main()