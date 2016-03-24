var trim_text = require('./trim_text');

module.exports = function still_zooming(params, prev_zoom){

  var inst_zoom = params.zoom_behavior.scale();
  var zoom_diff = Math.abs( prev_zoom - inst_zoom )/ inst_zoom;

  if (zoom_diff > 0.1){
    d3.selectAll(params.root+' .row_label_group' )
      .each(function() { trim_text(params, this, 'row'); });
    d3.selectAll(params.root+' .col_label_group')
      .each(function() { trim_text(params, this, 'col'); });
  }


};