module.exports = function resize_col_triangle(params,  ini_svg_group, delay_info=false){

  // resize column triangle
  var ini_triangle_group = ini_svg_group
    .selectAll('.col_label_group')
    .select('path');

  var delays = {};
  var duration = params.viz.duration;
  
  // var row_nodes = params.network_data.row_nodes;
  // var row_nodes_names = params.network_data.row_nodes_names;

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

  var reduce_rect_width = params.viz.x_scale.rangeBand() * 0.36;
  
  triangle_group
    .attr('d', function() {
      // x and y are flipped since its rotated
      var origin_y = -params.viz.border_width;
      var start_x = 0;
      var final_x = params.viz.x_scale.rangeBand() - reduce_rect_width;
      var start_y = -(params.viz.x_scale.rangeBand() - reduce_rect_width +
      params.viz.border_width);
      var final_y = -params.viz.border_width;
      var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
        start_x + ', L ' + final_y + ',' + final_x + ' Z';
      return output_string;
    })
    .attr('fill', '#eee');

  
};