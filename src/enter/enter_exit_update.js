var resize_after_update = require('../reset_size/reset_size_after_update');
var make_rows = require('../labels/make_rows');
var make_cols = require('../labels/make_cols');
var eeu_existing_row = require('./eeu_existing_row');
var exit_components = require('../exit/exit_components');
var enter_grid_lines = require('../enter/enter_grid_lines');
var enter_row_groups = require('../enter/enter_row_groups');
var resize_containers = require('../reset_size/resize_containers');
var label_constrain_and_trim = require('../labels/label_constrain_and_trim');

module.exports = function(params, network_data, delays){

  // remove old tooltips 
  d3.selectAll(params.root+' .d3-tip')
    .remove();

  if (params.matrix.show_tile_tooltips){
    // d3-tooltip - for tiles
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('n')
      .offset([0, 0])
      .html(params.matrix.make_tile_tooltip);

    d3.select(params.root+'.clust_group')
      .call(tip);
    }

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
        return 'translate(0,'+params.matrix.y_scale(tmp_index)+')';
      });
  } else {
    move_rows
      .attr('transform', function(d){
        var tmp_index = _.indexOf(row_nodes_names, d.name);
        return 'translate(0,'+params.matrix.y_scale(tmp_index)+')';
      });
  }

  // update existing rows - enter, exit, update tiles in existing row
  d3.select(params.root+' .clust_group')
    .selectAll('.row')
    .each(function(d) {
      // TODO add tip back to arguments 
      var tmp = this;
      eeu_existing_row(params, d, delays, duration, tmp);
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
