var underscore = require('underscore');

module.exports = function get_current_orders(params){

  // get current orders
  var other_rc;
  underscore.each(['row','col'], function(inst_rc){

    if (inst_rc === 'row'){
      other_rc = 'col';
    } else {
      other_rc = 'row';
    }

    if (d3.select(params.root+' .toggle_'+other_rc+'_order .active').empty() === false){

      params.viz.inst_order[inst_rc] = d3.select(params.root+' .toggle_'+other_rc+'_order')
        .select('.active').attr('name');

    } else {

      // default to cluster ordering
      params.viz.inst_order[inst_rc] = 'clust';

    }

  });

  return params;
};