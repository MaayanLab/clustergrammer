function ini_play_button(cgm){

  // initialize 
  var delay = {};
  delay.reorder_title = 600;
  delay.reorder = delay.reorder_title + 1000;

  initialize_play();

  // 
  function click_play(){

    toggle_play_button(false);

    // play demo 
    setTimeout( play_demo, 500 );
 
  }

  function initialize_play(){
    // get dimensions of the main_svg
    center = {};
    center.pos_x = 1.2*cgm.params.norm_label.width.row + cgm.params.viz.clust.dim.width/2;
    center.pos_y = 1.2*cgm.params.norm_label.width.col + cgm.params.viz.clust.dim.height/2;

    // make play button
    //////////////////////////
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


    // play text group 
    ///////////////////////////
    var demo_group = d3.select('#main_svg')
      .append('g')
      .attr('id','demo_group')
      .attr('transform', function(){
          var pos_x = 0.50*center.pos_x -70;
          var pos_y = 0.60*center.pos_y  ;
          return 'translate('+pos_x+','+pos_y+')';
        });
      
    demo_group
      .append('rect');    

    demo_group
      .append('text')
      .attr('font-size','50px')
      .attr('font-weight',1000)
      .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif');

  }

  function toggle_play_button(appear){

    if (appear === false){
      d3.select('#play_button')
        .transition().duration(500)
        .style('opacity',0);
    } else {
      d3.select('#play_button')
        .transition().duration(500)
        .style('opacity',1)
    }

  }

  function play_demo(){

    // zoom and pan 
    play_zoom();

    // reset zoom
    setTimeout(play_reset_zoom, 2000);

    // reorder 
    var reorder_text = 'Reorder Rows and Columns by Rank';
    setTimeout( play_reorder, 4000, 'rank', reorder_text);

    // filter - reorder - filter 
    setTimeout( play_filter, 10000 );
  }


  function play_zoom(){
    var inst_scale = cgm.params.viz.zoom_switch;
    demo_text('Zoom and Pan', 1500);
    setTimeout( cgm.reset_zoom, 500, 2*inst_scale );
  }

  function play_reset_zoom(){

    demo_text('Reset zoom by double-clicking', 1500);

    // reset zoom 
    setTimeout( cgm.reset_zoom, 1250, 1);
    
    // simulate double click 
    var tmp_x = center.pos_x*0.6;
    var tmp_y = center.pos_y;
    setTimeout( sim_click, 1000, 'single', tmp_x, tmp_y );

  }

  function play_reorder(inst_order, reorder_text){

    // cgm.reorder('rank','row');
    console.log('reordering '+inst_order)

    demo_text(reorder_text, 5000);

    setTimeout( click_reorder , 500,  inst_order, 'row');
    setTimeout( click_reorder , 3000, inst_order, 'col');

    

  }

  function play_filter(){


    var inst_filt = 0.4;
    var change_view = {'filter':inst_filt, 'num_meet':1};
    setTimeout( update_view, 100, change_view);

    var inst_filt = 0.5;
    var change_view = {'filter':inst_filt, 'num_meet':1};
    setTimeout( update_view, 3100, change_view);

    var inst_filt = 0.0;
    var change_view = {'filter':inst_filt, 'num_meet':1};
    setTimeout( update_view, 6000, change_view);

    var reorder_text = 'Reset ordering to Cluster';
    setTimeout( play_reorder, 10000, 'clust', reorder_text);

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

  function demo_text(inst_text, read_duration){

    d3.select('#demo_group')
      .style('opacity',0)
      .transition().duration(250)
      .style('opacity',1)
      .transition().duration(250).delay(read_duration)
      .style('opacity',0);
    
    var text = d3.select('#demo_group')
      .select('text')
      .text(inst_text);

    var bbox = text[0][0].getBBox();
    var box_scale = 1.1;
    var box_x = -bbox.width*0.05;
    var box_y = -bbox.height*0.25;

    d3.select('#demo_group').select('rect')
      .style('fill','white')
      .attr('width', box_scale*bbox.width)
      .attr('height',box_scale*bbox.height)
      .attr('x',box_x)
      .attr('y',1.1*bbox.y)
      .style('opacity',0.5);
  }  

  function update_view(change_view){

    demo_text('Filter matrix: '+String(100*change_view.filter)+'%', 1500);
    $("#slider_filter").slider("option", "value", change_view.filter);
    cgm.update_network(change_view);
  }

  function click_reorder(inst_order, inst_rc){
    var select_text = '#'+inst_order+'_'+inst_rc;
    $(select_text).click()
  }

  //   // add play button back 
  // .each('end', toggle_play_button, true );
        
}
