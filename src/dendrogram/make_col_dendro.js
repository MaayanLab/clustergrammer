var utils = require('../utils');
var get_inst_group = require('./get_inst_group');
var build_color_groups = require('./build_color_groups');

module.exports = function make_col_dendro(params) {

  var x_offset = params.viz.clust.margin.left;
  var y_offset = params.viz.clust.margin.top + 
    params.viz.clust.dim.height;

  // make or reuse outer container 
  if (d3.select(params.root+' .col_dendro_outer_container').empty()){

    d3.select(params.root+' .viz_svg')
      .append('g')
      .attr('class', 'col_dendro_outer_container')
      .attr('transform', function () {
        return 'translate('+x_offset+','+y_offset+')'; 
      })
      .append('g')
      .attr('class', 'col_dendro_container');
  } else {
    d3.select(params.root+' .viz_svg')
      .select('col_dendro_outer_container')
      .attr('transform', function () {
        return 'translate('+x_offset+','+y_offset+')'; 
      }); 
  }
  
  // white background 
  var spillover_height = params.viz.dendro_room.col + params.viz.uni_margin;
  if (d3.select(params.root+' .col_dendro_container').select('.white_bars').empty()){
    d3.select(params.root+' .col_dendro_container')
      .append('rect')
      .attr('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', spillover_height + 'px');
  } else {
    d3.select(params.root+' .col_dendro_container')
      .select('class','white_bars')
      .attr('fill', params.viz.background_color)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', spillover_height + 'px');
  }  

  // append groups - each will hold a classification rect
  d3.select(params.root+' .col_dendro_container')
    .selectAll('g')
    .data(params.network_data.col_nodes, function(d){ return d.name; })
    .enter()
    .append('g')
    .attr('class', 'col_dendro_group')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(params.network_data.col_nodes_names, d.name);
      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
    });

  d3.selectAll(params.root+' .col_dendro_group')
    .each(function() {

      var inst_level = params.group_level.col;

      var cat_rect;
      if (d3.select(this).select('.col_dendro_rect').empty()){
        cat_rect = d3.select(this)
          .append('rect')
          .attr('class', 'col_dendro_rect');
      } else {
        cat_rect = d3.select(this)
          .select('.col_dendro_rect');
      }

      cat_rect
        .attr('width', params.viz.x_scale.rangeBand())
        .attr('height', function() {
          var inst_height = params.viz.cat_room.col - 1;
          return inst_height;
        })
        .attr('y',params.viz.uni_margin)
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
        cat_rect
          .on('click',function(d){
            var group_nodes_list = get_inst_group(params, 'col', d);
            params.click_group('col', group_nodes_list);
          });
      }

  });

};
