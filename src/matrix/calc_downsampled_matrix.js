module.exports = function make_ds_matrix(params){

  var ds_num = 10;

  var mod_val = params.viz.clust.dim.height / ds_num;

  console.log(mod_val)

  var mat = params.matrix.matrix;

  // var ds_mat = mat;

  var ds_mat = [];

  // initialize array of objects
  for (var i=0; i < ds_num+1; i++){
    ds_mat.push({});
  }

  _.each(mat, function(inst_row){
    // console.log(inst_row)

    var inst_y = params.viz.y_scale(inst_row.row_index);

    var ds_index = Math.round(inst_y/mod_val);

    if (_.has(ds_mat[ds_index], 'names')){
      ds_mat[ds_index].names.push(inst_row.name);
    } else {
      ds_mat[ds_index].names = [inst_row.name];
    }

  })

  // tot_values = []

  // for (var i=0; i<mat[0].row_data.length; i++){
  //   tot_values.push(mat[0].row_data[i].value + mat[1].row_data[i].value);
  // }

  console.log(ds_mat)


  // all names were found
  var all_names = [];

  _.each(ds_mat, function(inst_row){
    all_names = all_names.concat(inst_row.names)
  })

  console.log(all_names.length)

  return ds_mat;

};