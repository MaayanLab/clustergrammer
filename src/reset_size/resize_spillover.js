module.exports = function resize_spillover(viz, ini_svg_group, delay_info=false){

  var delays = {};
  var duration = viz.duration;
  var svg_group;

  if(delay_info === false){
    delays.run_transition = false;
  } else {
    delays = delay_info;
  }

  if (delays.run_transition){
    svg_group = ini_svg_group
      .transition().delay(delays.update).duration(duration);
  } else {
    svg_group = ini_svg_group;
  }

  svg_group
    .select(viz.root+' .right_slant_triangle')
    .attr('transform', 'translate(' + viz.clust.dim.width + ',' +
    viz.norm_labels.width.col + ')');

  svg_group.select(viz.root+' .left_slant_triangle')
    .attr('transform', 'translate(-1,' + viz.norm_labels.width.col +')');

  svg_group
    .select(viz.root+' .top_left_white')
    .attr('width', viz.clust.margin.left)
    .attr('height', viz.clust.margin.top);

  var tmp_left = viz.clust.margin.left +   
    viz.clust.dim.width +
    viz.uni_margin + 
    viz.dendro_room.row;
  var tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;
  
  svg_group.select(viz.root+' .right_spillover')
    .attr('transform', function() {
      return 'translate(' + tmp_left + ',' + tmp_top + ')';
    })
    .attr('height', viz.svg_dim.height+'px');

  // resize dendro spillovers 
  var x_offset = viz.clust.margin.left + viz.clust.dim.width;
  var y_offset = tmp_top;
  var tmp_width = viz.dendro_room.row + viz.uni_margin;
  var tmp_height = viz.cat_room.col + viz.uni_margin;  
  d3.select(viz.root+' .dendro_row_spillover')
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    });

  // hide spillover left top of col dendrogram 
  x_offset = 0;
  y_offset = viz.clust.margin.top + viz.clust.dim.height;
  tmp_width = viz.clust.margin.left;
  tmp_height = viz.clust.dim.height;

  svg_group
    .select('.dendro_col_spillover')
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    });

  x_offset = viz.clust.margin.left + viz.clust.dim.width;
  y_offset = viz.clust.margin.top + viz.clust.dim.height;
  tmp_width = viz.cat_room.col + viz.clust.dim.width;
  tmp_height = viz.cat_room.row + viz.uni_margin;

  svg_group
    .select('.dendro_corner_spillover')
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    });

  // if (viz.show_categories.col)
  //   // reposition category superlabels 
  //   d3.select(viz.root+' .col_cat_super')


  // white border bottom - prevent clustergram from hitting border
  svg_group.select(viz.root+' .bottom_spillover')
    .attr('width', viz.svg_dim.width)
    .attr('height', 2 * viz.grey_border_width)
    .attr('transform', function() {
      // shift up enough to show the entire border width
      var inst_offset = viz.svg_dim.height - 3 * viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
    });

};