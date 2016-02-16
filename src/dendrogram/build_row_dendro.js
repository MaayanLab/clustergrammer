var Params = require('../params');
var get_inst_group = require('./get_inst_group');
var group_colors = require('./group_colors');

module.exports = function(dom_class) {
  var params = Params.get();

  d3.selectAll('.row_viz_group')
    .each(function() {

      var inst_level = params.group_level.row;

      var dendro_rect = d3.select(this)
        .append('rect')
        .attr('class', dom_class)
        .attr('width', function() {
          var inst_width = params.class_room.symbol_width - 1;
          return inst_width + 'px';
        })
        .attr('height', params.matrix.y_scale.rangeBand())
        .style('fill', function(d) {
          if (_.has(d,'group')){
            var inst_color = group_colors.get_group_color(d.group[inst_level]);
          } else {
            inst_color = '#eee';
          }

          return inst_color;
        })
        .attr('x', function() {
          var inst_offset = params.class_room.symbol_width + 1;
          return inst_offset + 'px';
        });

      // show group in modal
      if (typeof params.click_group === 'function'){
        dendro_rect
          .on('click', function(d){
            var group_nodes_list = get_inst_group('row',d);
            params.click_group('row', group_nodes_list);
          });
      }

    });

};
