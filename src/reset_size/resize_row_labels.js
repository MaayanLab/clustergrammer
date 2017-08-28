var underscore = require('underscore');

module.exports = function resize_row_labels(params, ini_svg_group, delay_info=false){

  var delays = {};
  var duration = params.viz.duration;
  var svg_group;

  var row_nodes = params.network_data.row_nodes;
  var row_nodes_names = params.network_data.row_nodes_names;

  if(delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }

  if (delays.run_transition){

    ini_svg_group.selectAll('.row_label_group')
      // data bind necessary for loss/gain of rows
      .data(row_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
      })
      .attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group = ini_svg_group
      .transition().delay(delays.update).duration(duration);

  } else {

    ini_svg_group.selectAll('.row_label_group')
      // data bind necessary for loss/gain of rows
      .data(row_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
      })
      .attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group = ini_svg_group;
  }

  svg_group.select(params.root+' .row_container')
    .attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' +
    params.viz.clust.margin.top + ')');

  svg_group.select(params.root+' .row_container')
    .select('.white_bars')
    .attr('width', params.viz.label_background.row)
    .attr('height', 30*params.viz.clust.dim.height + 'px');

  svg_group.select(params.root + ' .row_container')
    .select('.row_label_container')
    .attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)');

};

