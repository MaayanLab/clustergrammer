module.exports = function make_col_tooltips(params){

  if (params.labels.show_label_tooltips){

    // d3-tooltip
    var col_tip = d3.tip()
      .attr('class', 'd3-tip')
      .direction('w')
      .offset([20, 0])
      .style('display','block')
      .html(function(d) { 
        var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
        return "<span>" + inst_name + "</span>";
      });

    d3.select(params.viz.viz_wrapper)
      .select('svg')
      .select(params.root+' .col_zoom_container')
      .selectAll('.col_label_group')
      .select('text')
      .call(col_tip);

    d3.select(params.root+' .col_zoom_container')
      // .selectAll('.col_label_text')
      .selectAll('.col_label_group')
      // .selectAll('text')
      .on('mouseover', col_tip.show)
      .on('mouseout',  col_tip.hide);

  }

};