module.exports = function set_up_opacity_slider(sidebar, params){

  var slider_container = sidebar
    .append('div')
    .classed('opacity_slider_container', true)
    .style('margin-top', '5px');

  slider_container
    .append('div')
    .classed('sidebar_text', true)
    .classed('opacity_slider_text', true)
    .style('margin-bottom', '3px')
    .style('margin-left', '5px')
    .text('Opacity Slider');

  slider_container
    .append('div')
    .classed('opacity_slider', true)
    // .classed('slider', true)
    .style('width', params.sidebar.slider.width+'px')
    .style('margin-left', params.sidebar.slider.margin_left+'px');

  $( params.root+' .opacity_slider' ).slider({ value:1.0 });

}