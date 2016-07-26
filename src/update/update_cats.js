var make_row_cat = require('../dendrogram/make_row_cat');
var calc_viz_params = require('../params/calc_viz_params');
var resize_viz = require('../reset_size/resize_viz');

module.exports = function update_cats(cgm, cat_data){

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

  modify_row_node_cats(cgm.params.network_data.row_nodes);
  modify_row_node_cats(cgm.params.inst_nodes.row_nodes);

  // recalculate the visualization parameters using the updated network_data
  cgm.params = calc_viz_params(cgm.params, false);

  make_row_cat(cgm.params, true);
  resize_viz(cgm);

  function modify_row_node_cats(inst_nodes){
    // loop through row nodes
    //////////////////////////
    _.each(inst_nodes, function(inst_node){

      inst_name = inst_node.name;
      cat_type_num = 0

      _.each(cat_data, function(inst_cat_data){


        inst_cat_title = inst_cat_data.cat_title;
        inst_cats = inst_cat_data.cats;

        // initialize with no category
        inst_category = 'false';
        inst_index = -1

        inst_cat_num = 0
        // loop through each category in the category-type
        _.each(inst_cats, function(inst_cat){

          inst_cat_name = inst_cat.cat_name;
          inst_members = inst_cat.members;

          // add category if node is a member
          if ( _.contains(inst_members, inst_name) ){

            inst_category = inst_cat_name
            inst_index = inst_cat_num

          }

          inst_cat_num = inst_cat_num + 1

        })

        inst_full_cat = inst_cat_title + ': ' + inst_category

        inst_node['cat-'+String(cat_type_num)] = inst_full_cat
        inst_node['cat_'+String(cat_type_num)+'_index'] = inst_index

        cat_type_num = cat_type_num + 1
      });

    });
  }


};