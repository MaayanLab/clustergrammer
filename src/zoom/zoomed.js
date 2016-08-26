var apply_zoom = require('./apply_zoom');

module.exports = function zoomed(params) {

  var zoom_info = {};
  zoom_info.zoom_x = d3.event.scale;
  zoom_info.zoom_y = d3.event.scale;
  zoom_info.trans_x = d3.event.translate[0] - params.viz.clust.margin.left;
  zoom_info.trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

  apply_zoom(params, zoom_info);

};
