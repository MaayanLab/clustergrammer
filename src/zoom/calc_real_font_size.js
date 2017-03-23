 module.exports = function calc_real_font_size(params){

  var real_font_size = {};
  // zoom_switch behavior has to change with zoom_ratio.y
  if (params.viz.zoom_ratio.x > 1){
    real_font_size.row = params.labels.default_fs_row * params.zoom_behavior.scale();
    real_font_size.col = params.labels.default_fs_col * params.zoom_behavior.scale();
  } else {
    real_font_size.row = params.labels.default_fs_row * params.zoom_behavior.scale()/params.viz.zoom_ratio.y;
    real_font_size.col = params.labels.default_fs_col * params.zoom_behavior.scale();
  }

  return real_font_size;

 };