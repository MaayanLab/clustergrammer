def main(df):
  '''
  1) check that rows are strings (in case of numerical names)
  2) check for tuples, and in that case load tuples to categories
  '''
  import numpy as np
  from ast import literal_eval as make_tuple

  test = {}
  test['row'] = df['mat'].index.tolist()
  test['col'] = df['mat'].columns.tolist()

  # if type( test_row ) is not str and type( test_row ) is not tuple:

  found_tuple = {}
  found_number = {}
  for inst_rc in ['row','col']:

    inst_name = test[inst_rc][0]

    found_tuple[inst_rc] = False
    found_number[inst_rc] = False

    if type(inst_name) != tuple:

      if type(inst_name) is int or type(inst_name) is float or type(inst_name) is np.int64:
        found_number[inst_rc] = True

      else:
        check_open = inst_name[0]
        check_comma = inst_name.find(',')
        check_close = inst_name[-1]

        if check_open == '(' and check_close == ')' and check_comma > 0 \
          and check_comma < len(inst_name):
          found_tuple[inst_rc] = True

  # convert to tuple if necessary
  #################################################
  if found_tuple['row']:
    row_names = df['mat'].index.tolist()
    row_names = [make_tuple(x) for x in row_names]
    df['mat'].index = row_names

  if found_tuple['col']:
    col_names = df['mat'].columns.tolist()
    col_names = [make_tuple(x) for x in col_names]
    df['mat'].columns = col_names

  # convert numbers to string if necessary
  #################################################
  if found_number['row']:
    row_names = df['mat'].index.tolist()
    row_names = [str(x) for x in row_names]
    df['mat'].index = row_names

  if found_number['col']:
    col_names = df['mat'].columns.tolist()
    col_names = [str(x) for x in col_names]
    df['mat'].columns = col_names

  return df