module.exports = function enable_sidebar(params) {

  /* only enable dendrogram sliders if there has been no dendro_filtering */

  // $(params.root+' .opacity_slider').slider('enable');

  // $(params.root+' .slider_N_row_sum').slider('enable');
  // $(params.root+' .slider_N_row_var').slider('enable');

  // only enable reordering if params.dendro_filter.row === false

  if (params.dendro_filter.row === false){
    // $(params.root+' .slider_row').slider('enable');
    d3.select(params.root+' .slider_row')
      .style('opacity',1)
      .style('pointer-events','all');
  }

  d3.selectAll(params.root+' .toggle_row_order .btn')
    .attr('disabled',null);

  if (params.dendro_filter.col === false){
    // $(params.root+' .slider_col').slider('enable');
    d3.select(params.root+' .slider_col')
      .style('opacity',1)
      .style('pointer-events','all');
  }

  d3.selectAll(params.root+' .toggle_col_order .btn')
    .attr('disabled',null);

  d3.selectAll(params.root+' .gene_search_button .btn')
    .attr('disabled',null);


  params.viz.run_trans = false;

  // d3.selectAll(params.root+' .category_section')
  //   .on('click', category_key_click)
  //   .select('text')
  //   .style('opacity',1);
};
