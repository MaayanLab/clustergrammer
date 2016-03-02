module.exports = function update_split_tiles(params, inp_row_data, row_selection, delays, duration, cur_row_tiles){

  // value split
  var row_split_data = _.filter(inp_row_data, function(num){
    return num.value_up != 0 || num.value_dn !=0 ;
  });

  // tile_up
  var cur_tiles_up = d3.select(row_selection)
    .selectAll('.tile_up')
    .data(row_split_data, function(d){return d.col_name;});


  // update split tiles_up
  var update_tiles_up = cur_tiles_up
    .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll(params.root+' .row_label_group text')
        .classed('active', function(d) {
          return p.row_name === d.name;
        });

      d3.selectAll(params.root+' .col_label_text text')
        .classed('active', function(d) {
          return p.col_name === d.name;
        });
      // if (params.matrix.show_tile_tooltips){
      //   tip.show(p);
      // }
    })
    .on('mouseout', function mouseout() {
      d3.selectAll(params.root+' text').classed('active', false);
      // if (params.matrix.show_tile_tooltips){
      //   tip.hide();
      // }
    });

  if (delays.run_transition){
    update_tiles_up
      .transition().delay(delays.update).duration(duration)
      .attr('d', function() {
        // up triangle
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = 0;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
        var output_string = 'M' + start_x + ',' + start_y + ', L' +
        start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
        return output_string;
      })
      .attr('transform', function(d) {
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      });
  } else {
    update_tiles_up
      .attr('d', function() {
        // up triangle
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = 0;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
        var output_string = 'M' + start_x + ',' + start_y + ', L' +
        start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
        return output_string;
      })
      .attr('transform', function(d) {
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      });
  }

  // tile_dn
  var cur_tiles_dn = d3.select(row_selection)
    .selectAll('.tile_dn')
    .data(row_split_data, function(d){return d.col_name;});

  // update split tiles_dn
  var update_tiles_dn = cur_tiles_dn
    .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll(params.root+' .row_label_group text')
        .classed('active', function(d) {
          return p.row_name === d.name;
        });

      d3.selectAll(params.root+' .col_label_text text')
        .classed('active', function(d) {
          return p.col_name === d.name;
        });
      // if (params.matrix.show_tile_tooltips){
      //   tip.show(p);
      // }
    })
    .on('mouseout', function mouseout() {
      d3.selectAll(params.root+' text').classed('active', false);
      // if (params.matrix.show_tile_tooltips){
      //   tip.hide();
      // }
    });

  if (delays.run_transition){
    update_tiles_dn
      .transition().delay(delays.update).duration(duration)
      .attr('d', function() {
          // dn triangle
          var start_x = 0;
          var final_x = params.matrix.x_scale.rangeBand();
          var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
          var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
          var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
          return output_string;
        })
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        });
  } else {
    update_tiles_dn
      .attr('d', function() {
        // dn triangle
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /60;
        var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
        final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
        return output_string;
      })
      .attr('transform', function(d) {
        var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
        var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
        return 'translate(' + x_pos + ','+y_pos+')';
      });
  }

  // remove tiles when splitting is done
  cur_row_tiles
    .selectAll('.tile')
    .each(function(d){
      if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
        d3.select(this)
          .remove();
      }
    });
};