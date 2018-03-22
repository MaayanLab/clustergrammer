var make_config = require('./make_config');
var make_params = require('./params/make_params');
var make_viz = require('./make_viz');
var resize_viz = require('./reset_size/resize_viz');
var play_demo = require('./demo/play_demo');
var ini_demo = require('./demo/ini_demo');
var filter_viz_using_nodes = require('./network/filter_viz_using_nodes');
var filter_viz_using_names = require('./network/filter_viz_using_names');
var update_cats = require('./update/update_cats');
var reset_cats = require('./update/reset_cats');
var two_translate_zoom = require('./zoom/two_translate_zoom');
var update_view = require('./update/update_view');
var save_matrix = require('./matrix/save_matrix');
var brush_crop_matrix = require('./matrix/brush_crop_matrix');
var run_zoom = require('./zoom/run_zoom');
var d3_tip_custom = require('./tooltip/d3_tip_custom');
var all_reorder = require('./reorder/all_reorder');
var make_matrix_string = require('./matrix/make_matrix_string');

// moved d3.slider to src
d3.slider = require('./d3.slider');

/* eslint-disable */

var awesomplete = require('awesomplete');
// getting css from src
require('!style!css!./d3.slider/d3.slider.css');
require('!style!css!awesomplete/awesomplete.css');

/* clustergrammer v1.19.5
 * Nicolas Fernandez, Ma'ayan Lab, Icahn School of Medicine at Mount Sinai
 * (c) 2017
 */
function Clustergrammer(args) {

  /* Main program
   * ----------------------------------------------------------------------- */
  // consume and validate user input
  // build giant config object
  // visualize based on config object
  // handle user events

  // consume and validate user arguments, produce configuration object
  var config = make_config(args);

  var cgm = {};

  // make visualization parameters using configuration object
  cgm.params = make_params(config);
  cgm.config = config;

  // set up zoom
  cgm.params.zoom_behavior = d3.behavior.zoom()
    .scaleExtent([1, cgm.params.viz.square_zoom * cgm.params.viz.zoom_ratio.x])
    .on('zoom', function(){
      run_zoom(cgm);
    });

  cgm.params.zoom_behavior.translate([cgm.params.viz.clust.margin.left, cgm.params.viz.clust.margin.top]);

  if (cgm.params.use_sidebar) {
    var make_sidebar = require('./sidebar/');
    make_sidebar(cgm);
  }

  // make visualization using parameters
  make_viz(cgm);

  function external_resize() {

    d3.select(cgm.params.viz.viz_svg).style('opacity', 0.5);

    var wait_time = 500;
    if (this.params.viz.run_trans === true){
      wait_time = 2500;
    }

    setTimeout(resize_fun, wait_time, this);
  }

  function resize_fun(cgm){
    resize_viz(cgm);
  }

  function run_update_cats(cat_data){
    update_cats(this, cat_data);
  }

  function zoom_api(pan_dx, pan_dy, fin_zoom){
    two_translate_zoom(this, pan_dx, pan_dy, fin_zoom);
  }

  function expose_d3_tip_custom(){
    // this allows external modules to have access to d3_tip
    return d3_tip_custom
  }

  function api_reorder(inst_rc, inst_order){
    if (inst_order === 'sum'){
      inst_order = 'rank';
    }
    if (inst_order === 'var'){
      inst_order = 'rankvar';
    }
    all_reorder(this, inst_order, inst_rc)
  }

  function export_matrix_string(){
    return make_matrix_string(this.params);
  }

  function external_update_view(filter_type, inst_state){
    update_view(this, filter_type, inst_state)
  }


  // add more API endpoints
  cgm.update_view = update_view;
  cgm.resize_viz = external_resize;
  cgm.play_demo = play_demo;
  cgm.ini_demo = ini_demo;
  cgm.filter_viz_using_nodes = filter_viz_using_nodes;
  cgm.filter_viz_using_names = filter_viz_using_names;
  cgm.update_cats = run_update_cats;
  cgm.reset_cats = reset_cats;
  cgm.zoom = zoom_api;
  cgm.save_matrix = save_matrix;
  cgm.brush_crop_matrix = brush_crop_matrix;
  cgm.d3_tip_custom = expose_d3_tip_custom;
  cgm.reorder = api_reorder;
  cgm.export_matrix_string = export_matrix_string;
  cgm.update_view = external_update_view;

  return cgm;
}

module.exports = Clustergrammer;