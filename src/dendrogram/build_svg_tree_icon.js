var position_svg_dendro_slider = require('./position_svg_dendro_slider');

module.exports = function build_svg_tree_icon(cgm, inst_rc){

  inst_rc = 'row';

  var slider_length = 40;

  var slider_group = d3.select(cgm.params.root +' .viz_svg')
      .append('g')
      .classed( inst_rc + '_tree_group', true);

  position_svg_dendro_slider(cgm, inst_rc);

  var rect_height = slider_length + 20;
  var rect_width = 30;
  slider_group
    .append('rect')
    .classed(inst_rc+'_slider_background', true)
    .attr('height', rect_height+'px')
    .attr('width', rect_width+'px')
    .attr('fill', cgm.params.viz.background_color)
    .attr('transform', function(){
      var translate_string = 'translate(-10, -5)';
      return translate_string;
    })
    .style('opacity', 0);

  slider_group
    .append("line")
    .style('stroke-width', slider_length/7+'px')
    .style('stroke', 'black')
    .style('stroke-linecap', 'round')
    .style('opacity', 0.0)
    .attr("y1", 0)
    .attr("y2", function(){
      return slider_length-2;
    });

  var offset_triangle = 0; // -slider_length/40;
  var tree_width = 20;

  // main branch
  slider_group
    .append('path')
    .style('fill', 'black')
    .attr('transform', 'translate('+offset_triangle+', 0)')
    .attr('d', function() {

      // up triangle
      var start_x = 0;
      var start_y = slider_length;

      var mid_x = tree_width/2;//left_x + slider_length/10;
      var mid_y = 0;

      var final_x = tree_width;//left_x + slider_length/5;
      var final_y = slider_length;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('opacity', 0.35)
    .on('mouseover', function(){
      d3.selectAll(cgm.params.root + ' .tree_leaf_circle').style('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.selectAll(cgm.params.root + ' .tree_leaf_circle').style('opacity', default_opacity);
    });

  // left branch
  var branch_height = 30;
  slider_group
    .append('path')
    .style('fill', 'black')
    .attr('transform', 'translate('+offset_triangle+', 0)')
    .attr('d', function() {

      // up triangle
      var start_x = 3.4;
      var start_y = 27;

      var mid_x = -5;//left_x + slider_length/10;
      var mid_y = branch_height/2.5;

      var final_x = 5.05;//left_x + slider_length/5;
      var final_y = branch_height/1.5;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('opacity', 0.35)
    .on('mouseover', function(){
      d3.selectAll(cgm.params.root + ' .tree_leaf_circle').style('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.selectAll(cgm.params.root + ' .tree_leaf_circle').style('opacity', default_opacity);
    });

  var default_opacity = 0.35;
  var high_opacity = 0.6;
  var circle_radius = 15;
  var small_leaf_offset = 13;
  var small_leaf_radius = 9;
  slider_group
    .selectAll()
    .data([
      [-3,small_leaf_offset,small_leaf_radius],
      [tree_width/2,0, 17],
      [23,small_leaf_offset,small_leaf_radius]])
    .enter()
    .append('circle')
    .classed('tree_leaf_circle', true)
    .attr('r', function(d){
      return d[2];
    })
    .attr('transform', function(d){
      return 'translate('+d[0]+', '+d[1]+')';
    })
    .style('fill', 'blue')
    .style('opacity', default_opacity)
    .on('mouseover', function(){
      d3.selectAll(cgm.params.root + ' .tree_leaf_circle').style('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.selectAll(cgm.params.root + ' .tree_leaf_circle').style('opacity', default_opacity);
    });


};
