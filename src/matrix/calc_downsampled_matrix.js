var underscore = require('underscore');

module.exports = function calc_downsampled_matrix(params, mat, ds_level){

  var inst_num_rows = params.viz.ds[ds_level].num_rows;

  var num_compressed_rows = params.network_data.row_nodes.length / inst_num_rows;

  // increase ds opacity, as more rows are compressed into a single downsampled
  // row, increase the opacity of the downsampled row.
  var opacity_factor = params.viz.ds_opacity_scale(num_compressed_rows);

  var mod_val = params.viz.clust.dim.height / inst_num_rows;

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
    inst_obj.all_names = [];

    ds_mat.push(inst_obj);
  }

  underscore.each(mat, function(inst_row){

    // row ordering information is contained in y_scale
    var inst_y = params.viz.y_scale(inst_row.row_index);

    var ds_index = Math.round(inst_y/mod_val);

    var inst_row_data = inst_row.row_data;

    // gather names
    ds_mat[ds_index].all_names.push(inst_row.name);

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

  // average the values
  underscore.each(ds_mat, function(tmp_ds){

    var tmp_row_data = tmp_ds.row_data;

    var num_names = tmp_ds.all_names.length;

    underscore.each(tmp_row_data, function(tmp_obj){
      tmp_obj.value = (tmp_obj.value / num_names)*opacity_factor;
    });

  });

  // all names were found
  var all_names = [];

  underscore.each(ds_mat, function(inst_row){
    all_names = all_names.concat(inst_row.all_names);
  });

  return ds_mat;

};