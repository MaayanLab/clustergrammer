var calc_dendro_triangles = require('./calc_dendro_triangles');

module.exports = function make_row_dendro_triangles(params){
  var dendro_info = calc_dendro_triangles(params);
 
  d3.selectAll(params.root+' .row_dendro_group')
    .remove();

  // groups that hold classification triangle and colorbar rect
  d3.select(params.root+' .row_dendro_container')
    .selectAll('path')
    .data(dendro_info, function(d){return d.name;})
    .enter()
    .append('path')
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
    .style('fill','black')
    .attr('opacity',0.35);

};