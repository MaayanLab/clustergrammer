var exit_existing_row = require('../exit/exit_existing_row');
var enter_existing_row = require('./enter_existing_row');
var update_split_tiles = require('../update/update_split_tiles');
var mouseover_tile = require('../matrix/mouseover_tile');
var mouseout_tile = require('../matrix/mouseout_tile');
var fine_position_tile = require('../matrix/fine_position_tile');
var underscore = require('underscore');

// TODO add tip back to arguments
module.exports = function eeu_existing_row(params, ini_inp_row_data, delays, duration, row_selection, tip) {

  var inp_row_data = ini_inp_row_data.row_data;

  // remove zero values from
  var row_values = underscore.filter(inp_row_data, function(num){
    return num.value !=0;
  });

  // bind data to tiles
  var cur_row_tiles = d3.select(row_selection)
    .selectAll('.tile')
    .data(row_values, function(d){
      return d.col_name;
    });

  exit_existing_row(params, delays, cur_row_tiles, inp_row_data, row_selection);

  ///////////////////////////
  // Update
  ///////////////////////////

  // update tiles in x direction
  var update_row_tiles = cur_row_tiles
    .on('mouseover', function(...args) {
      mouseover_tile(params, this, tip, args);
    })
    .on('mouseout', function mouseout() {
      mouseout_tile(params, this, tip);
    });

  var col_nodes_names = params.network_data.col_nodes_names;

  if (delays.run_transition){

    update_row_tiles
      .transition().delay(delays.update).duration(duration)
      .attr('width', params.viz.rect_width)
      .attr('height', params.viz.rect_height)
      .attr('transform', function(d) {
        // if (_.contains(col_nodes_names, d.col_name)){
        if (underscore.contains(col_nodes_names, d.col_name)){
          return fine_position_tile(params, d);
        } else {
          return 'translate(0,0)';
        }
      });

  } else {
    update_row_tiles
      .attr('width', params.viz.rect_width)
      .attr('height', params.viz.rect_height)
      .attr('transform', function(d) {
        if (underscore.contains(col_nodes_names, d.col_name)){
          return fine_position_tile(params, d);
        } else {
          return 'translate(0,0)';
        }
      });
  }

  if (params.matrix.tile_type == 'updn'){
    update_split_tiles(params, inp_row_data, row_selection, delays, duration, cur_row_tiles, tip);
  }

  enter_existing_row(params, delays, duration, cur_row_tiles, tip);

};
