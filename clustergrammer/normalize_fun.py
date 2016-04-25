def run_norm(net, df=None, norm_type='zscore', axis='row', keep_orig=False):
  ''' 
  A dataframe (more accurately a dictionary of dataframes, e.g. mat, 
  mat_up...) can be passed to run_norm and a normalization will be run (
  e.g. zscore) on either the rows or columns 
  '''

  if df is None:
    df = net.dat_to_df()

  if norm_type == 'zscore':
    df = zscore_df(df, axis)

  if norm_type == 'qn':
    df = qn_df(df, axis)

  net.df_to_dat(df)

def qn_df(df, axis='row'):
  '''
  do quantile normalization of a dataframe dictionary, does not write to net 
  '''
  import pandas as pd
  import numpy as np
  df_qn = {}

  for mat_type in df:
    inst_df = df[mat_type]

    missing_values = inst_df.isnull().values.any()

    # make mask of missing values 
    if missing_values:

      # get nan mask 
      missing_mask = pd.isnull(inst_df)

      # tmp fill in na with zero, will not affect qn 
      inst_df = inst_df.fillna(value=0)

    # calc common distribution 

    # swap in common distribution 
    # import pdb; pdb.set_trace()

    # swap back in missing values 
    if missing_values:
      inst_df = inst_df.mask(missing_mask, other=np.nan)

      
    # print('calc qn')
    
    df_qn[mat_type] = inst_df


  return df_qn


def zscore_df(df, axis='row'):
  '''  
  take the zscore of a dataframe dictionary, does not write to net (self)
  ''' 
  df_z = {}

  for mat_type in df: 
    inst_df = df[mat_type]

    if axis == 'row':
      inst_df = inst_df.transpose()

    df_z[mat_type] = (inst_df - inst_df.mean())/inst_df.std()

    if axis == 'row':
      df_z[mat_type] = df_z[mat_type].transpose()

  return df_z
