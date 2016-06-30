var filter_network_using_new_nodes = require('./filter_network_using_new_nodes');
var get_subset_views = require('../filters/get_subset_views');

module.exports = function make_network_using_view(cgm, requested_view) {

  var orig_views = cgm.config.network_data.views;

  var is_enr = false;
  if (_.has(orig_views[0], 'enr_score_type')){
    is_enr = true;
  }

  var sub_views = get_subset_views(cgm.params, orig_views, requested_view);

  //////////////////////////////
  // Enrichr specific rules
  //////////////////////////////
  if (is_enr && sub_views.length == 0){
    requested_view = {'N_row_sum':'all', 'N_col_sum':'10'};
    sub_views = get_subset_views(cgm.params, orig_views, requested_view);
  }

  var inst_view = sub_views[0];

  var new_network_data;

  // get new_network_data or default back to old_network_data
  if (typeof inst_view !== 'undefined'){
    var new_nodes = inst_view.nodes;
    new_network_data = filter_network_using_new_nodes(cgm, new_nodes);
  } else {
    new_network_data = cgm.config.network_data;
  }

  // add back all views
  new_network_data.views = orig_views;

  return new_network_data;
};
