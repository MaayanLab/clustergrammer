var make_dendro_triangles = require('./make_dendro_triangles');

module.exports = function make_col_dendro(cgm) {

  var params = cgm.params;

  // position col_dendro_outer_container
  var x_offset = params.viz.clust.margin.left;
  var y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;
  var spillover_height = params.viz.dendro_room.col + params.viz.uni_margin;

  // make or reuse outer container
  if (d3.select(params.root+' .col_dendro_outer_container').empty()){

    d3.select(params.root+' .viz_svg')
      .append('g')
      .attr('class', 'col_dendro_outer_container')
      .attr('transform', 'translate('+x_offset+','+y_offset+')');

    d3.select(params.root+' .col_dendro_outer_container')
      .append('rect')
      .classed('col_dendro_spillover',true)
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', spillover_height+'px');

    d3.select(params.root+' .col_dendro_outer_container')
      .append('g')
      .attr('class', 'col_dendro_container')
      .attr('transform', 'translate(0,'+params.viz.uni_margin/2+')');

    d3.select(params.root+' .col_dendro_outer_container')
      .append('rect')
      .classed('col_dendro_spillover_top',true)
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', 'translate(0,'+params.viz.dendro_room.col+')');

  } else {

    d3.select(params.root+' .viz_svg')
      .select('col_dendro_outer_container')
      .attr('transform', 'translate('+x_offset+','+y_offset+')');

    d3.select(params.root+' .col_dendro_outer_container')
      .select('.col_dendro_spillover')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', spillover_height+'px');

  }

  make_dendro_triangles(cgm, 'col', false);

  if (params.viz.inst_order.row != 'clust'){
    d3.selectAll(params.root+' .col_dendro_group').remove();
  }

};
