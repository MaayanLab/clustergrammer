module.exports = function make_modal_skeleton(params, modal_class){

  var modal_skeleton = {};

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

  modal_skeleton.header
    .append('button')
    .attr('type','button')
    .classed('close', true)
    .attr('data-dismiss','modal')
    .html('&times;');  

  modal_skeleton.body = modal_content
    .append('div')
    .classed('modal-body', true);

  return modal_skeleton;

};