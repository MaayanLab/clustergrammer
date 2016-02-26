module.exports = function resize_col_hlight(params, delay_info=false){

  var delays = {};
  // var duration = params.viz.duration;

  if(delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }  

  if (delays.transition){

    // change the size of the highlighting rects
    d3.selectAll(params.root+' .col_label_click')
      .each(function() {
        
        // var bbox = d3.select(this)
        //   .select('text')[0][0]
        //   .getBBox();

      //   d3.select(this)
      //     .select('rect')
      //     .transition().delay(delays.update).duration(duration)
      //     .attr('width', bbox.width * 1.1)
      //     .attr('height', 0.67*params.matrix.rect_width)
      //     // .style('fill', function(d){
      //     //   var inst_color = 'white';
      //     //   // if (params.labels.show_categories){
      //     //   //   inst_color = params.labels.class_colors.col[d.cl];
      //     //   // }
      //     //   return inst_color;
      //     // })
      //     .style('opacity', 0.30);

      });

  } else {

    // change the size of the highlighting rects
    d3.selectAll(params.root+' .col_label_click')
      .each(function() {
        // var bbox = d3.select(this)
        //   .select('text')[0][0]
        //   .getBBox();

        // d3.select(this)
        //   .select('rect')
        //   .attr('width', bbox.width * 1.1)
        //   .attr('height', 0.67*params.matrix.rect_width)
        //   // .style('fill', function(d){
        //   //   var inst_color = 'white';
        //   //   // if (params.labels.show_categories){
        //   //   //   inst_color = params.labels.class_colors.col[d.cl];
        //   //   // }
        //   //   return inst_color;
        //   // })
        //   .style('opacity', 0.30);

      }); 

  } 

};