var make_full_name = require('./make_full_name');
var underscore = require('underscore');

module.exports = function make_matrix_string(params){

  var inst_matrix = params.matrix;

  // get order indexes
  var order_indexes = {};
  var inst_name;
  underscore.each(['row', 'col'], function(tmp_rc){

    var inst_rc;
    // row/col names are reversed in saved orders
    if (tmp_rc === 'row'){
      inst_rc = 'col';
    } else {
      inst_rc = 'row';
    }

    // use tmp_rc
    inst_name = params.inst_order[tmp_rc];

    // use tmp_rc
    order_indexes[inst_rc] = inst_matrix.orders[ inst_name+ '_' + tmp_rc ];

  });

  var matrix_string = '\t';
  var row_nodes = params.network_data.row_nodes;
  var col_nodes = params.network_data.col_nodes;

  // alternate column entry
  for (var c_i=0; c_i<order_indexes.col.length; c_i++){

    var inst_index = order_indexes.col[c_i];

    var inst_col = col_nodes[inst_index];
    var col_name = make_full_name(params, inst_col, 'col');

    if (c_i < order_indexes.col.length-1){
      matrix_string = matrix_string + col_name + '\t';
    } else {
      matrix_string = matrix_string + col_name ;
    }

  }

  var row_data;
  matrix_string = matrix_string + '\n';

  underscore.each(order_indexes.row, function(inst_index){

    // row names
    row_data = inst_matrix.matrix[inst_index].row_data;

    // var row_name = inst_matrix.matrix[inst_index].name;
    var inst_row = row_nodes[inst_index];

    // var row_name = inst_row.name;
    var row_name = make_full_name(params, inst_row, 'row');

    matrix_string = matrix_string + row_name + '\t';

    // alternate data entry
    for (var r_i=0; r_i<order_indexes.col.length; r_i++){

      // get the order
      var col_index = order_indexes.col[r_i];

      if (r_i < order_indexes.col.length-1){
        matrix_string = matrix_string + String(row_data[col_index].value) + '\t';
      } else {
        matrix_string = matrix_string + String(row_data[col_index].value);
      }

    }

    matrix_string = matrix_string + '\n';

  });

  return matrix_string;

};