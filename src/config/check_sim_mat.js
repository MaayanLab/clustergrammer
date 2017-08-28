var underscore = require('underscore');

module.exports = function check_sim_mat(config){

  var sim_mat = false;

  var num_rows = config.network_data.row_nodes_names.length;
  var num_cols = config.network_data.col_nodes_names.length;

  if (num_rows == num_cols){

    // the sort here was causing errors
    var rows = config.network_data.row_nodes_names;
    var cols = config.network_data.col_nodes_names;
    sim_mat = true;

    underscore.each(rows, function(inst_row){
      var inst_index = rows.indexOf(inst_row);
      if (inst_row !== cols[inst_index]){
        sim_mat = false;
      }
    });

  }

  if (sim_mat){
    config.expand_button = false;
  }

  return sim_mat;
};