d3.json('example_network.json', function(network_data){

  // make global copy of network_data 
  global_network_data = network_data;

  // pass the network data to d3_clustergram 
  make_d3_clustergram(network_data);


  // generate a list of genes for auto complete 
  ////////////////////////////////////////////////
  // get all genes 
  all_genes = [];

  // loop through row_nodes
  for (i=0; i<row_nodes.length; i++){
    all_genes.push( row_nodes[i]['name'] ); 
  };

  // use Jquery autocomplete
  ////////////////////////////////
  $( "#gene_search_box" ).autocomplete({
    source: all_genes
  });



  // submit genes button 
  $("#gene_search_box").keyup(function (e) {
      if (e.keyCode == 13) {
          // Do something
          // console.log('pressed enter');
          find_gene_in_clust();
      }
  });
});


// find gene in clustergram 
function find_gene_in_clust(){
  // get the searched gene 
  search_gene = $('#gene_search_box').val();

  if (all_genes.indexOf(search_gene) != -1){
    // zoom and highlight found gene 
    /////////////////////////////////
    zoom_and_highlight_found_gene(search_gene);
    
  }

};


// make the svg exp map (one value per tile)
function make_d3_clustergram(network_data) {

  // remove old visualization
  ////////////////////////////////
  d3.select("#main_svg").remove();

  // initialize clustergram variables 
  initialize_clustergram(network_data)

  // display col and row title 
  d3.select('#row_title').style('display','block');
  d3.select('#col_title').style('display','block');

  // toggle sidebar to make more space for visualization
  d3.select('#wrapper').attr('class','toggled');

  // display clustergram_container and clust_instruct_container
  d3.select('#clustergram_container').style('display','block');
  d3.select('#clust_instruct_container').style('display','block');

  // shift the footer left
  d3.select('#footer_div')
    .style('margin-left','0px');


  // // highlight resource types - set up type/color association
  // highlight_resource_types();

  // define the variable zoom, a d3 method 
  zoom = d3.behavior.zoom().scaleExtent([1,real_zoom*zoom_switch]).on('zoom',zoomed);

  // initialize matrix
  /////////////////////////
  matrix = [] ;
  
  // initialize matrix 
  row_nodes.forEach( function(tmp,i) {
    matrix[i] = d3.range(col_nodes.length).map(function(j) { return {pos_x: j, pos_y: i, value:0, group:0}; });
  }); 

  // Add information to the matrix
  network_data.links.forEach( function(link) {
    // transfer link information to the new adj matrix
    matrix[link.source][link.target].value = link.value;
    // transfer group information to the adj matrix 
    matrix[link.source][link.target].group = 1;
    // transfer color 
    matrix[link.source][link.target].color = link.color;
  });

  // make clustergram visualization 
  ///////////////////////////////////////

  // initailize clust_group with id clust_group
  clust_group = d3.select("#svg_div")
      .append("svg")
      .attr('id', 'main_svg')
      // the svg can be larger than the visualization - use svg_height and svg_width
      .attr("width",  svg_width  + margin.left + margin.right + spillover_x_offset)
      .attr("height", svg_height + margin.top  + margin.bottom)
      .attr('border',1)
      .call( zoom ) 
      .append("g")
      .attr('id', 'clust_group')
      .attr("transform", "translate(" + (margin.left) + "," + (margin.top) + ")");

  // grey background rect for clustergram  
  d3.select('#clust_group')
    .append("rect")
    .attr("class", "background")
    .attr('id','grey_background')
    .attr("width", svg_width)
    .attr("height", viz_height);

  // make rows 
  // use matrix for the data join, which contains a two dimensional 
  // array of objects, each row of this matrix will be passed into the row function 
  var row_obj =  clust_group.selectAll(".row")
    .data(matrix)
    .enter()
    .append("g")
    .attr("class", "row")
    .attr("transform", function(d, i) { return "translate(0," + y_scale(i) + ")"; })
    .each( row_function );

  // white lines in clustergram 
  /////////////////////////////////

  // horizontal lines
  row_obj.append('line')
    .attr('x2', 20*svg_width)
    .style('stroke-width', border_width/zoom_switch+'px')

  // append vertical line groups 
  vert_lines = clust_group
    .selectAll('.vert_lines')
    .data(col_nodes)
    .enter()
    .append('g')
    .attr('class','vert_lines')
    .attr('transform', function(d,i){ return 'translate(' + x_scale(i) + ') rotate(-90)'; })

  // add vertical lines 
  vert_lines
    .append('line')
    .attr('x1',0)
    .attr('x2',-20*viz_height)
    .style('stroke-width', border_width+'px')


  // row labels 
  //////////////////////////////////

  // white background rect for row labels
  d3.select('#main_svg')
    .append('rect')
    .attr('fill', 'white')
    .attr('width', row_label_width+'px')
    .attr('height', '3000px')
    .attr('class','white_bars');

  // append group for row labels 
  d3.select('#main_svg')
    .append("g")
    .attr('id', 'row_labels')
    .attr("transform", "translate(" + row_margin.left + "," + row_margin.top + ")")

  // generate and position the row labels
  var row_label_obj = d3.select('#row_labels')
    .selectAll('.row_label_text')
    .data(row_nodes)
    .enter()
    .append('g')
    .attr('class','row_label_text')
    .attr('transform', function(d, i) { return "translate(0," + y_scale(i) + ")"; })
    .on('click', reorder_click_row )
    .on('mouseover', function(){
      // highlight text
      d3.select(this).select('text')
        .style('font-weight','bold');
    })
    .on("mouseout", function mouseout() {
      d3.select(this).select('text')
        .style('font-weight','normal');
      // reset highlighted col 
      d3.select('#clicked_row')
        .style('font-weight','bold');
    });

  // append row label text 
  row_label_obj
    .append('text')
    // !! this will be fixed once I have separate x and y scales 
    // !! can be improved 
    .attr('y', y_scale.rangeBand()/2 )
    .attr('dy', y_scale.rangeBand()/4)
    .attr('text-anchor','end')
    .style('font-size',default_fs_row+'px')
    .text(function(d, i) { return d.name; } )

  // append rectangle behind text 
  row_label_obj
    .insert('rect','text')
    .attr('x',-10)
    .attr('y',0)
    .attr('width',10)
    .attr('height',10)
    .style('opacity',0);

  // change the size of the highlighting rects 
  row_label_obj
    .each(function(){
      // get the bounding box of the row label text 
      var bbox = d3.select(this)
                   .select('text')[0][0]
                   .getBBox();

      // use the bounding box to set the size of the rect 
      d3.select(this)
        .select('rect')
      .attr('x', bbox.x*0.5)
      .attr('y', 0)
      .attr('width', bbox.width*0.5)
      .attr('height', y_scale.rangeBand())
      .style('fill','yellow')
      .style('opacity',0);
    });

  // col labels 
  //////////////////////////////////

  // white background rect for col labels 
  d3.select('#main_svg')
    .append('rect')
    .attr('fill', 'white')
    .attr('height', col_label_width+'px')
    .attr('width', '3000px')
    .attr('class','white_bars');

  // append group for column labels 
  d3.select('#main_svg')
    .append("g")
    .attr('id', 'col_labels')
    .attr("transform", "translate(" + col_margin.left + "," + col_margin.top + ")");

  // offset click group column label 
  x_offset_click = x_scale.rangeBand()/2 + border_width
  // reduce width of rotated rects
  reduce_rect_width = x_scale.rangeBand()* 0.36 

  // add main column label group 
  col_label_obj = d3.select('#col_labels')
    .selectAll(".col_label_text")
    .data(col_nodes)
    .enter()
    .append("g")
    .attr("class", "col_label_text")
    .attr("transform", function(d, i) { return "translate(" + x_scale(i) + ") rotate(-90)"; })

  // append group for individual column label 
  col_label_click = col_label_obj
    // append new group for rect and label (not white lines)
    .append('g')
    .attr('class','col_label_click')
    // rotate column labels 
    .attr('transform', 'translate('+x_scale.rangeBand()/2+','+ x_offset_click +') rotate(45)')
    .on('click', reorder_click_col )
    .on('mouseover', function(){
      // highlight text
      d3.select(this).select('text')
        .style('font-weight','bold');
    })
    .on("mouseout", function mouseout() {
      // d3.selectAll("text").classed("active", false);
      d3.select(this).select('text')
        .style('font-weight','normal');
      // reset highlighted col 
      d3.select('#clicked_col')
        .style('font-weight','bold');
    });

  // add column label 
  col_label_click
    .append("text")
    .attr("x", 0)
    .attr("y", x_scale.rangeBand() / 2)
    .attr('dx',2*border_width)
    // .attr("dy", ".32em")
    .attr("text-anchor", "start")
    .attr('full_name',function(d) { return d.name } )
    .style('font-size',default_fs_col+'px')
    // remove underscores from name 
    .text(function(d, i) { return d.name.replace(/_/g, ' ') ; });

  // append rectangle behind text 
  col_label_click
    .insert('rect','text')
    .attr('x',10)
    .attr('y',0)
    .attr('width',10)
    .attr('height',10)
    .style('opacity',0);

  // change the size of the highlighting rects
  col_label_click
    .each(function(){

      // get the bounding box of the row label text 
      var bbox = d3.select(this)
                   .select('text')[0][0]
                   .getBBox();

      // use the bounding box to set the size of the rect 
      d3.select(this)
        .select('rect')
      .attr('x', bbox.x*1.25)
      .attr('y', 0)
      .attr('width', bbox.width*1.25)
      // used teh reduced rect width for the columsn 
      // reduced because thee rects are slanted
      .attr('height', x_scale.rangeBand()*0.6)
      // .attr('height', reduce_rect_width)
      .style('fill','yellow')
      .style('opacity',0);
    });


  // add triangle under rotated labels
  col_label_click
    .append('path')
    .style('stroke-width',0)
    .attr('d', function(d) { 
        // x and y are flipped since its rotated 
        origin_y = - border_width
        start_x  = 0;
        final_x  =  x_scale.rangeBand() - reduce_rect_width ;
        start_y  = -(x_scale.rangeBand() - reduce_rect_width + border_width) ;
        final_y  =  -border_width;
        output_string = 'M '+origin_y+',0 L ' + start_y + ',' + start_x + ', L ' + final_y + ','+final_x+' Z';
        return output_string;
       })
    .attr('fill','#eee')
    // change the colors of the triangles 
    // .attr('fill', function(d) {
    //   // look up color using data_group
    //   inst_color = res_color_dict[d.name];
    //   return inst_color;
    // });


  // Rects to hide spillover 
  ///////////////////////////////

  // white rect to cover excess labels 
  d3.select('#main_svg')
    .append('rect')
    .attr('fill', 'white')
    .attr('width',  row_label_width+'px')
    .attr('height', col_label_width+'px')
    .attr('id','top_left_white');


  // hide spillover from right
  d3.select('#main_svg')
    .append('rect')
    .attr('fill', 'white')
    .attr('width', '200px')
    .attr('height', '3000px')
    .attr('transform', function() { 
      tmp_left = margin.left + svg_width;
      // compensate for margin
      tmp_top = margin.top - 5;
      return 'translate('+tmp_left+','+tmp_top+')'
    })
    .attr('class','white_bars');

  // hide spillover from slanged column labels
  d3.select('#main_svg')
    .append('path')
    .style('stroke-width','0')
    // mini-language for drawing path in d3, used to draw triangle 
    .attr('d', 'M 0,0 L 500,-500, L 500,0 Z')
    .attr('fill','white')
    .attr('id','slant_traingle')
    .attr('transform', function(){
      tmp_left = (margin.left + svg_width );
      tmp_top = col_label_width ; 
      return 'translate('+tmp_left+','+tmp_top+')' 
    })


  // initialize zoom and translate 
  ///////////////////////////////////

  // initialize translate vector to compensate for label margins 
  zoom.translate([ margin.left, margin.top]);

  // resize window 
  d3.select(window).on('resize', timeout_resize); 

  // disable double-click zoom: double click should reset zoom level 
  // do this for all svg elements 
  d3.selectAll("svg").on("dblclick.zoom", null);    

  // double click to reset zoom - add transition 
  d3.select('#main_svg')
    // for some reason, do not put brackets in these functions 
    .on('dblclick', function(){
      // apply the following two translate zoom to reset zoom 
      // programatically 
      // only apply programatic zoom if no transitions are occurring 
      if (global_reorder == 0){
        // apply programatic zoom  
        two_translate_zoom(0,0,1)
      };
    } );
};

// row function 
function row_function(row_data) {

  // generate tiles in the current row 
  cell =  d3.select(this)
    // data join 
    .selectAll(".cell")
    .data( row_data )
    .enter()
    .append("rect")
    .attr('class', 'cell')
    .attr("x", function(d) { return x_scale(d.pos_x); })
    .attr("width", x_scale.rangeBand())
    .attr("height", y_scale.rangeBand())
    .style("fill-opacity", function(d) { 
      // calculate output opacity using the opacity scale 
      output_opacity = opacity_scale( Math.abs(d.value) );
      return output_opacity ; 
    }) 
    // switch the color based on up/dn enrichment 
    .style('fill', function(d) { 
      // console.log(d)
      return d.value > 0 ? '#FF0000' : '#1C86EE' ;
      // if (d.value != 0){
      //   inst_color = d.color;
      // }
      // else{
      //   inst_color = null;
      // }
      // return inst_color ;
    } )
    .on("mouseover", function(p) {
      d3.selectAll(".row_label_text text").classed("active", function(d, i) { return i == p.pos_y; });
      d3.selectAll(".col_label_text text").classed("active", function(d, i) { return i == p.pos_x; });
    })
    .on("mouseout", function mouseout() {
      d3.selectAll("text").classed("active", false);
    })
};

function reorder_clust_rank(order_type) {

  // set up a global variable to track when a reordering is occurring 
  global_reorder = 1;

  // load orders 
  if ( order_type == 'clust' ){ 
    // order by enrichment 
    x_scale.domain(orders.clust_row);
    y_scale.domain(orders.clust_col);
  }
  else if (order_type == 'rank'){
    // order by enrichment 
    x_scale.domain(orders.rank_row);
    y_scale.domain(orders.rank_col);
  };

  // define the t variable as the transition function 
  var t = clust_group.transition().duration(2500);

  // reorder matrix
  t.selectAll(".row")
    .attr("transform", function(d, i) { return "translate(0," + y_scale(i) + ")"; })
    .selectAll(".cell")
    .attr('x', function(d){ 
      return x_scale(d.pos_x);
    })

  // Move Row Labels
  d3.select('#row_labels').selectAll('.row_label_text')
    .transition().duration(2500)
    .attr('transform', function(d, i) { 
      return 'translate(0,' + y_scale(i) + ')'; 
    });

  // Move Col Labels 
  d3.select('#col_labels').selectAll(".col_label_text")
    .transition().duration(2500)
    .attr("transform", function(d, i) { 
      return "translate(" + x_scale(i) + ")rotate(-90)"; 
    })
    // set global reorder to 0 when done reordering
    .each('end', function(){
      // set global reorder value to 0
      global_reorder = 0;
    });
};

// initialize clustergram: size, scales, etc. 
function initialize_clustergram(network_data){
  
  // define global reordering value 
  // not currently reordering 
  global_reorder = 0;

  // move network_data information into global variables 
  col_nodes  = network_data.col_nodes ;
  row_nodes  = network_data.row_nodes ;
  inst_links = network_data.links; 

  // define screen limits
  min_screen_width = 800;
  max_screen_width = 2500;

  // define screen limits
  min_viz_width = 400;
  max_viz_width = 2000;
  min_viz_height = 600;
  max_viz_height = 1500;

  // initialize visualization size
  set_visualization_size();

  // font size controls 
  // scale default font size: input domain is the number of nodes
  min_node_num = 10;
  max_node_num = 2000;

  // // scale col and row font size 
  // ///////////////////////////////
  // // max and min font sizes 
  // min_fs = 0.01 * scale_fs_screen(screen_width);
  // max_fs = 15 * scale_fs_screen(screen_width);

  // scale only col font size 
  ///////////////////////////////
  // max and min font sizes 
  min_fs = 0.05;
  max_fs = 15;

  // output range is the font size 
  scale_font_size = d3.scale.log().domain([min_node_num,max_node_num]).range([max_fs,min_fs]).clamp('true');

  // controls how much the font size is increased by zooming when the number of nodes is at its max
  // and zooming is required 
  // 1: do not increase font size while zooming
  // 0: increase font size while zooming
  // allow some increase in font size when zooming
  min_fs_zoom = 0.95;
  // allow full increase in font size when zooming
  max_fs_zoom = 0.0; 
  // define the scaling for the reduce font size factor 
  scale_reduce_font_size_factor = d3.scale.log().domain([min_node_num,max_node_num]).range([min_fs_zoom,max_fs_zoom]).clamp('true');
  // // define the scaling for the zoomability of the adjacency matrix
  // scale_zoom  = d3.scale.log().domain([min_node_num,max_node_num]).range([2,17]).clamp('true');

  // define screen width font size scale 
  // having a small screen width should reduce the font size of the columns 
  // this will be compensated by increasing the available real zoom 
  scale_fs_screen_width = d3.scale.linear().domain( [min_viz_width,max_viz_width]).range([0.75,1.15]).clamp('true');
  scale_fs_screen_height = d3.scale.linear().domain([min_viz_width,max_viz_width]).range([0.75,1.15]).clamp('true');

  // the default font sizes are set here 
  default_fs_row = scale_font_size(row_nodes.length)* scale_fs_screen_height(viz_height); 
  // the colum font size is scaled by the width 
  default_fs_col = scale_font_size(col_nodes.length)* scale_fs_screen_width(viz_width); 

  // correct for forcing the tiles to be squares - if they are forced, then use the col font size scaling on the rows 
  if (force_square == 1){
    // scale the row font size by the col scaling  
    default_fs_row = default_fs_col;
  };

  // calculate the reduce font-size factor: 0 for no reduction in font size and 1 for full reduction of font size
  reduce_font_size_factor_row = scale_reduce_font_size_factor(row_nodes.length);
  reduce_font_size_factor_col = scale_reduce_font_size_factor(col_nodes.length);

  // set up the real zoom (2d zoom) as a function of the number of col_nodes
  // since these are the nodes that are zoomed into in 2d zooming 
  real_zoom_scale_col = d3.scale.linear().domain([min_node_num,max_node_num]).range([2,5]).clamp('true');
  // scale the zoom based on the screen size
  // smaller screens can zoom in more, compensates for reduced font size with small screen 
  real_zoom_scale_screen = d3.scale.linear().domain([min_screen_width,max_screen_width]).range([2,1]).clamp('true');
  // calculate the zoom factor - the more nodes the more zooming allowed
  real_zoom = real_zoom_scale_col(col_nodes.length)*real_zoom_scale_screen(screen_width);

  // set opacity scale 
  max_link = _.max( inst_links, function(d){ return Math.abs(d.value) } )
  opacity_scale = d3.scale.linear().domain([0, Math.abs(max_link.value) ]).clamp(true).range([0.0,1.0]) ; 
};

function set_visualization_size(){

  // find the label with the most characters and use it to adjust the row and col margins 
  row_max_char = _.max(row_nodes, function(inst) {return inst.name.length;}).name.length;
  col_max_char = _.max(col_nodes, function(inst) {return inst.name.length;}).name.length;

  // define label scale parameters: the more characters in the longest name, the larger the margin 
  min_num_char = 5;
  max_num_char = 40;
  min_label_width = 60;
  max_label_width = 200;
  label_scale = d3.scale.linear().domain([min_num_char,max_num_char]).range([min_label_width,max_label_width]).clamp('true');

  // set col_label_width and row_label_width
  row_label_width = label_scale(row_max_char) ;
  triangle_space = 30;
  col_label_width = label_scale(col_max_char) + triangle_space ;

  // distance between labels and clustergram
  label_margin = 5;

  // Margins 
  col_margin = { top:col_label_width - label_margin, right:0, bottom:0, left:row_label_width              };
  row_margin = { top:col_label_width,                right:0, bottom:0, left:row_label_width-label_margin };
  margin     = { top:col_label_width,                right:0, bottom:0, left:row_label_width              };

  // from http://stackoverflow.com/questions/16265123/resize-svg-when-window-is-resized-in-d3-js
  x_window = window.innerWidth ;
  y_window = window.innerHeight ;

  // set wrapper width and height
  d3.select('#wrapper').style('width', x_window);
  d3.select('#wrapper').style('height',y_window);

  // initalize clutergram container 
  // 
  // get screen width 
  screen_width  = Number(d3.select('#wrapper').style('width').replace('px',''));
  // get screen height
  screen_height = Number(d3.select('#wrapper').style('height').replace('px',''));

  // define offsets for permanent row and col margins 
  // takes into consideration sidebar
  // reducing sidebar width, row_offset used to be 280 when left margin was 260
  // now, rowoffset is 240 when left margin is reduced to 220 (-40px)
  // further reducing width of from 220 to 210px - left margin will be 230px
  container_row_offset = 230;
  // takes into consideration footer and header margin
  container_col_offset = 50;

  // adjust container with border
  // define width and height of clustergram container 
  width_clust_container  = screen_width - container_row_offset;
  height_clust_container = screen_height - container_col_offset;


  // Clustergram Container 
  ///////////////////////////////
  // set clustergram_container and clust_and_row_container dimensions 
  // clustergram_container
  d3.select('#clustergram_container').style('width', width_clust_container+'px')
  d3.select('#clustergram_container').style('height', height_clust_container+'px')
  // clust_and_row_container
  d3.select('#clust_and_row_container').style('width',width_clust_container+'px')
  d3.select('#clust_and_row_container').style('height',height_clust_container+'px')

  // SVG 
  ////////////////
  // define offset for svg
  // compenstates for permanent row and column labels as well
  // as x spillover 
  spillover_x_offset = label_scale(col_max_char)* 0.8 ;
  svg_x_offset = 50 + spillover_x_offset;
  svg_y_offset = 50;

  // svg size: less than container size 
  // subtract fixed length for permanent col and row labels and variable length for specific col and row labels 
  svg_width  = width_clust_container  - svg_x_offset - row_label_width ;
  svg_height = height_clust_container - svg_y_offset - col_label_width ;

  // define a visualization size, which may be smaller than the svg size if
  // there are a small number of rows 
  // or if there are more columns than rows 
  //////////////////////////////////////////////////

  // viz_width
  ////////////////////////
  // set up a scale that will prevent the visualization
  // from stretching a few rows across the entire width 
  prevent_col_stetch = d3.scale.linear().domain([1,20]).range([0.05,1]).clamp('true');

  viz_width = svg_width * prevent_col_stetch(col_nodes.length) ; 

  // viz_height 
  ////////////////
  // ensure that width of rects is not less than height 
  if (col_nodes.length > row_nodes.length){
    // scale the height 
    viz_height = svg_width*(row_nodes.length/col_nodes.length);

    // keep track of whether or not a force square has occurred 
    // so that I can adjust the font accordingly 
    // here it has
    force_square = 1;

    // make sure that this scaling does not cause the viz to be taller 
    // than the svg 
    if (viz_height > svg_height){
      // make the height equal to the width, to force square tiles - rather than thin tiles that 
      // are taller than they are wide 
      viz_height = svg_height;

      // keep track of whether or not a force square has occurred 
      // here it has not
      force_square = 0;
    };
  }
  // use the unaltered height 
  else{
    // the height will be calculated normally - leading to wide tiles 
    viz_height = svg_height;

    // keep track of whether or not a force square has occurred 
    // here it has not
    force_square = 0;
  };

  // scaling functions used to position tiles 
  x_scale = d3.scale.ordinal().rangeBands([0, viz_width]) ;
  y_scale = d3.scale.ordinal().rangeBands([0, viz_height]); 

  // Sort rows and columns 
  orders = {
    name:     d3.range(col_nodes.length).sort(function(a, b) { return d3.ascending( col_nodes[a].name, col_nodes[b].name); }),
    // rank 
    rank_row: d3.range(col_nodes.length).sort(function(a, b) { return col_nodes[b].rank  - col_nodes[a].rank; }),
    rank_col: d3.range(row_nodes.length).sort(function(a, b) { return row_nodes[b].rank  - row_nodes[a].rank; }),
    // clustered 
    // the clust order is stored under sort !! 
    clust_row: d3.range(col_nodes.length).sort(function(a, b) { return col_nodes[b].sort  - col_nodes[a].sort; }),
    clust_col: d3.range(row_nodes.length).sort(function(a, b) { return row_nodes[b].sort  - row_nodes[a].sort; })
    
  };
  
  // Assign the default sort order for the columns 
  x_scale.domain(orders.clust_row);
  y_scale.domain(orders.clust_col);

  // define border width 
  border_width = x_scale.rangeBand()/16.66;

  // define the zoom switch value - use viz_width and viz_height
  // switch from 1 to 2d zoom 
  zoom_switch = (viz_width/col_nodes.length)/(viz_height/row_nodes.length);
};

// recalculate the size of the visualization
// and remake the clustergram 
function reset_visualization_size(){

  // recalculate the size 
  set_visualization_size();

  // reset zoom and translate 
  zoom.scale(1).translate([margin.left, margin.top]);

  // pass the network data to d3_clustergram 
  make_d3_clustergram(global_network_data);
  
  // // turn off the wait sign 
  // $.unblockUI();
};

// define zoomed function 
function zoomed() {

  // gather transformation components 
  /////////////////////////////////////
  // gather zoom components 
  zoom_x = d3.event.scale;
  zoom_y = d3.event.scale;

  // gather translate vector components 
  trans_x = d3.event.translate[0] - margin.left;
  trans_y = d3.event.translate[1] - margin.top;
  
  // apply transformation: no transition duration when zooming with mouse 
  apply_transformation(trans_x, trans_y, zoom_x, zoom_y, 0);

  // reset highlighted col 
  d3.select('#clicked_col')
    // .style('font-size',default_fs_col*1.25)
    .style('font-weight','bold');
};

// apply transformation 
function apply_transformation(trans_x, trans_y, zoom_x, zoom_y, duration){
 
  // define d3 scale 
  d3_scale = zoom_x ; 

  // y - rules 
  ///////////////////////////////////////////////////

  // available panning room in the y direction 
  // multiple extra room (zoom - 1) by the width
  // always defined in the same way 
  pan_room_y = (d3_scale - 1) * svg_height ;

  // if the transformation is from a gene search, the remove pan_room_y restriction 
  if (duration > 0){
    // set pan_room_y to svg_height - removing restriction 
    pan_room_y = svg_height;
  };

  // do not translate if translate in y direction is positive 
  if (trans_y >= 0 ) {
    console.log('\nrestrict panning in the positive y direction')
    console.log(trans_y)
    // restrict transformation parameters 
    // no panning in either direction 
    trans_y = 0; 
  }
  // restrict y pan to pan_room_y if necessary 
  else if (trans_y <= -pan_room_y) {
    trans_y = -pan_room_y; 
    console.log('\nrestrict y panning based on y panning ')
  };

  // x - rules 
  ///////////////////////////////////////////////////
  // zoom in y direction only - translate in y only
  if (d3_scale < zoom_switch) {
    // no x translate or zoom 
    trans_x = 0;
    zoom_x = 1;

  }
  // zoom in both directions 
  // scale is greater than zoom_switch 
  else{

    // available panning room in the x direction 
    // multiple extra room (zoom - 1) by the width
    pan_room_x = (d3_scale/zoom_switch - 1) * svg_width ;

    // no panning in the positive direction 
    if (trans_x > 0){

      // restrict transformation parameters 
      // no panning in the x direction 
      trans_x = 0; 
      // set zoom_x
      zoom_x = d3_scale/zoom_switch;

    }
    // restrict panning to pan_room_x 
    else if (trans_x <= -pan_room_x){

      // restrict transformation parameters 
      // no panning in the x direction 
      trans_x = -pan_room_x; 
      // set zoom_x 
      zoom_x = d3_scale/zoom_switch;

    }
    // allow two dimensional panning 
    else{

      // restrict transformation parameters 
      // set zoom_x 
      zoom_x = d3_scale/zoom_switch;

    };

  };
 
  // apply transformation and reset translate vector 
  // the zoom vector (zoom.scale) never gets reset 
  ///////////////////////////////////////////////////
  // translate clustergram 
  clust_group
    .attr('transform','translate(' + [ margin.left + trans_x, margin.top + trans_y ] + ') scale('+ zoom_x +',' + zoom_y + ')');

  // transform row labels 
  d3.select('#row_labels')
    .attr('transform','translate(' + [row_margin.left , margin.top + trans_y] + ') scale(' + zoom_y + ')');

  // transform col labels
  // move down col labels as zooming occurs, subtract trans_x - 20 almost works 
  d3.select('#col_labels')
    .attr('transform','translate(' + [col_margin.left + trans_x , col_margin.top] + ') scale(' + zoom_x + ')');

  // reset translate vector - add back margins to trans_x and trans_y  
  zoom
    .translate([ trans_x +  margin.left, trans_y + margin.top]);

  // Font Sizes 
  //////////////////
  // reduce the font size by dividing by some part of the zoom 
  // if reduce_font_size_factor_ is 1, then the font will be divided by the whole zoom - and the labels will not increase in size 
  // if reduce_font_size_factor_ is 0, then the font will be divided 1 - and the labels will increase cuction of the font size 
  reduce_font_size = d3.scale.linear().domain([0,1]).range([1,zoom_y]).clamp('true');
  // scale down the font to compensate for zooming 
  fin_font = default_fs_row/(reduce_font_size(reduce_font_size_factor_row)); 
  // add back the 'px' to the font size 
  fin_font = fin_font + 'px';
  // change the font size of the labels 
  d3.selectAll('.row_label_text')
    .select('text')
    .style('font-size', fin_font);

  // re-size of the highlighting rects 
  d3.select('#row_labels')
    .each(function(){
      // get the bounding box of the row label text 
      var bbox = d3.select(this)
                   .select('text')[0][0]
                   .getBBox();

      // use the bounding box to set the size of the rect 
      d3.select(this)
        .select('rect')
      .attr('x', bbox.x*0.5)
      .attr('y', 0)
      .attr('width', bbox.width*0.5)
      .attr('height', y_scale.rangeBand())
      .style('fill','yellow');
    });


  // reduce font-size to compensate for zoom 
  // calculate the recuction of the font size 
  reduce_font_size = d3.scale.linear().domain([0,1]).range([1,zoom_x]).clamp('true');
  // scale down the font to compensate for zooming 
  fin_font = default_fs_col/(reduce_font_size(reduce_font_size_factor_col)); 
  // add back the 'px' to the font size 
  fin_font = fin_font + 'px';
  // change the font size of the labels 
  d3.selectAll('.col_label_text')
    .select('text')
    .style('font-size', fin_font);

  // change the size of the highlighting rects
  // col_label_click
  d3.select('#col_labels')
    .each(function(){

      // get the bounding box of the row label text 
      var bbox = d3.select(this)
                   .select('text')[0][0]
                   .getBBox();

      // use the bounding box to set the size of the rect 
      d3.select(this)
        .select('rect')
      .attr('x', bbox.x*1.25)
      .attr('y', 0)
      .attr('width', bbox.width * 1.25)
      // used teh reduced rect width for the columsn 
      // reduced because thee rects are slanted
      .attr('height', x_scale.rangeBand()*0.6)
      .style('fill','yellow')
      .style('opacity',0);
    });

};

// reorder columns with row click 
function reorder_click_row(d,i){

  // set up a global variable to track when a reordering is occurring 
  global_reorder = 1;

  // get inst row (gene)
  inst_gene = d3.select(this).select('text').text();

  // highlight clicked column 
  // first un-highlight all others 
  d3.selectAll('.rol_label_text').select('text')
    .style('font-weight','normal');
  // remove previous id 
  d3.select('#clicked_row')
    .attr('id','');

  // highlight current 
  d3.select(this).select('text')
    .style('font-weight','bold')
    .attr('id','clicked_row');

  // find the row number of this term from row_nodes 
  // gather row node names 
  tmp_arr = []
  for (i=0; i<row_nodes.length; i++){
    tmp_arr.push(row_nodes[i].name);
  }

  // find index 
  inst_row = _.indexOf( tmp_arr, inst_gene );

  // gather the values of the input genes 
  tmp_arr = [];
  for (j=0; j<col_nodes.length; j++) {
    tmp_arr.push(matrix[inst_row][j].value);
  }

  // sort the rows 
  tmp_sort = d3.range( tmp_arr.length ).sort(function(a, b) { return tmp_arr[b]  - tmp_arr[a]; })

  // resort the columns (resort x)
  x_scale.domain(tmp_sort);

  // reorder
  ////////////////////

  // define the t variable as the transition function 
  var t = clust_group.transition().duration(2500);

  // reorder matrix
  t.selectAll(".cell")
    .attr('x', function(d){ 
    return x_scale(d.pos_x);
  });

  // Move Row Labels
  d3.select('#col_labels').selectAll(".col_label_text")
    .transition().duration(2500)
    .attr("transform", function(d, i) { 
      return "translate(" + x_scale(i) + ")rotate(-90)"; 
    })
    // set global reorder to 0 when done reordering
    .each('end', function(){
      // set global reorder value to 0
      global_reorder = 0;
    });

  // !! this causes a bug with reordering the columns 
  // // zoom into and highlight selected row 
  // zoom_and_highlight_found_gene(inst_gene);

};

// reorder rows with column click 
function reorder_click_col(d,i){

  // set up a global variable to track when a reordering is occurring 
  global_reorder = 1;

  // get inst col (term)
  inst_term = d3.select(this).select('text').attr('full_name')

  // highlight clicked column 
  // first un-highlight all others 
  d3.selectAll('.col_label_text').select('text')
    .style('font-weight','normal');
  // remove previous id 
  d3.select('#clicked_col')
    .attr('id','');

  // highlight current 
  d3.select(this).select('text')
    .style('font-weight','bold')
    .attr('id','clicked_col');

  // find the column number of this term from col_nodes 
  // gather column node names 
  tmp_arr = []
  for (i=0; i<col_nodes.length; i++){
    tmp_arr.push(col_nodes[i].name);
  };

  // find index 
  inst_col = _.indexOf( tmp_arr, inst_term );

  // gather the values of the input genes 
  tmp_arr = [];
  for (i=0; i<row_nodes.length; i++) {
    tmp_arr.push(matrix[i][inst_col].value);
  };

  // sort the rows 
  tmp_sort = d3.range( tmp_arr.length).sort(function(a, b) { return tmp_arr[b]  - tmp_arr[a]; })

  // resort rows - y axis 
  y_scale.domain(tmp_sort);

  // reorder
  // define the t variable as the transition function 
  var t = clust_group.transition().duration(2500);

  // reorder matrix
  t.selectAll(".row")
    .attr("transform", function(d, i) { return "translate(0," + y_scale(i) + ")"; })
    .selectAll(".cell")
    .attr('x', function(d){ 
      return x_scale(d.pos_x);
    })

  // Move Row Labels
  // 
  d3.select('#row_labels').selectAll('.row_label_text')
    .transition().duration(2500)
    .attr('transform', function(d, i) { return 'translate(0,' + y_scale(i) + ')'; });

  // t.selectAll(".column")
  d3.select('#col_labels').selectAll(".col_label_text")
    .transition().duration(2500)
    .attr("transform", function(d, i) { 
      return "translate(" + x_scale(i) + ")rotate(-90)"; 
    })
    // set global reorder to 0 when done reordering
    .each('end', function(){
      // set global reorder value to 0
      global_reorder = 0;
    });

  // highlight selected column 
  ///////////////////////////////

  // unhilight and unbold all columns (already unbolded earlier)
  d3.selectAll('.col_label_text')
    .select('rect')
    .style('opacity',0);

  // highlight column name
  d3.select(this)
    .select('rect')
    .style('opacity',1);


};

// resize clustergram with screensize change
var doit;
function timeout_resize(){

  // clear timeout
  clearTimeout(doit);

  // // set up wait message before request is made 
  // $.blockUI({ css: { 
  //         border: 'none', 
  //         padding: '15px', 
  //         backgroundColor: '#000', 
  //         '-webkit-border-radius': '10px', 
  //         '-moz-border-radius': '10px', 
  //         opacity: .8, 
  //         color: '#fff' 
  //     } });

  doit = setTimeout( reset_visualization_size, 500)  ;

};


// interpolate pan and zoom
function interpolate_pan_zoom(pan_dx, pan_dy, fin_zoom){
};

function two_translate_zoom(pan_dx, pan_dy, fin_zoom){

  console.log('two_translate_zoom')
  console.log('pan_dx: '+String(pan_dx))
  console.log('pan_dy: '+String(pan_dy))
  console.log('fin_zoom: '+String(fin_zoom))

  // define the commonly used variable half_height
  var half_height = viz_height/2 ;

  // y pan room, the pan room has to be less than half_height since 
  // zooming in on a gene that is near the top of the clustergram also causes 
  // panning out of the visible region  
  var y_pan_room = ((half_height)/zoom_switch);


  // prevent visualization from panning down too much 
  // when zooming into genes near the top of the clustergram 
  if (pan_dy >= half_height - y_pan_room){

    console.log('restricting pan down')

    // prevent the clustergram from panning down too much 
    // if the amount of panning is equal to the half_height then it needs to be reduced
    // effectively, the the visualization needs to be moved up (negative) by some factor
    // of the half width of the visualization. If there was no zooming involved, then the
    // visualization would be centered first, then panned to center the top term, then 
    // the correction would re-center it. However, because of the zooming the offset is 
    // reduced by the zoom factor (this is because the panning is occurring on something 
    // that will be zoomed into - this is why the pan_dy value is not scaled in the two
    // translate transformations, but it has to be scaled afterwards to set the translate
    // vector)
    // pan_dy = half_height - (half_height)/zoom_switch

    // if pan_dy is greater than the pan room, then panning has to be restricted
    // start by shifting back up (negative) by half_height/zoom_switch then shift bak down
    // by the difference between half_height and pan_dy (so that the top of the clustergram is 
    // visible)
    var shift_top_viz = half_height - pan_dy ;
    var shift_up_viz  = - half_height/zoom_switch + shift_top_viz ; 

    // reduce pan_dy so that the visualization does not get panned to far down
    pan_dy = pan_dy + shift_up_viz ;
  };

  // prevent visualization from panning up too much
  // when zooming into genes at the bottom of the clustergram 
  if (pan_dy < -(half_height - y_pan_room) ){

    console.log('restricting pan up')
    var shift_top_viz = half_height + pan_dy ;

    // does not seem to be needed 
    /////////
    // move up by one row height 
    // var move_up_one_row = y_scale.rangeBand();
    // // do not move up one row if the clustergram is square 
    // if (zoom_switch == 1){
    //   move_up_one_row = 0;
    // };

    var shift_up_viz  =  half_height/zoom_switch - shift_top_viz; //- move_up_one_row;

    // reduce pan_dy so that the visualization does not get panned to far down
    pan_dy = pan_dy + shift_up_viz ;

  };

  // will improve this !!
  zoom_y = fin_zoom; 
  zoom_x = 1;

  // search duration - the duration of zooming and panning 
  search_duration =700;

  // center_y
  center_y = -(zoom_y -1)*half_height;

  // transform clsut group 
  clust_group
    .transition()
    .duration(search_duration)
    // first apply the margin transformation
    // then zoom, then apply the final transformation 
    .attr('transform', 'translate(' + [ margin.left,  margin.top + center_y ] + ')'+' scale('+ 1 +',' + zoom_y + ')'+'translate(' + [  pan_dx,  pan_dy ] + ')');

  // transform row labels 
  d3.select('#row_labels')
    .transition()
    .duration(search_duration)
    .attr('transform', 'translate(' + [ row_margin.left,  margin.top + center_y ] + ')'+' scale('+ zoom_y +',' + zoom_y + ')'+'translate(' + [  0,  pan_dy ] + ')');

  // transform col labels
  // move down col labels as zooming occurs, subtract trans_x - 20 almost works 
  d3.select('#col_labels')
    .transition()
    .duration(search_duration)
    .attr('transform', 'translate(' + [ col_margin.left,  col_margin.top ] + ')'+' scale('+ 1 +',' + 1 + ')'+'translate(' + [  pan_dx,  0 ] + ')');


  // Font Sizes 
  //////////////////
  // reduce font-size to compensate for zoom 
  // calculate the recuction of the font size 
  reduce_font_size = d3.scale.linear().domain([0,1]).range([1,zoom_y]).clamp('true');
  // scale down the font to compensate for zooming 
  fin_font = default_fs_row/(reduce_font_size(reduce_font_size_factor_row)); 
  // add back the 'px' to the font size 
  fin_font = fin_font + 'px';
  // change the font size of the labels 
  d3.selectAll('.row_label_text')
    .transition()
    .duration(search_duration)
    .select('text')
    .style('font-size', fin_font);

  // resize the highlighting bar when performing two transition zoom 
  // re-size of the highlighting rects 
  d3.select('#row_labels')
    .each(function(){
      // get the bounding box of the row label text 
      var bbox = d3.select(this)
                   .select('text')[0][0]
                   .getBBox();

      // use the bounding box to set the size of the rect 
      d3.select(this)
        .select('rect')
      .attr('x', bbox.x*0.5)
      .attr('y', 0)
      .attr('width', bbox.width*0.5)
      .attr('height', y_scale.rangeBand())
      .style('fill','yellow');
    });



  // reduce font-size to compensate for zoom 
  // calculate the recuction of the font size 
  reduce_font_size = d3.scale.linear().domain([0,1]).range([1,zoom_x]).clamp('true');
  // scale down the font to compensate for zooming 
  fin_font = default_fs_col/(reduce_font_size(reduce_font_size_factor_col)); 
  // add back the 'px' to the font size 
  fin_font = fin_font + 'px';
  // change the font size of the labels 
  d3.selectAll('.col_label_text')
    .transition()
    .duration(search_duration)
    .select('text')
    .style('font-size', fin_font);

  // set y translate: center_y is positive, positive moves the visualization down 
  // the translate vector has the initial margin, the first y centering, and pan_dy
  // times the scaling zoom_y  
  var net_y_offset = margin.top + center_y +  pan_dy * zoom_y  ;

  // reset the zoom translate and zoom 
  zoom.scale(zoom_y);
  zoom.translate([  pan_dx, net_y_offset])

};

// zoom into and highlight the found the gene 
function zoom_and_highlight_found_gene(search_gene){

  // unhighlight and unbold all genes 
  d3.selectAll('.row_label_text')
    .select('text')
    .style('font-weight','normal');
  d3.selectAll('.row_label_text')
    .select('rect')
    .style('opacity',0);

  // find the index of the gene 
  inst_gene_index = _.indexOf( all_genes, search_gene );  

  // get y position 
  inst_y_pos = y_scale(inst_gene_index)  ;

  // make row name bold 
  d3.selectAll('.row_label_text')
    .filter(function(d){ return d.name == search_gene})
    .select('text')
    .style('font-weight','bold');
  // highlight row name 
  d3.selectAll('.row_label_text')
    .filter(function(d){ return d.name == search_gene})
    .select('rect')
    .style('opacity',1);

  // calculate the y panning required to center the found gene 
  pan_dy = viz_height/2 - inst_y_pos;

  // use two translate method to control zooming 
  // pan_x, pan_y, zoom 
  // only apply programatic zoom if no transitions are occurring 
  if (global_reorder == 0){
    // apply programatic zoom  
    two_translate_zoom(0, pan_dy, zoom_switch );
  }; 
};

