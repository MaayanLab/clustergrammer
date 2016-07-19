
function post_list(gene_list, callback_function){

  var gene_list_string = gene_list.join('\n');

  var form = new FormData();
  var response;

  form.append("list", gene_list_string);

  form.append("description", "clustergrammer");

  var settings = {
   "async": true,
   "crossDomain": true,
   "url": "http://amp.pharm.mssm.edu/Enrichr/addList",
   "method": "POST",
   "processData": false,
   "contentType": false,
   "mimeType": "multipart/form-data",
   "data": form
  }

  $.ajax(settings)
   .done(got_user_list_id);
}

function got_user_list_id(response){
  response = JSON.parse(response);
  enr_obj.user_list_id = response.userListId;
  console.log('set user_list_id ' + String(enr_obj.user_list_id))
}

function get_request(library){

  if (enr_obj.user_list_id !== null){
    var form = new FormData();

    var base_url = 'http://amp.pharm.mssm.edu/Enrichr/enrich?';
    var library_string = 'backgroundType=' + String(library);
    var list_id_string = 'userListId=' + String(enr_obj.user_list_id);

    var full_url = base_url + library_string + '&' + list_id_string;

    // get request
    var settings = {
     "async": true,
     "crossDomain": true,
     "url": full_url,
     "method": "GET",
     "processData": false,
     "contentType": false,
     "mimeType": "multipart/form-data",
     "data": form
    }

    $.ajax(settings).done(function (response) {
     console.log(response);
    });
  } else {
    console.log('no user_list_id defined')
  }
}

function Enrichr_request(){

  // example of how to check gene list
  // http://amp.pharm.mssm.edu/Enrichr/view?userListId=1284420

  var enr_obj = {};
  enr_obj.post_list = post_list;
  enr_obj.get = get_request;
  enr_obj.user_list_id = null;

  return enr_obj;

}

var enr_obj = Enrichr_request();