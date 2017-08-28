var underscore = require('underscore');

module.exports = function exit_existing_row(params, delays, cur_row_tiles, inp_row_data, row_selection){

  if (delays.run_transition){
    cur_row_tiles
      .exit()
      .transition().duration(300)
      .attr('fill-opacity',0)
      .remove();
  } else {
    cur_row_tiles
      .exit()
      .attr('fill-opacity',0)
      .remove();
  }

  if (params.matrix.tile_type == 'updn'){

    // value split
    var row_split_data = underscore.filter(inp_row_data, function(num){
      return num.value_up != 0 || num.value_dn !=0 ;
    });

    // tile_up
    var cur_tiles_up = d3.select(row_selection)
      .selectAll('.tile_up')
      .data(row_split_data, function(d){return d.col_name;});

    if (delays.run_transition){
      cur_tiles_up
        .exit()
        .transition().duration(300)
        .attr('fill','0')
        .remove();
    } else {
      cur_tiles_up
        .exit()
        .attr('fill',0)
        .remove();
    }

    // tile_dn
    var cur_tiles_dn = d3.select(row_selection)
      .selectAll('.tile_dn')
      .data(row_split_data, function(d){return d.col_name;});

    if (delays.run_transition){
      cur_tiles_dn
        .exit()
        .transition().duration(300)
        .attr('fill',0)
        .remove();
    } else {
      cur_tiles_dn
        .exit()
        .attr('fill',0)
        .remove();
    }

  }



};