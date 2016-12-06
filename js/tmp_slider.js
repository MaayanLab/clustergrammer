function tmp_slider(){

  var viz = cgm.params.viz;

  // var tmp_left = viz.clust.margin.left +
  //   viz.clust.dim.width +
  //   4*viz.uni_margin +
  //   viz.dendro_room.row;

  // var tmp_left = viz.clust.dim.width + viz.clust.margin.left;

  var tmp_left = viz.svg_dim.width - 7*viz.uni_margin;

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
      .style('stroke-width', '5px')
      .style('stroke', 'black')
      .style('stroke-linecap', 'round')
      .style('opacity', 0.20)
      .attr("y1", 0)
      .attr("y2", 100)

    slider_group
      .append('circle')
      .attr('r', 9)
      // .attr('y', 50)
      .attr('transform', function(){
        return 'translate(0, 50)';
      })
      .style('fill', 'blue')
      .style('opacity', 0.5)
      .call(drag);

    slider_group
      .append('path')
      .style('fill', 'black')
      .attr('transform', 'translate(12, 0)')
      .attr('d', function(d) {

        // up triangle
        var start_x = 0 ;
        var start_y = -5;

        var mid_x = 0;
        var mid_y = 105;

        var final_x = 12;
        var final_y = -5;

        var output_string = 'M' + start_x + ',' + start_y + ', L' +
        mid_x + ', ' + mid_y + ', L'
        + final_x + ','+ final_y +' Z';

        return output_string;
      })
      .style('opacity', 0.35)

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