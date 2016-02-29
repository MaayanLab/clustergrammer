
module.exports = function(params, inst_selection, inst_rc) {

  // trim text that is longer than the container 

  var max_width;
  var inst_zoom;

  var safe_row_trim_text = 0.9;

  if (inst_rc === 'row'){
    max_width = params.norm_label.width.row * safe_row_trim_text;
    inst_zoom = params.zoom_behavior.scale();
  } else {
    // the column label has extra length since its rotated
    max_width = params.norm_label.width.col;
    inst_zoom = params.zoom_behavior.scale()/params.viz.zoom_switch;
  }

  var tmp_width = d3.select(inst_selection)
    .select('text')
    .node()
    .getBBox()
    .width;

  var inst_text = d3.select(inst_selection)
    .select('text')
    .text();

  var actual_width = tmp_width * inst_zoom;

  if (actual_width>max_width){

    var trim_fraction = max_width/actual_width;
    var keep_num_char = Math.floor(inst_text.length*trim_fraction)-3;
    var trimmed_text = inst_text.substring(0,keep_num_char)+'..';

    d3.select(inst_selection).select('text')
      .text(trimmed_text);
  }

};
