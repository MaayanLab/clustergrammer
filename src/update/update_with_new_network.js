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

module.exports = function update_with_new_network(config, old_params,  new_network_data){

  // make tmp config to make new params 
  var tmp_config = jQuery.extend(true, {}, config);

  tmp_config.network_data = new_network_data;
  tmp_config.inst_order = old_params.viz.inst_order;
  tmp_config.input_domain = old_params.matrix.opacity_scale.domain()[1];

  update_reorder_buttons(tmp_config, old_params);

  tmp_config.ini_expand = false;
  tmp_config.ini_view = null;
  tmp_config.current_col_cat = old_params.current_col_cat;

  var params = make_params(tmp_config);
  var delays = define_enter_exit_delays(old_params, params);

  enter_exit_update(params, new_network_data, delays);

  make_row_cat(params);

  if (params.viz.show_categories.col){
    make_col_cat(params);
  }

  if (params.viz.show_dendrogram){
    make_row_dendro(params);
    make_col_dendro(params);
  }

  initialize_resizing(params);

  d3.select(params.viz.viz_svg).call(params.zoom_behavior);

  ini_doubleclick(params);

  ini_sidebar(params);

  params.viz.run_trans = true;

  d3.selectAll(params.root+' .d3-tip')
    .style('opacity',0);

  setTimeout(enable_sidebar, 2500, params);

  return params;
};