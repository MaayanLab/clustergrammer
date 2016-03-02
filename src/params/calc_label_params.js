module.exports = function calc_label_params(params){

  params.norm_label.margin = {};
  params.norm_label.margin.left = params.viz.grey_border_width + params.labels.super_label_width;
  params.norm_label.margin.top  = params.viz.grey_border_width + params.labels.super_label_width;

  params.norm_label.background = {};

  params.norm_label.background.row = params.norm_label.width.row + 
    params.cat_room.row + params.viz.uni_margin;

  params.norm_label.background.col = params.norm_label.width.col + 
    params.cat_room.col + params.viz.uni_margin;

  return params;
};