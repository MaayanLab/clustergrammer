var filter_using_new_nodes = require('./filter_using_new_nodes');
var get_subset_views = require('../filters/get_subset_views');
var utils = require('../utils');

module.exports = function change_network_view(params, orig_network_data, requested_view) {

  var views = orig_network_data.views;
  var inst_view;

  console.log('***************')
  console.log(views.length)
  console.log(requested_view)

  ////////////////////////////////////////
  // tmp N_col_sum measure 
  ////////////////////////////////////////
  requested_view.N_col_sum = 30;

  views = get_subset_views(views, requested_view);

  inst_view = views[0];

  var new_network_data;

  // get new_network_data or default back to old_network_data 
  if (typeof inst_view !== 'undefined'){
    var new_nodes = inst_view.nodes;
    var links = orig_network_data.links;
    new_network_data = filter_using_new_nodes(params, new_nodes, links, views);
  } else {
    new_network_data = orig_network_data;
  }

  // pass on views 
  new_network_data.views = orig_network_data.views;

  return new_network_data;
};
