var filter_network_using_new_nodes = require('./filter_network_using_new_nodes');
var update_viz_with_network = require('../update/update_viz_with_network');

module.exports = function filter_viz_using_names(names, external_cgm = false){

  // names is an object with row and column names that will be used to filter
  // the matrix

  var cgm;
  if (external_cgm === false){
    cgm = this;
  } else {
    cgm = external_cgm;
  }

  var params = cgm.params;
  var new_nodes = {};
  var found_nodes;

  _.each(['row', 'col'], function(inst_rc){

    // I'm requiring view 0
    // var orig_nodes = params.network_data.views[0].nodes[inst_rc+'_nodes'];
    var orig_nodes = params.inst_nodes[inst_rc+'_nodes'];

    if (_.has(names, inst_rc)){

      var inst_names = names[inst_rc];
      found_nodes = $.grep(orig_nodes, function(d){
        return $.inArray(d.name, inst_names) > -1 ;
      });

    } else {
      found_nodes = orig_nodes;
    }

    new_nodes[inst_rc+'_nodes'] = found_nodes;

  });

  // new_nodes.col_nodes = params.network_data.col_nodes;

  var new_network_data = filter_network_using_new_nodes(cgm.config, new_nodes);

  // takes entire cgm object
  // last argument tells it to not preserve categoty colors
  update_viz_with_network(cgm, new_network_data);

};