module.exports = function calc_clust_width(params){

  params.viz.clust.dim = {};

  params.viz.row_info_space = params.labels.super_label_width + 
    params.norm_label.width.row + params.viz.cat_room.row + 
    params.viz.dendro_room.row;  

  var ini_clust_width = params.viz.svg_dim.width - params.viz.row_info_space 
    - params.viz.grey_border_width - params.viz.spillover_x_offset;

  // var alt_clust_width = params.viz.svg_dim.width - params.viz.clust.margin.left
  //   - params.viz.grey_border_width - params.viz.spillover_x_offset;


  // console.log(ini_clust_width)
  // console.log(alt_clust_width)

  var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]);
  tmp_x_scale.domain(_.range( params.viz.num_col_nodes ));
  var triangle_height = tmp_x_scale.rangeBand() / 2;

  if (triangle_height > params.norm_label.width.col) {

    var reduce_width = params.norm_label.width.col / triangle_height;
    ini_clust_width = ini_clust_width * reduce_width;

  }
  params.viz.clust.dim.width = ini_clust_width;

  return params;
};