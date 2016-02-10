function Zoom(params){

  /* Functions for zooming. Should be turned into a module.
   * ----------------------------------------------------------------------- */

  function ini_doubleclick(params){

    // disable double-click zoom
    d3.selectAll(params.viz.viz_svg).on('dblclick.zoom', null);

    d3.select(params.viz.viz_svg)
      .on('dblclick', function() {
        two_translate_zoom(params, 0, 0, 1);
      });
  }

  return {
    ini_doubleclick : ini_doubleclick
  }
}