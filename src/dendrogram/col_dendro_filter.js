module.exports = function col_dendro_filter(cgm, d, inst_selection){

  var names = {};
  if (cgm.params.dendro_filter.row === false){

    /* filter cols using dendrogram */
    if (cgm.params.dendro_filter.col === false &&
        cgm.params.cat_filter.row === false &&
        cgm.params.cat_filter.col === false){

      d3.select(cgm.params.root+' .col_slider_group')
        .style('opacity', 0.35)
        .style('pointer-events','none');

      names.col = d.all_names;

      var tmp_names = cgm.params.network_data.col_nodes_names;

      // keep a backup of the inst_view
      var inst_row_nodes = cgm.params.network_data.row_nodes;
      var inst_col_nodes = cgm.params.network_data.col_nodes;

      cgm.filter_viz_using_names(names);

      // save backup of the inst_view
      cgm.params.inst_nodes.row_nodes = inst_row_nodes;
      cgm.params.inst_nodes.col_nodes = inst_col_nodes;

      d3.selectAll(cgm.params.root+' .dendro_shadow')
        .transition()
        .duration(1000)
        .style('opacity',0)
        .remove();

      // keep the names of all the cols
      cgm.params.dendro_filter.col = tmp_names;

      d3.select(inst_selection)
        .style('opacity',1);

    /* reset filter */
    } else {

      names.col = cgm.params.dendro_filter.col;

      cgm.filter_viz_using_names(names);
      cgm.params.dendro_filter.col = false;

    }
  }
};