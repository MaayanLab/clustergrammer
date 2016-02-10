function Zoom(params){

  /* Functions for zooming. Should be turned into a module.
   * ----------------------------------------------------------------------- */
  function zoomed() {

    var zoom_x = d3.event.scale,
      zoom_y = d3.event.scale,
      trans_x = d3.event.translate[0] - params.viz.clust.margin.left,
      trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

    apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y);
  }


  function update_viz_links(params, trans_x, trans_y, zoom_x, zoom_y, trans){

    // get translation vector absolute values 
    var buffer = 1;
    var min_x = Math.abs(trans_x)/zoom_x - buffer*params.matrix.x_scale.rangeBand() ;
    var min_y = Math.abs(trans_y)/zoom_y - buffer*params.matrix.y_scale.rangeBand() ;

    var max_x = Math.abs(trans_x)/zoom_x + params.viz.clust.dim.width/zoom_x ;
    // var max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height ; 
    var max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height/zoom_y ; 

    // show the full height of the clustergram if force_square 
    if (params.viz.force_square || trans) {
      max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height;       
    }

    if (min_x < 0){
      min_x = 0;
    }
    if (min_y < 0){
      min_y = 0;  
    }

    // test-filter 
    params.cf.dim_x.filter([min_x,max_x]);
    params.cf.dim_y.filter([min_y,max_y]);

    // redefine links 
    var inst_links = params.cf.dim_x.top(Infinity);

    return inst_links;
  }



  function ini_doubleclick(params){

    // disable double-click zoom
    d3.selectAll(params.viz.viz_svg).on('dblclick.zoom', null);

    d3.select(params.viz.viz_svg)
      .on('dblclick', function() {
        two_translate_zoom(params, 0, 0, 1);
      });
  }

  return {
    zoomed : zoomed,
    ini_doubleclick : ini_doubleclick
  }
}