var draw_up_tile = require('../enter/draw_up_tile');
var draw_dn_tile = require('../enter/draw_dn_tile');
var fine_position_tile = require('../matrix/fine_position_tile');
var underscore = require('underscore');

module.exports = function resize_row_tiles(params, svg_group){

  var row_nodes_names = params.network_data.row_nodes_names;


  if (params.viz.ds_level === -1){

    // no downsampling
    ///////////////////////

    // resize rows
    svg_group.selectAll('.row')
      .attr('transform', function(d){
        var tmp_index = underscore.indexOf(row_nodes_names, d.name);
        var inst_y = params.viz.y_scale(tmp_index);
        return 'translate(0,'+inst_y+')';
      });

    // resize tiles
    svg_group.selectAll('.row')
      .selectAll('.tile')
      .attr('transform', function(d){
        return fine_position_tile(params, d);
      })
      .attr('width', params.viz.rect_width)
      .attr('height', params.viz.rect_height);

    // resize tile_up
    svg_group.selectAll('.row')
      .selectAll('.tile_up')
      .attr('d', function(){
        return draw_up_tile(params);
      })
      .attr('transform', function(d) {
        return fine_position_tile(params, d);
      });

    // resize tile_dn
    svg_group.selectAll('.row')
      .selectAll('.tile_dn')
      .attr('d', function() {
        return draw_dn_tile(params);
      })
      .attr('transform', function(d) {
        return fine_position_tile(params, d);
      });

    } else {

      // downsampling
      /////////////////////////

      var ds_level = params.viz.ds_level;
      var row_class = '.ds'+ String(ds_level) + '_row';
      var ds_rect_height = params.viz.ds[ds_level].rect_height;

      svg_group.selectAll(row_class)
        .attr('transform', function(d){
          var inst_y = params.viz.ds[ds_level].y_scale(d.row_index);
          return 'translate(0,'+inst_y+')';
        });

      // reset ds-tiles
      svg_group.selectAll(row_class)
        .selectAll('.tile')
        .attr('transform', function(d){
          return fine_position_tile(params, d);
        })
        .attr('width', params.viz.rect_width)
        .attr('height', ds_rect_height);


    }

};
