var two_translate_zoom = require('./two_translate_zoom');

module.exports = function(params) {
  // disable double-click zoom
  d3.selectAll(params.viz.zoom_element)
    .on('dblclick.zoom', null);

  d3.select(params.viz.zoom_element)
    .on('dblclick', function() {
      two_translate_zoom(params, 0, 0, 1);
    });
};
