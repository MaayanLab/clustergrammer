var utils = require('../Utils_clust');
var get_available_filters = require('./get_available_filters');
var calc_cat_params = require('./calc_cat_params');

module.exports = function ini_viz_params(config, params){

  var viz = {};

  viz.root = config.root;
  viz.viz_wrapper = config.root + ' .viz_wrapper';
  viz.do_zoom = config.do_zoom;
  viz.background_color = config.background_color;
  viz.super_border_color = config.super_border_color;
  viz.outer_margins = config.outer_margins;
  viz.is_expand = config.ini_expand;
  viz.grey_border_width = config.grey_border_width;
  viz.show_dendrogram = config.show_dendrogram;
  viz.tile_click_hlight = config.tile_click_hlight;
  viz.inst_order = config.inst_order;
  viz.expand_button = config.expand_button;
  viz.sim_mat = config.sim_mat;
  viz.dendro_filter = config.dendro_filter;

  viz.viz_svg = viz.viz_wrapper + ' .viz_svg';

  viz.zoom_element = viz.viz_wrapper + ' .viz_svg';

  viz.uni_duration = 1000;
  viz.bottom_space = 5;
  viz.run_trans = false;
  viz.duration = 1000;
  if (viz.show_dendrogram){
    config.group_level = {};
  }

  viz.resize = config.resize;
  if (utils.has(config, 'size')){
    viz.fixed_size = config.size;
  } else {
    viz.fixed_size = false;
  }

  // width is 1 over this value
  viz.border_fraction = 55;
  viz.uni_margin = 5;

  viz.super_labels = {};
  viz.super_labels.margin = {};
  viz.super_labels.dim = {};
  viz.super_labels.margin.left = viz.grey_border_width;
  viz.super_labels.margin.top  = viz.grey_border_width;
  viz.super_labels.dim.width = 0;
  if (params.labels.super_labels){
    viz.super_labels.dim.width = 15 * params.labels.super_label_scale;
  }


  viz.triangle_opacity = 0.6;

  viz.norm_labels = {};
  viz.norm_labels.width = {};

  viz.dendro_room = {};
  if (viz.show_dendrogram) {
    viz.dendro_room.symbol_width = 10;
  } else {
    viz.dendro_room.symbol_width = 0;
  }

  viz = calc_cat_params(config, params, viz);

  viz.dendro_opacity = 0.35;

  viz.spillover_col_slant = viz.norm_labels.width.col;

  var filters = get_available_filters(params.network_data.views);

  viz.possible_filters = filters.possible_filters;
  viz.filter_data = filters.filter_data;

  return viz;
};