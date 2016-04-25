import pandas as pd
import numpy as np
from copy import deepcopy

def run_norm(net, df=None, norm_type='zscore', axis='row', keep_orig=False):
  ''' 
  A dataframe (more accurately a dictionary of dataframes, e.g. mat, 
  mat_up...) can be passed to run_norm and a normalization will be run (
  e.g. zscore) on either the rows or columns 
  '''

  if df is None:
    df = net.dat_to_df()

  if norm_type == 'zscore':
    df = zscore_df(df, axis, keep_orig)

  if norm_type == 'qn':
    df = qn_df(df, axis, keep_orig)

  net.df_to_dat(df)

def qn_df(df, axis='row', keep_orig=False):
  '''
  do quantile normalization of a dataframe dictionary, does not write to net 
  '''
  df_qn = {}

  for mat_type in df:
    inst_df = df[mat_type]

    # using transpose to do row qn
    if axis == 'row':
      inst_df = inst_df.transpose()

    missing_values = inst_df.isnull().values.any()

    # make mask of missing values 
    if missing_values:

      # get nan mask 
      missing_mask = pd.isnull(inst_df)

      # tmp fill in na with zero, will not affect qn 
      inst_df = inst_df.fillna(value=0)

    # calc common distribution 
    common_dist = calc_common_dist(inst_df)

    # swap in common distribution 
    inst_df = swap_in_common_dist(inst_df, common_dist)

    # swap back in missing values 
    if missing_values:
      inst_df = inst_df.mask(missing_mask, other=np.nan)

    # using transpose to do row qn
    if axis == 'row':
      inst_df = inst_df.transpose()

    df_qn[mat_type] = inst_df

  return df_qn

def swap_in_common_dist(df, common_dist):

  col_names = df.columns.tolist()

  qn_arr = np.array([])
  orig_rows = df.index.tolist()

  # loop through each column 
  for inst_col in col_names:

    # get the sorted list of row names for the given column 
    tmp_series = deepcopy(df[inst_col])
    tmp_series = tmp_series.sort_values(ascending=False)
    sorted_names = tmp_series.index.tolist()

    qn_vect = np.array([])
    for inst_row in orig_rows:
      inst_index = sorted_names.index(inst_row)
      inst_val = common_dist[inst_index]
      qn_vect = np.hstack((qn_vect, inst_val))

    if qn_arr.shape[0] == 0:
      qn_arr = qn_vect
    else:
      qn_arr = np.vstack((qn_arr, qn_vect))

  # transpose (because of vstacking)
  qn_arr = qn_arr.transpose()

  qn_df = pd.DataFrame(data=qn_arr, columns=col_names, index=orig_rows)

  return qn_df

def calc_common_dist(df):
  '''
  calculate a common distribution (for col qn only) that will be used to qn
  '''

  # axis is col 
  tmp_arr = np.array([])

  col_names = df.columns.tolist()

  for inst_col in col_names:

    # sort column 
    tmp_vect = df[inst_col].sort_values(ascending=False).values

    # stacking rows vertically (will transpose)
    if tmp_arr.shape[0] == 0:
      tmp_arr = tmp_vect
    else:
      tmp_arr = np.vstack((tmp_arr, tmp_vect))

  tmp_arr = tmp_arr.transpose()

  common_dist = tmp_arr.mean(axis=1)

  return common_dist

def zscore_df(df, axis='row', keep_orig=False):
  '''  
  take the zscore of a dataframe dictionary, does not write to net (self)
  ''' 
  df_z = {}

  for mat_type in df: 
    if keep_orig and mat_type == 'mat':
      mat_orig = deepcopy(df[mat_type])

    inst_df = df[mat_type]

    if axis == 'row':
      inst_df = inst_df.transpose()

    df_z[mat_type] = (inst_df - inst_df.mean())/inst_df.std()

    if axis == 'row':
      df_z[mat_type] = df_z[mat_type].transpose()

  if keep_orig:
    df_z['mat_orig'] = mat_orig

  return df_z
