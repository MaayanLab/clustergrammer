def check_categories(lines):
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

  max_rcat = 10
  num_cc = 0
  for i in range(max_rcat):
    ccat_line = lines[i + 1].split('\t')
    if ccat_line[0] == '':
      num_cc = num_cc + 1

  num_labels = {}
  num_labels['row'] = num_rc + 1
  num_labels['col'] = num_cc + 1

  return num_labels

def dict_cat(net):
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