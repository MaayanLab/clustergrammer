var two_translate_zoom = require('./two_translate_zoom');

module.exports = function ini_doubleclick(cgm) {

  var params = cgm.params;
  // disable double-click zoom
  d3.selectAll(params.viz.zoom_element)
    .on('dblclick.zoom', null);

  d3.select(params.viz.zoom_element)
    .on('dblclick', function() {
      two_translate_zoom(cgm, 0, 0, 1);
    });
};
