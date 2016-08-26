var num_visible_labels = require('./num_visible_labels');
var trim_text = require('./trim_text');
var constrain_font_size = require('./constrain_font_size');

module.exports = function zooming_has_stopped(params){
  
  var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

  _.each(['row','col'], function(inst_rc){

    d3.selectAll(params.root+' .'+inst_rc+'_label_group' )
      .select('text')
      .style('opacity',1);

    d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
      .select('path')
      .style('display','block');      
      

  });      

  if (inst_zoom === 0){


    var check_stop = Number(
        d3.select(params.root+' .viz_svg').attr('stopped_zoom')
      );
    
    if (check_stop!=0){

      // // experimental tile display toggling 
      // d3.selectAll(params.root+' .hide_tile')
      //   .style('display','block');

      d3.selectAll(params.root+' .row_label_group').select('text').style('display','none');
      d3.selectAll(params.root+' .row_label_group').select('text').style('display','block');

      d3.select(params.root+' .viz_svg').attr('stopped_zoom',0);

      d3.selectAll(params.root+' .row_label_group').select('text').style('display','block');
      d3.selectAll(params.root+' .col_label_group').select('text').style('display','block');
      

      d3.selectAll(params.root+' .horz_lines').select('line').style('display','block');
      d3.selectAll(params.root+' .vert_lines').select('line').style('display','block');


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

    } 

      // this makes sure that the text is visible after zooming and trimming
      // there is buggy behavior in chrome when zooming into large matrices
      // I'm running it twice in quick succession 
      setTimeout( text_patch, 25 );
      setTimeout( text_patch, 100 );
      // setTimeout( text_patch, 2000 );
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