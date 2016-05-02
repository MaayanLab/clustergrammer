import numpy as np 
import pandas as pd 
from copy import deepcopy

def main(net):
  ''' 
  calculate pvalue of category closeness 
  '''

  # calculate the distance between the cols within the same category and compare
  # to null distribution 

  inst_cols = deepcopy(net.dat['nodes']['col'])

  inst_index = deepcopy(net.dat['node_info']['col']['clust'])
  # reorder based on clustered order 
  inst_cols = [ inst_cols[i] for i in inst_index]

  # make distance matrix dataframe 
  dm = dist_matrix_lattice(inst_cols)

  tmp_dict = net.dat['node_info']['col']['dict_cat_0']

  for inst_cat in tmp_dict:
    subset = tmp_dict[inst_cat]
    print(subset)
    inst_mean = calc_mean_dist_subset(dm, subset)
    print(inst_mean)

    hist = calc_hist_distances(dm, subset, inst_cols)
    print(hist['prob'])
    print(hist['bins'])
    print('\n\n')

def dist_matrix_lattice(names):  
  from scipy.spatial.distance import pdist, squareform

  lattice_size = len(names)
  mat = np.zeros([lattice_size, 1])
  mat[:,0] = range(lattice_size)

  inst_dm = pdist(mat, metric='euclidean')

  inst_dm[inst_dm < 0] = float(0)

  inst_dm = squareform(inst_dm)

  df = pd.DataFrame(data=inst_dm, columns=names, index=names)

  return df


def calc_mean_dist_subset(dm, subset):
  return np.mean(dm[subset].ix[subset].values)
  
def calc_hist_distances(dm, subset, inst_cols):
  np.random.seed(100)

  num_null = 1000
  num_points = len(subset)

  mean_dist = []
  for i in range(num_null):
    tmp = np.random.choice(inst_cols, num_points, replace=False)
    mean_dist.append( np.mean(dm[tmp].ix[tmp].values)  )

  tmp_dist = sorted(deepcopy(mean_dist))
  print('lowest distances')
  print(tmp_dist[0:4])

  mean_dist = np.asarray(mean_dist)
  s1 = pd.Series(mean_dist)
  hist = np.histogram(s1, bins=20)

  H = {}
  H['prob'] = hist[0]/np.float(num_null)
  H['bins'] = hist[1]

  return H