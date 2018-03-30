var utils = require('../Utils_clust');
var run_zoom = require('../zoom/run_zoom');
var ini_doubleclick = require('../zoom/ini_doubleclick');
var reset_zoom = require('../zoom/reset_zoom');
var resize_dendro = require('./resize_dendro');
var resize_super_labels = require('./resize_super_labels');
var resize_spillover = require('./resize_spillover');
var resize_borders = require('./resize_borders');
var resize_row_labels = require('./resize_row_labels');
var resize_highlights = require('./resize_highlights');
var resize_row_viz = require('./resize_row_viz');
var resize_col_labels = require('./resize_col_labels');
var resize_col_text = require('./resize_col_text');
var resize_col_triangle = require('./resize_col_triangle');
var resize_col_hlight = require('./resize_col_hlight');
var recalc_params_for_resize = require('./recalc_params_for_resize');
var resize_row_tiles = require('./resize_row_tiles');
var resize_label_bars = require('./resize_label_bars');
var label_constrain_and_trim = require('../labels/label_constrain_and_trim');
var make_dendro_triangles = require('../dendrogram/make_dendro_triangles');
var toggle_dendro_view = require('../dendrogram/toggle_dendro_view');
var show_visible_area = require('../zoom/show_visible_area');
var calc_viz_dimensions = require('../params/calc_viz_dimensions');
var position_play_button = require('../demo/position_play_button');
var make_row_cat_super_labels = require('../labels/make_row_cat_super_labels');
var ini_cat_reorder = require('../reorder/ini_cat_reorder');
var position_dendro_slider = require('../dendrogram/position_dendro_slider');
var position_tree_icon = require('../menus/position_tree_icon');
var position_filter_icon = require('../menus/position_filter_icon');
var position_tree_menu = require('../menus/position_tree_menu');
var ini_zoom_info = require('../zoom/ini_zoom_info');
var grid_lines_viz = require('../matrix/grid_lines_viz');
var underscore = require('underscore');

module.exports = function resize_viz(cgm) {

  var params = cgm.params;

  var cont_dim = calc_viz_dimensions(params);

  d3.select(params.root+' .play_button');
    // .style('opacity', 0.2);


  d3.select(params.root+' .sidebar_wrapper')
    .style('height', cont_dim.height+'px');

  d3.select(params.viz.viz_wrapper)
    // .style('float', 'left')
    .style('margin-top',  cont_dim.top  + 'px')
    .style('width',  cont_dim.width  + 'px')
    .style('height', cont_dim.height + 'px');

  params = recalc_params_for_resize(params);

  params.zoom_info = ini_zoom_info();

  reset_zoom(params);

  var svg_group = d3.select(params.viz.viz_svg);

  // redefine x and y positions
  underscore.each(params.network_data.links, function(d){
    d.x = params.viz.x_scale(d.target);
    d.y = params.viz.y_scale(d.source);
  });

  // disable zoom while transitioning
  svg_group.on('.zoom', null);

  params.zoom_behavior
    .scaleExtent([1, params.viz.square_zoom * params.viz.zoom_ratio.x])
    .on('zoom', function(){
      run_zoom(cgm);
    });

  // reenable zoom after transition
  if (params.viz.do_zoom) {
    svg_group.call(params.zoom_behavior);
  }

  // prevent normal double click zoom etc
  ini_doubleclick(cgm);

  svg_group
    .attr('width', params.viz.svg_dim.width)
    .attr('height', params.viz.svg_dim.height);

  svg_group.select('.super_background')
    .style('width', params.viz.svg_dim.width)
    .style('height', params.viz.svg_dim.height);

  svg_group.select('.grey_background')
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  setTimeout(position_play_button, 100, params);

  var row_nodes = params.network_data.row_nodes;
  var row_nodes_names = utils.pluck(row_nodes, 'name');

  resize_row_tiles(params, svg_group);

  svg_group.selectAll('.highlighting_rect')
    .attr('width', params.viz.x_scale.rangeBand() * 0.80)
    .attr('height', params.viz.y_scale.rangeBand() * 0.80);

  resize_highlights(params);

  // resize row labels
  ///////////////////////////

  resize_row_labels(params, svg_group);
  resize_row_viz(params, svg_group);

  // change the size of the highlighting rects
  svg_group.selectAll('.row_label_group')
    .each(function() {
      var bbox = d3.select(this).select('text')[0][0].getBBox();
      d3.select(this)
        .select('rect')
        .attr('x', bbox.x )
        .attr('y', 0)
        .attr('width', bbox.width )
        .attr('height', params.viz.rect_height)
        .style('fill', 'yellow')
        .style('opacity', function(d) {
          var inst_opacity = 0;
          // highlight target genes
          if (d.target === 1) {
            inst_opacity = 1;
          }
          return inst_opacity;
        });
    });

  // necessary to properly position row labels vertically
  svg_group.selectAll('.row_label_group')
    .select('text')
    .attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

  if (utils.has( params.network_data.row_nodes[0], 'value')) {
    resize_label_bars(cgm, svg_group);
  }

  svg_group
    .selectAll('.row_cat_group')
    .attr('transform', function(d) {
        var inst_index = underscore.indexOf(row_nodes_names, d.name);
        return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
      });

  svg_group
    .selectAll('.row_cat_group')
    .select('path')
    .attr('d', function() {
      var origin_x = params.viz.cat_room.symbol_width - 1;
      var origin_y = 0;
      var mid_x = 1;
      var mid_y = params.viz.rect_height / 2;
      var final_x = params.viz.cat_room.symbol_width - 1;
      var final_y = params.viz.rect_height;
      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
        mid_x + ',' + mid_y + ' L ' + final_x + ',' + final_y + ' Z';
      return output_string;
    });

  var is_resize = true;
  if (params.viz.show_dendrogram){
    make_dendro_triangles(cgm, 'row', is_resize);
    make_dendro_triangles(cgm, 'col', is_resize);
    resize_dendro(params, svg_group);

    toggle_dendro_view(cgm, 'row', 0);
    toggle_dendro_view(cgm, 'col', 0);
  } else {
    resize_dendro(params, svg_group);
  }

  resize_col_labels(params, svg_group);
  resize_col_text(params, svg_group);
  resize_col_triangle(params, svg_group);
  resize_col_hlight(params, svg_group);


  resize_super_labels(params, svg_group);
  resize_spillover(params.viz, svg_group);


  grid_lines_viz(params);

  resize_borders(params, svg_group);

  // reset zoom and translate
  params.zoom_behavior
    .scale(1)
    .translate([ params.viz.clust.margin.left, params.viz.clust.margin.top ]);

  label_constrain_and_trim(params);

  // reposition matrix
  d3.select(params.root+' .clust_container')
    .attr('transform', 'translate(' +
      params.viz.clust.margin.left + ',' +
      params.viz.clust.margin.top + ')');

  // removed, this was causing bugs
  if (cgm.params.viz.ds_level === -1){
    show_visible_area(cgm);
  }

  make_row_cat_super_labels(cgm);

  d3.select(params.viz.viz_svg).style('opacity',1);

  ini_cat_reorder(cgm);

  d3.select(cgm.params.root+ ' .row_slider_group')
    .style('opacity', 0);
  d3.select(cgm.params.root+ ' .col_slider_group')
    .style('opacity', 0);

  setTimeout(position_dendro_slider, 500, cgm, 'row');
  setTimeout(position_dendro_slider, 500, cgm, 'col');
  setTimeout(position_tree_icon, 500, cgm);
  setTimeout(position_tree_menu, 500, cgm);
  setTimeout(position_filter_icon, 500, cgm);

};
