module.exports = function zoom_rules_y(params, zoom_info){
  
  // zoom in the x direction before zooming in the y direction 
  if (params.viz.zoom_switch_y > 1){
    if (zoom_info.zoom_y < params.viz.zoom_switch_y){
      zoom_info.trans_y = 0;
      zoom_info.zoom_y = 1;
    } else {
      zoom_info.zoom_y = zoom_info.zoom_y / params.viz.zoom_switch_y;
    }
  }

  // calculate panning room available in the y direction 
  zoom_info.pan_room_y = (zoom_info.zoom_y - 1) * params.viz.clust.dim.height;

  // no positive panning or panning more than pan_room
  if (zoom_info.trans_y >= 0) {
    zoom_info.trans_y = 0;
  }
  else if (zoom_info.trans_y <= -zoom_info.pan_room_y) {
    zoom_info.trans_y = -zoom_info.pan_room_y;
  }  

  return zoom_info;
};