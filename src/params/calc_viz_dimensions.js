module.exports = function calc_viz_dimensions(params){

  var cont_dim = {};
  var extra_space = params.buffer_width;

  // var screen_width = window.innerWidth;
  // var screen_height = window.innerHeight;

  // // resize container, then resize visualization within container
  // d3.select(params.root)
  //   .style('width', screen_width+'px')
  //   .style('height', screen_height+'px');

  var container_width = d3.select(params.root).style('width').replace('px','');
  var container_height = d3.select(params.root).style('height').replace('px','');

  // get outer_margins
  var outer_margins;
  if (params.viz.is_expand === false) {
    outer_margins = params.viz.outer_margins;
    cont_dim.width = container_width - params.sidebar_width - extra_space;
  } else {
    outer_margins = params.viz.outer_margins;
    cont_dim.width = container_width - extra_space;
  }

  cont_dim.top = outer_margins.top;
  cont_dim.left = outer_margins.left;

  if (params.viz.resize) {

    cont_dim.height = container_height;

  } else {

    if (params.viz.is_expand){
      cont_dim.width = params.viz.fixed_size.width;
    } else {
      cont_dim.width = params.viz.fixed_size.width - params.sidebar_width;
    }

    cont_dim.height = params.viz.fixed_size.height;

  }

  return cont_dim;

};
