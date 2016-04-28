module.exports = function ini_modals(params){

  var modal = d3.select(params.root)
    .append('div')
    .classed('modal', true)
    .classed('fade', true)
    .classed('share_info', true)
    .attr('role','dialog');

  var modal_dialog = modal
    .append('div')
    .classed('modal-dialog', true);

  var modal_content = modal_dialog
    .append('div')
    .classed('modal-content', true);

  var modal_header = modal_content
    .append('div')
    .classed('modal-header', true);

  modal_header
    .append('button')
    .attr('type','button')
    .classed('close', true)
    .attr('data-dismiss','modal')
    .html('&times;')
    .append('a')
    .attr('target','_blank')
    .attr('href', '/clustergrammer/');

  modal_header
    .append('div')
    .append('img')
    .classed('clustergrammer_logo', true)
    .attr('src', 'img/clustergrammer_logo.png')
    .attr('alt', 'Clustergrammer');

  modal_header
    .append('h4')
    .classed('modal-title', true)
    .html('Share the visualization using the current URL:')

  var modal_body = modal_content
    .append('div')
    .classed('modal-body', true);

  modal_body
    .append('input')
    .classed('bootstrap_highlight', true)
    .classed('share_url', true);

};