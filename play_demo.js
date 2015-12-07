function ini_play_button(cgm){

  // get dimensions of the main_svg
  center = {};
  center.pos_x = 1.2*g_cgm.params.norm_label.width.row + cgm.params.viz.clust.dim.width/2;
  center.pos_y = 1.2*g_cgm.params.norm_label.width.col + cgm.params.viz.clust.dim.height/2;

  

  // add preview button for demo 
  var play_button = d3.select('#main_svg')
    .append('g')
    .attr('id','play_button');

  play_button
    .attr('transform', function(){
      var pos_x = center.pos_x;
      var pos_y = center.pos_y;
      return 'translate('+pos_x+','+pos_y+')';
    });
    
  play_button
    .append('circle')
    .style('r',45)
    .style('fill','white')
    .style('stroke','black')
    .style('stroke-width','3px')
    .style('opacity',0.5);

  play_button
    .append('path')
    .attr('d',function(){

      var tri_w = 40;
      var tri_h = 22; 
      var tri_offset = 15;

      return 'M-'+tri_offset+',-'+tri_h+' l '+tri_w+','+tri_h+' l -'+tri_w+','+tri_h+' z ';
    })
    .style('fill','black')
    .style('opacity',0.5);

  // mouseover behavior
  d3.select('#play_button')
    .on('mouseover', function(){
      d3.select(this)
        .select('path')
        .style('fill','red')
        .style('opacity',1);

      d3.select(this)
        .select('circle')
        .style('opacity',1);

    })
    .on('mouseout', function(){
      d3.select(this)
        .select('path')
        .style('fill','black')
        .style('opacity',0.5);
      d3.select(this)
        .select('circle')
        .style('opacity',0.5);
    })
    .on('click', click_play)

  var delay = {};
  delay.reorder_title = 600;
  delay.reorder = delay.reorder_title + 1000;
  delay.read_duration = 1500;


  function click_play(){

    // remove play button 
    d3.select(this)
      .transition().duration(500)
      .style('opacity',0);

    if (cgm.params.zoom.scale() != 1){
      cgm.reset_zoom( inst_scale );
    }

    // play zoom 
    setTimeout( play_zoom, delay.reorder_title );

    setTimeout( play_reset_zoom, 2500 );

    // setTimeout( function(){
    //   // cgm.reorder('rank','row');
    // }, delay.reorder );



  }

  function play_zoom(){


    var inst_scale = cgm.params.viz.zoom_switch;

    setTimeout( cgm.reset_zoom, 500, 2*inst_scale );

    // playback instructions 
    var demo_group = d3.select('#main_svg')
      .append('g')
      .attr('id','demo_group')
      .style('opacity',0)
      .transition().duration(250)
      .style('opacity',1)
      .transition().duration(250).delay(delay.read_duration)
      .style('opacity',0);

    var text_rect = d3.select('#demo_group')
        .append('rect');

    var text = d3.select('#demo_group')
      .append('text')
      .attr('id','demo_text')
      .attr('font-size','50px')
      .attr('font-weight',1000)
      .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif')
      .text('Zoom by scrolling');

    var bbox = text[0][0].getBBox();
    var box_scale = 1.1;
    var box_x = -bbox.width*0.05;
    var box_y = -bbox.height*0.25;

    d3.select('#demo_group')
      .attr('transform', function(){
          var pos_x = 0.50*center.pos_x -70;
          var pos_y = 0.60*center.pos_y  ;
          return 'translate('+pos_x+','+pos_y+')';
        })

    text_rect
      .style('fill','white')
      .attr('width', box_scale*bbox.width)
      .attr('height',box_scale*bbox.height)
      .attr('x',box_x)
      .attr('y',1.1*bbox.y)
      .style('opacity',0.5);
  }

  function play_reset_zoom(){

    var text = d3.select('#demo_group')
      .select('text')
      .text('Reset zoom by double-clicking')

    d3.select('#demo_group')
      .transition().duration(250)
      .style('opacity',1)
      .transition().duration(250).delay(delay.read_duration)
      .style('opacity',0);

    var bbox = text[0][0].getBBox();
    var box_scale = 1.1;
    var box_x = -bbox.width*0.05;
    var box_y = -bbox.height*0.25;

    d3.select('#demo_group')
      .select('rect')
      .style('fill','white')
      .attr('width', box_scale*bbox.width)
      .attr('height',box_scale*bbox.height)
      .attr('x',box_x)
      .attr('y',1.1*bbox.y)
      .style('opacity',0.5);    

    setTimeout( cgm.reset_zoom, 1250, 1);
    
    var tmp_x = center.pos_x*0.6;
    var tmp_y = center.pos_y;
    setTimeout( sim_click, 1000, 'single', tmp_x, tmp_y );

  }

  function sim_click(single_double, pos_x, pos_y){
    var click_duration = 200;

    var click_circle = d3.select('#main_svg')
      .append('circle')
      .attr('cx',pos_x)
      .attr('cy',pos_y)
      .attr('r',30)
      .style('stroke','black')
      .style('stroke-width','3px')
      .style('fill','green')
      .style('opacity',0.5);

    click_circle 
      .transition().duration(click_duration)
      .style('opacity',0.0)
      .transition().duration(50)
      .style('opacity',0.5)
      .transition().duration(click_duration)
      .style('opacity',0.0)
      .remove();
  }
        
}
