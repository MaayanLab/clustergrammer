module.exports = function set_up_search(sidebar){

  var search_container = sidebar
    .append('div')
    .classed('row',true)
    .classed('gene_search_container',true)
    .style('margin-top','10px')
    .style('margin-left','0px');

  search_container
    .append('input')
    .classed('form-control',true)
    .classed('gene_search_box',true)
    .attr('type','text')
    .attr('placeholder','Input Gene')
    .style('width','100px')
    .style('float','left');

  search_container
    .append('div')
    .classed('btn-group',true)
    .classed('gene_search_button',true)
    .attr('data-toggle','buttons')
    .append('div')
    .append('button')
    .html('Search')
    .attr('type','button')
    .classed('btn',true)
    .classed('btn-primary',true)
    .classed('submit_gene_button',true)
    .style('margin-left','4px')
    .style('float','left');
    
};