module.exports = function resize_spillover(params, ini_svg_group, delay_info=false){

  var delays = {};
  var duration = params.viz.duration;
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
    .select(params.root+' .right_slant_triangle')
    .attr('transform', 'translate(' + params.viz.clust.dim.width + ',' +
    params.viz.norm_labels.width.col + ')');

  svg_group.select(params.root+' .left_slant_triangle')
    .attr('transform', 'translate(-1,' + params.viz.norm_labels.width.col +')');

  svg_group
    .select(params.root+' .top_left_white')
    .attr('width', params.viz.clust.margin.left)
    .attr('height', params.viz.clust.margin.top);

  var tmp_left = params.viz.clust.margin.left +   
    params.viz.clust.dim.width +
    params.viz.uni_margin + 
    params.viz.dendro_room.row;
  var tmp_top = params.viz.norm_labels.margin.top + params.viz.norm_labels.width.col;
  
  svg_group.select(params.root+' .right_spillover')
    .attr('transform', function() {
      return 'translate(' + tmp_left + ',' + tmp_top + ')';
    })
    .attr('height', params.viz.svg_dim.height+'px');

  // resize dendro spillovers 
  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
  var y_offset = tmp_top;
  var tmp_width = params.viz.dendro_room.row + params.viz.uni_margin;
  var tmp_height = params.viz.cat_room.col + params.viz.uni_margin;  
  d3.select(params.root+' .dendro_row_spillover')
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    });

  // hide spillover left top of col dendrogram 
  x_offset = 0;
  y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;
  tmp_width = params.viz.clust.margin.left;
  tmp_height = params.viz.clust.dim.height;
  d3.select(params.root+' .dendro_col_spillover')
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    });

  x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
  y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;
  tmp_width = params.viz.cat_room.col + params.viz.uni_margin;
  tmp_height = params.viz.cat_room.row + params.viz.uni_margin;
  d3.select(params.root+' .dendro_corner_spillover')
    .attr('width',tmp_width)
    .attr('height',tmp_height)
    .attr('transform', function(){
      return 'translate('+x_offset+','+y_offset+')';
    });

  // white border bottom - prevent clustergram from hitting border
  svg_group.select(params.root+' .bottom_spillover')
    .attr('width', params.viz.svg_dim.width)
    .attr('height', 2 * params.viz.grey_border_width)
    .attr('transform', function() {
      // shift up enough to show the entire border width
      var inst_offset = params.viz.svg_dim.height - 3 * params.viz.grey_border_width;
      return 'translate(0,' + inst_offset + ')';
    });

};