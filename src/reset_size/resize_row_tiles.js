var draw_up_tile = require('../enter/draw_up_tile');
var draw_dn_tile = require('../enter/draw_dn_tile');

module.exports = function resize_row_tiles(params, svg_group){

  var row_nodes = params.network_data.row_nodes;
  var row_nodes_names = _.map(row_nodes, 'name');

  svg_group.selectAll('.row')
    .attr('transform', function(d){
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,'+params.viz.y_scale(tmp_index)+')';
    });

  // reset tiles
  svg_group.selectAll('.row')
    .selectAll('.tile')
    .attr('transform', function(d){
      var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
      var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
      return 'translate('+x_pos+','+y_pos+')';
    })
    .attr('width', params.viz.rect_width)
    .attr('height', params.viz.rect_height);

  // reset tile_up
  svg_group.selectAll('.row')
    .selectAll('.tile_up')
    .attr('d', function(){
      return draw_up_tile(params);
    })
    .attr('transform', function(d) {
      var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
      var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
      return 'translate(' + x_pos + ','+y_pos+')';
    });

  svg_group.selectAll('.row')
    .selectAll('.tile_dn')
    .attr('d', function() {
      return draw_dn_tile(params);
    })
    .attr('transform', function(d) {
      var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
      var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
      return 'translate(' + x_pos + ','+y_pos+')';
    });

};