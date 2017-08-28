var utils = require('./Utils_clust');
var transpose_network = require('./network/transpose_network');
var get_available_filters = require('./params/get_available_filters');
var get_filter_default_state = require('./filters/get_filter_default_state');
var set_defaults = require('./config/set_defaults');
var check_sim_mat = require('./config/check_sim_mat');
var check_nodes_for_categories = require('./config/check_nodes_for_categories');
var underscore = require('underscore');

module.exports = function make_config(args) {

  var defaults = set_defaults();

  // Mixin defaults with user-defined arguments.
  var config = utils.extend(defaults, args);

  config.network_data = args.network_data;

  var super_string = ': ';

  // replace undersores with space in row/col names
  underscore.each(['row', 'col'], function(inst_rc){

    var inst_nodes = config.network_data[inst_rc+'_nodes'];

    var has_cats = check_nodes_for_categories(inst_nodes);

    inst_nodes.forEach(function(d, i){

      // add index to row_nodes and col_nodes
      d[inst_rc+'_index'] = i;

      if (has_cats){
        config.super_labels = true;
        config.super[inst_rc] = d.name.split(super_string)[0];
        d.name = d.name.split(super_string)[1];
      }

      d.name = String(d.name);

      d.name = d.name.replace(/_/g, ' ');

    });

  });

  config.network_data.row_nodes_names = utils.pluck(config.network_data.row_nodes, 'name');
  config.network_data.col_nodes_names = utils.pluck(config.network_data.col_nodes, 'name');

  config.sim_mat = check_sim_mat(config);

  var filters = get_available_filters(config.network_data.views);

  var default_states = {};
  underscore.each( underscore.keys(filters.possible_filters), function(inst_filter){
    var tmp_state = get_filter_default_state(filters.filter_data, inst_filter);

    default_states[inst_filter] = tmp_state;
  });

  // process view
  if (_.has(config.network_data, 'views')){
    config.network_data.views.forEach(function(inst_view){

      underscore.each( underscore.keys(filters.possible_filters), function(inst_filter){
        if ( !_.has(inst_view, inst_filter) ){
          inst_view[inst_filter] = default_states[inst_filter];
        }
      });

      var inst_nodes = inst_view.nodes;

      // proc row/col nodes names in views
      underscore.each(['row','col'], function(inst_rc){

        var has_cats = check_nodes_for_categories(inst_nodes[inst_rc+'_nodes']);

        inst_nodes[inst_rc+'_nodes'].forEach(function(d, i){

          // add index to row_nodes and col_nodes
          d[inst_rc+'_index'] = i;

          if (has_cats){
            d.name = d.name.split(super_string)[1];
          }

          d.name = String(d.name);
          d.name = d.name.replace(/_/g, ' ');

        });

      });

    });
  }

  var col_nodes = config.network_data.col_nodes;
  var row_nodes = config.network_data.row_nodes;

  // console.log( config.network_data.links[0] )
  // console.log( config.network_data.links[1] )
  // console.log( config.network_data.links[2] )

  // console.log(_.has(config.network_data,'mat'));

  ///////////////////////////
  // convert 'mat' to links
  ///////////////////////////

  if (_.has(config.network_data, 'mat')){

    var links = [];
    var mat = config.network_data.mat;
    var inst_link = {};

    // console.log('found mat')
    for (var i=0; i < mat.length; i++){
      for (var j=0; j < mat[0].length; j++){
        // console.log(mat[i][j])

        inst_link = {};
        inst_link.source = i;
        inst_link.target = j;
        inst_link.value = mat[i][j];
        links.push(inst_link);
      }
    }

    // save to network_data
    config.network_data.links = links;

  }

  // add names and instantaneous positions to links
  config.network_data.links.forEach(function(d){
    d.name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
    d.row_name = row_nodes[d.source].name;
    d.col_name = col_nodes[d.target].name;
  });


  // transpose network if necessary
  if (config.transpose) {
    config.network_data = transpose_network(config.network_data);
    var tmp_col_label = args.col_label;
    var tmp_row_label = args.row_label;
    args.row_label = tmp_col_label;
    args.col_label = tmp_row_label;
  }

  // super-row/col labels
  if (!utils.is_undefined(args.row_label) && !utils.is_undefined(args.col_label)) {
    config.super_labels = true;
    config.super = {};
    config.super.row = args.row_label;
    config.super.col = args.col_label;
  }

  // initialize cluster ordering - both rows and columns
  config.inst_order = {};
  if (!utils.is_undefined(args.order) && utils.is_supported_order(args.order)) {
    config.inst_order.row = args.order;
    config.inst_order.col = args.order;
  } else {
    config.inst_order.row = 'clust';
    config.inst_order.col = 'clust';
  }

  // set row or column order directly -- note that row/col are swapped
  // !! need to swap row/col orderings
  if (!utils.is_undefined(args.row_order) && utils.is_supported_order(args.row_order)) {
    // !! row and col orderings are swapped, need to fix
    config.inst_order.col = args.row_order;
  }

  if (!utils.is_undefined(args.col_order) && utils.is_supported_order(args.col_order)) {
    // !! row and col orderings are swapped, need to fix
    config.inst_order.row = args.col_order;
  }

  var row_has_group = utils.has(config.network_data.row_nodes[0], 'group');
  var col_has_group = utils.has(config.network_data.col_nodes[0], 'group');

  config.show_dendrogram = row_has_group || col_has_group;


  if (utils.has(config.network_data.links[0], 'value_orig')){
    config.keep_orig = true;
  } else {
    config.keep_orig = false;
  }

  return config;
};
