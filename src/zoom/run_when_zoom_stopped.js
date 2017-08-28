var constrain_font_size = require('./constrain_font_size');
var trim_text = require('./trim_text');
var num_visible_labels = require('./num_visible_labels');
var toggle_grid_lines = require('../matrix/toggle_grid_lines');
var show_visible_area = require('./show_visible_area');
var check_zoom_stop_status = require('./check_zoom_stop_status');
var underscore = require('underscore');

module.exports = function run_when_zoom_stopped(cgm){

  var params = cgm.params;

  var stop_attributes = check_zoom_stop_status(params);

  if (stop_attributes === true){

    // ///////////////////////////////////////////////
    // // zooming has stopped
    // ///////////////////////////////////////////////
    // console.log('\nZOOMING HAS ACTUALLY STOPPED\n============================');
    // console.log(params.zoom_info.zoom_y)

    underscore.each(['row','col'], function(inst_rc){

      d3.selectAll(params.root+' .'+inst_rc+'_label_group' )
        .select('text')
        .style('opacity',1);

      d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
        .select('path')
        .style('display','block');
    });

    show_visible_area(cgm, true);

    d3.selectAll(params.viz.root_tips)
      .style('display','block');

    d3.selectAll(params.root+' .row_label_group').select('text').style('display','none');
    d3.selectAll(params.root+' .row_label_group').select('text').style('display','block');

    d3.select(params.root+' .viz_svg').attr('stopped_zoom',0);

    d3.selectAll(params.root+' .row_label_group').select('text').style('display','block');
    d3.selectAll(params.root+' .col_label_group').select('text').style('display','block');

    toggle_grid_lines(params);

    // reset x_offset
    cgm.params.viz.x_offset = 0;

    var max_labels_to_trim = 150;
    // probably do not need
    /////////////////////////
    underscore.each(['row','col'], function(inst_rc){

      var inst_num_visible = num_visible_labels(params, inst_rc);

      if (inst_num_visible < max_labels_to_trim){
        d3.selectAll(params.root+' .'+inst_rc+'_label_group' )
          .each(function() {
            trim_text(params, this, inst_rc);
          });
      }

    });

    text_patch();

    constrain_font_size(params);

    // this makes sure that the text is visible after zooming and trimming
    // there is buggy behavior in chrome when zooming into large matrices
    // I'm running it twice in quick succession
    setTimeout( text_patch, 100 );

  }

  function text_patch(){

    underscore.each(['row','col'], function(inst_rc){

      d3.selectAll(params.root+' .'+inst_rc+'_label_group')
        .filter(function(){
          return d3.select(this).style('display') != 'none';
        })
        .select('text')
        .style('font-size',function(){
          var inst_fs = Number(d3.select(this).style('font-size').replace('px',''));
          return inst_fs;
        });

    });

  }

};