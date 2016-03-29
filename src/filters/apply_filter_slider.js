var update_network = require('../network/update_network');
var reset_other_filter_sliders = require('./reset_other_filter_sliders');
var get_current_orders = require('./get_current_orders');

module.exports = function apply_filter_slider(config, params, filter_type, available_views){

  // get value
  var inst_index = $( params.root+' .slider_'+filter_type ).slider( "value" );
  var inst_state = available_views[inst_index][filter_type];
  var requested_view = {};
  requested_view[filter_type] = inst_state;

  reset_other_filter_sliders(params, filter_type, inst_state);

  params = get_current_orders(params);
  
  params = update_network(config, params, requested_view);

  return params;

};