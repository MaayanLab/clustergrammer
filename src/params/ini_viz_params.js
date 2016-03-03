module.exports = function set_viz_params(config, params){

  params.viz = {};

  params.viz.viz_wrapper = config.root + ' .viz_wrapper';
  params.viz.do_zoom = config.do_zoom;
  params.viz.resize = config.resize;
  params.viz.background_color = config.background_color;
  params.viz.super_border_color = config.super_border_color;
  params.viz.outer_margins = config.outer_margins;
  params.viz.outer_margins_expand = config.outer_margins_expand;
  params.viz.expand = config.ini_expand;
  params.viz.uni_margin = config.uni_margin;
  params.viz.grey_border_width = config.grey_border_width;
  params.viz.show_dendrogram = config.show_dendrogram;
  params.viz.tile_click_hlight = config.tile_click_hlight;
  params.viz.inst_order = config.inst_order;
  params.viz.expand_button = config.expand_button;

  // the width normal labels is dependent on the length of the labels 
  var label_scale = d3.scale.linear()
    // min and max number of characters
    .domain([5, 15])
    // min and max of label width 
    .range([ 85, 120]).clamp('true');

  params.viz.norm_labels = {};
  params.viz.norm_labels.width = {};

  params.viz.norm_labels.width.row = label_scale(params.labels.row_max_char) 
    * params.row_label_scale;

  params.viz.norm_labels.width.col = label_scale(params.labels.col_max_char) 
    * params.col_label_scale;

  params.viz.viz_svg = params.viz.viz_wrapper + ' .viz_svg';
  params.viz.uni_duration = 1000;
  params.viz.spillover_col_slant = params.viz.norm_labels.width.col;
  params.viz.bottom_space = 15;
  params.viz.run_trans = false;
  params.viz.duration = 1000;

  if (params.viz.show_dendrogram){
    // setting config globally 
    config.group_level = {row: 5, col: 5};
  }

  params.sidebar = {};
  params.sidebar.sidebar_class = 'sidebar_wrapper';

  // the border of the rects should be 1 over this value of the width/height
  // of the rects 
  params.viz.border_fraction = 55;

  if (config.force_square === 1) {
    params.viz.force_square = 1;
  }

  params.viz.num_col_nodes = params.network_data.col_nodes.length;
  params.viz.num_row_nodes = params.network_data.row_nodes.length;

  // superlabel dimensions 
  params.viz.super_labels = {};
  params.viz.super_labels.margin = {};
  params.viz.super_labels.dim = {};
  params.viz.super_labels.margin.left = params.viz.grey_border_width;
  params.viz.super_labels.margin.top  = params.viz.grey_border_width;
  if (params.labels.super_labels){
    params.viz.super_labels.dim.width = 25 * params.labels.super_label_scale;
  } else {
    params.viz.super_labels.dim.with = 0;
  }

  // category colorbar 
  params.viz.cat_room = {};
  params.viz.cat_room.symbol_width = 11;
  if (params.viz.show_dendrogram) {
    params.viz.cat_room.row = 2 * params.viz.cat_room.symbol_width;
    params.viz.cat_room.col = params.viz.cat_room.symbol_width;
  } else {
    params.viz.cat_room.row = params.viz.cat_room.symbol_width;
    params.viz.cat_room.col = 0;
  }

  // dendro colorbar 
  params.viz.dendro_room = {};
  params.viz.dendro_room.symbol_width = 0;
  params.viz.dendro_room.row = params.viz.dendro_room.symbol_width;
  params.viz.dendro_room.col = params.viz.dendro_room.symbol_width;

  return params;
};