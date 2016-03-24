var run_transformation = require('./run_transformation');

module.exports = function apply_zoom(params, trans_x, trans_y, zoom_x, zoom_y) {

  // y - rules
  ///////////////////////////////////////////////////
  // available panning room in the y direction
  // multiple extra room (zoom - 1) by the width
  // always defined in the same way
  var pan_room_y = (zoom_y - 1) * params.viz.clust.dim.height;

  if (trans_y >= 0) {
    // restrict transformation parameters
    // no panning in either direction
    trans_y = 0;
  }
  else if (trans_y <= -pan_room_y) {
    // restrict y pan to pan_room_y if necessary
    trans_y = -pan_room_y;
  }

  // manual y restrictions 
  ///////////////////////////
  // trans_y = 0;
  // zoom_y = 1;

  // x - rules
  ///////////////////////////////////////////////////
  if (zoom_x < params.viz.zoom_switch) {

    // zoom in y direction only - translate in y only
    // no x translate or zoom
    trans_x = 0;
    zoom_x = 1;

  }
  else {

    // zoom in both directions
    // scale is greater than params.viz.zoom_switch
    // available panning room in the x direction
    // multiple extra room (zoom - 1) by the width
    var pan_room_x = (zoom_x / params.viz.zoom_switch - 1) * params.viz.clust.dim.width;

    if (trans_x > 0) {
      // no panning in the positive direction
      // restrict transformation parameters
      // no panning in the x direction
      trans_x = 0;
      zoom_x = zoom_x / params.viz.zoom_switch;

    }
    else if (trans_x <= -pan_room_x) {
      // restrict panning to pan_room_x
      // restrict transformation parameters
      // no panning in the x direction
      trans_x = -pan_room_x;
      zoom_x = zoom_x / params.viz.zoom_switch;

    }
    else {
      // allow two dimensional panning
      // restrict transformation parameters
      zoom_x = zoom_x / params.viz.zoom_switch;

    }
  }

  run_transformation(params, zoom_x, zoom_y, trans_x, trans_y, pan_room_y);

};
