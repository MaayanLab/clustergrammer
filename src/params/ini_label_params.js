var underscore = require('underscore');

module.exports = function ini_label_params(params){

  var labels = {};
  labels.super_label_scale = params.super_label_scale;
  labels.super_labels = params.super_labels;
  labels.super_label_fs = 13.8;

  if (labels.super_labels) {
    labels.super = {};
    labels.super.row = params.super.row;
    labels.super.col = params.super.col;
  }

  labels.show_label_tooltips = params.show_label_tooltips;

  labels.row_max_char = underscore.max(params.network_data.row_nodes,
    function (inst) {
      return inst.name.length;
    }).name.length;

  labels.col_max_char = underscore.max(params.network_data.col_nodes,
    function (inst) {
      return inst.name.length;
    }).name.length;

  labels.max_allow_fs = params.max_allow_fs;

  return labels;
};