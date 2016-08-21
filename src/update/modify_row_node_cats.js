var remove_node_cats = require('./remove_node_cats');

module.exports = function modify_row_node_cats(cat_data, inst_nodes){

  var cat_type_num = 0;
  var inst_index = 0;
  var inst_cat_title;
  var inst_cats;
  var inst_members;
  var inst_name;
  var inst_category;
  var inst_cat_name;
  var inst_full_cat;
  var inst_cat_num;

  // loop through row nodes
  //////////////////////////
  _.each(inst_nodes, function(inst_node){

    inst_name = inst_node.name;
    cat_type_num = 0;

    remove_node_cats(inst_node);

    // loop through each category type
    _.each(cat_data, function(inst_cat_data){

      inst_cat_title = inst_cat_data.cat_title;
      inst_cats = inst_cat_data.cats;

      // initialize with no category
      inst_category = 'false';
      inst_index = -1;

      inst_cat_num = 0;
      // loop through each category in the category-type
      _.each(inst_cats, function(inst_cat){

        inst_cat_name = inst_cat.cat_name;
        inst_members = inst_cat.members;

        // add category if node is a member
        if ( _.contains(inst_members, inst_name) ){

          inst_category = inst_cat_name;
          inst_index = inst_cat_num;

        }

        inst_cat_num = inst_cat_num + 1;

      });

      inst_full_cat = inst_cat_title + ': ' + inst_category;

      inst_node['cat-'+String(cat_type_num)] = inst_full_cat;
      inst_node['cat_'+String(cat_type_num)+'_index'] = inst_index;

      cat_type_num = cat_type_num + 1;
    });

  });

};