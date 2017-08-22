var update_viz_with_view = require('../network/update_viz_with_view');
var reset_other_filter_sliders = require('../filters/reset_other_filter_sliders');

module.exports = function update_view(cgm, filter_type, inst_state){

  // add something to control slider position
  /////////////////////////////////////////////

  var requested_view = {};
  requested_view[filter_type] = inst_state;
  update_viz_with_view(cgm, requested_view);

  reset_other_filter_sliders(cgm, filter_type, inst_state);
};