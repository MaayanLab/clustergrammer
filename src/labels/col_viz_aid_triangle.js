module.exports = function col_viz_aid_triangle(params){

  // x and y are flipped since its rotated
  var reduce_rect_width = params.viz.x_scale.rangeBand() * 0.36;
  var origin_y = -params.viz.border_width.x;
  var start_x = 0;
  var final_x = params.viz.x_scale.rangeBand() - reduce_rect_width;
  var start_y = -(params.viz.x_scale.rangeBand() - reduce_rect_width +
  params.viz.border_width.x);
  var final_y = -params.viz.border_width.x;
  var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
    start_x + ' L ' + final_y + ',' + final_x + ' Z';
  return output_string;
};