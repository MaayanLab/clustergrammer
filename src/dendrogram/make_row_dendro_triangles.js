var calc_dendro_triangles = require('./calc_dendro_triangles');

module.exports = function make_row_dendro_triangles(params){

  var dendro_info = calc_dendro_triangles(params);

  var run_transition;
  if (d3.selectAll(params.root+' .row_dendro_group').empty()){
    run_transition = false;
  } else {
    run_transition = true;
    d3.selectAll(params.root+' .row_dendro_group')
      .remove();
  }

  // groups that hold classification triangle and colorbar rect
  d3.select(params.root+' .row_dendro_container')
    .selectAll('path')
    .data(dendro_info, function(d){return d.name;})
    .enter()
    .append('path')
    .style('opacity',0)
    .attr('class', 'row_dendro_group')
    .attr('d', function(d) {

      // up triangle
      var start_x = 0 ;
      var start_y = d.pos_top;
      
      var mid_x = 30;
      var mid_y = d.pos_mid;

      var final_x = 0;
      var final_y = d.pos_bot;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L' 
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('fill','black');

  var triangle_opacity;
  if (params.viz.inst_order.col === 'clust'){
    triangle_opacity = 0.35;
  } else {
    triangle_opacity = 0;
  }

  if (run_transition){

    d3.select(params.root+' .row_dendro_container')
      .selectAll('path') 
      .transition().delay(1000).duration(1500)
      .style('opacity', triangle_opacity);

  } else {

    d3.select(params.root+' .row_dendro_container')
      .selectAll('path') 
      .style('opacity', triangle_opacity);

  }

};