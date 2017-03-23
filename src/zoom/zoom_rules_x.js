module.exports = function zoom_rules_x(params, zoom_info){

  var viz = params.viz;

  // zoom in the y direction before zooming in the x direction
  if (viz.zoom_ratio.x > 1){

    if (zoom_info.zoom_x < viz.zoom_ratio.x) {

      // remove this
      // zoom_info.trans_x = - params.viz.clust.margin.left;

      zoom_info.zoom_x = 1;
    } else {
      zoom_info.zoom_x = zoom_info.zoom_x / viz.zoom_ratio.x;

      // console.log('********* zoom_x: ' + String(zoom_info.zoom_x))

      // zoom_info.trans_x = zoom_info.trans_x + params.viz.x_offset;
      // zoom_info.trans_x = zoom_info.trans_x * (params.zoom_info.zoom_x/params.zoom_info.zoom_y);
    }
  }

  // calculate panning room available in the x direction
  zoom_info.pan_room_x = (zoom_info.zoom_x - 1) * viz.clust.dim.width;

  // console.log( 'pan_room_x: ' +  String(zoom_info.pan_room_x) + ' trans_x: ' + String(-zoom_info.trans_x))

  // no positive panning or panning more than pan_room
  if (zoom_info.trans_x > 0) {
    zoom_info.trans_x = 0;
    // console.log('no positive panning\n\n')
  }
  else if (zoom_info.trans_x <= -zoom_info.pan_room_x) {
    zoom_info.trans_x = -zoom_info.pan_room_x;
    // console.log('******* restrict pan room\n\n')
  }


  return zoom_info;
};