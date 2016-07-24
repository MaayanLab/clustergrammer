var make_row_cat = require('../dendrogram/make_row_cat');
var calc_viz_params = require('../params/calc_viz_params');
var resize_viz = require('../reset_size/resize_viz');

module.exports = function update_cats(cgm, cat_data){

    // console.log('---------\nupdate_Cats\n-------------')
    // console.log(cat_data)


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
    _.each(cgm.params.network_data.row_nodes, function(inst_node){

      inst_name = inst_node.name;

      // console.log(inst_name)
      // console.log('***************')


      cat_type_num = 0
      // loop through each category-type
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

        // console.log(inst_full_cat)
        // console.log(cat_type_num)

        cat_type_num = cat_type_num + 1
      });

      // console.log('\n\n')

      // var is_interesting = false;
      // if (inst_index < 10){
      //   is_interesting = true;
      // }

      // inst_node['cat_0_index'] = inst_index
      // inst_node['cat-0'] = 'Very Interesting: '+String(is_interesting);

      // inst_node['cat_1_index'] = inst_index
      // inst_node['cat-1'] = 'Very Interesting: '+String(is_interesting);

      // inst_node['cat_2_index'] = inst_index
      // inst_node['cat-2'] = 'Very Interesting: '+String(is_interesting);

      // inst_index = inst_index + 1;

    });

    // recalculate the visualization parameters using the updated network_data
    cgm.params = calc_viz_params(cgm.params);
    make_row_cat(cgm.params, true);
    resize_viz(cgm);

};