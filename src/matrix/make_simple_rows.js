var draw_up_tile = require('../enter/draw_up_tile');
var draw_dn_tile = require('../enter/draw_dn_tile');
var mouseover_tile = require('./mouseover_tile');
var mouseout_tile = require('./mouseout_tile');

module.exports = function make_simple_rows(params, ini_inp_row_data, tip, row_selection) {

  var inp_row_data = ini_inp_row_data.row_data;

  // value: remove zero values to make visualization faster
  var row_values = _.filter(inp_row_data, function(num) {
    return num.value !== 0;
  });


  // generate tiles in the current row
  var tile = d3.select(row_selection)
    .selectAll('rect')
    .data(row_values, function(d){ return d.col_name; })
    .enter()
    .append('rect')
    .attr('class', 'tile row_tile')
    .attr('width', params.viz.rect_width)
    .attr('height', params.viz.rect_height)
    // switch the color based on up/dn value
    .style('fill', function(d) {
      return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
    })
    .on('mouseover', function(...args) {
        mouseover_tile(params, this, tip, args);
    })
    .on('mouseout', function() {
      mouseout_tile(params, this, tip);
    })
    .style('fill-opacity', function(d) {
      // calculate output opacity using the opacity scale
      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
      return output_opacity;
    })
    .attr('transform', function(d) {
      var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
      var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch;
      return 'translate(' + x_pos + ','+y_pos+')';
    });


  // // tile circles 
  // /////////////////////////////
  // var tile = d3.select(row_selection)
  //   .selectAll('circle')
  //   .data(row_values, function(d){ return d.col_name; })
  //   .enter()
  //   .append('circle')
  //   .attr('cx', params.viz.rect_height/4)
  //   .attr('cy', params.viz.rect_height/4)
  //   .attr('r', params.viz.rect_height/4)
  //   .attr('class', 'tile_circle')
  //   // .attr('width', params.viz.rect_width/2)
  //   // .attr('height', params.viz.rect_height/2)
  //   // // switch the color based on up/dn value
  //   // .style('fill', function(d) {
  //   //   // return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
  //   //   return 'black';
  //   // })
  //   // .on('mouseover', function(...args) {
  //   //     mouseover_tile(params, this, tip, args);
  //   // })
  //   // .on('mouseout', function() {
  //   //   mouseout_tile(params, this, tip);
  //   // })
  //   .style('fill-opacity', function(d) {
  //     // calculate output opacity using the opacity scale
  //     var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
  //     if (output_opacity < 0.3){
  //       output_opacity = 0;
  //     } else if (output_opacity < 0.6){
  //       output_opacity = 0.35;
  //     } else {
  //       output_opacity = 1;
  //     }
  //     return output_opacity;
  //     // return 0.1;
  //   })
  //   .attr('transform', function(d) {
  //     var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width + params.viz.rect_width/4;
  //     var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch + params.viz.rect_height/4;
  //     return 'translate(' + x_pos + ','+y_pos+')';
  //   });


  if (params.matrix.tile_type == 'updn'){

    // value split
    var row_split_data = _.filter(inp_row_data, function(num){
      return num.value_up != 0 || num.value_dn !=0 ;
    });

    // tile_up
    d3.select(row_selection)
      .selectAll('.tile_up')
      .data(row_split_data, function(d){return d.col_name;})
      .enter()
      .append('path')
      .attr('class','tile_up')
      .attr('d', function() {
        return draw_up_tile(params);
      })
      .attr('transform', function(d) {
        var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
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
      .on('mouseover', function(...args) {
        mouseover_tile(params, this, tip, args);
      })
      .on('mouseout', function() {
        mouseout_tile(params, this, tip);
      });

    // tile_dn
    d3.select(row_selection)
      .selectAll('.tile_dn')
      .data(row_split_data, function(d){return d.col_name;})
      .enter()
      .append('path')
      .attr('class','tile_dn')
      .attr('d', function() {
        return draw_dn_tile(params);
      })
      .attr('transform', function(d) {
        var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width;
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
      .on('mouseover', function(...args) {
        mouseover_tile(params, this, tip, args);
      })
      .on('mouseout', function() {
        mouseout_tile(params, this, tip);
      });

      // remove rect when tile is split 
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