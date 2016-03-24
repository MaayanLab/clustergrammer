var run_transformation = require('./run_transformation');
var zoom_rules_y = require('./zoom_rules_y');

module.exports = function apply_zoom(params, zoom_info) {

  zoom_info = zoom_rules_y(params, zoom_info);

  // manual y restrictions 
  ///////////////////////////
  // trans_y = 0;
  // zoom_y = 1;

  // x - rules
  ///////////////////////////////////////////////////
  if (zoom_info.zoom_x < params.viz.zoom_switch) {

    // zoom in y direction only - translate in y only
    // no x translate or zoom
    zoom_info.trans_x = 0;
    zoom_info.zoom_x = 1;

  }
  else {

    // zoom in both directions
    // scale is greater than params.viz.zoom_switch
    // available panning room in the x direction
    // multiple extra room (zoom - 1) by the width
    var pan_room_x = (zoom_info.zoom_x / params.viz.zoom_switch - 1) * params.viz.clust.dim.width;

    if (zoom_info.trans_x > 0) {
      // no panning in the positive direction
      // restrict transformation parameters
      // no panning in the x direction
      zoom_info.trans_x = 0;
      zoom_info.zoom_x = zoom_info.zoom_x / params.viz.zoom_switch;

    }
    else if (zoom_info.trans_x <= -pan_room_x) {
      // restrict panning to pan_room_x
      // restrict transformation parameters
      // no panning in the x direction
      zoom_info.trans_x = -pan_room_x;
      zoom_info.zoom_x = zoom_info.zoom_x / params.viz.zoom_switch;

    }
    else {
      // allow two dimensional panning
      // restrict transformation parameters
      zoom_info.zoom_x = zoom_info.zoom_x / params.viz.zoom_switch;

    }
  }

  run_transformation(params, zoom_info);

};
