var utils = require('../Utils_clust');
var underscore = require('underscore');

module.exports = function get_cat_names(params, inst_data, inst_selection, inst_rc){

  // category index
  var inst_cat = d3.select(inst_selection).attr('cat');
  var cat_name = inst_data[inst_cat];
  var tmp_nodes = params.network_data[inst_rc+'_nodes'];

  var found_nodes = underscore.filter(tmp_nodes, function(d){
    return d[inst_cat] == cat_name;
  });

  var found_names = utils.pluck(found_nodes, 'name');

  return found_names;
};