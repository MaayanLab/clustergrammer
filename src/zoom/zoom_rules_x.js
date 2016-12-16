module.exports = function zoom_rules_x(params){

  var zoom_info = params.zoom_info;

  // zoom in the y direction before zooming in the x direction
  if (params.viz.zoom_switch > 1){
    if (zoom_info.zoom_x < params.viz.zoom_switch) {
      zoom_info.trans_x = 0;
      zoom_info.zoom_x = 1;

      // // try to reset transltae
      // d3.event.translate[0] = 0

    } else {
      zoom_info.zoom_x = zoom_info.zoom_x / params.viz.zoom_switch;
    }
  }

  console.log('zoom_x: ' + String(zoom_info.zoom_x))
  console.log('zoom_y: ' + String(zoom_info.zoom_y))
  console.log('............................................')

  // calculate panning room available in the x direction
  zoom_info.pan_room_x = (zoom_info.zoom_x - 1) * params.viz.clust.dim.width;

  console.log('pan room: ' + String(-zoom_info.pan_room_x))
  // no positive panning or panning more than pan_room
  if (zoom_info.trans_x > 0) {
    console.log('------------ no positive panning')
    zoom_info.trans_x = 0;
  }
  else if (zoom_info.trans_x <= -zoom_info.pan_room_x) {
    console.log('**** pan room restriction \n*************************')
    zoom_info.trans_x = -zoom_info.pan_room_x;
  }

  console.log('corrected zoom_info: ' + String(zoom_info.trans_x))
  console.log('\n\n')

  return zoom_info;
};