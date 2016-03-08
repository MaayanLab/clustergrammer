var make_row_dendro_triangles = require('../dendrogram/make_row_dendro_triangles');
var make_col_dendro_triangles = require('../dendrogram/make_col_dendro_triangles');

module.exports = function toggle_dendro_view(params, row_col){

  var wait_time = 1500;

  // row and col are reversed
  if (row_col === 'row'){
    if (params.viz.inst_order.col === 'clust'){
      setTimeout( make_row_dendro_triangles, wait_time, params);
    } else {
      d3.selectAll(params.root+' .row_dendro_group').style('opacity',0);
    }
  }

  if (row_col === 'col'){
    if (params.viz.inst_order.row === 'clust'){
      setTimeout( make_col_dendro_triangles, wait_time, params);
    } else {
      d3.selectAll(params.root+' .col_dendro_group').style('opacity',0);

    }
  }

};