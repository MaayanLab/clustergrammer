module.exports = function crop_matrix(){

  var cgm = this;
  var params = cgm.params;

  console.log('cropping matrix');
  var x = d3.scale.linear().range([0, 100]);
  var y = d3.scale.linear().range([0, 100]);

  var brush = d3.svg.brush()
      .x(x)
      .y(y)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

  function brushstart(p){
    console.log(p);
  }

  function brushmove(p){
    console.log(p)
  }

  function brushend(p){
    console.log(p)

    var e = brush.extent();
    console.log(e)

    d3.select(params.root+' .clust_group')
      .call(brush);

  }

// make brush group
  var brush_group = d3.select(params.root+' .clust_container')
    .append('g')
    .classed('brush_group', true);

  var brush_area = brush_group
    .append('rect')
    .classed('brush_area', true)
    .style('fill', 'red')
    .style('opacity', 0.5)
    .attr('width', params.viz.clust.dim.width)
    .attr('height', params.viz.clust.dim.height);


  var brush_selection = d3.select(params.root+' .brush_area')
    .call(brush);

  d3.selectAll(params.root+ ' .extent')
    .style('opacity', 0.2)
    .style('fill', 'black');

};

