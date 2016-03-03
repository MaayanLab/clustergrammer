module.exports = function calc_clust_width(viz){

  viz.clust = {};
  viz.clust.margin = {};

  // margin on left/top of the clustergram/matrix 
  // 1) norm_label margin and width
  // 2) cat_room and uni_margin 
  viz.clust.margin.left = viz.norm_labels.margin.left + 
    viz.norm_labels.width.row + viz.cat_room.row + viz.uni_margin;

  viz.clust.margin.top = viz.norm_labels.margin.top + 
    viz.norm_labels.width.col + viz.cat_room.col + viz.uni_margin;

  // the clustergram/matrix width is the svg width minus:
  // the margin of the clustergram on the left 
  // the room for the spillover on the right 
  // ** the dendro will fit in the spillover room on the right 
  var ini_clust_width = viz.svg_dim.width
    - viz.clust.margin.left 
    - viz.spillover_col_slant;

  // make tmp scale to calc height of triangle col labels 
  var tmp_x_scale = d3.scale
    .ordinal()
    .rangeBands([0, ini_clust_width])
    .domain(_.range( viz.num_col_nodes ));

  var triangle_height = tmp_x_scale.rangeBand()/2;

  // prevent the visualization from being unnecessarily wide 
  if (triangle_height > viz.norm_labels.width.col) {
    var reduce_width = viz.norm_labels.width.col / triangle_height;
    ini_clust_width = ini_clust_width * reduce_width;
  }

  viz.clust.dim = {};
  viz.clust.dim.width = ini_clust_width;

  return viz;
};