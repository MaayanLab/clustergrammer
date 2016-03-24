module.exports = function zoom_rules_x(params, zoom_info){
  
  // zoom in the y direction before zooming in the x direction 
  if (params.viz.zoom_switch > 1){

    // zoom in y direction only as long as rect width > rect height 
    if (zoom_info.zoom_x < params.viz.zoom_switch) {

      // zoom and translate in y direction only
      zoom_info.trans_x = 0;
      zoom_info.zoom_x = 1;

    }

    // exceed zoom_switch 
    else if (params.viz.zoom_switch > 1){

      // calculate panning room available in the x direction 
      zoom_info.pan_room_x = (zoom_info.zoom_x / params.viz.zoom_switch - 1) * params.viz.clust.dim.width;

      // reduce zoom_x using zoom_switch 
      zoom_info.zoom_x = zoom_info.zoom_x / params.viz.zoom_switch;

      // no positive panning or panning more than pan_room
      if (zoom_info.trans_x > 0) {
        zoom_info.trans_x = 0;
      }
      else if (zoom_info.trans_x <= -zoom_info.pan_room_x) {
        zoom_info.trans_x = -zoom_info.pan_room_x;
      }
      
    }
  }

  // zoom in the x direction first - only constrain x panning 
  if (params.viz.zoom_switch_y > 1){

    zoom_info.pan_room_x = (zoom_info.zoom_x - 1) * params.viz.clust.dim.width;

    // no positive panning or panning more than pan_room
    if (zoom_info.trans_x > 0) {
      zoom_info.trans_x = 0;
    }
    else if (zoom_info.trans_x <= -zoom_info.pan_room_x) {
      zoom_info.trans_x = -zoom_info.pan_room_x;
    }
      
  }  

  return zoom_info;
};