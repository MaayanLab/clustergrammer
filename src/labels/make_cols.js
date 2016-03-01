var utils = require('../utils');
var add_col_click_hlight = require('./add_col_click_hlight');
var col_reorder = require('../reorder/col_reorder');

module.exports = function(params, text_delay) {

  var container_all_col;

  var col_nodes = params.network_data.col_nodes;
  var col_nodes_names = params.network_data.col_nodes_names;

  // offset click group column label
  var x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
  // reduce width of rotated rects
  var reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;


  // make container to pre-position zoomable elements
  if (d3.select(params.root+' .col_container').empty()) {

    container_all_col = d3.select(params.viz.viz_svg)
      .append('g')
      .attr('class','col_container')
      .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
      params.norm_label.margin.top + ')');

    // white background rect for col labels
    container_all_col
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', 30 * params.viz.clust.dim.width + 'px')
      .attr('height', params.norm_label.background.col)
      .attr('class', 'white_bars');

    // col labels
    container_all_col
      .append('g')
      .attr('class','col_label_outer_container')
      // position the outer col label group
      .attr('transform', 'translate(0,' + params.norm_label.width.col + ')')
      .append('g')
      .attr('class', 'col_zoom_container');

  } else {

    container_all_col = d3.select(params.root+' .col_container')
      .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
      params.norm_label.margin.top + ')');

    // white background rect for col labels
    container_all_col
      .select('.white_bars')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', 30 * params.viz.clust.dim.width + 'px')
      .attr('height', params.norm_label.background.col);

    // col labels
    container_all_col.select(params.root+' .col_label_outer_container');

  }


  // add main column label group
  var col_label_obj = d3.select(params.root+' .col_zoom_container')
    .selectAll('.col_label_text')
    .data(col_nodes, function(d){return d.name;})
    .enter()
    .append('g')
    .attr('class', 'col_label_text')
    .attr('transform', function(d) {
      var inst_index = _.indexOf(col_nodes_names, d.name);
      return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
    });

  // append group for individual column label
  var col_label_click = col_label_obj
    // append new group for rect and label (not white lines)
    .append('g')
    .attr('class', 'col_label_click')
    // rotate column labels
    .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)')
    .on('mouseover', function() {
      d3.select(this).select('text')
        .classed('active',true);
    })
    .on('mouseout', function() {
      d3.select(this).select('text')
        .classed('active',false);
    });



  // append column value bars
  if (utils.has(params.network_data.col_nodes[0], 'value')) {

    col_label_click
      .append('rect')
      .attr('class', 'col_bars')
      .attr('width', function(d) {
        var inst_value = 0;
        if (d.value > 0){
          inst_value = params.labels.bar_scale_col(d.value);
        }
        return inst_value;
      })
      // rotate labels - reduce width if rotating
      .attr('height', params.matrix.x_scale.rangeBand() * 0.66)
      .style('fill', function(d) {
        return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
      })
      .attr('opacity', 0.4);

  }

  // add column label
  col_label_click
    .append('text')
    .attr('x', 0)
    // manually tuned
    .attr('y', params.matrix.x_scale.rangeBand() * 0.64)
    .attr('dx', params.viz.border_width)
    .attr('text-anchor', 'start')
    .attr('full_name', function(d) {
      return d.name;
    })
    // original font size
    .style('font-size', params.labels.default_fs_col + 'px')
    .text(function(d){ return utils.normal_name(d); })
    // .attr('pointer-events','none')
    .style('opacity',0)
    .transition().delay(text_delay).duration(text_delay)
    .style('opacity',1);

  if (params.labels.show_label_tooltips){

    // d3-tooltip
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('s')
      .offset([20, 0])
      .html(function(d) {
        var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
        return "<span>" + inst_name + "</span>";
      });

    d3.select(params.viz.viz_wrapper)
      .select('svg')
      .select(params.root+' .col_container')
      .call(tip);

    col_label_obj
      // .select('text')
      .on('mouseover',tip.show)
      .on('mouseout',tip.hide);

  }



  // append rectangle behind text
  col_label_click
    .insert('rect')
    .attr('class','.highlight_rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', 10*params.matrix.rect_height)
    .attr('height', 0.67*params.matrix.rect_width)
    .style('opacity', 0);

  // // only run this if there are col categories
  // if (params.labels.show_categories){
  //   // change the size of the highlighting rects
  //   col_label_click
  //     .each(function(d) {
  //       var bbox = d3.select(this)
  //         .select('text')[0][0]
  //         .getBBox();

  //       d3.select(this)
  //         .select('rect')
  //         .attr('width', bbox.width * 1.1)
  //         .attr('height', 0.67*params.matrix.rect_width)
  //         .style('fill', function(d){
  //           var inst_color = 'white';
  //           inst_color = params.labels.class_colors.col[d.cl];
  //           return inst_color
  //         })
  //         .style('opacity', 0.30);
  //     });
  // }

  // add triangle under rotated labels
  col_label_click
    .append('path')
    .style('stroke-width', 0)
    .attr('d', function() {
      // x and y are flipped since its rotated
      var origin_y = -params.viz.border_width;
      var start_x = 0;
      var final_x = params.matrix.x_scale.rangeBand() - reduce_rect_width;
      var start_y = -(params.matrix.x_scale.rangeBand() - reduce_rect_width +
      params.viz.border_width);
      var final_y = -params.viz.border_width;
      var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
        start_x + ', L ' + final_y + ',' + final_x + ' Z';
      return output_string;
    })
    .attr('fill', function() {
      var inst_color = '#eee';
    return inst_color;
    })
    .style('opacity',0)
    .transition().delay(text_delay).duration(text_delay)
    .style('opacity',1);


  // add col callback function
  d3.selectAll(params.root+' .col_label_text')
    .on('click',function(d){

      if (typeof params.click_label == 'function'){
        params.click_label(d.name, 'col');
        add_col_click_hlight(params, this, d.ini);
      } else {

        if (params.tile_click_hlight){
          add_col_click_hlight(params, this, d.ini);
        }

      }

    })
    .on('dblclick', function(d) {
      col_reorder(params, this);
      if (params.tile_click_hlight){
        add_col_click_hlight(params, this, d.ini);
      }
    });

  return container_all_col;
};
