module.exports = function make_tree_menu_button_section(cgm, tree_menu, menu_width,  button_names, click_function){

  // Linkage menu options
  var vertical_space = 30;
  var menu_y_offset = 110;
  var distance_line_offset = 80;
  var menu_x_offset = menu_width/20;
  var underline_width = menu_width/2 - 25;

  var distance_menu = tree_menu
    .append('g')
    .classed('distance_menu', true)
    .attr('transform', 'translate(' + menu_x_offset + ', 0)');

  distance_menu
    .append('text')
    .attr('transform', 'translate(0, 70)')
    .attr('font-size', '18px')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .style('cursor', 'default')
    .text('Distance Metric');

  distance_menu
    .append('rect')
    .classed('tree_menu_line', true)
    .attr('height', '2px')
    .attr('width', underline_width+'px')
    .attr('stroke-width', '3px')
    .attr('opacity', 0.3)
    .attr('fill', 'black')
    .attr('transform', 'translate(0,' + distance_line_offset + ')');

  var distance_section = distance_menu
    .append('g')
    .attr('transform', 'translate(0,'+menu_y_offset+')')
    .classed('distance_section', true);

  var distance_groups = distance_section
    .selectAll('g')
    .data(button_names)
    .enter()
    .append('g')
    .attr('transform', function(d,i){
      var vert = i * vertical_space;
      var transform_string = 'translate(0,'+ vert + ')';
      return transform_string;
    })
    .on('click', click_function);

  distance_groups
    .append('circle')
    .attr('cx', 10)
    .attr('cy', -6)
    .attr('r', 7)
    .style('stroke', '#A3A3A3')
    .style('stroke-width', '2px')
    .style('fill',function(d){
      var inst_color = 'white';
      if (d === cgm.params.matrix.distance_metric){
        inst_color = 'red';
      }

      return inst_color;
    });

  distance_groups
    .append('text')
    .attr('transform', 'translate(25,0)')
    .style('font-size','16px')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .style('cursor', 'default')
    .text(function(d){
      return capitalizeFirstLetter(d);
    });


  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }


};