module.exports = function enter_existing_row(params, delays, duration, cur_row_tiles){

  // enter new tiles
  var new_tiles = cur_row_tiles
    .enter()
    .append('rect')
    .attr('class', 'tile row_tile')
    .attr('width', params.matrix.rect_width)
    .attr('height', params.matrix.rect_height)
    .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll(params.root+' .row_label_group text')
        .classed('active', function(d) {
          return p.row_name === d.name;
        });

      d3.selectAll(params.root+' .col_label_text text')
        .classed('active', function(d) {
          return p.col_name === d.name;
        });
      // if (params.matrix.show_tile_tooltips){
      //   tip.show(p);
      // }
    })
    .on('mouseout', function mouseout() {
      d3.selectAll(params.root+' text').classed('active', false);
      // if (params.matrix.show_tile_tooltips){
      //   tip.hide();
      // }
    })
    .attr('fill-opacity',0)
    .attr('transform', function(d){
      var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
      var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
      return 'translate('+x_pos+','+y_pos+')';
    });


  if (delays.run_transition){
    new_tiles
      .transition().delay(delays.enter).duration(duration)
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .attr('fill-opacity',function(d){
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });
  } else {
    new_tiles
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .attr('fill-opacity',function(d){
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });
  }

  // remove new tiles if necessary
  new_tiles
    .each(function(d){
      if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
        d3.select(this)
          .remove();
      }
    });
};