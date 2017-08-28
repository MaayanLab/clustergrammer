var enter_split_tiles = require('./enter_split_tiles');
var mouseover_tile = require('../matrix/mouseover_tile');
var mouseout_tile = require('../matrix/mouseout_tile');
var fine_position_tile = require('../matrix/fine_position_tile');
var underscore = require('underscore');

// make each row in the clustergram
module.exports = function enter_new_rows(params, ini_inp_row_data, delays, duration, tip, row_selection) {

  var inp_row_data = ini_inp_row_data.row_data;

  // remove zero values to make visualization faster
  var row_data = underscore.filter(inp_row_data, function(num) {
    return num.value !== 0;
  });

  // update tiles
  ////////////////////////////////////////////
  var tile = d3.select(row_selection)
    .selectAll('rect')
    .data(row_data, function(d){ return d.col_name; })
    .enter()
    .append('rect')
    .attr('class', 'tile row_tile')
    .attr('width', params.viz.rect_width)
    .attr('height', params.viz.rect_height)
    // switch the color based on up/dn value
    .style('fill', function(d) {
      return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
    })
    .on('mouseover', function(...args) {
      mouseover_tile(params, this, tip, args);
    })
    .on('mouseout', function mouseout() {
      mouseout_tile(params, this, tip);
    });

  tile
    .style('fill-opacity',0)
    .transition().delay(delays.enter)
    .duration(duration)
    .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      return output_opacity;
    });

  tile
    .attr('transform', function(d) {
      return fine_position_tile(params, d);
    });

  if (params.matrix.tile_type == 'updn'){
    enter_split_tiles(params, inp_row_data, row_selection, tip, delays, duration, tile);
  }

};