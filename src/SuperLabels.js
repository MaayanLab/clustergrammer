function SuperLabels(params) {

  // super col title
  /////////////////////////////////////
  // add super column title background
  d3.select(params.viz.viz_svg)
    .append('rect')
    .attr('fill', params.viz.background_color)
    .attr('height', params.labels.super_label_width + 'px')
    .attr('width', '3000px')
    .attr('id', 'super_col_bkg')
    .attr('class', 'white_bars')
    .attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

  // super col title
  d3.select(params.viz.viz_svg)
    .append('text')
    .attr('id', 'super_col')
    .text(params.labels.super.col)
    .attr('text-anchor', 'center')
    .attr('transform', function () {

      var inst_text_width = d3.select(this)[0][0]
        .getBBox().width;

      var inst_x = params.viz.clust.dim.width / 2 + params.norm_label.width
          .row - inst_text_width / 2;
      var inst_y = params.labels.super_label_width - params.viz.uni_margin;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    })
    .style('font-size', function (d) {
      var inst_font_size = 14 * params.labels.super_label_scale;
      return inst_font_size + 'px';
    })
    .style('font-weight', 300);

  // super row title
  /////////////////////////////////////
  d3.select(params.viz.viz_svg)
    .append('rect')
    .attr('fill', params.viz.background_color)
    .attr('width', params.labels.super_label_width + 'px')
    .attr('height', '3000px')
    .attr('id', 'super_row_bkg')
    .attr('class', 'white_bars')
    .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

  // append super title row group
  // this is used to separate translation from rotation
  d3.select(params.viz.viz_svg)
    .append('g')
    .attr('id', 'super_row')
    .attr('transform', function () {
      // position in the middle of the clustergram
      var inst_x = params.labels.super_label_width - params.viz.uni_margin;
      var inst_y = params.viz.clust.dim.height / 2 + params.norm_label.width
          .col;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    });

  // super row label (rotate the already translated title )
  d3.select('#super_row')
    .append('text')
    .text(params.labels.super.row)
    .attr('text-anchor', 'center')
    .attr('transform', function (d) {
      var inst_text_width = d3.select(this)[0][0].getBBox().width;
      var inst_x_offset = inst_text_width / 2 + params.norm_label.width.col;
      var inst_offset = 'translate(0,' + inst_x_offset + '), rotate(-90)'
      return inst_offset;
    })
    .style('font-size', function (d) {
      var inst_font_size = 14 * params.labels.super_label_scale;
      return inst_font_size + 'px';
    })
    .style('font-weight', 300);
}
