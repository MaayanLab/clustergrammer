var underscore = require('underscore');

module.exports = function(old_params, params) {

  // exit, update, enter

  // check if exit or enter or both are required
  var old_row_nodes = old_params.network_data.row_nodes;
  var old_col_nodes = old_params.network_data.col_nodes;
  var old_row = underscore.map(old_row_nodes, function(d){return d.name;});
  var old_col = underscore.map(old_col_nodes, function(d){return d.name;});
  var all_old_nodes = old_row.concat(old_col);

  var row_nodes = params.network_data.row_nodes;
  var col_nodes = params.network_data.col_nodes;
  var row = underscore.map(row_nodes, function(d){return d.name;});
  var col = underscore.map(col_nodes, function(d){return d.name;});
  var all_nodes = row.concat(col);

  var exit_nodes  = underscore.difference( all_old_nodes, all_nodes ).length;
  var enter_nodes = underscore.difference( all_nodes, all_old_nodes ).length;

  var delays = {};

  if (exit_nodes > 0){
    delays.update = 1000;
  } else {
    delays.update = 0;
  }

  if (enter_nodes > 0){
    delays.enter = 1000;
  } else {
    delays.enter = 0;
  }

  delays.enter  = delays.enter + delays.update ;

  delays.run_transition = true;

  var old_num_links = old_params.network_data.links.length;
  var new_num_links = params.network_data.links.length;
  var cutoff_num_links = 0.5*params.matrix.def_large_matrix;

  if ( old_num_links > cutoff_num_links || new_num_links > cutoff_num_links ){
    delays.run_transition = false;
    delays.update = 0;
    delays.enter = 0;
  }

  return delays;
};
