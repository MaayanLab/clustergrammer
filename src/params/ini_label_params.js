module.exports = function set_label_params(config, params){

  params.labels = {};
  params.labels.super_label_scale = config.super_label_scale;
  params.labels.super_labels = config.super_labels;

  if (params.labels.super_labels) {
    params.labels.super_label_width = 25 * params.labels.super_label_scale;
    params.labels.super = {};
    params.labels.super.row = config.super.row;
    params.labels.super.col = config.super.col;
  } else {
    params.labels.super_label_width = 0;
  }

  params.labels.show_categories = config.show_categories;
  if (params.labels.show_categories) {
    params.labels.class_colors = config.class_colors;
  }
  params.labels.show_label_tooltips = config.show_label_tooltips;

  params.labels.row_max_char = _.max(params.network_data.row_nodes, 
    function (inst) {
      return inst.name.length;
    }).name.length;

  params.labels.col_max_char = _.max(params.network_data.col_nodes, 
    function (inst) {
      return inst.name.length;
    }).name.length;

  var label_scale = d3.scale.linear()
    // min and max number of characters
    .domain([5, 15])
    // min and max of label width 
    .range([ 85, 120]).clamp('true');

  params.norm_label = {};
  params.norm_label.width = {};

  params.norm_label.width.row = label_scale(params.labels.row_max_char) 
    * params.row_label_scale;

  params.norm_label.width.col = label_scale(params.labels.col_max_char) 
    * params.col_label_scale;

  params.labels.max_allow_fs = 20;

  return params;
};