var toggle_element_display = require('./toggle_element_display');

module.exports = function show_visible_area(params, zoom_info){

  var vis_area = {};

  // get translation vector absolute values 
  vis_area.min_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x - 3*params.viz.rect_width;
  vis_area.min_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y - 3*params.viz.rect_height ;

  vis_area.max_x = Math.abs(zoom_info.trans_x)/zoom_info.zoom_x + 
                       params.viz.clust.dim.width/zoom_info.zoom_x ;
  vis_area.max_y = Math.abs(zoom_info.trans_y)/zoom_info.zoom_y + 
                      params.viz.clust.dim.height/zoom_info.zoom_y ;

  // toggle labels and rows 
  ///////////////////////////////////////////////
  d3.selectAll(params.root+' .row_label_group')
    .each(function(){
      toggle_element_display(vis_area, this, 'row');
    });

  d3.selectAll(params.root+' .row')
    .each(function(){
      toggle_element_display(vis_area, this, 'row');
    });

  // toggle col labels 
  d3.selectAll(params.root+' .col_label_text')
    .each(function(){
      toggle_element_display(vis_area, this, 'col');
    });

  return vis_area;

};