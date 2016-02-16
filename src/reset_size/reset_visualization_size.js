var Params = require('../params');
var run_reset_visualization_size = require('./run_reset_visualization_size');

module.exports = function() {
  var params = Params.get();

  // get outer_margins
  var outer_margins = params.viz.expand ? params.viz.outer_margins_expand : params.viz.outer_margins;

  // get the size of the window
  var screen_width  = window.innerWidth;
  var screen_height = window.innerHeight;

  // define width and height of clustergram container
  var cont_dim = {};
  cont_dim.width  = screen_width  - outer_margins.left - outer_margins.right;
  cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

  run_reset_visualization_size(cont_dim.width, cont_dim.height, outer_margins.left, outer_margins.top, params);

  // get dimensions of the viz_svg
  var dim = {};
  dim.viz_svg = {};
  dim.viz_svg.w = d3.select(params.viz.viz_svg).style('width').replace('px','');
  dim.viz_svg.h = d3.select(params.viz.viz_svg).style('height').replace('px','');

  // reposition the play button
  d3.select('.play_button')
    .attr('transform', function(){
      var pos_x = dim.viz_svg.w/2;
      var pos_y = dim.viz_svg.h/2;
      return 'translate('+pos_x+','+pos_y+')';
    });

};
