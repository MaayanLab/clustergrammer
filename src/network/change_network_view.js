var utils = require('../utils');
var filter_using_new_nodes = require('./filter_using_new_nodes');

module.exports = function(params, orig_network_data, change_view) {

  var views = orig_network_data.views;
  var filter_type = Object.keys(change_view);
  var filter_value = change_view[filter_type];

  var inst_view = _.filter(views, function(d){return d[filter_type]==filter_value;})[0];

  if (typeof inst_view !== 'undefined'){

    var new_nodes = inst_view.nodes;
    var links = orig_network_data.links;
    new_network_data = filter_using_new_nodes(params, new_nodes, links, views);

  } else {
    new_network_data = orig_network_data;
  }

  return new_network_data;
};
