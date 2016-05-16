module.exports = function set_label_params(config, network_data){

  var labels = {};
  labels.super_label_scale = config.super_label_scale;
  labels.super_labels = config.super_labels;
  labels.super_label_fs = 13.8;

  if (labels.super_labels) {
    labels.super = {};
    labels.super.row = config.super.row;
    labels.super.col = config.super.col;
  }

  labels.show_label_tooltips = config.show_label_tooltips;

  labels.row_max_char = _.max(network_data.row_nodes, 
    function (inst) {
      return inst.name.length;
    }).name.length;

  labels.col_max_char = _.max(network_data.col_nodes, 
    function (inst) {
      return inst.name.length;
    }).name.length;

  labels.max_allow_fs = config.max_allow_fs;

  return labels;
};