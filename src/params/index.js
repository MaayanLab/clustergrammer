// var crossfilter = require('crossfilter');
var change_network_view = require('../network/change_network_view');
var set_viz_wrapper_size = require('../set_viz_wrapper_size');
var is_force_square = require('./is_force_square');
var get_svg_dim = require('./get_svg_dim');
var ini_label_params = require('./ini_label_params');
var ini_viz_params = require('./ini_viz_params');
var ini_matrix_params = require('./ini_matrix_params');
var set_clust_width = require('./set_clust_width');
var calc_default_fs = require('./calc_default_fs');
var calc_matrix_params = require('./calc_matrix_params');
var calc_label_params = require('./calc_label_params');

/* 
Params: calculates the size of all the visualization elements in the
clustergram.
 */

module.exports = function make_params(input_config) {

  var config = $.extend(true, {}, input_config);
  var params = config;

  // when pre-loading the visualization using a view
  if (params.ini_view !== null) {
    params.network_data = change_network_view(params, params.network_data, params.ini_view);
    // disable pre-loading of view 
    params.ini_view = null;
  }

  params = ini_label_params(config, params);
  params = ini_viz_params(config, params);
  params = ini_matrix_params(config, params);

  set_viz_wrapper_size(params);

  params = get_svg_dim(params);

  params = calc_label_params(params);

  params.viz.clust = {};
  params.viz.clust.margin = {};
  params.viz.clust.margin.left = params.norm_label.margin.left + 
    params.norm_label.background.row;

  params.viz.clust.margin.top = params.norm_label.margin.top + 
    params.norm_label.background.col;

  params.colorbar_room = {};
  var tmp_colorbar_room = 0;
  params.colorbar_room.row = tmp_colorbar_room;
  params.colorbar_room.col = tmp_colorbar_room;

  params.viz.num_col_nodes = params.network_data.col_nodes.length;
  params.viz.num_row_nodes = params.network_data.row_nodes.length;

  params.viz.clust.dim = {};

  params = set_clust_width(params);
  params = is_force_square(params);

  if (config.force_square === 1) {
    params.viz.force_square = 1;
  }

  var enr_max = Math.abs(_.max(params.network_data.col_nodes, function (d) {
    return Math.abs(d.value);
  }).value);

  params.labels.bar_scale_col = d3.scale
    .linear()
    .domain([0, enr_max])
    .range([0, 0.75 * params.norm_label.width.col]);

  enr_max = Math.abs(_.max(params.network_data.row_nodes, function (d) {
    return Math.abs(d.value);
  }).value);
  params.labels.bar_scale_row = d3.scale
    .linear()
    .domain([0, enr_max])
    .range([0, params.norm_label.width.row]);

  params = calc_matrix_params(config, params);

  params.scale_font_offset = d3.scale
    .linear().domain([1, 0])
    .range([0.8, 0.5]);

  params = calc_default_fs(params);

  params.viz.border_width = params.matrix.x_scale.rangeBand() / params.viz.border_fraction;

  params.matrix.rect_width = params.matrix.x_scale.rangeBand() - 1 * params.viz.border_width;
  params.matrix.rect_height = params.matrix.y_scale.rangeBand() - 1 * params.viz.border_width / params.viz.zoom_switch;


  return params;
};
