var calc_real_font_size = require('./calc_real_font_size');

module.exports = function constrain_font_size(params) {

  var tmp_font_size = params.labels.default_fs_row ;
  var inst_zoom;

  var real_font_size = calc_real_font_size(params);

  // rows
  ////////////////////////////////////
  if (real_font_size.row > params.labels.max_allow_fs){

    if (params.viz.zoom_switch_y){
      inst_zoom = params.zoom_behavior.scale()/params.viz.zoom_switch_y;
    } else {
      inst_zoom = params.zoom_behavior.scale();
    }

    if (inst_zoom < 1){
      inst_zoom = 1;
    }

    tmp_font_size = (params.labels.max_allow_fs/inst_zoom );

    d3.selectAll(params.root+' .row_label_group')
      .select('text')
      .style('font-size', tmp_font_size + 'px')
      .attr('y', params.viz.rect_height * 0.5 + tmp_font_size*0.35 );

  } else {
    d3.selectAll(params.root+' .row_label_group')
      .select('text')
      .style('font-size', params.labels.default_fs_row + 'px')
      .attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row*0.35 );
  }

  // columns 
  //////////////////////////////////////


  if (real_font_size.col > params.labels.max_allow_fs){

    if (params.viz.zoom_switch > 1){
      inst_zoom = params.zoom_behavior.scale()/params.viz.zoom_switch ;
    } else {
      inst_zoom = params.zoom_behavior.scale();
    }

    if (inst_zoom < 1){
      inst_zoom = 1;
    }

    tmp_font_size = params.labels.max_allow_fs/inst_zoom;

    if (tmp_font_size > 0.7*params.viz.rect_width){
      tmp_font_size = 0.7*params.viz.rect_width;
    }

    d3.selectAll(params.root+' .col_label_text')
      .select('text')
      .style('font-size', tmp_font_size + 'px');

  } else {
    d3.selectAll(params.root+' .col_label_text')
      .select('text')
      .style('font-size', params.labels.default_fs_col + 'px');
  }

};
