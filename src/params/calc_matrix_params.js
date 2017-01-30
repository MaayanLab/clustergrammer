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

  //////////////////////
  // Downsampling
  //////////////////////
  console.log('make downsampled matrix')
  // make downsampled scales
  params.viz.ds_x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);

  params.viz.ds_y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);

  // amount of zooming that is tolerated for the downsampled rows
  params.viz.ds_zt = 2;
  // height of downsampled rectangles
  params.viz.ds_height = 3;
  // number of downsampled rows
  params.viz.num_ds_rows = Math.round(params.viz.clust.dim.height/
    params.viz.ds_height);

  // the number of downsampled matrices that need to be calculated
  // debugger
  params.viz.num_ds_layers = Math.round(params.viz.ds_height / (params.viz.rect_height *
    params.viz.ds_zt));

  // use the same x domain
  inst_order = inst_order = params.viz.inst_order.row;
  params.viz.ds_x_scale
    .domain( params.matrix.orders[inst_order + '_row' ] );

  // this will be used to position the downsampled rows
  params.viz.ds_y_scale
    .domain( d3.range(params.viz.num_ds_rows + 1) );

  params.viz.ds_rect_height = params.viz.ds_y_scale.rangeBand() -
  params.viz.border_width.y;

  // make downsampled matrix (row downsampling)
  params.matrix.ds_matrix = calc_downsampled_matrix(params);

  return params;

};