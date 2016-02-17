var utils = require('./utils');
var trim_text = require('./trim_text');

module.exports = function(params, trans) {

  var keep_width = {};
  keep_width.row = params.bounding_width_max.row * params.labels.row_keep
    * params.zoom_behavior.scale();
  keep_width.col = params.bounding_width_max.col * params.labels.col_keep
    * params.zoom_behavior.scale() / params.viz.zoom_switch;



  if (keep_width.row > params.norm_label.width.row) {

    params.viz.zoom_scale_font.row = params.norm_label.width.row / keep_width.row;
    // params.viz.zoom_scale_font.row = params.norm_label.width.row / keep_width.row;

    d3.selectAll('.row_label_text').each(function() {
      if (trans){

        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_row * params.viz.zoom_scale_font.row + 'px')
          .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35*params.viz.zoom_scale_font.row )
          .style('opacity',0.20).transition().duration(700)
          .style('opacity',1);

      } else {

        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_row * params.viz.zoom_scale_font.row + 'px')
          .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35*params.viz.zoom_scale_font.row );
      }
    });
  } else {

    d3.selectAll('.row_label_text').each(function() {
      if (trans){

        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_row + 'px')
          // do not scale by params.viz.zoom_scale_font.row, since this is 1
          .attr('y', params.matrix.rect_height * 0.5 + params.labels.default_fs_row*0.35 );

        d3.select(this).select('text')
          .text(function(d){ return utils.normal_name(d, params.labels.max_label_char);})
          .style('opacity',0.20).transition().duration(700)
          .style('opacity',1);

      } else {

        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_row + 'px')
          .text(function(d){ return utils.normal_name(d, params.labels.max_label_char);});

      }
    });
  }


  if (keep_width.col > params.norm_label.width.col) {

    params.viz.zoom_scale_font.col = params.norm_label.width.col / keep_width.col;

    d3.selectAll('.col_label_click').each(function() {
      if (trans){
        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_col *
            params.viz.zoom_scale_font.col + 'px')
          .style('opacity',0.20).transition().duration(700)
          .style('opacity',1);
      } else {
        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_col *
            params.viz.zoom_scale_font.col + 'px');
      }
    });
  } else {
    d3.selectAll('.col_label_click').each(function() {
      if (trans){
        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_col + 'px');
        d3.select(this).select('text')
          .text(function(d){ return utils.normal_name(d, params.labels.max_label_char);})
          .style('opacity',0.20).transition().duration(700)
          .style('opacity',1);
      } else {
        d3.select(this).select('text')
          .style('font-size', params.labels.default_fs_col + 'px')
          .text(function(d){ return utils.normal_name(d, params.labels.max_label_char);});
      }
    });
  }

  // constrain text after zooming
  if (params.labels.row_keep < 1){
    d3.selectAll('.row_label_text' ).each(function() { trim_text(params, this, 'row'); });
  }
  if (params.labels.col_keep < 1){
    d3.selectAll('.col_label_click').each(function() { trim_text(params, this, 'col'); });
  }

  // // constrain column text highlight bars
  // // change the size of the highlighting rects
  // d3.selectAll('.col_label_click')
  //   .each(function(d) {
  //     var bbox = d3.select(this)
  //       .select('text')[0][0]
  //       .getBBox();

  //     d3.select(this)
  //       .select('rect')
  //       .attr('width', bbox.width * 1.1)
  //       .attr('height', 0.67*params.matrix.rect_width);
  //       // .style('fill', function(d){
  //       //   var inst_color = 'white';
  //       //   if (params.labels.show_categories){
  //       //     inst_color = params.labels.class_colors.col[d.cl];
  //       //   }
  //       //   return inst_color
  //       // })
  //       // .style('opacity', 0.25);

  //   });

};
