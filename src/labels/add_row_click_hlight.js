module.exports = function(params, clicked_row, id_clicked_row) {
  if (id_clicked_row != params.click_hlight_row){

    var rel_width_hlight = 6;
    var opacity_hlight = 0.85;
    var hlight_height = rel_width_hlight * params.viz.border_width.x;

    d3.selectAll(params.root+' .click_hlight')
      .remove();

    // // highlight selected row
    // d3.selectAll(params.root+' .row_label_group')
    //   .select('rect')
    // d3.select(this)
    //   .select('rect')
    //   .style('opacity', 1);

    d3.select(clicked_row)
      .append('rect')
      .classed('click_hlight',true)
      .classed('row_top_hlight',true)
      .attr('width',params.viz.svg_dim.width)
      .attr('height',hlight_height)
      .attr('fill',params.matrix.hlight_color)
      .attr('opacity',opacity_hlight);

    d3.select(clicked_row)
      .append('rect')
      .classed('click_hlight',true)
      .classed('row_bottom_hlight',true)
      .attr('width',params.viz.svg_dim.width)
      .attr('height',hlight_height)
      .attr('fill',params.matrix.hlight_color)
      .attr('opacity',opacity_hlight)
      .attr('transform', function(){
        var tmp_translate_y = params.viz.y_scale.rangeBand() - hlight_height;
        return 'translate(0,'+tmp_translate_y+')';
      });
  } else{
    d3.selectAll(params.root+' .click_hlight')
    .remove();
    params.click_hlight_row = -666;
  }

};
