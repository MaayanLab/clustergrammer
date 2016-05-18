from clustergrammer import Network

net = Network()
net.load_file('txt/rc_two_cats.txt')

# print(net.dat['nodes']['row'])

cat_list = []

for inst_gene in net.dat['nodes']['row']:
  inst_tuple = [inst_gene]
  cat_list.append(inst_tuple)


df = net.dat_to_df()

all_rows = df['mat'].index.tolist()

print(all_rows)

new_rows = []
for inst_row in all_rows:
  new_rows.append(list(inst_row))

print('\n\n\n')
print(new_rows)

for inst_row in new_rows:
  inst_row.append('something')


print('\n\n\n')
print(new_rows)

new_rows = [tuple(x) for x in new_rows]

print('\n\n\n')
print(new_rows)

df['mat'].index = new_rows

net.df_to_dat(df)



# for inst_row in all_rows:
#   inst_row = list(inst_row)
#   inst_row.append('something')

#   inst_row = tuple(inst_row)

# print(all_rows)

# cat_list = [tuple(x) for x in cat_list]

# print(net.dat['node_info'])

# net.dat['nodes']['row'] = []


views = ['N_row_sum']
net.make_clust(dist_type='cos',views=views , dendro=True,
               sim_mat=True, filter_sim=0.1, calc_cat_pval=False)

net.write_json_to_file('viz', 'json/mult_view.json')