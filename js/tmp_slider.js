function tmp_slider(){

  var width = self.frameElement ? 960 : innerWidth,
      height = self.frameElement ? 500 : innerHeight;

  var data = [800,100]

  var color = d3.scale.category10();

  var drag = d3.behavior.drag()
      // .origin(function(d) {
      //   return {x: d[0], y: d[1]};
      // })
      .on("drag", dragged)
      .on('dragend', function(){
        console.log('dragging has ended\n')
      })

  // var main_svg = d3.select("body")
  //     .on("touchstart", nozoom)
  //     .on("touchmove", nozoom)
  //     .append("svg")
  //     .attr("width", width)
  //     .attr("height", height);

  var main_svg = d3.select('.viz_svg');

  var slider_group = main_svg
      .append('g')
      .attr('transform', function(){ return 'translate(' + data + ')'; })
      .classed('slider_group', true);

    slider_group
      .append("line")
      .style('stroke-width', '10px')
      .style('stroke', 'black')
      .style('opacity', 0.5)
      .attr("y1", 0)
      .attr("y2", 100)

    slider_group
      .append('circle')
      .attr('r', 12)
      // .attr('y', 30)
      .style('fill', 'blue')
      .style('opacity', 0.5)
      .call(drag);

  function dragged() {
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