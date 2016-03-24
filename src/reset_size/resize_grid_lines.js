module.exports = function resize_grid_lines(params, svg_group){

  var col_nodes_names = params.network_data.col_nodes_names;
  var row_nodes_names = params.network_data.row_nodes_names;

  // reposition grid lines
  svg_group.selectAll('.horz_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.viz.y_scale(inst_index) + ') rotate(0)';
    });

  svg_group.selectAll('.horz_lines')
    .select('line')
    .attr('x2',params.viz.clust.dim.width)
    .style('stroke-width', function(){
      var inst_width;
      if (params.viz.zoom_switch > 1){
        inst_width = params.viz.border_width/params.viz.zoom_switch;
      } else {
        inst_width = params.viz.border_width;
      }
      return inst_width+'px';
    });

  svg_group.selectAll('.vert_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
    });

  svg_group.selectAll('.vert_lines')
    .select('line')
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', function(){
      var inst_width;
       if (params.viz.zoom_switch_y > 1){
        inst_width = params.viz.border_width/ params.viz.zoom_switch_y;
       } else {
        inst_width = params.viz.border_width;
       }
       return inst_width + 'px';
    });

};