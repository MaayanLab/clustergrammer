module.exports = function position_svg_dendro_slider(cgm, inst_rc){

  var viz = cgm.params.viz;
  var tmp_left;
  var tmp_top;
  if (inst_rc === 'row'){

    // row dendrogram
    ///////////////////////

    // keep slider near clustergram
    var max_room = viz.svg_dim.width - 3 * viz.uni_margin;

    // position close to row dendrogram trapezoids
    tmp_left = viz.clust.margin.left + viz.clust.dim.width + 5*viz.dendro_room.row;

    if (tmp_left > max_room){
      tmp_left = max_room;
    }

    tmp_top =  viz.clust.margin.top + 3 * viz.uni_margin;
  } else {

    // column dendrogram
    ///////////////////////
    tmp_left = 2 * viz.uni_margin;
    // tmp_top =  viz.svg_dim.height - 2.5 * viz.uni_margin;
    tmp_top =  viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col - 2*viz.uni_margin;

  }

  d3.select(cgm.params.root + ' .' + inst_rc + '_slider_group')
    .attr('transform', function() {
      var inst_translation;
      if (inst_rc === 'row'){
        inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')';
      } else {
        inst_translation = 'translate(' + tmp_left + ',' + tmp_top +
                           '), rotate(-90)';
      }
      return inst_translation;
    })
    .style('opacity', 1);

};