var get_svg_dim = require('../params/get_svg_dim');
var calc_clust_height = require('../params/calc_clust_height');
var calc_clust_width = require('../params/calc_clust_width');
var calc_default_fs = require('../params/calc_default_fs');
var calc_zoom_switching = require('../zoom/calc_zoom_switching');
var underscore = require('underscore');

module.exports = function recalc_params_for_resize(params){


  // Resetting some visualization parameters
  params = get_svg_dim(params);
  params.viz = calc_clust_width(params.viz);
  params.viz = calc_clust_height(params.viz);

  if (params.sim_mat){
    if (params.viz.clust.dim.width <= params.viz.clust.dim.height){
      params.viz.clust.dim.height = params.viz.clust.dim.width;
    } else {
      params.viz.clust.dim.width = params.viz.clust.dim.height;
    }
  }

  params.viz = calc_zoom_switching(params.viz);

  // redefine x_scale and y_scale rangeBands
  params.viz.x_scale.rangeBands([0, params.viz.clust.dim.width]);
  params.viz.y_scale.rangeBands([0, params.viz.clust.dim.height]);

  // redefine border width
  params.viz.border_width.x = params.viz.x_scale.rangeBand() / params.viz.border_fraction;
  params.viz.border_width.y = params.viz.y_scale.rangeBand() / params.viz.border_fraction;

  params.viz.rect_width  = params.viz.x_scale.rangeBand() - params.viz.border_width.x;
  params.viz.rect_height = params.viz.y_scale.rangeBand() - params.viz.border_width.y;

  // for downsampling
  if (params.viz.ds != null){
    for (var i; i < params.viz.ds.length; i++){
      params.viz.ds[i].rect_height = params.viz.ds[i].y_scale.rangeBand() - params.viz.border_width.y;
    }
  }

  // recalc downsampled y_scale if necessary
  if (params.viz.ds_num_levels > 0){
    underscore.each(params.viz.ds, function(inst_ds){

      // y_scale
      /////////////////////////
      inst_ds.y_scale = d3.scale.ordinal()
        .rangeBands([0, params.viz.clust.dim.height]);
      inst_ds.y_scale
        .domain( d3.range(inst_ds.num_rows + 1) );

      inst_ds.rect_height = inst_ds.y_scale.rangeBand() -
        params.viz.border_width.y;

    });
  }

  // redefine zoom extent
  params.viz.square_zoom = params.viz.norm_labels.width.col / (params.viz.rect_width/2);

  // the default font sizes are set here
  params = calc_default_fs(params);

  return params;
};