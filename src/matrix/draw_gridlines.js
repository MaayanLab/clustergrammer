// var grid_lines_viz = require('./grid_lines_viz');
// var toggle_grid_lines = require('./toggle_grid_lines');

 /* eslint-disable */
module.exports = function draw_gridlines(params, delays, duration){

  // var row_nodes = params.network_data.row_nodes;
  // var col_nodes = params.network_data.col_nodes;

  // // Fade in new gridlines
  // ///////////////////////////

  // // append horizontal line groups
  // var horz_lines = d3.select(params.root+' .clust_group')
  //   .selectAll('.horz_lines')
  //   .data(row_nodes, function(d){return d.name;})
  //   .enter()
  //   .append('g')
  //   .attr('class','horz_lines');

  // // append vertical line groups
  // var vert_lines = d3.select(params.root+' .clust_group')
  //   .selectAll('.vert_lines')
  //   .data(col_nodes)
  //   .enter()
  //   .append('g')
  //   .attr('class', 'vert_lines');

  // grid_lines_viz(params, duration);

  // horz_lines
  //   .select('line')
  //   .attr('opacity',0)
  //   .attr('stroke','white')
  //   .attr('opacity', 1);

  // vert_lines
  //   .select('line')
  //   .style('stroke', 'white')
  //   .attr('opacity',0)
  //   .transition().delay(delays.enter).duration(2*duration)
  //   .attr('opacity', 1);

  // toggle_grid_lines(params);

};
