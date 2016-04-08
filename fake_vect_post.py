import string
import random
random.seed(10)

def main():
  make_json()
  cluster()

def cluster():
  from clustergrammer import Network

  net = Network()

  vect_post = net.load_json_to_dict('fake_vect_post.json')  

  net.load_vect_post_to_net(vect_post)

  net.swap_nan_for_zero()
  
  # net.N_top_views()
  net.make_clust(dist_type='cos',views=['N_row_sum','N_row_var'], dendro=True)

  net.write_json_to_file('viz','json/large_vect_post_example.json','indent')  

def make_json():
  from clustergrammer import Network
  net = Network()

  row_num = 100
  num_columns = 30

  # make up all names for all data 
  row_names = make_up_names(row_num)

  # initialize vect_post 
  vect_post = {}

  vect_post['title'] = 'Some-Clustergram'
  vect_post['link'] = 'some-link'
  vect_post['filter'] = 'N_row_sum'
  vect_post['is_up_down'] = True
  vect_post['columns'] = []


  split = True

  # fraction of rows in each column - 1 means all columns have all rows 
  inst_prob = 1


  # make column data 
  for col_num in range(num_columns):

    inst_col = {}

    col_name = 'Col-' + str( col_num+1 ) + ' make name longer'

    inst_col['col_name'] = col_name
    inst_col['link'] = 'col-link'

    if col_num < 5:
      inst_col['cat'] = 'brain'
    else:
      inst_col['cat'] = 'lung'

    # save to columns 
    inst_col['data'] = [] #vector

    # get random subset of row_names 
    vect_rows = get_subset_rows(row_names, inst_prob)

    # generate vectors 
    for inst_row in vect_rows:

      # genrate values 
      ##################

      # add positive/negative values 
      if random.random() > 0.5:
        value_up = 10*random.random()
      else: 
        value_up = 0

      if random.random() > 0.5:
        value_dn = -10*random.random()
      else: 
        value_dn = 0

      value = value_up + value_dn

      # # generate vector component 
      # #############################
      # vector.append([ inst_row, value ])
      # vector_up.append([ inst_row, value_up ])
      # vector_dn.append([ inst_row, value_dn ])

      # define row object - within column 
      row_obj = {}
      row_obj['row_name'] = inst_row
      row_obj['val'] = value
      row_obj['val_up'] = value_up
      row_obj['val_dn'] = value_dn

      inst_col['data'].append(row_obj)


    # if split:
    #   inst_col['vector_up'] = vector_up
    #   inst_col['vector_dn'] = vector_dn


    # save columns to vect_post
    vect_post['columns'].append(inst_col)

  net.save_dict_to_json(vect_post, 'fake_vect_post.json', indent='indent')

def get_subset_rows(row_names, inst_prob):

  subset_rows = []

  for inst_row in row_names:

    if random.random() > 1-inst_prob:
      subset_rows.append(inst_row)

  return subset_rows


def make_up_names(num_names):

  row_names = []

  for i in range(num_names):
    length_of_names = int(30*random.random()) + 3
    row_names.append(id_generator(length_of_names, "WERJASDFNYKEM1219UIO "))

  row_names = list(set(row_names))

  return row_names

  
def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
  return ''.join(random.choice(chars) for _ in range(size))
  

main()