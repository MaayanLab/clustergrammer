var colors = require('../colors');

module.exports = function(params) {
  var group_colors = [];
  // var max_groups;
  //
  // if (params.network_data.row_nodes.length > params.network_data.col_nodes.length) {
  //   max_groups = params.network_data.row_nodes;
  // } else {
  //   max_groups = params.network_data.col_nodes;
  // }

  for (var i = 0; i < params.network_data.row_nodes.length; i++) {
    // grab colors from the list
    if (i === 1) {
      group_colors[i] = colors.get_default_color();
    } else {
      group_colors[i] = colors.get_random_color(i);
    }
  }

  return group_colors;
};
