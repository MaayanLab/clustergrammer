module.exports = function set_up_colorbar(sidebar){

  var colorbar_sliders = sidebar
    .append('div')
    .classed('colorbar_sliders',true);

  colorbar_sliders
    .append('p')
    .classed('viz_medium_text',true)
    .text('Row Group Size');

  colorbar_sliders
    .append('div')
    .classed('slider_row',true)
    .classed('slider',true);

  colorbar_sliders
    .append('p')
    .classed('viz_medium_text',true)
    .text('Column Group Size');

  colorbar_sliders
    .append('div')
    .classed('slider_col',true)
    .classed('slider',true);

};