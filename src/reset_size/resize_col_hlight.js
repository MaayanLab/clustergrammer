var utils = require('../utils');

module.exports = function resize_col_hlight(params, svg_group, delay_info=false){

  var delays = {};
  // var duration = params.viz.duration;

  if(delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }  

  // if (delays.transition){

  //   // change the size of the highlighting rects
  //   d3.selectAll(params.root+' .col_label_group')
  //     .each(function() {

  //       var bbox = d3.select(this)
  //         .select('text')[0][0]
  //         .getBBox();

  //       d3.select(this)
  //         .select('rect')
  //         .transition().delay(delays.update).duration(duration)
  //         .attr('width', bbox.width * 1.1)
  //         .attr('height', 0.67*params.viz.rect_width)
  //         .style('fill', function(d){
  //           var inst_color = 'white';
  //           // if (params.labels.show_categories){
  //           //   inst_color = params.labels.class_colors.col[d.cl];
  //           // }
  //           return inst_color;
  //         })
  //         .style('opacity', 0.30);

  //     });

  // } else {

  //   // change the size of the highlighting rects
  //   d3.selectAll(params.root+' .col_label_group')
  //     .each(function() {
  //       var bbox = d3.select(this)
  //         .select('text')[0][0]
  //         .getBBox();

  //       d3.select(this)
  //         .select('rect')
  //         .attr('width', bbox.width * 1.1)
  //         .attr('height', 0.67*params.viz.rect_width)
  //         .style('fill', function(d){
  //           var inst_color = 'white';
  //           // if (params.labels.show_categories){
  //           //   inst_color = params.labels.class_colors.col[d.cl];
  //           // }
  //           return inst_color;
  //         })
  //         .style('opacity', 0.30);

  //     }); 

  // } 

  if (utils.has( params.network_data.col_nodes[0], 'value')) {
    svg_group
      .selectAll('.col_bars')
      .attr('width', function(d) {
        var inst_value = 0;
        if (d.value > 0){
          inst_value = params.labels.bar_scale_col(d.value);
        }
        return inst_value;
      })
      // rotate labels - reduce width if rotating
      .attr('height', params.viz.rect_width * 0.66);
  }

};