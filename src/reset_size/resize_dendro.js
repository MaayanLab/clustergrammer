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
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
        });

      svg_group
        .selectAll('.col_dendro_group')
        // data binding needed for loss/gain of columns
        .data(col_nodes, function(d){return d.name;})
        .transition().delay(delays.update).duration(duration)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
        });        

    } else {

      dendro_group = svg_group;

      svg_group
        .selectAll('.col_cat_group')
        // data binding needed for loss/gain of columns
        .data(col_nodes, function(d){return d.name;})
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
        });

      d3.select(params.root)
        .selectAll('.col_dendro_group')
        // data binding needed for loss/gain of columns
        .data(col_nodes, function(d){return d.name;})
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
        });        

    }

    dendro_group
      .selectAll('.row_cat_rect')
      .attr('width', function() {
        var inst_width = params.viz.cat_room.symbol_width - 1;
        return inst_width + 'px';
      })
      .attr('height', params.viz.y_scale.rangeBand())
      .attr('x', function() {
        var inst_offset = params.viz.cat_room.symbol_width + 1;
        return inst_offset + 'px';
      });

    var num_col_cats = params.viz.all_cats.col.length;

    for (var i=0; i<num_col_cats; i++){
      var inst_class = '.col_cat_rect_'+String(i);
      dendro_group
        .selectAll(inst_class)
        .attr('width', params.viz.x_scale.rangeBand())
        .attr('height', function() {
          var inst_height = params.viz.cat_room.symbol_width - 1;
          return inst_height;
        });
    }

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
    .attr('height', '30px')
    .attr('transform', 'translate(0,'+params.viz.dendro_room.col+')');

}; 