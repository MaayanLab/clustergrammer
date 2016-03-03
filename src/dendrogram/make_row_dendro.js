var utils = require('../utils');
var get_inst_group = require('./get_inst_group');
var build_color_groups = require('./build_color_groups');

module.exports = function make_row_dendro(params) {

  // groups that hold classification triangle and colorbar rect
  var row_cat_group = d3.select(params.root+' .row_cat_container')
    .selectAll('g')
    .data(params.network_data.row_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'row_cat_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(params.network_data.row_nodes_names, d.name);
      return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
    });

  d3.selectAll(params.root+' .row_cat_group')
    .each(function() {
  
      var inst_level = params.group_level.row;

      var dendro_rect;
      if (d3.select(this).select('.row_cat_rect').empty()){
        dendro_rect = d3.select(this)
          .append('rect')
          .attr('class', 'row_cat_rect');
      } else {
        dendro_rect = d3.select(this)
          .select('.row_cat_rect');
      }

      dendro_rect
        .attr('width', function() {
          var inst_width = params.cat_room.symbol_width - 1;
          return inst_width + 'px';
        })
        .attr('height', params.matrix.y_scale.rangeBand())
        .style('fill', function(d) {
          if (utils.has(d,'group')){
            var group_colors = build_color_groups(params);
            var inst_color = group_colors[d.group[inst_level]];
          } else {
            inst_color = '#eee';
          }
          return inst_color;
        })
        .attr('x', function() {
          var inst_offset = params.cat_room.symbol_width + 1;
          return inst_offset + 'px';
        });

      // show group in modal
      if (typeof params.click_group === 'function'){
        dendro_rect
          .on('click', function(d){
            var group_nodes_list = get_inst_group(params, 'row', d);
            params.click_group('row', group_nodes_list);
          });
      }

    });


  // add row triangles
  row_cat_group
    .append('path')
    .attr('d', function() {
      var origin_x = params.cat_room.symbol_width - 1;
      var origin_y = 0;
      var mid_x = 1;
      var mid_y = params.matrix.y_scale.rangeBand() / 2;
      var final_x = params.cat_room.symbol_width - 1;
      var final_y = params.matrix.y_scale.rangeBand();
      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
        mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
      return output_string;
    })
    .attr('fill', function(d) {
      // initailize color
      var inst_color = '#eee';
      if (params.labels.show_categories) {
        inst_color = params.labels.class_colors.row[d.cl];
      }
      return inst_color;
    });

};
