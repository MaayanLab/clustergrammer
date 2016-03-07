// var utils = require('../utils');
// var get_inst_group = require('./get_inst_group');
// var build_color_groups = require('./build_color_groups');
var calc_dendro_triangles = require('./calc_dendro_triangles');

module.exports = function make_row_dendro(params) {

  var dendro_info = calc_dendro_triangles(params);

  var spillover_width = params.viz.dendro_room.row + params.viz.uni_margin;

  // position row_dendro_outer_container
  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
  var y_offset = params.viz.clust.margin.top;

  if (d3.select(params.root+' .row_dendro_outer_container').empty()){
    d3.select(params.root+' .viz_svg')
      .append('g')
      .attr('class','row_dendro_outer_container')
      .attr('transform', 'translate(' + x_offset + ','+ y_offset +')');

    d3.select(params.root+' .row_dendro_outer_container')
      .append('rect')
      .classed('new_white_bars',true)
      .attr('fill', params.viz.background_color)
      .attr('width', spillover_width + 'px')
      .attr('height', params.viz.svg_dim.height);

    d3.select(params.root+' .row_dendro_outer_container')
      .append('g')
      .attr('class', 'row_dendro_container')
      .attr('transform', 'translate('+params.viz.uni_margin+',0)');

  } else {
    d3.select(params.root+' .viz_svg')
      .select('row_dendro_outer_container')
      .attr('transform', 'translate(' + x_offset + ','+y_offset+')');

    d3.select(params.root+' .row_dendro_outer_container')
      .select('class','new_white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', spillover_width + 'px')
      .attr('height', params.viz.svg_dim.height);      
  }

  // groups that hold classification triangle and colorbar rect
  d3.select(params.root+' .row_dendro_container')
    .selectAll('path')
    .data(dendro_info, function(d){return d.name;})
    .enter()
    .append('path')
    .attr('class', 'row_dendro_group')
    .attr('d', function(d) {

      // up triangle
      var start_x = 0 ;
      var start_y = d.pos_top;
      
      var mid_x = 30;
      var mid_y = d.pos_mid;

      var final_x = 0;
      var final_y = d.pos_bot;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L' 
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('fill','black')
    .attr('opacity',0.35);



  // // groups that hold classification triangle and colorbar rect
  // d3.select(params.root+' .row_dendro_container')
  //   .selectAll('g')
  //   .data(params.network_data.row_nodes, function(d){return d.name;})
  //   .enter()
  //   .append('g')
  //   .attr('class', 'row_dendro_group')
  //   .attr('transform', function(d) {
  //     var inst_index = _.indexOf(params.network_data.row_nodes_names, d.name);
  //     return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
  //   });

  // d3.selectAll(params.root+' .row_dendro_group')
  //   .each(function() {
  
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
  //       .attr('height', params.viz.y_scale.rangeBand())
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
  //         var inst_offset = params.viz.uni_margin;
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
