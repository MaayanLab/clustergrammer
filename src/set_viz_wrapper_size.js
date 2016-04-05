var calc_viz_dimensions = require('./params/calc_viz_dimensions');

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

  var cont_dim = calc_viz_dimensions(params);

  var sidebar_margin = 5;

  d3.select(params.root+' .sidebar_wrapper')
    .style('margin-left',sidebar_margin+'px')
    .style('float', 'left')
    // .style('overflow-y','scroll')
    // .style('overflow-x','hidden')
    .style('width', params.sidebar_width+'px')
    .style('height', cont_dim.height+'px');

  var viz_margin = params.sidebar_width + sidebar_margin + 2;

  d3.select(params.viz.viz_wrapper)
    .style('float', 'right')
    // .style('margin-top', cont_dim.top + 'px')
    // .style('margin-left', viz_margin+'px')
    .style('width', cont_dim.width + 'px')
    .style('height', cont_dim.height + 'px');
};
