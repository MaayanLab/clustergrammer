module.exports = function deactivate_cropping(cgm){

  d3.select(cgm.params.root+' .brush_group')
    .transition()
    .style('opacity', 0)
    .remove();

  cgm.params.is_cropping = false;

};