var generate_matrix = require('./matrix');
var make_rows = require('./labels/make_rows');
var make_cols = require('./labels/make_cols');
var generate_super_labels = require('./labels/super_labels');
var spillover = require('./Spillover');
var initialize_resizing = require('./initialize_resizing');
var ini_doubleclick = require('./zoom/ini_doubleclick');
var make_col_cat = require('./dendrogram/make_col_cat');
var make_row_cat = require('./dendrogram/make_row_cat');
var trim_text = require('./zoom/trim_text');
var make_row_dendro = require('./dendrogram/make_row_dendro');
var make_col_dendro = require('./dendrogram/make_col_dendro');
var make_svg_dendro_sliders = require('./dendrogram/make_svg_dendro_sliders');
var make_dendro_crop_buttons = require('./dendrogram/make_dendro_crop_buttons');

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

  var delay_text = 0;
  make_rows(cgm, delay_text);

  if (params.viz.show_dendrogram){
    make_row_dendro(cgm);
    make_col_dendro(cgm);
  }

  var viz = params.viz;
  // hide spillover from right
  // -----------------------------------------------------
  var tmp_left = viz.clust.margin.left +
    viz.clust.dim.width +
    viz.uni_margin +
    viz.dendro_room.row;
  var r_spill_container = d3.select(viz.viz_svg)
    .append('g')
    .classed('right_spillover_container', true)
    .attr('transform', function() {
      return 'translate(' + tmp_left + ', 0)';
    });

  var tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

  r_spill_container
    .append('rect')
    .attr('fill', viz.background_color) //!! prog_colors
    .attr('width', 10*viz.clust.dim.width)
    .attr('height', viz.svg_dim.height+'px')
    .attr('class', 'white_bars')
    .attr('class','right_spillover')
    .attr('transform', function() {
      return 'translate( 0,' + tmp_top + ')';
    });

  var x_offset = 0;
  var y_offset = viz.clust.margin.top;
  r_spill_container
    .append('g')
    .classed('row_dendro_icons_container', true)
    .attr('transform', 'translate(' + x_offset + ','+ y_offset +')')
    .append('g')
    .classed('row_dendro_icons_group', true);

  make_dendro_crop_buttons(cgm);

  // hide spillover from top of row dendrogram
  x_offset = viz.clust.margin.left + viz.clust.dim.width;
  y_offset = tmp_top;

  var tmp_width = viz.dendro_room.row + viz.uni_margin;
  var tmp_height = viz.cat_room.col + viz.uni_margin;
  d3.select(viz.viz_svg)
    .append('rect')
    .attr('fill', viz.background_color)
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    })
    .classed('white_bars',true)
    .classed('dendro_row_spillover',true);

  // hide spillover left top of col dendrogram
  x_offset = 0;
  y_offset = viz.clust.margin.top + viz.clust.dim.height;
  tmp_width = viz.clust.margin.left;
  tmp_height = viz.clust.dim.height*10;
  d3.select(viz.viz_svg)
    .append('rect')
    .attr('fill', viz.background_color)
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    })
    .classed('white_bars',true)
    .classed('dendro_col_spillover',true);

  // -----------------------------------------------------

  make_cols(cgm, delay_text);

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
  make_row_cat(cgm);
  if (params.viz.show_categories.col) {
    make_col_cat(cgm);
  }

  spillover(cgm);

  if (params.labels.super_labels) {
    generate_super_labels(params);
  }

  // sliders should go above super labels
  make_svg_dendro_sliders(cgm);

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

  initialize_resizing(cgm);

  ini_doubleclick(params);

  if (params.viz.do_zoom) {
    d3.select(params.viz.zoom_element)
      .call(params.zoom_behavior);
  }

  d3.select(params.viz.zoom_element)
    .on('dblclick.zoom', null);

};
