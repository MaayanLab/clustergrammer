module.exports = function dendro_group_highlight(params, inst_selection, d, inst_rc){

  var inst_opacity = 0.10;

  if (inst_rc === 'row'){

    // row and col labling are reversed
    if (params.viz.inst_order.col === 'clust'){

      d3.select(inst_selection)
        .style('opacity',1);

      // top opacity bar 
      d3.select(params.root+' .clust_group')
        .append('rect')
        .style('width', params.viz.clust.dim.width+'px')
        .style('height',d.pos_top+'px')
        .style('fill','black')
        .style('opacity', inst_opacity)
        .classed('dendro_shadow',true);

      var bot_height = params.viz.clust.dim.height - d.pos_bot;
      // bottom opacity bar 
      d3.select(params.root+' .clust_group')
        .append('rect')
        .style('width', params.viz.clust.dim.width+'px')
        .style('height', bot_height+'px')
        .attr('transform','translate(0,'+d.pos_bot+')')
        .style('fill','black')
        .style('opacity', inst_opacity)
        .classed('dendro_shadow',true);
    }

  } 
  // else {
  //   console.log('col dendro')
  // }

};