var reposition_tile_highlight = require('./reposition_tile_highlight');
var toggle_dendro_view = require('../dendrogram/toggle_dendro_view');
var ini_zoom_info = require('../zoom/ini_zoom_info');
var get_previous_zoom = require('../zoom/get_previous_zoom');
var calc_downsampled_levels = require('../matrix/calc_downsampled_levels');
var underscore = require('underscore');

module.exports = function row_reorder(cgm, row_selection, inst_row) {

  var params = cgm.params;
  var prev_zoom = get_previous_zoom(params);

  if (prev_zoom.zoom_y === 1 && prev_zoom.zoom_x ===1){

      params.viz.inst_order.row = 'custom';
      toggle_dendro_view(cgm, 'col');

      d3.selectAll(params.root+' .toggle_col_order .btn')
        .classed('active',false);

      params.viz.run_trans = true;

      var mat       = $.extend(true, {}, params.matrix.matrix);
      var row_nodes = params.network_data.row_nodes;
      var col_nodes = params.network_data.col_nodes;

      // find the index of the row
      var tmp_arr = [];
      row_nodes.forEach(function(node) {
        tmp_arr.push(node.name);
      });

      // find index
      inst_row = underscore.indexOf(tmp_arr, inst_row);

      // gather the values of the input genes
      tmp_arr = [];
      col_nodes.forEach(function(node, index) {
        tmp_arr.push( mat[inst_row].row_data[index].value);
      });

      // sort the rows
      var tmp_sort = d3.range(tmp_arr.length).sort(function(a, b) {
        return tmp_arr[b] - tmp_arr[a];
      });

      // resort cols (cols are reorderd by double clicking a row)
      params.viz.x_scale.domain(tmp_sort);

      // save to custom col order
      params.matrix.orders.custom_row = tmp_sort;

      // reorder matrix
      ////////////////////
      var t;
      if (params.network_data.links.length > params.matrix.def_large_matrix){
        t = d3.select(params.root + ' .viz_svg');
      } else {
        t = d3.select(params.root + ' .viz_svg').transition().duration(2500);
      }

      var col_nodes_names = params.network_data.col_nodes_names;

      // Move Col Labels
      t.select('.col_zoom_container')
        .selectAll('.col_label_text')
        .attr('transform', function(d) {
          var inst_index = underscore.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.viz.x_scale(inst_index) + ')rotate(-90)';
        });

      // reorder col_class groups
      t.selectAll('.col_cat_group')
        .attr('transform', function(d) {
          var inst_index = underscore.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
        });

      // reorder tiles in matrix (do not change row order)
      if (params.viz.ds_level === -1){
        t.selectAll('.tile')
          .attr('transform', function(d) {
            return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
          });

        t.selectAll('.tile_up')
          .attr('transform', function(d) {
            return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
          });

        t.selectAll('.tile_dn')
          .attr('transform', function(d) {
            return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
          });
      }

      // highlight selected row
      ///////////////////////////////
      // unhilight and unbold all columns (already unbolded earlier)
      d3.selectAll(params.root+' .row_label_group')
        .select('rect')
        .style('opacity', 0);
      // highlight column name
      d3.select(row_selection)
        .select('rect')
        .style('opacity', 1);

      reposition_tile_highlight(params);

      // redefine x and y positions
      params.network_data.links.forEach(function(d){
        d.x = params.viz.x_scale(d.target);
        d.y = params.viz.y_scale(d.source);
      });

      params.zoom_info = ini_zoom_info();

      setTimeout(function(){
        params.viz.run_trans = false;
      }, 2500);

    // calculate downsmapling if necessary
    if (params.viz.ds_num_levels > 0 && params.viz.ds_level >=0){

      calc_downsampled_levels(params);

      // var zooming_stopped = true;
      // var zooming_out = true;
      // var make_all_rows = true;
      // // show_visible_area is also run with two_translate_zoom, but at that point
      // // the parameters were not updated and two_translate_zoom if only run
      // // if needed to reset zoom
      // show_visible_area(cgm, zooming_stopped, zooming_out, make_all_rows);

    }

  }

};
