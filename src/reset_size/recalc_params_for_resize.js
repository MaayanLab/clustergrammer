var get_svg_dim = require('../params/get_svg_dim');
var calc_clust_height = require('../params/calc_clust_height');
var calc_clust_width = require('../params/calc_clust_width');
var calc_default_fs = require('../params/calc_default_fs');
var calc_zoom_switching = require('../zoom/calc_zoom_switching');

module.exports = function recalc_params_for_resize(params){

  // Resetting some visualization parameters
  params = get_svg_dim(params);
  params.viz = calc_clust_width(params.viz);
  params.viz = calc_clust_height(params.viz);  

  if (params.sim_mat){
    if (params.viz.clust.dim.width <= params.viz.clust.dim.height){
      params.viz.clust.dim.height = params.viz.clust.dim.width;
    } else {
      params.viz.clust.dim.width = params.viz.clust.dim.height;
    }
  }
  
  params.viz = calc_zoom_switching(params.viz);
  
  // redefine x_scale and y_scale rangeBands
  params.viz.x_scale.rangeBands([0, params.viz.clust.dim.width]);
  params.viz.y_scale.rangeBands([0, params.viz.clust.dim.height]);

  // precalc rect_width and height
  params.viz.rect_width = params.viz.x_scale.rangeBand();
  params.viz.rect_height = params.viz.y_scale.rangeBand();

  // redefine zoom extent
  params.viz.real_zoom = params.viz.norm_labels.width.col / (params.viz.rect_width/2);

  // redefine border width
  params.viz.border_width = params.viz.rect_width / 55;

  // the default font sizes are set here
  params = calc_default_fs(params);

  return params;
};