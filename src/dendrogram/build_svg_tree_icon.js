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
    })
    .on('click', click_dendro_slider);

  var offset_triangle = 0; // -slider_length/40;
  var tree_width = 20;

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
    .on('click', click_dendro_slider);


  var default_opacity = 0.35;
  var high_opacity = 0.6;
  var circle_radius = 15;
  slider_group
    .append('circle')
    .classed(inst_rc+'_group_circle', true)
    .attr('r', circle_radius)
    .attr('transform', function(){
      return 'translate('+tree_width/2+', '+0+')';
    })
    .style('fill', 'blue')
    .style('opacity', default_opacity)
    .on('mouseover', function(){
      d3.select(this).style('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.select(this).style('opacity', default_opacity);
    });


  function click_dendro_slider(){

    var clicked_line_position = d3.mouse(this);

    var rel_pos = d3.round(clicked_line_position[1], -1);

    d3.select(cgm.params.root+ ' .'+inst_rc+'_group_circle')
      .attr('transform', 'translate(0, '+ rel_pos + ')');

    var slider_value = 10 - rel_pos/10;


  }
};
