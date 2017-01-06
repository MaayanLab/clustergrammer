module.exports = function toggle_grid_lines(params){

  if (params.zoom_info.zoom_x * params.viz.border_width.x > 1){
    d3.selectAll(params.root+' .vert_lines').select('line')
      .style('display','block')
      .style('opacity', 0)
      .transition()
      .style('opacity', 1);
  } else {
    d3.selectAll(params.root+' .vert_lines').select('line').style('display','none');
  }

  if (params.zoom_info.zoom_y * params.viz.border_width.y > 1){
    d3.selectAll(params.root+' .horz_lines').select('line')
      .style('display','block')
      .style('opacity', 0)
      .transition()
      .style('opacity', 1);
  } else {
    d3.selectAll(params.root+' .horz_lines').select('line').style('display','none');
  }
};