module.exports = function check_sim_mat(config){

  var sim_mat = false;

  var num_rows = config.network_data.row_nodes_names.length;
  var num_cols = config.network_data.col_nodes_names.length;
  
  if (num_rows == num_cols){

    var rows = config.network_data.row_nodes_names.sort();
    var cols = config.network_data.col_nodes_names.sort();
    var sim_mat = true;

    _.each(rows, function(inst_row){
      var inst_index = rows.indexOf(inst_row);
      if (inst_row !== cols[inst_index]){
        sim_mat = false;
      }
    });

  }

  return sim_mat;
};