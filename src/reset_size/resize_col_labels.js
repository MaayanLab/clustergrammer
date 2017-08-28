var underscore = require('underscore');

module.exports = function(params, ini_svg_group, delay_info=false){

  var delays = {};
  var duration = params.viz.duration;
  var svg_group;

  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = params.network_data.col_nodes_names;


  if(delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }

  if (delays.run_transition){
    svg_group = ini_svg_group
      .transition().delay(delays.update).duration(duration);

    ini_svg_group
      .selectAll('.col_label_text')
      .data(col_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ', 0) rotate(-90)';
      });

  } else {
    svg_group = ini_svg_group;

    ini_svg_group
      .selectAll('.col_label_text')
      .data(col_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ', 0) rotate(-90)';
      });

  }

  // offset click group column label
  var x_offset_click = params.viz.x_scale.rangeBand() / 2 + params.viz.border_width.x;

  svg_group
    .select(params.root+' .col_container')
    .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
    params.viz.norm_labels.margin.top + ')');

  svg_group
    .select(params.root+' .col_container')
    .select('.white_bars')
    .attr('width', 30 * params.viz.clust.dim.width + 'px')
    .attr('height', params.viz.label_background.col);

  svg_group
    .select(params.root+' .col_container')
    .select('.col_label_outer_container')
    .attr('transform', 'translate(0,' + params.viz.norm_labels.width.col + ')');


  svg_group
    .selectAll('.col_label_group')
    .attr('transform', 'translate(' + params.viz.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

  svg_group
    .selectAll('.col_label_group')
    .select('text')
    .attr('y', params.viz.x_scale.rangeBand() * 0.60)
    .attr('dx', 2 * params.viz.border_width.x);


};