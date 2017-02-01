var make_row_labels = require('./make_row_labels');

module.exports = function make_row_label_container(cgm, text_delay) {

  var params = cgm.params;

  var row_container;

  // row container holds all row text and row visualizations (triangles rects)
  ////////////////////////////////////////////////////////////////////////////
  if ( d3.select(params.viz.viz_svg + ' .row_container').empty() ){
    row_container = d3.select(params.viz.viz_svg)
      .append('g')
      .classed('row_container', true)
      .attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' +
      params.viz.clust.margin.top + ')');
  } else {
    row_container = d3.select(params.viz.viz_svg)
      .select('.row_container')
      .attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' +
      params.viz.clust.margin.top + ')');
  }

  if (d3.select(params.root+' .row_white_background').empty()){
    row_container
      .append('rect')
      .classed('row_white_background',true)
      .classed('white_bars',true)
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.label_background.row)
      .attr('height', 30*params.viz.clust.dim.height + 'px');
  }

  // add container to hold text row labels if not already there
  if ( d3.select(params.root +' .row_label_container').empty() ){
    row_container
      .append('g')
      .classed('row_label_container', true)
      .attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)')
      .append('g')
      .classed('row_label_zoom_container', true);
  } else {
    row_container
      .select(params.root+' .row_label_container')
      .attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)');
  }

  // make row labels in the container
  ///////////////////////////////////////
  if (params.viz.ds_level === -1){
    make_row_labels(cgm, 'all', text_delay);
  }

};
