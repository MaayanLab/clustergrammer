var resize_after_update = require('../reset_size/reset_size_after_update');
var make_rows = require('../labels/make_rows');
var make_cols = require('../labels/make_cols');
var eeu_existing_row = require('./eeu_existing_row');
var exit_components = require('../exit/exit_components');
var enter_grid_lines = require('../enter/enter_grid_lines');
var enter_row_groups = require('../enter/enter_row_groups');
var resize_containers = require('../reset_size/resize_containers');
var label_constrain_and_trim = require('../labels/label_constrain_and_trim');
var d3_tip_custom = require('../tooltip/d3_tip_custom');

module.exports = function(params, network_data, delays){

  // remove old tooltips 
  d3.selectAll(params.root+' .d3-tip')
    .style('opacity',0);

  // d3-tooltip - for tiles
  var tip = d3_tip_custom()
    .attr('class', 'd3-tip tile_tip')
    .direction('nw')
    .offset([0, 0])
    .html(function(d){
      var inst_value = String(d.value.toFixed(3));
      var tooltip_string;

      if (params.keep_orig){
        var orig_value = String(d.value_orig.toFixed(3));
        tooltip_string = '<p>' + d.row_name + ' and ' + d.col_name + '</p>' +
        '<p> normalized value: ' + inst_value +'</p>' + 
        '<div> original value: ' + orig_value +'</div>'  ;
      } else {
        tooltip_string = '<p>' + d.row_name + ' and ' + d.col_name + '</p>' +
        '<div> value: ' + inst_value +'</div>';
      }

      return tooltip_string;
    });

  d3.select(params.root+' .clust_group')
    .call(tip);

  // TODO check if necessary 
  resize_containers(params);

  // get row and col names
  var row_nodes_names = params.network_data.row_nodes_names;

  var duration = 1000;

  // make global so that names can be accessed
  var row_nodes = network_data.row_nodes;
  var col_nodes = network_data.col_nodes;
  var links = network_data.links;

  //
  var tile_data = links;

  // add name to links for object constancy
  for (var i = 0; i < tile_data.length; i++) {
    var d = tile_data[i];
    tile_data[i].name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
  }

  // move rows
  var move_rows = d3.select(params.root+' .clust_group')
    .selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;});

  if (delays.run_transition){
    move_rows
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d){
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,'+params.viz.y_scale(tmp_index)+')';
      });
  } else {
    move_rows
      .attr('transform', function(d){
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,'+params.viz.y_scale(tmp_index)+')';
      });
  }

  // update existing rows - enter, exit, update tiles in existing row
  d3.select(params.root+' .clust_group')
    .selectAll('.row')
    .each(function(d) {
      // TODO add tip back to arguments 
      var inst_selection = this;
      eeu_existing_row(params, d, delays, duration, inst_selection, tip);
    });


  d3.selectAll(params.root+' .horz_lines').remove();
  d3.selectAll(params.root+' .vert_lines').remove();

  // exit
  ////////////
  exit_components(params, delays, duration);

  // resize clust components using appropriate delays
  resize_after_update(params, row_nodes, col_nodes, links, duration, delays);

  // enter new elements
  //////////////////////////
  enter_row_groups(params, delays, duration, tip);

  // update existing rows 
  make_rows(params, duration);
  make_cols(params, duration);

  enter_grid_lines(params, delays, duration);

  label_constrain_and_trim(params);
};
