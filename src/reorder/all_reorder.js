var toggle_dendro_view = require('../dendrogram/toggle_dendro_view');
var show_visible_area = require('../zoom/show_visible_area');
var ini_zoom_info = require('../zoom/ini_zoom_info');
var calc_downsampled_levels = require('../matrix/calc_downsampled_levels');
var two_translate_zoom = require('../zoom/two_translate_zoom');
var get_previous_zoom = require('../zoom/get_previous_zoom');
var underscore = require('underscore');

module.exports = function(cgm, inst_order, inst_rc) {

  var params = cgm.params;

  var prev_zoom = get_previous_zoom(params);

  var delay_reorder = 0;
  if (prev_zoom.zoom_y != 1 || prev_zoom.zoom_x !=1){
    // reset zoom before reordering
    two_translate_zoom(cgm, 0, 0, 1);
    delay_reorder = 1200;
  }

  // row/col names are swapped, will improve later
  var other_rc;
  if (inst_rc==='row'){
    other_rc = 'col';
  } else if (inst_rc === 'col'){
    other_rc = 'row';
  }

  params.viz.run_trans = true;

  // save order state
  if (other_rc === 'row'){
    params.viz.inst_order.row = inst_order;
  } else if (other_rc === 'col'){
    params.viz.inst_order.col = inst_order;
  }

  if (params.viz.show_dendrogram){
    toggle_dendro_view(cgm, inst_rc);
  }

  if (other_rc === 'row'){
    params.viz.x_scale
      .domain( params.matrix.orders[ params.viz.inst_order.row + '_row' ] );
  } else if (other_rc == 'col') {
    params.viz.y_scale
      .domain( params.matrix.orders[ params.viz.inst_order.col + '_col' ] );
  }

  // only animate transition if there are a small number of tiles
  var t;
  if (d3.selectAll(params.root+' .tile')[0].length < params.matrix.def_large_matrix){
    t = d3.select(params.root+' .viz_svg')
      .transition().duration(2500).delay(delay_reorder);
  } else {
    t = d3.select(params.root+' .viz_svg');
  }

  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;

  // only update matrix if not downsampled (otherwise rows are updated)
  if (params.viz.ds_level === -1){

    t.selectAll('.row')
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(row_nodes_names, d.name);
        return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
        })
      .selectAll('.tile')
      .attr('transform', function(d) {
        return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
      });

    t.selectAll('.tile_up')
      .attr('transform', function(d) {
        return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
      });

    t.selectAll('.tile_dn')
      .attr('transform', function(d) {
        return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
      });
  }

  // Move Row Labels
  t.select('.row_label_zoom_container')
    .selectAll('.row_label_group')
    .attr('transform', function(d) {
      var inst_index = underscore.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
    });

  // Move Col Labels
  t.select('.col_zoom_container')
    .selectAll('.col_label_text')
    .attr('transform', function(d) {
      var inst_index = underscore.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
    });

  // reorder row categories
  t.selectAll('.row_cat_group')
    .attr('transform', function(d) {
      var inst_index = underscore.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
    });

  // reorder col_class groups
  t.selectAll('.col_cat_group')
    .attr('transform', function(d) {
      var inst_index = underscore.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
    });

  // redefine x and y positions
  params.network_data.links.forEach(function(d){
    d.x = params.viz.x_scale(d.target);
    d.y = params.viz.y_scale(d.source);
  });

  params.zoom_info = ini_zoom_info();

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

  setTimeout(function(){
    params.viz.run_trans = false;
  }, 2500);

};
