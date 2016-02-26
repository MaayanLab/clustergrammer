var make_params = require('../params/');
var change_network_view = require('./change_network_view');
var initialize_resizing = require('../initialize_resizing');
var ini_doubleclick = require('../zoom/ini_doubleclick');
var enter_exit_update = require('../enter/enter_exit_update');
var define_enter_exit_delays = require('./define_enter_exit_delays');
var build_col_dendro = require('../dendrogram/build_col_dendro');
var build_row_dendro = require('../dendrogram/build_row_dendro');
var ini_sidebar = require('../sidebar/ini_sidebar');

module.exports = function(config, old_params, change_view) {

  // make new_network_data by filtering the original network data
  var config_copy = jQuery.extend(true, {}, config);

  var new_network_data = change_network_view(old_params, config_copy.network_data, change_view);

  // make tmp config to make new params 
  var tmp_config = jQuery.extend(true, {}, config);

  tmp_config.network_data = new_network_data;
  tmp_config.inst_order = old_params.viz.inst_order;

  tmp_config.ini_expand = false;
  tmp_config.ini_view = null;
  tmp_config.current_col_cat = old_params.current_col_cat;

  var params = make_params(tmp_config);
  var delays = define_enter_exit_delays(old_params, params);

  enter_exit_update(params, new_network_data, delays);

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

  ini_sidebar(params);

  params.viz.run_trans = true;
  
  // remove any tooltips, not just those from the current viz
  d3.selectAll('.d3-tip')
    .remove();

  // return updated params 
  return params;

};
