def run_norm(net, df=None, axis='row', keep_orig=False):
  ''' 
  A dataframe (more accurately a dictionary of dataframes, e.g. mat, 
  mat_up...) can be passed to run_norm and a normalization will be run (
  e.g. zscore) on either the rows or columns 
  '''

  if df is None:
    df = net.dat_to_df()

  df = zscore_df(df, axis)

  net.df_to_dat(df)

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

  tmp_row_sum = df_z['mat'].sum(axis=1)
  tmp_col_sum = df_z['mat'].sum(axis=0)

  return df_z



