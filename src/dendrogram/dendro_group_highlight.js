module.exports = function dendro_group_highlight(params, inst_selection, d, inst_rc){

  var inst_opacity = 0.2;
  var select_opacity = 0.7;
  var bot_height;

  if (inst_rc === 'row'){

    // row and col labling are reversed
    if (params.viz.inst_order.col === 'clust'){

      d3.select(inst_selection)
        .style('opacity',select_opacity);

      // top opacity bar 
      d3.select(params.root+' .clust_group')
        .append('rect')
        .style('width', params.viz.clust.dim.width+'px')
        .style('height',d.pos_top+'px')
        .style('fill','black')
        .style('opacity', inst_opacity)
        .classed('dendro_shadow',true);

      bot_height = params.viz.clust.dim.height - d.pos_bot;
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

  } else {
    
    // row and col labeling are reversed
    if (params.viz.inst_order.row === 'clust'){

      d3.select(inst_selection)
        .style('opacity', select_opacity);

      // top opacity bar 
      d3.select(params.root+' .clust_group')
        .append('rect')
        .style('width', d.pos_top+'px')
        .style('height', params.viz.clust.dim.height+'px')
        .style('fill','black')
        .style('opacity', inst_opacity)
        .classed('dendro_shadow',true);

      // bottom opacity bar 
      bot_height = params.viz.clust.dim.width - d.pos_bot;
      d3.select(params.root+' .clust_group')
        .append('rect')
        .style('width', bot_height+'px')
        .style('height', params.viz.clust.dim.height+'px')
        .attr('transform','translate('+d.pos_bot+',0)')
        .style('fill','black')
        .style('opacity',inst_opacity)
        .classed('dendro_shadow',true);

    }

  }

};