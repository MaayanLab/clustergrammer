
function Labels(){

  // make row labels 
  function make_rows(params, row_nodes, reorder){

    // Row Labels 
    //////////////////////////////////
    // make container to pre-position zoomable elements
    var container_all_row = d3.select('#main_svg')
      .append('g')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');

    // white background rect for row labels
    container_all_row
      .append('rect')
      .attr('fill', params.viz.background_color)
      .attr('width', params.norm_label.background.row)
      .attr('height', 30 * params.viz.clust.dim.height + 'px')
      .attr('class', 'white_bars');

    // row_labels
    container_all_row
      .append('g')
      // position the outer row label group
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('id', 'row_labels');

    // generate and position the row labels
    var row_labels = d3.select('#row_labels')
      .selectAll('.row_label_text')
      .data(row_nodes)
      .enter()
      .append('g')
      .attr('class', 'row_label_text')
      .attr('transform', function(d, index) {
      return 'translate(0,' + params.matrix.y_scale(index) + ')';
      })
      .on('dblclick', reorder.row_reorder )
      .on('mouseover', function() {

      // highlight text
      d3.select(this)
        .select('text')
        .classed('active',true);
      })
      .on('mouseout', function mouseout() {
      d3.select(this)
        .select('text')
        .classed('active',false)
      });

    // append row label text
    row_labels
      .append('text')
      .attr('y', params.matrix.y_scale.rangeBand() * 0.75)
      // .attr('dy', params.matrix.y_scale.rangeBand()/4)
      .attr('text-anchor', 'end')
      .style('font-size', params.labels.defalut_fs_row + 'px')
      .text(function(d) {
      return d.name;
      });

    // append rectangle behind text
    row_labels
      .insert('rect', 'text')
      .attr('x', -10)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .style('opacity', 0);

    // change the size of the highlighting rects
    row_labels
      .each(function() {
      // get the bounding box of the row label text
      var bbox = d3.select(this)
        .select('text')[0][0]
        .getBBox();
      // use the bounding box to set the size of the rect
      d3.select(this)
        .select('rect')
        .attr('x', bbox.x * 0.5)
        .attr('y', 0)
        .attr('width', bbox.width * 0.5)
        .attr('height', params.matrix.y_scale.rangeBand())
        .style('fill', function() {
        var inst_hl = 'yellow';
        return inst_hl;
        })
        .style('opacity', function(d) {
        var inst_opacity = 0;
        // highlight target genes
        if (d.target === 1) {
          inst_opacity = 1;
        }
        return inst_opacity;
        });
      });


    // row triangles
    ///////////////////////
    var row_triangle_zoom = container_all_row
      .append('g')
      // shift by the width of the normal row labels
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')
      .append('g')
      .attr('id', 'row_label_triangles');

    // append triangle background rect to zoomable group
    row_triangle_zoom
      .append('rect')
      .attr('fill', params.viz.background_color) //!! prog_colors
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
      var inst_height = params.viz.clust.dim.height;
      return inst_height;
      });

    // append groups - each holds one triangle
    var row_triangle_ini_group = row_triangle_zoom
      .selectAll('g')
      .data(row_nodes)
      .enter()
      .append('g')
      .attr('class', 'row_triangle_group')
      .attr('transform', function(d, index) {
      return 'translate(0, ' + params.matrix.y_scale(index) + ')';
      });

    // add triangles
    row_triangle_ini_group
      .append('path')
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
      })
      .attr('fill', function(d) {

      // initailize color
      var inst_color = '#eee';
      if (params.labels.show_categories) {
        inst_color = params.labels.class_colors.row[d.cl];
      }
      return inst_color;
      });

      // get max value
      var enr_max = _.max( row_nodes, function(d) { return Math.abs(d.value) } ).value ;

      // the enrichment bar should be 3/4ths of the height of the column labels
      params.labels.bar_scale_row = d3.scale
        .linear()
        .domain([1, enr_max])
        .range([0, params.norm_label.width.row]);

      // append column value bars
      if (Utils.has( params.network_data.row_nodes[0], 'value')) {
        row_labels
        .append('rect')
        .attr('class', 'row_bars')
        .attr('width', function(d) {
          var inst_value = 0;
          if (d.value > 0){
            inst_value = params.labels.bar_scale_row(d.value);
          }
          return inst_value;
        })

        .attr('x', function(d) {
          var inst_value = 0;
          if (d.value > 0){
            inst_value = -params.labels.bar_scale_row(d.value);
          }
          return inst_value;
        })

        .attr('height', params.matrix.y_scale.rangeBand() )
        .attr('fill', function() {
          return 'red';
        })
        .attr('opacity', 0.4);
      }
      
      // return row_triangle_ini_group so that the dendrogram can be made 
      return row_triangle_ini_group;
  }   

  // make col labels 
  function make_cols(params, col_nodes, reorder){

    // make container to pre-position zoomable elements
    var container_all_col = d3.select('#main_svg')
      .append('g')
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
      // position the outer col label group
      .attr('transform', 'translate(0,' + params.norm_label.width.col + ')')
      .append('g')
      .attr('id', 'col_labels');

    // offset click group column label
    var x_offset_click = params.matrix.x_scale.rangeBand() / 2 + params.viz.border_width;
    // reduce width of rotated rects
    var reduce_rect_width = params.matrix.x_scale.rangeBand() * 0.36;

    // add main column label group
    var col_label_obj = d3.select('#col_labels')
      .selectAll('.col_label_text')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'col_label_text')
      .attr('transform', function(d, index) {
      return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
      });

    // append group for individual column label
    var col_label_click = col_label_obj
      // append new group for rect and label (not white lines)
      .append('g')
      .attr('class', 'col_label_click')
      // rotate column labels
      .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)')
      .on('dblclick', reorder.col_reorder )
      .on('mouseover', function() {
      d3.select(this).select('text')
        .classed('active',true);
      })
      .on('mouseout', function mouseout() {
      d3.select(this).select('text')
        .classed('active',false);
      });

    // add column label
    col_label_click
      .append('text')
      .attr('x', 0)
      .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
      // offset label to make room for triangle
      .attr('dx', 2 * params.viz.border_width)
      .attr('text-anchor', 'start')
      .attr('full_name', function(d) {
      return d.name;
      })
      // original font size
      .style('font-size', params.labels.defalut_fs_col + 'px')
      // // !! simple font size
      // .style('font-size', params.matrix.x_scale.rangeBand()*0.7+'px')
      .text(function(d) {
      return d.name.replace(/_/g, ' ');
      });

    // label the widest row and col labels
    ////////////////////////////////////////
    params.bounding_width_max = {};
    params.bounding_width_max.row = 0;
    d3.selectAll('.row_label_text').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.row) {
      params.bounding_width_max.row = tmp_width;
      }
    });

    params.bounding_width_max.col = 0;
    d3.selectAll('.col_label_click').each(function() {
      var tmp_width = d3.select(this).select('text').node().getBBox().width;
      if (tmp_width > params.bounding_width_max.col) {
      // increase the apparent width of the column label since its rotated
      // this will give more room for text
      params.bounding_width_max.col = tmp_width * 1.2;
      }
    });

    // optionally turn down sensitivity to row/col overflow
    params.bounding_width_max.col = params.bounding_width_max.col * params.labels.col_overflow;
    params.bounding_width_max.row = params.bounding_width_max.row * params.labels.row_overflow;


    // check if widest row or col are wider than the allowed label width
    ////////////////////////////////////////////////////////////////////////
    params.ini_scale_font = {};
    params.ini_scale_font.row = 1;
    params.ini_scale_font.col = 1;
    if (params.bounding_width_max.row * params.zoom.scale() > params.norm_label
      .width.row) {

      params.ini_scale_font.row = params.norm_label.width.row / params.bounding_width_max
        .row;
      // redefine bounding_width_max.row
      params.bounding_width_max.row = params.ini_scale_font.row * params.bounding_width_max
        .row;

      // redefine default fs
      params.labels.defalut_fs_row = params.labels.defalut_fs_row * params.ini_scale_font
        .row;
      // reduce font size
      d3.selectAll('.row_label_text').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.defalut_fs_row + 'px');
      });
    }

    if (params.bounding_width_max.col * params.zoom.scale() > params.norm_label
      .width.col) {
      params.ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max
        .col;
      // redefine bounding_width_max.col
      params.bounding_width_max.col = params.ini_scale_font.col * params.bounding_width_max
        .col;
      // redefine default fs
      params.labels.defalut_fs_col = params.labels.defalut_fs_col * params.ini_scale_font
        .col;
      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.labels.defalut_fs_col + 'px');
      });
    }

    // append rectangle behind text
    col_label_click
      .insert('rect', 'text')
      .attr('x', 10)
      .attr('y', 0)
      .attr('width', 10)
      .attr('height', 10)
      .style('opacity', 0);

    // change the size of the highlighting rects
    col_label_click
      .each(function() {

      // get the bounding box of the row label text
      var bbox = d3.select(this)
        .select('text')[0][0]
        .getBBox();

      // use the bounding box to set the size of the rect
      d3.select(this)
        .select('rect')
        .attr('x', bbox.x * 1.25)
        .attr('y', 0)
        .attr('width', bbox.width * 1.25)
        // used a reduced rect width for the columsn
        // because the rects are slanted
        .attr('height', params.matrix.x_scale.rangeBand() * 0.6)
        .style('fill', 'yellow')
        .style('opacity', 0);
      });

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
      .attr('fill', function(d) {
      var inst_color = '#eee';
      if (params.labels.show_categories) {
        inst_color = params.labels.class_colors.col[d.cl];
      }
      return inst_color;
      });


    //!! CHD specific 
    // get max value
    var enr_max = _.max( col_nodes, function(d) { return Math.abs(d.value) } ).value ;

    // the enrichment bar should be 3/4ths of the height of the column labels
    params.labels.bar_scale_col = d3.scale
      .linear()
      .domain([1, enr_max])
      .range([0, params.norm_label.width.col]);

    // append column value bars
    if (Utils.has( params.network_data.col_nodes[0], 'value')) {
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
      .attr('fill', function() {
        // return d.color;
        return 'red';
      })
      .attr('opacity', 0.4);
    }

    return container_all_col;

  }

  return {
    make_rows: make_rows,
    make_cols: make_cols
  };

}

