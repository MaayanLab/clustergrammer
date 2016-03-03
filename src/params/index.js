// var crossfilter = require('crossfilter');
var change_network_view = require('../network/change_network_view');
var set_viz_wrapper_size = require('../set_viz_wrapper_size');
var is_force_square = require('./is_force_square');
var get_svg_dim = require('./get_svg_dim');
var ini_label_params = require('./ini_label_params');
var ini_viz_params = require('./ini_viz_params');
var ini_matrix_params = require('./ini_matrix_params');
var calc_clust_width = require('./calc_clust_width');
var calc_default_fs = require('./calc_default_fs');
var calc_matrix_params = require('./calc_matrix_params');
var calc_label_params = require('./calc_label_params');
var calc_val_max = require('./calc_val_max');
var set_zoom_params = require('./set_zoom_params');

/* 
Params: calculates the size of all the visualization elements in the
clustergram.
 */

module.exports = function make_params(input_config) {

  var config = $.extend(true, {}, input_config);
  var params = config;

  // when pre-loading the visualization using a view
  if (params.ini_view !== null) {
    
    params.network_data = change_network_view(params, params.network_data, 
      params.ini_view);

    // disable pre-loading of view 
    params.ini_view = null;
  }

  params = ini_label_params(config, params);
  params = ini_viz_params(config, params);
  params = ini_matrix_params(config, params);

  set_viz_wrapper_size(params);

  params = get_svg_dim(params);
  params.viz = calc_label_params(params.viz);
  params.viz = calc_clust_width(params.viz);
  params = is_force_square(params);
  params = calc_val_max(params);

  params = calc_matrix_params(config, params);
  params = set_zoom_params(params);

  params = calc_default_fs(params);

  // rect width needs matrix and zoom parameters 
  params.matrix.rect_width  = params.matrix.x_scale.rangeBand() 
    - params.viz.border_width;

  params.matrix.rect_height = params.matrix.y_scale.rangeBand() 
    - params.viz.border_width / params.viz.zoom_switch;

  return params;
};
