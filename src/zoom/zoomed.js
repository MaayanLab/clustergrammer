var apply_zoom = require('./apply_zoom');

module.exports = function zoomed(params) {

  d3.selectAll('.tile_tip')
    .style('display','none' );

  var zoom_x = d3.event.scale,
    zoom_y = d3.event.scale,
    trans_x = d3.event.translate[0] - params.viz.clust.margin.left,
    trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

  // if (params.viz.zoom_switch_y <=1){
    apply_zoom(params, trans_x, trans_y, zoom_x, zoom_y);
  // }
};
