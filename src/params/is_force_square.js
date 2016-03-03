module.exports = function is_force_square(viz){

  var col_info_space = viz.super_labels.dim.width + 
    viz.norm_labels.width.col + viz.cat_room.col + 
    viz.dendro_room.col;
  
  // there is space between the clustergram and the border
  var ini_clust_height = viz.svg_dim.height - col_info_space 
    - viz.bottom_space;

  var width_by_col  = viz.clust.dim.width / viz.num_col_nodes;
  var height_by_row = ini_clust_height / viz.num_row_nodes;

  if ( width_by_col < height_by_row ) {

    viz.clust.dim.height = viz.clust.dim.width * 
      (viz.num_row_nodes / viz.num_col_nodes );

    viz.force_square = 1;

    if (viz.clust.dim.height > ini_clust_height) {
      viz.clust.dim.height = ini_clust_height;
      viz.force_square = 0;
    }
    
  }
  else {
    viz.clust.dim.height = ini_clust_height;
    viz.force_square = 0;
  }

  return viz;
};