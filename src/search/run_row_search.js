var two_translate_zoom = require('../zoom/two_translate_zoom');
var underscore = require('underscore');

module.exports = function run_row_search(cgm, search_term, entities){

  var prop = 'name';

  if (entities.indexOf(search_term) !== -1) {

    // unhighlight
    d3.selectAll(cgm.params.root+' .row_label_group')
      .select('rect').style('opacity', 0);

    // calc pan_dy
    var idx = underscore.indexOf(entities, search_term);
    var inst_y_pos = cgm.params.viz.y_scale(idx);
    var pan_dy = cgm.params.viz.clust.dim.height / 2 - inst_y_pos;

    var inst_zoom = cgm.params.viz.zoom_ratio.x;

    // working on improving zoom behavior
    ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////

    // // increase zoom
    // inst_zoom = 3 * inst_zoom;

    // // move visualization down less
    // pan_dy = pan_dy - 5;

    two_translate_zoom(cgm, 0, pan_dy, inst_zoom);

    // set y zoom to zoom_switch
    cgm.params.zoom_info.zoom_y = inst_zoom;

    // highlight
    d3.selectAll(cgm.params.root+' .row_label_group')
      .filter(function(d) {
        return d[prop] === search_term;
      })
      .select('rect')
      .style('opacity', 1);
  }

};