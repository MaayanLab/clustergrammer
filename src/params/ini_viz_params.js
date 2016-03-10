module.exports = function set_viz_params(config, params){

  var viz = {};

  viz.viz_wrapper = config.root + ' .viz_wrapper';
  viz.do_zoom = config.do_zoom;
  viz.resize = config.resize;
  viz.background_color = config.background_color;
  viz.super_border_color = config.super_border_color;
  viz.outer_margins = config.outer_margins;
  viz.outer_margins_expand = config.outer_margins_expand;
  viz.expand = config.ini_expand;
  viz.uni_margin = config.uni_margin;
  viz.grey_border_width = config.grey_border_width;
  viz.show_dendrogram = config.show_dendrogram;
  viz.show_categories = {};
  viz.show_categories.row = config.show_categories.row;
  viz.show_categories.col = config.show_categories.col;
  viz.tile_click_hlight = config.tile_click_hlight;
  viz.inst_order = config.inst_order;
  viz.expand_button = config.expand_button;

  // the width normal labels is dependent on the length of the labels 
  var label_scale = d3.scale.linear()
    // min and max number of characters
    .domain([5, 15])
    // min and max of label width 
    .range([ 85, 120]).clamp('true');

  viz.norm_labels = {};
  viz.norm_labels.width = {};

  viz.norm_labels.width.row = label_scale(params.labels.row_max_char) 
    * params.row_label_scale;

  viz.norm_labels.width.col = label_scale(params.labels.col_max_char) 
    * params.col_label_scale;

  viz.viz_svg = viz.viz_wrapper + ' .viz_svg';
  viz.uni_duration = 1000;
  viz.spillover_col_slant = viz.norm_labels.width.col;
  viz.bottom_space = 5;
  viz.run_trans = false;
  viz.duration = 1000;

  if (viz.show_dendrogram){
    // setting config globally 
    config.group_level = {row: 5, col: 5};
  }

  // the border of the rects should be 1 over this value of the width/height
  // of the rects 
  viz.border_fraction = 55;

  if (config.force_square === 1) {
    viz.force_square = 1;
  }

  viz.num_col_nodes = params.network_data.col_nodes.length;
  viz.num_row_nodes = params.network_data.row_nodes.length;

  // superlabel dimensions 
  viz.super_labels = {};
  viz.super_labels.margin = {};
  viz.super_labels.dim = {};
  viz.super_labels.margin.left = viz.grey_border_width;
  viz.super_labels.margin.top  = viz.grey_border_width;
  if (params.labels.super_labels){
    viz.super_labels.dim.width = 25 * params.labels.super_label_scale;
  } else {
    viz.super_labels.dim.with = 0;
  }

  // category colorbar 
  viz.cat_room = {};
  viz.cat_room.symbol_width = 12;
  viz.cat_colors = {};

  if (viz.show_categories.row){
    viz.cat_room.row = 2 * viz.cat_room.symbol_width;
    viz.cat_colors.row = config.cat_colors.row;
  } else {
    viz.cat_room.row = viz.cat_room.symbol_width;
  }

  if (viz.show_categories.col){
    viz.cat_room.col = viz.cat_room.symbol_width;
    viz.cat_colors.col = config.cat_colors.col;
  } else {
    viz.cat_room.col = 0;
  }

  // dendro colorbar 
  viz.dendro_room = {};
  if (viz.show_dendrogram) {
    viz.dendro_room.symbol_width = 12;
  } else {
    viz.dendro_room.symbol_width = 0;
  }
  viz.dendro_room.row = viz.dendro_room.symbol_width;
  viz.dendro_room.col = viz.dendro_room.symbol_width + viz.uni_margin;

  return viz;
};