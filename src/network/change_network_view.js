var filter_using_new_nodes = require('./filter_using_new_nodes');
var utils = require('../utils');

module.exports = function change_network_view(params, orig_network_data, requested_view) {

  var views = orig_network_data.views;
  var inst_view;
  var inst_value;
  var request_filters = _.keys(requested_view);
  var found_filter;

  // find a view that matches all of the requested view/filter-attributes 
  _.each(request_filters, function(inst_filter){

    inst_value =  requested_view[inst_filter];

    // if the value is a number, then convert it to an integer 
    if ( /[^a-z_]/i.test( inst_value ) ){
      inst_value = parseInt(inst_value,10);
    } 

    // only run filtering if any of the views has the filter 
    found_filter = false;
    _.each(views, function(tmp_view){
      if ( utils.has(tmp_view, inst_filter) ){
        found_filter = true;
      }
    });

    if (found_filter){
      views = _.filter(views, function(d){
        return d[inst_filter] == inst_value;
      });
    }

  });

  inst_view = views[0];

  // if (views.length > 1){
    // console.log('found more than one view')
    // console.log(views)
  // }

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
