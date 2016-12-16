module.exports = function crop_matrix(){

  // transform brush-extent based on zoom/translate
  // get rows/cols from brush-extent
  // must work for differnt brushing directions (e.g. start end sites)

  var cgm = this;
  var params = cgm.params;

  var clust_width = params.viz.clust.dim.width;
  var clust_height = params.viz.clust.dim.height;

  // console.log('cropping matrix');
  var x = d3.scale.linear()
    .domain([0, clust_width]).range([0, clust_width]);
  var y = d3.scale.linear()
    .domain([0, clust_height]).range([0, clust_height]);


// make brush group
  d3.select(params.root+' .clust_container')
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

  d3.select(params.root+' .brush_group')
    .call(brush);

  function brushstart() {
    // console.log('brush start')
  }

  function brushmove() {
    // console.log('brushing')
  }

  function brushend() {
    // console.log('brush end')

    setTimeout(apply_crop, 500);

    var brushing_extent = brush.extent();


    var brush_start = brushing_extent[0];
    var brush_end = brushing_extent[1];

    var x_start = brush_start[0];
    var x_end = brush_end[0];

    var y_start = brush_start[1];
    var y_end = brush_end[1];

    if (x_start != x_end && y_start != y_end){

      // console.log('x: '+ String(x_start) + ' ' + String(x_end))
      // console.log('y: '+ String(y_start) + ' ' + String(y_end))

      // console.log('start ' + String(brushing_extent[0]))
      // console.log('end ' + String(brushing_extent[1]))

      // find cropped nodes
      var found_nodes = find_cropped_nodes(x_start, x_end, y_start, y_end, brush_start, brush_end);

      // console.log('found rows')
      // console.log(found_nodes.row)
      // console.log('found cols')
      // console.log(found_nodes.col)

      cgm.filter_viz_using_names(found_nodes);

      d3.select(params.root+' .fa-crop')
        .style('color', '#337ab7');

    }

  }


  function find_cropped_nodes(x_start, x_end, y_start, y_end, brush_start, brush_end){

    // reverse if necessary (depending on how brushing was done)
    if (x_start > x_end){
      x_start = brush_end[0];
      x_end = brush_start[0];
    }

    if (y_start > y_end){
      y_start = brush_end[1];
      y_end = brush_start[1];
    }

    // add room to brushing
    y_start = y_start - params.viz.rect_height;
    x_start = x_start - params.viz.rect_width;

    var found_nodes = {};
    found_nodes.row = [];
    found_nodes.col = [];

    d3.selectAll(params.root+' .row_label_group')
      .each(function(inst_row){

        // there is already bound data on the rows
        var inst_trans = d3.select(this)
          .attr('transform');

        var y_trans = Number(inst_trans.split(',')[1].split(')')[0]);

        if (y_trans > y_start && y_trans < y_end){

          found_nodes.row.push(inst_row.name);

        }

      });

    d3.selectAll(params.root+' .col_label_text')
      .each(function(inst_col){

        // there is already bound data on the cols
        var inst_trans = d3.select(this)
          .attr('transform');

        var x_trans = Number(inst_trans.split(',')[0].split('(')[1]);

        if (x_trans > x_start && x_trans < x_end){

          found_nodes.col.push(inst_col.name);

        }

      });


      return found_nodes;
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

