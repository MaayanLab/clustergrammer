module.exports = function crop_matrix(){

  // transform brush-extent based on zoom/translate
  // get rows/cols from brush-extent
  // must work for differnt brushing directions (e.g. start end sites)

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

    // console.log(brushing_extent)

    console.log('start ' + String(brushing_extent[0]))
    console.log('end ' + String(brushing_extent[1]))

    var brush_start = brushing_extent[0];
    var brush_end = brushing_extent[1];

    d3.selectAll(params.root+' .row_label_group')
      .each(function(inst_row){

        // there is already bound data on the rows
        var inst_trans = d3.select(this)
          .attr('transform');

        var y_trans = Number(inst_trans.split(',')[1].split(')')[0]);


        if (y_trans > brush_start[1] && y_trans < brush_end[1]){

          console.log('found: '+ inst_row.name);
          // console.log('greater than: ' + String(y_trans))
          // console.log('y_trans: '+ String(y_trans) + '\n')

          // console.log('brush_end: '+String(brush_end))
          console.log('\n')
          // if (y_trans < brush_end[1])

        }

      })


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

