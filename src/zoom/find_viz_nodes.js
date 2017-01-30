module.exports = function find_viz_nodes(params, viz_area){

  var should_be_rows = [];
  var curr_rows = [];

  // find rows that should be visible
  var inst_row_name;
  var y_trans;

  // default y_scale (no downsampling)
  var y_scale = params.viz.y_scale;
  var ds_level = params.viz.ds_level;
  var row_names = params.network_data.row_nodes_names;
  var row_class = '.row';

  // need to turn this on
  /////////////////////////////
  if (ds_level >=0){
    y_scale = params.viz.ds[ds_level].y_scale;

    row_names = d3.range(params.matrix.ds_matrix[0].length).map(String);

    row_class = '.ds'+String(ds_level)+'_row';
  }


  for (var i=0; i < row_names.length; i++){

    // y_scale (works for downsampled data or non-downsampled data)
    y_trans = y_scale(i);

    if (y_trans < viz_area.max_y && y_trans > viz_area.min_y){
      should_be_rows.push(row_names[i]);
    }

  }

  // find currently visible labels
  d3.selectAll(params.root+' '+row_class)
    .each(function(d){
      curr_rows.push(d.name);
    });

  // nodes that should be visible
  params.viz.viz_nodes.row = should_be_rows;
  // nodes that are visible
  params.viz.viz_nodes.curr_row = curr_rows;

};