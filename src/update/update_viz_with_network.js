var make_params = require('../params/');
var define_enter_exit_delays = require('../network/define_enter_exit_delays');
var enter_exit_update = require('../enter/enter_exit_update');
var initialize_resizing = require('../initialize_resizing');
var make_col_cat = require('../dendrogram/make_col_cat');
var make_row_cat = require('../dendrogram/make_row_cat');
var make_row_dendro = require('../dendrogram/make_row_dendro');
var make_col_dendro = require('../dendrogram/make_col_dendro');
var ini_sidebar = require('../sidebar/ini_sidebar');
var enable_sidebar  = require('../sidebar/enable_sidebar');
var ini_doubleclick = require('../zoom/ini_doubleclick');
var update_reorder_buttons = require('../reorder/update_reorder_buttons');
var make_row_cat_super_labels = require('../labels/make_row_cat_super_labels');
var modify_row_node_cats = require('./modify_row_node_cats');

module.exports = function update_viz_with_network(cgm, new_network_data){

  var inst_group_level = cgm.params.group_level;

  // make tmp config to make new params
  var tmp_config = jQuery.extend(true, {}, cgm.config);

  var new_cat_data = null;

  // bring in 'new' category data
  if (cgm.params.new_cat_data != null){
    modify_row_node_cats(cgm.params.new_cat_data, new_network_data.row_nodes);
    new_cat_data = cgm.params.new_cat_data;
  }


  tmp_config.network_data = new_network_data;
  tmp_config.inst_order = cgm.params.viz.inst_order;
  tmp_config.input_domain = cgm.params.matrix.opacity_scale.domain()[1];

  update_reorder_buttons(tmp_config, cgm.params);

  tmp_config.ini_expand = false;
  tmp_config.ini_view = null;
  tmp_config.current_col_cat = cgm.params.current_col_cat;

  // always preserve category colors when updating
  tmp_config.cat_colors = cgm.params.viz.cat_colors;

  var new_params = make_params(tmp_config);
  var delays = define_enter_exit_delays(cgm.params, new_params);

  // pass the newly calcluated params back to teh cgm object
  cgm.params = new_params;

  if (new_cat_data != null){
    cgm.params.new_cat_data = new_cat_data;
  }

  // have persistent group levels while updating
  cgm.params.group_level = inst_group_level;

  enter_exit_update(cgm, new_network_data, delays);

  make_row_cat(cgm.params);
  make_row_cat_super_labels(cgm);

  if (cgm.params.viz.show_categories.col){
    make_col_cat(cgm.params);
  }

  if (cgm.params.viz.show_dendrogram){
    make_row_dendro(cgm);
    make_col_dendro(cgm);
  }

  initialize_resizing(cgm);

  d3.select(cgm.params.viz.viz_svg).call(cgm.params.zoom_behavior);

  ini_doubleclick(cgm.params);

  ini_sidebar(cgm);

  cgm.params.viz.run_trans = true;

  d3.selectAll(cgm.params.root+' .d3-tip')
    .style('opacity',0);

  setTimeout(enable_sidebar, 2500, cgm.params);

};