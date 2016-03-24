module.exports = function zoom_rules_y(params, zoom_info){
  
  // y - rules
  ///////////////////////////////////////////////////
  // available panning room in the y direction
  // multiple extra room (zoom - 1) by the width
  // always defined in the same way
  zoom_info.pan_room_y = (zoom_info.zoom_y - 1) * params.viz.clust.dim.height;

  if (zoom_info.trans_y >= 0) {
    // restrict transformation parameters
    // no panning in either direction
    zoom_info.trans_y = 0;
  }
  else if (zoom_info.trans_y <= -zoom_info.pan_room_y) {
    // restrict y pan to pan_room_y if necessary
    zoom_info.trans_y = -zoom_info.pan_room_y;
  }  

  return zoom_info;
};