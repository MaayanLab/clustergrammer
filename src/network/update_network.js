var make_params = require('../params');
var change_network_view = require('./change_network_view');
var initialize_resizing = require('../initialize_resizing');
var ini_doubleclick = require('../ini_doubleclick');
var enter_exit_update = require('./enter_exit_update');
var define_enter_exit_delays = require('./define_enter_exit_delays');
var search = require('../search');
var all_reorder = require('../reorder/all_reorder');
var build_col_dendro = require('../dendrogram/build_col_dendro');
var build_row_dendro = require('../dendrogram/build_row_dendro');
var ini_sliders = require('../filters/ini_sliders');

module.exports = function(old_params, change_view) {

  /*
  This is being run by the cgm object, and has access to config. 
  */

  // make new_network_data by filtering the original network data
  var config_copy = jQuery.extend(true, {}, this.config);

  var new_network_data = change_network_view(old_params, config_copy.network_data, change_view);

  // make tmp config to make new params 
  var tmp_config = jQuery.extend(true, {}, this.config);

  tmp_config.network_data = new_network_data;
  tmp_config.inst_order = old_params.viz.inst_order;
  tmp_config.ini_expand = false;
  tmp_config.ini_view = null;
  tmp_config.current_col_cat = old_params.current_col_cat;

  var params = make_params(tmp_config);
  var delays = define_enter_exit_delays(old_params, params);

  // ordering - necessary for reordering the function called on button click
  this.reorder = all_reorder;

  enter_exit_update(params, new_network_data, delays);

  // update network data in params
  this.params = params;

  // search functions
  var gene_search = search(params, params.network_data.row_nodes, 'name');
  this.get_entities = gene_search.get_entities;
  this.find_entity = gene_search.find_entity;

  // TODO reenable dendrogram updating
  // redefine change_group function
  if (params.viz.show_dendrogram){
    build_row_dendro(params, 'row_class_rect');
    build_col_dendro(params, 'col_class_rect');
  }

  // initialize screen resizing - necessary for resizing with new params
  initialize_resizing(params);

  // necessary to have zoom behavior updated on updating clustergram
  d3.select(params.viz.viz_svg).call(params.zoom_behavior);

  // re-initialize the double click behavior
  ini_doubleclick(params);

  ini_sliders(params);

};
