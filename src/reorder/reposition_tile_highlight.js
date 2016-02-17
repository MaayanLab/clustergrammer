module.exports = function(params) {

  // resize click hlight
  var rel_width_hlight = 6;
  // var opacity_hlight = 0.85;

  var hlight_width = rel_width_hlight*params.viz.border_width;
  var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;
  // reposition tile highlight
  ////////////////////////////////

  // top highlight
  d3.select(params.root+' .top_hlight')
    .attr('width', params.matrix.x_scale.rangeBand())
    .attr('height', hlight_height)
    .transition().duration(2500)
    .attr('transform', function() {
      return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ',0)';
    });

  // left highlight
  d3.select(params.root+' .left_hlight')
    .attr('width', hlight_width)
    .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
    .transition().duration(2500)
    .attr('transform', function() {
      return 'translate(' + params.matrix.x_scale(params.matrix.click_hlight_x) + ','+
        hlight_height*0.99+')';
    });

  // right highlight
  d3.select(params.root+' .right_hlight')
    .attr('width', hlight_width)
    .attr('height', params.matrix.y_scale.rangeBand() - hlight_height*0.99 )
    .transition().duration(2500)
    .attr('transform', function() {
      var tmp_translate = params.matrix.x_scale(params.matrix.click_hlight_x) + params.matrix.x_scale.rangeBand() - hlight_width;
      return 'translate(' + tmp_translate + ','+
        hlight_height*0.99+')';
    });

  // bottom highlight
  d3.select(params.root+' .bottom_hlight')
    .attr('width', function(){
      return params.matrix.x_scale.rangeBand() - 1.98*hlight_width;})
    .attr('height', hlight_height)
    .transition().duration(2500)
    .attr('transform', function() {
      var tmp_translate_x = params.matrix.x_scale(params.matrix.click_hlight_x) + hlight_width*0.99;
      var tmp_translate_y = params.matrix.y_scale.rangeBand() - hlight_height;
      return 'translate(' + tmp_translate_x + ','+
        tmp_translate_y+')';
    });

};
