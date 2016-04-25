def df_filter_row_sum(df, threshold, take_abs=True):
  ''' filter rows in matrix at some threshold
  and remove columns that have a sum below this threshold '''

  from copy import deepcopy
  from __init__ import Network
  net = Network()

  if take_abs is True:
    df_copy = deepcopy(df['mat'].abs())
  else:
    df_copy = deepcopy(df['mat'])

  ini_rows = df_copy.index.values.tolist()
  df_copy = df_copy.transpose()
  tmp_sum = df_copy.sum(axis=0)
  tmp_sum = tmp_sum.abs()
  tmp_sum.sort_values(inplace=True, ascending=False)

  tmp_sum = tmp_sum[tmp_sum > threshold]
  keep_rows = sorted(tmp_sum.index.values.tolist())

  if len(keep_rows) < len(ini_rows):
    df['mat'] = grab_df_subset(df['mat'], keep_rows=keep_rows)

    if 'mat_up' in df:
      df['mat_up'] = grab_df_subset(df['mat_up'], keep_rows=keep_rows)
      df['mat_dn'] = grab_df_subset(df['mat_dn'], keep_rows=keep_rows)

    if 'mat_orig' in df:
      df['mat_orig'] = grab_df_subset(df['mat_orig'], keep_rows=keep_rows)

  return df

def df_filter_col_sum(df, threshold, take_abs=True):
  ''' filter columns in matrix at some threshold
  and remove rows that have all zero values '''

  from copy import deepcopy
  from __init__ import Network
  net = Network()

  if take_abs is True:
    df_copy = deepcopy(df['mat'].abs())
  else:
    df_copy = deepcopy(df['mat'])

  df_copy = df_copy.transpose()
  df_copy = df_copy[df_copy.sum(axis=1) > threshold]
  df_copy = df_copy.transpose()
  df_copy = df_copy[df_copy.sum(axis=1) > 0]

  if take_abs is True:
    inst_rows = df_copy.index.tolist()
    inst_cols = df_copy.columns.tolist()
    df['mat'] = grab_df_subset(df['mat'], inst_rows, inst_cols)

    if 'mat_up' in df:
      df['mat_up'] = grab_df_subset(df['mat_up'], inst_rows, inst_cols)
      df['mat_dn'] = grab_df_subset(df['mat_dn'], inst_rows, inst_cols)

    if 'mat_orig' in df:
      df['mat_orig'] = grab_df_subset(df['mat_orig'], inst_rows, inst_cols)

  else:
    df['mat'] = df_copy

  return df

def grab_df_subset(df, keep_rows='all', keep_cols='all'):
  if keep_cols != 'all':
    df = df[keep_cols]
  if keep_rows != 'all':
    df = df.ix[keep_rows]
  return df  

def get_sorted_rows(df, rank_type='sum'):
  from copy import deepcopy

  inst_df = deepcopy(df)
  inst_df = inst_df.transpose()

  if rank_type == 'sum':
    tmp_sum = inst_df.sum(axis=0)
  elif rank_type == 'var':
    tmp_sum = inst_df.var(axis=0)

  tmp_sum = tmp_sum.abs()
  tmp_sum.sort_values(inplace=True, ascending=False)
  rows_sorted = tmp_sum.index.values.tolist()  

  return rows_sorted

def filter_N_top(df, N_top, rank_type='sum'):

  rows_sorted = get_sorted_rows(df['mat'], rank_type)

  keep_rows = rows_sorted[:N_top]

  df['mat'] = df['mat'].ix[keep_rows]
  if 'mat_up' in df:
    df['mat_up'] = df['mat_up'].ix[keep_rows]
    df['mat_dn'] = df['mat_dn'].ix[keep_rows]  

  if 'mat_orig' in df:
    df['mat_orig'] = df['mat_orig'].ix[keep_rows]

  return df

