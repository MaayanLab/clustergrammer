var get_svg_dim = require('../params/get_svg_dim');
var is_force_square = require('../params/is_force_square');
var calc_clust_width = require('../params/calc_clust_width');
var calc_default_fs = require('../params/calc_default_fs');

module.exports = function recalc_params_for_resize(params){

  // Resetting some visualization parameters
  params = get_svg_dim(params);
  params.viz = calc_clust_width(params.viz);
  params.viz = is_force_square(params.viz);  

  // zoom_switch from 1 to 2d zoom
  params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

  // zoom_switch can not be less than 1
  if (params.viz.zoom_switch < 1) {
    params.viz.zoom_switch = 1;
  }

  // redefine x_scale and y_scale rangeBands
  params.viz.x_scale.rangeBands([0, params.viz.clust.dim.width]);
  params.viz.y_scale.rangeBands([0, params.viz.clust.dim.height]);

  // precalc rect_width and height
  params.matrix.rect_width = params.viz.x_scale.rangeBand();
  params.matrix.rect_height = params.viz.y_scale.rangeBand();

  // redefine zoom extent
  params.viz.real_zoom = params.viz.norm_labels.width.col / (params.matrix.rect_width/2);

  // redefine border width
  params.viz.border_width = params.matrix.rect_width / 55;

  // the default font sizes are set here
  params = calc_default_fs(params);

  return params;
};