var utils = require('../utils');
var get_inst_group = require('./get_inst_group');
var build_color_groups = require('./build_color_groups');

module.exports = function (params, dom_class) {
  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = _.pluck(col_nodes, 'name');

  // append groups - each will hold a classification rect
  d3.select('.col_viz_zoom_container')
    .selectAll('g')
    .data(col_nodes, function(d){ return d.name; })
    .enter()
    .append('g')
    .attr('class', 'col_viz_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
    });

  d3.selectAll('.col_viz_group')
    .each(function() {

      var inst_level = params.group_level.col;

      var dendro_rect = d3.select(this)
        .append('rect')
        .attr('class', dom_class)
        .attr('width', params.matrix.x_scale.rangeBand())
        .attr('height', function() {
          var inst_height = params.class_room.col - 1;
          return inst_height;
        })
        .style('fill', function(d) {
          if (utils.has(d,'group')){
            var group_colors = build_color_groups(params);
            var inst_color = group_colors[d.group[inst_level]];
          } else {
            inst_color = '#eee';
          }
          return inst_color;
        });

      if (typeof params.click_group === 'function'){
        dendro_rect
          .on('click',function(d){
            var group_nodes_list = get_inst_group(params, 'col', d);
            params.click_group('col', group_nodes_list);
          });
      }

  });
};
