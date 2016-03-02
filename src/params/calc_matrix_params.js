module.exports = function calc_matrix_params(config, params){

  params.matrix.x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);

  params.matrix.y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);

  params.matrix.x_scale
    .domain( params.matrix.orders[ params.viz.inst_order.row + '_row' ] );

  params.matrix.y_scale
    .domain( params.matrix.orders[ params.viz.inst_order.col + '_col' ] );

  // // set x and y position for filtering
  // params.network_data.links.forEach(function (d) {
  //   d.x = params.matrix.x_scale(d.target);
  //   d.y = params.matrix.y_scale(d.source);
  // });

  params.viz.border_width = params.matrix.x_scale.rangeBand() / params.viz.border_fraction;

  return params;
  
}; 