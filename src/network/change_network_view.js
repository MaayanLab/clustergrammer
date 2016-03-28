var filter_using_new_nodes = require('./filter_using_new_nodes');

module.exports = function change_network_view(params, orig_network_data, requested_view) {

  var views = orig_network_data.views;
  var filter_type = Object.keys(requested_view);
  var filter_value = requested_view[filter_type];

  var inst_view = _.filter(views, function(d){
    return d[filter_type]==filter_value;
  });

  if (inst_view.length==1){
    inst_view = inst_view[0];
  } else {
    console.log('\n\n----- found more than one view')
    console.log(inst_view)
    inst_view = inst_view[0];
  }

  var new_network_data;

  if (typeof inst_view !== 'undefined'){
    var new_nodes = inst_view.nodes;
    var links = orig_network_data.links;
    new_network_data = filter_using_new_nodes(params, new_nodes, links, views);
  } else {
    new_network_data = orig_network_data;
  }

  return new_network_data;
};
