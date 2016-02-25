var utils = require('../utils');
var is_force_square = require('../params/is_force_square');
var get_svg_dim = require('../params/get_svg_dim');
var set_clust_width = require('../params/set_clust_width');
var reset_zoom = require('../zoom/reset_zoom');
var resize_dendro = require('./resize_dendro');
var resize_super_labels = require('./resize_super_labels');
var resize_spillover = require('./resize_spillover');
var resize_row_labels = require('./resize_row_labels');

module.exports = function(params, row_nodes, col_nodes, links, duration, delays) {

  var row_nodes_names = params.network_data.row_nodes_names;
  var col_nodes_names = params.network_data.col_nodes_names;

  reset_zoom(params);

  // Resetting some visualization parameters
  params = get_svg_dim(params);
  params = set_clust_width(params);
  params = is_force_square(params);

  // zoom_switch from 1 to 2d zoom
  params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

  // zoom_switch can not be less than 1
  if (params.viz.zoom_switch < 1) {
    params.viz.zoom_switch = 1;
  }

  // redefine x_scale and y_scale rangeBands
  params.matrix.x_scale.rangeBands([0, params.viz.clust.dim.width]);
  params.matrix.y_scale.rangeBands([0, params.viz.clust.dim.height]);

  // redefine zoom extent
  params.viz.real_zoom = params.norm_label.width.col / (params.matrix.x_scale.rangeBand()/2);
  params.zoom_behavior
    .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch]);

  // redefine border width
  params.viz.border_width = params.matrix.x_scale.rangeBand() / 40;

  // the default font sizes are set here
  params.labels.default_fs_row = params.matrix.y_scale.rangeBand() * 1.01;
  params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.85;

  // Begin resizing the visualization
  /////////////////////////////////////////
  /////////////////////////////////////////

  // resize the svg
  ///////////////////////
  var svg_group = d3.select(params.viz.viz_wrapper)
    .select('svg');

  svg_group.select(params.root+' .grey_background')
    .transition().delay(delays.update).duration(duration)
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);


  //////////////////////
  // set up later
  //////////////////////
  // svg_group.selectAll('.highlighting_rect')
  //   // .transition().delay(delays.update).duration(duration)
  //   .attr('width', params.matrix.x_scale.rangeBand() * 0.80)
  //   .attr('height', params.matrix.y_scale.rangeBand() * 0.80);
  // svg_group.selectAll('.tile_split_up')
  //   // .transition().delay(delays.update).duration(duration)
  //   .attr('d', function() {
  //     var start_x = 0;
  //     var final_x = params.matrix.x_scale.rangeBand();
  //     var start_y = 0;
  //     var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
  //     var output_string = 'M' + start_x + ',' + start_y + ', L' +
  //       start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
  //     return output_string;
  //   })
  // svg_group.selectAll('.tile_split_dn')
  //   // .transition().delay(delays.update).duration(duration)
  //   .attr('d', function() {
  //     var start_x = 0;
  //     var final_x = params.matrix.x_scale.rangeBand();
  //     var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
  //     var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
  //     var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
  //       final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
  //     return output_string;
  //   })

  // add text to row/col during resize
  function normal_name(d){
    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
    if (inst_name.length > params.labels.max_label_char){
      inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
    }
    return inst_name;
  }

  resize_row_labels(params, svg_group, delays);

  // do not delay the font size change since this will break the bounding box calc
  svg_group.selectAll('.row_label_text')
    .select('text')
    .style('font-size', params.labels.default_fs_row + 'px')
    .text(function(d){ return normal_name(d);});

  // change the size of the highlighting rects
  svg_group.selectAll('.row_label_text')
    .each(function() {
      var bbox = d3.select(this).select('text')[0][0].getBBox();
      d3.select(this)
        .select('rect')
        .attr('x', bbox.x )
        .attr('y', 0)
        .attr('width', bbox.width )
        .attr('height', params.matrix.y_scale.rangeBand())
        .style('fill', 'yellow')
        .style('opacity', function(d) {
          var inst_opacity = 0;
          // highlight target genes
          if (d.target === 1) {
            inst_opacity = 1;
          }
          return inst_opacity;
        });
    });

  // label the widest row and col labels
  params.bounding_width_max = {};
  params.bounding_width_max.row = 0;
  d3.selectAll(params.root+' .row_label_text').each(function() {
    var tmp_width = d3.select(this).select('text').node().getBBox().width;
    if (tmp_width > params.bounding_width_max.row) {
      params.bounding_width_max.row = tmp_width;
    }
  });

  // check if widest row or col are wider than the allowed label width
  ////////////////////////////////////////////////////////////////////////
  params.ini_scale_font = {};
  params.ini_scale_font.row = 1;
  params.ini_scale_font.col = 1;

  if (params.bounding_width_max.row > params.norm_label.width.row) {

    // calc reduction in font size
    params.ini_scale_font.row = params.norm_label.width.row / params.bounding_width_max.row;
    // redefine bounding_width_max.row
    params.bounding_width_max.row = params.ini_scale_font.row * params.bounding_width_max.row;

    // redefine default fs
    params.labels.default_fs_row = params.labels.default_fs_row * params.ini_scale_font.row;
    // reduce font size
    d3.selectAll(params.root+' .row_label_text').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.default_fs_row + 'px');
    });
  }

  if (delays.run_transition){

    // positioning row text after row text size may have been reduced
    svg_group.selectAll('.row_label_text')
      .select('text')
      .transition().delay(delays.update).duration(duration)
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group.select('.row_viz_container')
      .transition().delay(delays.update).duration(duration)
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.select('.row_viz_container')
      .transition().delay(delays.update).duration(duration)
      .select('white_bars')
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

    svg_group.selectAll('.row_viz_group')
      .data(row_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_viz_group')
      .select('path')
      .transition().delay(delays.update).duration(duration)
      .attr('d', function() {
        var origin_x = params.class_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.y_scale.rangeBand() / 2;
        var final_x = params.class_room.symbol_width - 1;
        var final_y = params.matrix.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });

  } else {

    // positioning row text after row text size may have been reduced
    svg_group.selectAll('.row_label_text')
      .select('text')
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group.select('.row_viz_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.select('.row_viz_container')
      .select('white_bars')
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

    svg_group.selectAll('.row_viz_group')
      .data(row_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_viz_group')
      .select('path')
      .attr('d', function() {
        var origin_x = params.class_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.y_scale.rangeBand() / 2;
        var final_x = params.class_room.symbol_width - 1;
        var final_y = params.matrix.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });

  }

    if (utils.has( params.network_data.row_nodes[0], 'value')) {

      // set bar scale
      var enr_max = Math.abs(_.max( params.network_data.row_nodes, function(d) { return Math.abs(d.value); } ).value) ;
      params.labels.bar_scale_row = d3.scale
        .linear()
        .domain([0, enr_max])
        .range([0, params.norm_label.width.row ]);

      svg_group.selectAll('.row_bars')
        // .transition().delay(delays.update).duration(duration)
        .attr('width', function(d) {
          var inst_value = 0;
          inst_value = params.labels.bar_scale_row( Math.abs(d.value) );
          return inst_value;
        })
        .attr('x', function(d) {
          var inst_value = 0;
          inst_value = -params.labels.bar_scale_row( Math.abs(d.value) );
          return inst_value;
        })
        .attr('height', params.matrix.y_scale.rangeBand() );

    }



    // resize col labels
    ///////////////////////
    var x_offset_click;
    var reduce_rect_width;

    if (delays.run_transition){

      svg_group.select(params.root+' .col_container')
        .transition().delay(delays.update).duration(duration)
        .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');

      svg_group.select(params.root+' .col_container')
        .transition().delay(delays.update).duration(duration)
        .select('.white_bars')
        .attr('width', 30 * params.viz.clust.dim.width + 'px')
        .attr('height', params.norm_label.background.col);

      svg_group.select(params.root+' .col_container')
        .transition().delay(delays.update).duration(duration)
        .select('.col_label_outer_container')
        .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

      // offset click group column label
      x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
      // reduce width of rotated rects
      reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;

      svg_group.selectAll('.col_label_text')
        .data(col_nodes, function(d){return d.name;})
        .transition().delay(delays.update).duration(duration)
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
        });

      svg_group.selectAll('.col_label_click')
        .transition().delay(delays.update).duration(duration)
        .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

      svg_group.selectAll('.col_label_click')
        .select('text')
        .style('font-size', params.labels.default_fs_col + 'px')
        .text(function(d){ return normal_name(d);});

      svg_group.selectAll('.col_label_click')
        .select('text')
        .transition().delay(delays.update).duration(duration)
        .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
        .attr('dx', 2 * params.viz.border_width);

    } else {

      svg_group.select(params.root+' .col_container')
        .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
        params.norm_label.margin.top + ')');

      svg_group.select(params.root+' .col_container')
        .select('.white_bars')
        .attr('width', 30 * params.viz.clust.dim.width + 'px')
        .attr('height', params.norm_label.background.col);

      svg_group.select(params.root+' .col_container')
        .select('.col_label_outer_container')
        .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

      // offset click group column label
      x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
      // reduce width of rotated rects
      reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;

      svg_group.selectAll('.col_label_text')
        .data(col_nodes, function(d){return d.name;})
        .attr('transform', function(d) {
          var inst_index = _.indexOf(col_nodes_names, d.name);
          return 'translate(' + params.matrix.x_scale(inst_index) + ') rotate(-90)';
        });

      svg_group.selectAll('.col_label_click')
        .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

      svg_group.selectAll('.col_label_click')
        .select('text')
        .style('font-size', params.labels.default_fs_col + 'px')
        .text(function(d){ return normal_name(d);});

      svg_group.selectAll('.col_label_click')
        .select('text')
        .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
        .attr('dx', 2 * params.viz.border_width);

    }



    params.bounding_width_max.col = 0;
    svg_group.selectAll('.col_label_click').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.col) {
        params.bounding_width_max.col = tmp_width;
      }
    });


    if (params.bounding_width_max.col > params.norm_label.width.col) {

      // calc reduction in font size
      params.ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max.col;
      // redefine bounding_width_max.col
      params.bounding_width_max.col = params.ini_scale_font.col * params.bounding_width_max.col;
      // redefine default fs
      params.labels.default_fs_col = params.labels.default_fs_col * params.ini_scale_font.col;
      // reduce font size
      d3.selectAll(params.root+' .col_label_click').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.default_fs_col + 'px');
      });
      // .attr('y', params.matrix.rect_width * 0.5 + params.labels.default_fs_col*0.25 )
    }

    svg_group.selectAll('.col_label_click')
      .each(function() {
        d3.select(this)
          .select('text')[0][0]
          .getBBox();
        // d3.select(this)
        //   .select('rect')
        //   .attr('x', bbox.x * 1.25)
        //   .attr('y', 0)
        //   .attr('width', bbox.width * 1.25)
        //   .attr('height', params.matrix.x_scale.rangeBand() * 0.6)
        //   .style('fill', 'yellow')
        //   .style('opacity', 0);
      });



    if (delays.run_transition){

      // resize column triangle
      svg_group.selectAll('.col_label_click')
        .select('path')
        .transition().delay(delays.update).duration(duration)
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
        .attr('fill', function(d) {
          var inst_color = '#eee';
          if (params.labels.show_categories) {
            inst_color = params.labels.class_colors.col[d.cl];

          }
          return inst_color;
        });

    } else {
      // resize column triangle
      svg_group.selectAll('.col_label_click')
        .select('path')
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
        .attr('fill', function(d) {
          var inst_color = '#eee';
          if (params.labels.show_categories) {
            inst_color = params.labels.class_colors.col[d.cl];
          }
          return inst_color;
        });
    }

    // append column value bars
    if (utils.has( params.network_data.col_nodes[0], 'value')) {

      svg_group.selectAll('.col_bars')
        .data(col_nodes, function(d){return d.name;})
        .transition().delay(delays.update).duration(duration)
        .attr('width', function(d) {
          var inst_value = 0;
          if (d.value > 0){

            inst_value = params.labels.bar_scale_col(d.value);
          }
          return inst_value;
        })
        // rotate labels - reduce width if rotating
        .attr('height', params.matrix.x_scale.rangeBand() * 0.66);
    }

  if (params.labels.show_categories){
    // change the size of the highlighting rects
    d3.selectAll(params.root+' .col_label_click')
      .each(function() {
        var bbox = d3.select(this)
          .select('text')[0][0]
          .getBBox();

        d3.select(this)
          .select('rect')
          .transition().delay(delays.update).duration(duration)
          .attr('width', bbox.width * 1.1)
          .attr('height', 0.67*params.matrix.rect_width)
          .style('fill', function(d){
            var inst_color = 'white';
            if (params.labels.show_categories){
              inst_color = params.labels.class_colors.col[d.cl];
            }
            return inst_color;
          })
          .style('opacity', 0.30);
      });
  }

  resize_dendro(params, svg_group, delays);

  resize_super_labels(params, svg_group, delays);

  resize_spillover(params, svg_group, delays);

  // reset zoom and translate
  params.zoom_behavior
    .scale(1)
    .translate([ params.viz.clust.margin.left, params.viz.clust.margin.top ]);
};
