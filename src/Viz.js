/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
function Viz(params) {

  // scope these variables to viz
  var matrix,
    row_dendrogram,
    col_dendrogram,
    reorder;

  /* The main function; makes clustergram based on user arguments.
   */
  function make() {

    var network_data = params.network_data;
    var col_nodes = network_data.col_nodes;
    var row_nodes = network_data.row_nodes;

    var parts = params.viz.viz_svg.split(' ');
    var viz_svg_class = parts[parts.length-1].replace('.', '');

    // initialize svg
    var svg_group = d3.select(params.viz.viz_wrapper)
      .append('svg')
      .attr('class', viz_svg_class)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.svg_dim.height);

    // add white background 
    svg_group
      .append('rect')
      .attr('class', 'super_background')
      .style('width', params.viz.svg_dim.width)
      .style('height', params.viz.svg_dim.height)
      .style('fill', 'white');

    // make the matrix
    /////////////////////////
    matrix = Matrix(network_data, svg_group, params);

    // define reordering object - scoped to viz
    reorder = Reorder(params);

    // define labels object
    var labels = Labels(params);

    var row_triangle_ini_group = labels.make_rows(params, row_nodes, reorder, 0);
    var container_all_col = labels.make_cols(params, col_nodes, reorder, 0);


    // add group labels if necessary
    //////////////////////////////////
    if (params.viz.show_dendrogram) {

      // make row dendrogram
      row_dendrogram = Dendrogram('row', params);

      // add class label under column label
      var col_class = container_all_col
        .append('g')
        .attr('class', 'col_viz_outer_container')
        .attr('transform', function () {
          var inst_offset = params.norm_label.width.col + 2;
          return 'translate(0,' + inst_offset + ')';
        })
        .append('g')
        .attr('class', 'col_viz_zoom_container');

      // make col dendrogram
      col_dendrogram = Dendrogram('col', params);

    }


    // Spillover Divs
    var spillover = Spillover(params, container_all_col);

    // Super Labels
    if (params.labels.super_labels) {
      SuperLabels(params);
    }

    // tmp add final svg border here
    // add border to svg in four separate lines - to not interfere with clicking anything
    ///////////////////////////////////////////////////////////////////////////////////////
    function border_colors() {
      var inst_color = params.viz.super_border_color;
      if (params.viz.expand) {
        inst_color = 'white';
      }
      return inst_color;
    }

    // left border
    d3.select(params.viz.viz_svg)
      .append('rect')
      .attr('id', 'left_border')
      .attr('class', 'borders')
      .attr('fill', border_colors)
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', 'translate(0,0)');

    // right border
    d3.select(params.viz.viz_svg)
      .append('rect')
      .attr('id', 'right_border')
      .attr('class', 'borders')
      .attr('fill', border_colors)
      .attr('width', params.viz.grey_border_width)
      .attr('height', params.viz.svg_dim.height)
      .attr('transform', function () {
        var inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
        return 'translate(' + inst_offset + ',0)';
      });

    // top border
    d3.select(params.viz.viz_svg)
      .append('rect')
      .attr('id', 'top_border')
      .attr('class', 'borders')
      .attr('fill', border_colors)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function () {
        var inst_offset = 0;
        return 'translate(' + inst_offset + ',0)';
      });

    // bottom border
    d3.select(params.viz.viz_svg)
      .append('rect')
      .attr('id', 'bottom_border')
      .attr('class', 'borders')
      .attr('fill', border_colors)
      .attr('width', params.viz.svg_dim.width)
      .attr('height', params.viz.grey_border_width)
      .attr('transform', function () {
        var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
        return 'translate(0,' + inst_offset + ')';
      });

    ///////////////////////////////////
    // initialize translate vector to compensate for label margins
    params.zoom.translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

    // initialize screen resizing 
    params.initialize_resizing(params);

    // initialize double click zoom for matrix
    ////////////////////////////////////////////
    params.zoom_obj.ini_doubleclick();

    if (params.viz.do_zoom) {
      svg_group.call(params.zoom);
    }

    d3.select(params.viz.viz_svg).on('dblclick.zoom', null);

    return params;
  }


  // highlight resource types - set up type/color association
  var gene_search = Search(params, params.network_data.row_nodes, 'name');

  // change opacity
  var opacity_slider = function (inst_slider) {

    var max_link = params.matrix.max_link;
    var slider_scale = d3.scale
      .linear()
      .domain([0, 1])
      .range([1, 0.1]);

    var slider_factor = slider_scale(inst_slider);

    if (params.matrix.opacity_function === 'linear') {
      params.matrix.opacity_scale = d3.scale.linear()
        .domain([0, slider_factor * Math.abs(params.matrix.max_link)])
        .clamp(true)
        .range([0.0, 1.0]);
    } else if (params.matrix.opacity_function === 'log') {
      params.matrix.opacity_scale = d3.scale.log()
        .domain([0.0001, slider_factor * Math.abs(params.matrix.max_link)])
        .clamp(true)
        .range([0.0, 1.0]);
    }

    d3.selectAll('.tile')
      .style('fill-opacity', function (d) {
        return params.matrix.opacity_scale(Math.abs(d.value));
      });

  }

  function reset_zoom(inst_scale) {
    params.zoom_obj.two_translate_zoom(params, 0, 0, inst_scale);
  }

  make();

  return {
    change_groups: function (inst_rc, inst_index) {
      if (inst_rc === 'row') {
        row_dendrogram.change_groups(inst_rc, inst_index);
      } else {
        col_dendrogram.change_groups(inst_rc, inst_index);
      }
    },
    get_clust_group: function () {
      return matrix.get_clust_group();
    },
    get_matrix: function () {
      return matrix.get_matrix();
    },
    get_nodes: function (type) {
      return matrix.get_nodes(type);
    },
    two_translate_zoom: params.zoom_obj.two_translate_zoom,
    // expose all_reorder function
    reorder: reorder.all_reorder,
    search: gene_search,
    opacity_slider: opacity_slider,
    run_reset_visualization_size: run_reset_visualization_size,
    update_network: update_network,
    draw_gridlines: matrix.draw_gridlines,
    reset_zoom: reset_zoom
  }
}
