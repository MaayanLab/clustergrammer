module.exports = function make_default_cat_data(cgm){

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

        if (cat_string.indexOf(title_sep) > -1){
          cat_title = cat_string.split(title_sep)[0];
          cat_name  = cat_string.split(title_sep)[1];
        }

        // cat_data is empty
        if (cat_data.length === 0){

          add_new_cat_type(cat_title, cat_name, cat_row_name);

        // cat_data is not empty
        } else {

          // look for cat_title in cat_data
          found_cat_title = false;
          _.each(cat_data, function(inst_cat_type){

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

            add_new_cat_type(cat_title, cat_name, cat_row_name);

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