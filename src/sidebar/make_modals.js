module.exports = function ini_modals(params){

  var modal_skeleton = make_skeleton(params, 'share_info');

  modal_skeleton.header
    .append('button')
    .attr('type','button')
    .classed('close', true)
    .attr('data-dismiss','modal')
    .html('&times;')
    .append('a')
    .attr('target','_blank')
    .attr('href', '/clustergrammer/');

  modal_skeleton.header
    .append('div')
    .append('img')
    .classed('clustergrammer_logo', true)
    .attr('src', 'img/clustergrammer_logo.png')
    .attr('alt', 'Clustergrammer');

  modal_skeleton.header
    .append('h4')
    .classed('modal-title', true)
    .html('Share the visualization using the current URL:');

  modal_skeleton.body
    .append('input')
    .classed('bootstrap_highlight', true)
    .classed('share_url', true);


  function make_skeleton(params, modal_class){
    modal_skeleton = {};

    var modal = d3.select(params.root)
      .append('div')
      .classed('modal', true)
      .classed('fade', true)
      .classed(modal_class, true)
      .attr('role','dialog');

    var modal_dialog = modal
      .append('div')
      .classed('modal-dialog', true);

    var modal_content = modal_dialog
      .append('div')
      .classed('modal-content', true);

    modal_skeleton.header = modal_content
      .append('div')
      .classed('modal-header', true);

    modal_skeleton.body = modal_content
      .append('div')
      .classed('modal-body', true);

    return modal_skeleton;
  }

};