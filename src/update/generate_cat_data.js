module.exports = function generate_cat_data(cgm){

  // only row category resetting is supported currently

  // get row_nodes from config, since this is has the original network
  var row_nodes = cgm.config.network_data.row_nodes;
  var title_sep = ': ';

  // contains all the category information stored as an array of
  // cat_type
  var cat_data = [];
  var cat_type;
  var cat_info;
  var found_cat_title;
  var found_cat_name;
  var cat_name;

  // console.log('generate_cat_data')
  // console.log(cgm.params.viz.cat_names.row)

  // get current list of cateories
  var check_node = row_nodes[0];
  var node_keys = _.keys(check_node);
  var current_cats = [];
  var tmp_cat;
  var tmp_title;
  _.each(node_keys, function(inst_key){
    if (inst_key.indexOf('cat-') >= 0){
      tmp_cat = check_node[inst_key];

      // use given title
      if (tmp_cat.indexOf(title_sep) >=0){
        tmp_title = tmp_cat.split(title_sep)[0];
      } else {
        tmp_title = inst_key;
        // tmp_title = 'Category-'+String(parseInt(tmp_title.split('-')[1]) + 1);
      }

      current_cats.push(tmp_title);
    }

  });

  // console.log('current_cats: '+ String(current_cats))

  // initialize cat_data (keep original order)
  var found_title;
  _.each(cgm.params.viz.cat_names.row, function(inst_title){

    found_title = false;

    // console.log('loop through cat_names')

    if (current_cats.indexOf(inst_title) >= 0){
      found_title = true;
    }

    // console.log('found_title ' + String(found_title))

    // only track cats that are found in the incoming nodes
    if (found_title){
      var inst_data = {};
      inst_data.cat_title = inst_title;
      inst_data.cats = [];
      cat_data.push(inst_data);
    }

  });

  // console.log('cat_data')
  // console.log(cat_data)

  _.each(row_nodes, function(inst_node){

    var all_props = _.keys(inst_node);

    _.each(all_props, function(inst_prop){

      if (inst_prop.indexOf('cat-') > -1){

        cat_name = inst_node[inst_prop];

        // default title and name
        var cat_title = inst_prop;
        cat_name = inst_node[inst_prop];
        var cat_string = inst_node[inst_prop];
        var cat_row_name = inst_node.name;

        // console.log('cat_string: '+String(cat_string))
        // found actual title
        if (cat_string.indexOf(title_sep) > -1){
          cat_title = cat_string.split(title_sep)[0];
          cat_name  = cat_string.split(title_sep)[1];
        } else {
          // cat_title = 'Category-'+String(parseInt(inst_prop.split('-')[1]) + 1)
          cat_title = inst_prop;
          cat_name = cat_string;
        }

        // console.log('cat_name '+cat_name)
        // console.log('cat_title ' + cat_title)
        // console.log('--------')

        // cat_data is empty
        if (cat_data.length === 0){

          add_new_cat_type(cat_title, cat_name, cat_row_name);

        // cat_data is not empty
        } else {

          // look for cat_title in cat_data
          found_cat_title = false;
          _.each(cat_data, function(inst_cat_type){

            // console.log('inst_cat_data title ' + inst_cat_type.cat_title)

            // check each cat_type object for a matching title
            if (cat_title === inst_cat_type.cat_title){
              found_cat_title = true;

              // check if cat_name is in cats
              found_cat_name = false;
              _.each(inst_cat_type.cats, function(inst_cat_obj){

                // found category name, add cat_row_name to members
                if (cat_name === inst_cat_obj.cat_name){
                  found_cat_name = true;

                  // add cat_row_name to members
                  inst_cat_obj.members.push(cat_row_name);
                }

              });

              // did not find cat name in cat_type - add cat_info for new
              // category
              if (found_cat_name === false){
                cat_info = {};
                cat_info.cat_name = cat_name;
                cat_info.members = [];
                cat_info.members.push(cat_row_name);
                inst_cat_type.cats.push(cat_info);
              }

            }

          });

          // did not find category type, initialize category type object
          if (found_cat_title === false){

            // console.log('did not find cat_title: ' + String(cat_title))
            // add_new_cat_type(cat_title, cat_name, cat_row_name);

          }

        }

      }

    });

  });



  function add_new_cat_type(cat_title, cat_name, cat_row_name){

    // initialize cat_type object to push to cat_data
    cat_type = {};
    cat_type.cat_title = cat_title;
    cat_type.cats = [];

    // initialize cat_info (e.g. 'true' category has members [...])
    cat_info = {};
    cat_info.cat_name = cat_name;
    cat_info.members = [];
    cat_info.members.push(cat_row_name);

    cat_type.cats.push(cat_info);

    cat_data.push(cat_type);

  }

  return cat_data;
};