module.exports = function bound_label_size(params){

  // check if widest row or col are wider than the allowed label width
  ////////////////////////////////////////////////////////////////////////
  var ini_scale_font = {};
  ini_scale_font.row = 1;
  ini_scale_font.col = 1;

  // label the widest row and col labels
  params.bounding_width_max = {};
  params.bounding_width_max.row = 0;
  d3.selectAll(params.root+' .row_label_text').each(function() {
    var tmp_width = d3.select(this).select('text').node().getBBox().width;
    if (tmp_width > params.bounding_width_max.row) {
      params.bounding_width_max.row = tmp_width;
    }
  });    

  params.bounding_width_max.col = 0;
  d3.selectAll(params.root+' .col_label_click').each(function() {
    var tmp_width = d3.select(this).select('text').node().getBBox().width;
    if (tmp_width > params.bounding_width_max.col) {
    params.bounding_width_max.col = tmp_width * 1.2;
    }
  });

  if (params.bounding_width_max.row > params.norm_label.width.row) {

    ini_scale_font.row = params.norm_label.width.row / params.bounding_width_max.row;
    params.bounding_width_max.row = ini_scale_font.row * params.bounding_width_max.row;
    params.labels.default_fs_row = params.labels.default_fs_row * ini_scale_font.row;
    d3.selectAll(params.root+' .row_label_text').each(function() {
    d3.select(this).select('text')
      .style('font-size', params.labels.default_fs_row + 'px');
    });
  }

  if (params.bounding_width_max.col > params.norm_label.width.col) {

    ini_scale_font.col = params.norm_label.width.col / params.bounding_width_max.col;
    params.bounding_width_max.col = ini_scale_font.col * params.bounding_width_max.col;
    params.labels.default_fs_col = params.labels.default_fs_col * ini_scale_font.col;
    d3.selectAll(params.root+' .col_label_click').each(function() {
    d3.select(this).select('text')
      .style('font-size', params.labels.default_fs_col + 'px');
    });
  }
};