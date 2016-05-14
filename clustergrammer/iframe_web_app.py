def main(net, filename=None, width=1000, height=800):
  import requests, json
  from IPython.display import IFrame, display
  
  if filename is None:
    print('set up export of matrix from net class')

  clustergrammer_url = 'http://amp.pharm.mssm.edu/clustergrammer/matrix_upload/'

  r = requests.post(clustergrammer_url, files={'file': open(filename, 'rb')})
  link = r.text

  display(IFrame(link, width=width, height=height))

  return link