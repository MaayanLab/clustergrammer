module.exports = function make_colorbar(cgm){
  console.log('make_colorbar')

  var params = cgm.params;

  d3.select(params.root+' .sidebar_wrapper')
    .append('div')
    .classed('sidebar_text', true)
    .style('padding-left', '10px')
    .style('padding-top', '5px')
    .text('Matrix Values')

  var svg_height = 1000;
  var svg_width = 1000;

  var colorbar_width = params.sidebar.width - 20;
  var colorbar_height = 15;
  var low_left_margin = 10  ;
  var low_top_margin = 40;
  var high_left_margin = colorbar_width + 10;
  var high_top_margin = 40;
  var bar_margin_left = 10;
  var bar_margin_top = 3;

  var main_svg = d3.select(params.root+' .sidebar_wrapper')
    .append('svg')
    .attr('height', svg_height + 'px')
    .attr('width', svg_height + 'px');


  //Append a defs (for definition) element to your SVG
  var defs = main_svg.append("defs");

  //Append a linearGradient element to the defs and give it a unique id
  var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  //Set the color for the start (0%)
  linearGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "blue");

  //Set the color for the end (100%)
  linearGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "white");

  //Set the color for the end (100%)
  linearGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "red");


  // make colorbar
  main_svg
    .append('rect')
    .classed('background', true)
    .attr('height', colorbar_height + 'px')
    .attr('width', colorbar_width + 'px')
    .attr('fill', 'url(#linear-gradient)')
    .attr('transform', 'translate('+bar_margin_left+', '+bar_margin_top+')')
    .attr('stroke', 'grey')
    .attr('stroke-width', '0.25px');

  // make title
  ///////////////

  var max_abs_val = Math.abs(  Math.round(params.matrix.max_link * 10) /10)

  main_svg
    .append('text')
    .text('-' + max_abs_val.toLocaleString())
    .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .style('font-weight',  300)
    .style('font-size', 15)
    .attr('transform', 'translate('+low_left_margin+','+low_top_margin+')')
    .attr('text-anchor', 'start');

  main_svg
    .append('text')
    .text(max_abs_val.toLocaleString())
    .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .style('font-weight',  300)
    .style('font-size', 15)
    .attr('transform', 'translate('+high_left_margin+','+high_top_margin+')')
    .attr('text-anchor', 'end');
}