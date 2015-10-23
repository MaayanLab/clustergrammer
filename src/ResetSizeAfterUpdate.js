
function resize_after_update(params, row_nodes, col_nodes, links, update_dur){


  // // reset zoom
  // //////////////////////////////
  // var zoom_y = 1;
  // var zoom_x = 1;
  // var pan_dx = 0;
  // var pan_dy = 0;

  // var half_height = params.viz.clust.dim.height / 2;
  // var center_y = -(zoom_y - 1) * half_height;

  // viz.get_clust_group()
  //   .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
  //   ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,pan_dy] + ')');

  // d3.select('#row_labels')
  //   .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
  //   zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

  // d3.select('#row_label_triangles')
  //   .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
  //   1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

  // d3.select('#col_labels')
  //   .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

  // d3.select('#col_class')
  //   .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

  // // set y translate: center_y is positive, positive moves the visualization down
  // // the translate vector has the initial margin, the first y centering, and pan_dy
  // // times the scaling zoom_y
  // var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

  // // reset the zoom translate and zoom
  // params.zoom.translate([pan_dx, net_y_offset]);

  // Begin Resizing 
  //////////////////////////
  
  var svg_group = d3.select('#' + params.viz.svg_div_id)
    .select('svg');

  svg_group.select('#grey_background')
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  svg_group.selectAll('.tile')
    .data(links, function(d){ return d.name;})
    .transition().delay(update_dur).duration(update_dur)
    .attr('width', params.matrix.x_scale.rangeBand())
    .attr('height', params.matrix.y_scale.rangeBand())
    .attr('transform', function(d) {
      return 'translate(' + params.matrix.x_scale(d.target) + ','+params.matrix.y_scale(d.source)+')';
    });


  // resize row labels
  ///////////////////////////

  // add text to row/col during resize
  function normal_name(d){
    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
    if (inst_name.length > params.labels.max_label_char){
      inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
    }
    return inst_name;
  }

  svg_group.select('#row_container')
    .transition().delay(update_dur).duration(update_dur)
    .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
    params.viz.clust.margin.top + ')');

  svg_group.select('#row_container')
    .select('.white_bars')
    .transition().delay(update_dur).duration(update_dur)
    .attr('width', params.norm_label.background.row)
    .attr('height', 30*params.viz.clust.dim.height + 'px');

  svg_group.select('#row_container')
    .select('.label_container')
    .transition().delay(update_dur).duration(update_dur)
    .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

  svg_group.selectAll('.row_label_text')
    .data(row_nodes, function(d){ return d.name;})
    .transition().delay(update_dur).duration(update_dur)
    .attr('transform', function(d, index) {
      return 'translate(0,' + params.matrix.y_scale(index) + ')';
    });

  svg_group.selectAll('.row_label_text')
    .select('text')
    .transition().delay(update_dur).duration(update_dur)
    .attr('y', params.matrix.y_scale.rangeBand() * 0.75)

  svg_group.selectAll('.row_label_text')
    .select('text')
    .transition().delay(update_dur).duration(update_dur)
    .style('font-size', params.labels.default_fs_row + 'px')
    .text(function(d){ return normal_name(d);});

  // label the widest row and col labels
  params.bounding_width_max = {};
  params.bounding_width_max.row = 0;
  d3.selectAll('.row_label_text').each(function() {
    var tmp_width = d3.select(this).select('text').node().getBBox().width;
    if (tmp_width > params.bounding_width_max.row) {
      params.bounding_width_max.row = tmp_width;
    }
  });

  svg_group.select('#row_label_viz')
    .transition().delay(update_dur).duration(update_dur)
    .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

  svg_group.select('#row_label_viz')
    .select('white_bars')
    .transition().delay(update_dur).duration(update_dur)
    .attr('width', params.class_room.row + 'px')
    .attr('height', function() {
      var inst_height = params.viz.clust.dim.height;
      return inst_height;
    });

  svg_group.selectAll('.row_triangle_group')
    .data(row_nodes, function(d){return d.name;})
    .transition().delay(update_dur).duration(update_dur)
    .attr('transform', function(d, index) {
        return 'translate(0, ' + params.matrix.y_scale(index) + ')';
      });

  svg_group.selectAll('.row_triangle_group')
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


    if (Utils.has( params.network_data.row_nodes[0], 'value')) {
      // set bar scale
      var enr_max = Math.abs(_.max( params.network_data.row_nodes, function(d) { return Math.abs(d.value) } ).value) ;
      params.labels.bar_scale_row = d3.scale
        .linear()
        .domain([0, enr_max])
        .range([0, params.norm_label.width.row ]);

      svg_group.selectAll('.row_bars')
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

    svg_group.select('#col_container')
      .attr('transform', 'translate(' + params.viz.clust.margin.left + ',' +
      params.norm_label.margin.top + ')');

    svg_group.select('#col_container')
      .select('.white_bars')
      .attr('width', 30 * params.viz.clust.dim.width + 'px')
      .attr('height', params.norm_label.background.col);

    svg_group.select('#col_container')
      .select('.label_container')
      .attr('transform', 'translate(0,' + params.norm_label.width.col + ')');

    // offset click group column label
    var x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
    // reduce width of rotated rects
    var reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;

    svg_group.selectAll('.col_label_text')
      .data(col_nodes, function(d){return d.name;})
      .transition().delay(update_dur).duration(update_dur)
      .attr('transform', function(d, index) {
        return 'translate(' + params.matrix.x_scale(index) + ',-20) rotate(-90)';
      });

    svg_group.selectAll('.col_label_click')
      .data(col_nodes, function(d){return d.name;})
      .transition().delay(update_dur).duration(update_dur)
      .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

    svg_group.selectAll('.col_label_click')
      .transition().delay(update_dur).duration(update_dur)
      .select('text')
      .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
      .attr('dx', 2 * params.viz.border_width)
      .style('font-size', params.labels.default_fs_col + 'px')
      .text(function(d){ return normal_name(d);});

    // params.bounding_width_max.col = 0;
    // svg_group.selectAll('.col_label_click').each(function() {
    //   var tmp_width = d3.select(this).select('text').node().getBBox().width;
    //   if (tmp_width > params.bounding_width_max.col) {
    //   params.bounding_width_max.col = tmp_width * 1.2;
    //   }
    // });


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
      d3.selectAll('.row_label_text').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.default_fs_row + 'px');
      });
    }

    if (params.bounding_width_max.col > params.norm_label.width.col) {

      // calc reduction in font size
      params.ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max.col;
      // redefine bounding_width_max.col
      params.bounding_width_max.col = params.ini_scale_font.col * params.bounding_width_max.col;
      // redefine default fs
      params.labels.default_fs_col = params.labels.default_fs_col * params.ini_scale_font.col;
      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.default_fs_col + 'px');
      });
    }

    svg_group.selectAll('.col_label_click')
      .each(function() {
        var bbox = d3.select(this)
          .select('text')[0][0]
          .getBBox();
        d3.select(this)
          .select('rect')
          .attr('x', bbox.x * 1.25)
          .attr('y', 0)
          .attr('width', bbox.width * 1.25)
          .attr('height', params.matrix.x_scale.rangeBand() * 0.6)
          .style('fill', 'yellow')
          .style('opacity', 0);
      });

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

    // append column value bars
    if (Utils.has( params.network_data.col_nodes[0], 'value')) {

      svg_group.selectAll('.col_bars')
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

    // resize dendrogram
    ///////////////////
    svg_group.selectAll('.row_class_rect')
      .data(row_nodes, function(d){return d.name;})
      .attr('width', function() {
        var inst_width = params.class_room.symbol_width - 1;
        return inst_width + 'px';
      })
      .attr('height', params.matrix.y_scale.rangeBand())
      .attr('x', function() {
        var inst_offset = params.class_room.symbol_width + 1;
        return inst_offset + 'px';
      });

    svg_group.selectAll('.col_class_rect')
      .data(col_nodes, function(d){return d.name;})
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', function() {
        var inst_height = params.class_room.col - 1;
        return inst_height;
      });

    svg_group.selectAll('.col_class_group')
      .data(col_nodes, function(d){return d.name;})
      .transition().delay(update_dur).duration(update_dur)
      .attr('transform', function(d, index) {
        return 'translate(' + params.matrix.x_scale(index) + ',0)';
      });

    // reposition grid lines
    ////////////////////////////
    svg_group.selectAll('.horz_lines')
      .data(row_nodes, function(d){return d.name;})
      .transition().delay(update_dur).duration(update_dur)
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ') rotate(0)';
      })
      .select('line')
      .attr('x2',params.viz.clust.dim.width)
      .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')

    svg_group.selectAll('.vert_lines')
      .data(col_nodes, function(d){return d.name;})
      .transition().delay(update_dur).duration(update_dur)
      .attr('transform', function(d, index) {
          return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
      })
      .select('line')
      .attr('x2', -params.viz.clust.dim.height)
      .style('stroke-width', params.viz.border_width + 'px');

  // resize spillover
  //////////////////////////
  // hide spillover from slanted column labels on right side
  svg_group.select('#right_slant_triangle')
    .attr('transform', 'translate(' + params.viz.clust.dim.width + ',' +
    params.norm_label.width.col + ')');

  svg_group.select('#left_slant_triangle')
    .attr('transform', 'translate(-1,' + params.norm_label.width.col +')');

  svg_group.select('#top_left_white')
    .attr('width', params.viz.clust.margin.left)
    .attr('height', params.viz.clust.margin.top);

  svg_group.select('#right_spillover')
    .attr('transform', function() {
      var tmp_left = params.viz.clust.margin.left + params.viz.clust.dim.width;
      var tmp_top = params.norm_label.margin.top + params.norm_label.width
        .col;
      return 'translate(' + tmp_left + ',' + tmp_top + ')';
    });

  // white border bottom - prevent clustergram from hitting border
  svg_group.select('#bottom_spillover')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', 2 * params.viz.grey_border_width)
    .attr('transform', function() {
      // shift up enough to show the entire border width
      var inst_offset = params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
    });

}
