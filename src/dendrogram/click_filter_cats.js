var get_cat_title = require('../categories/get_cat_title');
var utils = require('../Utils_clust');

module.exports = function click_filter_cats(cgm, inst_data, inst_selection, inst_rc){

  var params = cgm.params;

  // category index
  var inst_cat = d3.select(inst_selection).attr('cat');
  var cat_title = get_cat_title(params.viz, inst_cat, inst_rc);
  var cat_name = inst_data[inst_cat];
  var tmp_nodes = params.network_data[inst_rc+'_nodes'];

  var found_nodes = _.filter(tmp_nodes, function(d){

    return d[inst_cat] == cat_name;
  });

  console.log('found_nodes')

  var found_names = utils.pluck(found_nodes, 'name');
  console.log(found_names);

  var filter_names = {};
  filter_names[inst_rc] = found_names;

  cgm.filter_viz_using_names(filter_names)

};