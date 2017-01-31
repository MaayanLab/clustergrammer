var num_visible_labels = require('./num_visible_labels');
var trim_text = require('./trim_text');
var constrain_font_size = require('./constrain_font_size');
var toggle_grid_lines = require('../matrix/toggle_grid_lines');
var show_visible_area = require('./show_visible_area');

module.exports = function zooming_has_stopped(params){

  var stop_attributes = check_attrs();

  if (stop_attributes === true){

    // wait and double check that zooming has stopped
    setTimeout( run_when_zoom_stopped, 500);

  }

  function check_attrs(){

    var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

    var check_stop = Number(d3.select(params.root+' .viz_svg')
                               .attr('stopped_zoom'));

    var stop_attributes = false;
    if (inst_zoom === 0 && check_stop != 0){
      stop_attributes = true;
    }
    return stop_attributes;

  }

  function run_when_zoom_stopped(){

    var stop_attributes = check_attrs();

    if (stop_attributes === true){

      /////////////////////////////////////////////////
      // zooming has stopped
      /////////////////////////////////////////////////
      console.log('\nZOOMING HAS ACTUALLY STOPPED\n============================')

      _.each(['row','col'], function(inst_rc){

        d3.selectAll(params.root+' .'+inst_rc+'_label_group' )
          .select('text')
          .style('opacity',1);

        d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
          .select('path')
          .style('display','block');
      });

      show_visible_area(params, true);

      d3.selectAll(params.viz.root_tips)
        .style('display','block');

      d3.selectAll(params.root+' .row_label_group').select('text').style('display','none');
      d3.selectAll(params.root+' .row_label_group').select('text').style('display','block');

      d3.select(params.root+' .viz_svg').attr('stopped_zoom',0);

      d3.selectAll(params.root+' .row_label_group').select('text').style('display','block');
      d3.selectAll(params.root+' .col_label_group').select('text').style('display','block');

      toggle_grid_lines(params);


      _.each(['row','col'], function(inst_rc){

        var inst_num_visible = num_visible_labels(params, inst_rc);

        if (inst_num_visible < 125){
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
      setTimeout( text_patch, 25 );
      setTimeout( text_patch, 100 );

    }
  }

  function text_patch(){

    _.each(['row','col'], function(inst_rc){

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