var run_transformation = require('./run_transformation');

module.exports = function apply_zoom(params, trans_x, trans_y, zoom_x, zoom_y) {

  d3.selectAll('.tile_tip')
    .style('display','none' );

  // y - rules
  ///////////////////////////////////////////////////
  // available panning room in the y direction
  // multiple extra room (zoom - 1) by the width
  // always defined in the same way
  var pan_room_y = (zoom_x - 1) * params.viz.clust.dim.height;

  // do not translate if translate in y direction is positive
  if (trans_y >= 0) {
    // restrict transformation parameters
    // no panning in either direction
    trans_y = 0;
  }
  // restrict y pan to pan_room_y if necessary
  else if (trans_y <= -pan_room_y) {
    trans_y = -pan_room_y;
  }


  // x - rules
  ///////////////////////////////////////////////////
  // zoom in y direction only - translate in y only
  if (zoom_x < params.viz.zoom_switch) {
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

    // no panning in the positive direction
    if (trans_x > 0) {
      // restrict transformation parameters
      // no panning in the x direction
      trans_x = 0;
      // set zoom_x
      zoom_x = zoom_x / params.viz.zoom_switch;
    }
    // restrict panning to pan_room_x
    else if (trans_x <= -pan_room_x) {
      // restrict transformation parameters
      // no panning in the x direction
      trans_x = -pan_room_x;
      // set zoom_x
      zoom_x = zoom_x / params.viz.zoom_switch;
    }
    // allow two dimensional panning
    else {
      // restrict transformation parameters
      // set zoom_x
      zoom_x = zoom_x / params.viz.zoom_switch;
    }
  }

  run_transformation(params, zoom_x, zoom_y, trans_x, trans_y, pan_room_x, pan_room_y);

};
