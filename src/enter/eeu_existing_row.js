var exit_existing_row = require('../exit/exit_existing_row');
var enter_existing_row = require('./enter_existing_row');
var update_split_tiles = require('../update/update_split_tiles');

// TODO add tip back to arguments
module.exports = function eeu_existing_row(params, ini_inp_row_data, delays, duration, row_selection, tip) {

  console.log(tip)

  var inp_row_data = ini_inp_row_data.row_data;

  // remove zero values from
  var row_values = _.filter(inp_row_data, function(num){
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
        tip.show(p);
      // }
    })
    .on('mouseout', function mouseout() {
      d3.selectAll(params.root+' text').classed('active', false);
      // if (params.matrix.show_tile_tooltips){
        tip.hide();
      // }
    });

  var col_nodes_names = params.network_data.col_nodes_names;

  if (delays.run_transition){
    update_row_tiles
      .transition().delay(delays.update).duration(duration)
      .attr('width', params.viz.rect_width)
      .attr('height', params.viz.rect_height)
      .attr('transform', function(d) {
        if (_.contains(col_nodes_names, d.col_name)){
          var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
          var x_pos = params.viz.x_scale(inst_col_index) + 0.5*params.viz.border_width;
          return 'translate(' + x_pos + ',0)';
        }
      });
  } else {
    update_row_tiles
      .attr('width', params.viz.rect_width)
      .attr('height', params.viz.rect_height)
      .attr('transform', function(d) {
        if (_.contains(col_nodes_names, d.col_name)){
          var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
          var x_pos = params.viz.x_scale(inst_col_index) + 0.5*params.viz.border_width;
          return 'translate(' + x_pos + ',0)';
        }
      });
  }

  if (params.matrix.tile_type == 'updn'){
    update_split_tiles(params, inp_row_data, row_selection, delays, duration, cur_row_tiles);
  }

  enter_existing_row(params, delays, duration, cur_row_tiles);

};
