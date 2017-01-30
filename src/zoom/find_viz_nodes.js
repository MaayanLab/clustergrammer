module.exports = function find_viz_nodes(params, viz_area){

  var inst_rows = [];
  var inst_cols = [];
  var curr_rows = [];

  // find rows that should be visible
  var inst_row_name;
  var y_trans;
  for (var i=0; i < params.network_data.row_nodes_names.length; i++){

    y_trans = params.viz.y_scale(i);

    if (y_trans < viz_area.max_y && y_trans > viz_area.min_y){
      inst_rows.push(params.network_data.row_nodes_names[i])
    }

  }

  // find currently visible labels
  d3.selectAll(params.root+' .row')
    .each(function(d){
      curr_rows.push(d.name);
    });

  // find visible cols
  d3.selectAll(params.root+' .col_label_text')
    .each(function(d){
      var inst_trans = d3.select(this)
        .attr('transform');

      var x_trans = Number(inst_trans.split('(')[1].split(',')[0].split(')')[0]);

      if (x_trans < viz_area.max_x && x_trans > viz_area.min_x){
        inst_cols.push(d.name);
      }

    });

  // nodes that should be visible
  params.viz.viz_nodes.row = inst_rows;
  params.viz.viz_nodes.col = inst_cols;

  // nodes that are visible
  params.viz.viz_nodes.curr_row = curr_rows;

};