def main():
  from clustergrammer import Network

  net = Network()

  vect_post = net.load_json_to_dict('fake_vect_post.json')  

  net.load_vect_post_to_net(vect_post)

  net.swap_nan_for_zero()
  
  # net.N_top_views()
  net.make_filtered_views(dist_type='cos',views=['N_row_sum','N_row_var'], dendro=True)

  net.write_json_to_file('viz','json/large_vect_post_example.json','indent')

main()