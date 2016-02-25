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


  svg_group.select('.row_viz_container')
    .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

  svg_group.select('.row_viz_container')
    .select('white_bars')
    .attr('width', params.class_room.row + 'px')
    .attr('height', function() {
      var inst_height = params.viz.clust.dim.height;
      return inst_height;
    });


};