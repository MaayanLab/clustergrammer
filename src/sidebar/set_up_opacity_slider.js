module.exports = function set_up_opacity_slider(sidebar){

  var slider_container = sidebar
    .append('div')
    .classed('opacity_slider_container', true)
    .style('margin-top', '5px')
    .style('padding-left', '10px')
    .style('padding-right', '10px');

  slider_container
    .append('div')
    .classed('sidebar_text', true)
    .classed('opacity_slider_text', true)
    .style('margin-bottom', '3px')
    .text('Opacity Slider');

  slider_container
    .append('div')
    .classed('slider', true)
    .classed('opacity_slider', true);

};
