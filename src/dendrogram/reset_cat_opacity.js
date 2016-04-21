module.exports = function reset_cat_opacity(params){

  console.log('reset_cat_opacity')
  _.each(['row','col'], function(inst_rc){
    d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
      .selectAll('rect')
      .style('opacity', params.viz.cat_colors.opacity);
    
  });

};
