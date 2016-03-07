var utils = require('../utils');
var get_inst_group = require('./get_inst_group');
var build_color_groups = require('./build_color_groups');

module.exports = function make_row_dendro(params) {

  var inst_level = params.group_level.row;

  // console.log('working on row dendro triangles')
  var row_nodes = params.network_data.row_nodes;

  var triangle_info = {};

  _.each(row_nodes, function(d){

    var tmp_group = d.group[inst_level];

    var inst_index = _.indexOf(params.network_data.row_nodes_names, d.name);
    var inst_top = params.viz.y_scale(inst_index);
    var inst_bot = inst_top + params.viz.y_scale.rangeBand();

    if ( _.has(triangle_info, tmp_group) == false ){
      triangle_info[tmp_group] = {};
      triangle_info[tmp_group].name_top = d.name;
      triangle_info[tmp_group].name_bot = d.name;
      triangle_info[tmp_group].pos_top = inst_top;
      triangle_info[tmp_group].pos_bot = inst_bot;
      triangle_info[tmp_group].pos_mid = (inst_top + inst_bot)/2;
    } 

    if (inst_top < triangle_info[tmp_group].pos_top){
      triangle_info[tmp_group].name_top = d.name;
      triangle_info[tmp_group].pos_top = inst_top;
      triangle_info[tmp_group].pos_mid = (inst_top + triangle_info[tmp_group].pos_bot)/2;
    }

    if (inst_bot > triangle_info[tmp_group].pos_bot){
      triangle_info[tmp_group].name_bot = d.name;
      triangle_info[tmp_group].pos_bot = inst_bot;
      triangle_info[tmp_group].pos_mid = (triangle_info[tmp_group].pos_top + inst_bot)/2;
    }

  });

  var triangle_array = [];
  
  _.each(triangle_info, function(d){
    triangle_array.push(d);
  })

  console.log(triangle_array)

  // position row dendro at the right of the clustergram 
  var x_offset = params.viz.clust.margin.left +
    params.viz.clust.dim.width;
  // move to the same position as the clustergram 
  // var y_offset = params.viz.clust.margin.top;
  var y_offset = params.viz.clust.margin.top;

  if (d3.select(params.root+' .row_dendro_outer_container').empty()){
    d3.select(params.root+' .viz_svg')
      .append('g')
      .attr('class','row_dendro_outer_container')
      .attr('transform', 'translate(' + x_offset + ','+ y_offset +')')
      .append('g')
      .attr('class', 'row_dendro_container');
  } else {
    d3.select(params.root+' .viz_svg')
      .select('row_dendro_outer_container')
      .attr('transform', 'translate(' + x_offset + ',0)');
  }

  // white background 
  var spillover_width = params.viz.dendro_room.row + params.viz.uni_margin;
  if (d3.select(params.root+' .row_dendro_container').select('.white_bars').empty()){
    d3.select(params.root+' .row_dendro_container')
      .append('rect')
      .attr('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', spillover_width + 'px')
      .attr('height', params.viz.svg_dim.height);
  } else {
    d3.select(params.root+' .row_dendro_container')
      .select('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', spillover_width + 'px')
      .attr('height', params.viz.svg_dim.height);
  }

  // groups that hold classification triangle and colorbar rect
  d3.select(params.root+' .row_dendro_container')
    .selectAll('path')
    .data(triangle_array)
    .enter()
    .append('path')
    .attr('class', 'row_dendro_group')
    .attr('d', function(d) {

      // up triangle
      var start_x = params.viz.uni_margin ;
      var start_y = d.pos_top;
      
      var mid_x = params.viz.uni_margin + 30;
      var mid_y = d.pos_mid;

      var final_x = params.viz.uni_margin;
      var final_y = d.pos_bot;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L' 
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .style('fill','black')
    .attr('opacity',0.35)

    // .attr('transform', function(d) {
    //   var inst_index = _.indexOf(params.network_data.row_nodes_names, d.name);
    //   return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
    // });



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
