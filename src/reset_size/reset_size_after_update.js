var utils = require('../Utils_clust');
var calc_clust_height = require('../params/calc_clust_height');
var get_svg_dim = require('../params/get_svg_dim');
var calc_clust_width = require('../params/calc_clust_width');
var reset_zoom = require('../zoom/reset_zoom');
var resize_dendro = require('./resize_dendro');
var resize_super_labels = require('./resize_super_labels');
var resize_spillover = require('./resize_spillover');
var resize_row_labels = require('./resize_row_labels');
var resize_row_viz = require('./resize_row_viz');
var resize_col_labels = require('./resize_col_labels');
var resize_col_text = require('./resize_col_text');
var resize_col_triangle = require('./resize_col_triangle');
var resize_col_hlight = require('./resize_col_hlight');
var resize_label_bars = require('./resize_label_bars');
var calc_default_fs = require('../params/calc_default_fs');
var calc_zoom_switching = require('../zoom/calc_zoom_switching');
// var show_visible_area = require('../zoom/show_visible_area');
var ini_zoom_info = require('../zoom/ini_zoom_info');
var underscore = require('underscore');

module.exports = function reset_size_after_update(cgm, duration=0, delays=null) {

  if (delays === null){
    delays = {};
    delays.enter = 0;
    delays.update = 0;
    delays.run_transition = false;
  }

  var params = cgm.params;

  var row_nodes = cgm.params.network_data.row_nodes;

  params.zoom_info = ini_zoom_info();

  // // not sure if this is necessary
  // ////////////////////////////
  // show_visible_area(params);
  // // quick fix for column filtering
  // setTimeout(show_visible_area, 2200, cgm);

  var row_nodes_names = params.network_data.row_nodes_names;

  reset_zoom(params);

  // Resetting some visualization parameters
  params = get_svg_dim(params);
  params.viz = calc_clust_width(params.viz);
  params.viz = calc_clust_height(params.viz);

  if (params.sim_mat){
    if (params.viz.clust.dim.width <= params.viz.clust.dim.height){
      params.viz.clust.dim.height = params.viz.clust.dim.width;
    } else {
      params.viz.clust.dim.width = params.viz.clust.dim.height;
    }
  }

  params.viz = calc_zoom_switching(params.viz);

  // redefine x_scale and y_scale rangeBands
  params.viz.x_scale.rangeBands([0, params.viz.clust.dim.width]);
  params.viz.y_scale.rangeBands([0, params.viz.clust.dim.height]);

  // redefine zoom extent
  params.viz.square_zoom = params.viz.norm_labels.width.col / (params.viz.x_scale.rangeBand()/2);
  params.zoom_behavior
    .scaleExtent([1, params.viz.square_zoom * params.viz.zoom_ratio.x]);

  // redefine border width
  params.viz.border_width.x = params.viz.x_scale.rangeBand() / params.viz.border_fraction;
  params.viz.border_width.y = params.viz.y_scale.rangeBand() / params.viz.border_fraction;

  params = calc_default_fs(params);


  // resize the svg
  ///////////////////////
  var svg_group = d3.select(params.viz.viz_wrapper)
    .select('svg');

  svg_group.select(params.root+' .grey_background')
    .transition().delay(delays.update).duration(duration)
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);

  resize_row_labels(params, svg_group, delays);

  // do not delay the font size change since this will break the bounding box calc
  svg_group.selectAll('.row_label_group')
    .select('text')
    .style('font-size', params.labels.default_fs_row + 'px')
    .text(function(d){ return utils.normal_name(d);});

  // change the size of the highlighting rects
  svg_group.selectAll('.row_label_group')
    .each(function() {
      var bbox = d3.select(this).select('text')[0][0].getBBox();
      d3.select(this)
        .select('rect')
        .attr('x', bbox.x )
        .attr('y', 0)
        .attr('width', bbox.width )
        .attr('height', params.viz.y_scale.rangeBand())
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


  resize_row_viz(params, svg_group, delays);

  if (delays.run_transition){

    // positioning row text after row text size may have been reduced
    svg_group.selectAll('.row_label_group')
      .select('text')
      .transition().delay(delays.update).duration(duration)
      .attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group.selectAll('.row_cat_group')
      .data(row_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
          var inst_index = underscore.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_cat_group')
      .select('path')
      .transition().delay(delays.update).duration(duration)
      .attr('d', function() {
        var origin_x = params.viz.cat_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.viz.y_scale.rangeBand() / 2;
        var final_x = params.viz.cat_room.symbol_width - 1;
        var final_y = params.viz.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ' L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });

    svg_group.selectAll('.row_dendro_group')
      .data(row_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
          var inst_index = underscore.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
        });



  } else {

    // positioning row text after row text size may have been reduced
    svg_group.selectAll('.row_label_group')
      .select('text')
      .attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group.selectAll('.row_cat_group')
      .data(row_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
          var inst_index = underscore.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_cat_group')
      .select('path')
      .attr('d', function() {
        var origin_x = params.viz.cat_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.viz.y_scale.rangeBand() / 2;
        var final_x = params.viz.cat_room.symbol_width - 1;
        var final_y = params.viz.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ' L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });

    svg_group.selectAll('.row_dendro_group')
      .data(row_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
          var inst_index = underscore.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
        });

  }

  if (utils.has( params.network_data.row_nodes[0], 'value')) {

    resize_label_bars(cgm, svg_group);

  }

  // resize col labels
  ///////////////////////
  // reduce width of rotated rects

  resize_col_labels(params, svg_group, delays);
  resize_col_text(params, svg_group);
  resize_col_triangle(params, svg_group, delays);

  resize_col_hlight(params, svg_group, delays);

  resize_dendro(params, svg_group, delays);
  resize_super_labels(params, svg_group, delays);
  resize_spillover(params.viz, svg_group, delays);

  // reset zoom and translate
  params.zoom_behavior
    .scale(1)
    .translate([ params.viz.clust.margin.left, params.viz.clust.margin.top ]);
};
