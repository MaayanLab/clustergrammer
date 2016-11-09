var make_config = require('./Config');
var make_params = require('./params/');
var make_viz = require('./Viz');
var resize_viz = require('./reset_size/resize_viz');
var play_demo = require('./demo/play_demo');
var ini_demo = require('./demo/ini_demo');
var filter_viz_using_nodes = require('./network/filter_viz_using_nodes');
var filter_viz_using_names = require('./network/filter_viz_using_names');
var update_cats = require('./update/update_cats');
var reset_cats = require('./update/reset_cats');
var two_translate_zoom = require('./zoom/two_translate_zoom');
var external_update_view = require('./update/external_update_view');

// moved d3.slider to src
d3.slider = require('./d3.slider');

/* eslint-disable */

var awesomplete = require('awesomplete');
// getting css from src
require('!style!css!./d3.slider/d3.slider.css');
require('!style!css!awesomplete/awesomplete.css');

/* clustergrammer v1.7.3
 * Nick Fernandez, Ma'ayan Lab, Icahn School of Medicine at Mount Sinai
 * (c) 2016
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
    two_translate_zoom(this.params, pan_dx, pan_dy, fin_zoom);
  }

  // add more API endpoints
  cgm.update_view = external_update_view;
  cgm.resize_viz = external_resize;
  cgm.play_demo = play_demo;
  cgm.ini_demo = ini_demo;
  cgm.filter_viz_using_nodes = filter_viz_using_nodes;
  cgm.filter_viz_using_names = filter_viz_using_names;
  cgm.update_cats = run_update_cats;
  cgm.reset_cats = reset_cats;
  cgm.zoom = zoom_api;

  return cgm;
}

module.exports = Clustergrammer;