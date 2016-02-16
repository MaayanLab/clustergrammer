module.exports = function(params, ini_inp_row_data, tip, delays, duration) {

  var inp_row_data = ini_inp_row_data.row_data;

  // remove zero values from
  var row_values = _.filter(inp_row_data, function(num){
    return num.value !=0;
  });

  // bind data to tiles
  var cur_row_tiles = d3.select(this)
    .selectAll('.tile')
    .data(row_values, function(d){
      return d.col_name;
    });

  ///////////////////////////
  // Exit
  ///////////////////////////
  if (delays.run_transition){
    cur_row_tiles
      .exit()
      .transition().duration(300)
      .attr('fill-opacity',0)
      .remove();
  } else {
    cur_row_tiles
      .exit()
      .attr('fill-opacity',0)
      .remove();
  }

  if (params.matrix.tile_type == 'updn'){

    // value split
    var row_split_data = _.filter(inp_row_data, function(num){
      return num.value_up != 0 || num.value_dn !=0 ;
    });

    // tile_up
    var cur_tiles_up = d3.select(this)
      .selectAll('.tile_up')
      .data(row_split_data, function(d){return d.col_name;});

    if (delays.run_transition){
      cur_tiles_up
        .exit()
        .transition().duration(300)
        .attr('fill','0')
        .remove();
    } else {
      cur_tiles_up
        .exit()
        .attr('fill',0)
        .remove();
    }

    // tile_dn
    var cur_tiles_dn = d3.select(this)
      .selectAll('.tile_dn')
      .data(row_split_data, function(d){return d.col_name;});

    if (delays.run_transition){
      cur_tiles_dn
        .exit()
        .transition().duration(300)
        .attr('fill',0)
        .remove();
    } else {
      cur_tiles_dn
        .exit()
        .attr('fill',0)
        .remove();
    }

  }

  ///////////////////////////
  // Update
  ///////////////////////////

  // update tiles in x direction
  var update_row_tiles = cur_row_tiles
    .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll('.row_label_text text')
        .classed('active', function(d) {
          return p.row_name === d.name;
        });

      d3.selectAll('.col_label_text text')
        .classed('active', function(d) {
          return p.col_name === d.name;
        });
      if (params.matrix.show_tile_tooltips){
        tip.show(p);
      }
    })
    .on('mouseout', function mouseout() {
      d3.selectAll('text').classed('active', false);
      if (params.matrix.show_tile_tooltips){
        tip.hide();
      }
    });

  var col_nodes_names = params.network_data.col_nodes_names;

  if (delays.run_transition){
    update_row_tiles
      .transition().delay(delays.update).duration(duration)
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      .attr('transform', function(d) {
        if (_.contains(col_nodes_names, d.col_name)){
          var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
          var x_pos = params.matrix.x_scale(inst_col_index) + 0.5*params.viz.border_width;
          return 'translate(' + x_pos + ',0)';
        }
      });
  } else {
    update_row_tiles
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      .attr('transform', function(d) {
        if (_.contains(col_nodes_names, d.col_name)){
          var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
          var x_pos = params.matrix.x_scale(inst_col_index) + 0.5*params.viz.border_width;
          return 'translate(' + x_pos + ',0)';
        }
      });
  }

  if (params.matrix.tile_type == 'updn'){

    // update split tiles_up
    var update_tiles_up = cur_tiles_up
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
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

    // update split tiles_dn
    var update_tiles_dn = cur_tiles_dn
      .on('mouseover', function(p) {
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return p.row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return p.col_name === d.name;
          });
        if (params.matrix.show_tile_tooltips){
          tip.show(p);
        }
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
        if (params.matrix.show_tile_tooltips){
          tip.hide();
        }
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
          d3.select(this).remove();
        }
      });
  }


  ///////////////////////////
  // Enter
  ///////////////////////////
  // enter new tiles
  var new_tiles = cur_row_tiles
    .enter()
    .append('rect')
    .attr('class', 'tile row_tile')
    .attr('width', params.matrix.rect_width)
    .attr('height', params.matrix.rect_height)
    .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll('.row_label_text text')
        .classed('active', function(d) {
          return p.row_name === d.name;
        });

      d3.selectAll('.col_label_text text')
        .classed('active', function(d) {
          return p.col_name === d.name;
        });
      if (params.matrix.show_tile_tooltips){
        tip.show(p);
      }
    })
    .on('mouseout', function mouseout() {
      d3.selectAll('text').classed('active', false);
      if (params.matrix.show_tile_tooltips){
        tip.hide();
      }
    })
    .attr('fill-opacity',0)
    .attr('transform', function(d){
      var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
      var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
      return 'translate('+x_pos+','+y_pos+')';
    });


  if (delays.run_transition){
    new_tiles
      .transition().delay(delays.enter).duration(duration)
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .attr('fill-opacity',function(d){
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });
  } else {
    new_tiles
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .attr('fill-opacity',function(d){
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      });
  }

  // remove new tiles if necessary
  new_tiles
    .each(function(d){
      if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
        d3.select(this).remove();
      }
    });

  ////////////////////////////////////////////////////
  // need to add split tiles to existing rows
  ////////////////////////////////////////////////////

};
