var draw_up_tile = require('../enter/draw_up_tile');
var draw_dn_tile = require('../enter/draw_dn_tile');
var mouseover_tile = require('../matrix/mouseover_tile');
var mouseout_tile = require('../matrix/mouseout_tile');
var fine_position_tile = require('../matrix/fine_position_tile');
var underscore = require('underscore');

module.exports = function update_split_tiles(params, inp_row_data, row_selection, delays, duration, cur_row_tiles, tip){

  // value split
  var row_split_data = underscore.filter(inp_row_data, function(num){
    return num.value_up != 0 || num.value_dn !=0 ;
  });

  // tile_up
  var cur_tiles_up = d3.select(row_selection)
    .selectAll('.tile_up')
    .data(row_split_data, function(d){return d.col_name;});

  // update split tiles_up
  var update_tiles_up = cur_tiles_up
    .on('mouseover', function(...args) {
      mouseover_tile(params, this, tip, args);
    })
    .on('mouseout', function mouseout() {
      mouseout_tile(params, this, tip);
    });

  if (delays.run_transition){
    update_tiles_up
      .transition().delay(delays.update).duration(duration)
      .attr('d', function() {
        return draw_up_tile(params);
      })
      .attr('transform', function(d) {
        return fine_position_tile(params, d);
      });
  } else {
    update_tiles_up
      .attr('d', function() {
        return draw_up_tile(params);
      })
      .attr('transform', function(d) {
        return fine_position_tile(params, d);
      });
  }

  // tile_dn
  var cur_tiles_dn = d3.select(row_selection)
    .selectAll('.tile_dn')
    .data(row_split_data, function(d){return d.col_name;});

  // update split tiles_dn
  var update_tiles_dn = cur_tiles_dn
    .on('mouseover', function(...args) {
      mouseover_tile(params, this, tip, args);
    })
    .on('mouseout', function mouseout() {
      mouseout_tile(params, this, tip);
    });

  if (delays.run_transition){
    update_tiles_dn
      .transition().delay(delays.update).duration(duration)
      .attr('d', function() {
        return draw_dn_tile(params);
      })
      .attr('transform', function(d) {
        return fine_position_tile(params, d);
      });
  } else {
    update_tiles_dn
      .attr('d', function() {
        return draw_dn_tile(params);
      })
      .attr('transform', function(d) {
        return fine_position_tile(params, d);
      });
  }

  // remove tiles when splitting is done
  cur_row_tiles
    .selectAll('.tile')
    .each(function(d){
      if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
        d3.select(this)
          .remove();
      }
    });
};