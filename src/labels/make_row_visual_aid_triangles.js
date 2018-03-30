module.exports = function make_row_visual_aid_triangles(params){

  if (d3.select(params.root+' .row_cat_group path').empty() === true){
    d3.selectAll(params.root+' .row_cat_group')
    .append('path')
    .attr('d', function() {
      var origin_x = params.viz.cat_room.symbol_width - 1;
      var origin_y = 0;
      var mid_x = 1;
      var mid_y = params.viz.y_scale.rangeBand() / 2;
      var final_x = params.viz.cat_room.symbol_width - 1;
      var final_y = params.viz.y_scale.rangeBand();
      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
        mid_x + ',' + mid_y + ' L ' + final_x + ',' + final_y + ' Z';
      return output_string;
    })
    .attr('fill', '#eee')
    .style('opacity', params.viz.triangle_opacity);
  }

};