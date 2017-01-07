module.exports = function calc_cluster_cat_breakdonw(params, inst_data, inst_rc){
  // Category-breakdown of dendrogram-clusters
  /////////////////////////////////////////////
  /*

  1. get information for nodes in cluster
  2. find category-types that are string-type
  3. count instances of each category name for each category-type

  */

  // 1: get information for nodes in cluster
  ///////////////////////////////////////////

  // names of nodes in cluster
  var clust_names = inst_data.all_names;
  // array of nodes in the cluster
  var clust_nodes = [];

  var all_nodes = params.network_data[inst_rc+'_nodes'];

  var inst_name;
  _.each(all_nodes, function(inst_node){

    inst_name = inst_node.name;

    if(clust_names.indexOf(inst_name) >= 0){
      clust_nodes.push(inst_node);
    }

  });

  // 2: find category-types that are string-type
  ///////////////////////////////////////////////

  var inst_cat_info = params.viz.cat_info[inst_rc];

  // tmp list of all categories
  var tmp_types_index = _.keys(inst_cat_info);
  // this will hold the indexes of string-type categories
  var cat_types_index = [];

  // var inst_node = params.network_data[inst_rc+'_nodes'][0];

  // get category names (only include string-type categories)
  var cat_types_names = [];
  var type_name;
  var inst_index;
  var cat_index;
  for (var i = 0; i < tmp_types_index.length; i++) {

    cat_index = 'cat-' + String(i);

    if (params.viz.cat_info[inst_rc][cat_index].type === 'cat_strings'){
      type_name = params.viz.cat_names[inst_rc][cat_index]
      cat_types_names.push(type_name);
      cat_types_index.push(cat_index);
    }

  }

  var tmp_run_count = {};
  var cat_breakdown = [];
  var inst_breakdown = {};
  var bar_data;

  if (cat_types_names.length > 0){

    // 3: count instances of each category name for each category-type
    var cat_name;
    var num_in_clust = clust_names.length;
    _.each(cat_types_index, function(cat_index){

      inst_index = cat_index.split('-')[1];
      type_name = cat_types_names[inst_index];

      tmp_run_count[type_name] = {};

      // loop throught nodes and keep running count of categories
      _.each(clust_nodes, function (tmp_node){

        cat_name = tmp_node[cat_index];

        if (cat_name.indexOf(': ') >=0){
          cat_name = cat_name.split(': ')[1];
        }

        if (cat_name in tmp_run_count[type_name]){
          tmp_run_count[type_name][cat_name] = tmp_run_count[type_name][cat_name] + 1/num_in_clust;
        } else {
          tmp_run_count[type_name][cat_name] = 1/num_in_clust;
        }

      });

      inst_breakdown = {};
      inst_breakdown['type_name'] = type_name;

      // sort cat info in cat_breakdown
      bar_data = [];
      var maxSpeed = tmp_run_count[type_name]
      for (var vehicle in maxSpeed)
          bar_data.push([vehicle, maxSpeed[vehicle]])

      bar_data.sort(function(a, b) {
          return b[1] - a[1]
      })

      inst_breakdown['bar_data'] = bar_data;

      cat_breakdown.push(inst_breakdown);

    });

  }

  return cat_breakdown;
};