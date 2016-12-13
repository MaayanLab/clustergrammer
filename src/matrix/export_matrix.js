module.exports = function export_matrix(){

  var inst_cgm = this;

  // get order indexes
  var order_indexes = {}
  var inst_order_name;
  _.each(['row', 'col'], function(tmp_rc){

    var inst_rc;
    // row/col names are reversed in saved orders
    if (tmp_rc === 'row'){
      inst_rc = 'col';
    } else {
      inst_rc = 'row'
    }

    // use tmp_rc
    inst_order_name = inst_cgm.params.inst_order[tmp_rc];

    // use tmp_rc
    order_indexes[inst_rc] = inst_cgm.params.matrix.orders[ inst_order_name+ '_' + tmp_rc ]

  });

  var matrix_string = '\t';

  var row_data = inst_cgm.params.matrix.matrix[0].row_data;

  console.log('cols')
  _.each(order_indexes['col'], function(inst_index){

    // column names
    console.log(row_data[inst_index].col_name);

    matrix_string = matrix_string + row_data[inst_index].col_name + '\t';

  });

  console.log('\n\n\n')

  matrix_string = matrix_string + '\n';

  console.log('rows')
  _.each(order_indexes['row'], function(inst_index){

    // row names
    row_data = inst_cgm.params.matrix.matrix[inst_index].row_data;

    console.log('\n')
    console.log(inst_cgm.params.matrix.matrix[inst_index].name)

    matrix_string = matrix_string + inst_cgm.params.matrix.matrix[inst_index].name + '\t'


    _.each(order_indexes['col'], function(col_index){
      console.log(String(row_data[col_index].col_name) + ': ' + String(row_data[col_index].value))

      matrix_string = matrix_string + String(row_data[col_index].value) + '\t';

    })

    matrix_string = matrix_string + '\n';

  });

  console.log(matrix_string)

};