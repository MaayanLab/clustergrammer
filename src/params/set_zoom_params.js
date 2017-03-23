var calc_zoom_switching = require('../zoom/calc_zoom_switching');

module.exports = function set_zoom_params(params){

  params.viz.zoom_scale_font = {};
  params.viz.zoom_scale_font.row = 1;
  params.viz.zoom_scale_font.col = 1;

  var max_zoom_limit = 0.75;
  var half_col_height = (params.viz.x_scale.rangeBand() / 2);
  params.viz.square_zoom = (params.viz.norm_labels.width.col / half_col_height )*max_zoom_limit;

  params.viz = calc_zoom_switching(params.viz);

  return params;
};