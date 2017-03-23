var run_transformation = require('./run_transformation');
var zoom_rules_y = require('./zoom_rules_y');
var zoom_rules_x = require('./zoom_rules_x');

module.exports = function zoomed(cgm) {

  var params = cgm.params;

  var zoom_info = {};
  zoom_info.zoom_x = d3.event.scale;
  zoom_info.zoom_y = d3.event.scale;

  // subtract away the margin to easily calculate pan_room etc.
  zoom_info.trans_x = params.zoom_behavior.translate()[0] - params.viz.clust.margin.left;
  zoom_info.trans_y = params.zoom_behavior.translate()[1] - params.viz.clust.margin.top;

  d3.selectAll(params.viz.root_tips)
    .style('display','none');

  // transfer zoom_info to params
  params.zoom_info = zoom_rules_y(params, zoom_info);
  params.zoom_info = zoom_rules_x(params, zoom_info);

  // do not run transformation if moving slider
  if (params.is_slider_drag === false && params.is_cropping === false){

    // reset translate vector - add back margins to trans_x and trans_y
    var new_x = params.zoom_info.trans_x + params.viz.clust.margin.left;
    var new_y = params.zoom_info.trans_y + params.viz.clust.margin.top;

    params.zoom_behavior.translate([new_x, new_y]);
    cgm.params = params;

    run_transformation(cgm);

  }

};
