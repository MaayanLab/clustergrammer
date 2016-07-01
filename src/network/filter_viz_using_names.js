var filter_network_using_new_nodes = require('./filter_network_using_new_nodes');
var update_viz_with_network = require('../update/update_viz_with_network');

module.exports = function filter_viz_using_names(names){

  // names is an object with row and column names that will be used to filter
  // the matrix

  var params = this.params;
  var new_nodes = {};
  var found_nodes;

  _.each(['row', 'col'], function(inst_rc){

    var orig_nodes = params.network_data[inst_rc+'_nodes'];

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

  var new_network_data = filter_network_using_new_nodes(this.config, new_nodes);

  // takes entire cgm object
  update_viz_with_network(this, new_network_data);

};