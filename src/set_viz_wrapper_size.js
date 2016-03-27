// resize parent div
module.exports = function set_viz_wrapper_size(params) {

  // Create wrapper around SVG visualization
  if (d3.select(params.root+' .viz_wrapper').empty()){

    d3.select(params.root)
      .append('div')
      .classed('sidebar_wrapper', true);

    d3.select(params.root)
      .append('div')
      .classed('viz_wrapper', true);

  }

  // get outer_margins
  var outer_margins;
  if (params.viz.expand === false) {
    outer_margins = params.viz.outer_margins;
  } else {
    outer_margins = params.viz.outer_margins_expand;
  }

  var cont_dim = {};

  if (params.viz.resize) {

    var screen_width = window.innerWidth;
    var screen_height = window.innerHeight;

    cont_dim.width = screen_width - outer_margins.left - outer_margins.right;
    cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

  } else {

    cont_dim.width = 500;
    cont_dim.height = 500;

  }

  d3.select(params.root+' .sidebar_wrapper')
    .style('margin-left','10px')
    .style('float', 'left')
    .style('overflow-y','scroll')
    .style('overflow-x','hidden')
    .style('width','187px')
    .style('height', cont_dim.height+'px');

  d3.select(params.viz.viz_wrapper)
    .style('float', 'left')
    .style('margin-top', outer_margins.top + 'px')
    .style('width', cont_dim.width + 'px')
    .style('height', cont_dim.height + 'px');
};
