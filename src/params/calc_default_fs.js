module.exports = function calc_default_fs(params){

  params.labels.default_fs_row = params.viz.y_scale.rangeBand() * 1.01;
  params.labels.default_fs_col = params.viz.x_scale.rangeBand() * 0.87;

  if ( params.labels.default_fs_row > params.labels.max_allow_fs){
    params.labels.default_fs_row = params.labels.max_allow_fs;
  }

  if ( params.labels.default_fs_col > params.labels.max_allow_fs){
    params.labels.default_fs_col = params.labels.max_allow_fs;
  }

  return params; 

};