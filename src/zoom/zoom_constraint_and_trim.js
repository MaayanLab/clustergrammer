var constrain_font_size = require('./constrain_font_size');
var still_zooming = require('./still_zooming');

module.exports = function zoom_constraint_and_trim(params, zoom_info){

  constrain_font_size(params);

  // // run text trim with delay 
  // var prev_zoom = params.zoom_behavior.scale();
  // setTimeout(still_zooming, 1500, params, prev_zoom);

};