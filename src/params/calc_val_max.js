var underscore = require('underscore');

module.exports = function calc_val_max(params){

  var val_max = Math.abs(underscore.max(params.network_data.col_nodes, function (d) {
    return Math.abs(d.value);
  }).value);

  params.labels.bar_scale_col = d3.scale
    .linear()
    .domain([0, val_max])
    .range([0, 0.75 * params.viz.norm_labels.width.col]);

  val_max = Math.abs(underscore.max(params.network_data.row_nodes, function (d) {
    return Math.abs(d.value);
  }).value);

  params.labels.bar_scale_row = d3.scale
    .linear()
    .domain([0, val_max])
    .range([0, params.viz.norm_labels.width.row]);

  return params;
};