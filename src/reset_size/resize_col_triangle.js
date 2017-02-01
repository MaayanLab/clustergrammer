var col_viz_aid_triangle = require('../labels/col_viz_aid_triangle');

module.exports = function resize_col_triangle(params,  ini_svg_group, delay_info=false){

  // resize column triangle
  var ini_triangle_group = ini_svg_group
    .selectAll('.col_label_group')
    .select('path');

  var delays = {};
  var duration = params.viz.duration;

  if(delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }

  var triangle_group;
  if (delays.run_transition){
    triangle_group = ini_triangle_group
      .transition().delay(delays.update).duration(duration);
  } else {
    triangle_group = ini_triangle_group;
  }


  triangle_group
    .attr('d', function() {
      return col_viz_aid_triangle(params);
    })
    .attr('fill', '#eee');


};