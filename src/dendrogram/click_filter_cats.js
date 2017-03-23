var get_cat_names = require('../categories/get_cat_names');

module.exports = function click_filter_cats(cgm, inst_data, inst_selection, inst_rc){

  var params = cgm.params;


  var inst_cat = d3.select(inst_selection).attr('cat');
  var cat_name = inst_data[inst_cat];

  var found_names = get_cat_names(params, inst_data, inst_selection, inst_rc);

  var switch_rc = {'row':'col','col':'row'};
  var other_rc = switch_rc[inst_rc];

  var filter_names = {};
  filter_names[inst_rc] = found_names;

  if (cgm.params.cat_filter[inst_rc] === false ){

    if (cgm.params.dendro_filter.row === false &&
    cgm.params.dendro_filter.col === false &&
    cgm.params.cat_filter[other_rc] === false){

      var tmp_names = cgm.params.network_data.col_nodes_names;

      // keep a backup of the inst_view
      var inst_row_nodes = cgm.params.network_data.row_nodes;
      var inst_col_nodes = cgm.params.network_data.col_nodes;

      // run filtering using found names
      cgm.filter_viz_using_names(filter_names);

      // overwrite with backup of original nodes
      cgm.params.inst_nodes.row_nodes = inst_row_nodes;
      cgm.params.inst_nodes.col_nodes = inst_col_nodes;

      // must set this after filtering has been run
      cgm.params.cat_filter[inst_rc] = tmp_names;

      highlight_filtered_cat(inst_rc, inst_cat, cat_name);
    }

  } else {

    // get backup of names
    filter_names = cgm.params.cat_filter[inst_rc];

    // reset filter
    cgm.filter_viz_using_names(filter_names);
    // must set this after filtering has been run
    cgm.params.cat_filter[inst_rc] = false;

    // there are no filtered cats
    d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
      .selectAll('rect')
      .classed('filtered_cat', false);

  }

function highlight_filtered_cat(inst_rc, inst_cat, cat_name){

  d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
    .selectAll('rect')
    .style('opacity', function(d){

      var inst_opacity = d3.select(this).style('opacity');

      if (d3.select(this).classed('cat_strings')){

        var tmp_name;
        var tmp_cat = d3.select(this).attr('cat');

        // no need to filter out title
        tmp_name = d[tmp_cat];

        if (tmp_cat === inst_cat && tmp_name === cat_name){
          inst_opacity = 1;

          d3.select(this)
            .classed('filtered_cat', true);

        }
        // else {
        //   inst_opacity = params.viz.cat_colors.opacity/4;
        // }
      }

      return inst_opacity;

    });
}

};