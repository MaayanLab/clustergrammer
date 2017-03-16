var dendro_shade_bars = require('./dendro_shade_bars');

module.exports = function dendro_group_highlight(params, inst_selection, inst_data, inst_rc){

  // only make shadows if there is more than one crop button
  if (d3.selectAll(params.root+' .'+ inst_rc +'_dendro_crop_buttons')[0].length > 1){
    setTimeout(still_hovering, 500);
  } else {
    d3.selectAll(params.root+' .dendro_shadow')
      .remove();
  }

  function still_hovering(){

    // check that user is still hovering over dendrogram group
    if (d3.select(inst_selection).classed('hovering')){

      // check that user is not using dendrogram slider
      if (params.is_slider_drag === false){

        d3.select(inst_selection)
          .style('opacity', 0.7);

        if (d3.select(params.viz.viz_svg).classed('running_update') === false){
          make_shadow_bars();
        }

      }

    }
  }

  function make_shadow_bars(){

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



  }
};