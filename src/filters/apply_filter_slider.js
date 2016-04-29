var update_network = require('../network/update_network');
var reset_other_filter_sliders = require('./reset_other_filter_sliders');
var get_current_orders = require('./get_current_orders');
var make_requested_view = require('./make_requested_view');

module.exports = function apply_filter_slider(cgm, filter_type, available_views){

  var params = cgm.params;

  // get value
  var inst_index = $( params.root+' .slider_'+filter_type ).slider( "value" );
  var inst_state = available_views[inst_index][filter_type];

  reset_other_filter_sliders(params, filter_type, inst_state);

  params = get_current_orders(params);
  
  var requested_view = {};
  requested_view[filter_type] = inst_state;

  requested_view = make_requested_view(params, requested_view);  

  if ( _.has(available_views[0],'enr_score_type') ){
    var enr_state = d3.select(params.root+' .toggle_enr_score_type')
      .attr('current_state');

    requested_view.enr_score_type = enr_state;
  } 

  params = update_network(cgm, requested_view);

  return params;

};