module.exports = function position_filter_icon(cgm){

  var viz = cgm.params.viz;
  var tmp_left;
  var tmp_top;

  // keep slider near clustergram
  var max_room = viz.svg_dim.width - 3 * viz.uni_margin;

  // position close to row dendrogram trapezoids
  tmp_left = viz.clust.margin.left + viz.clust.dim.width + 4  * viz.dendro_room.row + 7;

  if (tmp_left > max_room){
    tmp_left = max_room;
  }

  // tmp_top =  viz.clust.margin.top + 3 * viz.uni_margin - 50;
  tmp_top =  viz.clust.margin.top + 3 * viz.uni_margin + 152;

  // reposition tree icon
  d3.select(cgm.params.root + ' .' + 'filter_icon')
    .attr('transform', function() {
      var inst_translation;
      tmp_top = tmp_top - 75;
      inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')';
      return inst_translation;
    })
    .style('opacity', 1);
};