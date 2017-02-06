module.exports = function disable_sidebar(params){

  d3.selectAll(params.root+' .btn').attr('disabled',true);
  d3.select( params.viz.viz_svg ).style('opacity',0.70);

};
