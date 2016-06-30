var change_network_view = require('./change_network_view');
var disable_sidebar = require('../sidebar/disable_sidebar');
var update_viz_with_network = require('../update/update_viz_with_network');

module.exports = function update_network_with_view(cgm, requested_view) {
  var old_params = cgm.params;
  var config = cgm.config;

  disable_sidebar(old_params);

  // make new_network_data by filtering the original network data
  var config_copy = jQuery.extend(true, {}, config);

  var new_network_data = change_network_view(old_params,
    config_copy.network_data, requested_view);

  update_viz_with_network(cgm, config, old_params, new_network_data);

};
