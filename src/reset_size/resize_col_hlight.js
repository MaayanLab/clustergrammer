var utils = require('../Utils_clust');

module.exports = function resize_col_hlight(params, svg_group, delay_info=false){

  var delays = {};
  // var duration = params.viz.duration;

  if(delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }  

  if (utils.has( params.network_data.col_nodes[0], 'value')) {

    svg_group
      .selectAll('.col_bars')
      .data(params.network_data.col_nodes, function(d){return d.name;})
      .attr('width', function(d) {

        var inst_value = 0;

        if (d.value > 0){
          inst_value = params.labels.bar_scale_col(d.value);
        }
        return inst_value;
      })
      // rotate labels - reduce width if rotating
      .attr('height', params.viz.rect_width * 0.66);

  }

};