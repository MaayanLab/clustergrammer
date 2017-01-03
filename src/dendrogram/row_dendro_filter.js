module.exports = function row_dendro_filter(cgm, d){

  var names = {};
  if (cgm.params.dendro_filter.col === false){

    if (cgm.params.dendro_filter.row === false &&
        cgm.params.cat_filter.row === false &&
        cgm.params.cat_filter.col === false
      ){

      // d3.select(params.root+' .slider_row')
      d3.select(cgm.params.root+' .row_slider_group')
        .style('opacity', 0.35)
        .style('pointer-events','none');

      names.row = d.all_names;

      var tmp_names = cgm.params.network_data.row_nodes_names;

      // keep a backup of the inst_view
      var inst_row_nodes = cgm.params.network_data.row_nodes;
      var inst_col_nodes = cgm.params.network_data.col_nodes;

      cgm.filter_viz_using_names(names);

      cgm.params.inst_nodes.row_nodes = inst_row_nodes;
      cgm.params.inst_nodes.col_nodes = inst_col_nodes;

      d3.selectAll(cgm.params.root+' .dendro_shadow')
        .transition()
        .duration(1000)
        .style('opacity',0)
        .remove();

      // keep the names of all the rows
      cgm.params.dendro_filter.row = tmp_names;

    /* reset filter */
    } else {

      names.row = cgm.params.dendro_filter.row;

      cgm.filter_viz_using_names(names);
      cgm.params.dendro_filter.row = false;

    }

  }


};