
function draw_grid_lines(row_nodes, col_nodes) {

    // append horizontal lines
    d3.select('#clust_group')
      .selectAll('.horz_lines')
      .data(row_nodes, function(d){return d.name;})
      .enter()
      .append('g')
      .attr('class','horz_lines')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ') rotate(0)';
      })
      .append('line')
      .attr('x1',0)
      .attr('x2',params.viz.clust.dim.width)
      .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')
      .style('stroke','white')

    // append vertical line groups
    d3.select('#clust_group')
      .selectAll('.vert_lines')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'vert_lines')
      .attr('transform', function(d, index) {
          return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
      })
      .append('line')
      .attr('x1', 0)
      .attr('x2', -params.viz.clust.dim.height)
      .style('stroke-width', params.viz.border_width + 'px')
      .style('stroke', 'white');
  }