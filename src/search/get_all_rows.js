module.exports = function get_all_rows(cgm){

  /* Collect entities from row or columns.
   */

  var nodes = cgm.params.network_data.row_nodes;
  var prop = 'name';

  var entities = [];
  var i;

  for (i = 0; i < nodes.length; i++) {
    entities.push(nodes[i][prop]);
  }

  return entities;

};