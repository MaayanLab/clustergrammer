module.exports = function dendro_shade_bars(params, inst_selection, inst_rc, inst_data){

  var inst_opacity = 0.2;
  var select_opacity = 0.7;
  var bot_height;

  if (inst_rc == 'row'){

    d3.select(inst_selection)
      .style('opacity',select_opacity);

    // top shade 
    d3.select(params.root+' .clust_group')
      .append('rect')
      .style('width', params.viz.clust.dim.width+'px')
      .style('height', inst_data.pos_top+'px')
      .style('fill','black')
      .style('opacity', inst_opacity)
      .classed('dendro_shadow',true);

    bot_height = params.viz.clust.dim.height - inst_data.pos_bot;
    // bottom shade 
    d3.select(params.root+' .clust_group')
      .append('rect')
      .style('width', params.viz.clust.dim.width+'px')
      .style('height', bot_height+'px')
      .attr('transform','translate(0,'+inst_data.pos_bot+')')
      .style('fill','black')
      .style('opacity', inst_opacity)
      .classed('dendro_shadow',true);

  } else if (inst_rc === 'col'){

    d3.select(inst_selection)
      .style('opacity', select_opacity);

    // top shade 
    d3.select(params.root+' .clust_group')
      .append('rect')
      .style('width', inst_data.pos_top+'px')
      .style('height', params.viz.clust.dim.height+'px')
      .style('fill','black')
      .style('opacity', inst_opacity)
      .classed('dendro_shadow',true);

    // bottom shade 
    bot_height = params.viz.clust.dim.width - inst_data.pos_bot;
    d3.select(params.root+' .clust_group')
      .append('rect')
      .style('width', bot_height+'px')
      .style('height', params.viz.clust.dim.height+'px')
      .attr('transform','translate('+inst_data.pos_bot+',0)')
      .style('fill','black')
      .style('opacity',inst_opacity)
      .classed('dendro_shadow',true);

  }

};