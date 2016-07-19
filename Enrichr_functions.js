var user_list_id;

function Enrichr_request(){

  function post_request(gene_list){

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

    return $.ajax(settings)
            .done(run_when_done);

  }

  function run_when_done(response){
    response = JSON.parse(response);
    user_list_id = response.userListId;
    console.log('run_when_done: user_list_id')
    console.log(user_list_id);
    return user_list_id;
  }

  // example of how to check gene list
  // http://amp.pharm.mssm.edu/Enrichr/view?userListId=1284420

  var enr_obj = {};
  enr_obj.post = post_request;

  return enr_obj;

}
