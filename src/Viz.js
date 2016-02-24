var generate_matrix = require('./matrix');
var make_rows = require('./labels/make_rows');
var make_cols = require('./labels/make_cols');
var generate_super_labels = require('./labels/super_labels');
var run_spillover = require('./spillover');
var search = require('./search');
var two_translate_zoom = require('./two_translate_zoom');
var initialize_resizing = require('./initialize_resizing');
var ini_doubleclick = require('./ini_doubleclick');

var build_col_dendro = require('./dendrogram/build_col_dendro');
var build_row_dendro = require('./dendrogram/build_row_dendro');

module.exports = function(params) {
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

  var matrix = generate_matrix(params, svg_group);

  // var labels = generate_labels(params);

  var delay_text = 0;
  make_rows(params, delay_text);
  var container_all_col = make_cols(params, delay_text);


  if (params.viz.show_dendrogram) {

    build_row_dendro(params, 'row_class_rect');

    container_all_col
      .append('g')
      .attr('class', 'col_viz_outer_container')
      .attr('transform', function () {
        var inst_offset = params.norm_label.width.col + 2;
        return 'translate(0,' + inst_offset + ')';
      })
      .append('g')
      .attr('class', 'col_viz_container');

    build_col_dendro(params, 'col_class_rect');

  }

  run_spillover(params, container_all_col);

  if (params.labels.super_labels) {
    generate_super_labels(params);
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

  ini_doubleclick(params);

  if (params.viz.do_zoom) {
    svg_group.call(params.zoom_behavior);
  }

  d3.select(params.viz.viz_svg).on('dblclick.zoom', null);

  var search_obj = search(params, params.network_data.row_nodes, 'name');

  var opacity_slider = function (inst_slider) {

    // var max_link = params.matrix.max_link;
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

    d3.selectAll(params.root+' .tile')
      .style('fill-opacity', function (d) {
        return params.matrix.opacity_scale(Math.abs(d.value));
      });

  };

  function reset_zoom(inst_scale) {
    two_translate_zoom(params, 0, 0, inst_scale);
  }

  return {
    get_clust_group: function () {
      return matrix.get_clust_group();
    },
    get_matrix: function () {
      return matrix.get_matrix();
    },
    get_nodes: function(type) {
      return matrix.get_nodes(type);
    },
    find_entity: search_obj.find_entity,
    get_entities: search_obj.get_entities,
    opacity_slider: opacity_slider,
    run_reset_visualization_size: require('./reset_size/run_reset_visualization_size'),
    draw_gridlines: matrix.draw_gridlines,
    reset_zoom: reset_zoom
  };
};
