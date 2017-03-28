module.exports = function set_up_search(sidebar, params ){

  var search_container = sidebar
    .append('div')
    // .classed('row',true)
    .classed('gene_search_container',true)
    .style('padding-left','10px')
    .style('padding-right','10px')
    .style('margin-top','10px');

  search_container
    .append('input')
    .classed('form-control',true)
    .classed('gene_search_box',true)
    .classed('sidebar_text', true)
    .attr('type','text')
    .attr('placeholder', params.sidebar.row_search.placeholder)
    .style('height', params.sidebar.row_search.box.height+'px')
    .style('margin-top', '10px');

  search_container
    .append('div')
    .classed('gene_search_button',true)
    .style('margin-top', '5px')
    .attr('data-toggle','buttons')
    .append('button')
    .classed('sidebar_text', true)
    .html('Search')
    .attr('type','button')
    .classed('btn',true)
    .classed('btn-primary',true)
    .classed('submit_gene_button',true)
    .style('width', '100%')
    .style('font-size', '14px');

};
