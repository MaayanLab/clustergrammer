var underscore = require('underscore');

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
  var node_keys = underscore.keys(check_node);
  var current_cats = {};
  var tmp_cat;
  var tmp_title;
  var cat_index;
  underscore.each(node_keys, function(inst_prop){

    if (inst_prop.indexOf('cat-') >= 0){

      // generate titles from cat info
      tmp_cat = check_node[inst_prop];

      cat_index = parseInt(inst_prop.split('cat-')[1], 10);

      // use given title
      if (tmp_cat.indexOf(title_sep) >=0){
        tmp_title = tmp_cat.split(title_sep)[0];
      } else {
        tmp_title = inst_prop;
      }

      // current_cats.push(tmp_title);

      current_cats[cat_index] = tmp_title;
    }

  });

  // console.log('current_cats')
  // console.log(current_cats)

  // initialize cat_data with categories in the correct order
  var all_index = underscore.keys(current_cats).sort();

  var inst_data;
  underscore.each(all_index, function(inst_index){

    inst_data = {};
    inst_data.cat_title = current_cats[inst_index];
    inst_data.cats = [];

    cat_data.push(inst_data);
  });

  // // initialize cat_data (keep original order)
  // var found_title;
  // underscore.each(cgm.params.viz.cat_names.row, function(inst_title){

  //   found_title = false;

  //   console.log('inst_title -> ' + String(inst_title))

  //   if (current_cats.indexOf(inst_title) >= 0){
  //     found_title = true;
  //   }

  //   // only track cats that are found in the incoming nodes
  //   if (found_title){
  //     var inst_data = {};
  //     inst_data.cat_title = inst_title;
  //     inst_data.cats = [];
  //     cat_data.push(inst_data);
  //   }

  // });

  // console.log('cat_data after cross checking with current cats')
  // console.log(cat_data)
  // console.log('-------------------------\n')

  underscore.each(row_nodes, function(inst_node){

    var all_props = underscore.keys(inst_node);

    underscore.each(all_props, function(inst_prop){

      if (inst_prop.indexOf('cat-') > -1){

        cat_name = inst_node[inst_prop];

        cat_index = parseInt(inst_prop.split('cat-')[1], 10);

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

        // console.log('cat_index -> ' + String(cat_index))
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
          underscore.each(cat_data, function(inst_cat_type){

            // console.log('inst_cat_data title ' + inst_cat_type.cat_title)

            // check each cat_type object for a matching title
            if (cat_title === inst_cat_type.cat_title){
              found_cat_title = true;

              // check if cat_name is in cats
              found_cat_name = false;
              underscore.each(inst_cat_type.cats, function(inst_cat_obj){

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

  // console.log('RETURNING CAT DATA')
  // console.log(cat_data)

  return cat_data;
};