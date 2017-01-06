module.exports = function dendro_mouseover(cgm, inst_selection, inst_data){

  console.log(inst_data.all_names)

  // find cats: cat-strings
  //////////////////////////

  // run instantly on mouseover
  d3.select(inst_selection)
    .classed('hovering', true);

  if (cgm.params.dendro_callback != null){
    cgm.params.dendro_callback(inst_selection);
  }

};