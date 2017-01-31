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

  if (params.viz.rect_height < 1){

    // increase ds opacity, as more rows are compressed into a single downsampled
    // row, increase the opacity of the downsampled row. Max increase will be 2x
    // when 100 or more rows are compressed
    params.viz.ds_opacity_scale = d3.scale.linear().domain([1,100]).range([1,3])
      .clamp(true);

    var ds;

    // height of downsampled rectangles
    var inst_height = 3;
    // amount of zooming that is tolerated for the downsampled rows
    var inst_zt = 2;
    params.viz.ds_zt = inst_zt;
    // the number of downsampled matrices that need to be calculated
    var num_layers = Math.round(inst_height / (params.viz.rect_height * inst_zt));

    params.viz.ds_num_layers = num_layers;

    // array of downsampled parameters
    params.viz.ds = [];


    // array of downsampled matrices at varying layers
    params.matrix.ds_matrix = [];

    // calculate parameters for different layers
    for (var i=0; i < num_layers; i++){

      // instantaneous ds_level (-1 means no downsampling)
      params.viz.ds_level = 0;

      ds = {};

      ds.height = inst_height;
      ds.zt = inst_zt;
      ds.num_layers = num_layers

      var scale_num_rows = i + 1;

      // number of downsampled rows
      ds.num_rows = Math.round(params.viz.clust.dim.height/
        ds.height) * scale_num_rows;

      // x_scale
      /////////////////////////
      ds.x_scale = d3.scale.ordinal()
        .rangeBands([0, params.viz.clust.dim.width]);

      inst_order = params.viz.inst_order.row;

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

      params.viz.ds.push(ds);

      var matrix = calc_downsampled_matrix(params, i);
      params.matrix.ds_matrix.push(matrix);

    }

    // reset row viz_nodes since downsampling
    params.viz.viz_nodes.row = d3.range(params.matrix.ds_matrix[0].length).map(String);


  } else {
    // set ds to null if no downsampling is done
    params.viz.ds = null;
    // instantaneous ds_level (-1 means no downsampling)
    params.viz.ds_level = -1;
  }


  return params;

};