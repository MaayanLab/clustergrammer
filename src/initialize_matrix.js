var utils = require('./Utils_clust');

module.exports = function(network_data) {
  var matrix = [];
  var ini_object;

  var keep_orig;
  if (utils.has(network_data.links[0], 'value_orig')){
    keep_orig = true;
  } else {
    keep_orig = false;
  }

  network_data.row_nodes.forEach(function (tmp, row_index) {

    matrix[row_index] = {};
    matrix[row_index].name = network_data.row_nodes[row_index].name;
    matrix[row_index].row_index = row_index;

    matrix[row_index].row_data = d3.range(network_data.col_nodes.length).map(
      function (col_index) {

        if (utils.has(network_data.links[0], 'value_up') || utils.has(network_data.links[0], 'value_dn')) {

          ini_object = {
            pos_x: col_index,
            pos_y: row_index,
            value: 0,
            value_up: 0,
            value_dn: 0,
            highlight: 0
          };

        } else {

          ini_object = {
            pos_x: col_index,
            pos_y: row_index,
            value: 0,
            highlight: 0
          };

        }

        if (keep_orig){
          ini_object.value_orig = 0;
        }

        return ini_object;
      });

  });

  network_data.links.forEach(function (link) {

    // transfer additional link information is necessary
    matrix[link.source].row_data[link.target].value = link.value;
    matrix[link.source].row_data[link.target].row_name = link.row_name;
    matrix[link.source].row_data[link.target].col_name = link.col_name;

    if (utils.has(link, 'value_up') || utils.has(link, 'value_dn')) {
      matrix[link.source].row_data[link.target].value_up = link.value_up;
      matrix[link.source].row_data[link.target].value_dn = link.value_dn;
    }

    if (keep_orig){
      matrix[link.source].row_data[link.target].value_orig = link.value_orig;
    }

    if (link.highlight) {
      matrix[link.source].row_data[link.target].highlight = link.highlight;
    }
    if (link.info) {
      matrix[link.source].row_data[link.target].info = link.info;
    }
  });

  return matrix;
};
