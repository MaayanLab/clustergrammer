var apply_transformation = require('./apply_transformation');

module.exports = function(params) {
  var zoom_x = d3.event.scale,
    zoom_y = d3.event.scale,
    trans_x = d3.event.translate[0] - params.viz.clust.margin.left,
    trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

  apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y);
};
