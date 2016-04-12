var constrain_font_size = require('./constrain_font_size');
var trim_text = require('./trim_text');

module.exports = function zooming_has_stopped(params){
  
  var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

  if (inst_zoom === 0){

    var check_stop = Number(d3.select(params.root+' .viz_svg').attr('stopped_zoom'));
    if (check_stop!=0){

      d3.selectAll('.row_label_group').select('text').style('display','none');
      d3.selectAll('.row_label_group').select('text').style('display','block');

      // constrain_font_size(params);

      d3.select(params.root+' .viz_svg').attr('stopped_zoom',0);

      d3.selectAll('.row_label_group').select('text').style('display','block');
      d3.selectAll('.col_label_group').select('text').style('display','block');
      
      d3.selectAll('.tile').style('display','block');

      // d3.selectAll(params.root+' .row_label_group' )
      //   .each(function() { trim_text(params, this, 'row'); });
      // d3.selectAll(params.root+' .col_label_group')
      //   .each(function() { trim_text(params, this, 'col'); });


      // use calc real font size to only run trim if needed 
      //////////////////////////////////////////
      //////////////////////////////////////////
      //////////////////////////////////////////
      //////////////////////////////////////////
      //////////////////////////////////////////
      //////////////////////////////////////////
      _.each(['row','col'], function(inst_rc){
        
        var inst_fs = Number(d3.select('.'+inst_rc+'_label_group')
          .select('text')
          .style('font-size').replace('px',''));

        console.log(inst_fs)
        var min_trim_fs = 8;
        if (inst_fs > min_trim_fs){
          d3.selectAll(params.root+' .'+inst_rc+'_label_group' )
            .each(function() { 
              trim_text(params, this, inst_rc); 
            });
        }

      });      

      text_patch()

    } 

      // // this makes sure that the text is visible after zooming and trimming
      // // there is buggy behavior in chrome when zooming into large matrices
      // // I'm running it twice in quick succession 
      setTimeout( text_patch, 25 );
      // setTimeout( text_patch, 100 );
      // setTimeout( text_patch, 2000 );
  }

  function text_patch(){

    var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));
    // console.log('zoom at time of patch')
    // console.log(inst_zoom)

    _.each(['row','col'], function(inst_rc){

      d3.selectAll(params.root+' .'+inst_rc+'_label_group')
        .filter(function(){
          return d3.select(this).style('display') != 'none';
        })
        .select('text')
        .style('font-size',function(){
          var inst_fs = Number(d3.select(this).style('font-size').replace('px','')); 
          // console.log( 'FONT-SIZE: '+ String(inst_fs) )
          return inst_fs;
        });

    });

  }

};