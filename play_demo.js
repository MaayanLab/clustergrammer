function ini_play_button(cgm){

var inst_play = false;

function play_demo(){
  console.log(inst_play)

  if (inst_play === false){

    console.log('here')

      inst_play = true;
      var sec_scale = 1000;

      // intro text 
      var inst_text;
      var inst_time = 0;
      var prev_duration = 0;

      setTimeout( play_intro(), inst_time);
      prev_duration = 9*sec_scale;

      // zoom and pan: duration 4
      var inst_time = inst_time + prev_duration;
      setTimeout( play_zoom, inst_time);
      var prev_duration = 4*sec_scale;

      // reset zoom: duration 4
      inst_time = inst_time + prev_duration;
      setTimeout(play_reset_zoom, inst_time);
      prev_duration = 4*sec_scale;

      // reorder col: duration 6
      inst_time = inst_time + prev_duration;
      setTimeout( play_reorder_col, inst_time ); 
      prev_duration = 7*sec_scale;

      // open menu: duration 5
      inst_time = inst_time + prev_duration;
      setTimeout( play_menu, inst_time );
      prev_duration = 5*sec_scale;

      // reorder: duration 9
      inst_time = inst_time + prev_duration;
      inst_text = 'Reorder all rows and columns \nby clicking the reorder \nbuttons';
      setTimeout( play_reorder, inst_time, 'rank', inst_text);
      prev_duration = 9*sec_scale;

      // search: duration 7.5
      inst_time = inst_time + prev_duration;
      setTimeout( play_search, inst_time );
      prev_duration = 7.5*sec_scale;

      // filter: duration 14
      inst_time = inst_time + prev_duration;
      setTimeout( play_filter, inst_time );
      prev_duration = 14*sec_scale;

      // revert clust: duration 3
      inst_time = inst_time + prev_duration;
      setTimeout( quick_cluster, inst_time );
      prev_duration = 3*sec_scale;

      // play_groups duration 7
      inst_time = inst_time + prev_duration;
      setTimeout( play_groups, inst_time );
      prev_duration = 7*sec_scale;

      // rexepand duration 3
      inst_time = inst_time + prev_duration;
      setTimeout( play_expand, inst_time)
      prev_duration = 2*sec_scale;

      // replay_demo duration 4
      inst_time = inst_time + prev_duration;
      setTimeout( replay_demo, inst_time);
      prev_duration = 4*sec_scale;

  }

  }

  function play_intro(){
    var text = 'Clustergrammer allows users to generate\ninteractive and sharable visualizations\nby uploading a matrix';
    setTimeout( demo_text, 0, text, 5000 )
    setTimeout( demo_text, 5000, "This demo will quickly overview\nClustergrammer's interactive features", 3500 )

    // duration 11000
  }

  function play_expand(){
    click_expand_button();
    setTimeout(change_groups, 250, 0.5);
    // duration 3000
  }

  function replay_demo(){
    setTimeout(demo_text, 0, "Clustergrammer is built with gene-\nexpression data in mind and interfaces\nwith several Ma'ayan lab web-tools\n", 5000);
    setTimeout(demo_text, 5000, "The example data being visualized is\ngene-expression data obtained from the\nCancer Cell Line Encyclopedia", 5000);
    setTimeout(demo_text, 10000, "For more information please view\nthe help documents", 5000);
    setTimeout(toggle_play_button, 16000, true);
    inst_play = false;
  }

  function play_groups(){

    demo_text('Identify row and column \ngroups of varying sizes\nusing the slider', 3000);

    setTimeout(
      function(){
        d3.select('#slider_col')
            .transition()
            .style('box-shadow','0px 0px 10px 5px #007f00')
            .transition().duration(1).delay(5500)
            .style('box-shadow','0px 0px 0px 0px #FFFFFF');

      }, 1000);

    setTimeout(change_groups, 2000, 0.4);
    setTimeout(change_groups, 3000, 0.5);
    setTimeout(change_groups, 4000, 0.6);
    setTimeout(change_groups, 5000, 0.7);

    // duration 7000 

  }

  function change_groups(inst_value){
    $("#slider_col").slider( "value", inst_value);
    cgm.change_groups('col', 10*inst_value);
  }

  function quick_cluster(){
    var inst_order = 'clust';
    setTimeout( click_reorder , 0,  inst_order, 'row');
    setTimeout( click_reorder , 250, inst_order, 'col');
  }

  function play_search(){

    demo_text('Search for rows using\nthe search box', 4000);

    d3.select('#gene_search_container')
      .transition()
        .style('background','#007f00')
        .style('box-shadow','0px 0px 10px 5px #007f00')
        .transition().duration(1).delay(6000)
        .style('background','#FFFFFF')
        .style('box-shadow','0px 0px 0px 0px #FFFFFF');

    var search_string = 'EGFR';

    var ini_delay = 1000;
    // manually mimic typing and autocomplete 
    setTimeout( type_out_search, ini_delay+1000, 'E' );
    setTimeout( type_out_search, ini_delay+1500, 'EG' );
    setTimeout( type_out_search, ini_delay+2000, 'EGF' );
    setTimeout( type_out_search, ini_delay+2500, 'EGFR' );

    // perform search 
    setTimeout( run_search, 4000 );

  }

  function run_search(){
    $('#submit_gene_button').click();
    // clear autocomplete 
    $( "#gene_search_box" ).autocomplete( "search", '' );

    // reset zoom 
    setTimeout( cgm.reset_zoom, 2000, 1);
  }

  function type_out_search(inst_string){
    $('#gene_search_box').val(inst_string)
    $( "#gene_search_box" ).autocomplete( "search", inst_string );
  }

  // allows doubleclicking on d3 element
  jQuery.fn.d3DblClick = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      e.dispatchEvent(evt);
    });
  };

  // allows doubleclicking on d3 element
  jQuery.fn.d3Click = function () {
    this.each(function (i, e) {
      var evt = document.createEvent("MouseEvents");
      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
      e.dispatchEvent(evt);
    });
  };

  function play_menu(){
    demo_text('View additional controls\nby clicking the menu button', 4000);

    if (cgm.params.viz.expand===true){
      setTimeout(click_expand_button, 3000);
    }
  }

  function click_expand_button(){
    
    sim_click('single',25,25);

    setTimeout( function(){      
      $("#expand_button").d3Click()
    }, 500);
  }

  function play_reorder_col(){
    
    demo_text('Reorder the matrix based on a single\nrow or column by double-clicking a \n label', 6000)

    // select column to be reordered 
    tmp = d3.selectAll('.row_label_text')
      .filter(function(d){
        return d.name == 'EGFR';
      });

    tmp
      .attr('id','demo_col_click');

    setTimeout(delay_clicking_row, 3500);
    // duration 7000
  }

  function delay_clicking_row(){
    $("#demo_col_click").d3DblClick();
    sim_click('double', 30, 340); 
  }

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
          var pos_x = 100;
          var pos_y = 130 ;
          return 'translate('+pos_x+','+pos_y+')';
        });
      
    demo_group
      .append('rect')
      .attr('id','rect_1');

    demo_group
      .append('rect')
      .attr('id','rect_2');

    demo_group
      .append('rect')
      .attr('id','rect_3');

    var demo_text_size = 40;
    demo_group
      .append('text')
      .attr('id','text_1')
      .attr('font-size',demo_text_size+'px')
      .attr('font-weight',1000)
      .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif');

    demo_group
      .append('text')
      .attr('id','text_2')
      .attr('font-size',demo_text_size+'px')
      .attr('font-weight',1000)
      .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif')
      .attr('transform', function(){
        return 'translate(0,50)';
      });

    demo_group
      .append('text')
      .attr('id','text_3')
      .attr('font-size',demo_text_size+'px')
      .attr('font-weight',1000)
      .attr('font-family','"Helvetica Neue", Helvetica, Arial, sans-serif')
      .attr('transform', function(){
        return 'translate(0,100)';
      });      
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

  function play_zoom(){
    var inst_scale = cgm.params.viz.zoom_switch;
    demo_text('Zoom and pan by\nscrolling and dragging', 4000);
    setTimeout( cgm.reset_zoom, 1500, 2*inst_scale );

    // duration 4000
  }

  function play_reset_zoom(){

    demo_text('Reset zoom by double-clicking\n', 3000);

    // simulate double click slightly before zoom  
    var tmp_x = center.pos_x*0.6;
    var tmp_y = center.pos_y;
    var click_time = 2000;
    setTimeout( sim_click, click_time, 'double', tmp_x, tmp_y );

    // reset zoom 
    setTimeout( cgm.reset_zoom, click_time+250, 1);
    
    // duration 4000 

  }

  function play_reorder(inst_order, reorder_text){

    demo_text(reorder_text, 7000);

    setTimeout( function(){
      d3.select('#toggle_col_order')
          .transition()
          .style('background','#007f00')
          .style('box-shadow','0px 0px 10px 5px #007f00')
          .transition().duration(1).delay(4000)
          .style('background','#FFFFFF')
          .style('box-shadow','0px 0px 0px 0px #FFFFFF');
    }
    , 1000);

    setTimeout( click_reorder , 2000,  inst_order, 'row');

    setTimeout( function(){
      d3.select('#toggle_row_order')
          .transition()
          .style('background','#007f00')
          .style('box-shadow','0px 0px 10px 5px #007f00')
          .transition().duration(1).delay(4000)
          .style('background','#FFFFFF')
          .style('box-shadow','0px 0px 0px 0px #FFFFFF');
    }
    , 5000);

    setTimeout( click_reorder , 6000, inst_order, 'col');

    // duration 9000

  }

  function play_filter(){

    var text = 'Filter the matrix at varying \nthresholds using the slider';

    var ini_wait = 4500;
    demo_text(text, ini_wait);

    d3.select('#slider_filter')
        .transition()
        .style('box-shadow','0px 0px 10px 5px #007f00')
        .transition().duration(1).delay(12000)
        .style('box-shadow','0px 0px 0px 0px #FFFFFF');

    var inst_filt = 0.3;
    var change_view = {'filter':inst_filt, 'num_meet':1};
    setTimeout( update_view, ini_wait, change_view);

    var inst_filt = 0.6;
    var change_view = {'filter':inst_filt, 'num_meet':1};
    setTimeout( update_view, ini_wait+3000, change_view);

    var inst_filt = 0.0;
    var change_view = {'filter':inst_filt, 'num_meet':1};
    setTimeout( update_view, ini_wait+6000, change_view);

  }

  function sim_click(single_double, pos_x, pos_y){
    var click_duration = 200;

    var click_circle = d3.select('#main_svg')
      .append('circle')
      .attr('cx',pos_x)
      .attr('cy',pos_y)
      .attr('r',25)
      .style('stroke','black')
      .style('stroke-width','3px')
      .style('fill','#007f00')
      .style('opacity',0.5);

    if (single_double === 'double'){
      click_circle 
        .transition().duration(click_duration)
        .style('opacity',0.0)
        .transition().duration(50)
        .style('opacity',0.5)
        .transition().duration(click_duration)
        .style('opacity',0.0)
        .remove();
    } else {
      click_circle 
        .transition().duration(click_duration)
        .style('opacity',0.0)
        .transition().duration(250)
        .remove();
    }
  }


  function update_view(change_view){

    var text = 'Filter threshold: '+ String(change_view.filter*100)+'%\n'

    // delay text slightly
    setTimeout( demo_text, 300, text, 1900 );

    $("#slider_filter").slider( "value", change_view.filter);
    d3.select('#filter_value').text('Filter: '+change_view.filter*100+'%');
    cgm.update_network(change_view);
  }

  function click_reorder(inst_order, inst_rc){

    var select_text = '#'+inst_order+'_'+inst_rc;
    $(select_text).click();
  }

  function demo_text(text, read_duration){

    var split_text = text.split('\n');

    if (split_text.length < 3){
      split_text.push('');
    }

    d3.select('#demo_group')
      .style('opacity',0)
      .transition().duration(250)
      .style('opacity',1)
      .transition().duration(250).delay(read_duration)
      .style('opacity',0);
    
    var box_scale = 1.1;

    for (i=0; i<split_text.length; i++){

      var inst_text_num = i+1;

      // make text box 
      //////////////////
      var inst_text_obj = d3.select('#demo_group')
        .select('#text_'+inst_text_num)
        .text(split_text[i]);
      var bbox = inst_text_obj[0][0].getBBox();

      var box_opacity = 0.85;

      d3.select('#demo_group')
        .select('#rect_'+inst_text_num)
        .style('fill','white')
        .attr('width', bbox.width+20)
        .attr('height',bbox.height)
        .attr('x',-10)
        .attr('y',bbox.y+i*50)
        .style('opacity',box_opacity);
    }
       
  }  

        
}
