module.exports = function reset_cat_opacity(params){

  _.each(['row','col'], function(inst_rc){

    d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
      .selectAll('rect')
      .style('opacity', function(d){

        var inst_opacity = d3.select(this).style('opacity');

        if (d3.select(this).classed('cat_strings')){
          inst_opacity = params.viz.cat_colors.opacity;
        }

        return inst_opacity
      });

  });

};
