
var enr_obj = Enrichr_request();

function Enrichr_request(){

  function get_enr_with_list(gene_list, library, callback_function){
    console.log('get_enr_with_list: post and get requests')
    enr_obj.post_list(gene_list, function(){

      if (typeof callback_function != 'undefined'){
        enr_obj.get_enr(library, callback_function);
      } else {
        enr_obj.get_enr(library);
      }

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

  function get_enr(library, callback_function){

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

      $.ajax(settings)
        .done(function (response) {

          response = JSON.parse(response);
          enr_obj.enr_data = response;

          // parse enr_data to cat_data format
          /////////////////////////////////////
          // enr_obj.cat_data = enr_obj.enr_data
          enr_obj.enr_data_to_cats();


          if (typeof callback_function != 'undefined'){
            callback_function(enr_obj);
          }

        });

    } else {
      console.log('no user_list_id defined')
    }
  }

  function enrichr_rows(library, callback_function){

    var gene_list = cgm.params.network_data.row_nodes_names;

    enr_obj.get_enr_with_list(gene_list, library, callback_function)

    // console.log('send these rows to enrichr')
    // console.log(inst_rows)

    // if (typeof callback_function != 'undefined'){
    //   callback_function();
    // }

  }

  // example of how to check gene list
  // http://amp.pharm.mssm.edu/Enrichr/view?userListId=1284420

  var enr_obj = {};
  enr_obj.user_list_id = null;
  enr_obj.enr_data = null;
  enr_obj.cat_data = null;

  enr_obj.post_list = post_list;
  enr_obj.get_enr = get_enr;
  enr_obj.get_enr_with_list = get_enr_with_list;
  enr_obj.enrichr_rows = enrichr_rows;
  enr_obj.enr_data_to_cats = enr_data_to_cats;

  return enr_obj;

}

function enr_data_to_cats(){

  console.log('enr_data_to_cats');

  var library_name = _.keys(this.enr_data)[0];

  var enr_terms = this.enr_data[library_name];

  enr_terms = enr_terms.slice(0,5);

  cat_data = []

  _.each(enr_terms, function(inst_term){

    inst_data = {};
    inst_data['cat_title'] = inst_term[1];
    inst_data['cats'] = [];

    cat_details = {};
    cat_details.cat_name = 'true';
    cat_details.members = inst_term[5]

    // there are only two categories for Enrichr: true/false
    inst_data['cats'].push(cat_details)

    cat_data.push(inst_data);
  });

  console.log(cat_data)

  this.cat_data = cat_data;

}

function update_viz_callback(enr_obj){
  console.log('\nUpdating viz with enr\n------------------\n');
  console.log(enr_obj.cat_data);
  cgm.update_cats(enr_obj.cat_data);
}

// tmp = cgm.params.network_data.row_nodes_names;
// enr_obj.get_enr_with_list(tmp, 'KEGG_2015', update_viz_callback);


// // example
// /////////////////
// enr_obj.enrichr_rows('ChEA_2015',update_viz_callback)

// // load toy category data
// enr_obj.cat_data;
// d3.json('json/category_mockup.json', function(cat_data){
//   console.log('cat_data')
//   console.log(cat_data)
//   // return cat_data;
//   enr_obj.cat_data = cat_data;
// })