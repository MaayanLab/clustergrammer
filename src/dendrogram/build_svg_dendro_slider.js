var change_groups = require('./change_groups');

module.exports = function build_svg_dendro_slider(cgm, inst_rc){

  console.log('build svg sliders: ' + inst_rc)

  var slider_length = 100;
  var viz = cgm.params.viz;
  var tmp_left = viz.svg_dim.width - 7*viz.uni_margin;
  var tmp_top =  viz.clust.margin.top + 3*viz.uni_margin;

  var drag = d3.behavior.drag()
      // .origin(function(d) {
      //   return {x: d[0], y: d[1]};
      // })
      .on("drag", dragging)
      .on('dragend', function(){
        cgm.params.is_slider_drag = false;
      })

  var main_svg = d3.select('.viz_svg');

  var slider_group = d3.select(cgm.params.root +' .viz_svg')
      .append('g')
      .attr('transform', function() {
        return 'translate(' + tmp_left + ',' + tmp_top + ')';
      })
      .classed('slider_group', true);

    slider_group
      .append("line")
      .style('stroke-width', slider_length/20+'px')
      .style('stroke', 'black')
      .style('stroke-linecap', 'round')
      .style('opacity', 0.20)
      .attr("y1", 0)
      .attr("y2", function(){
        return slider_length-2;
      })
      .on('click', click_dendro_slider)

    slider_group
      .append('circle')
      .classed('row_group_circle', true)
      .attr('r', 8)
      .attr('transform', function(){
        return 'translate(0, '+slider_length/2+')';
      })
      .style('fill', 'blue')
      .style('opacity', 0.5)
      .call(drag);

    slider_group
      .append('path')
      .style('fill', 'black')
      .attr('transform', 'translate(10, 0)')
      .attr('d', function(d) {

        // up triangle
        var start_x = 0 ;
        var start_y = -2;

        var mid_x = 0;
        var mid_y = slider_length;

        var final_x = slider_length/10;
        var final_y = -2;

        var output_string = 'M' + start_x + ',' + start_y + ', L' +
        mid_x + ', ' + mid_y + ', L'
        + final_x + ','+ final_y +' Z';

        return output_string;
      })
      .style('opacity', 0.35)

  function dragging() {

    cgm.params.is_slider_drag = true;

    // d[0] = d3.event.x;
    var slider_pos = d3.event.y;

    if (slider_pos < 0){
      slider_pos = 0;
    }

    if (slider_pos > slider_length){
      slider_pos = slider_length;
    }

    if (this.nextSibling) this.parentNode.appendChild(this);

    slider_pos = d3.round(slider_pos, -1);

    var slider_value = 10 - slider_pos/10;

    d3.select(this).attr("transform", "translate(0, " + slider_pos + ")");

    console.log('slider_value: ' + String(slider_value))

    change_groups(cgm, 'row', slider_value);

  }



  function nozoom() {
    d3.event.preventDefault();
  }

  function click_dendro_slider(d){
    var clicked_line_position = d3.mouse(this)
    var y_pos = d3.round(clicked_line_position[1], -1)
    // reposition circle
    d3.select('.row_group_circle')
      .attr('transform', 'translate(0, '+ y_pos + ')');
  }
};