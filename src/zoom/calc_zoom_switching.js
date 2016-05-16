module.exports = function calc_zoom_switching(viz){
  
  var width_by_col = viz.clust.dim.width / viz.num_col_nodes;
  var height_by_row = viz.clust.dim.height / viz.num_row_nodes;
  viz.zoom_switch = width_by_col / height_by_row;

  viz.zoom_switch_y = 1;

  if (viz.zoom_switch < 1) {
    viz.zoom_switch_y = 1/viz.zoom_switch;
    viz.zoom_switch = 1;
  }

  return viz;
};