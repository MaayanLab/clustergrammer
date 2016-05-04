var generate_matrix = require('./matrix');
var make_rows = require('./labels/make_rows');
var make_cols = require('./labels/make_cols');
var generate_super_labels = require('./labels/super_labels');
var spillover = require('./spillover');
var search = require('./search');
var initialize_resizing = require('./initialize_resizing');
var ini_doubleclick = require('./zoom/ini_doubleclick');
var make_col_cat = require('./dendrogram/make_col_cat');
var make_row_cat = require('./dendrogram/make_row_cat');
var trim_text = require('./zoom/trim_text');
var make_row_dendro = require('./dendrogram/make_row_dendro');
var make_col_dendro = require('./dendrogram/make_col_dendro');

module.exports = function make_viz(params) {
  
  d3.select(params.viz.viz_wrapper+' svg')
    .remove();

  var svg_group = d3.select(params.viz.viz_wrapper)
    .append('svg')
    .attr('class', 'viz_svg')
    .attr('id', 'svg_'+params.root.replace('#',''))
    .attr('width', params.viz.svg_dim.width)
    .attr('height', params.viz.svg_dim.height)
    .attr('is_zoom',0)
    .attr('stopped_zoom',1);

  svg_group
    .append('rect')
    .attr('class', 'super_background')
    .style('width', params.viz.svg_dim.width)
    .style('height', params.viz.svg_dim.height)
    .style('fill', 'white');

  generate_matrix(params, svg_group);

  var delay_text = 0;
  make_rows(params, delay_text);

  if (params.viz.show_dendrogram){
    make_row_dendro(params);
    make_col_dendro(params);
  }

  make_cols(params, delay_text);

  _.each(['row','col'], function(inst_rc){
    
    var inst_fs = Number(d3.select('.'+inst_rc+'_label_group')
      .select('text')
      .style('font-size').replace('px',''));

    var min_trim_fs = 8;
    if (inst_fs > min_trim_fs){
      d3.selectAll(params.root+' .'+inst_rc+'_label_group' )
        .each(function() { 
          trim_text(params, this, inst_rc); 
        });
    }

  });
  

  // make category colorbars
  make_row_cat(params);
  if (params.viz.show_categories.col) {
    make_col_cat(params);
  }
    
  spillover(params);

  if (params.labels.super_labels) {
    generate_super_labels(params);
  }

  function border_colors() {
    var inst_color = params.viz.super_border_color;
    if (params.viz.is_expand) {
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
    d3.select(params.viz.zoom_element)
    // d3.select(params.root+' .clust_container')
      .call(params.zoom_behavior);
  }

  d3.select(params.viz.zoom_element)
  // d3.select(params.root+' .clust_container')
    .on('dblclick.zoom', null);

  search(params, params.network_data.row_nodes, 'name');

  // var opacity_slider = function (inst_slider) {

  //   // var max_link = params.matrix.max_link;
  //   var slider_scale = d3.scale
  //     .linear()
  //     .domain([0, 1])
  //     .range([1, 0.1]);

  //   var slider_factor = slider_scale(inst_slider);

  //   if (params.matrix.opacity_function === 'linear') {
  //     params.matrix.opacity_scale = d3.scale.linear()
  //       .domain([0, slider_factor * Math.abs(params.matrix.max_link)])
  //       .clamp(true)
  //       .range([0.0, 1.0]);
  //   } else if (params.matrix.opacity_function === 'log') {
  //     params.matrix.opacity_scale = d3.scale.log()
  //       .domain([0.0001, slider_factor * Math.abs(params.matrix.max_link)])
  //       .clamp(true)
  //       .range([0.0, 1.0]);
  //   }

  //   d3.selectAll(params.root+' .tile')
  //     .style('fill-opacity', function (d) {
  //       return params.matrix.opacity_scale(Math.abs(d.value));
  //     });

  // };

  // function reset_zoom(inst_scale) {
  //   two_translate_zoom(params, 0, 0, inst_scale);
  // }

};
