var filter_using_new_nodes = require('./filter_using_new_nodes');
var utils = require('../utils');

module.exports = function change_network_view(params, orig_network_data, requested_view) {

  var views = orig_network_data.views;
  var inst_view;
  var inst_value;
  var request_filters = _.keys(requested_view);

  // find a view that matches all of the requested view/filter-attributes 
  _.each(request_filters, function(inst_filter){

    inst_value = requested_view[inst_filter];

    if ( utils.has( views[0], inst_filter )){

      views = _.filter(views, function(d){
        return d[inst_filter] == inst_value;
      });

    }

  });

  inst_view = views[0];

  if (views.length > 1){
    // console.log('found more than one view')
    // console.log(views)
  }

  var new_network_data;

  // get new_network_data or default back to old_network_data 
  if (typeof inst_view !== 'undefined'){
    var new_nodes = inst_view.nodes;
    var links = orig_network_data.links;
    new_network_data = filter_using_new_nodes(params, new_nodes, links, views);
  } else {
    new_network_data = orig_network_data;
  }

  return new_network_data;
};
