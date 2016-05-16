module.exports = function calc_matrix_params(config, params){

  params.viz.x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);

  params.viz.y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);

  params.viz.x_scale
    .domain( params.matrix.orders[ params.viz.inst_order.row + '_row' ] );

  params.viz.y_scale
    .domain( params.matrix.orders[ params.viz.inst_order.col + '_col' ] );

  params.viz.border_width = params.viz.x_scale.rangeBand() / params.viz.border_fraction;

  return params;
  
}; 