module.exports = function is_force_square(params){

  var col_info_space = params.labels.super_label_width + 
    params.norm_label.width.col + params.class_room.col + params.colorbar_room.col;
  
  var row_info_space = params.labels.super_label_width + 
    params.norm_label.width.row + params.class_room.row + params.colorbar_room.row;    

  // there is space between the clustergram and the border
  var ini_clust_height = params.viz.svg_dim.height - col_info_space 
    - params.viz.bottom_space;

  var ini_clust_width = params.viz.svg_dim.width - row_info_space 
    - params.viz.grey_border_width - params.viz.spillover_x_offset;

  var width_by_col  = params.viz.clust.dim.width / params.viz.num_col_nodes;
  var height_by_row = ini_clust_height / params.viz.num_row_nodes;

  if ( width_by_col < height_by_row ) {

    params.viz.clust.dim.height = ini_clust_width * 
      (params.viz.num_row_nodes / params.viz.num_col_nodes );

    params.viz.force_square = 1;

    if (params.viz.clust.dim.height > ini_clust_height) {
      params.viz.clust.dim.height = ini_clust_height;
      params.viz.force_square = 0;
    }
  }
  else {
    params.viz.clust.dim.height = ini_clust_height;
    params.viz.force_square = 0;
  }

  return params;
};