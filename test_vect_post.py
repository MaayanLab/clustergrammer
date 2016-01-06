def main():
  post_to_clustergrammer()

  # proc_locally()

def post_to_clustergrammer():

  from clustergrammer import Network
  import requests 
  import json

  filename = 'example_matrix.txt'
  upload_url = 'http://localhost:9000/clustergrammer/vector_upload/'

  net = Network()
  vect_post = net.load_json_to_dict('large_vect_post.json')
  # vect_post = net.load_json_to_dict('fake_vect_post.json')


  r = requests.post(upload_url, data=json.dumps(vect_post) )


  link = r.text

  print(link)



def proc_locally():
  from clustergrammer import Network
  # import run_g2e_background

  net = Network()

  vect_post = net.load_json_to_dict('large_vect_post.json')

  print(vect_post.keys())

  # mongo_address = '10.125.161.139'


  net.load_vect_post_to_net(vect_post)

  net.swap_nan_for_zero()

  net.N_top_views()  

  print(net.viz.keys())

main()