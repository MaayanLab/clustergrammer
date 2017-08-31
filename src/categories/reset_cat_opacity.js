var underscore = require('underscore');

module.exports = function reset_cat_opacity(params){

  underscore.each(['row','col'], function(inst_rc){

    d3.selectAll(params.root+' .'+inst_rc+'_cat_group')
      .selectAll('rect')
      .style('opacity', function(){

        var inst_opacity = d3.select(this).style('opacity');

        if (d3.select(this).classed('cat_strings') && d3.select(this).classed('filtered_cat') === false){
          inst_opacity = params.viz.cat_colors.opacity;
        }

        return inst_opacity;
      });

  });

};
