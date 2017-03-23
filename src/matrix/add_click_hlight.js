module.exports = function(params, clicked_rect){

  // get x position of rectangle
  d3.select(clicked_rect).each(function(d){
    var pos_x = d.pos_x;
    var pos_y = d.pos_y;

    d3.selectAll(params.root+' .click_hlight')
      .remove();

    if (pos_x!=params.matrix.click_hlight_x || pos_y!=params.matrix.click_hlight_y){

      // save pos_x to params.viz.click_hlight_x
      params.matrix.click_hlight_x = pos_x;
      params.matrix.click_hlight_y = pos_y;

      // draw the highlighting rectangle as four rectangles
      // so that the width and height can be controlled
      // separately

      var rel_width_hlight = 6;
      var opacity_hlight = 0.85;

      var hlight_width  = rel_width_hlight*params.viz.border_width.x;
      var hlight_height = rel_width_hlight*params.viz.border_width.y;

      // top highlight
      d3.select(clicked_rect.parentNode)
        .append('rect')
        .classed('click_hlight',true)
        .classed('top_hlight',true)
        .attr('width', params.viz.x_scale.rangeBand())
        .attr('height', hlight_height)
        .attr('fill',params.matrix.hlight_color)
        .attr('transform', function() {
          return 'translate(' + params.viz.x_scale(pos_x) + ',0)';
        })
        .attr('opacity',opacity_hlight);

      // left highlight
      d3.select(clicked_rect.parentNode)
        .append('rect')
        .classed('click_hlight',true)
        .classed('left_hlight',true)
        .attr('width', hlight_width)
        .attr('height', params.viz.y_scale.rangeBand() - hlight_height*0.99 )
        .attr('fill',params.matrix.hlight_color)
        .attr('transform', function() {
          return 'translate(' + params.viz.x_scale(pos_x) + ','+
            hlight_height*0.99+')';
        })
        .attr('opacity',opacity_hlight);

      // right highlight
      d3.select(clicked_rect.parentNode)
        .append('rect')
        .classed('click_hlight',true)
        .classed('right_hlight',true)
        .attr('width', hlight_width)
        .attr('height', params.viz.y_scale.rangeBand() - hlight_height*0.99 )
        .attr('fill',params.matrix.hlight_color)
        .attr('transform', function() {
          var tmp_translate = params.viz.x_scale(pos_x) + params.viz.x_scale.rangeBand() - hlight_width;
          return 'translate(' + tmp_translate + ','+
            hlight_height*0.99+')';
        })
        .attr('opacity',opacity_hlight);

      // bottom highlight
      d3.select(clicked_rect.parentNode)
        .append('rect')
        .classed('click_hlight',true)
        .classed('bottom_hlight',true)
        .attr('width', function(){
          return params.viz.x_scale.rangeBand() - 1.98*hlight_width;})
        .attr('height', hlight_height)
        .attr('fill',params.matrix.hlight_color)
        .attr('transform', function() {
          var tmp_translate_x = params.viz.x_scale(pos_x) + hlight_width*0.99;
          var tmp_translate_y = params.viz.y_scale.rangeBand() - hlight_height;
          return 'translate(' + tmp_translate_x + ','+
            tmp_translate_y+')';
        })
        .attr('opacity',opacity_hlight);

      } else {
        params.matrix.click_hlight_x = -666;
        params.matrix.click_hlight_y = -666;
      }


  });
};
