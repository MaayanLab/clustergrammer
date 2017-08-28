var underscore = require('underscore');

module.exports = function resize_dendro(params, svg_group, delay_info=false){

  // resize dendrogram
  ///////////////////

  var delays = {};

  if (delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }

  var duration = params.viz.duration;
  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = params.network_data.col_nodes_names;

  var dendro_group;
  if (delays.run_transition){

    dendro_group = svg_group
      .transition().delay(delays.update).duration(duration);

    svg_group
      .selectAll('.col_cat_group')
      // data binding needed for loss/gain of columns
      .data(col_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
      });

    svg_group
      .selectAll('.col_dendro_group')
      // data binding needed for loss/gain of columns
      .data(col_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
      });

  } else {

    dendro_group = svg_group;

    svg_group
      .selectAll('.col_cat_group')
      // data binding needed for loss/gain of columns
      .data(col_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
      });

    d3.select(params.root)
      .selectAll('.col_dendro_group')
      // data binding needed for loss/gain of columns
      .data(col_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
        var inst_index = underscore.indexOf(col_nodes_names, d.name);
        return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
      });

  }

  var i;
  var inst_class;

  underscore.each(['row','col'], function(inst_rc){

    var num_cats = params.viz.all_cats[inst_rc].length;

    for (i=0; i<num_cats; i++){
      inst_class = '.'+inst_rc+'_cat_rect_'+String(i);

      if (inst_rc === 'row'){
        dendro_group
          .selectAll(inst_class)
          .attr('height', params.viz.y_scale.rangeBand());
      } else {
        dendro_group
          .selectAll(inst_class)
          .attr('width', params.viz.x_scale.rangeBand());
      }
    }
  });

  // position row_dendro_outer_container
  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
  var y_offset = params.viz.clust.margin.top;
  var spillover_width = params.viz.dendro_room.row + params.viz.uni_margin;

  d3.select(params.root+' .viz_svg')
    .select('row_dendro_outer_container')
    .attr('transform', 'translate(' + x_offset + ','+y_offset+')');

  d3.select(params.root+' .row_dendro_outer_container')
    .select('.row_dendro_spillover')
    .attr('width', spillover_width + 'px')
    .attr('height', params.viz.svg_dim.height);

  x_offset = params.viz.clust.margin.left;
  y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;
  var spillover_height = params.viz.dendro_room.col + params.viz.uni_margin;

  d3.select(params.root+' .col_dendro_outer_container')
      .select('.col_dendro_spillover')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', spillover_height+'px');

  d3.select(params.root+' .col_dendro_outer_container')
    .select('.col_dendro_spillover_top')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', params.viz.svg_dim.height)
    .attr('transform', 'translate(0,'+params.viz.dendro_room.col+')');

  x_offset = params.viz.clust.margin.left;
  y_offset = 0;
  d3.select(params.root+' .col_dendro_icons_container')
    .attr('transform', 'translate('+x_offset+','+y_offset+')');

};