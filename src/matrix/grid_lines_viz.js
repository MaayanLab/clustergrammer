module.exports = function grid_lines_viz(params){

  console.log('grid_lines_viz')

  var horz_lines = d3.selectAll(params.root+' .horz_lines');
  var vert_lines = d3.selectAll(params.root+' .vert_lines');

  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;

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

};