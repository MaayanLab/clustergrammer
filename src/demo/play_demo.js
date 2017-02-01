/* eslint-disable */

var run_segment = require('./run_segment');
var play_intro = require('./play_intro');
var play_zoom = require('./play_zoom');
var play_reset_zoom = require('./play_reset_zoom');
var play_reorder_row = require('./play_reorder_row');
var play_reorder_buttons = require('./play_reorder_buttons');
var play_search = require('./play_search');
var play_filter = require('./play_filter');
var quick_cluster = require('./quick_cluster');
var play_groups = require('./play_groups');
var play_categories = require('./play_categories');
var play_conclusion = require('./play_conclusion');
var toggle_play_button = require('./toggle_play_button');
var play_menu_button = require('./play_menu_button');

module.exports = function play_demo(){

  var cgm = this;
  var params = cgm.params;

  if (d3.select(params.root+' .running_demo').empty()){

    // prevent more than one demo from running at once
    d3.select(params.root+' .play_button')
      .classed('running_demo', true);

    toggle_play_button(params, false);

    // prevent user interaction while playing
    $.blockUI({ css: {
        border: 'none',
        padding: '15px',
        backgroundColor: '#000',
        '-webkit-border-radius': '10px',
        '-moz-border-radius': '10px',
        opacity: 0,
        color: '#fff',
        cursor:'default'
    } });

    d3.selectAll('.blockUI').style('opacity',0);

    // intro text
    var inst_time = 750;

    if (cgm.params.viz.is_expand === false){
        inst_time = run_segment(params, inst_time, quick_cluster);
        inst_time = inst_time - 1500;
    }

    // clustergram interaction
    ///////////////////////////////////
    inst_time = run_segment(params, inst_time, play_intro);
    inst_time = run_segment(params, inst_time, play_zoom);
    inst_time = run_segment(cgm, inst_time, play_reset_zoom);
    inst_time = run_segment(params, inst_time, play_categories);
    inst_time = run_segment(params, inst_time, play_reorder_row);

    // sidebar interaction
    ///////////////////////////////////
    inst_time = run_segment(params, inst_time, play_menu_button);
    inst_time = run_segment(params, inst_time, play_groups);
    inst_time = run_segment(params, inst_time, play_reorder_buttons);
    inst_time = run_segment(params, inst_time, play_search);
    inst_time = run_segment(cgm, inst_time, play_filter);

    // conclusion
    ///////////////////////////////////
    inst_time = run_segment(params, inst_time, quick_cluster);
    inst_time = run_segment(params, inst_time, play_conclusion);

  }

};