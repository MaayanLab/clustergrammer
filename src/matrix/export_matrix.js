module.exports = function export_matrix(){

  console.log('export matrix\n')
  var inst_cgm = this;
  var inst_order = inst_cgm.params.matrix.orders.clust_row;
  var row_data = inst_cgm.params.matrix.matrix[0].row_data;

  _.each(inst_order, function(inst_index)
    {console.log(row_data[inst_index].col_name)
    });

};