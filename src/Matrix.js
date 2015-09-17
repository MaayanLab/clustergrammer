
function Matrix(network_data, svg_elem, params) {

  var matrix = [],
  row_nodes = network_data.row_nodes,
  col_nodes = network_data.col_nodes,
  clust_group;

  // make the matrix 
  initialize_matrix();

  // append a group that will hold clust_group and position it once
  clust_group = svg_elem
    .append('g')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')')
    .append('g')
    .attr('id', 'clust_group');

  // clustergram background rect 
  clust_group
    .append('rect')
    .attr('class', 'background')
    .attr('id', 'grey_background')
    .style('fill', '#eee')
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  // do the databind 
  var row_groups = clust_group.selectAll('.row')
    .data(matrix)
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('transform', function(d, index) {
      return 'translate(0,' + params.matrix.y_scale(index) + ')';
    });

  // draw rows of clustergram 
  if (params.matrix.tile_type === 'simple') {
    row_groups = row_groups.each(draw_simple_rows);
  } else {
    row_groups = row_groups.each(draw_group_rows);
  }

  // draw grid lines after drawing tiles 
  draw_grid_lines();

  function initialize_matrix() {
    _.each(row_nodes, function(tmp, row_index) {
    matrix[row_index] = d3.range(col_nodes.length).map(function(col_index) {
      return {
      pos_x: col_index,
      pos_y: row_index,
      value: 0
      };
    });
    });

    _.each(network_data.links, function(link) {
      matrix[link.source][link.target].value = link.value;
      // transfer additional link information is necessary
      if (link.value_up && link.value_dn) {
        matrix[link.source][link.target].value_up = link.value_up;
        matrix[link.source][link.target].value_dn = link.value_dn;
      }
      if (link.highlight) {
        matrix[link.source][link.target].highlight = link.highlight;
      }
      if (link.info) {
        matrix[link.source][link.target].info = link.info;
      }
    });

    return matrix;
  }

  function draw_grid_lines() {

    // append horizontal lines 
    clust_group
      .selectAll('.horz_lines')
      .data(row_nodes)
      .enter()
      .append('g')
      .attr('class','horz_lines')
      .attr('transform', function(d, index) {
          return 'translate(0,' + params.matrix.y_scale(index) + ') rotate(0)';
      })
      .append('line')
      .attr('x1',0)
      .attr('x2',params.viz.clust.dim.width)
      .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')
      .style('stroke','white')

    // append vertical line groups
    clust_group
      .selectAll('.vert_lines')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'vert_lines')
      .attr('transform', function(d, index) {
          return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
      })
      .append('line')
      .attr('x1', 0)
      .attr('x2', -params.viz.clust.dim.height)
      .style('stroke-width', params.viz.border_width + 'px')
      .style('stroke', 'white');
  }

  // make each row in the clustergram
  function draw_simple_rows(inp_row_data) {

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // generate tiles in the current row
    var tile = d3.select(this)
      // data join
      .selectAll('rect')
      .data(row_data)
      .enter()
      .append('rect')
      .attr('class', 'tile')
      .attr('transform', function(d) {
      return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      })
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand())
      .style('fill-opacity', function(d) {
        // calculate output opacity using the opacity scale
        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
        return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll('.row_label_text text')
        .classed('active', function(d, i) {
        return i === p.pos_y;
        });
      d3.selectAll('.col_label_text text')
        .classed('active', function(d, i) {
        return i === p.pos_x;
        });
      })
      .on('mouseout', function mouseout() {
      d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
      return d.value;
      });

    // add callback function to tile group - if one is supplied by the user
    if (typeof params.click_tile === 'function') {
      d3.selectAll('.tile')
      .on('click', function(d) {
        // export row/col name and value from tile
        var tile_info = {};
        tile_info.row = params.network_data.row_nodes[d.pos_y].name;
        tile_info.col = params.network_data.col_nodes[d.pos_x].name;
        tile_info.value = d.value;
        if (Utils.has(d, 'value_up')) {
        tile_info.value_up = d.value_up;
        }
        if (Utils.has(d, 'value_dn')) {
        tile_info.value_dn = d.value_dn;
        }
        if (Utils.has(d, 'info')) {
        tile_info.info = d.info;
        }
        // run the user supplied callback function
        params.click_tile(tile_info);
      });
    }

    // append title to group
    if (params.matrix.tile_title) {
      tile
      .append('title')
      .text(function(d) {
        var inst_string = 'value: ' + d.value;
        return inst_string;
      });
    }
  }

  // make each row in the clustergram
  function draw_group_rows(inp_row_data) {

    // remove zero values to make visualization faster
    var row_data = _.filter(inp_row_data, function(num) {
      return num.value !== 0;
    });

    // generate groups
    var tile = d3.select(this)
      // data join
      .selectAll('g')
      .data(row_data)
      .enter()
      .append('g')
      .attr('class', 'tile')
      .attr('transform', function(d) {
      return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      });

    // append rect
    tile
      .append('rect')
      // .attr('class','tile')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand())
      .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
        output_opacity = 0;
      }
      return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function(d) {
        // normal rule
        return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      });

    tile
      .on('mouseover', function(p) {
      // highlight row - set text to active if
      d3.selectAll('.row_label_text text')
        .classed('active', function(d, i) {
        return i === p.pos_y;
        });
      d3.selectAll('.col_label_text text')
        .classed('active', function(d, i) {
        return i === p.pos_x;
        });
      })
      .on('mouseout', function mouseout() {
      d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
      return d.value;
      });


    // // append evidence highlighting - black rects
    if (params.matrix.highlight === 1) {
      // console.log(row_data[0])
      tile
      .append('rect')
      .attr('width', params.matrix.x_scale.rangeBand() * 0.80)
      .attr('height', params.matrix.y_scale.rangeBand() * 0.80)
      .attr('class', 'highlighting_rect')
      .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 10 +
      ' , ' + params.matrix.y_scale.rangeBand() / 10 + ')')
      .attr('class', 'cell_highlight')
      .attr('stroke', 'black')
      .attr('stroke-width', 1.0)
      .attr('fill-opacity', 0.0)
      .attr('stroke-opacity', function(d) {
        // initialize opacity to 0
        var inst_opacity = 0;
        // set opacity to 1 if there is evidence
        if (d.highlight === 1) {
        inst_opacity = 1;
        }
        return inst_opacity;
      });
    }

    // add callback function to tile group - if one is supplied by the user
    if (typeof params.click_tile === 'function') {
      // d3.selectAll('.tile')
      tile
      .on('click', function(d) {
        // export row/col name and value from tile
        var tile_info = {};
        tile_info.row = params.network_data.row_nodes[d.pos_y].name;
        tile_info.col = params.network_data.col_nodes[d.pos_x].name;
        tile_info.value = d.value;
        if (Utils.has(d, 'value_up')) {
        tile_info.value_up = d.value_up;
        }
        if (Utils.has(d, 'value_dn')) {
        tile_info.value_dn = d.value_dn;
        }
        if (Utils.has(d, 'info')) {
        tile_info.info = d.info;
        }
        // run the user supplied callback function
        params.click_tile(tile_info);
      });
    }


    // split-up
    tile
      .append('path')
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .attr('d', function() {
      var start_x = 0;
      var final_x = params.matrix.x_scale.rangeBand();
      var start_y = 0;
      var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
        60;
      var output_string = 'M' + start_x + ',' + start_y + ', L' +
        start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
      return output_string;
      })
      .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = 0;
      if (Math.abs(d.value_dn) > 0) {
        output_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
      }
      return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function() {
        // rl_t (released) blue
        return params.matrix.tile_colors[0];
      });


    // split-dn
    tile
      .append('path')
      .style('stroke', 'black')
      .style('stroke-width', 0)
      .attr('d', function() {
      var start_x = 0;
      var final_x = params.matrix.x_scale.rangeBand();
      var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
        60;
      var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand() /
        60;
      var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
        final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
      return output_string;
      })
      .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = 0;
      if (Math.abs(d.value_up) > 0) {
        output_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
      }
      return output_opacity;
      })
      // switch the color based on up/dn value
      .style('fill', function() {
        return params.matrix.tile_colors[1];
      });

    // append title to group
    if (params.matrix.tile_title) {
      tile
      .append('title')
      .text(function(d) {
        var inst_string = 'value: ' + d.value;
        return inst_string;
      });
    }
    }

  // Matrix API 
  return {
    get_clust_group: function() {
      return clust_group;
    },
    get_matrix: function(){
      return matrix;
    },
    get_nodes: function(type){
      if (type === 'row'){
      var nodes = network_data.row_nodes;
      } else {
      var nodes = network_data.col_nodes;
      }
      return nodes;
    }
  }

}
