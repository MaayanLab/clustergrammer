var utils = require('../utils');
var get_inst_group = require('./get_inst_group');
var build_color_groups = require('./build_color_groups');

module.exports = function make_col_dendro(params) {
  
  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = _.pluck(col_nodes, 'name');

  // append groups - each will hold a classification rect
  // this is done differently for the rows 
  d3.select(params.root+' .col_cat_container')
    .selectAll('g')
    .data(col_nodes, function(d){ return d.name; })
    .enter()
    .append('g')
    .attr('class', 'col_cat_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
    });

  d3.selectAll(params.root+' .col_cat_group')
    .each(function() {

      var inst_level = params.group_level.col;

      var dendro_rect;
      if (d3.select(this).select('.col_cat_rect').empty()){
        dendro_rect = d3.select(this)
          .append('rect')
          .attr('class', 'col_cat_rect');
      } else {
        dendro_rect = d3.select(this)
          .select('.col_cat_rect');
      }

      dendro_rect
        .attr('width', params.matrix.x_scale.rangeBand())
        .attr('height', function() {
          var inst_height = params.cat_room.col - 1;
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
