module.exports = function draw_gridlines(params, delays, duration){

  console.log('draw_gridlines')

  var row_nodes = params.network_data.row_nodes;
  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = params.network_data.col_nodes_names;

  // Fade in new gridlines
  ///////////////////////////

  // append horizontal lines
  var horz_lines = d3.select(params.root+' .clust_group')
    .selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','horz_lines');

  horz_lines
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      var inst_trans = params.viz.y_scale(inst_index)// - params.viz.border_width.y/5;
      return 'translate(  0,' + inst_trans + ') rotate(0)';
    })

  horz_lines
    .append('line')
    .attr('x1',0)
    .attr('x2',params.viz.clust.dim.width)
    .style('stroke-width', function(){
      var inst_width = params.viz.border_width.y;
      return inst_width+'px';
    })

  horz_lines
    .attr('opacity',0)
    .attr('stroke','red')
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

  // append vertical line groups
  var vert_lines = d3.select(params.root+' .clust_group')
    .selectAll('.vert_lines')
    .data(col_nodes)
    .enter()
    .append('g')
    .attr('class', 'vert_lines');

  vert_lines
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      var inst_trans = params.viz.x_scale(inst_index); // - params.viz.border_width.x/2;
      return 'translate(' + inst_trans + ') rotate(-90)';
    })

  vert_lines
    .append('line')
    .attr('x1', 0)
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', function(){
      var inst_width = params.viz.border_width.x;
       return inst_width + 'px';
    })

  vert_lines
    .style('stroke', 'green')
    .attr('opacity',0)
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

};
