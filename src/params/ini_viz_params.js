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

  params.viz.viz_svg = params.viz.viz_wrapper + ' .viz_svg';
  params.viz.uni_duration = 1000;
  params.viz.spillover_x_offset = params.norm_label.width.col;
  params.viz.bottom_space = 15;
  params.viz.run_trans = false;
  params.viz.duration = 1000;

  if (params.viz.show_dendrogram){
    // setting config globally 
    config.group_level = {row: 5, col: 5};
  }

  params.cat_room = {};
  params.cat_room.symbol_width = 11;
  if (params.viz.show_dendrogram) {
    params.cat_room.row = 2 * params.cat_room.symbol_width;
    params.cat_room.col = params.cat_room.symbol_width;
  } else {
    params.cat_room.row = params.cat_room.symbol_width;
    params.cat_room.col = 0;
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


  var colorbar_room = 0;
  params.viz.colorbar_room = {};
  params.viz.colorbar_room.row = colorbar_room;
  params.viz.colorbar_room.col = colorbar_room;

  return params;
};