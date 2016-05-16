module.exports = function sim_click(params, single_double, pos_x, pos_y){

  var click_duration = 200;

  var click_circle = d3.select(params.root+' .viz_svg')
    .append('circle')
    .attr('cx',pos_x)
    .attr('cy',pos_y)
    .attr('r',25)
    .style('stroke','black')
    .style('stroke-width','3px')
    .style('fill','#007f00')
    .style('opacity',0.5);

  if (single_double === 'double'){
    click_circle 
      .transition().duration(click_duration)
      .style('opacity',0.0)
      .transition().duration(50)
      .style('opacity',0.5)
      .transition().duration(click_duration)
      .style('opacity',0.0)
      .remove();
  } else {
    click_circle 
      .transition().duration(click_duration)
      .style('opacity',0.0)
      .transition().duration(250)
      .remove();
  }

};