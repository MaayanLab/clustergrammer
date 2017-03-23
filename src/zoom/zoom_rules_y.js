module.exports = function zoom_rules_y(params, zoom_info){

  var viz = params.viz;
  // zoom in the x direction before zooming in the y direction
  if (viz.zoom_ratio.y > 1){
    if (zoom_info.zoom_y < viz.zoom_ratio.y){
      zoom_info.trans_y = 0;
      zoom_info.zoom_y = 1;
    } else {
      zoom_info.zoom_y = zoom_info.zoom_y / viz.zoom_ratio.y;
    }
  }

  // calculate panning room available in the y direction
  zoom_info.pan_room_y = (zoom_info.zoom_y - 1) * viz.clust.dim.height;

  // console.log( 'pan_room_y: ' +  String(zoom_info.pan_room_y) + ' ' + String(-zoom_info.trans_y))

  // no positive panning or panning more than pan_room
  if (zoom_info.trans_y >= 0) {
    zoom_info.trans_y = 0;
    // console.log('y no positive panning\n\n')
  }
  else if (zoom_info.trans_y <= -zoom_info.pan_room_y) {
    zoom_info.trans_y = -zoom_info.pan_room_y;
    // console.log('y restrict pan room \n\n')
  }

  return zoom_info;
};