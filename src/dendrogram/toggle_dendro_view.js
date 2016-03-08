var make_row_dendro_triangles = require('../dendrogram/make_row_dendro_triangles');

module.exports = function toggle_dendro_view(params){

  // console.log('toggle_dendro_view')
  // console.log(params.viz.inst_order.col)

  // row and col are reversed
  if (params.viz.inst_order.col === 'clust'){
    // d3.selectAll(params.root+' .row_dendro_group')
    //   // .transition().duration(2000).delay(500)
    //   .style('opacity',0.35);

    // make_row_dendro_triangles(params);
    setTimeout( make_row_dendro_triangles, 2000, params);
  } else {
    d3.selectAll(params.root+' .row_dendro_group')
      // .transition()
      .style('opacity',0);
  }

};