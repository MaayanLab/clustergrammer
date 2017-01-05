var mouseover_tile = require('../matrix/mouseover_tile');
var mouseout_tile = require('../matrix/mouseout_tile');
var fine_position_tile = require('../matrix/fine_position_tile');

module.exports = function enter_existing_row(params, delays, duration, cur_row_tiles, tip){

  // enter new tiles
  var new_tiles = cur_row_tiles
    .enter()
    .append('rect')
    .attr('class', 'tile row_tile')
    .attr('width', params.viz.rect_width)
    .attr('height', params.viz.rect_height)
    .on('mouseover', function(...args) {
      mouseover_tile(params, this, tip, args);
    })
    .on('mouseout', function mouseout() {
      mouseout_tile(params, this, tip);
    })
    .attr('fill-opacity',0)
    .attr('transform', function(d){
      return fine_position_tile(params, d);
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