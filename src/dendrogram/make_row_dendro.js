// var utils = require('../utils');
// var get_inst_group = require('./get_inst_group');
// var build_color_groups = require('./build_color_groups');

module.exports = function make_row_dendro(params) {

  // position row dendro at the right of the clustergram 
  var x_offset = params.labels.super_label_width + 
    params.norm_label.width.row + 
    params.viz.clust.dim.width + 5;

  if (d3.select(params.root+' .row_dendro_outer_container').empty()){
    d3.select(params.root+' .row_container')
      .append('g')
      .attr('class','row_dendro_outer_container')
      .attr('transform', 'translate(' + x_offset + ',0)')
      .append('g')
      .attr('class', 'row_dendro_container');
  } else {
    d3.select(params.root+' .row_container')
      .select('row_dendro_outer_container')
      .attr('transform', 'translate(' + x_offset + ',0)');
  }

  // white background 
  if (d3.select(params.root+' .row_dendro_container').select('.white_bars').empty()){
    d3.select(params.root+' .row_dendro_container')
      .append('rect')
      .attr('class','white_bars')
      // .attr('fill', params.viz.background_color)
      .attr('fill','green')
      .attr('width', params.viz.cat_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });
  } else {
    d3.select(params.root+' .row_dendro_container')
      .select('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.cat_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });
  }

  // // groups that hold classification triangle and colorbar rect
  // d3.select(params.root+' .row_dendro_container')
  //   .selectAll('g')
  //   .data(params.network_data.row_nodes, function(d){return d.name;})
  //   .enter()
  //   .append('g')
  //   .attr('class', 'row_dendro_group')
  //   .attr('transform', function(d) {
  //     var inst_index = _.indexOf(params.network_data.row_nodes_names, d.name);
  //     return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
  //   });

  // d3.selectAll(params.root+' .row_dendro_group')
  //   .each(function() {
  
  //     var inst_level = params.group_level.row;

  //     var cat_rect;
  //     if (d3.select(this).select('.row_dendro_rect').empty()){
  //       cat_rect = d3.select(this)
  //         .append('rect')
  //         .attr('class', 'row_dendro_rect');
  //     } else {
  //       cat_rect = d3.select(this)
  //         .select('.row_dendro_rect');
  //     }

  //     cat_rect
  //       .attr('width', function() {
  //         var inst_width = params.viz.cat_room.symbol_width - 1;
  //         return inst_width + 'px';
  //       })
  //       .attr('height', params.matrix.y_scale.rangeBand())
  //       .style('fill', function(d) {
  //         if (utils.has(d,'group')){
  //           var group_colors = build_color_groups(params);
  //           var inst_color = group_colors[d.group[inst_level]];
  //         } else {
  //           inst_color = '#eee';
  //         }
  //         return inst_color;
  //       })
  //       .attr('x', function() {
  //         var inst_offset = params.viz.cat_room.symbol_width + 1;
  //         return inst_offset + 'px';
  //       });

  //     // show group in modal
  //     if (typeof params.click_group === 'function'){
  //       cat_rect
  //         .on('click', function(d){
  //           var group_nodes_list = get_inst_group(params, 'row', d);
  //           params.click_group('row', group_nodes_list);
  //         });
  //     }

  //   });
 
};
