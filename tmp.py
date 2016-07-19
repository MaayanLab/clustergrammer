import json
import requests


ENRICHR_URL = 'http://amp.pharm.mssm.edu/Enrichr/view?userListId=%s'
user_list_id = 1284420
response = requests.get(ENRICHR_URL % user_list_id)
if not response.ok:
    raise Exception('Error getting gene list')

data = json.loads(response.text)
print(data)