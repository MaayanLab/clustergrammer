def main():

  make_enr_clust()

def make_enr_clust():

  import enrichr_functions as enr_fun 

  enr, response_list = enr_fun.enrichr_get_request('ChEA_2015', 939279)

  net = enr_fun.enrichr_clust_from_response(response_list)

  net.write_json_to_file('viz','json/enr_clust_example.json')  

def make_enr_vect_clust():
  import enrichr_functions as enr_fun 
  from clustergrammer import Network

  net = Network()

  g2e_post = net.load_json_to_dict('json/g2e_enr_vect.json')

  net = enr_fun.make_enr_vect_clust(g2e_post, 0.001, 1)

  net.write_json_to_file('viz','json/enr_vect_example.json')


def generate_upload_Enr_save_mock_g2e():
  '''
  This script will generate gene lists using the genes in a gmt 
  (GO_Biological_Process_2015). It will then generate a json of up and down 
  genes that can then be used as an input for Enrichr vector clustering. 

  The script is also generating a g2e_enr_vect.json that has the user_list_ids 
  that are returned from Enrichr. 
  '''

  list_num = range(10)
  gl = []

  for inst_num in list_num:

    gl.append(make_updn_lists(inst_num))

  # make mock g2e json post-request - have gene list names and ther up/dn user_list_ids
  mock_g2e_json(gl)

def mock_g2e_json(gl):
  import enrichr_functions as enr_fun
  from clustergrammer import Network

  ''' 
  A json of signatures from g2e, for enrichment vectoring, should look like this

  {
    "signature_ids":[
      {"col_title":"title 1", "enr_id_up":###, "enr_id_dn":###},
      {"col_title":"title 2", "enr_id_up":###, "enr_id_dn":###}
    ],
    "background_type":"ChEA_2015"
  }
  '''

  net = Network()

  g2e_post = {}
  sig_ids = []

  # I have to get user_list_ids from Enrichr 
  tmp = 1
  for inst_gl in gl:

    inst_sig = {}
    inst_sig['col_title'] = 'Sig-'+str(tmp)
    tmp = tmp+1

    # submit to enrichr and get user_list_ids
    for inst_updn in inst_gl:
      inst_list = inst_gl[inst_updn]
      inst_id = enr_fun.enrichr_post_request(inst_list)
      inst_sig['enr_id_'+inst_updn] = inst_id

    sig_ids.append(inst_sig)

  g2e_post['signature_ids'] = sig_ids

  g2e_post['background_type'] = 'ChEA_2015'

  net.save_dict_to_json(g2e_post,'json/g2e_enr_vect.json','indent')




def make_updn_lists(inst_num):
  up = generate_gl_and_gv(inst_num)
  dn = generate_gl_and_gv(2*inst_num+1)

  # set up unique up/dn lists 
  gl = {}
  gl['up'] = list( set(up['list']) - set(dn['list']) )
  gl['dn'] = list( set(dn['list']) - set(up['list']) )

  return gl

def generate_gl_and_gv(inst_line):
  import random

  # load gmt to get example genes 
  gmt = load_gmt('txt/GO_Biological_Process_2015.txt')

  all_terms = gmt.keys()
  inst_term = all_terms[inst_line]

  # generate gene list 
  inst_gl = gmt[inst_term]
  inst_gl = list(set(inst_gl))

  # generate vector 
  random.seed(1)

  inst_gv = []
  for inst_gene in inst_gl:

    inst_rand = random.random()
    inst_rand = int((inst_rand * 1000)) / 1000.0
    inst_gv.append(inst_gene+','+str(inst_rand))
  
  toy_list = {}
  toy_list['list'] = inst_gl
  toy_list['vect'] = inst_gv

  return toy_list

def load_gmt(filename):

  f = open(filename, 'r')
  lines = f.readlines()
  f.close()

  gmt = {}

  # loop through the lines of the gmt 
  for i in range(len(lines)):

    # get the inst line, strip off the new line character 
    inst_line = lines[i].rstrip()

    inst_term = inst_line.split('\t')[0]

    # get the elements 
    inst_elems = inst_line.split('\t')[2:]

    # save the drug-kinase sets 
    gmt[inst_term] = inst_elems

  return gmt


main()