var zoom_constraint_and_trim = require('./zoom_constraint_and_trim');

module.exports = function run_transformation(params, zoom_x, zoom_y, trans_x, trans_y, pan_room_y){
  
  // apply transformation and reset translate vector
  // the zoom vector (zoom.scale) never gets reset
  ///////////////////////////////////////////////////
  // translate clustergram
  d3.select(params.root+' .clust_group')
    .attr('transform', 'translate(' + [trans_x, trans_y] + ') scale(' +
    zoom_x + ',' + zoom_y + ')');

  // transform row labels
  d3.select(params.root+' .row_label_zoom_container')
    .attr('transform', 'translate(' + [0, trans_y] + ') scale(' + zoom_y +
    ')');

  // transform row_cat_container
  // use the offset saved in params, only zoom in the y direction
  d3.select(params.root+' .row_cat_container')
    .attr('transform', 'translate(' + [0, trans_y] + ') scale( 1,' +
    zoom_y + ')');

  d3.select(params.root+' .row_dendro_container')
    .attr('transform', 'translate(' + [params.viz.uni_margin/2, trans_y] + ') '+
      'scale( '+zoom_x+',' + zoom_y + ')');    

  // transform col labels
  // move down col labels as zooming occurs, subtract trans_x - 20 almost works
  d3.select(params.root+' .col_zoom_container')
    .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
    ')');

  // transform col_class
  d3.select(params.root+' .col_cat_container')
    .attr('transform', 'translate('+[trans_x, 0]+') scale(' +zoom_x+ ',1)');

  d3.select(params.root+' .col_dendro_container')
    .attr('transform', 'translate('+[trans_x, params.viz.uni_margin/2]+') scale(' +zoom_x+ ',1)');

  zoom_constraint_and_trim(params, zoom_x, zoom_y, trans_x, trans_y, pan_room_y);

};