
/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
function Viz(args) {

  var config = Config(args),
  matrix,
  row_dendrogram,
  col_dendrogram,
  reorder;

  make(config);

  /* The main function; makes clustergram based on user arguments.
   */
  function make(params) {

    reorder = Reorder();

    globals.params = params;

    var network_data = args.network_data;

    if (params.transpose) {
      network_data = transpose_network(network_data);
    }

    // save global version of network_data
    globals.network_data = network_data;

    // set local variables from network_data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;

    // row groups - only add if the rows have a group attribute
    // Define the space needed for the classification of rows - includes classification triangles and rects
    params.class_room = {};
    if (params.show_dendrogram) {

      // make room for group rects
      params.class_room.row = 18;
      params.class_room.col = 9;
      // the width of the classification triangle or group rectangle
      params.class_room.symbol_width = 9;

      params.group_level = {
      row: 5,
      col: 5
      };

    } else {
      // do not make room for group rects
      params.class_room.row = 9;
      params.class_room.col = 0;
      // the width of the classification triangle or group rectangle
      params.class_room.symbol_width = 9;
    }

    // check if row/col have class information
    if (params.show_categories) {
      params.class_colors = {};
      var class_rows = _.uniq(_.pluck(row_nodes, 'cl'));
      // associate classes with colors
      params.class_colors.row = {};
      _.each(class_rows, function(c_row, i) {
      params.class_colors.row[c_row] = Colors.get_random_color(i+50);
      });
      var class_cols = _.uniq(_.pluck(col_nodes, 'cl'));
      // associate classes with colors
      params.class_colors.col = {};
      _.each(class_cols, function(c_col, i) {
      if (i === 0) {
        params.class_colors.col[c_col] = '#eee';
      } else {
        params.class_colors.col[c_col] = Colors.get_random_color(i+50);
      }
      });
    }

    // Begin Making Visualization
    /////////////////////////////////

    // !! needs to be improved 
    // remove any previous visualizations
    d3.select('#main_svg').remove();

    // size and position the outer div first
    
    // only resize if allowed
    parent_div_size_pos(params);

    // initialize clustergram variables
    params = initialize_visualization(network_data, params);

    // display col and row title
    d3.select('#row_title').style('display', 'block');
    d3.select('#col_title').style('display', 'block');

    // display clust_instruct_container
    d3.select('#clust_instruct_container').style('display', 'block');

    // shift the footer left
    d3.select('#footer_div')
      .style('margin-left', '0px');

    // define the variable zoom, a d3 method
    params.zoom = d3.behavior.zoom().scaleExtent([1, params.real_zoom *
    params.zoom_switch
    ]).on('zoom', zoomed);

    // make outer group for clust_group - this will position clust_group once
    var outer_group = d3.select('#' + params.svg_div_id)
      .append('svg')
      .attr('id', 'main_svg')
      // leave room for the light grey border
      .attr('width', params.svg_dim.width)
      // the height is reduced by more than the width because the tiles go right up to the bottom border
      .attr('height', params.svg_dim.height);

    matrix = Matrix(network_data, outer_group, params);

    // append background rect if necessary to control background color
    if (params.background_color !== '#FFFFFF') {
      outer_group
      .append('rect')
      .attr('width', params.svg_dim.width)
      .attr('height', params.svg_dim.height)
      .style('fill', params.background_color);
      console.log('change the background color ');
    }

    // call zoomingoom on the entire svg
    if (params.do_zoom) {
      outer_group.call(params.zoom);
    }


    // Row
    //////////////////////////////////
    // make container to pre-position zoomable elements
    var container_all_row = d3.select('#main_svg')
      .append('g')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.clust.margin.top + ')');

    // white background rect for row labels
    container_all_row
      .append('rect')
      .attr('fill', params.background_color)
      .attr('width', params.norm_label.background.row)
      .attr('height', 30 * params.clust.dim.height + 'px')
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
      return 'translate(0,' + params.y_scale(index) + ')';
      })

      // .on('dblclick', reorder_click_row )
      .on('dblclick', reorder.row_reorder )

      .on('mouseover', function() {
      // highlight text
      d3
        .select(this)
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
      .attr('y', params.y_scale.rangeBand() * 0.75)
      // .attr('dy', params.y_scale.rangeBand()/4)
      .attr('text-anchor', 'end')
      .style('font-size', params.default_fs_row + 'px')
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
        .attr('height', params.y_scale.rangeBand())
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
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
      var inst_height = params.clust.dim.height;
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
      return 'translate(0, ' + params.y_scale(index) + ')';
      });

    // add triangles
    row_triangle_ini_group
      .append('path')
      .attr('d', function() {
      var origin_x = params.class_room.symbol_width - 1;
      var origin_y = 0;
      var mid_x = 1;
      var mid_y = params.y_scale.rangeBand() / 2;
      var final_x = params.class_room.symbol_width - 1;
      var final_y = params.y_scale.rangeBand();
      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
        mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
      return output_string;
      })
      .attr('fill', function(d) {
      // initailize color
      var inst_color = '#eee';
      if (Utils.has(params, 'class_colors')) {
        inst_color = params.class_colors.row[d.cl];
      }
      return inst_color;
      });

    // add row group labels if necessary
    //////////////////////////////////////
    if (params.show_dendrogram) {

      row_dendrogram = Dendrogram('row', params, row_triangle_ini_group);

      // optional row callback on click
      if (typeof params.click_group === 'function') {
      // only add click functionality to row rect
      row_class_rect
        .on('click', function(d) {
        var inst_level = params.group_level.row;
        var inst_group = d.group[inst_level];
        // find all row names that are in the same group at the same group_level
        // get row_nodes
        row_nodes = globals.network_data.row_nodes;
        var group_nodes = [];
        _.each(row_nodes, function(node) {
          // check that the node is in the group
          if (node.group[inst_level] === inst_group) {
          // make a list of genes that are in inst_group at this group_level
          group_nodes.push(node.name);
          }
        });

        // return the following information to the user
        // row or col, distance cutoff level, nodes
        var group_info = {};
        group_info.type = 'row';
        group_info.nodes = group_nodes;
        group_info.info = {
          'type': 'distance',
          'cutoff': inst_level / 10
        };

        // pass information to group_click callback
        params.click_group(group_info);

        });
      }
    }


    // col labels
    //////////////////////////////////
    // make container to pre-position zoomable elements
    var container_all_col = d3.select('#main_svg')
      .append('g')
      .attr('transform', 'translate(' + params.clust.margin.left + ',' +
      params.norm_label.margin.top + ')');

    // white background rect for col labels
    container_all_col
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', 30 * params.clust.dim.width + 'px')
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
    var x_offset_click = params.x_scale.rangeBand() / 2 + params.border_width;
    // reduce width of rotated rects
    var reduce_rect_width = params.x_scale.rangeBand() * 0.36;

    // add main column label group
    var col_label_obj = d3.select('#col_labels')
      .selectAll('.col_label_text')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'col_label_text')
      .attr('transform', function(d, index) {
      return 'translate(' + params.x_scale(index) + ') rotate(-90)';
      });

    // append group for individual column label
    var col_label_click = col_label_obj
      // append new group for rect and label (not white lines)
      .append('g')
      .attr('class', 'col_label_click')
      // rotate column labels
      .attr('transform', 'translate(' + params.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)')

      // .on('dblclick', reorder_click_col )
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
      .attr('y', params.x_scale.rangeBand() * 0.60)
      // offset label to make room for triangle
      .attr('dx', 2 * params.border_width)
      .attr('text-anchor', 'start')
      .attr('full_name', function(d) {
      return d.name;
      })
      // original font size
      .style('font-size', params.default_fs_col + 'px')
      // // !! simple font size
      // .style('font-size', params.x_scale.rangeBand()*0.7+'px')
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
    params.bounding_width_max.col = params.bounding_width_max.col * params.label_overflow
      .col;
    params.bounding_width_max.row = params.bounding_width_max.row * params.label_overflow
      .row;


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
      params.default_fs_row = params.default_fs_row * params.ini_scale_font
        .row;
      // reduce font size
      d3.selectAll('.row_label_text').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.default_fs_row + 'px');
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
      params.default_fs_col = params.default_fs_col * params.ini_scale_font
        .col;
      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
      d3.select(this).select('text')
        .style('font-size', params.default_fs_col + 'px');
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
        .attr('height', params.x_scale.rangeBand() * 0.6)
        .style('fill', 'yellow')
        .style('opacity', 0);
      });

    // add triangle under rotated labels
    col_label_click
      .append('path')
      .style('stroke-width', 0)
      .attr('d', function() {
      // x and y are flipped since its rotated
      var origin_y = -params.border_width;
      var start_x = 0;
      var final_x = params.x_scale.rangeBand() - reduce_rect_width;
      var start_y = -(params.x_scale.rangeBand() - reduce_rect_width +
      params.border_width);
      var final_y = -params.border_width;
      var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' +
        start_x + ', L ' + final_y + ',' + final_x + ' Z';
      return output_string;
      })
      .attr('fill', function(d) {
      var inst_color = '#eee';
      if (Utils.has(params, 'class_colors')) {
        inst_color = params.class_colors.col[d.cl];
      }
      return inst_color;
      });


    //!! get the abs maximum value from row/col use this to make red/blue bars
    // // get the max abs nl_pval (find obj and get nl_pval)
    // enr_max = _.max( col_nodes, function(d) { return Math.abs(d.nl_pval) } ).nl_pval ;

    // the enrichment bar should be 3/4ths of the height of the column labels
    params.bar_scale_col = d3.scale.linear()
      // .domain([0, enr_max])
      .domain([0, 1])
      .range([0, params.norm_label.width.col]);

    // append column value bars
    if (Utils.has(globals.network_data.col_nodes[0], 'value')) {
      col_label_click
      .append('rect')
      .attr('class', 'col_bars')
      // column is rotated - effectively width and height are switched
      .attr('width', function(d) {
        return params.bar_scale_col(d.value);
      })
      // rotate labels - reduce width if rotating
      .attr('height', params.x_scale.rangeBand() * 0.66)
      .attr('fill', function() {
        // return d.color;
        return 'red';
      })
      .attr('opacity', 0.4);
    }

    // add group labels if necessary
    //////////////////////////////////
    if (params.show_dendrogram) {
      // add class label under column label
      var col_class = container_all_col
      .append('g')
      // .attr('transform','translate(0,'+params.norm_label.width.col+')')
      .attr('transform', function() {
        var inst_offset = params.norm_label.width.col + 2;
        return 'translate(0,' + inst_offset + ')';
      })
      .append('g')
      // shift down 1px
      // .attr('transform','translate(0,2)')
      .attr('id', 'col_class');

      // append groups - each will hold a classification rect
      var col_class_ini_group = col_class
      .selectAll('g')
      .data(col_nodes)
      .enter()
      .append('g')
      .attr('class', 'col_class_group')
      .attr('transform', function(d, index) {
        return 'translate(' + params.x_scale(index) + ',0)';
      });

      col_dendrogram = Dendrogram('col', params, col_class_ini_group);

      // optional column callback on click
      if (typeof params.click_group === 'function') {
      col_class_ini_group
        .on('click', function(d) {
        var inst_level = params.group_level.col;
        var inst_group = d.group[inst_level];
        // find all column names that are in the same group at the same group_level
        // get col_nodes
        col_nodes = globals.network_data.col_nodes;
        var group_nodes = [];
        _.each(col_nodes, function(node) {
          // check that the node is in the group
          if (node.group[inst_level] === inst_group) {
          // make a list of genes that are in inst_group at this group_level
          group_nodes.push(node.name);
          }
        });

        // return the following information to the user
        // row or col, distance cutoff level, nodes
        var group_info = {};
        group_info.type = 'col';
        group_info.nodes = group_nodes;
        group_info.info = {
          'type': 'distance',
          'cutoff': inst_level / 10
        };

        // pass information to group_click callback
        params.click_group(group_info);

        });
      }

    }

    // hide spillover from slanted column labels on right side
    container_all_col
      .append('path')
      .style('stroke-width', '0')
      // mini-language for drawing path in d3, used to draw triangle
      .attr('d', 'M 0,0 L 500,-500, L 500,0 Z')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('id', 'right_slant_triangle')
      .attr('transform', 'translate(' + params.clust.dim.width + ',' +
      params.norm_label.width.col + ')');

    // hide spillover from slanted column labels on left side
    container_all_col
      .append('path')
      .style('stroke-width', '0')
      // mini-language for drawing path in d3, used to draw triangle
      .attr('d', 'M 0,0 L 500,-500, L 0,-500 Z')
      .attr('fill', params.background_color)
      .attr('id', 'left_slant_triangle')
      // shift left by 1 px to prevent cutting off labels
      .attr('transform', 'translate(-1,' + params.norm_label.width.col +
      ')');

    // top corner rect
    ///////////////////////////////
    // white rect to cover excess labels
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', params.clust.margin.left)
      .attr('height', params.clust.margin.top)
      .attr('id', 'top_left_white');

    // hide spillover from right
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', '300px')
      .attr('height', '3000px')
      .attr('transform', function() {
      var tmp_left = params.clust.margin.left + params.clust.dim.width;
      var tmp_top = params.norm_label.margin.top + params.norm_label.width
        .col;
      return 'translate(' + tmp_left + ',' + tmp_top + ')';
      })
      .attr('class', 'white_bars');


    // only make the super titles if they are requested
    if (params.super_labels) {

      // super col title
      /////////////////////////////////////
      // add super column title background
      d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('height', params.super_label_width + 'px')
      .attr('width', '3000px')
      .attr('class', 'white_bars')
      .attr('transform', 'translate(0,' + params.grey_border_width + ')');

      // super col title
      d3.select('#main_svg')
      .append('text')
      .text(params.super.col)
      .attr('text-anchor', 'center')
      .attr('transform', function() {
        var inst_x = params.clust.dim.width / 2 + params.norm_label.width
          .row;
        var inst_y = params.super_label_width - params.uni_margin;
        return 'translate(' + inst_x + ',' + inst_y + ')';
      })
      .style('font-size', '14px')
      .style('font-weight', 300);

      // super row title
      /////////////////////////////////////
      // add super row title background
      d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', params.super_label_width + 'px')
      .attr('height', '3000px')
      .attr('class', 'white_bars')
      .attr('transform', 'translate(' + params.grey_border_width + ',0)');

      // append super title row group
      // this is used to separate translation from rotation
      d3.select('#main_svg')
      .append('g')
      .attr('id', 'super_row_label')
      .attr('transform', function() {
        // position in the middle of the clustergram
        var inst_x = params.super_label_width - params.uni_margin;
        var inst_y = params.clust.dim.height / 2 + params.norm_label.width
          .col;
        return 'translate(' + inst_x + ',' + inst_y + ')';
      });

      // super row label (rotate the already translated title )
      d3.select('#super_row_label')
      .append('text')
      .text(params.super.row)
      .attr('text-anchor', 'center')
      .attr('transform', 'rotate(-90)')
      .style('font-size', '14px')
      .style('font-weight', 300);

    }

    // white border bottom - prevent clustergram from hitting border
    ///////////////////////////////////////////////////////////////////
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.background_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      // make this border twice the width of the grey border
      .attr('height', 2 * params.grey_border_width)
      .attr('transform', function() {
      // shift up enough to show the entire border width
      var inst_offset = params.svg_dim.height - 3 * params.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
      });

    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////
    // left border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.super_border_color) //!! prog_colors
      .attr('width', params.grey_border_width)
      .attr('height', params.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.super_border_color) //!! prog_colors
      .attr('width', params.grey_border_width)
      .attr('height', params.svg_dim.height)
      .attr('transform', function() {
      var inst_offset = params.svg_dim.width - params.grey_border_width;
      return 'translate(' + inst_offset + ',0)';
      });

    // top border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.super_border_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      .attr('height', params.grey_border_width)
      .attr('transform', function() {
      var inst_offset = 0;
      return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    d3.select('#main_svg')
      .append('rect')
      .attr('fill', params.super_border_color) //!! prog_colors
      .attr('width', params.svg_dim.width)
      .attr('height', params.grey_border_width)
      .attr('transform', function() {
      var inst_offset = params.svg_dim.height - params.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
      });

    // initialize zoom and translate
    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.clust.margin.left, params.clust.margin.top]);

    // resize window
    d3.select(window).on('resize', resize_to_screen);

    // disable double-click zoom: double click should reset zoom level
    // do this for all svg elements
    d3.selectAll('svg').on('dblclick.zoom', null);

    // double click to reset zoom - add transition
    d3.select('#main_svg')
      .on('dblclick', function() {
      // apply the following two translate zoom to reset zoom
      // programatically
      two_translate_zoom(0, 0, 1);
      });
  }

  // initialize clustergram: size, scales, etc.
  function initialize_visualization(network_data, params) {

    // Define Visualization Dimensions
    ///////////////////////////////////////

    // grey_border
    ///////////////////
    // the outermost part of the visualization
    params.grey_border_width = 3;

    // the distance between labels and clustergram
    // a universal margin for the clustergram
    params.uni_margin = 4;
    params.uni_margin_row = 2;

    // Super Labels
    ///////////////////
    // super label width - the labels are 20px wide if they are included
    if (params.super_labels) {
      // include super labels
      params.super_label_width = 20;
    } else {
      // do not include super labels
      params.super_label_width = 0;
    }

    // Variable Label Widths
    //////////////////////////
    // based on the length of the row/col labels - longer labels mean more space given
    // get row col data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;
    // find the label with the most characters and use it to adjust the row and col margins
    var row_max_char = _.max(row_nodes, function(inst) {
      return inst.name.length;
    }).name.length;
    var col_max_char = _.max(col_nodes, function(inst) {
      return inst.name.length;
    }).name.length;
    // define label scale parameters: the more characters in the longest name, the larger the margin
    var min_num_char = 5;
    var max_num_char = 60;
    var min_label_width = 120;
    var max_label_width = 320;
    var label_scale = d3.scale.linear().domain([min_num_char, max_num_char])
      .range([min_label_width, max_label_width]).clamp('true');

    // rotated column labels - approx trig
    params.norm_label = {};
    params.norm_label.width = {};

    // allow the user to increase or decrease the overall size of the labels
    params.norm_label.width.row = label_scale(row_max_char) * params.row_label_scale;
    params.norm_label.width.col = 0.8 * label_scale(col_max_char) * params.col_label_scale;

    // normal label margins
    params.norm_label.margin = {};
    params.norm_label.margin.left = params.grey_border_width + params.super_label_width;
    params.norm_label.margin.top = params.grey_border_width + params.super_label_width;
    // norm label background width, norm-label-width plus class-width plus maring
    params.norm_label.background = {};
    params.norm_label.background.row = params.norm_label.width.row + params
      .class_room.row + params.uni_margin;
    params.norm_label.background.col = params.norm_label.width.col + params
      .class_room.col + params.uni_margin;

    // clustergram dimensions
    params.clust = {};
    params.clust.margin = {};
    // clust margin is the margin of the norm_label plus the width of the entire norm_label group
    params.clust.margin.left = params.norm_label.margin.left + params.norm_label
      .background.row;
    params.clust.margin.top = params.norm_label.margin.top + params.norm_label
      .background.col;


    // calc clustergram dimensions
    /////////////////////////////////////
    // prevent narrow tiles and prevent stretched rows

    // svg size: less than svg size
    ///////////////////////////////////
    // 0.8 approximates the trigonometric distance required for hiding the spillover
    params.spillover_x_offset = label_scale(col_max_char) * 0.8 * params.col_label_scale;

    // get height and width from parent div
    params.svg_dim = {};
    params.svg_dim.width = Number(d3.select('#' + params.svg_div_id).style(
      'width').replace('px', ''));
    params.svg_dim.height = Number(d3.select('#' + params.svg_div_id).style(
      'height').replace('px', ''));

    // reduce width by row/col labels and by grey_border width (reduce width by less since this is less aparent with slanted col labels)
    var ini_clust_width = params.svg_dim.width - (params.super_label_width +
      label_scale(row_max_char)*params.row_label_scale + params.class_room.row) - params.grey_border_width -
      params.spillover_x_offset;
    // there is space between the clustergram and the border
    var ini_clust_height = params.svg_dim.height - (params.super_label_width +
      0.8 * label_scale(col_max_char)*params.col_label_scale + params.class_room.col) - 5 *
      params.grey_border_width;

    // the visualization dimensions can be smaller than the svg
    // if there are not many rows the clustergram width will be reduced, but not the svg width
    //!! needs to be improved
    var prevent_col_stretch = d3.scale.linear().domain([1, 20]).range([0.05,
      1
    ]).clamp('true');

    // clust_dim - clustergram dimensions (the clustergram is smaller than the svg)
    params.clust.dim = {};
    params.clust.dim.width = ini_clust_width * prevent_col_stretch(
      col_nodes.length);

    // clustergram height
    ////////////////////////
    // ensure that rects are never taller than they are wide
    // force square tiles
    if (ini_clust_width / col_nodes.length < ini_clust_height / row_nodes.length) {

      // scale the height
      params.clust.dim.height = ini_clust_width * (row_nodes.length /
      col_nodes.length);

      // keep track of whether or not a force square has occurred
      // so that I can adjust the font accordingly
      params.force_square = 1;

      // make sure that force_square does not cause the entire visualization
      // to be taller than the svg, if it does, then undo
      if (params.clust.dim.height > ini_clust_height) {
      // make the height equal to the width
      params.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.force_square = 0;
      }
    }
    // do not force square tiles
    else {
      // the height will be calculated normally - leading to wide tiles
      params.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.force_square = 0;
    }

    // Define Orderings
    ////////////////////////////
    // scaling functions to position rows and tiles, define rangeBands
    params.x_scale = d3.scale.ordinal().rangeBands([0, params.clust.dim.width]);
    params.y_scale = d3.scale.ordinal().rangeBands([0, params.clust.dim.height]);

    // Define Orderings
    params.orders = {
      name: d3.range(col_nodes.length).sort(function(a, b) {
      return d3.ascending(col_nodes[a].name, col_nodes[b].name);
      }),
      // rank
      rank_row: d3.range(col_nodes.length).sort(function(a, b) {
      return col_nodes[b].rank - col_nodes[a].rank;
      }),
      rank_col: d3.range(row_nodes.length).sort(function(a, b) {
      return row_nodes[b].rank - row_nodes[a].rank;
      }),
      // clustered
      clust_row: d3.range(col_nodes.length).sort(function(a, b) {
      return col_nodes[b].clust - col_nodes[a].clust;
      }),
      clust_col: d3.range(row_nodes.length).sort(function(a, b) {
      return row_nodes[b].clust - row_nodes[a].clust;
      }),
      // class
      class_row: d3.range(col_nodes.length).sort(function(a, b) {
      return col_nodes[b].cl - col_nodes[a].cl;
      }),
      class_col: d3.range(row_nodes.length).sort(function(a, b) {
      return row_nodes[b].cl - row_nodes[a].cl;
      })
    };

    // Assign initial ordering for x_scale and y_scale
    if (params.inst_order === 'clust') {
      params.x_scale.domain(params.orders.clust_row);
      params.y_scale.domain(params.orders.clust_col);
    } else if (params.inst_order === 'rank') {
      params.x_scale.domain(params.orders.rank_row);
      params.y_scale.domain(params.orders.rank_col);
    } else if (params.inst_order === 'class') {
      params.x_scale.domain(params.orders.class_row);
      params.y_scale.domain(params.orders.class_col);
    }

    // visualization parameters
    //////////////////////////////

    // border_width - width of white borders around tiles
    params.border_width = params.x_scale.rangeBand() / 40;

    // zoom_switch from 1 to 2d zoom
    params.zoom_switch = (params.clust.dim.width / col_nodes.length) / (
      params.clust.dim.height / row_nodes.length);
    // zoom_switch can not be less than 1
    if (params.zoom_switch < 1) {
      params.zoom_switch = 1;
    }

    // font size controls
    ////////////////////////////
    // min and max number of expected nodes
    var min_node_num = 10;
    var max_node_num = 3000;

    // min and max font sizes
    var min_fs = 0.05;
    var max_fs = 15;

    // min and max expected screen widths
    var min_viz_width = 400;
    var max_viz_width = 2000;

    // make a scale that will set the initial font size based on the number of nodes
    d3
      .scale
      .log()
      .domain([min_node_num, max_node_num])
      .range([max_fs, min_fs])
      .clamp('true');
    // scale font offset, when the font size is the height of the rects then it should be almost the full width of the rects
    // when the font size is small, then the offset should be almost equal to half the rect width
    params.scale_font_offset = d3.scale.linear().domain([1, 0]).range([0.8,
      0.5
    ]);

    // controls how much the font size increases during zooming
    // 1: do not increase font size while zooming
    // 0: increase font size while zooming
    // allow some increase in font size when zooming
    var min_fs_zoom = 0.95;
    // allow full increase in font size when zooming
    var max_fs_zoom = 0.0;
    // make a scale that will control how the font size changes with zooming based on the number of nodes
    var scale_reduce_font_size_factor = d3.scale.log().domain([min_node_num,
      max_node_num
    ]).range([min_fs_zoom, max_fs_zoom]).clamp('true');

    // define screen width font size scale
    // having a small screen width should reduce the font size of the columns
    // this will be compensated by increasing the available real zoom
    //!! this can be improved

    // scale_fs_screen_width
    d3
      .scale
      .linear()
      .domain([min_viz_width, max_viz_width])
      .range([0.75, 1.15])
      .clamp('true');

    // scale_fs_screen_height
    d3
      .scale
      .linear()
      .domain([min_viz_width, max_viz_width])
      .range([0.75, 1.15])
      .clamp('true');

    // the default font sizes are set here
    // params.default_fs_row = scale_font_size(row_nodes.length)* scale_fs_screen_height(params.clust.dim.height);
    params.default_fs_row = params.y_scale.rangeBand() * 0.9;
    // the colum font size is scaled by the width
    //!! make this local later
    // params.default_fs_col = scale_font_size(col_nodes.length)* scale_fs_screen_width(params.clust.dim.width);
    params.default_fs_col = params.x_scale.rangeBand() * 0.7;

    // font size zooming parameters
    params.zoom_scale_font = {};
    params.zoom_scale_font.row = 1;
    params.zoom_scale_font.col = 1;


    // // correct for forcing the tiles to be squares - if they are forced, then use the col font size for the row
    // if (params.force_square === 1){
    //   // scale the row font size by the col scaling
    //   params.default_fs_row = params.default_fs_col;
    // }

    // calculate the reduce font-size factor: 0 for no reduction in font size and 1 for full reduction of font size
    params.reduce_font_size = {};
    params.reduce_font_size.row = scale_reduce_font_size_factor(row_nodes.length);
    params.reduce_font_size.col = scale_reduce_font_size_factor(col_nodes.length);

    // set up the real zoom (2d zoom) as a function of the number of col_nodes
    // since these are the nodes that are zoomed into in 2d zooming
    var real_zoom_scale_col = d3.scale.linear().domain([min_node_num,
      max_node_num
    ]).range([2, 5]).clamp('true');

    // scale the zoom based on the screen size
    // smaller screens can zoom in more, compensates for reduced font size with small screen
    var real_zoom_scale_screen = d3.scale.linear().domain([min_viz_width,
      max_viz_width
    ]).range([2, 1]).clamp('true');
    // calculate the zoom factor - the more nodes the more zooming allowed
    params.real_zoom = real_zoom_scale_col(col_nodes.length) *
      real_zoom_scale_screen(params.clust.dim.width);

    // set opacity scale
    var max_link = _.max(network_data.links, function(d) {
      return Math.abs(d.value);
    });


    // set opacity_scale
    // input domain of 0 means set the domain automatically
    if (params.input_domain === 0) {
      // set the domain using the maximum absolute value
      if (params.opacity_scale === 'linear') {
      params.opacity_scale = d3.scale.linear().domain([0, Math.abs(
        max_link.value)]).clamp(true).range([0.0, 1.0]);
      } else if (params.opacity_scale === 'log') {
      params.opacity_scale = d3.scale.log().domain([0.001, Math.abs(
        max_link.value)]).clamp(true).range([0.0, 1.0]);
      }
    } else {
      // set the domain manually
      if (params.opacity_scale === 'linear') {
      params.opacity_scale = d3.scale.linear().domain([0, params.input_domain])
        .clamp(true).range([0.0, 1.0]);
      } else if (params.opacity_scale === 'log') {
      params.opacity_scale = d3.scale.log().domain([0.001, params.input_domain])
        .clamp(true).range([0.0, 1.0]);
      }
    }

    // not running a transition
    params.run_trans = false;

    // console.log(network_data.links[0])
    // define tile type: rect, group
    // rect is the default faster and simpler option
    // group is the optional slower and more complex option that is activated with: highlighting or split tiles
    // if ( Utils.has(network_data.links[0], 'value_up') || Utils.has(network_data.links[0], 'highlight') ){
    if (Utils.has(network_data.links[0], 'value_up') || Utils.has(network_data.links[
      0], 'highlight')) {
      params.tile_type = 'group';
      // console.log('making group tiles');
    } else {
      params.tile_type = 'simple';
      // console.log('making group tiles');
    }

    // check if rects should be highlighted
    if (Utils.has(globals.network_data.links[0], 'highlight')) {
      params.highlight = 1;
    } else {
      params.highlight = 0;
    }

    return params;
  }

  // parent_div: size and position svg container - svg_div
  function parent_div_size_pos(params) {

    if (params.resize) {
      // get outer_margins
      var outer_margins = params.outer_margins;

      // get the size of the window
      var screen_width = window.innerWidth;
      var screen_height = window.innerHeight;

      // define width and height of clustergram container
      var cont_dim = {};
      cont_dim.width  = screen_width  - outer_margins.left - outer_margins.right;
      cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

      // size the svg container div - svg_div
      d3.select('#' + params.svg_div_id)
          .style('margin-left', outer_margins.left + 'px')
          .style('margin-top', outer_margins.top + 'px')
          .style('width', cont_dim.width + 'px')
          .style('height', cont_dim.height + 'px');
          
    } else {
      // get outer_margins
      outer_margins = params.outer_margins;

      // size the svg container div - svg_div
      d3.select('#' + params.svg_div_id)
          .style('margin-left', outer_margins.left + 'px')
          .style('margin-top',  outer_margins.top + 'px');
    }
  }


  /* Resize clustergram to fit screen size.
   */
  function resize_to_screen() {
    // Only resize if allowed
    if (globals.params.resize) {
      setTimeout(reset_visualization_size, 500);
    }
  }

  // recalculate the size of the visualization
  // and remake the clustergram
  function reset_visualization_size() {

      viz.remake();

      // reset zoom and translate
      globals.params.zoom.scale(1).translate(
          [globals.params.clust.margin.left, globals.params.clust.margin.top]
      );
  }

  /* Transpose network.
 */
function transpose_network(net) {
  var tnet = {},
      inst_link,
      i;

  tnet.row_nodes = net.col_nodes;
  tnet.col_nodes = net.row_nodes;
  tnet.links = [];

  for (i = 0; i < net.links.length; i++) {
    inst_link = {};
    inst_link.source = net.links[i].target;
    inst_link.target = net.links[i].source;
    inst_link.value = net.links[i].value;

    // Optional highlight.
    if (Utils.has(net.links[i], 'highlight')) {
      inst_link.highlight = net.links[i].highlight;
    }
    if (Utils.has(net.links[i], 'value_up')) {
      inst_link.value_up = net.links[i].value_up;
    }
    if (Utils.has(net.links[i], 'value_dn')) {
      inst_link.value_dn = net.links[i].value_dn;
    }
    if (Utils.has(net.links[i], 'info')) {
      inst_link.info = net.links[i].info;
    }
    tnet.links.push(inst_link);
  }

  return tnet;
}

  return {
    remake: function() {
      make(config);
    },
    change_group: function(inst_rc, inst_index) {
      if (inst_rc === 'row') {
        row_dendrogram.change_groups(inst_index);
      } else {
        col_dendrogram.change_groups(inst_index);
      }
    },
    get_clust_group: function(){
      return matrix.get_clust_group();
    },
    get_matrix: function(){
      return matrix.get_matrix();
    },
    get_nodes: function(type){
      return matrix.get_nodes(type);
    }
  }

}