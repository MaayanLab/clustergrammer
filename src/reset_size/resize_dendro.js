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

  // var row_nodes = params.network_data.row_noes;
  // var row_nodes_names = params.network_data.row_nodes_names;

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
          return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
        });

    } else {

      dendro_group = svg_group;

      svg_group
        .selectAll('.col_cat_group')
        // data binding needed for loss/gain of columns
        .data(col_nodes, function(d){return d.name;})
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ',0)';
        });

    }

    dendro_group
      .selectAll('.row_cat_rect')
      .attr('width', function() {
        var inst_width = params.cat_room.symbol_width - 1;
        return inst_width + 'px';
      })
      .attr('height', params.matrix.y_scale.rangeBand())
      .attr('x', function() {
        var inst_offset = params.cat_room.symbol_width + 1;
        return inst_offset + 'px';
      });

    dendro_group
      .selectAll('.col_cat_rect')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', function() {
        var inst_height = params.cat_room.col - 1;
        return inst_height;
      });

  }; 