var get_cat_title = require('../categories/get_cat_title');

module.exports = function click_filter_cats(params, inst_data, inst_selection, inst_rc){

  // category index
  var inst_cat = d3.select(inst_selection).attr('cat');
  var cat_title = get_cat_title(params.viz, inst_cat, inst_rc);
  var cat_name = inst_data[inst_cat];

  var tmp_nodes = params.network_data[inst_rc+'_nodes'];

  var found_nodes = _.filter(tmp_nodes, function(d){

    return d[inst_cat] == cat_name;
  });

  console.log('found_nodes')
  console.log(found_nodes)

};