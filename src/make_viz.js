var generate_matrix = require('./matrix');
var make_row_label_container = require('./labels/make_row_label_container');
var make_col_label_container = require('./labels/make_col_label_container');
var generate_super_labels = require('./labels/super_labels');
var spillover = require('./spillover/main_spillover');
var initialize_resizing = require('./initialize_resizing');
var ini_doubleclick = require('./zoom/ini_doubleclick');
var make_col_cat = require('./categories/make_col_cat');
var make_row_cat = require('./categories/make_row_cat');
var trim_text = require('./zoom/trim_text');
var make_row_dendro = require('./dendrogram/make_row_dendro');
var make_col_dendro = require('./dendrogram/make_col_dendro');
var build_dendro_sliders = require('./dendrogram/build_dendro_sliders');
// var build_tree_icon = require('./menus/build_tree_icon');
// var build_filter_icon = require('./menus/build_filter_icon');
var make_row_dendro_spillover = require('./spillover/make_row_dendro_spillover');
var underscore = require('underscore');

module.exports = function make_viz(cgm) {

  var params = cgm.params;

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

  make_row_label_container(cgm);

  if (params.viz.show_dendrogram){
    make_row_dendro(cgm);
    make_col_dendro(cgm);
    make_row_dendro_spillover(cgm);
  }

  make_col_label_container(cgm);

  // initial trim text
  if (params.viz.ds_level === -1){
    underscore.each(['row','col'], function(inst_rc){

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
  }


  // make category colorbars
  make_row_cat(cgm);
  if (params.viz.show_categories.col) {
    make_col_cat(cgm);
  }

  spillover(cgm);

  if (params.labels.super_labels) {
    generate_super_labels(params);
  }


  // // disable recluster and filter icons
  // //////////////////

  // // sliders should go above super labels
  // build_tree_icon(cgm);

  // build_filter_icon(cgm);

  build_dendro_sliders(cgm);




  function border_colors() {
    var inst_color = params.viz.super_border_color;
    if (params.viz.is_expand || params.show_viz_border == false) {
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

  initialize_resizing(cgm);

  ini_doubleclick(cgm);

  if (params.viz.do_zoom) {
    d3.select(params.viz.zoom_element)
      .call(params.zoom_behavior);
  }

  d3.select(params.viz.zoom_element)
    .on('dblclick.zoom', null);

};
