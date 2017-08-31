module.exports = function make_menu_update_button(cgm, button_info, update_callback){


  var update_button_width = cgm.params.viz.update_button_width;

  // var menu_width = button_info.menu_width;
  // var button_x = menu_width/2 + button_info.default_x_offset;

  var default_opacity = 0.35;
  var high_opacity = 0.5;

  var update_button = button_info.selection
    .append('g')
    .classed('update_button', true)
    .attr('transform', 'translate('+ button_info.update_x +', ' + button_info.update_y + ')')
    .on('click', update_callback)
    .on('mouseover', function(){
      d3.select(this)
        .select('rect')
        .attr('opacity', high_opacity);
    })
    .on('mouseout', function(){
      d3.select(this)
        .select('rect')
        .attr('opacity', default_opacity);
    });

  update_button
    .append('rect')
    .attr('width', update_button_width + 'px')
    .attr('height', '35px')
    .attr('fill', 'blue')
    .attr('transform', 'translate(0, -23)')
    .attr('stroke', '#A3A3A3')
    .attr('stroke-width', '1px')
    .attr('opacity', default_opacity);

  update_button
    .append('text')
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-size','18px')
    .attr('font-weight', 500)
    .attr('cursor', 'default')
    .text('Update')
    .attr('transform', 'translate(18, 0)');

};