var run_transformation = require('./run_transformation');
var zoom_rules_y = require('./zoom_rules_y');
var zoom_rules_x = require('./zoom_rules_x');

module.exports = function apply_zoom(params, zoom_info) {

  d3.selectAll('.tile_tip')
    .style('display','none' );

  zoom_info = zoom_rules_y(params, zoom_info);

  zoom_info = zoom_rules_x(params, zoom_info);

  run_transformation(params, zoom_info);

};
