module.exports = function find_viz_nodes(params, viz_area){

  var should_be_rows = [];
  var curr_rows = [];

  // find rows that should be visible
  var inst_row_name;
  var y_trans;
  for (var i=0; i < params.network_data.row_nodes_names.length; i++){

    y_trans = params.viz.y_scale(i);

    if (y_trans < viz_area.max_y && y_trans > viz_area.min_y){
      should_be_rows.push(params.network_data.row_nodes_names[i])
    }

  }

  // find currently visible labels
  d3.selectAll(params.root+' .row')
    .each(function(d){
      curr_rows.push(d.name);
    });

  // nodes that should be visible
  params.viz.viz_nodes.row = should_be_rows;
  // nodes that are visible
  params.viz.viz_nodes.curr_row = curr_rows;

};