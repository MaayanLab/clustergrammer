module.exports = function mouseout_tile(params, inst_selection, tip){
  d3.select(inst_selection)
    .classed('hovering',false);
  d3.selectAll(params.root+' text').classed('active', false);
  tip.hide();
};