// var utils = require('../Utils_clust');
var reposition_tile_highlight = require('./reposition_tile_highlight');
var toggle_dendro_view = require('../dendrogram/toggle_dendro_view');
var show_visible_area = require('../zoom/show_visible_area');
var ini_zoom_info = require('../zoom/ini_zoom_info');
var get_previous_zoom = require('../zoom/get_previous_zoom');
var calc_downsampled_levels = require('../matrix/calc_downsampled_levels');
var underscore = require('underscore');

module.exports = function col_reorder(cgm, col_selection, inst_term) {

  var params = cgm.params;
  var prev_zoom = get_previous_zoom(params);

  if (prev_zoom.zoom_y === 1 && prev_zoom.zoom_x ===1){

    params.viz.inst_order.col = 'custom';

    toggle_dendro_view(cgm, 'col');

    d3.selectAll(params.root+' .toggle_row_order .btn')
      .classed('active',false);

    params.viz.run_trans = true;

    var mat       = $.extend(true, {}, params.matrix.matrix);
    var row_nodes = params.network_data.row_nodes;
    var col_nodes = params.network_data.col_nodes;

    // find the column number of col_selection term from col_nodes
    // gather column node names
    var tmp_arr = [];
    col_nodes.forEach(function(node) {
      tmp_arr.push(node.name);
    });

    // find index
    var inst_col = underscore.indexOf(tmp_arr, inst_term);

    // gather the values of the input genes
    tmp_arr = [];
    row_nodes.forEach(function(node, index) {
      tmp_arr.push( mat[index].row_data[inst_col].value);
    });

    // sort the cols
    var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
      return tmp_arr[b] - tmp_arr[a];
    });


    // resort rows (rows are reorderd by double clicking a col)
    params.viz.y_scale.domain(tmp_sort);

    // save to custom row order
    params.matrix.orders.custom_col = tmp_sort;

    var t;

    var row_nodes_names = params.network_data.row_nodes_names;

    // reorder
    if (params.network_data.links.length > params.matrix.def_large_matrix){
      t = d3.select(params.root+' .viz_svg');
    } else {
      t = d3.select(params.root+' .viz_svg')
        .transition().duration(2500);
    }

    // reorder row_label_triangle groups
    t.selectAll('.row_cat_group')
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
      });

    // Move Row Labels
    t.select('.row_label_zoom_container')
      .selectAll('.row_label_group')
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
      });

    // only update matri if not downsampled
    if (params.viz.ds_level === -1){
      // reorder matrix rows
      t.selectAll('.row')
        .attr('transform', function(d) {
          var inst_index = underscore.indexOf(row_nodes_names, d.name);
          return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
        });
    }

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
      d.x = params.viz.x_scale(d.target);
      d.y = params.viz.y_scale(d.source);
    });

    reposition_tile_highlight(params);

    params.zoom_info = ini_zoom_info();

    setTimeout(function(){
      params.viz.run_trans = false;
    }, 2500);

    // calculate downsmapling if necessary
    if (params.viz.ds_num_levels > 0 && params.viz.ds_level >=0){

      calc_downsampled_levels(params);

      var zooming_stopped = true;
      var zooming_out = true;
      var make_all_rows = true;
      // show_visible_area is also run with two_translate_zoom, but at that point
      // the parameters were not updated and two_translate_zoom if only run
      // if needed to reset zoom
      show_visible_area(cgm, zooming_stopped, zooming_out, make_all_rows);

    }

  }

};
