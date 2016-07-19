
function Enrichr_request(){
  function get_enr_with_list(gene_list, library){
    enr_obj.post_list(gene_list, function(){
      console.log('\nrunning after list has been posted\n')
      enr_obj.get_enr(library);
    });

  }

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

    if (typeof callback_function === 'undefined'){
      callback_function = confirm_save;
    }

    $.ajax(settings)
     .done(function(response){
      response = JSON.parse(response);
      enr_obj.user_list_id = response.userListId;
      callback_function(response);
     });
  }

  function confirm_save(response){
    console.log('saved user_list_id '+String(enr_obj.user_list_id));
  }

  function get_enr(library){

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
        response = JSON.parse(response);
        enr_obj.enr_data = response;
      });
    } else {
      console.log('no user_list_id defined')
    }
  }


  // example of how to check gene list
  // http://amp.pharm.mssm.edu/Enrichr/view?userListId=1284420

  var enr_obj = {};
  enr_obj.user_list_id = null;
  enr_obj.enr_data = null;

  enr_obj.post_list = post_list;
  enr_obj.get_enr = get_enr;
  enr_obj.get_enr_with_list = get_enr_with_list;

  return enr_obj;

}

var enr_obj = Enrichr_request();