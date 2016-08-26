var make_row_cat = require('../dendrogram/make_row_cat');
var calc_viz_params = require('../params/calc_viz_params');
var resize_viz = require('../reset_size/resize_viz');
var modify_row_node_cats = require('./modify_row_node_cats');

module.exports = function update_cats(cgm, cat_data){

  // do not change column category info
  var col_cat_colors = cgm.params.viz.cat_colors.col;

  modify_row_node_cats(cat_data, cgm.params.network_data.row_nodes);
  // modify the current inst copy of nodes
  modify_row_node_cats(cat_data, cgm.params.inst_nodes.row_nodes);

  // recalculate the visualization parameters using the updated network_data
  cgm.params = calc_viz_params(cgm.params, false);

  make_row_cat(cgm.params, true);
  resize_viz(cgm);

  cgm.params.new_cat_data = cat_data;

  cgm.params.viz.cat_colors.col = col_cat_colors;

};