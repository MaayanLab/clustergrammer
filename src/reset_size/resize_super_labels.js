 module.exports = function resize_super_labels(params, ini_svg_group, delay_info=false){

  var delays = {};
  var duration = params.viz.duration;
  var svg_group;

  if(delay_info === false){
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

  svg_group.select('.super_col_bkg')
    .attr('height', params.viz.super_labels.dim.width + 'px')
    .attr('transform', 'translate('+params.viz.clust.margin.left+',' + params.viz.grey_border_width + ')');

  // super col title
  svg_group.select('.super_col')
    .attr('transform', function() {
      var inst_x = params.viz.clust.dim.width / 2 + params.viz.norm_labels.width
        .row;
      var inst_y = params.viz.super_labels.dim.width ;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    });

  svg_group.select('.super_row_bkg')
    .attr('width', params.viz.super_labels.dim.width + 'px')
    .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

  svg_group.select('.super_row')
    .attr('transform', function() {
      var inst_x = params.viz.super_labels.dim.width;
      var inst_y = params.viz.clust.dim.height / 2 + params.viz.norm_labels.width
        .col;
      return 'translate(' + inst_x + ',' + inst_y + ')';
    });

};