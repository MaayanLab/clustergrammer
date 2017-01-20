var ini_matrix_params = require('./ini_matrix_params');
var calc_downsampled_matrix = require('../matrix/calc_downsampled_matrix');

module.exports = function calc_matrix_params(params){

  params.matrix = ini_matrix_params(params);

  // X and Y scales: set domains and ranges
  //////////////////////////////////////////////
  params.viz.x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);

  params.viz.y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);

  var inst_order;

  _.each(['row','col'], function(inst_rc){

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

  // Downsampling
  //////////////////////
  // make downsampled scales
  params.viz.ds_x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);

  params.viz.ds_y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);

  var ds_num = 300;

  // use the same x domain
  inst_order = inst_order = params.viz.inst_order.row;
  params.viz.ds_x_scale
    .domain( params.matrix.orders[inst_order + '_row' ] );

  // this will be used to position the downsampled rows
  params.viz.ds_y_scale
    .domain( d3.range(ds_num + 1) );

  // make downsampled matrix (row downsampling)
  params.matrix.ds_matrix = calc_downsampled_matrix(params);

  params.viz.border_width = {};
  params.viz.border_width.x = params.viz.x_scale.rangeBand() / params.viz.border_fraction;
  params.viz.border_width.y = params.viz.y_scale.rangeBand() / params.viz.border_fraction;

  return params;

};