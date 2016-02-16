var Params = require('../params');
var colors = require('../colors');

var group_colors = [];

function build() {
  if (group_colors.length) {
    return group_colors;
  }

  var params = Params.get();
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

}

module.exports = {
  build: build,
  get: function() {
    if (group_colors.length < 1) {
      group_colors = build();
    }
    return group_colors;
  },
  color_group: function(index) {
    if (group_colors.length < 1) {
      group_colors = build();
    }
    return group_colors[index];
  },
  get_group_color: function(index) {
    if (group_colors.length < 1) {
      group_colors = build();
    }
    return group_colors[index];
  }
};
