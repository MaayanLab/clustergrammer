var filter_network_using_new_nodes = require('./filter_network_using_new_nodes');
var update_viz_with_network = require('../update/update_viz_with_network');

module.exports = function filter_viz_using_names(names){

  var row_nodes = this.params.network_data.row_nodes;

  var found_nodes = $.grep(row_nodes, function(d){
    return $.inArray(d.name, names) > -1 ;
  });

  var new_nodes = {};
  new_nodes.row_nodes = found_nodes;
  new_nodes.col_nodes = this.params.network_data.col_nodes;

  var new_network_data = filter_network_using_new_nodes(this.config, new_nodes);
  update_viz_with_network(this, new_network_data);

};