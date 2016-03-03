module.exports = function calc_label_params(viz){

  viz.norm_labels.margin = {};

  viz.norm_labels.margin.left = viz.super_labels.margin.left
    + viz.super_labels.dim.width;
    
  viz.norm_labels.margin.top  = viz.super_labels.margin.top 
    + viz.super_labels.dim.width;

  viz.label_background = {};

  viz.label_background.row = viz.norm_labels.width.row + 
    viz.cat_room.row + viz.uni_margin;

  viz.label_background.col = viz.norm_labels.width.col + 
    viz.cat_room.col + viz.uni_margin;

  return viz;
};