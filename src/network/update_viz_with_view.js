var make_network_using_view = require('./make_network_using_view');
var disable_sidebar = require('../sidebar/disable_sidebar');
var update_viz_with_network = require('../update/update_viz_with_network');

module.exports = function update_network_with_view(cgm, requested_view) {

  disable_sidebar(cgm.params);

  // make new_network_data by filtering the original network data
  var new_network_data = make_network_using_view(cgm.config, cgm.params,
    requested_view);

  update_viz_with_network(cgm, new_network_data);

};
