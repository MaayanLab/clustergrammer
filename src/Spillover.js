
/* Spillover Module 
*/
function Spillover( params, container_all_col ){

  // make spillover protection divs 
  make( params, container_all_col );

  function make( params, container_all_col ){

    // Spillover Protection 
    //////////////////////////

    // hide spillover from slanted column labels on right side
    container_all_col
      .append('path')
      .style('stroke-width', '0')
      // mini-language for drawing path in d3, used to draw triangle
      .attr('d', 'M 0,0 L 500,-500, L 500,0 Z')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('id', 'right_slant_triangle')
      .attr('transform', 'translate(' + params.clust.dim.width + ',' +
      params.norm_label.width.col + ')');

    // hide spillover from slanted column labels on left side
    container_all_col
      .append('path')
      .style('stroke-width', '0')
      // mini-language for drawing path in d3, used to draw triangle
      .attr('d', 'M 0,0 L 500,-500, L 0,-500 Z')
      .attr('fill', params.viz.background_color)
      .attr('id', 'left_slant_triangle')
      // shift left by 1 px to prevent cutting off labels
      .attr('transform', 'translate(-1,' + params.norm_label.width.col +
      ')');

    // top corner rect
    ///////////////////////////////
    // white rect to cover excess labels
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', params.clust.margin.left)
      .attr('height', params.clust.margin.top)
      .attr('id', 'top_left_white');

    // hide spillover from right
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', '300px')
      .attr('height', '3000px')
      .attr('transform', function() {
      var tmp_left = params.clust.margin.left + params.clust.dim.width;
      var tmp_top = params.norm_label.margin.top + params.norm_label.width
        .col;
      return 'translate(' + tmp_left + ',' + tmp_top + ')';
      })
      .attr('class', 'white_bars');

    // white border bottom - prevent clustergram from hitting border
    ///////////////////////////////////////////////////////////////////
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      // make this border twice the width of the grey border
      .attr('height', 2 * params.viz.grey_border_width)
      .attr('transform', function() {
      // shift up enough to show the entire border width
      var inst_offset = params.svg_dim.height - 3 * params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
      });

    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////
    // left border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.svg_dim.height)
      .attr('transform', function() {
      var inst_offset = params.svg_dim.width - params.viz.grey_border_width;
      return 'translate(' + inst_offset + ',0)';
      });

    // top border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
      var inst_offset = 0;
      return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.viz.super_border_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
      var inst_offset = params.svg_dim.height - params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
      });
  }


}