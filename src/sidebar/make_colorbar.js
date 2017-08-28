var underscore = require('underscore');

module.exports = function make_colorbar(cgm){

  var params = cgm.params;

  d3.select(params.root+' .sidebar_wrapper')
    .append('div')
    .classed('sidebar_text', true)
    .style('padding-left', '10px')
    .style('padding-top', '5px')
    .text('Matrix Values');


  var colorbar_width = params.sidebar.width - 20;
  var colorbar_height = 13;
  var svg_height = 3*colorbar_height;
  var svg_width =  1.2*colorbar_width;
  var low_left_margin = 10  ;
  var top_margin = 33;
  var high_left_margin = colorbar_width + 10;
  var bar_margin_left = 10;
  var bar_margin_top = 3;

  var network_data = params.network_data;

  var max_link = underscore.max(network_data.links, function (d) {
    return d.value;
  }).value;

  var min_link = underscore.min(network_data.links, function (d) {
    return d.value;
  }).value;

  var main_svg = d3.select(params.root+' .sidebar_wrapper')
    .append('svg')
    .attr('height', svg_height + 'px')
    .attr('width', svg_width + 'px');

  //Append a defs (for definition) element to your SVG
  var defs = main_svg.append("defs");

  //Append a linearGradient element to the defs and give it a unique id
  var linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");

  var special_case = 'none';

  // no negative numbers
  if ( min_link >= 0 ) {

    //Set the color for the start (0%)
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "white");

    //Set the color for the end (100%)
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "red");

    special_case = 'all_postiive';

  // no positive numbers
  } else if (max_link <= 0){

    //Set the color for the start (0%)
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "blue");

    //Set the color for the end (100%)
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "white");

    special_case = 'all_negative';

  }

  // both postive and negative numbers
  else {
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

    }


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

  var max_abs_val = Math.abs(  Math.round(params.matrix.max_link * 10) /10);
  var font_size = 13;

  main_svg
    .append('text')
    .text(function(){
      var inst_string;
      if (special_case === 'all_postiive'){
        inst_string = 0;
      } else {
        inst_string= '-' + max_abs_val.toLocaleString();
      }
      return inst_string;
    })
    .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .style('font-weight',  300)
    .style('font-size', font_size)
    .attr('transform', 'translate('+low_left_margin+','+top_margin+')')
    .attr('text-anchor', 'start');

  main_svg
    .append('text')
    .text(max_abs_val.toLocaleString())
    .text(function(){
      var inst_string;
      if (special_case === 'all_negative'){
        inst_string = 0;
      } else {
        inst_string=  max_abs_val.toLocaleString();
      }
      return inst_string;
    })
    .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .style('font-weight',  300)
    .style('font-size', font_size)
    .attr('transform', 'translate('+high_left_margin+','+top_margin+')')
    .attr('text-anchor', 'end');
};