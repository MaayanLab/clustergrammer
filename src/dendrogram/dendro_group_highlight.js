var dendro_shade_bars = require('./dendro_shade_bars');
module.exports = function dendro_group_highlight(params, inst_selection, inst_data, inst_rc){

  var wait_before_make_shade = 200;

  setTimeout(still_hovering, wait_before_make_shade);

  function still_hovering(){
    if (d3.select(inst_selection).classed('hovering')){
      make_shade_bars();
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

  }
};