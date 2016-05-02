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

  dm = dist_matrix_lattice(inst_cols)

  tmp_dict = net.dat['node_info']['col']['dict_cat_0']

  print(dm)

  for inst_cat in tmp_dict:
    print(tmp_dict[inst_cat])

    # calc_mean_dist_subset(dm, )

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


def calc_mean_dist_subset(df, subset):
  pass
  
