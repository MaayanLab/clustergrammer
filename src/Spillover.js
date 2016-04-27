var get_cat_title = require('./categories/get_cat_title');
var ini_cat_reorder = require('./reorder/ini_cat_reorder');

module.exports = function Spillover(params) {

  var viz = params.viz;

  // hide spillover from slanted column labels on right side
  d3.select(viz.root+' .col_container')
    .append('path')
    .style('stroke-width', '0')
    .attr('d', 'M 0,0 L 1000,-1000, L 1000,0 Z')
    .attr('fill', viz.background_color) //!! prog_colors
    .attr('class', 'right_slant_triangle')
    .attr('transform', 'translate(' + viz.clust.dim.width + ',' +
    viz.norm_labels.width.col + ')');

  // hide spillover from slanted column labels on left side
  d3.select(viz.root+' .col_container')
    .append('path')
    .style('stroke-width', '0')
    .attr('d', 'M 0,0 L 500,-500, L 0,-500 Z')
    .attr('fill', viz.background_color)
    .attr('class', 'left_slant_triangle')
    // shift left by 1 px to prevent cutting off labels
    .attr('transform', 'translate(-1,' + viz.norm_labels.width.col +
    ')');

  // white rect to cover excess labels
  d3.select(viz.viz_svg)
    .append('rect')
    .attr('fill', viz.background_color) //!! prog_colors
    .attr('width', viz.clust.margin.left)
    .attr('height', viz.clust.margin.top)
    .attr('class', 'top_left_white');


  var tmp_left = viz.clust.margin.left + 
    viz.clust.dim.width +
    viz.uni_margin + 
    viz.dendro_room.row;
  var tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

  // hide spillover from right
  d3.select(viz.viz_svg)
    .append('rect')
    .attr('fill', viz.background_color) //!! prog_colors
    .attr('width', 10*viz.clust.dim.width)
    .attr('height', viz.svg_dim.height+'px')
    .attr('transform', function() {
      return 'translate(' + tmp_left + ',' + tmp_top + ')';
    })
    .attr('class', 'white_bars')
    .attr('class','right_spillover');

  // hide spillover from top of row dendrogram 
  var x_offset = viz.clust.margin.left + viz.clust.dim.width;
  var y_offset = tmp_top;
  var tmp_width = viz.dendro_room.row + viz.uni_margin;
  var tmp_height = viz.cat_room.col + viz.uni_margin;
  d3.select(viz.viz_svg)
    .append('rect')
    .attr('fill', viz.background_color)
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    })
    .classed('white_bars',true)
    .classed('dendro_row_spillover',true); 

  // hide spillover left top of col dendrogram 
  x_offset = 0;
  y_offset = viz.clust.margin.top + viz.clust.dim.height;
  tmp_width = viz.clust.margin.left;
  tmp_height = viz.clust.dim.height*10;
  d3.select(viz.viz_svg)
    .append('rect')
    .attr('fill', viz.background_color)
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    })
    .classed('white_bars',true)
    .classed('dendro_col_spillover',true); 

  x_offset = viz.clust.margin.left + viz.clust.dim.width;
  y_offset = viz.clust.margin.top + viz.clust.dim.height;
  tmp_width = viz.cat_room.col + viz.clust.dim.width;
  tmp_height = viz.cat_room.row + viz.uni_margin;
  d3.select(viz.viz_svg)
    .append('rect')
    .attr('fill', viz.background_color)
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    })
    .classed('white_bars',true)
    .classed('dendro_corner_spillover',true); 

  x_offset = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin;
  y_offset = viz.norm_labels.margin.top + viz.norm_labels.width.col 
    + 2.5*viz.uni_margin;
  var cat_text_size = 1.15*viz.cat_room.symbol_width;
  var cat_super_opacity = 0.65;
  var extra_x_room = 2.75;
  var extra_y_room = 1.25;

  // col category super labels 
  if (viz.show_categories.col){  
    d3.select(viz.viz_svg)
      .selectAll()
      .data(viz.all_cats.col)
      .enter()
      .append('text')
      .classed('col_cat_super', true)
      .style('font-size', cat_text_size+'px')
      .style('opacity', cat_super_opacity)
      .style('cursor','default')
      .attr('transform', function(d){
        var inst_cat = parseInt( d.split('-')[1], 10);
        var inst_y = y_offset + extra_y_room * viz.cat_room.symbol_width 
          * inst_cat;
        return 'translate('+x_offset+','+inst_y+')';
      })
      .text(function(d){
        return get_cat_title(viz, d, 'col');
      });
    }

  // row category super labels 
  if (viz.show_categories.row){
    var row_cat_label_container = d3.select(viz.viz_svg)
      .append('g')
      .classed('row_cat_label_container', true)
      .attr('transform', function(){ 
        x_offset = viz.norm_labels.margin.left + viz.norm_labels.width.row 
          + viz.cat_room.symbol_width + extra_x_room * viz.uni_margin;
        y_offset = viz.clust.margin.top - viz.uni_margin;
        return 'translate('+x_offset+','+y_offset+') rotate(-90)';
      });

    if (viz.sim_mat === false){

      row_cat_label_container
        .selectAll()
        .data(viz.all_cats.row)
        .enter()
        .append('text')
        .classed('row_cat_super',true)
        .style('font-size', cat_text_size+'px')
        .style('opacity', cat_super_opacity)
        .style('cursor','default')
        .attr('transform', function(d){
          var inst_y = extra_y_room*viz.cat_room.symbol_width 
            * parseInt( d.split('-')[1], 10 );
          return 'translate(0,'+inst_y+')';
        })
        .text(function(d){
          return get_cat_title(viz, d, 'row');
        });

    }  
  }


  // white border bottom - prevent clustergram from hitting border
  if (viz.show_dendrogram){
    y_offset = viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col;
  } else {
    y_offset = viz.clust.margin.top + viz.clust.dim.height;
  }
  d3.select(viz.viz_svg)
    .append('rect')
    .attr('class','bottom_spillover')
    .attr('fill', viz.background_color) //!! prog_colors
    .attr('width', viz.svg_dim.width)
    // make this border twice the width of the grey border
    .attr('height', 2 * viz.svg_dim.height)
    .attr('transform', function() {
      // shift up enough to show the entire border width
      var inst_offset = y_offset;
      return 'translate(0,' + inst_offset + ')';
    });



  ini_cat_reorder(params);



};
