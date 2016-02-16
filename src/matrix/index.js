var utils = require('../utils');
var draw_gridlines = require('../draw_gridlines');
// var make_simple_rows = require('./make_simple_rows');
var add_click_hlight = require('./add_click_hlight');

module.exports = function(params, svg_elem) {
  var network_data = params.network_data;

  var matrix = [],
  row_nodes = network_data.row_nodes,
  col_nodes = network_data.col_nodes,
  clust_group;

  var row_nodes_names = _.pluck(row_nodes, 'name');
  var col_nodes_names = _.pluck(col_nodes, 'name');

  // append a group that will hold clust_group and position it once
  clust_group = svg_elem
    .append('g')
    .attr('class','clust_container')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')')
    .append('g')
    .attr('class', 'clust_group');

  if (params.matrix.show_tile_tooltips){
    // d3-tooltip - for tiles
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('n')
      .offset([0, 0])
      .html(params.matrix.make_tile_tooltip);
    d3.select(params.root+' .clust_group')
      .call(tip);
  }

  // clustergram background rect
  clust_group
    .append('rect')
    .classed('background',true)
    .classed('grey_background',true)
    .style('fill', '#eee')
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

    function make_simple_rows(ini_inp_row_data) {
      var inp_row_data = ini_inp_row_data.row_data;

      // value: remove zero values to make visualization faster
      var row_values = _.filter(inp_row_data, function(num) {
        return num.value !== 0;
      });

      // generate tiles in the current row
      var tile = d3.select(this)
        .selectAll('rect')
        .data(row_values, function(d){ return d.col_name; })
        .enter()
        .append('rect')
        .attr('class', 'tile row_tile')
        .attr('width', params.matrix.rect_width)
        .attr('height', params.matrix.rect_height)
        // switch the color based on up/dn value
        .style('fill', function(d) {
          return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
        })
        .on('mouseover', function(p) {

          // highlight row - set text to active if
          d3.selectAll('.row_label_text text')
            .classed('active', function(d) {
              return p.row_name.replace(/_/g, ' ') === d.name;
            });

          d3.selectAll('.col_label_text text')
            .classed('active', function(d) {
              return p.col_name === d.name;
            });

          if (params.matrix.show_tile_tooltips){
            tip.show(p);
          }

        })
        .on('mouseout', function(d) {
          d3.selectAll('text').classed('active', false);
          if (params.matrix.show_tile_tooltips){
            tip.hide();
          }
        })
        .attr('title', function(d) {
          return d.value;
        })
        .style('fill-opacity', function(d) {
          // calculate output opacity using the opacity scale
          var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
          return output_opacity;
        })
        .attr('transform', function(d) {
          var x_pos = params.matrix.x_scale(d.pos_x) + 0.5*params.viz.border_width;
          var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
          return 'translate(' + x_pos + ','+y_pos+')';
        });

      if (params.matrix.tile_type == 'updn'){

        // value split
        var row_split_data = _.filter(inp_row_data, function(num){
          return num.value_up != 0 || num.value_dn !=0 ;
        });

        // tile_up
        d3.select(this)
          .selectAll('.tile_up')
          .data(row_split_data, function(d){return d.col_name;})
          .enter()
          .append('path')
          .attr('class','tile_up')
          .attr('d', function(d) {

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
          })
          .style('fill', function() {
            return params.matrix.tile_colors[0];
          })
          .style('fill-opacity',function(d){
            var inst_opacity = 0;
            if (Math.abs(d.value_dn)>0){
              inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
            }
            return inst_opacity;
          })
          .on('mouseover', function(p) {
          // highlight row - set text to active if
          d3.selectAll('.row_label_text text')
            .classed('active', function(d) {
              return p.row_name.replace(/_/g, ' ') === d.name;
            });

          d3.selectAll('.col_label_text text')
            .classed('active', function(d) {
              return p.col_name === d.name;
            });
          if (params.matrix.show_tile_tooltips){
            tip.show(p);
          }
        })
        .on('mouseout', function(d) {
          d3.selectAll('text').classed('active', false);
          if (params.matrix.show_tile_tooltips){
            tip.hide();
          }
        });

        // tile_dn
        d3.select(this)
          .selectAll('.tile_dn')
          .data(row_split_data, function(d){return d.col_name;})
          .enter()
          .append('path')
          .attr('class','tile_dn')
          .attr('d', function(d) {

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
          })
          .style('fill', function() {
            return params.matrix.tile_colors[1];
          })
          .style('fill-opacity',function(d){
            var inst_opacity = 0;
            if (Math.abs(d.value_up)>0){
              inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
            }
            return inst_opacity;
          })
          .on('mouseover', function(p) {
          // highlight row - set text to active if
          d3.selectAll('.row_label_text text')
            .classed('active', function(d) {
              return p.row_name.replace(/_/g, ' ') === d.name;
            });

          d3.selectAll('.col_label_text text')
            .classed('active', function(d) {
              return p.col_name === d.name;
            });
          if (params.matrix.show_tile_tooltips){
            tip.show(p);
          }
        })
        .on('mouseout', function(d) {
          d3.selectAll('text').classed('active', false);
          if (params.matrix.show_tile_tooltips){
            tip.hide();
          }
        });

        // remove tiles when splitting is done
        tile
          .each(function(d){
            if ( Math.abs(d.value_up)>0 && Math.abs(d.value_dn)>0 ){
              d3.select(this).remove();
            }
          });

      }

      // append title to group
      if (params.matrix.tile_title) {
        tile.append('title')
        .text(function(d) {
          var inst_string = 'value: ' + d.value;
          return inst_string;
        });
      }

    };


  // make row matrix - add key names to rows in matrix
  var row_groups = clust_group.selectAll('.row')
    .data(params.matrix.matrix, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'row')
    .attr('transform', function(d) {
      var tmp_index = _.indexOf(row_nodes_names, d.name);
      return 'translate(0,' + params.matrix.y_scale(tmp_index) + ')';
    })
    .each(make_simple_rows);

  // add callback function to tile group - if one is supplied by the user
  if (typeof params.click_tile === 'function') {
    d3.selectAll('.tile')
    .on('click', function(d) {

      // export row/col name and value from tile
      var tile_info = {};
      tile_info.row = params.network_data.row_nodes[d.pos_y].name;
      tile_info.col = params.network_data.col_nodes[d.pos_x].name;
      tile_info.value = d.value;

      if (utils.has(d, 'value_up')) {
        tile_info.value_up = d.value_up;
      }
      if (utils.has(d, 'value_dn')) {
        tile_info.value_dn = d.value_dn;
      }
      if (utils.has(d, 'info')) {
        tile_info.info = d.info;
      }
      // run the user supplied callback function
      params.click_tile(tile_info);
      add_click_hlight(params, this);

    });

  } else {

    // highlight clicked tile
    if (params.tile_click_hlight){
      d3.selectAll('.tile')
        .on('click',function() {
          add_click_hlight(params, this);
        });
    }
  }

  // draw grid lines after drawing tiles
  draw_gridlines(params, row_nodes, col_nodes);

  // Matrix API
  return {
    get_clust_group: function() {
      return clust_group;
    },
    get_matrix: function(){
      return matrix;
    },
    get_nodes: function(type){
      if (type === 'row') {
        return network_data.row_nodes;
      }
      return network_data.col_nodes;
    }
  };

};
