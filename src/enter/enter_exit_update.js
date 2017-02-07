var reset_size_after_update = require('../reset_size/reset_size_after_update');
var make_row_label_container = require('../labels/make_row_label_container');
var make_col_label_container = require('../labels/make_col_label_container');
var eeu_existing_row = require('./eeu_existing_row');
var exit_components = require('../exit/exit_components');
var draw_gridlines = require('../matrix/draw_gridlines');
var enter_row_groups = require('../enter/enter_row_groups');
var resize_containers = require('../reset_size/resize_containers');
var label_constrain_and_trim = require('../labels/label_constrain_and_trim');
var d3_tip_custom = require('../tooltip/d3_tip_custom');

module.exports = function enter_exit_update(cgm, network_data, delays){

  var params = cgm.params;

  // remove old tooltips
  d3.selectAll(params.viz.root_tips)
    .remove();

  // d3-tooltip - for tiles
  var tip = d3_tip_custom()
    .attr('class', function(){
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + ' d3-tip '+
                         root_tip_selector + '_tile_tip';
      return class_string;
    })
    .direction('nw')
    .offset([0, 0])
    .style('display', 'none')
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

  // necessary for repositioning clust, col and col-cat containers
  resize_containers(params);

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
        var tmp_index = d.row_index;
        return 'translate(0,'+params.viz.y_scale(tmp_index)+')';
      });
  } else {
    move_rows
      .attr('transform', function(d){
        var tmp_index = d.row_index;
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
  reset_size_after_update(cgm, duration, delays);

  // enter new elements
  //////////////////////////
  enter_row_groups(params, delays, duration, tip);

  // update existing rows
  make_row_label_container(cgm, duration);
  make_col_label_container(cgm, duration);

  draw_gridlines(params, delays, duration);

  setTimeout(label_constrain_and_trim, 2000, params);

};
