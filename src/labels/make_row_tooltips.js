var d3_tip_custom = require('../tooltip/d3_tip_custom');

module.exports = function make_tooltips(params){

  if (params.labels.show_label_tooltips){

    // d3-tooltip
    var row_tip = d3_tip_custom()
      .attr('class', 'd3-tip')
      .direction('e')
      .offset([0, 10])
      .html(function(d) {
        var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
        return "<span>" + inst_name + "</span>";
      });

    d3.select(params.viz.viz_wrapper)
      .select(params.root+' .row_container')
      .call(row_tip);

    d3.select(params.root+' .row_label_zoom_container')
      .selectAll('g')
      .on('mouseover', function(d) {

        d3.selectAll('.d3-tip')
          .style('opacity',0);

        d3.select(this)
          .select('text')
          .classed('active',true);

        row_tip.show(d);
        
      })
      .on('mouseout', function mouseout(d) {
        d3.select(this)
          .select('text')
          .classed('active',false);
        row_tip.hide(d);
      });


  } else{
    
    d3.select(params.root+' .row_label_zoom_container')
      .selectAll('g')
      .on('mouseover', function() {
        d3.select(this)
          .select('text')
          .classed('active',true);
      })
      .on('mouseout', function mouseout() {
        d3.select(this)
          .select('text')
          .classed('active',false);
      });
  }

};