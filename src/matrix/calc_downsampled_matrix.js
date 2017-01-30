module.exports = function calc_downsampled_matrix(params){

  var inst_num_rows = params.viz.ds[0].num_rows;

  var mod_val = params.viz.clust.dim.height / inst_num_rows;
  var mat = params.matrix.matrix;

  var ds_mat = [];
  var inst_obj;

  var len_ds_array = inst_num_rows + 1;

  var i;
  var x;

  // initialize array of objects
  for (i=0; i < len_ds_array; i++){

    inst_obj = {};
    inst_obj.row_index = i;
    inst_obj.name = String(i);

    ds_mat.push(inst_obj);
  }

  _.each(mat, function(inst_row){

    var inst_y = params.viz.y_scale(inst_row.row_index);

    var ds_index = Math.round(inst_y/mod_val);

    var inst_row_data = inst_row.row_data;

    // gather names
    if (_.has(ds_mat[ds_index], 'all_names')){
      ds_mat[ds_index].all_names.push(inst_row.name);
    } else {
      ds_mat[ds_index].all_names = [inst_row.name];
    }

    // gather row_data
    if (_.has(ds_mat[ds_index], 'row_data')){

      for (x=0; x < inst_row_data.length; x++){
        ds_mat[ds_index].row_data[x].value = ds_mat[ds_index].row_data[x].value + inst_row_data[x].value;
      }

    } else {

      var new_data = [];
      for (x=0; x < inst_row_data.length; x++){
        new_data[x] = inst_row_data[x];
      }

      ds_mat[ds_index].row_data = new_data;

    }

  });

  // increase ds opacity
  var opacity_factor = 1.25;

  // average the values
  _.each(ds_mat, function(tmp_ds){

    var tmp_row_data = tmp_ds.row_data;
    var num_names = tmp_ds.all_names.length;

    _.each(tmp_row_data, function(tmp_obj){
      tmp_obj.value = (tmp_obj.value / num_names)*opacity_factor;
    });

  });

  // all names were found
  var all_names = [];

  _.each(ds_mat, function(inst_row){
    all_names = all_names.concat(inst_row.all_names);
  });

  return ds_mat;

};