module.exports = function calc_zoom_switching(viz){

  var width_by_col = viz.clust.dim.width / viz.num_col_nodes;
  var height_by_row = viz.clust.dim.height / viz.num_row_nodes;

  viz.zoom_ratio = {};
  viz.zoom_ratio.x = width_by_col / height_by_row;
  viz.zoom_ratio.y = 1;

  if (viz.zoom_ratio.x < 1) {
    viz.zoom_ratio.y = 1/viz.zoom_ratio.x;
    viz.zoom_ratio.x = 1;
  }

  return viz;
};