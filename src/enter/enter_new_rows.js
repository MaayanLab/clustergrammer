var enter_split_tiles = require('./enter_split_tiles');

// make each row in the clustergram
module.exports = function enter_new_rows(params, ini_inp_row_data, delays, duration, tip, row_selection) {

  var inp_row_data = ini_inp_row_data.row_data;

  // remove zero values to make visualization faster
  var row_data = _.filter(inp_row_data, function(num) {
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
    .attr('width', params.matrix.rect_width)
    .attr('height', params.matrix.rect_height)
    // switch the color based on up/dn value
    .style('fill', function(d) {
      return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
    })
    .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll(params.root+' .row_label_text text')
        .classed('active', function(d) {
          return p.row_name === d.name;
        });

      d3.selectAll(params.root+' .col_label_text text')
        .classed('active', function(d) {
          return p.col_name === d.name;
        });
    })
    .on('mouseout', function mouseout() {
      d3.selectAll(params.root+' text').classed('active', false);
    });

  tile
    .style('fill-opacity',0)
    .transition().delay(delays.enter).duration(duration)
    .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      return output_opacity;
    });

  tile
    .attr('transform', function(d) {
      var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
      var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
      return 'translate(' + x_pos + ','+y_pos+')';
    });

  if (params.matrix.tile_type == 'updn'){
    enter_split_tiles(params, inp_row_data, row_selection, tip, delays, duration, tile);
  }

};