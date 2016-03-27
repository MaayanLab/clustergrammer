var run_reset_visualization_size = require('./run_reset_visualization_size');
var calc_viz_dimensions = require('../params/calc_viz_dimensions');

module.exports = function(params) {

  var cont_dim = calc_viz_dimensions(params); 

  run_reset_visualization_size(params, cont_dim);

};
