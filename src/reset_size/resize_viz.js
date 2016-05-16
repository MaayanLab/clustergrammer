// var crossfilter = require('crossfilter');
var utils = require('../Utils_clust');
var zoomed = require('../zoom/zoomed');
var ini_doubleclick = require('../zoom/ini_doubleclick');
var reset_zoom = require('../zoom/reset_zoom');
var resize_dendro = require('./resize_dendro');
var resize_grid_lines = require('./resize_grid_lines');
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
var make_row_dendro_triangles = require('../dendrogram/make_row_dendro_triangles');
var make_col_dendro_triangles = require('../dendrogram/make_col_dendro_triangles');
var toggle_dendro_view = require('../dendrogram/toggle_dendro_view');
var show_visible_area = require('../zoom/show_visible_area');
var calc_viz_dimensions = require('../params/calc_viz_dimensions');
var position_play_button = require('../demo/position_play_button');

module.exports = function(params) {

  var cont_dim = calc_viz_dimensions(params); 

  d3.select(params.root+' .play_button');
    // .style('opacity', 0.2);

  // reset visible area 
  var zoom_info = {};
  zoom_info.zoom_x = 1;
  zoom_info.zoom_y = 1;
  zoom_info.trans_x = 0;
  zoom_info.trans_y = 0;

  show_visible_area(params, zoom_info);

  d3.select(params.root+' .sidebar_wrapper')
    .style('height', cont_dim.height+'px');

  d3.select(params.viz.viz_wrapper)
    // .style('float', 'left')
    .style('margin-top',  cont_dim.top  + 'px')
    .style('width',  cont_dim.width  + 'px')
    .style('height', cont_dim.height + 'px');

  params = recalc_params_for_resize(params);

  reset_zoom(params);

  var svg_group = d3.select(params.viz.viz_svg);

  // redefine x and y positions
  _.each(params.network_data.links, function(d){
    d.x = params.viz.x_scale(d.target);
    d.y = params.viz.y_scale(d.source);
  });

  // disable zoom while transitioning
  svg_group.on('.zoom', null);

  params.zoom_behavior
    .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch])
    .on('zoom', function(){
      zoomed(params);
    });

  // reenable zoom after transition
  if (params.viz.do_zoom) {
    svg_group.call(params.zoom_behavior);
  }

  // prevent normal double click zoom etc
  ini_doubleclick(params);

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
  var row_nodes_names = _.map(row_nodes, 'name');

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
    resize_label_bars(params, svg_group);
  }

  svg_group
    .selectAll('.row_cat_group')
    .attr('transform', function(d) {
        var inst_index = _.indexOf(row_nodes_names, d.name);
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
        mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
      return output_string;
    }); 

  var is_resize = true;
  if (params.viz.show_dendrogram){
    make_row_dendro_triangles(params, is_resize);
    make_col_dendro_triangles(params, is_resize);
    resize_dendro(params, svg_group);

    toggle_dendro_view(params, 'row', 0);
    toggle_dendro_view(params, 'col', 0);
  }

  resize_col_labels(params, svg_group); 
  resize_col_text(params, svg_group);
  resize_col_triangle(params, svg_group);
  resize_col_hlight(params, svg_group);


  resize_super_labels(params, svg_group);
  resize_spillover(params.viz, svg_group);

  // specific to screen resize 
  resize_grid_lines(params, svg_group);
  resize_borders(params, svg_group);

  // reset zoom and translate
  params.zoom_behavior
    .scale(1)
    .translate([ params.viz.clust.margin.left, params.viz.clust.margin.top ]);

  label_constrain_and_trim(params);
  
  d3.select(params.viz.viz_svg).style('opacity',1);
};
