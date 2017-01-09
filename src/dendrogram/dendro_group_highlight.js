var dendro_shade_bars = require('./dendro_shade_bars');
var calc_cluster_cat_breakdown = require('./calc_cluster_cat_breakdown');

module.exports = function dendro_group_highlight(params, inst_selection, inst_data, inst_rc){

  var wait_before_make_shade = 500;

  setTimeout(still_hovering, wait_before_make_shade);

  function still_hovering(){

    // check that user is still hovering over dendrogram group
    if (d3.select(inst_selection).classed('hovering')){

      // check that user is not using dendrogram slider
      if (params.is_slider_drag === false){

        d3.select(inst_selection)
          .style('opacity', 0.7);

        make_shade_bars();

      }

    }
  }

  function make_shade_bars(){

    if (inst_rc === 'row'){

      // row and col labling are reversed
      if (params.viz.inst_order.col === 'clust'){
        dendro_shade_bars(params, inst_selection, inst_rc, inst_data);
      }

    } else if (inst_rc === 'col') {

      // row and col labeling are reversed
      if (params.viz.inst_order.row === 'clust'){
        dendro_shade_bars(params, inst_selection, inst_rc, inst_data);
      }

    } else if (inst_rc === 'both'){

      if (params.viz.inst_order.col === 'clust'){
        dendro_shade_bars(params, inst_selection, 'row', inst_data);
      }
      if (params.viz.inst_order.row === 'clust'){
        dendro_shade_bars(params, inst_selection, 'col', inst_data);
      }

    }

    var cat_breakdown = calc_cluster_cat_breakdown(cgm.params, inst_data, inst_rc);

    // loop through cat_breakdown data
    var inst_breakdown;
    var bar_data;
    var tmp_fraction;
    var tmp_name;
    var tmp_color;
    for (var i = 0; i < cat_breakdown.length; i++){

      inst_breakdown = cat_breakdown[i];

      bar_data = inst_breakdown.bar_data;

      for (var x=0; x < bar_data.length; x++){

        // data for individual bar
        var tmp_data = bar_data[x]

        tmp_name = bar_data[x][0];
        tmp_fraction = bar_data[x][1];
        tmp_color = bar_data[x][2];

        console.log(tmp_name + ' ' + String(tmp_fraction) + ' ' + String(tmp_color))

      }

      console.log('----------------\n')

    }

  }
};