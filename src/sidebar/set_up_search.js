module.exports = function set_up_search(sidebar, params ){

  var search_container = sidebar
    .append('div')
    // .classed('row',true)
    .classed('gene_search_container',true)
    .style('margin-top','10px')
    .style('margin-left','0px')
    .style('width','185px');

  search_container
    .append('input')
    .classed('form-control',true)
    .classed('gene_search_box',true)
    .attr('type','text')
    .classed('sidebar_text',true)
    .attr('placeholder', params.sidebar.row_search.placeholder)
    // .style('width', params.sidebar.row_search.box.width+'px')
    .style('width', '70px')
    .style('height', params.sidebar.row_search.box.height+'px')
    .style('float','left');

  search_container
    .append('div')
    .classed('btn-group',true)
    .classed('gene_search_button',true)
    .attr('data-toggle','buttons')
    .append('div')
    .append('button')
    .classed('sidebar_text',true)
    .html('Search')
    .attr('type','button')
    .classed('btn',true)
    .classed('btn-primary',true)
    .classed('submit_gene_button',true)
    .style('margin-left','4px')
    .style('float','left')
    .style('padding-top','6px')
    .style('padding-bottom','6px');
    
};