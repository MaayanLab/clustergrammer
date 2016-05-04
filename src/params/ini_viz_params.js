var utils = require('../Utils_clust'); 
var get_available_filters = require('./get_available_filters');

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
  viz.all_cats = config.all_cats;
  viz.cat_colors = config.cat_colors;
  viz.cat_names = config.cat_names;
  viz.sim_mat = config.sim_mat;

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

  viz.show_categories = {};
  viz.cat_room = {};
  viz.cat_room.symbol_width = 12;
  viz.cat_room.separation = 3;

  viz.cat_colors.opacity = 0.6;
  viz.cat_colors.active_opacity = 0.9;

  viz.triangle_opacity = 0.6;

  viz.norm_labels = {};
  viz.norm_labels.width = {};

  viz.dendro_room = {};
  if (viz.show_dendrogram) {
    viz.dendro_room.symbol_width = 10;
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

    if (_.has(config, 'group_level')){
      config.group_level[inst_rc] = 5;
    }

    if(inst_rc === 'row'){
      viz.dendro_room[inst_rc] = viz.dendro_room.symbol_width;
    } else {
      viz.dendro_room[inst_rc] = viz.dendro_room.symbol_width + viz.uni_margin;
    }

    var num_cats = viz.all_cats[inst_rc].length;

    if (viz.show_categories[inst_rc]){

      separtion_room = (num_cats-1)*viz.cat_room.separation;

      var adjusted_cats;
      if (inst_rc === 'row'){
        adjusted_cats = num_cats + 1;
      } else {
        adjusted_cats = num_cats;
      }

      viz.cat_room[inst_rc] = adjusted_cats * viz.cat_room.symbol_width + separtion_room;

    } else {
      // no categories 
      if (inst_rc == 'row'){
        viz.cat_room[inst_rc] = viz.cat_room.symbol_width;
      } else {
        viz.cat_room[inst_rc] = 0;
      }
    }

  }); 

  viz.dendro_opacity = 0.35;

  viz.spillover_col_slant = viz.norm_labels.width.col;

  var filters = get_available_filters(params.network_data.views);

  viz.possible_filters = filters.possible_filters;
  viz.filter_data = filters.filter_data;

  return viz;
};