var ini_label_params = require('./ini_label_params');
var ini_viz_params = require('./ini_viz_params');
var set_viz_wrapper_size = require('../set_viz_wrapper_size');
var get_svg_dim = require('./get_svg_dim');
var calc_label_params = require('./calc_label_params');
var calc_clust_width = require('./calc_clust_width');
var calc_clust_height = require('./calc_clust_height');
var calc_val_max = require('./calc_val_max');
var calc_matrix_params = require('./calc_matrix_params');
var set_zoom_params = require('./set_zoom_params');
var calc_default_fs = require('./calc_default_fs');

module.exports = function calc_viz_params(params, preserve_cats=true){

  params.labels = ini_label_params(params);
  params.viz    = ini_viz_params(params, preserve_cats);

  set_viz_wrapper_size(params);

  params = get_svg_dim(params);
  params.viz = calc_label_params(params.viz);
  params.viz = calc_clust_width(params.viz);
  params.viz = calc_clust_height(params.viz);

  if (params.sim_mat){
    if (params.viz.clust.dim.width <= params.viz.clust.dim.height){
      params.viz.clust.dim.height = params.viz.clust.dim.width;
    } else {
      params.viz.clust.dim.width = params.viz.clust.dim.height;
    }
  }

  params = calc_val_max(params);
  params = calc_matrix_params(params);
  params = set_zoom_params(params);
  params = calc_default_fs(params);

  return params;
};