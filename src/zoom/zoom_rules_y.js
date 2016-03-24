module.exports = function zoom_rules_y(params, zoom_info){
  
  // console.log('\n\nx and y switch')
  // console.log(params.viz.zoom_switch)
  // console.log(params.viz.zoom_switch_y)

  zoom_info.pan_room_y = 0;

  // zoom in the y direction first - only constrain y panning 
  if (params.viz.zoom_switch > 1){

    zoom_info.pan_room_y = (zoom_info.zoom_y - 1) * params.viz.clust.dim.height;

    // no positive panning or panning more than pan_room
    if (zoom_info.trans_y >= 0) {
      zoom_info.trans_y = 0;
    }
    else if (zoom_info.trans_y <= -zoom_info.pan_room_y) {
      zoom_info.trans_y = -zoom_info.pan_room_y;
    }  

  }

  return zoom_info;
};