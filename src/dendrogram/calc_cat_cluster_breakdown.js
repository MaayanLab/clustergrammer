var binom_test = require('./binom_test');
var underscore = require('underscore');

module.exports = function calc_cat_cluster_breakdown(params, inst_data, inst_rc){

  // Category-breakdown of dendrogram-clusters
  /////////////////////////////////////////////
  /*
  1. get information for nodes in cluster
  2. find category-types that are string-type
  3. count instances of each category name for each category-type
  */

  // in case sim_mat
  if (inst_rc === 'both'){
    inst_rc = 'row';
  }

  // 1: get information for nodes in cluster
  ///////////////////////////////////////////

  // names of nodes in cluster
  var clust_names = inst_data.all_names;
  // array of nodes in the cluster
  var clust_nodes = [];
  var all_nodes = params.network_data[inst_rc+'_nodes'];
  var num_in_clust_index = null;
  var is_downsampled = false;

  var inst_name;
  underscore.each(all_nodes, function(inst_node){

    inst_name = inst_node.name;

    if(clust_names.indexOf(inst_name) >= 0){
      clust_nodes.push(inst_node);
    }

  });

  // 2: find category-types that are string-type
  ///////////////////////////////////////////////

  var cat_breakdown = [];

  if ( params.viz.cat_info[inst_rc] !== null ){

    var inst_cat_info = params.viz.cat_info[inst_rc];

    // tmp list of all categories
    var tmp_types_index = underscore.keys(inst_cat_info);
    // this will hold the indexes of string-type categories
    var cat_types_index = [];

    // get category names (only include string-type categories)
    var cat_types_names = [];
    var type_name;
    var inst_index;
    var cat_index;
    for (var i = 0; i < tmp_types_index.length; i++) {

      cat_index = 'cat-' + String(i);

      if (params.viz.cat_info[inst_rc][cat_index].type === 'cat_strings'){
        type_name = params.viz.cat_names[inst_rc][cat_index];
        cat_types_names.push(type_name);
        cat_types_index.push(cat_index);
      } else {

        // save number in clust category index if found
        if (params.viz.cat_names[inst_rc][cat_index] === 'number in clust'){
          num_in_clust_index = cat_index;
          is_downsampled = true;
        }

      }

    }

    var tmp_run_count = {};
    var inst_breakdown = {};
    var bar_data;
    var radix_param = 10;

    // sort by actual counts (rather than cluster counts)
    var sorting_index = 4;
    if (is_downsampled){
      sorting_index = 5;
    }

    var no_title_given;
    if (type_name === cat_index){
      no_title_given = true;
    } else {
      no_title_given = false;
    }

    if (cat_types_names.length > 0){

      // 3: count instances of each category name for each category-type
      var cat_name;
      var num_in_clust = clust_names.length;

      // use the cat_hist to get the number of instances of this category in
      // all rows/cols
      // params

      underscore.each(cat_types_index, function(cat_index){

        inst_index = cat_index.split('-')[1];
        type_name = cat_types_names[inst_index];

        if (no_title_given){
          if (cat_index.indexOf('-') >=0){
            var tmp_num = parseInt( cat_index.split('-')[1], radix_param) + 1;
            type_name = 'Category ' + String(tmp_num);
          } else {
            // backup behavior
            type_name = 'Category';
          }
        }

        tmp_run_count[type_name] = {};

        // loop through the nodes and keep a running count of categories
        underscore.each(clust_nodes, function (tmp_node){

          cat_name = tmp_node[cat_index];

          if (cat_name.indexOf(': ') >=0){
            cat_name = cat_name.split(': ')[1];
          }

          if (cat_name in tmp_run_count[type_name]){
            tmp_run_count[type_name][cat_name].num_nodes = tmp_run_count[type_name][cat_name].num_nodes + 1;

            if (num_in_clust_index != null){
              tmp_run_count[type_name][cat_name].num_nodes_ds = tmp_run_count[type_name][cat_name].num_nodes_ds + parseInt(tmp_node[num_in_clust_index].split(': ')[1], radix_param);
            }

          } else {

            tmp_run_count[type_name][cat_name] = {};
            tmp_run_count[type_name][cat_name].num_nodes = 1;
            if (num_in_clust_index != null){
              tmp_run_count[type_name][cat_name].num_nodes_ds = parseInt(tmp_node[num_in_clust_index].split(': ')[1], radix_param);
            }

          }

        });

        inst_breakdown = {};
        inst_breakdown.type_name = type_name;
        inst_breakdown.num_in_clust = num_in_clust;

        // sort cat info in cat_breakdown
        bar_data = [];
        var bar_color;
        var cat_title_and_name;
        var inst_run_count = tmp_run_count[type_name];

        for (var inst_cat in inst_run_count){

          var tot_num_cat = params.viz.cat_info[inst_rc][cat_index].cat_hist[inst_cat];
          var total_nodes = params.network_data[inst_rc+'_nodes'].length;
          var expect_prob = tot_num_cat / total_nodes;

          // if no cat-title given
          if (no_title_given){
            cat_title_and_name = inst_cat;
          } else {
            cat_title_and_name = type_name + ': ' + inst_cat;
          }

          // num_nodes: number of cat-nodes drawn in cluster
          var num_nodes = inst_run_count[inst_cat].num_nodes;

          var actual_k  = num_nodes;
          var pval = binom_test(actual_k, num_in_clust, expect_prob);

          // working on tracking the 'real' number of nodes, which is only different
          // if downsampling has been done
          if (_.has(inst_run_count[inst_cat], 'num_nodes_ds')){
            var num_nodes_ds = inst_run_count[inst_cat].num_nodes_ds;
          } else {
            num_nodes_ds = null;
          }

          bar_color = params.viz.cat_colors[inst_rc][cat_index][cat_title_and_name];

          bar_data.push([ cat_index, cat_title_and_name, inst_run_count[inst_cat], bar_color, num_nodes, num_nodes_ds, pval]);
        }

        bar_data.sort(function(a, b) {
            return b[sorting_index] - a[sorting_index];
        });

        inst_breakdown.bar_data = bar_data;

        cat_breakdown.push(inst_breakdown);

      });

    }
  }

  return cat_breakdown;
};