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


};