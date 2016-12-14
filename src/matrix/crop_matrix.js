module.exports = function crop_matrix(){

  var cgm = this;
  var params = cgm.params;

  var clust_width = params.viz.clust.dim.width;
  var clust_height = params.viz.clust.dim.height;

  console.log('cropping matrix');
  var x = d3.scale.linear()
    .domain([0, clust_width]).range([0, clust_width]);
  var y = d3.scale.linear()
    .domain([0, clust_height]).range([0, clust_height]);


// make brush group
  var brush_group = d3.select(params.root+' .clust_container')
    .append('g')
    .classed('brush_group', true);

  // var brush_area = brush_group
  //   .append('rect')
  //   .classed('brush_area', true)
  //   .style('fill', 'red')
  //   .style('opacity', 0.5)
  //   .attr('width', clust_width)
  //   .attr('height', clust_height);

  cgm.params.is_cropping = true;

  var brush = d3.svg.brush()
      .x(x)
      .y(y)
      .on("brushstart", brushstart)
      .on("brush", brushmove)
      .on("brushend", brushend);

  var brush_selection = d3.select(params.root+' .brush_group')
    .call(brush);

  function brushstart(p) {
    console.log('brush start')
  }

  function brushmove(p) {
    console.log('brushing')
  }

  function brushend() {
    console.log('brush end')

    setTimeout(apply_crop, 500);

    var brushing_extent = brush.extent();

    console.log('here')
    console.log(brushing_extent)


  }

  function apply_crop(){

    d3.select('.brush_group')
      .transition()
      .style('opacity', 0)
      .remove();

    cgm.params.is_cropping = false;
  }

  d3.selectAll(params.root+ ' .extent')
    .style('opacity', 0.2)
    .style('fill', 'black');

};

