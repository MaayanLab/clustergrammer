module.exports = function calc_viz_dimensions(params){

  var cont_dim = {};
  var extra_space = params.buffer_width;

  var screen_width = window.innerWidth;
  var screen_height = window.innerHeight;

  // get outer_margins
  var outer_margins;
  if (params.viz.expand === false) {
    outer_margins = params.viz.outer_margins;
    cont_dim.width = screen_width - params.sidebar_width - outer_margins.right - extra_space;
  } else {
    outer_margins = params.viz.outer_margins;
    cont_dim.width = screen_width - outer_margins.right - extra_space;
  }

  cont_dim.top = outer_margins.top;
  cont_dim.left = outer_margins.left;

  if (params.viz.resize) {

    cont_dim.height = screen_height - outer_margins.top - outer_margins.bottom;

  } else {

    cont_dim.width = params.viz.fixed_size.width;
    cont_dim.height = params.viz.fixed_size.height;

  }

  return cont_dim;

};
