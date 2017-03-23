module.exports = function run_dendro_filter(cgm, d, inst_rc){

  var names = {};

  if (cgm.params.dendro_filter.row === false &&
      cgm.params.dendro_filter.col === false &&
      cgm.params.cat_filter.row === false &&
      cgm.params.cat_filter.col === false
    ){

    d3.select(cgm.params.root+' .'+inst_rc+'_slider_group')
      .style('opacity', 0.35)
      .style('pointer-events','none');

    names[inst_rc] = d.all_names;

    var tmp_names = cgm.params.network_data[inst_rc+'_nodes_names'];

    // keep a backup of the inst_view
    var inst_row_nodes = cgm.params.network_data.row_nodes;
    var inst_col_nodes = cgm.params.network_data.col_nodes;

    cgm.filter_viz_using_names(names);

    // overwrite with backup of original nodes
    cgm.params.inst_nodes.row_nodes = inst_row_nodes;
    cgm.params.inst_nodes.col_nodes = inst_col_nodes;

    d3.selectAll(cgm.params.root+' .dendro_shadow')
      .transition()
      .duration(1000)
      .style('opacity',0)
      .remove();

    // keep the names of all the nodes
    cgm.params.dendro_filter[inst_rc] = tmp_names;

  /* reset filter */
  } else {

    names[inst_rc] = cgm.params.dendro_filter[inst_rc];

    cgm.filter_viz_using_names(names);
    cgm.params.dendro_filter[inst_rc] = false;

  }

};