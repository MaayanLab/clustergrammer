var file_saver = require('../screenshot/file_saver');

module.exports = function export_matrix(){

  var saveAs = file_saver();

  var params = this.params;
  var inst_matrix = params.matrix;

  // get order indexes
  var order_indexes = {}
  var inst_name;
  _.each(['row', 'col'], function(tmp_rc){

    var inst_rc;
    // row/col names are reversed in saved orders
    if (tmp_rc === 'row'){
      inst_rc = 'col';
    } else {
      inst_rc = 'row'
    }

    // use tmp_rc
    inst_name = params.inst_order[tmp_rc];

    // use tmp_rc
    order_indexes[inst_rc] = inst_matrix.orders[ inst_name+ '_' + tmp_rc ];

  });

  var matrix_string = '\t';

  var tmp_row_data = inst_matrix.matrix[0].row_data;

  _.each(order_indexes['col'], function(inst_index){

    // var col_name = tmp_row_data[inst_index].col_name;
    var col_name = params.network_data.col_nodes[inst_index].name;

    // console.log('* '+col_name)
    // console.log(params.network_data.col_nodes[inst_index].name)

    matrix_string = matrix_string + col_name + '\t';

  });


  var row_data;
  matrix_string = matrix_string + '\n';

  _.each(order_indexes['row'], function(inst_index){

    // row names
    row_data = inst_matrix.matrix[inst_index].row_data;

    // var row_name = inst_matrix.matrix[inst_index].name;
    var row_name = params.network_data.row_nodes[inst_index].name;

    matrix_string = matrix_string + row_name + '\t'

    _.each(order_indexes['col'], function(col_index){

      matrix_string = matrix_string + String(row_data[col_index].value) + '\t';

    })

    matrix_string = matrix_string + '\n';

  });

  console.log(matrix_string)

  // var blob = new Blob([matrix_string], {type: 'text/plain;charset=utf-8'});
  // saveAs(blob, 'clustergrammer.txt');

};