module.exports = function set_up_opacity_slider(sidebar, params){

  var slider_container = sidebar
    .append('div')
    .classed('opacity_slider_container', true)
    .style('margin-top', '5px')
    .style('padding-left', '15px')
    .style('padding-right', '15px');

  slider_container
    .append('div')
    .classed('sidebar_text', true)
    .classed('opacity_slider_text', true)
    .style('margin-bottom', '3px')
    .text('Opacity Slider');

  slider_container
    .append('div')
    .classed('opacity_slider', true);

  $( params.root+' .opacity_slider' ).slider({
    value:1.0
  });

};
