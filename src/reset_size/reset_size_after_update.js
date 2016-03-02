var utils = require('../utils');
var is_force_square = require('../params/is_force_square');
var get_svg_dim = require('../params/get_svg_dim');
var set_clust_width = require('../params/set_clust_width');
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
// var trim_text = require('../zoom/trim_text');

module.exports = function(params, row_nodes, col_nodes, links, duration, delays) {

  var row_nodes_names = params.network_data.row_nodes_names;

  reset_zoom(params);

  // Resetting some visualization parameters
  params = get_svg_dim(params);
  params = set_clust_width(params);
  params = is_force_square(params);

  // zoom_switch from 1 to 2d zoom
  params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

  // zoom_switch can not be less than 1
  if (params.viz.zoom_switch < 1) {
    params.viz.zoom_switch = 1;
  }

  // redefine x_scale and y_scale rangeBands
  params.matrix.x_scale.rangeBands([0, params.viz.clust.dim.width]);
  params.matrix.y_scale.rangeBands([0, params.viz.clust.dim.height]);

  // redefine zoom extent
  params.viz.real_zoom = params.norm_label.width.col / (params.matrix.x_scale.rangeBand()/2);
  params.zoom_behavior
    .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch]);

  // redefine border width
  params.viz.border_width = params.matrix.x_scale.rangeBand() / 40;

  params = calc_default_fs(params);


  // Begin resizing the visualization
  /////////////////////////////////////////
  /////////////////////////////////////////

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
        .attr('height', params.matrix.y_scale.rangeBand())
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
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group.selectAll('.row_viz_group')
      .data(row_nodes, function(d){return d.name;})
      .transition().delay(delays.update).duration(duration)
      .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_viz_group')
      .select('path')
      .transition().delay(delays.update).duration(duration)
      .attr('d', function() {
        var origin_x = params.cat_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.y_scale.rangeBand() / 2;
        var final_x = params.cat_room.symbol_width - 1;
        var final_y = params.matrix.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });

  } else {

    // positioning row text after row text size may have been reduced
    svg_group.selectAll('.row_label_group')
      .select('text')
      .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

    svg_group.selectAll('.row_viz_group')
      .data(row_nodes, function(d){return d.name;})
      .attr('transform', function(d) {
          var inst_index = _.indexOf(row_nodes_names, d.name);
          return 'translate(0, ' + params.matrix.y_scale(inst_index) + ')';
        });

    svg_group.selectAll('.row_viz_group')
      .select('path')
      .attr('d', function() {
        var origin_x = params.cat_room.symbol_width - 1;
        var origin_y = 0;
        var mid_x = 1;
        var mid_y = params.matrix.y_scale.rangeBand() / 2;
        var final_x = params.cat_room.symbol_width - 1;
        var final_y = params.matrix.y_scale.rangeBand();
        var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
          mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
        return output_string;
      });

  }

  if (utils.has( params.network_data.row_nodes[0], 'value')) {

    resize_label_bars(params, svg_group);

  }

  // resize col labels
  ///////////////////////
  // reduce width of rotated rects

  resize_col_labels(params, svg_group, delays);
  resize_col_text(params, svg_group);
  resize_col_triangle(params, svg_group, delays);

  resize_col_hlight(params, svg_group, delays);

  // run for both view update and screen resize 

  // d3.selectAll(params.root+' .row_label_group' )
  //   .each(function() { 
  //     trim_text(params, this, 'row'); 
  //   });
    
  // d3.selectAll(params.root+' .col_label_group')
  //   .each(function() { 
  //     trim_text(params, this, 'col'); 
  //   });   


  resize_dendro(params, svg_group, delays);
  resize_super_labels(params, svg_group, delays);
  resize_spillover(params, svg_group, delays);

  // reset zoom and translate
  params.zoom_behavior
    .scale(1)
    .translate([ params.viz.clust.margin.left, params.viz.clust.margin.top ]);
};
