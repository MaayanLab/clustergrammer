module.exports = function make_menu_button_section(menu_type, button_type, button_info,  button_names){

  var cgm = button_info.cgm;
  var menu_width = button_info.menu_width;
  var button_offset = 35;

  // Linkage menu options
  var vertical_space = 30;
  var menu_x_offset = menu_width/20 + button_info.x_offset;
  var underline_width = menu_width/2 - 40;

  var inst_menu = button_info.selection
    .append('g')
    .classed('inst_menu', true)
    .attr('transform', 'translate(' + menu_x_offset + ', ' + button_info.y_offset + ')');

  inst_menu
    .append('text')
    .attr('transform', 'translate(0, 0)')
    .attr('font-size', '18px')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('cursor', 'default')
    .text(button_info.name);

  inst_menu
    .append('rect')
    .classed( menu_type + '_line', true)
    .attr('height', '2px')
    .attr('width', underline_width+'px')
    .attr('stroke-width', '3px')
    .attr('opacity', 0.3)
    .attr('fill', 'black')
    .attr('transform', 'translate(0,10)');

  var inst_section = inst_menu
    .append('g')
    .attr('transform', 'translate(0,' + button_offset + ')')
    .classed('inst_section', true);

  var button_class = cgm.params.root.replace('#','')+ '_' + button_type + '_buttons';

  var section_groups = inst_section
    .selectAll('g')
    .data(button_names)
    .enter()
    .append('g')
    .classed(button_class, true)
    .attr('transform', function(d,i){
      var vert = i * vertical_space;
      var transform_string = 'translate(0,'+ vert + ')';
      return transform_string;
    })
    .attr('cursor', 'default')
    .on('click', function(d){
      // deselect all buttons
      d3.selectAll( '.' + button_class + ' circle')
        .attr('fill', 'white');

      // pass this along so that it can be updated in the callback
      click_function(this, d, button_info);
    });

 function click_function(button_selection, d, button_info){
    button_info[button_type] = d;
    d3.select(button_selection)
      .select('circle')
      .attr('fill', 'red');
  }

  section_groups
    .append('circle')
    .attr('cx', 10)
    .attr('cy', -6)
    .attr('r', 7)
    .attr('stroke', '#A3A3A3')
    .attr('stroke-width', '2px')
    .attr('fill', function(d){
      return circle_fill_function(d, button_type);
    });

  function circle_fill_function(d, button_type){
    var inst_color = 'white';
    if (d === cgm.params.matrix[button_type]){
      inst_color = 'red';
    }
    return inst_color;
  }

  section_groups
    .append('text')
    .attr('transform', 'translate(25,0)')
    .attr('font-size','16px')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('cursor', 'default')
    .text(function(d){
      return capitalizeFirstLetter(d);
    });


  function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
  }


};