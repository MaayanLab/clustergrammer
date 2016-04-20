// var crossfilter = require('crossfilter');
var change_network_view = require('../network/change_network_view');
var set_viz_wrapper_size = require('../set_viz_wrapper_size');
var calc_clust_width = require('./calc_clust_width');
var calc_clust_height = require('./calc_clust_height');
var get_svg_dim = require('./get_svg_dim');
var ini_label_params = require('./ini_label_params');
var ini_viz_params = require('./ini_viz_params');
var ini_matrix_params = require('./ini_matrix_params');
var calc_default_fs = require('./calc_default_fs');
var calc_matrix_params = require('./calc_matrix_params');
var calc_label_params = require('./calc_label_params');
var calc_val_max = require('./calc_val_max');
var set_zoom_params = require('./set_zoom_params');
var ini_sidebar_params = require('./ini_sidebar_params');
var make_requested_view = require('../filters/make_requested_view');
var get_available_filters = require('./get_available_filters');

/* 
Params: calculates the size of all the visualization elements in the
clustergram.
 */

module.exports = function make_params(input_config) {

  var config = $.extend(true, {}, input_config);
  var params = config;

  // when pre-loading the visualization using a view
  if (params.ini_view !== null) {

    var requested_view = params.ini_view;

    var filters = get_available_filters(params.network_data.views);

    params.viz = {};
    params.viz.possible_filters = filters.possible_filters;
    params.viz.filter_data = filters.filter_data;

    requested_view = make_requested_view(params, requested_view);  

    // requested_view.enr_score_type = 'combined_score';

    params.network_data = change_network_view(params, params.network_data, requested_view);

  }

  params.labels = ini_label_params(config, params.network_data);
  params.viz    = ini_viz_params(config, params);

  params.matrix = ini_matrix_params(config, params.viz, params.network_data);

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
  params = calc_matrix_params(config, params);
  params = set_zoom_params(params);
  params = calc_default_fs(params);

  if (params.use_sidebar){
    params.sidebar = ini_sidebar_params(params);
  }

  return params;
};
