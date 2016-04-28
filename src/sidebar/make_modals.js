var make_modal_skeleton = require('../modal/make_modal_skeleton');

module.exports = function ini_modals(params){

  var share_modal = make_modal_skeleton(params, 'share_info');

  share_modal.header
    .append('a')
    .attr('target','_blank')
    .attr('href', '/clustergrammer/');

  share_modal.header
    .append('div')
    .append('img')
    .classed('clustergrammer_logo', true)
    .attr('src', 'img/clustergrammer_logo.png')
    .attr('alt', 'Clustergrammer');

  share_modal.header
    .append('h4')
    .classed('modal-title', true)
    .html('Share the visualization using the current URL:');

  share_modal.body
    .append('input')
    .classed('bootstrap_highlight', true)
    .classed('share_url', true);


  var screenshot_modal = make_modal_skeleton(params, 'picture_info');

  screenshot_modal.header
    .append('h4')
    .classed('modal-title', true)
    .html('Save a snapshot of the visualization');

  screenshot_modal.body
    .append('div')
    .classed('download_buttons', true);

};