def main():
  from clustergrammer import Network

  net = Network()

  vect_post = net.load_json_to_dict('fake_vect_post.json')  

  net.load_vect_post_to_net(vect_post)

  net.N_top_views()

  net.write_json_to_file('viz','json/vect_post_example.json','indent')

main()