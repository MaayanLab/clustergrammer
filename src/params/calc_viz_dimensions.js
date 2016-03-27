module.exports = function calc_viz_dimensions(params){

  // get outer_margins
  var outer_margins;
  if (params.viz.expand === false) {
    outer_margins = params.viz.outer_margins;
  } else {
    outer_margins = params.viz.outer_margins_expand;
  }

  var cont_dim = {};

  cont_dim.top = outer_margins.top;
  cont_dim.left = outer_margins.left;

  if (params.viz.resize) {

    var screen_width = window.innerWidth;
    var screen_height = window.innerHeight;

    cont_dim.width = screen_width - outer_margins.left - outer_margins.right;
    cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

  } else {

    cont_dim.width = params.viz.fixed_size.width;
    cont_dim.height = params.viz.fixed_size.height;

  }

  return cont_dim;

};