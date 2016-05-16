module.exports = function calc_clust_height(viz){

  // the clustergram/matrix height is the svg width minus: 
  // the margin of the clustergram on the top 
  // the dendrogram 
  // the bottom_space 
  var ini_clust_height = viz.svg_dim.height 
    - viz.clust.margin.top
    - viz.dendro_room.col
    - viz.bottom_space;

  viz.clust.dim.height = ini_clust_height;

  return viz;
};