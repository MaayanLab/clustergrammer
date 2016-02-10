/* Represents the entire visualization: labels, dendrogram (optional) and matrix.
 */
function Viz(params) {
  
  var svg_group = d3.select(params.viz.viz_wrapper)
    .append('svg')
    .attr('class', 'viz_svg')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', params.viz.svg_dim.height);

  svg_group
    .append('rect')
    .attr('class', 'super_background')
    .style('width', params.viz.svg_dim.width)
    .style('height', params.viz.svg_dim.height)
    .style('fill', 'white');

  var matrix = Matrix(params, svg_group);

  var reorder = Reorder(params);

  var labels = Labels(params);

  var delay_text = 0;
  var row_triangle_ini_group = labels.make_rows(params, reorder, delay_text);
  var container_all_col      = labels.make_cols(params, reorder, delay_text);


  if (params.viz.show_dendrogram) {

    var row_dendrogram = Dendrogram('row', params);

    var col_class = container_all_col
      .append('g')
      .attr('class', 'col_viz_outer_container')
      .attr('transform', function () {
        var inst_offset = params.norm_label.width.col + 2;
        return 'translate(0,' + inst_offset + ')';
      })
      .append('g')
      .attr('class', 'col_viz_zoom_container');

    var col_dendrogram = Dendrogram('col', params);

  }

  var spillover = Spillover(params, container_all_col);

  if (params.labels.super_labels) {
    SuperLabels(params);
  }

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
    .classed('left_border',true)
    .classed('borders',true)
    .attr('fill', border_colors)
    .attr('width', params.viz.grey_border_width)
    .attr('height', params.viz.svg_dim.height)
    .attr('transform', 'translate(0,0)');

  // right border
  d3.select(params.viz.viz_svg)
    .append('rect')
    .classed('right_border',true)
    .classed('borders',true)
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
    .classed('top_border',true)
    .classed('borders',true)
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
    .classed('bottom_border',true)
    .classed('borders',true)
    .attr('fill', border_colors)
    .attr('width', params.viz.svg_dim.width)
    .attr('height', params.viz.grey_border_width)
    .attr('transform', function () {
      var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
    });

  initialize_resizing(params);

  var zoom_obj = Zoom(params);  

  zoom_obj.ini_doubleclick(params);

  if (params.viz.do_zoom) {
    svg_group.call(params.zoom);
  }

  d3.select(params.viz.viz_svg).on('dblclick.zoom', null);

  var gene_search = Search(params, params.network_data.row_nodes, 'name');

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
    zoom_obj.two_translate_zoom(params, 0, 0, inst_scale);
  }

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
    two_translate_zoom: zoom_obj.two_translate_zoom,
    reorder: reorder.all_reorder,
    search: gene_search,
    opacity_slider: opacity_slider,
    run_reset_visualization_size: run_reset_visualization_size,
    update_network: update_network,
    draw_gridlines: matrix.draw_gridlines,
    reset_zoom: reset_zoom
  }
}
