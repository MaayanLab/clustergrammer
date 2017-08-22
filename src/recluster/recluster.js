var clusterfck = require('cornhundred-clusterfck');
var core = require('mathjs/core');
var math = core.create();
var dist_fun = require('./distance_functions');
var get_order_and_groups_clusterfck_tree = require('./get_order_and_groups_clusterfck_tree');

math.import(require('mathjs/lib/function/matrix/transpose'));
math.import(require('mathjs/lib/type/matrix'));

module.exports = function recluster(cgm){
  /*
  Rows are clustered. Run transpose before if necessary
  */

  var inst_rc = 'row';
  var mat;
  var transpose = math.transpose;

  if (inst_rc === 'row'){
    mat = $.extend(true, [], cgm.params.network_data.mat);
  } else if (inst_rc === 'col'){
    mat = $.extend(true, [], cgm.params.network_data.mat);
    mat = transpose(mat);
  }

  // var dist_type = 'cosine';
  var dist_type = 'euclidean';
  var clusters = clusterfck.hcluster(mat, dist_fun[dist_type]);

  var names = cgm.params.network_data.row_nodes_names;

  var order_info = get_order_and_groups_clusterfck_tree(clusters, names);

  var inst_row;
  var inst_order;

  var new_view = {};
  new_view.N_row_sum = 'null';
  new_view.N_row_var = 'null';
  new_view.dist = 'euclidean';
  new_view.nodes = $.extend(true, [], cgm.config.network_data.views[0].nodes);

  // overwrite ordering with new ordering
  var name_nodes = 'row_nodes';
  var rows = new_view.nodes[name_nodes];

  for (var index=0; index < rows.length; index++){
    inst_row = rows[index];
    inst_order = order_info.info[index];

    // pass clust property to config view N_row_sum: 'all' [hacky]
    inst_row.clust = inst_order.order;
    inst_row.group = inst_order.group;

  }

  // add new view to views
  cgm.config.network_data.views.push(new_view);

  cgm.update_view('dist', 'euclidean');

};