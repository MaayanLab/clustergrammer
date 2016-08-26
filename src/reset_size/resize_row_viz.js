module.exports = function resize_row_viz(params, ini_svg_group, delay_info=false){

  var delays = {};
  var duration = params.viz.duration;
  var svg_group;

  if (delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }

  if (delays.run_transition){
    svg_group = ini_svg_group
      .transition().delay(delays.update).duration(duration);

  } else {
    svg_group = ini_svg_group;
  }

  svg_group.select('.row_cat_outer_container')
    .attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)')
    .select('white_bars')
    .attr('width', params.viz.cat_room.row + 'px')
    .attr('height', function() {
      var inst_height = params.viz.clust.dim.height;
      return inst_height;
    });

  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width ;
  var y_offset = params.viz.clust.margin.top;
  svg_group.select('.row_dendro_outer_container')
    .attr('transform','translate('+ x_offset + ','+y_offset+')');

  // !! tmp resize col dendro
  x_offset = params.viz.clust.margin.left;
  y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;

  svg_group
    .select(' .col_dendro_outer_container')
    .attr('transform', function() {
        return 'translate('+x_offset+',' + y_offset + ')';
      });      

};