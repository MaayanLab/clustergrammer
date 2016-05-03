def viz_json(net, dendro=True):
  ''' make the dictionary for the clustergram.js visualization '''
  import calc_clust

  all_dist = calc_clust.group_cutoffs()

  for inst_rc in net.dat['nodes']:

    inst_keys = net.dat['node_info'][inst_rc]
    all_cats = [x for x in inst_keys if 'cat-' in x]

    for i in range(len(net.dat['nodes'][inst_rc])):
      inst_dict = {}
      inst_dict['name'] = net.dat['nodes'][inst_rc][i]
      inst_dict['ini'] = net.dat['node_info'][inst_rc]['ini'][i]
      inst_dict['clust'] = net.dat['node_info'][inst_rc]['clust'].index(i)
      inst_dict['rank'] = net.dat['node_info'][inst_rc]['rank'][i]

      if 'rankvar' in inst_keys:
        inst_dict['rankvar'] = net.dat['node_info'][inst_rc]['rankvar'][i]

      # fix for similarity matrix
      if len(all_cats) > 0:

        for inst_name_cat in all_cats:

          actual_cat_name = net.dat['node_info'][inst_rc][inst_name_cat][i]
          inst_dict[inst_name_cat] = actual_cat_name

          check_pval = 'pval_'+inst_name_cat.replace('-','_')

          if check_pval in net.dat['node_info'][inst_rc]:
            tmp_pval_name = inst_name_cat.replace('-','_') + '_pval'
            inst_dict[tmp_pval_name] = net.dat['node_info'][inst_rc][check_pval][actual_cat_name]

          tmp_index_name = inst_name_cat.replace('-', '_') + '_index'

          inst_dict[tmp_index_name] = net.dat['node_info'][inst_rc] \
              [tmp_index_name][i]


      if len(net.dat['node_info'][inst_rc]['value']) > 0:
        inst_dict['value'] = net.dat['node_info'][inst_rc]['value'][i]

      if len(net.dat['node_info'][inst_rc]['info']) > 0:
        inst_dict['info'] = net.dat['node_info'][inst_rc]['info'][i]

      if dendro is True:
        inst_dict['group'] = []
        for tmp_dist in all_dist:
          tmp_dist = str(tmp_dist).replace('.', '')
          tmp_append = float(
              net.dat['node_info'][inst_rc]['group'][tmp_dist][i])
          inst_dict['group'].append(tmp_append)

      net.viz[inst_rc + '_nodes'].append(inst_dict)

  for i in range(len(net.dat['nodes']['row'])):
    for j in range(len(net.dat['nodes']['col'])):
      if abs(net.dat['mat'][i, j]) > 0:
        inst_dict = {}
        inst_dict['source'] = i
        inst_dict['target'] = j
        inst_dict['value'] = net.dat['mat'][i, j]

        if 'mat_up' in net.dat:
          inst_dict['value_up'] = net.dat['mat_up'][i, j]
          inst_dict['value_dn'] = net.dat['mat_dn'][i, j]

        if 'mat_orig' in net.dat:
          inst_dict['value_orig'] = net.dat['mat_orig'][i, j]

        if 'mat_info' in net.dat:
          inst_dict['info'] = net.dat['mat_info'][str((i, j))]

        if 'mat_hl' in net.dat:
          inst_dict['highlight'] = net.dat['mat_hl'][i, j]

        net.viz['links'].append(inst_dict)