module.exports = function calc_label_params(params){

  params.viz.norm_labels.margin = {};

  params.viz.norm_labels.margin.left = params.viz.super_labels.margin.left
    + params.viz.super_labels.dim.width;
    
  params.viz.norm_labels.margin.top  = params.viz.super_labels.margin.top 
    + params.viz.super_labels.dim.width;

  params.viz.norm_labels.container = {};

  params.viz.norm_labels.container.row = params.viz.norm_labels.width.row + 
    params.viz.cat_room.row + params.viz.dendro_room.row + params.viz.uni_margin;

  params.viz.norm_labels.container.col = params.viz.norm_labels.width.col + 
    params.viz.cat_room.col + params.viz.uni_margin;

  params.viz.clust = {};
  params.viz.clust.margin = {};

  params.viz.clust.margin.left = params.viz.norm_labels.margin.left + 
    params.viz.norm_labels.container.row;

  params.viz.clust.margin.top = params.viz.norm_labels.margin.top + 
    params.viz.norm_labels.container.col;

  return params;
};