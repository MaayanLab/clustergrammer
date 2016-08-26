module.exports = function zoom_rules_x(params, zoom_info){
  
  // zoom in the y direction before zooming in the x direction 
  if (params.viz.zoom_switch > 1){
    if (zoom_info.zoom_x < params.viz.zoom_switch) {
      zoom_info.trans_x = 0;
      zoom_info.zoom_x = 1;
    } else {
      zoom_info.zoom_x = zoom_info.zoom_x / params.viz.zoom_switch;
    }
  }

  // calculate panning room available in the x direction 
  zoom_info.pan_room_x = (zoom_info.zoom_x - 1) * params.viz.clust.dim.width;

  // no positive panning or panning more than pan_room
  if (zoom_info.trans_x > 0) {
    zoom_info.trans_x = 0;
  }
  else if (zoom_info.trans_x <= -zoom_info.pan_room_x) {
    zoom_info.trans_x = -zoom_info.pan_room_x;
  }

  return zoom_info;
};