var make_modal_skeleton = require('../modal/make_modal_skeleton');

module.exports = function ini_modals(params){

  // share modal
  ///////////////////////////////////////
  var share_modal = make_modal_skeleton(params, 'share_info');

  share_modal.header
    .append('a')
    .attr('target','_blank')
    .attr('href', '/clustergrammer/');

  share_modal.header
    .append('h4')
    .classed('modal-title', true)
    .html('Share the visualization using the current URL:');

  share_modal.body
    .append('input')
    .classed('bootstrap_highlight', true)
    .classed('share_url', true);

  // picture modal
  ///////////////////////////////////////
  var screenshot_modal = make_modal_skeleton(params, 'picture_info');

  screenshot_modal.header
    .append('h4')
    .classed('modal-title', true)
    .html('Save a snapshot of the visualization');

  screenshot_modal.body
    .append('div')
    .classed('download_buttons', true);

  // dendro modal
  ///////////////////////////////////////
  var dendro_modal = make_modal_skeleton(params, 'dendro_info');

  dendro_modal.header
    .append('h4')
    .classed('modal-title', true)
    .html('Cluster Information');

  dendro_modal.body
    .append('g')
    .classed('cluster_info_container', true);

  dendro_modal.body
    .append('div')
    .classed('dendro_text', true)
    .append('input')
    .classed('bootstrap_highlight', true)
    .classed('current_names', true)
    .style('width', '100%');

};