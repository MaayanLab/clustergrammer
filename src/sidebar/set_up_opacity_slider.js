module.exports = function set_up_opacity_slider(sidebar, params){

  var slider_container = sidebar
    .append('div')
    .classed('opacity_slider_container', true)
    .style('margin-top', '5px');

  slider_container
    .append('div')
    .classed('sidebar_text', true)
    .append('opacity_slider', true)
    .style('margin-bottom', '3px')
    .style('margin-left', '5px')
    .text('Opacity Slider');


}