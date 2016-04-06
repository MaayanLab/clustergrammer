def load_file(net, filename):
  import StringIO
  f = open(filename, 'r')
  buff = StringIO.StringIO(f.read())
  f.close()
  net.load_tsv_to_net(buff)

def load_tsv_to_net(net, file_buffer):
  import pandas as pd

  lines = file_buffer.getvalue().split('\n')
  num_labels = net.check_categories(lines)

  row_arr = range(num_labels['row'])
  col_arr = range(num_labels['col'])
  tmp_df = {}

  # use header if there are col categories
  if len(col_arr) > 1:
    tmp_df['mat'] = pd.read_table(file_buffer, index_col=row_arr,
                                  header=col_arr)
  else:
    tmp_df['mat'] = pd.read_table(file_buffer, index_col=row_arr)

  # remove columns with all nans, occurs when there are trailing
  # tabs on rows
  tmp_df['mat'] = tmp_df['mat'].dropna(axis=1)

  net.df_to_dat(tmp_df)  