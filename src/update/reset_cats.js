var make_row_cat = require('../dendrogram/make_row_cat');
var calc_viz_params = require('../params/calc_viz_params');
var resize_viz = require('../reset_size/resize_viz');
var modify_row_node_cats = require('./modify_row_node_cats');
var make_default_cat_data = require('./make_default_cat_data');

module.exports = function reset_cats(){

  var tmp_cgm = this;

  var cat_data = make_default_cat_data(tmp_cgm);

  // do not change column category info
  var col_cat_colors = tmp_cgm.params.viz.cat_colors.col;

  modify_row_node_cats(cat_data, tmp_cgm.params.network_data.row_nodes);
  // modify the current inst copy of nodes
  modify_row_node_cats(cat_data, tmp_cgm.params.inst_nodes.row_nodes);

  // recalculate the visualization parameters using the updated network_data
  tmp_cgm.params = calc_viz_params(tmp_cgm.params, false);

  // // set up zoom (zoom is modified by room for categories)
  // tmp_cgm.params.zoom_behavior = d3.behavior.zoom()
  //   .scaleExtent([1, tmp_cgm.params.viz.real_zoom * tmp_cgm.params.viz.zoom_switch])
  //   .on('zoom', function(){
  //     zoomed(tmp_cgm);
  //   });

  make_row_cat(tmp_cgm, true);
  resize_viz(tmp_cgm);

  tmp_cgm.params.new_cat_data = cat_data;

  tmp_cgm.params.viz.cat_colors.col = col_cat_colors;

};