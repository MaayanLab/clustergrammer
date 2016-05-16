module.exports = function get_actual_zoom(params, inst_rc){

  var inst_zoom;
  if (inst_rc === 'row'){
    if (params.viz.zoom_switch_y>1){
      inst_zoom = params.zoom_behavior.scale()/params.viz.zoom_switch_y;
    } else {
      inst_zoom = params.zoom_behavior.scale();
    }
  } else {
    if (params.viz.zoom_switch > 1){
      inst_zoom = params.zoom_behavior.scale()/params.viz.zoom_switch;
    } else {
      inst_zoom = params.zoom_behavior.scale();
    }
  } 

  return inst_zoom;
};