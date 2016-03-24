
module.exports = function(params) {

  var tmp_font_size = params.labels.default_fs_row ;
  var real_font_size = {};
  var reduce_fs = {};
  var inst_zoom;

  // zoom_switch behavior has to change with zoom_switch_y

  real_font_size.row = params.labels.default_fs_row * params.zoom_behavior.scale();
  real_font_size.col = params.labels.default_fs_col * params.zoom_behavior.scale()/params.viz.zoom_switch;

  if (real_font_size.row > params.labels.max_allow_fs){

    reduce_fs.row = params.labels.max_allow_fs / real_font_size.row;

    inst_zoom = params.zoom_behavior.scale();

    tmp_font_size = params.labels.max_allow_fs/inst_zoom;

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

  if (real_font_size.col > params.labels.max_allow_fs){

    inst_zoom = params.zoom_behavior.scale()/params.viz.zoom_switch;
    tmp_font_size = params.labels.max_allow_fs/inst_zoom;

    d3.selectAll(params.root+' .col_label_text')
      .select('text')
      .style('font-size', tmp_font_size + 'px');

  } else {
    d3.selectAll(params.root+' .col_label_text')
      .select('text')
      .style('font-size', params.labels.default_fs_col + 'px');
  }

};
