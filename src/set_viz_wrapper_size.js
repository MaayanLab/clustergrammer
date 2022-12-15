var calc_viz_dimensions = require('./params/calc_viz_dimensions');

module.exports = function set_viz_wrapper_size(params) {
  // Create wrapper around SVG visualization
  if (d3.select(params.root + ' .viz_wrapper').empty()) {
    // customization
    // d3.select(params.root)
    //   .append('div')
    //   .classed('sidebar_wrapper', true);

    d3.select(params.root).append('div').classed('viz_wrapper', true);
  }

  // customization
  var cont_dim = calc_viz_dimensions(
    Object.assign(params, { sidebar_width: 0 })
  );

  // customization
  // d3.select(params.root + " .sidebar_wrapper")
  //   .style("float", "left")
  //   .style("width", params.sidebar_width + "px")
  //   .style("height", cont_dim.height + "px")
  //   .style("overflow", "hidden");

  d3.select(params.viz.viz_wrapper)
    .style('float', 'left')
    .style('width', cont_dim.width + 'px')
    .style('height', cont_dim.height + 'px');
};
