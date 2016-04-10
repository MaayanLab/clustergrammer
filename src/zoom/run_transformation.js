var zoom_constraint_and_trim = require('./zoom_constraint_and_trim');
var zooming_has_stopped = require('./zooming_has_stopped');

module.exports = function run_transformation(params, zoom_info){
  
  // apply transformation and reset translate vector
  // translate clustergram
  d3.select(params.root+' .clust_group')
    .attr('transform', 'translate(' + [zoom_info.trans_x, zoom_info.trans_y] + ') scale(' +
    zoom_info.zoom_x + ',' + zoom_info.zoom_y + ')');


  // labels 
  /////////////////////////////
  d3.select(params.root+' .row_label_zoom_container')
    .attr('transform', 'translate(' + [0, zoom_info.trans_y] + ') scale(' + zoom_info.zoom_y +
    ')');

  // move down col labels as zooming occurs, subtract trans_x - 20 almost works
  d3.select(params.root+' .col_zoom_container')
    .attr('transform', 'translate(' + [zoom_info.trans_x, 0] + ') scale(' + zoom_info.zoom_x +
    ')');


  d3.select(params.root+' .row_cat_container')
    .attr('transform', 'translate(' + [0, zoom_info.trans_y] + ') scale( 1,' +
    zoom_info.zoom_y + ')');

  d3.select(params.root+' .row_dendro_container')
    .attr('transform', 'translate(' + [params.viz.uni_margin/2, zoom_info.trans_y] + ') '+
      'scale( 1,' + zoom_info.zoom_y + ')');    


  // transform col_class
  d3.select(params.root+' .col_cat_container')
    .attr('transform', 'translate('+[zoom_info.trans_x, 0]+') scale(' +zoom_info.zoom_x+ ',1)');

  d3.select(params.root+' .col_dendro_container')
    .attr('transform', 'translate('+[zoom_info.trans_x, params.viz.uni_margin/2]+') scale(' +zoom_info.zoom_x+ ',1)');

  zoom_constraint_and_trim(params, zoom_info);

  // // experimental label processing 
  // ///////////////////////////////////
  // var tmp_opacity = 0.5;

  // _.each(['row','col'], function(inst_rc){

  //   d3.selectAll('.'+inst_rc+'_label_group')
  //     .select('text')
  //     .text(function(d){
  //       return d.name.substring(0,4)+'..';
  //     })
  //     .transition()
  //     .style('opacity', tmp_opacity)
  //     .transition().delay(1000)
  //     .style('opacity',1);

  // });

  // d3.select(params.root+' .viz_svg')
  //   .classed('is_zooming',true);

  d3.select(params.root+' .viz_svg')
    .attr('is_zoom', function(){
      var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));
      d3.select(params.root+' .viz_svg').attr('stopped_zoom',1);
      return inst_zoom + 1;
    });

    // params.is_zoom = params.is_zoom + 1;

    var not_zooming = function(){
      
      d3.select(params.root+' .viz_svg')
        .attr('is_zoom',function(){
          var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));
          return inst_zoom - 1;
        });

    };

    setTimeout(not_zooming, 100);

    setTimeout(zooming_has_stopped, 500, params);

    // // trim text 
    // if (d3.select(params.root+' .viz_svg').attr('is_zoom') == '1'){

    //   _.each(['row','col'], function(){
    //     d3.selectAll('.row_label_group')
    //       .select('text')
    //       .text(function(d){
    //         return d.name.substring(0,3)+'..';
    //       });
        
    //   });

    // }

    // // get translation vector absolute values 
    // var buffer = 1;
    // var min_x = Math.abs(trans_x)/zoom_x -
    //   buffer*params.matrix.x_scale.rangeBand() ;
    // var min_y = Math.abs(trans_y)/zoom_y -
    //   buffer*params.matrix.y_scale.rangeBand() ;

    // var max_x = Math.abs(trans_x)/zoom_x + 
    //   2*buffer*params.matrix.x_scale.rangeBand() + params.viz.clust.dim.width/zoom_x ;
    // var max_y = Math.abs(trans_y)/zoom_y +  
    //   2*buffer*params.matrix.y_scale.rangeBand() + params.viz.clust.dim.height/zoom_y ;



};