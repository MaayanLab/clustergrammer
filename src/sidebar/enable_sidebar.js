module.exports = function enable_sidebar(params) {

  $(params.root+' .slider').slider('enable');

  // only enable reordering if params.dendro_filter.row === false
  if (params.dendro_filter.row === false){
    d3.selectAll(params.root+' .toggle_row_order .btn')
      .attr('disabled',null);
  }

  if (params.dendro_filter.row === false){
    d3.selectAll(params.root+' .toggle_col_order .btn')
      .attr('disabled',null);
  }

  d3.selectAll(params.root+' .gene_search_button .btn')
    .attr('disabled',null);


  params.viz.run_trans = false;

  // d3.selectAll(params.root+' .category_section')
  //   .on('click', category_key_click)
  //   .select('text')
  //   .style('opacity',1);
};
