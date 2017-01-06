var grid_lines_viz = require('./grid_lines_viz');

module.exports = function draw_gridlines(params, delays, duration){

  console.log('draw_gridlines')

  var row_nodes = params.network_data.row_nodes;
  var col_nodes = params.network_data.col_nodes;

  // Fade in new gridlines
  ///////////////////////////

  // append horizontal line groups
  var horz_lines = d3.select(params.root+' .clust_group')
    .selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','horz_lines');

  // append vertical line groups
  var vert_lines = d3.select(params.root+' .clust_group')
    .selectAll('.vert_lines')
    .data(col_nodes)
    .enter()
    .append('g')
    .attr('class', 'vert_lines');

  grid_lines_viz  (params, horz_lines, vert_lines)

  horz_lines
    .attr('opacity',0)
    .attr('stroke','red')
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

  vert_lines
    .style('stroke', 'green')
    .attr('opacity',0)
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

};
