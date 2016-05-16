require('jquery-ui/slider');
module.exports = function disable_sidebar(params){
  $(params.root+' .slider').slider('disable');
  d3.selectAll(params.root+' .btn').attr('disabled',true);
  d3.select( params.viz.viz_svg ).style('opacity',0.70);

  // d3.selectAll(params.root+' .category_section')
  // .on('click', '')
  // .select('text')
  // .style('opacity',0.5);
};
