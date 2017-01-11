module.exports = function enable_sidebar(params) {

  /* only enable dendrogram sliders if there has been no dendro_filtering */

  // only enable reordering if params.dendro_filter.row === false
  if (params.dendro_filter.row === false){

    // orders are switched!
    if (params.viz.inst_order.col === 'clust'){
      d3.select(params.root+' .row_slider_group')
        .style('opacity',1)
        .style('pointer-events','all');
    }

  }

  d3.selectAll(params.root+' .toggle_row_order .btn')
    .attr('disabled',null);

  if (params.dendro_filter.col === false){

    // orders are switched!
    if (params.viz.inst_order.row === 'clust'){
      d3.select(params.root+' .col_slider_group')
        .style('opacity',1)
        .style('pointer-events','all');
    }

  }

  d3.selectAll(params.root+' .toggle_col_order .btn')
    .attr('disabled',null);

  d3.selectAll(params.root+' .gene_search_button .btn')
    .attr('disabled',null);


  params.viz.run_trans = false;

};
