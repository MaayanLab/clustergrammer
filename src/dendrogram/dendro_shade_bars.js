module.exports = function dendro_shade_bars(params, inst_selection, inst_rc, inst_data){

  var inst_opacity = 0.2;
  var bot_height;

  d3.selectAll(params.root+' .dendro_shadow')
    .remove();

  if (inst_rc == 'row'){

    // top shade
    d3.select(params.root+' .clust_group')
      .append('rect')
      .attr('width', params.viz.clust.dim.width+'px')
      .attr('height', inst_data.pos_top+'px')
      .attr('fill','black')
      .classed('dendro_shadow',true)
      .attr('opacity', inst_opacity);

    bot_height = params.viz.clust.dim.height - inst_data.pos_bot;
    // bottom shade
    d3.select(params.root+' .clust_group')
      .append('rect')
      .attr('width', params.viz.clust.dim.width+'px')
      .attr('height', bot_height+'px')
      .attr('transform','translate(0,'+inst_data.pos_bot+')')
      .attr('fill','black')
      .classed('dendro_shadow',true)
      .attr('opacity', inst_opacity);

  } else if (inst_rc === 'col'){

    // top shade
    d3.select(params.root+' .clust_group')
      .append('rect')
      .attr('width', inst_data.pos_top+'px')
      .attr('height', params.viz.clust.dim.height+'px')
      .attr('fill','black')
      .classed('dendro_shadow',true)
      .attr('opacity', inst_opacity);

    // bottom shade
    bot_height = params.viz.clust.dim.width - inst_data.pos_bot;
    d3.select(params.root+' .clust_group')
      .append('rect')
      .attr('width', bot_height+'px')
      .attr('height', params.viz.clust.dim.height+'px')
      .attr('transform','translate('+inst_data.pos_bot+',0)')
      .attr('fill','black')
      .classed('dendro_shadow',true)
      .attr('opacity',inst_opacity);

  }

};