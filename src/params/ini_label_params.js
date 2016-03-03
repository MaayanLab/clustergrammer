module.exports = function set_label_params(config, params){

  params.labels = {};
  params.labels.super_label_scale = config.super_label_scale;
  params.labels.super_labels = config.super_labels;

  if (params.labels.super_labels) {
    params.labels.super = {};
    params.labels.super.row = config.super.row;
    params.labels.super.col = config.super.col;
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

  params.labels.max_allow_fs = 20;

  return params;
};