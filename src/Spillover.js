/* Spillover Module
*/
module.exports = function(params) {
  
  // hide spillover from slanted column labels on right side
  d3.select(params.root+' .col_container')
    .append('path')
    .style('stroke-width', '0')
    .attr('d', 'M 0,0 L 500,-500, L 500,0 Z')
    .attr('fill', params.viz.background_color) //!! prog_colors
    .attr('class', 'right_slant_triangle')
    .attr('transform', 'translate(' + params.viz.clust.dim.width + ',' +
    params.viz.norm_labels.width.col + ')');

  // hide spillover from slanted column labels on left side
  d3.select(params.root+' .col_container')
    .append('path')
    .style('stroke-width', '0')
    .attr('d', 'M 0,0 L 500,-500, L 0,-500 Z')
    .attr('fill', params.viz.background_color)
    .attr('class', 'left_slant_triangle')
    // shift left by 1 px to prevent cutting off labels
    .attr('transform', 'translate(-1,' + params.viz.norm_labels.width.col +
    ')');

  // white rect to cover excess labels
  d3.select(params.viz.viz_svg)
    .append('rect')
    .attr('fill', params.viz.background_color) //!! prog_colors
    .attr('width', params.viz.clust.margin.left)
    .attr('height', params.viz.clust.margin.top)
    .attr('class', 'top_left_white');


  var tmp_left = params.viz.clust.margin.left + 
    params.viz.clust.dim.width +
    params.viz.uni_margin + 
    params.viz.dendro_room.row;
  var tmp_top = params.viz.norm_labels.margin.top + params.viz.norm_labels.width.col;

  // hide spillover from right
  d3.select(params.viz.viz_svg)
    .append('rect')
    .attr('fill', params.viz.background_color) //!! prog_colors
    .attr('width', '300px')
    .attr('height', params.viz.svg_dim.height+'px')
    .attr('transform', function() {
      return 'translate(' + tmp_left + ',' + tmp_top + ')';
    })
    .attr('class', 'white_bars')
    .attr('class','right_spillover');


  // hide spillover from top of row dendrogram 
  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
  var y_offset = tmp_top;
  var tmp_width = params.viz.dendro_room.row + params.viz.uni_margin;
  var tmp_height = params.viz.cat_room.col + params.viz.uni_margin;
  d3.select(params.viz.viz_svg)
    .append('rect')
    .attr('fill', params.viz.background_color)
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    })
    .classed('white_bars',true)
    .classed('dendro_row_spillover',true); 

  // hide spillover left top of col dendrogram 
  x_offset = 0;
  y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;
  tmp_width = params.viz.clust.margin.left;
  tmp_height = params.viz.clust.dim.height;
  d3.select(params.viz.viz_svg)
    .append('rect')
    .attr('fill', params.viz.background_color)
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    })
    .classed('white_bars',true)
    .classed('dendro_col_spillover',true); 

  x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
  y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;
  tmp_width = params.viz.cat_room.col + params.viz.clust.dim.width;
  tmp_height = params.viz.cat_room.row + params.viz.uni_margin;
  d3.select(params.viz.viz_svg)
    .append('rect')
    .attr('fill', params.viz.background_color)
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    })
    .classed('white_bars',true)
    .classed('dendro_corner_spillover',true); 

  x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width + params.viz.uni_margin;
  y_offset = params.viz.norm_labels.margin.top + params.viz.norm_labels.width.col + 2.5*params.viz.uni_margin;
  var cat_text_size = 1.15*params.viz.cat_room.symbol_width;


  var cat_super_opacity = 0.65;

  // col category super labels 
  if (params.viz.show_categories.col){  
    d3.select(params.viz.viz_svg)
      .selectAll()
      .data(params.viz.all_cats.col)
      .enter()
      .append('text')
      .classed('col_cat_super', true)
      .style('font-size', cat_text_size+'px')
      .style('opacity', cat_super_opacity)
      .attr('transform', function(d){
        var inst_y = y_offset + 1.2*params.viz.cat_room.symbol_width * parseInt( d.split('-')[1], 10);
        return 'translate('+x_offset+','+inst_y+')';
      })
      .text(function(d){
        var inst_num = parseInt( d.split('-')[1], 10) + 1;
        return 'Category ' + inst_num;
      });
    }

  // row category super labels 
  if (params.viz.show_categories.row){
    var row_cat_label_container = d3.select(params.viz.viz_svg)
      .append('g')
      .classed('row_cat_label_container', true)
      .attr('transform', function(){ 
        x_offset = params.viz.norm_labels.margin.left + params.viz.norm_labels.width.row + params.viz.cat_room.symbol_width +  2.75*params.viz.uni_margin;
        y_offset = params.viz.clust.margin.top - params.viz.uni_margin;
        return 'translate('+x_offset+','+y_offset+') rotate(-90)';
    });

    row_cat_label_container
      .selectAll()
      .data(params.viz.all_cats.row)
      .enter()
      .append('text')
      .classed('row_cat_super',true)
      .style('font-size', cat_text_size+'px')
      .style('opacity', cat_super_opacity)
      .attr('transform', function(d){
        var inst_y = 1.2*params.viz.cat_room.symbol_width * parseInt( d.split('-')[1], 10 );
        return 'translate(0,'+inst_y+')';
      })
      .text(function(d){
        var inst_num = parseInt( d.split('-')[1], 10 ) + 1;
        return 'Category ' + inst_num;
      });
  }


  // // white border bottom - prevent clustergram from hitting border
  // d3.select(params.viz.viz_svg)
  //   .append('rect')
  //   .attr('class','bottom_spillover')
  //   .attr('fill', params.viz.background_color) //!! prog_colors
  //   .attr('width', params.viz.svg_dim.width)
  //   // make this border twice the width of the grey border
  //   .attr('height', 2 * params.viz.grey_border_width)
  //   .attr('transform', function() {
  //     // shift up enough to show the entire border width
  //     var inst_offset = params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
  //     return 'translate(0,' + inst_offset + ')';
  //   });



};
