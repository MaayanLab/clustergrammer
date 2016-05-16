module.exports = function get_svg_dim(params){

  params.viz.svg_dim = {};
  params.viz.svg_dim.width  = Number(
    d3.select(params.viz.viz_wrapper)
      .style('width').replace('px', '')
      );
  
  params.viz.svg_dim.height = Number(
    d3.select(params.viz.viz_wrapper)
      .style('height').replace('px', '')
    );
  
  return params;
};