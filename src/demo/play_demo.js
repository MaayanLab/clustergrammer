var make_demo_text_containers = require('./make_demo_text_containers');
var run_segment = require('./run_segment');
var play_intro = require('./play_intro');
var play_zoom = require('./play_zoom');
var play_reset_zoom = require('./play_reset_zoom');
var play_reorder_row = require('./play_reorder_row');

module.exports = function play_demo(){
  var cgm = this;
  var params = cgm.params;

  // intro text 
  var inst_text;
  var inst_time = 0;
  var prev_duration = 0;
  var demo_text_size = 38;
  var sec_scale = 1000;

  make_demo_text_containers(params, demo_text_size);

  // inst_time = run_segment(params, inst_time, play_intro);
  // inst_time = run_segment(params, inst_time, play_zoom);
  // inst_time = run_segment(params, inst_time, play_reset_zoom);
  inst_time = run_segment(params, inst_time, play_reorder_row);

};