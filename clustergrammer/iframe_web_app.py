def main(net, filename=None, width=1000, height=800):
  import requests, json
  from cStringIO import StringIO
  from IPython.display import IFrame, display
  
  clustergrammer_url = 'http://amp.pharm.mssm.edu/clustergrammer/matrix_upload/'

  if filename is None:
    file_string = net.write_matrix_to_tsv()
    file_obj = StringIO(file_string)

    if net.dat['filename'] is None:
      fake_filename = 'Network.txt'
    else:
      fake_filename = net.dat['filename']

    r = requests.post(clustergrammer_url, files={'file': (fake_filename, file_obj)})
  else:
    file_obj = open(filename, 'r')
    r = requests.post(clustergrammer_url, files={'file': file_obj})


  link = r.text

  display(IFrame(link, width=width, height=height))

  return link