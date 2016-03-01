module.exports = function set_label_params(config, params){

  var col_nodes = params.network_data.col_nodes;
  var row_nodes = params.network_data.row_nodes;

  params.labels = {};
  params.labels.super_label_scale = config.super_label_scale;
  params.labels.super_labels = config.super_labels;

  if (params.labels.super_labels) {
    params.labels.super_label_width = 20 * params.labels.super_label_scale;
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

  var row_max_char = _.max(row_nodes, function (inst) {
    return inst.name.length;
  }).name.length;
  var col_max_char = _.max(col_nodes, function (inst) {
    return inst.name.length;
  }).name.length;


  params.labels.row_max_char = row_max_char;
  params.labels.col_max_char = col_max_char;

  // increae teh number of max_label_char to initiate label trimming 
  // params.labels.max_label_char = 10;
  params.labels.max_label_char = 15;

  var min_num_char = 5;
  var max_num_char = params.labels.max_label_char;

  params.labels.show_char = 10;

  // // calc how much of the label to keep
  // var keep_label_scale = d3.scale.linear()
  //   .domain([params.labels.show_char, max_num_char])
  //   .range([1, params.labels.show_char / max_num_char]).clamp('true');

  params.labels.row_keep = 1 ; // keep_label_scale(row_max_char);
  params.labels.col_keep = 1 ;// keep_label_scale(col_max_char);


  // define label scale
  var min_label_width = 65;
  var max_label_width = 115;
  var label_scale = d3.scale.linear()
    .domain([min_num_char, max_num_char])
    .range([min_label_width, max_label_width]).clamp('true');

  params.norm_label = {};
  params.norm_label.width = {};

  params.norm_label.width.row = label_scale(row_max_char)
    * params.row_label_scale;

  params.norm_label.width.col = label_scale(col_max_char)
    * params.col_label_scale;

  params.labels.max_allow_fs = 18;

  return params;
};