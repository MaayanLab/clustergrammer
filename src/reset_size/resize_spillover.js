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


  var rect_height = viz.clust.margin.top + viz.uni_margin/5;
  svg_group
    .select(viz.root+' .top_left_white')
    .attr('width', viz.clust.margin.left)
    .attr('height', rect_height);

  var tmp_left = viz.clust.margin.left +
    viz.clust.dim.width +
    viz.uni_margin +
    viz.dendro_room.row;
  var tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

  svg_group.select(viz.root+' .right_spillover_container')
    .attr('transform', function() {
      return 'translate(' + tmp_left + ', 0)';
    });

  tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

  svg_group.select(viz.root+' .right_spillover_container rect')
    .attr('transform', function() {
      return 'translate( 0,' + tmp_top + ')';
    });

  svg_group.select(viz.root+' .right_spillover')
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
  tmp_width = viz.clust.margin.left ;
  tmp_height = viz.clust.dim.height*10;

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

  x_offset = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin;
  y_offset = viz.norm_labels.margin.top + viz.norm_labels.width.col
    + 2.5*viz.uni_margin;
  var extra_x_room = 2.75;
  var extra_y_room = 1.2;

  // reposition category superlabels
  if (viz.show_categories.col){

    d3.selectAll(viz.root+' .col_cat_super')
      .attr('transform', function(d){
        var inst_cat = parseInt( d.split('-')[1], 10);
        var inst_y = y_offset + extra_y_room * viz.cat_room.symbol_width
          * inst_cat;
        return 'translate('+x_offset+','+inst_y+')';
      });
  }

  if (viz.show_categories.row){
    d3.select(viz.root+' .row_cat_label_container')
      .attr('transform', function(){
        x_offset = viz.norm_labels.margin.left + viz.norm_labels.width.row
          + viz.cat_room.symbol_width + extra_x_room * viz.uni_margin;
        y_offset = viz.clust.margin.top - viz.uni_margin;
        return 'translate('+x_offset+','+y_offset+') rotate(-90)';
      });
  }

  // white border bottom - prevent clustergram from hitting border
  if (viz.show_dendrogram){
    y_offset = viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col - 2*viz.uni_margin;
  } else {
    y_offset = viz.clust.margin.top + viz.clust.dim.height;
  }

  d3.select(viz.root+' .bottom_spillover_container')
    .attr('transform', function() {
      // shift up enough to show the entire border width
      return 'translate(0,' + y_offset + ')';
    });

  svg_group.select(viz.root+' .bottom_spillover')
    .attr('width', viz.svg_dim.width)
    .attr('height', 2 * viz.svg_dim.height);

  var inst_height = viz.cat_room.col + 1.5*viz.uni_margin;
  // white rect to cover excess labels
  d3.select(viz.viz_svg + ' .top_right_white')
    .attr('fill', viz.background_color)
    .attr('width', 2*viz.clust.dim.width)
    .attr('height', inst_height)
    .attr('transform', function(){
      var tmp_left = viz.clust.margin.left + viz.clust.dim.width;
      var tmp_top = viz.norm_labels.width.col + viz.norm_labels.margin.top - viz.uni_margin;
      return 'translate('+tmp_left+', '+ tmp_top +')';
    });

};