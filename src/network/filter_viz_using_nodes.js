var filter_network_using_new_nodes = require('./filter_network_using_new_nodes');
var update_viz_with_network = require('../update/update_viz_with_network');

module.exports = function filter_viz_using_nodes(new_nodes){

  var new_network_data = filter_network_using_new_nodes(this.config, new_nodes);
  update_viz_with_network(this, new_network_data);

};