module.exports = function set_viz_params(config, params){

  params.viz = {};

  params.viz.spillover_x_offset = params.norm_label.width.col;

  params.viz.viz_wrapper = config.root + ' .viz_wrapper';
  params.viz.viz_svg = params.viz.viz_wrapper + ' .viz_svg';

  params.sidebar = {};
  params.sidebar.sidebar_class = 'sidebar_wrapper';

  params.viz.do_zoom = config.do_zoom;
  params.viz.resize = config.resize;
  // background colors
  params.viz.background_color = config.background_color;
  params.viz.super_border_color = config.super_border_color;
  // margin widths
  params.viz.outer_margins = config.outer_margins;
  params.viz.outer_margins_expand = config.outer_margins_expand;
  params.viz.expand = config.ini_expand;
  params.viz.uni_margin = config.uni_margin;
  params.viz.grey_border_width = config.grey_border_width;
  params.viz.show_dendrogram = config.show_dendrogram;
  params.viz.tile_click_hlight = config.tile_click_hlight;

  params.viz.uni_duration = 1000;

  params.viz.inst_order = config.inst_order;

  params.viz.expand_button = config.expand_button;

  params.viz.bottom_space = 15;

  return params;
};