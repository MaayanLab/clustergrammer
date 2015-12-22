def main():
  import enrichr_functions as enr_fun 
  import json
  import requests


  gmt = 'KEA_2015'
  userListId = 939279

  # define the get url 
  get_url = 'http://amp.pharm.mssm.edu/Enrichr/enrich'

  # get parameters 
  params = {'backgroundType':gmt,'userListId':userListId}

  # try get request until status code is 200 
  inst_status_code = 400

  # wait until okay status code is returned 
  num_try = 0
  while inst_status_code == 400 and num_try < 100:
    num_try = num_try +1 
    try:
      # make the get request to get the enrichr results 
      print('make-get-req-Enrichr')

      try:
        get_response = requests.get( get_url, params=params )

        # get status_code
        inst_status_code = get_response.status_code
        print('inst_status_code: '+str(inst_status_code))

      except:
        print('get request failed\n------------------------\n\n')

    except:
      pass


  # load as dictionary 
  resp_json = json.loads( get_response.text )

  # get the key 
  only_key = resp_json.keys()[0]

  # get response_list 
  response_list = resp_json[only_key]

  print(response_list)

  net = enr_fun.enrichr_clust_from_response(response_list)

  net.write_json_to_file('viz','json/enr_clust_example.json')  



main()