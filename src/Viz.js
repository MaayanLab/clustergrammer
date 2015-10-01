
/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
function Viz(config) {

  // scope these variables to viz
  var matrix,
  row_dendrogram,
  col_dendrogram,
  zoom,
  params,
  reorder;

  // make viz
  make(config);

  /* The main function; makes clustergram based on user arguments.
   */
  function make(config) {

    // initialize clustergram variables
    params = VizParams(config);

    var network_data = params.network_data;

    // set local variables from network_data
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;

    // Begin Making Visualization
    /////////////////////////////////

    // !! needs to be improved
    // remove any previous visualizations
    d3.select('#main_svg').remove();

    // instantiate zoom object
    zoom = Zoom(params);

    // define the variable zoom, a d3 method
    params.zoom = d3.behavior
      .zoom()
      .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch])
      .on('zoom', zoom.zoomed);

    var svg_group = d3.select('#' + params.viz.svg_div_id)
      .append('svg')
      .attr('id', 'main_svg')
      .attr('width',  params.viz.svg_dim.width)
      .attr('height', params.viz.svg_dim.height);

    if (params.viz.do_zoom) {
      svg_group.call(params.zoom);
    }

    // make the matrix
    /////////////////////////
    matrix = Matrix(network_data, svg_group, params);

    // // append background rect if necessary to control background color
    // if (params.viz.background_color !== '#FFFFFF') {
    //   svg_group
    //   .append('rect')
    //   .attr('id','background_rect')
    //   .attr('width', params.viz.svg_dim.width)
    //   .attr('height', params.viz.svg_dim.height)
    //   .style('fill', params.viz.background_color);
    // }


    // define reordering object - scoped to viz
    reorder = Reorder(params);

    // define labels object
    var labels = Labels(params);

    // row labels
    /////////////////////////
    var row_triangle_ini_group = labels.make_rows( params, row_nodes, reorder );

    // Column Labels
    //////////////////////////////////
    var container_all_col = labels.make_cols( params, col_nodes, reorder );


    // add group labels if necessary
    //////////////////////////////////
    if (params.viz.show_dendrogram) {

      // make row dendrogram
      row_dendrogram = Dendrogram('row', params, row_triangle_ini_group);

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
        return 'translate(' + params.matrix.x_scale(index) + ',0)';
      });

      // make col dendrogram
      col_dendrogram = Dendrogram('col', params, col_class_ini_group);

      // optional column callback on click
      if (typeof params.click_group === 'function') {
      col_class_ini_group
        .on('click', function(d) {
        var inst_level = params.group_level.col;
        var inst_group = d.group[inst_level];
        // find all column names that are in the same group at the same group_level
        // get col_nodes
        col_nodes = params.network_data.col_nodes;
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


    // Spillover Divs
    var spillover = Spillover(params, container_all_col);

    // Super Labels
    if (params.labels.super_labels) {
      var super_labels = SuperLabels();
      super_labels.make(params);
    }

    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

    // resize window
    if (params.viz.resize){
      d3.select(window).on('resize', function(){
        d3.select('#main_svg').style('opacity',0.5);
        var wait_time = 500;
        if (params.viz.run_trans == true){
          wait_time = 2500;
        }
        setTimeout(reset_visualization_size, wait_time);
      });
    }

    if (params.viz.expand_button){

      var expand_opacity = 0.4;
      // add expand button
      d3.select('#main_svg').append('text')
        .attr('id','expand_button')
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-family', 'FontAwesome')
        .attr('font-size', '30px')
        .text(function(d) {
          if (params.viz.expand === false){
            // expand button
            return '\uf0b2';
          } else {
            // menu button
            return '\uf0c9';
          }
        })
        .attr('y','25px')
        .attr('x','25px')
        .style('cursor', 'pointer')
        .style('opacity',expand_opacity)
        .on('mouseover',function(){
          d3.select(this).style('opacity',0.75);
        })
        .on('mouseout',function(){
          d3.select(this).style('opacity',expand_opacity);
        })
        .on('click',function(){

          // expand view
          if (params.viz.expand === false){

            d3.select('#clust_instruct_container')
              .style('display','none');
            d3.select(this)
              .text(function(d){
                // menu button
                return '\uf0c9';
              });
            params.viz.expand = true;

          // contract view 
          } else {

            d3.select('#clust_instruct_container')
              .style('display','block');
            d3.select(this)
              .text(function(d){
                // expand button
                return '\uf0b2';
              });
            params.viz.expand = false;

          }

          // get updated size for visualization
          params.viz.parent_div_size_pos(params);

          d3.select('#main_svg').style('opacity',0.5);
          var wait_time = 500;
          if (params.viz.run_trans == true){
            wait_time = 2500;
          }
          setTimeout(reset_visualization_size, wait_time);
        });
    }

    // initialize double click zoom for matrix
    zoom.ini_doubleclick();
  }

  function reset_visualization_size() {

    // !! do not remake visualization on screen size, resize only
    // viz.remake();

    // reset zoom
    // zoom.two_translate_zoom(0,0,1)
    var zoom_y = 1;
    var zoom_x = 1;
    var pan_dx = 0;
    var pan_dy = 0;


    var half_height = params.viz.clust.dim.height / 2;
    var center_y = -(zoom_y - 1) * half_height;

    // transform clust group
    ////////////////////////////
    // d3.select('#clust_group')
    viz.get_clust_group()
      // first apply the margin transformation
      // then zoom, then apply the final transformation
      .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
      ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,
        pan_dy
      ] + ')');

    // transform row labels
    d3.select('#row_labels')
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
      zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

    // transform row_label_triangles
    // use the offset saved in params, only zoom in the y direction
    d3.select('#row_label_triangles')
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
      1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

    // transform col labels
    d3.select('#col_labels')
      .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
        pan_dx, 0
      ] + ')');

    // transform col_class
    d3.select('#col_class')
      .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
        pan_dx, 0
      ] + ')');

    // set y translate: center_y is positive, positive moves the visualization down
    // the translate vector has the initial margin, the first y centering, and pan_dy
    // times the scaling zoom_y
    var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

    // reset the zoom translate and zoom
    params.zoom.scale(zoom_y);
    params.zoom.translate([pan_dx, net_y_offset]);

    // get outer_margins
    if ( params.viz.expand == false ){
      var outer_margins = params.viz.outer_margins;
    } else {
      var outer_margins = params.viz.outer_margins_expand;
    }

    // get the size of the window
    var screen_width  = window.innerWidth;
    var screen_height = window.innerHeight;

    // define width and height of clustergram container
    var cont_dim = {};
    cont_dim.width  = screen_width  - outer_margins.left - outer_margins.right;
    cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

    // size the svg container div - svg_div
    d3.select('#' + params.viz.svg_div_id)
        .style('margin-left', outer_margins.left + 'px')
        .style('margin-top',  outer_margins.top  + 'px')
        .style('width',  cont_dim.width  + 'px')
        .style('height', cont_dim.height + 'px');

    // get height and width from parent div
    params.viz.svg_dim = {};
    params.viz.svg_dim.width  = Number(d3.select('#' + params.viz.svg_div_id).style('width').replace('px', ''));
    params.viz.svg_dim.height = Number(d3.select('#' + params.viz.svg_div_id).style('height').replace('px', ''));

    // reduce width by row/col labels and by grey_border width (reduce width by less since this is less aparent with slanted col labels)
    var ini_clust_width = params.viz.svg_dim.width - (params.labels.super_label_width +
      params.norm_label.width.row + params.class_room.row) - params.viz.grey_border_width - params.viz.spillover_x_offset;

    // there is space between the clustergram and the border
    var ini_clust_height = params.viz.svg_dim.height - (params.labels.super_label_width +
      params.norm_label.width.col + params.class_room.col) - 5 * params.viz.grey_border_width;

    // the visualization dimensions can be smaller than the svg
    // if there are not many rows the clustergram width will be reduced, but not the svg width
    //!! needs to be improved
    var prevent_col_stretch = d3.scale.linear()
      .domain([1, 20]).range([0.05,1]).clamp('true');


    // clust_dim - clustergram dimensions (the clustergram is smaller than the svg)
    params.viz.clust.dim.width = ini_clust_width * prevent_col_stretch(params.viz.num_col_nodes);

    // clustergram height
    ////////////////////////
    // ensure that rects are never taller than they are wide
    // force square tiles
    if (ini_clust_width / params.viz.num_col_nodes < ini_clust_height / params.viz.num_row_nodes) {

      // scale the height
      params.viz.clust.dim.height = ini_clust_width * (params.viz.num_row_nodes / params.viz.num_col_nodes);

      // keep track of whether or not a force square has occurred
      // so that I can adjust the font accordingly
      params.viz.force_square = 1;

      // make sure that force_square does not cause the entire visualization
      // to be taller than the svg, if it does, then undo
      if (params.viz.clust.dim.height > ini_clust_height) {
      // make the height equal to the width
      params.viz.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.viz.force_square = 0;
      }
    }
    // do not force square tiles
    else {
      // the height will be calculated normally - leading to wide tiles
      params.viz.clust.dim.height = ini_clust_height;
      // keep track of whether or not a force square has occurred
      params.viz.force_square = 0;
    }

    // zoom_switch from 1 to 2d zoom
    params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

    // zoom_switch can not be less than 1
    if (params.viz.zoom_switch < 1) {
      params.viz.zoom_switch = 1;
    }

    // calculate the zoom factor - the more nodes the more zooming allowed
    params.viz.real_zoom = params.viz.real_zoom_scale_col(params.viz.num_col_nodes) * params.viz.real_zoom_scale_screen(params.viz.clust.dim.width);

    // resize the svg
    ///////////////////////
    var svg_group = d3.select('#' + params.viz.svg_div_id)
      .select('svg')
      .attr('id', 'main_svg')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.svg_dim.height);

    // redefine x_scale and y_scale rangeBands
    params.matrix.x_scale.rangeBands([0, params.viz.clust.dim.width]);
    params.matrix.y_scale.rangeBands([0, params.viz.clust.dim.height]);

    // redefine border width
    params.viz.border_width = params.matrix.x_scale.rangeBand() / 40;

    // the default font sizes are set here
    params.labels.default_fs_row = params.matrix.y_scale.rangeBand() * 0.95;
    params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.75;

    svg_group.select('#grey_background')
      .attr('width', params.viz.clust.dim.width)
      .attr('height', params.viz.clust.dim.height);

    // resize tiles
    ///////////////////
    svg_group.selectAll('.tile')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand())
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      });

    svg_group.selectAll('.tile_group')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand());

    svg_group.selectAll('.row')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    svg_group.selectAll('.highlighting_rect')
      .attr('width', params.matrix.x_scale.rangeBand() * 0.80)
      .attr('height', params.matrix.y_scale.rangeBand() * 0.80);

    svg_group.selectAll('.tile_split_up')
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = 0;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var output_string = 'M' + start_x + ',' + start_y + ', L' +
          start_x + ', ' + final_y + ', L' + final_x + ',0 Z';
        return output_string;
      })

    svg_group.selectAll('.tile_split_dn')
      .attr('d', function() {
        var start_x = 0;
        var final_x = params.matrix.x_scale.rangeBand();
        var start_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var final_y = params.matrix.y_scale.rangeBand() - params.matrix.y_scale.rangeBand()/60;
        var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' +
          final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';
        return output_string;
      })


    // resize row labels
    ///////////////////////////

    svg_group.select('#row_container')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');

    svg_group.select('#row_container')
      .select('.white_bars')
      .attr('width', params.norm_label.background.row)
      .attr('height', 30*params.viz.clust.dim.height + 'px');

    svg_group.select('#row_container')
      .select('.label_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.selectAll('.row_label_text')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    svg_group.selectAll('.row_label_text')
      .select('text')
      .attr('y', params.matrix.y_scale.rangeBand() * 0.75)

    svg_group.selectAll('.row_label_text')
      .select('text')
      .style('font-size', params.labels.default_fs_row + 'px');

    // change the size of the highlighting rects
    svg_group.selectAll('.row_label_text')
      .each(function() {
        var bbox = d3.select(this)
            .select('text')[0][0]
          .getBBox();
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
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)');

    svg_group.select('#row_label_viz')
      .select('white_bars')
      .attr('width', params.class_room.row + 'px')
      .attr('height', function() {
        var inst_height = params.viz.clust.dim.height;
        return inst_height;
      });

    svg_group.selectAll('.row_triangle_group')
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
          .attr('transform', function(d, index) {
            return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
          });

        svg_group.selectAll('.col_label_click')
          .attr('transform', 'translate(' + params.matrix.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

        svg_group.selectAll('.col_label_click')
          .select('text')
          .attr('y', params.matrix.x_scale.rangeBand() * 0.60)
          .attr('dx', 2 * params.viz.border_width)
          .style('font-size', params.labels.default_fs_col + 'px');

        params.bounding_width_max.col = 0;
        svg_group.selectAll('.col_label_click').each(function() {
          var tmp_width = d3.select(this).select('text').node().getBBox().width;
          if (tmp_width > params.bounding_width_max.col) {
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
          params.labels.default_fs_row = params.labels.default_fs_row * params.ini_scale_font
            .row;
          // reduce font size
          d3.selectAll('.row_label_text').each(function() {
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_row + 'px');
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
          params.labels.default_fs_col = params.labels.default_fs_col * params.ini_scale_font
            .col;
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




        //!! CHD specific
        // get max value
        var enr_max = Math.abs(_.max( params.network_data.col_nodes, function(d) { return Math.abs(d.value) } ).value) ;
        var enr_min = Math.abs(_.min( params.network_data.col_nodes, function(d) { return Math.abs(d.value) } ).value) ;

        // the enrichment bar should be 3/4ths of the height of the column labels
        params.labels.bar_scale_col = d3.scale
          .linear()
          .domain([enr_min*0.75, enr_max])
          .range([0, params.norm_label.width.col]);

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
          .attr('width', params.matrix.x_scale.rangeBand())
          .attr('height', function() {
            var inst_height = params.class_room.col - 1;
            return inst_height;
          });

        svg_group.selectAll('.col_class_group')
          .attr('transform', function(d, index) {
            return 'translate(' + params.matrix.x_scale(index) + ',0)';
          });

        // reposition grid lines
        ////////////////////////////
        svg_group.selectAll('.horz_lines')
          .attr('transform', function(d, index) {
            return 'translate(0,' + params.matrix.y_scale(index) + ') rotate(0)';
          })

        svg_group.selectAll('.horz_lines')
          .select('line')
          .attr('x2',params.viz.clust.dim.width)
          .style('stroke-width', params.viz.border_width/params.viz.zoom_switch+'px')

        svg_group.selectAll('.vert_lines')
          .attr('transform', function(d, index) {
              return 'translate(' + params.matrix.x_scale(index) + ') rotate(-90)';
          });

        svg_group.selectAll('.vert_lines')
          .select('line')
          .attr('x2', -params.viz.clust.dim.height)
          .style('stroke-width', params.viz.border_width + 'px');

    // resize superlabels
    /////////////////////////////////////
    svg_group.select('#super_col_bkg')
      .attr('height', params.labels.super_label_width + 'px')
      .attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

    // super col title
    svg_group.select('#super_col')
      .attr('transform', function() {
        var inst_x = params.viz.clust.dim.width / 2 + params.norm_label.width
          .row;
        var inst_y = params.labels.super_label_width - params.viz.uni_margin;
        return 'translate(' + inst_x + ',' + inst_y + ')';
      });

    // super row title
    svg_group.select('#super_row_bkg')
      .attr('width', params.labels.super_label_width + 'px')
      .attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

    // append super title row group
    svg_group.select('#super_row')
      .attr('transform', function() {
        var inst_x = params.labels.super_label_width - params.viz.uni_margin;
        var inst_y = params.viz.clust.dim.height / 2 + params.norm_label.width
          .col;
        return 'translate(' + inst_x + ',' + inst_y + ')';
      });

    // // super row label (rotate the already translated title )
    // d3.select('#super_row_label')
    //   .append('text')
    //   .text(params.labels.super.row)
    //   .attr('text-anchor', 'center')
    //   .attr('transform', 'rotate(-90)')
    //   .style('font-size', '14px')
    //   .style('font-weight', 300);

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


    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////

    // left border
    svg_group.select('#left_border')
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    svg_group.select('#right_border')
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
        return 'translate(' + inst_offset + ',0)';
      });

    // top border
    svg_group.select('#top_border')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = 0;
        return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    svg_group.select('#bottom_border')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function() {
        var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });



    // reset zoom and translate
    //////////////////////////////
    params.zoom.scale(1).translate(
        [ params.viz.clust.margin.left, params.viz.clust.margin.top]
    );

    d3.select('#main_svg').style('opacity',1);
  }

  // highlight resource types - set up type/color association
  var gene_search = Search(params, params.network_data.row_nodes, 'name');

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
    },
    two_translate_zoom: zoom.two_translate_zoom,
    // expose all_reorder function
    reorder: reorder.all_reorder,
    search: gene_search
  }

}
