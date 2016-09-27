var update_viz_with_view = require('../network/update_viz_with_view');
var reset_other_filter_sliders = require('../filters/reset_other_filter_sliders');

module.exports = function external_update_view(filter_type, inst_state){

  // add something to control slider position
  /////////////////////////////////////////////

  var cgm = this;

  var requested_view = {};
  requested_view[filter_type] = inst_state;
  update_viz_with_view(this, requested_view);

  reset_other_filter_sliders(cgm, filter_type, inst_state);
};