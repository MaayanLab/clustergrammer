module.exports = function enter_grid_lines(params, delays, duration){

  var row_nodes = params.network_data.row_nodes;
  var row_nodes_names = params.network_data.row_nodes_names;

  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = params.network_data.col_nodes_names;

  // Fade in new gridlines
  ///////////////////////////

  // append horizontal lines
  d3.select(params.root+' .clust_group')
    .selectAll('.horz_lines')
    .data(row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class','horz_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.viz.y_scale(inst_index) + ') rotate(0)';
    })
    .append('line')
    .attr('x1',0)
    .attr('x2',params.viz.clust.dim.width)
    .style('stroke-width', function(){
      var inst_width;
      if (params.viz.zoom_switch > 1){
        inst_width = params.viz.border_width/params.viz.zoom_switch;
      } else {
        inst_width = params.viz.border_width;
      }
      return inst_width+'px';
    })
    .attr('opacity',0)
    .attr('stroke','white')
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);

  // append vertical line groups
  d3.select(params.root+' .clust_group')
    .selectAll('.vert_lines')
    .data(col_nodes)
    .enter()
    .append('g')
    .attr('class', 'vert_lines')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
    })
    .append('line')
    .attr('x1', 0)
    .attr('x2', -params.viz.clust.dim.height)
    .style('stroke-width', function(){
      var inst_width;
       if (params.viz.zoom_switch_y > 1){
        inst_width = params.viz.border_width/ params.viz.zoom_switch_y;
       } else {
        inst_width = params.viz.border_width;
       }
       return inst_width + 'px';
    })
    .style('stroke', 'white')
    .attr('opacity',0)
    .transition().delay(delays.enter).duration(2*duration)
    .attr('opacity',1);
    
  };