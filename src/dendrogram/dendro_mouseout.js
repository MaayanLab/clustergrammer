module.exports = function dendro_mouseout(inst_selection){
  d3.select(inst_selection)
    .classed('hovering',false);
};