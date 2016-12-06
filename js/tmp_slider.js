function tmp_slider(){

  var viz = cgm.params.viz;

  // var tmp_left = viz.clust.margin.left +
  //   viz.clust.dim.width +
  //   4*viz.uni_margin +
  //   viz.dendro_room.row;

  // var tmp_left = viz.clust.dim.width + viz.clust.margin.left;

  var tmp_left = viz.svg_dim.width - 5*viz.uni_margin;

  var tmp_top =  viz.clust.margin.top + 3*viz.uni_margin;

  var data = [];
  data[0] = 800;
  data[1] = 100;

  var color = d3.scale.category10();

  var drag = d3.behavior.drag()
      // .origin(function(d) {
      //   return {x: d[0], y: d[1]};
      // })
      .on("drag", dragging)
      .on('dragend', function(){
        // console.log('dragging has ended\n')
        cgm.params.is_slider_drag = false;
      })

  var main_svg = d3.select('.viz_svg');

  var slider_group = main_svg
      .append('g')
      // .attr('transform', function(){ return 'translate(' + data + ')'; })
      .attr('transform', function() {
        return 'translate(' + tmp_left + ',' + tmp_top + ')';
      })
      .classed('slider_group', true);

    slider_group
      .append("line")
      .style('stroke-width', '10px')
      .style('stroke', 'black')
      .style('stroke-linecap', 'round')
      .style('opacity', 0.35)
      .attr("y1", 0)
      .attr("y2", 100)

    slider_group
      .append('circle')
      .attr('r', 12)
      // .attr('y', 30)
      .style('fill', 'blue')
      .style('opacity', 0.5)
      .call(drag);

  function dragging() {

    cgm.params.is_slider_drag = true;

    // console.log(cgm.params.is_slider_drag)

    // d[0] = d3.event.x;
    var new_y = d3.event.y;

    if (new_y < 0){
      new_y = 0;
    }

    if (new_y > 100){
      new_y = 100;
    }

    if (this.nextSibling) this.parentNode.appendChild(this);

    new_y = d3.round(new_y, -1);

    // console.log('final y')
    // console.log(new_y)

    d3.select(this).attr("transform", "translate(0, " + new_y + ")");
  }



  function nozoom() {
    d3.event.preventDefault();
  }

}