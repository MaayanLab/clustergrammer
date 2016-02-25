module.exports = function set_matrix_params(config, params){

  params.matrix = {};
  params.matrix.tile_colors = config.tile_colors;
  params.matrix.bar_colors = config.bar_colors;
  params.matrix.outline_colors = config.outline_colors;
  params.matrix.hlight_color = config.highlight_color;
  params.matrix.tile_title = config.tile_title;
  params.matrix.show_tile_tooltips = config.show_tile_tooltips;
  params.matrix.make_tile_tooltip = config.make_tile_tooltip;

  // initialized clicked tile and rows
  params.matrix.click_hlight_x = -666;
  params.matrix.click_hlight_y = -666;
  params.matrix.click_hlight_row = -666;
  params.matrix.click_hlight_col = -666;

  // definition of a large matrix - based on number of links
  // below this cutoff reordering is done with transitions
  params.matrix.def_large_matrix = 10000;

  params.matrix.opacity_function = config.opacity_scale;

  return params;
};