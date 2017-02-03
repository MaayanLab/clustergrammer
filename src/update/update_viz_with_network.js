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
var run_zoom = require('../zoom/run_zoom');
var show_visible_area = require('../zoom/show_visible_area');

module.exports = function update_viz_with_network(cgm, new_network_data){

  console.log('update_viz_with_network')

  console.log(cgm.params.viz.ds_level)

  // remove downsampled rows always
  d3.selectAll(cgm.params.root+' .ds'+String(cgm.params.viz.ds_level)+'_row')
    .remove();

  // run optional callback function
  if (cgm.params.matrix_update_callback != null){
    cgm.params.matrix_update_callback();
  }

  var inst_group_level = cgm.params.group_level;
  var inst_crop_fitler = cgm.params.crop_filter_nodes;

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

  // // disabled, causing problems when cropping
  // // always preserve category colors when updating
  // tmp_config.cat_colors = cgm.params.viz.cat_colors;

  var new_params = make_params(tmp_config);

  // pass the newly calcluated params back to the cgm object
  cgm.params = new_params;

  // set up zoom
  cgm.params.zoom_behavior = d3.behavior.zoom()
    .scaleExtent([1, cgm.params.viz.real_zoom * cgm.params.viz.zoom_switch])
    .on('zoom', function(){
      run_zoom(cgm);
    });

  if (new_cat_data != null){
    cgm.params.new_cat_data = new_cat_data;
  }

  // have persistent group levels while updating
  cgm.params.group_level = inst_group_level;

  // have persistent crop_filter_nodes while updating
  cgm.params.crop_filter_nodes = inst_crop_fitler;

  console.log('num ds levles after update: '+ String(cgm.params.viz.ds_num_levels))
  // only run enter-exit-updates if there is no downsampling
  var delays = define_enter_exit_delays(cgm.params, new_params);
  if (cgm.params.viz.ds_num_levels === 0){
    enter_exit_update(cgm, new_network_data, delays);
  } else {
    // remove row labels, remove non-downsampled rows, and add downsampled rows
    d3.selectAll(cgm.params.root+' .row_cat_group')
      .remove();
    d3.selectAll(cgm.params.root+' .row_label_group')
      .remove();
    d3.selectAll(cgm.params.root+' .row')
      .remove();

    // no need to re-calculate the downsampled layers
    // calc_downsampled_levels(params);
    var zooming_stopped = true;
    var zooming_out = true;
    var make_all_rows = true;

    // show_visible_area is also run with two_translate_zoom, but at that point
    // the parameters were not updated and two_translate_zoom if only run
    // if needed to reset zoom
    show_visible_area(cgm, zooming_stopped, zooming_out, make_all_rows);

  }

  // reduce opacity during update
  d3.select(cgm.params.viz.viz_svg)
    .style('opacity',0.70);


  make_row_cat(cgm);
  make_row_cat_super_labels(cgm);

  if (cgm.params.viz.show_categories.col){
    make_col_cat(cgm);
  }

  if (cgm.params.viz.show_dendrogram){
    make_row_dendro(cgm);
    make_col_dendro(cgm);
  }

  initialize_resizing(cgm);

  d3.select(cgm.params.viz.viz_svg).call(cgm.params.zoom_behavior);

  ini_doubleclick(cgm);

  ini_sidebar(cgm);

  cgm.params.viz.run_trans = true;

  // d3.selectAll(cgm.params.viz.root_tips)
  //   .style('opacity',0);

  setTimeout(enable_sidebar, 2500, cgm.params);

  d3.selectAll(cgm.params.root+' .dendro_shadow')
    .remove();

  function finish_update(){
    d3.select(cgm.params.viz.viz_svg)
      .transition().duration(250)
      .style('opacity',1.0);
  }
  setTimeout(finish_update, delays.enter);

};