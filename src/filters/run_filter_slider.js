var update_viz_with_view = require('../network/update_viz_with_view');
var reset_other_filter_sliders = require('./reset_other_filter_sliders');
var get_current_orders = require('./get_current_orders');
var make_requested_view = require('./make_requested_view');

module.exports = function run_filter_slider(cgm, filter_type, available_views, inst_index){

  var params = cgm.params;

  // get value
  var inst_state = available_views[inst_index][filter_type];

  // console.log('fix this')
  reset_other_filter_sliders(cgm, filter_type, inst_state);

  params = get_current_orders(params);

  var requested_view = {};
  requested_view[filter_type] = inst_state;

  requested_view = make_requested_view(params, requested_view);

  if ( _.has(available_views[0],'enr_score_type') ){
    var enr_state = d3.select(params.root+' .toggle_enr_score_type')
      .attr('current_state');

    requested_view.enr_score_type = enr_state;
  }

  update_viz_with_view(cgm, requested_view);

};