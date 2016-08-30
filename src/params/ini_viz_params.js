var utils = require('../Utils_clust');
var get_available_filters = require('./get_available_filters');
var make_cat_params = require('./make_cat_params');

module.exports = function ini_viz_params(params, preserve_cats=true){

  var viz = {};

  viz.root = params.root;
  viz.viz_wrapper = params.root + ' .viz_wrapper';
  viz.do_zoom = params.do_zoom;
  viz.background_color = params.background_color;
  viz.super_border_color = params.super_border_color;
  viz.outer_margins = params.outer_margins;
  viz.is_expand = params.ini_expand;
  viz.grey_border_width = params.grey_border_width;
  viz.show_dendrogram = params.show_dendrogram;
  viz.tile_click_hlight = params.tile_click_hlight;
  viz.inst_order = params.inst_order;
  viz.expand_button = params.expand_button;
  viz.sim_mat = params.sim_mat;
  viz.dendro_filter = params.dendro_filter;

  viz.viz_svg = viz.viz_wrapper + ' .viz_svg';

  viz.zoom_element = viz.viz_wrapper + ' .viz_svg';

  viz.uni_duration = 1000;
  viz.bottom_space = 5;
  viz.run_trans = false;
  viz.duration = 1000;
  if (viz.show_dendrogram){
    params.group_level = {};
  }

  viz.resize = params.resize;
  if (utils.has(params, 'size')){
    viz.fixed_size = params.size;
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

  viz.cat_colors = params.cat_colors;

  viz = make_cat_params(params, viz, preserve_cats);

  if (_.has(params, 'group_level')){
    params.group_level.row = 5;
    params.group_level.col = 5;
  }

  viz.dendro_opacity = 0.35;

  viz.spillover_col_slant = viz.norm_labels.width.col;

  var filters = get_available_filters(params.network_data.views);

  viz.possible_filters = filters.possible_filters;
  viz.filter_data = filters.filter_data;

  return viz;
};