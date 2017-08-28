var calc_val_max = require('../params/calc_val_max');
// var underscore = require('underscore');

module.exports = function resize_label_bars(cgm, svg_group){
  var params = cgm.params;

  // // set bar scale
  // var val_max = Math.abs(underscore.max( params.network_data.row_nodes, function(d) {
  //   return Math.abs(d.value);
  // } ).value) ;

  // params.labels.bar_scale_row = d3.scale
  //   .linear()
  //   .domain([0, val_max])
  //   .range([0, params.viz.norm_labels.width.row ]);

  params = calc_val_max(params);

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
    .attr('height', params.viz.y_scale.rangeBand() );

};