def load_file(net, filename):
  import StringIO
  f = open(filename, 'r')
  buff = StringIO.StringIO(f.read())
  f.close()
  net.load_tsv_to_net(buff)

def load_tsv_to_net(net, file_buffer):
  import numpy as np
  import pandas as pd
  import categories
  from ast import literal_eval as make_tuple

  lines = file_buffer.getvalue().split('\n')
  num_labels = categories.check_categories(lines)

  row_arr = range(num_labels['row'])
  col_arr = range(num_labels['col'])
  tmp_df = {}

  # use header if there are col categories
  if len(col_arr) > 1:
    tmp_df['mat'] = pd.read_table(file_buffer, index_col=row_arr,
                                  header=col_arr)
  else:
    tmp_df['mat'] = pd.read_table(file_buffer, index_col=row_arr)

  # 1) check that rows are strings (in case of numerical names)
  # 2) check for tuples, and in that case load tuples to categories 
  test = {} 
  test['row'] = tmp_df['mat'].index.tolist()
  test['col'] = tmp_df['mat'].columns.tolist()

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
    row_names = tmp_df['mat'].index.tolist()
    row_names = [make_tuple(x) for x in row_names]
    tmp_df['mat'].index = row_names

  if found_tuple['col']:
    col_names = tmp_df['mat'].columns.tolist()
    col_names = [make_tuple(x) for x in col_names]
    tmp_df['mat'].columns = col_names

  # convert numbers to string if necessary 
  #################################################
  if found_number['row']:
    row_names = tmp_df['mat'].index.tolist()
    row_names = [str(x) for x in row_names]
    tmp_df['mat'].index = row_names

  if found_number['col']:
    col_names = tmp_df['mat'].columns.tolist()
    col_names = [str(x) for x in col_names]
    tmp_df['mat'].columns = col_names


  # # remove columns with all nans, occurs when there are trailing
  # # tabs on rows
  # tmp_df['mat'] = tmp_df['mat'].dropna(axis=1, how='all')

  net.df_to_dat(tmp_df)  

def load_json_to_dict(filename):
  import json
  f = open(filename, 'r')
  inst_dict = json.load(f)
  f.close()
  return inst_dict

def load_gmt(filename):
  f = open(filename, 'r')
  lines = f.readlines()
  f.close()
  gmt = {}
  for i in range(len(lines)):
    inst_line = lines[i].rstrip()
    inst_term = inst_line.split('\t')[0]
    inst_elems = inst_line.split('\t')[2:]
    gmt[inst_term] = inst_elems

  return gmt  

def load_data_to_net(net, inst_net):
  ''' load data into nodes and mat, also convert mat to numpy array'''
  import data_formats
  net.dat['nodes'] = inst_net['nodes']
  net.dat['mat'] = inst_net['mat']
  data_formats.mat_to_numpy_arr(net)