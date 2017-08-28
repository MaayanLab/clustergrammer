var ini_matrix_params = require('./ini_matrix_params');
var calc_downsampled_levels = require('../matrix/calc_downsampled_levels');
var underscore = require('underscore');

module.exports = function calc_matrix_params(params){

  params.matrix = ini_matrix_params(params);

  // X and Y scales: set domains and ranges
  //////////////////////////////////////////////
  params.viz.x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);

  params.viz.y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);

  var inst_order;

  underscore.each(['row','col'], function(inst_rc){

    inst_order = params.viz.inst_order[inst_rc];

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

  // border width
  params.viz.border_width = {};
  params.viz.border_width.x = params.viz.x_scale.rangeBand() /
    params.viz.border_fraction;
  params.viz.border_width.y = params.viz.y_scale.rangeBand() /
    params.viz.border_fraction;

  // rect width needs matrix and zoom parameters
  params.viz.rect_width  = params.viz.x_scale.rangeBand() -
    params.viz.border_width.x;

  // moved calculateion to calc_matrix_params
  params.viz.rect_height = params.viz.y_scale.rangeBand() -
    params.viz.border_width.y;

  calc_downsampled_levels(params);

  return params;

};