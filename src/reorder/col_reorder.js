var reposition_tile_highlight = require('./reposition_tile_highlight');

module.exports = function(params, col_selection) {

  params.viz.run_trans = true;

  var mat       = params.matrix.matrix;
  var row_nodes = params.network_data.row_nodes;
  var col_nodes = params.network_data.col_nodes;

  var row_nodes_names = _.pluck(row_nodes, 'name');

  // get inst col (term)
  var inst_term = d3.select(col_selection).select('text').attr('full_name');

  // find the column number of col_selection term from col_nodes
  // gather column node names
  var tmp_arr = [];
  col_nodes.forEach(function(node) {
    tmp_arr.push(node.name);
  });

  // find index
  var inst_col = _.indexOf(tmp_arr, inst_term);

  // gather the values of the input genes
  tmp_arr = [];
  row_nodes.forEach(function(node, index) {
    tmp_arr.push( mat[index].row_data[inst_col].value);
  });

  // sort the cols
  var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
    return tmp_arr[b] - tmp_arr[a];
  });


  // resort cols
  ////////////////////////////
  params.matrix.y_scale.domain(tmp_sort);

  var t;

  // reorder
  if (params.network_data.links.length > params.matrix.def_large_matrix){
    t = d3.select(params.root+' .clust_group');

    // reorder row_label_triangle groups
    d3.selectAll(params.root+' .row_viz_group')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });

    // Move Row Labels
    d3.select(params.root+' .row_label_zoom_container')
      .selectAll('.row_label_text')
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });

  } else {

    t = d3.select(params.root+' .clust_group')
      .transition().duration(2500);

    // reorder row_label_triangle groups
    d3.selectAll(params.root+' .row_viz_group')
      .transition().duration(2500)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });

    // Move Row Labels
    d3.select(params.root+' .row_label_zoom_container')
      .selectAll('.row_label_text')
      .transition().duration(2500)
      .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
      });
  }

  // reorder matrix rows
  t.selectAll('.row')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(inst_index) + ')';
    });


  // highlight selected column
  ///////////////////////////////
  // unhilight and unbold all columns (already unbolded earlier)
  d3.selectAll(params.root+' .col_label_text')
    .select('.highlight_rect')
    .style('opacity', 0);
  // highlight column name
  d3.select(col_selection)
    .select('.highlight_rect')
    .style('opacity', 1);

  // redefine x and y positions
  params.network_data.links.forEach(function(d){
    d.x = params.matrix.x_scale(d.target);
    d.y = params.matrix.y_scale(d.source);
  });

  reposition_tile_highlight(params);

  setTimeout(function(){
    params.viz.run_trans = false;
  }, 2500);

};
