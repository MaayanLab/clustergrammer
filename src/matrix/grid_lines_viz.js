module.exports = function grid_lines_viz(params, duration=0){

  var delay = 0;
  if (duration > 0){
    delay = 2000;
  }

  var horz_lines = d3.selectAll(params.root+' .horz_lines');
  var vert_lines = d3.selectAll(params.root+' .vert_lines');

  horz_lines
    .style('opacity', 0)
    .attr('transform', function(d) {
      var inst_index = d.row_index;
      var inst_trans = params.viz.y_scale(inst_index);
      return 'translate(  0,' + inst_trans + ') rotate(0)';
    })
    .transition()
    .duration(duration)
    .delay(delay)
    .style('opacity', 1);

  horz_lines
    .append('line')
    .attr('x1',0)
    .attr('x2',params.viz.clust.dim.width)
    .style('stroke-width', function(){
      var inst_width = params.viz.border_width.y;
      return inst_width+'px';
    });

  vert_lines
    .style('opacity', 0)
    .attr('transform', function(d) {
      var inst_index = d.col_index;
      var inst_trans = params.viz.x_scale(inst_index);
      return 'translate(' + inst_trans + ') rotate(-90)';
    })
    .transition()
    .duration(duration)
    .delay(delay)
    .style('opacity', 1);

  vert_lines
    .append('line')
    .attr('x1', 0)
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', function(){
      var inst_width = params.viz.border_width.x;
       return inst_width + 'px';
    });

};