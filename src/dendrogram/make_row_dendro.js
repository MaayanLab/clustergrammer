var make_dendro_triangles = require('./make_dendro_triangles');

module.exports = function make_row_dendro(cgm){

  var params = cgm.params;

  var spillover_width = params.viz.dendro_room.row + params.viz.uni_margin;

  // position row_dendro_outer_container
  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
  var y_offset = params.viz.clust.margin.top;

  // make or reuse outer container
  if (d3.select(params.root+' .row_dendro_outer_container').empty()){

    d3.select(params.root+' .viz_svg')
      .append('g')
      .attr('class','row_dendro_outer_container')
      .attr('transform', 'translate(' + x_offset + ','+ y_offset +')');

    d3.select(params.root+' .row_dendro_outer_container')
      .append('rect')
      .classed('row_dendro_spillover',true)
      .attr('fill', params.viz.background_color)
      .attr('width', spillover_width + 'px')
      .attr('height', params.viz.svg_dim.height);

    d3.select(params.root+' .row_dendro_outer_container')
      .append('g')
      .attr('class', 'row_dendro_container')
      .attr('transform', 'translate('+params.viz.uni_margin/2+',0)');

  } else {
    d3.select(params.root+' .viz_svg')
      .select('row_dendro_outer_container')
      .attr('transform', 'translate(' + x_offset + ','+y_offset+')');

    d3.select(params.root+' .row_dendro_outer_container')
      .select('.row_dendro_spillover')
      .attr('width', spillover_width + 'px')
      .attr('height', params.viz.svg_dim.height);
  }

  make_dendro_triangles(cgm, 'row', false);

  if (params.viz.inst_order.col != 'clust'){
    d3.selectAll(params.root+' .row_dendro_group').remove();
  }

};
