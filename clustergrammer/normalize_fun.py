def run_norm(net, df=None, axis='row'):
  ''' A dataframe (more accurately a dictionary of dataframes, e.g. mat, 
  mat_up...) can be passed to run_norm and a normalization will be run (
  e.g. zscore) on either the rows or columns '''

  if df is None:
    df = net.dat_to_df()

  print(df['mat'].shape)



