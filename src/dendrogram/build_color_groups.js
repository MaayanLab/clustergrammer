module.exports = function () {
  var max_groups ;
  if ( params.network_data.row_nodes.length > params.network_data.col_nodes.length){
    max_groups = params.network_data.row_nodes;
  } else {
    max_groups = params.network_data.col_nodes;
  }
  for (i = 0; i < params.network_data.row_nodes.length; i++) {
    // grab colors from the list
    if (i === 1) {
      group_colors[i] = Colors.get_default_color();
    } else {
      group_colors[i] = Colors.get_random_color(i);
    }
  }
}
