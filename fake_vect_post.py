import string
import random
random.seed(10)

def main():

  from clustergrammer import Network
  net = Network()

  row_num = 200
  num_columns = 20

  # make up all names for all data
  row_names = make_up_names(row_num)

  # initialize vect_post
  vect_post = {}

  vect_post['title'] = 'Some-Clustergram'
  vect_post['link'] = 'some-link'
  vect_post['filter'] = 'N_row_sum'
  vect_post['is_up_down'] = True
  vect_post['columns'] = []

  # fraction of rows in each column - 1 means all columns have all rows
  inst_prob = 1

  # make column data
  for col_num in range(num_columns):

    inst_col = {}

    if col_num < 5:
      col_name = "('Columns: Col-" + str( col_num+1 ) + "', 'tissue: brain')"
    else:
      col_name = "('Columns: Col-" + str( col_num+1 ) + "', 'tissue: lung')"

    inst_col['col_name'] = col_name
    inst_col['link'] = 'col-link'

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

      # define row object - within column
      row_obj = {}
      row_obj['row_name'] = inst_row
      row_obj['val'] = value
      row_obj['val_up'] = value_up
      row_obj['val_dn'] = value_dn

      inst_col['data'].append(row_obj)

    # save columns to vect_post
    vect_post['columns'].append(inst_col)

  net.save_dict_to_json(vect_post, 'json/fake_vect_post.json', indent='indent')

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
    inst_name = id_generator(length_of_names, "WERJASDFNYKEM1219UIO ")

    if inst_name[0] == 'A':
      inst_name = "('" + inst_name + "', 'gene: A', 'Cat: cat')"
    else:
      inst_name = "('" + inst_name + "', 'gene: Other', 'Cat: dog')"

    row_names.append(inst_name)

  row_names = list(set(row_names))

  return row_names


def id_generator(size=6, chars=string.ascii_uppercase + string.digits):
  return ''.join(random.choice(chars) for _ in range(size))


main()