var constrain_font_size = require('./constrain_font_size');
var still_zooming = require('./still_zooming');
var utils = require('../utils');

module.exports = function zoom_constraint_and_trim(params, zoom_info){

  // no need to shift down col dendrogram if clustergram takes up full screen 
  ///////////////////////

  // // the amount by which the clustergram has shifted down, the col dendrogram will 
  // // need to be shifted down 
  // var max_y = params.viz.svg_dim.height - params.viz.dendro_room.col - params.viz.uni_margin;

  // var shift_down = zoom_info.pan_room_y + zoom_info.trans_y;
  // var x_offset = params.viz.clust.margin.left;
  // var y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height + shift_down;
  // if (y_offset > max_y){
  //   y_offset = max_y;
  // }

  // d3.select(params.root+' .col_dendro_outer_container')
  //   .attr('transform', 'translate('+[x_offset, y_offset]+')');

  // d3.select(params.root+' .dendro_col_spillover')
  //   .attr('transform', 'translate('+[0, y_offset]+')');

  // var corner_x = params.viz.clust.margin.left + params.viz.clust.dim.width;
  // d3.select(params.root+' .dendro_corner_spillover')
  //   .attr('transform', 'translate('+[corner_x, y_offset]+')');


  // reset translate vector - add back margins to trans_x and trans_y
  params.zoom_behavior
    .translate([zoom_info.trans_x + params.viz.clust.margin.left, zoom_info.trans_y + params.viz.clust.margin.top
    ]);
  
  constrain_font_size(params);

  // run text trim with delay 
  var prev_zoom = params.zoom_behavior.scale();
  setTimeout(still_zooming, 500, params, prev_zoom);

  // resize label bars if necessary
  if (utils.has(params.network_data.row_nodes[0], 'value')) {
    d3.selectAll(params.root+' .row_bars')
    .attr('width', function(d) {
      var inst_value = 0;
      inst_value = params.labels.bar_scale_row(Math.abs(d.value))/zoom_info.zoom_y;
      return inst_value;
    })
    .attr('x', function(d) {
      var inst_value = 0;
      inst_value = -params.labels.bar_scale_row(Math.abs(d.value))/zoom_info.zoom_y;
      return inst_value;
    });
  }

  if (utils.has(params.network_data.col_nodes[0], 'value')) {
    d3.selectAll(params.root+' .col_bars')
      .attr('width', function(d) {
        var inst_value = 0;
        if (d.value > 0){
          inst_value = params.labels.bar_scale_col(d.value)/zoom_info.zoom_x;
        }
        return inst_value;
      });
    }
};