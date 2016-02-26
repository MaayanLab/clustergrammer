module.exports = function resize_label_bars(params, svg_group){

  // set bar scale
  var enr_max = Math.abs(_.max( params.network_data.row_nodes, function(d) { return Math.abs(d.value); } ).value) ;

  params.labels.bar_scale_row = d3.scale
    .linear()
    .domain([0, enr_max])
    .range([0, params.norm_label.width.row ]);

  svg_group.selectAll('.row_bars')
    // .transition().delay(delays.update).duration(duration)
    .attr('width', function(d) {
      var inst_value = 0;
      inst_value = params.labels.bar_scale_row( Math.abs(d.value) );
      return inst_value;
    })
    .attr('x', function(d) {
      var inst_value = 0;
      inst_value = -params.labels.bar_scale_row( Math.abs(d.value) );
      return inst_value;
    })
    .attr('height', params.matrix.y_scale.rangeBand() );

};