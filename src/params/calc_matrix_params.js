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
  console.log('setting up downsampling')

  // height of downsampled rectangles

  var ds = {};

  ds.height = 3;
  // amount of zooming that is tolerated for the downsampled rows
  ds.zt = 2;
  // the number of downsampled matrices that need to be calculated
  ds.num_layers = Math.round(ds.height / (params.viz.rect_height * ds.zt));

  // number of downsampled rows
  ds.num_rows = Math.round(params.viz.clust.dim.height/
    ds.height);

  // x_scale
  /////////////////////////
  ds.x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);
  inst_order = inst_order = params.viz.inst_order.row;
  ds.x_scale
    .domain( params.matrix.orders[inst_order + '_row' ] );

  // y_scale
  /////////////////////////
  ds.y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);
  ds.y_scale
    .domain( d3.range(ds.num_rows + 1) );

  ds.rect_height = ds.y_scale.rangeBand() -
    params.viz.border_width.y;

  params.viz.ds = []
  params.viz.ds.push(ds);

  // make downsampled matrix (row downsampling)
  params.matrix.ds_matrix = calc_downsampled_matrix(params);

  return params;

};