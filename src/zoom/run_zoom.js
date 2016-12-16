var run_transformation = require('./run_transformation');
var zoom_rules_y = require('./zoom_rules_y');
var zoom_rules_x = require('./zoom_rules_x');

module.exports = function zoomed(cgm) {


  var params = cgm.params;

  // debugger;

  console.log('check before ')
  console.log(params.zoom_behavior.translate())

  var tmp_trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

  // // zero out translation vector
  // cgm.params.zoom_behavior
  //   .translate([0, 0]);

  console.log('$$$$$$$$$$$ in the middle of zoomed')
  console.log(cgm.params.zoom_behavior.translate())

  cgm.params.new_object = 'something_set_in_zdm_rules'

  // // reset the zoom and translate
  // console.log('############## reset zoom')
  // console.log('check here ')
  // console.log(params.zoom_behavior.translate())
  // if (params.viz.zoom_switch > 1){
  //   if (d3.event.scale < params.viz.zoom_switch) {
  //   }
  // }


  var zoom_info = {};
  zoom_info.zoom_x = d3.event.scale;
  zoom_info.zoom_y = d3.event.scale;

  // zoom_info.trans_x = d3.event.translate[0] - params.viz.clust.margin.left;
  // zoom_info.trans_y = d3.event.translate[1] - params.viz.clust.margin.top;
  // console.log('ZOOM BEHAVIOR (trans_x): ' + String(params.zoom_behavior.translate()[0]))

  zoom_info.trans_x = params.zoom_behavior.translate()[0] - params.viz.clust.margin.left;
  zoom_info.trans_y = params.zoom_behavior.translate()[1] - params.viz.clust.margin.top;

  // console.log('translate: ' + String(d3.event.translate[0]))
  // console.log('zoom_info: ' + String(zoom_info.trans_x))
  // console.log('\n')

  params.zoom_info = zoom_info;

  d3.selectAll(params.viz.root_tips)
    .style('display','none');


  params.zoom_info = zoom_rules_y(cgm);
  params.zoom_info = zoom_rules_x(cgm);


  console.log('$$$$$$$$$$$$ check right before')
  console.log(cgm.params.zoom_behavior.translate())


  // console.log('............................................\n\n')

  // do not run transformation if moving slider
  if (params.is_slider_drag === false && params.is_cropping === false){
    run_transformation(params);
  }

  console.log('$$$$$$$$$$$ at end of zoomed')
  console.log(cgm.params.zoom_behavior.translate())

};
