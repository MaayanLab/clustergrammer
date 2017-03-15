var make_row_cat = require('../dendrogram/make_row_cat');
var calc_viz_params = require('../params/calc_viz_params');
var resize_viz = require('../reset_size/resize_viz');
var modify_row_node_cats = require('./modify_row_node_cats');

module.exports = function update_cats(cgm, cat_data){

  // do not change column category info
  var col_cat_colors = cgm.params.viz.cat_colors.col;

  modify_row_node_cats(cat_data, cgm.params.network_data.row_nodes, true);
  // modify the current inst copy of nodes
  modify_row_node_cats(cat_data, cgm.params.inst_nodes.row_nodes, true);

  // recalculate the visualization parameters using the updated network_data
  // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')
  // console.log('calc_viz_params: start')
  cgm.params = calc_viz_params(cgm.params, false);
  // console.log('calc_viz_params: end')
  // console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^')

  // // set up zoom
  // cgm.params.zoom_behavior = d3.behavior.zoom()
  //   .scaleExtent([1, cgm.params.viz.real_zoom * cgm.params.viz.zoom_switch])
  //   .on('zoom', function(){
  //     zoomed(cgm);
  //   });

  // console.log('make_row_cat')
  make_row_cat(cgm, true);

  // console.log('resize_viz')
  resize_viz(cgm);

  cgm.params.new_cat_data = cat_data;

  cgm.params.viz.cat_colors.col = col_cat_colors;

};