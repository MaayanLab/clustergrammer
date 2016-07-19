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
     "headers": {
       "cache-control": "no-cache",
       "postman-token": "2b1d201e-ae99-9e22-99a8-d8495a01cc42"
     },
     "processData": false,
     "contentType": false,
     "mimeType": "multipart/form-data",
     "data": form
    }

    $.ajax(settings).done(function (response) {
     console.log(response);

     return response;
    });

    return response;
  }

  // example of how to check gene list
  // http://amp.pharm.mssm.edu/Enrichr/view?userListId=1284420

  var enr_obj = {};
  enr_obj.post = post_request;

  return enr_obj

}
