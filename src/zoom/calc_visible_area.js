module.exports = function calc_visible_area(params, zoom_info){

  var vis_area = {};

  // get translation vector absolute values 
  vis_area.min_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x;
  vis_area.min_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y;

  vis_area.max_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x + 
                       params.viz.clust.dim.width/zoom_info.zoom_x ;
  vis_area.max_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y + 
                      params.viz.clust.dim.height/zoom_info.zoom_y ;

  // console.log('\n')
  // console.log('X: '+String(vis_area.min_x)+' '+String(vis_area.max_x))
  // console.log('Y: '+String(vis_area.min_y)+' '+String(vis_area.max_y))
  // console.log('\n')

  return vis_area;
};