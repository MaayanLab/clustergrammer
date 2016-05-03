/* eslint-disable */

var make_demo_text_containers = require('./make_demo_text_containers');
var run_segment = require('./run_segment');
var play_intro = require('./play_intro');
var play_zoom = require('./play_zoom');
var play_reset_zoom = require('./play_reset_zoom');
var play_reorder_row = require('./play_reorder_row');
var play_reorder_buttons = require('./play_reorder_buttons');
var play_search = require('./play_search'); 
var play_filter = require('./play_filter');
var quick_cluster = require('./quick_cluster');

module.exports = function play_demo(){

  var cgm = this;
  var params = cgm.params;

  // intro text 
  var inst_time = 0;
  var prev_duration = 0;
  var demo_text_size = 38;

  make_demo_text_containers(params, demo_text_size);

  // inst_time = run_segment(params, inst_time, play_intro);
  // inst_time = run_segment(params, inst_time, play_zoom);
  // inst_time = run_segment(params, inst_time, play_reset_zoom);
  // inst_time = run_segment(params, inst_time, play_reorder_row);
  inst_time = run_segment(params, inst_time, play_reorder_buttons);
  inst_time = run_segment(params, inst_time, play_search);
  inst_time = run_segment(cgm, inst_time, play_filter);
  inst_time = run_segment(params, inst_time, quick_cluster);

};