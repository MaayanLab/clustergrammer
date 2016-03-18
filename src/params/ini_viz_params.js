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
  viz.grey_border_width = config.grey_border_width;
  viz.show_dendrogram = config.show_dendrogram;
  viz.tile_click_hlight = config.tile_click_hlight;
  viz.inst_order = config.inst_order;
  viz.expand_button = config.expand_button;
  viz.all_cats = config.all_cats;
  viz.cat_colors = config.cat_colors;
  if (config.force_square === 1) {
    viz.force_square = 1;
  }
  viz.viz_svg = viz.viz_wrapper + ' .viz_svg';
  viz.uni_duration = 1000;
  viz.bottom_space = 5;
  viz.run_trans = false;
  viz.duration = 1000;
  if (viz.show_dendrogram){
    config.group_level = {};
  }

  // width is 1 over this value
  viz.border_fraction = 55;
  viz.uni_margin = 5;

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

  viz.show_categories = {};
  viz.cat_room = {};
  viz.cat_room.symbol_width = 12;
  viz.cat_room.separation = 3;

  viz.norm_labels = {};
  viz.norm_labels.width = {};

  viz.dendro_room = {};
  if (viz.show_dendrogram) {
    viz.dendro_room.symbol_width = 12;
  } else {
    viz.dendro_room.symbol_width = 0;
  }

  var separtion_room;

  // increase the width of the label container based on the label length 
  var label_scale = d3.scale.linear()
    .domain([5, 15])
    .range([ 85, 120]).clamp('true');

  _.each(['row','col'], function(inst_rc){

    viz.show_categories[inst_rc] = config.show_categories[inst_rc];
    viz.norm_labels.width[inst_rc] = label_scale(params.labels[inst_rc+'_max_char']) 
      * params[inst_rc+'_label_scale'];

    viz['num_'+inst_rc+'_nodes'] = params.network_data[inst_rc+'_nodes'].length;

    config.group_level[inst_rc] = 5;

    if(inst_rc === 'row'){
      viz.dendro_room[inst_rc] = viz.dendro_room.symbol_width;
    } else {
      viz.dendro_room[inst_rc] = viz.dendro_room.symbol_width + viz.uni_margin;
    }

    if (viz.show_categories[inst_rc]){

      var num_cats = viz.all_cats[inst_rc].length;

      separtion_room = (num_cats-1)*viz.cat_room.separation;

      if (inst_rc === 'row'){
        viz.cat_room[inst_rc] = (num_cats+1) * viz.cat_room.symbol_width + separtion_room;
      } else {
        viz.cat_room[inst_rc] = num_cats * viz.cat_room.symbol_width + separtion_room;
      }

    } else {
      viz.cat_room[inst_rc] = viz.cat_room.symbol_width;
    }

  }); 

  viz.dendro_opacity = 0.35;

  viz.spillover_col_slant = viz.norm_labels.width.col;

  return viz;
};