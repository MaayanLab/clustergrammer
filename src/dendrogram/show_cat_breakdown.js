var calc_cat_cluster_breakdown = require('./calc_cat_cluster_breakdown');
var make_cat_breakdown_graph = require('./make_cat_breakdown_graph');

module.exports = function show_cat_breakdown(params, inst_data, inst_rc, dendro_info){

  var cat_breakdown = calc_cat_cluster_breakdown(params, inst_data, inst_rc);

  var selector_dendro_tip = params.viz.root_tips + '_' + inst_rc + '_dendro_tip';

  if (d3.select(selector_dendro_tip + ' .cat_graph').empty()){

    make_cat_breakdown_graph(params, inst_rc, dendro_info, cat_breakdown, selector_dendro_tip);

  }

};