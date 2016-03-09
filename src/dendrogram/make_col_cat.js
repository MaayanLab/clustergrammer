// var utils = require('../utils');
// var get_inst_group = require('./get_inst_group');
// var build_color_groups = require('./build_color_groups');

module.exports = function make_col_cat(params) {

  // make or reuse outer container 
  if (d3.select(params.root+' .col_cat_outer_container').empty()){
    d3.select(params.root+' .col_container')
      .append('g')
      .attr('class', 'col_cat_outer_container')
      .attr('transform', function () {
        var inst_offset = params.viz.norm_labels.width.col + 2; 
        return 'translate(0,' + inst_offset + ')'; 
      })
      .append('g')
      .attr('class', 'col_cat_container');
  } else {
    d3.select(params.root+' .col_container')
      .select('col_cat_outer_container')
      .attr('transform', function () {
        var inst_offset = params.viz.norm_labels.width.col + 2; 
        return 'translate(0,' + inst_offset + ')'; 
      });
  }
  
  // append groups - each will hold a classification rect
  d3.select(params.root+' .col_cat_container')
    .selectAll('g')
    .data(params.network_data.col_nodes, function(d){ return d.name; })
    .enter()
    .append('g')
    .attr('class', 'col_cat_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(params.network_data.col_nodes_names, d.name);
      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
    });

  d3.selectAll(params.root+' .col_cat_group')
    .each(function() {

      var cat_rect;
      if (d3.select(this).select('.col_cat_rect').empty()){
        cat_rect = d3.select(this)
          .append('rect')
          .attr('class', 'col_cat_rect');
      } else {
        cat_rect = d3.select(this)
          .select('.col_cat_rect');
      }

      cat_rect
        .attr('width', params.viz.x_scale.rangeBand())
        .attr('height', function() {
          var inst_height = params.viz.cat_room.col - 1;
          return inst_height;
        })
        .style('fill', function(d) {
          return params.viz.cat_colors.col[d.cat];
        });

      // if (typeof params.click_group === 'function'){
      //   cat_rect
      //     .on('click',function(d){
      //       var group_nodes_list = get_inst_group(params, 'col', d);
      //       params.click_group('col', group_nodes_list);
      //     });
      // }

  });
};
