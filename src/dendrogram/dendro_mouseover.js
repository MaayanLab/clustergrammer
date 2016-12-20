module.exports = function dendro_mouseover(cgm, inst_selection){
  d3.select(inst_selection)
    .classed('hovering',true);

  if (cgm.params.dendro_callback != null){
    cgm.params.dendro_callback(inst_selection);
  }

};