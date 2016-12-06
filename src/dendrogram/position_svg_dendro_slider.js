module.exports = function position_svg_dendro_slider(cgm, inst_rc){

  var viz = cgm.params.viz;
  if (inst_rc === 'row'){
    var tmp_left = viz.svg_dim.width - 7 * viz.uni_margin;
    var tmp_top =  viz.clust.margin.top + 3 * viz.uni_margin;
  } else {
    var tmp_left = 2 * viz.uni_margin;
    var tmp_top =  viz.svg_dim.height - 2 * viz.uni_margin;
  }

  d3.select(cgm.params.root + ' .' + inst_rc + '_slider_group')
    .attr('transform', function() {
      var inst_translation;
      if (inst_rc === 'row'){
        inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')'
      } else {
        inst_translation = 'translate(' + tmp_left + ',' + tmp_top +
                           '), rotate(-90)';
      }
      return inst_translation;
    });

}