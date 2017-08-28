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
    tmp_left = viz.clust.margin.left + viz.clust.dim.width + 5.25  * viz.dendro_room.row;

    if (tmp_left > max_room){
      tmp_left = max_room;
    }

    tmp_top =  viz.clust.margin.top + 3 * viz.uni_margin - 50; // + 90 ;

  } else {

    // column dendrogram
    ///////////////////////
    tmp_left = 2 * viz.uni_margin;
    // tmp_top =  viz.svg_dim.height - 2.5 * viz.uni_margin;
    tmp_top =  viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col - 2*viz.uni_margin;

  }

  // reposition tree icon
  d3.select(cgm.params.root + ' .' + inst_rc + '_tree_group')
    .attr('transform', function() {
      var inst_translation;
      tmp_top = tmp_top - 75;
      inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')';

      return inst_translation;
    })
    .style('opacity', 1);

  // reposiiton slider
  d3.select(cgm.params.root + ' .' + inst_rc + '_slider_group')
    .attr('transform', function() {
      var inst_translation;
      if (inst_rc === 'row'){
        tmp_left = tmp_left + 0.8 * viz.dendro_room.row;
        tmp_top = tmp_top + 65;
        inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')';
      } else {
        inst_translation = 'translate(' + tmp_left + ',' + tmp_top +
                           '), rotate(-90)';
      }
      return inst_translation;
    })
    .style('opacity', 1);


};