module.exports = function export_matrix(){

  console.log('export matrix\n')
  var inst_cgm = this;
  var inst_order = inst_cgm.params.matrix.orders.clust_row;
  var row_data = inst_cgm.params.matrix.matrix[0].row_data;

  _.each(inst_order, function(inst_index){
      console.log(row_data[inst_index].col_name);
    });

  var order_name = {};
  _.each(['row', 'col'], function(tmp_rc){
    var inst_rc;

    // row/col names are reversed in saved orders
    if (tmp_rc === 'row'){
      inst_rc = 'col';
    } else {
      inst_rc = 'row'
    }

    order_name[inst_rc] = cgm.params.inst_order[tmp_rc];

    console.log(inst_rc + ' are in '+ order_name[inst_rc])

  });

};