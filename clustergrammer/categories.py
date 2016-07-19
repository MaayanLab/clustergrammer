def check_categories(lines):
  '''
  find out how many row and col categories are available
  '''
  # count the number of row categories
  rcat_line = lines[0].split('\t')

  # calc the number of row names and categories
  num_rc = 0
  found_end = False

  # skip first tab
  for inst_string in rcat_line[1:]:
    if inst_string == '':
      if found_end is False:
        num_rc = num_rc + 1
    else:
      found_end = True

  max_rcat = 15
  if max_rcat > len(lines):
    max_rcat = len(lines) - 1

  num_cc = 0
  for i in range(max_rcat):
    ccat_line = lines[i + 1].split('\t')

    # make sure that line has length greater than one to prevent false cats from
    # trailing new lines at end of matrix
    if ccat_line[0] == '' and len(ccat_line) > 1:
      num_cc = num_cc + 1

  num_labels = {}
  num_labels['row'] = num_rc + 1
  num_labels['col'] = num_cc + 1

  return num_labels

def dict_cat(net):
  '''
  make a dictionary of node-category associations
  '''
  for inst_rc in ['row', 'col']:
    inst_keys = net.dat['node_info'][inst_rc].keys()
    all_cats = [x for x in inst_keys if 'cat-' in x]

    for inst_name_cat in all_cats:
      dict_cat = {}
      tmp_cats = net.dat['node_info'][inst_rc][inst_name_cat]
      tmp_nodes = net.dat['nodes'][inst_rc]

      for i in range(len(tmp_cats)):
        inst_cat = tmp_cats[i]
        inst_node = tmp_nodes[i]

        if inst_cat not in dict_cat:
          dict_cat[inst_cat] = []

        dict_cat[inst_cat].append(inst_node)

      tmp_name = 'dict_' + inst_name_cat.replace('-', '_')
      net.dat['node_info'][inst_rc][tmp_name] = dict_cat

def calc_cat_clust_order(net, inst_rc):
  '''
  cluster category subset of data
  '''
  from __init__ import Network
  from copy import deepcopy
  import calc_clust, run_filter

  inst_keys = net.dat['node_info'][inst_rc].keys()
  all_cats = [x for x in inst_keys if 'cat-' in x]

  if len(all_cats) > 0:

    for inst_name_cat in all_cats:

      tmp_name = 'dict_' + inst_name_cat.replace('-', '_')
      dict_cat = net.dat['node_info'][inst_rc][tmp_name]

      all_cats = sorted(dict_cat.keys())

      # this is the ordering of the columns based on their category, not
      # including their clustering ordering within category
      all_cat_orders = []
      tmp_names_list = []
      for inst_cat in all_cats:

        inst_nodes = dict_cat[inst_cat]

        tmp_names_list.extend(inst_nodes)

        cat_net = deepcopy(Network())

        cat_net.dat['mat'] = deepcopy(net.dat['mat'])
        cat_net.dat['nodes'] = deepcopy(net.dat['nodes'])

        cat_df = cat_net.dat_to_df()

        sub_df = {}
        if inst_rc == 'col':
          sub_df['mat'] = cat_df['mat'][inst_nodes]
        elif inst_rc == 'row':
          # need to transpose df
          cat_df['mat'] = cat_df['mat'].transpose()
          sub_df['mat'] = cat_df['mat'][inst_nodes]
          sub_df['mat'] = sub_df['mat'].transpose()

        # filter matrix before clustering
        ###################################
        threshold = 0.0001
        sub_df = run_filter.df_filter_row_sum(sub_df, threshold)
        sub_df = run_filter.df_filter_col_sum(sub_df, threshold)

        # load back to dat
        cat_net.df_to_dat(sub_df)

        cat_mat_shape = cat_net.dat['mat'].shape

        try:
          if cat_mat_shape[0]>1 and cat_mat_shape[1] > 1:

            calc_clust.cluster_row_and_col(cat_net, 'cos')
            inst_cat_order = cat_net.dat['node_info'][inst_rc]['clust']
          else:
            inst_cat_order = range(len(cat_net.dat['nodes'][inst_rc]))

        except:
          inst_cat_order = range(len(cat_net.dat['nodes'][inst_rc]))


        prev_order_len = len(all_cat_orders)

        # add prev order length to the current order number
        inst_cat_order = [i + prev_order_len for i in inst_cat_order]
        all_cat_orders.extend(inst_cat_order)

      names_clust_list = [x for (y, x) in sorted(zip(all_cat_orders,
                          tmp_names_list))]

      # calc category-cluster order
      final_order = []

      for i in range(len(net.dat['nodes'][inst_rc])):

        inst_node_name = net.dat['nodes'][inst_rc][i]
        inst_node_num = names_clust_list.index(inst_node_name)
        final_order.append(inst_node_num)

      net.dat['node_info'][inst_rc][inst_name_cat.replace('-', '_') +
                                     '_index'] = final_order
