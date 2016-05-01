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

def filter_N_top(inst_rc, df, N_top, rank_type='sum'):

  if inst_rc == 'col':
    for inst_type in df:
      df[inst_type] = df[inst_type].transpose()

  rows_sorted = get_sorted_rows(df['mat'], rank_type)

  keep_rows = rows_sorted[:N_top]

  df['mat'] = df['mat'].ix[keep_rows]
  if 'mat_up' in df:
    df['mat_up'] = df['mat_up'].ix[keep_rows]
    df['mat_dn'] = df['mat_dn'].ix[keep_rows]  

  if 'mat_orig' in df:
    df['mat_orig'] = df['mat_orig'].ix[keep_rows]

  if inst_rc == 'col':
    for inst_type in df:
      df[inst_type] = df[inst_type].transpose()

  return df

def filter_threshold(df, inst_rc, threshold, num_occur=1):
  ''' 
  Filter a network's rows or cols based on num_occur values being above a 
  threshold (in absolute_value) 
  ''' 
  from copy import deepcopy

  inst_df = deepcopy(df['mat'])

  if inst_rc == 'col':
    inst_df = inst_df.transpose()

  inst_df = inst_df.abs()

  ini_rows = inst_df.index.values.tolist()

  inst_df[inst_df < threshold] = 0  
  inst_df[inst_df >= threshold] = 1

  tmp_sum = inst_df.sum(axis=1)

  tmp_sum = tmp_sum[tmp_sum >= num_occur]

  keep_names = tmp_sum.index.values.tolist()

  if inst_rc == 'row':
    if len(keep_names) < len(ini_rows):
      df['mat'] = grab_df_subset(df['mat'], keep_rows=keep_names)

      if 'mat_up' in df:
        df['mat_up'] = grab_df_subset(df['mat_up'], keep_rows=keep_names)
        df['mat_dn'] = grab_df_subset(df['mat_dn'], keep_rows=keep_names)

      if 'mat_orig' in df:
        df['mat_orig'] = grab_df_subset(df['mat_orig'], keep_rows=keep_names)  

  elif inst_rc == 'col':
    inst_df = inst_df.transpose()

    inst_rows = inst_df.index.values.tolist()
    inst_cols = keep_names

    df['mat'] = grab_df_subset(df['mat'], inst_rows, inst_cols)

    if 'mat_up' in df:
      df['mat_up'] = grab_df_subset(df['mat_up'], inst_rows, inst_cols)
      df['mat_dn'] = grab_df_subset(df['mat_dn'], inst_rows, inst_cols)

    if 'mat_orig' in df:
      df['mat_orig'] = grab_df_subset(df['mat_orig'], inst_rows, inst_cols)

  return df