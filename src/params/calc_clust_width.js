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

  viz.clust.dim = {};

  viz.row_info_space = viz.super_labels.dim.width + 
    viz.norm_labels.width.row + viz.cat_room.row + 
    viz.dendro_room.row;  

  var ini_clust_width = viz.svg_dim.width - viz.row_info_space 
    - viz.grey_border_width - viz.spillover_x_offset;

  // var alt_clust_width = viz.svg_dim.width - viz.clust.margin.left
  //   - viz.grey_border_width - viz.spillover_x_offset;


  // console.log(ini_clust_width)
  // console.log(alt_clust_width)

  var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]);
  tmp_x_scale.domain(_.range( viz.num_col_nodes ));
  var triangle_height = tmp_x_scale.rangeBand() / 2;

  if (triangle_height > viz.norm_labels.width.col) {

    var reduce_width = viz.norm_labels.width.col / triangle_height;
    ini_clust_width = ini_clust_width * reduce_width;

  }
  viz.clust.dim.width = ini_clust_width;

  return viz;
};