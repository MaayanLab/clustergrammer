
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

    // Super Labels 
    if (params.labels.super_labels) {

      // make super labels 
      var super_labels = SuperLabels();
      super_labels.make(params);      

    }

    // Spillover Divs 
    var spillover = Spillover(params, container_all_col);

    // initialize zoom and translate

    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

    // resize window
    if (params.viz.resize){
      d3.select(window).on('resize', function(){
        setTimeout(reset_visualization_size, 500);
      });
    }

    // initialize double click zoom for matrix 
    zoom.ini_doubleclick();
  }

  function reset_visualization_size() {

    // !! do not remake visualization on screen size, resize only 
    // viz.remake();

    // get outer_margins
    var outer_margins = params.viz.outer_margins;

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

    // resize the svg 
    var svg_group = d3.select('#' + params.viz.svg_div_id)
      .select('svg')
      .attr('id', 'main_svg')
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.svg_dim.height)

      // optional transition 
      // .transition().duration(1000);

    // redefine x_scale and y_scale 
    // scaling functions to position rows and tiles, define rangeBands
    params.matrix.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);
    params.matrix.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

    // Assign initial ordering for x_scale and y_scale
    if (params.viz.inst_order === 'ini') {
      params.matrix.x_scale.domain(params.matrix.orders.ini_row);
      params.matrix.y_scale.domain(params.matrix.orders.ini_col);
    } else if (params.viz.inst_order === 'clust') {
      params.matrix.x_scale.domain(params.matrix.orders.clust_row);
      params.matrix.y_scale.domain(params.matrix.orders.clust_col);
    } else if (params.viz.inst_order === 'rank') {
      params.matrix.x_scale.domain(params.matrix.orders.rank_row);
      params.matrix.y_scale.domain(params.matrix.orders.rank_col);
    } else if (params.viz.inst_order === 'class') {
      params.matrix.x_scale.domain(params.matrix.orders.class_row);
      params.matrix.y_scale.domain(params.matrix.orders.class_col);
    }

    // resize tiles 
    svg_group.selectAll('.tile')
      .attr('width', params.matrix.x_scale.rangeBand())
      .attr('height', params.matrix.y_scale.rangeBand())
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.pos_x) + ',0)';
      });

    svg_group.selectAll('.row')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      });

    // resize row labels 
    ///////////////////////////

    svg_group.select('#row_container')
      .attr('transform', 'translate(' + params.norm_label.margin.left + ',' +
      params.viz.clust.margin.top + ')');

    svg_group.select('#row_container')
      .select('white_bars')
      .attr('width', params.norm_label.background.row)
      .attr('height', params.viz.clust.dim.height + 'px');

    svg_group.select('#row_container')
      .select('label_container')
      .attr('transform', 'translate(' + params.norm_label.width.row + ',0)')

    svg_group.selectAll('.row_label_text')
      .attr('transform', function(d, index) {
        return 'translate(0,' + params.matrix.y_scale(index) + ')';
      })

    svg_group.selectAll('.row_label_text')
      .attr('y', params.matrix.y_scale.rangeBand() * 0.75)
      .style('font-size', params.labels.defalut_fs_row + 'px');

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

        row_labels
          .append('rect')
          .attr('class', 'row_bars')
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
          .attr('height', params.matrix.y_scale.rangeBand() )
          .attr('fill', function(d) {
            return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
          })
          .attr('opacity', 0.4);

        }    

    // reposition grid lines 
     

    // reset zoom and translate
    params.zoom.scale(1).translate(
        [ params.viz.clust.margin.left, params.viz.clust.margin.top]
    );
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
