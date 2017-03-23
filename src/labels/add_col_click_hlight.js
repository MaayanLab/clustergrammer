module.exports = function(params, clicked_col, id_clicked_col) {

  if (id_clicked_col != params.click_hlight_col){

    params.click_hlight_col = id_clicked_col;

    var rel_width_hlight = 6;
    var opacity_hlight = 0.85;
    var hlight_width  = rel_width_hlight * params.viz.border_width.x;

    d3.selectAll(params.root+' .click_hlight')
      .remove();

    // // highlight selected column
    // ///////////////////////////////
    // // unhilight and unbold all columns (already unbolded earlier)
    // d3.selectAll('.col_label_text')
    //   .select('rect')
    //   .style('opacity', 0);
    // // highlight column name
    // d3.select(clicked_col)
    //   .select('rect')
    //   .style('opacity', 1);

    d3.select(clicked_col)
      .append('rect')
      .classed('click_hlight',true)
      .classed('col_top_hlight',true)
      .attr('width',params.viz.clust.dim.height)
      .attr('height',hlight_width)
      .attr('fill',params.matrix.hlight_color)
      .attr('opacity',opacity_hlight)
      .attr('transform',function(){
        var tmp_translate_y = 0;
        var tmp_translate_x = -(params.viz.clust.dim.height+
          params.viz.cat_room.col+params.viz.uni_margin);
        return 'translate('+tmp_translate_x+','+tmp_translate_y+')';
      });

    d3.select(clicked_col)
      .append('rect')
      .classed('click_hlight',true)
      .classed('col_bottom_hlight',true)
      .attr('width',params.viz.clust.dim.height)
      .attr('height',hlight_width)
      .attr('fill',params.matrix.hlight_color)
      .attr('opacity',opacity_hlight)
      .attr('transform', function(){
        // reverse x and y since rotated
        var tmp_translate_y = params.viz.x_scale.rangeBand() - hlight_width;
        var tmp_translate_x = -(params.viz.clust.dim.height +
          params.viz.cat_room.col+params.viz.uni_margin);
        return 'translate('+tmp_translate_x+','+tmp_translate_y+')';
      });
  } else {
    d3.selectAll(params.root+' .click_hlight')
      .remove();
    params.click_hlight_col = -666;
  }

};
