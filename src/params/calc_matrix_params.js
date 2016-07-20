var ini_matrix_params = require('./ini_matrix_params');

module.exports = function calc_matrix_params(params){

  params.matrix = ini_matrix_params(params);

  params.viz.x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);

  params.viz.y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);

  _.each(['row','col'], function(inst_rc){

    var inst_order = params.viz.inst_order[inst_rc];

    if (inst_order === 'custom'){
      inst_order = 'clust';
    }

    if (inst_rc === 'row'){
      params.viz.x_scale
        .domain( params.matrix.orders[ inst_order + '_' + inst_rc ] );
    } else{
      params.viz.y_scale
        .domain( params.matrix.orders[ inst_order + '_' + inst_rc ] );
    }

  });


  params.viz.border_width = params.viz.x_scale.rangeBand() / params.viz.border_fraction;

  return params;

};