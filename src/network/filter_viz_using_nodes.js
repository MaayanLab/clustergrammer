var filter_network_using_new_nodes = require('./filter_network_using_new_nodes');
var update_viz_with_network = require('../update/update_viz_with_network');

module.exports = function filter_viz_using_nodes(){

  var config = this.config;
  var new_nodes = this.params.network_data.views[4].nodes;

  var new_network_data = filter_network_using_new_nodes(config, new_nodes);

  update_viz_with_network(this, new_network_data);


}
