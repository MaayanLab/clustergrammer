module.exports = function calc_default_fs(params){

  params.labels.default_fs_row = params.matrix.y_scale.rangeBand() * 1.01;
  params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.87;

  if ( params.labels.default_fs_row > 30){
    params.labels.default_fs_row = 30;
  }

  if ( params.labels.default_fs_col > 30){
    params.labels.default_fs_col = 30;
  }

  return params; 
};