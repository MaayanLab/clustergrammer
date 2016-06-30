var filter_network_using_new_nodes = require('./filter_network_using_new_nodes');
var update_viz_with_network = require('../update/update_viz_with_network');

module.exports = function filter_viz_using_nodes(new_nodes){

  var config = this.config;

  var new_network_data = filter_network_using_new_nodes(config, new_nodes);

  // add views back to filtered network
  new_network_data.views = this.config.network_data.views;

  update_viz_with_network(this, new_network_data);

}
