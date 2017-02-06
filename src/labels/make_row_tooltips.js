var d3_tip_custom = require('../tooltip/d3_tip_custom');

module.exports = function make_row_tooltips(params){

  if (params.labels.show_label_tooltips){

    // remove old tooltips
    d3.selectAll(params.viz.root_tips + '_row_tip').remove();

    var root_tip_selector = params.viz.root_tips.replace('.','');

    // d3-tooltip
    var row_tip = d3_tip_custom()
      .attr('class', function(){
        var class_string = root_tip_selector + ' d3-tip '+
                           root_tip_selector + '_row_tip';
        return class_string;
      })
      .direction('e')
      .offset([0, 10])
      .style('display','none')
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

        d3.select(params.viz.root_tips+'_row_tip')
          .classed(d.name, true);

        d3.selectAll(params.viz.root_tips+'_row_tip')
          .style('display', 'block');

        d3.select(this)
          .select('text')
          .classed('active', true);

        row_tip.show(d);

        if (params.row_tip_callback != null){
          params.row_tip_callback(params.viz.root_tips, d);
        }

      })
      .on('mouseout', function mouseout(d) {

        d3.selectAll(params.viz.root_tips+'_row_tip')
          .style('display', 'none')
          .classed(d.name, false);

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