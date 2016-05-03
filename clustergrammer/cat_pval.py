import numpy as np 
import pandas as pd 
from copy import deepcopy

def main(net):
  ''' 
  calculate pvalue of category closeness 
  '''

  # calculate the distance between the data points within the same category and 
  # compare to null distribution 
  for inst_rc in ['row', 'col']:

    inst_nodes = deepcopy(net.dat['nodes'][inst_rc])

    inst_index = deepcopy(net.dat['node_info'][inst_rc]['clust'])

    # reorder based on clustered order 
    inst_nodes = [ inst_nodes[i] for i in inst_index]

    # make distance matrix dataframe 
    dm = dist_matrix_lattice(inst_nodes)


    node_infos = net.dat['node_info'][inst_rc].keys()

    all_cats = []
    for inst_info in node_infos:
      if 'dict_cat_' in inst_info:
        all_cats.append(inst_info)

    for cat_dict in all_cats:

      tmp_dict = net.dat['node_info'][inst_rc][cat_dict]

      pval_name = cat_dict.replace('dict_','pval_')
      net.dat['node_info'][inst_rc][pval_name] = {}
      
      for cat_name in tmp_dict:
        
        subset = tmp_dict[cat_name]

        inst_mean = calc_mean_dist_subset(dm, subset)

        hist = calc_hist_distances(dm, subset, inst_nodes)

        pval = 0

        for i in range(len(hist['prob'])):
          if i == 0:
            pval = hist['prob'][i]
          if i >= 1:
            if inst_mean >= hist['bins'][i]:
              pval = pval + hist['prob'][i]

        net.dat['node_info'][inst_rc][pval_name][cat_name] = pval

        # print(net.dat['node_info'][inst_rc].keys())


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
  
def calc_hist_distances(dm, subset, inst_nodes):
  np.random.seed(100)

  num_null = 1000
  num_points = len(subset)

  mean_dist = []
  for i in range(num_null):
    tmp = np.random.choice(inst_nodes, num_points, replace=False)
    mean_dist.append( np.mean(dm[tmp].ix[tmp].values)  )

  tmp_dist = sorted(deepcopy(mean_dist))
  # print('lowest distances')
  # print(tmp_dist[0:4])

  mean_dist = np.asarray(mean_dist)
  s1 = pd.Series(mean_dist)
  hist = np.histogram(s1, bins=30)

  H = {}
  H['prob'] = hist[0]/np.float(num_null)
  H['bins'] = hist[1]

  return H