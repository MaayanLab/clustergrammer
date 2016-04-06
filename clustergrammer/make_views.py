def N_rows(df, rank_type):
  from copy import deepcopy

  keep_top = ['all', 500, 400, 300, 200, 100, 80, 60, 40, 20, 10]

  df_abs = deepcopy(df['mat'])
  df_abs = df_abs.transpose()

  if rank_type == 'sum':
    tmp_sum = df_abs.sum(axis=0)
  elif rank_type == 'var':
    tmp_sum = df_abs.var(axis=0)

  tmp_sum = tmp_sum.abs()
  tmp_sum.sort_values(inplace=True, ascending=False)
  rows_sorted = tmp_sum.index.values.tolist()

  return keep_top, rows_sorted