var utils = require('../Utils_clust');
var initialize_matrix = require('../initialize_matrix');
var underscore = require('underscore');

module.exports = function ini_matrix_params(params){

  var matrix = {};

  var network_data = params.network_data;

  matrix.tile_colors = params.tile_colors;
  matrix.bar_colors = params.bar_colors;
  matrix.outline_colors = params.outline_colors;
  matrix.hlight_color = params.highlight_color;
  matrix.tile_title = params.tile_title;
  matrix.show_tile_tooltips = params.show_tile_tooltips;
  matrix.make_tile_tooltip = params.make_tile_tooltip;

  matrix.distance_metric = 'cosine';
  matrix.linkage_type = 'average';
  matrix.filter_state = 'no-filter';
  matrix.normalization_state = 'no-normalization';

  // initialized clicked tile and rows
  matrix.click_hlight_x = -666;
  matrix.click_hlight_y = -666;
  matrix.click_hlight_row = -666;
  matrix.click_hlight_col = -666;

  // definition of a large matrix (num links) determines if transition is run
  matrix.def_large_matrix = 2e4;
  matrix.opacity_function = params.opacity_scale;

  matrix.orders = {};

  underscore.each(['row','col'], function(inst_rc){

    // row ordering is based on col info and vice versa
    var other_rc;
    if (inst_rc==='row'){
      other_rc = 'col';
    } else {
      other_rc = 'row';
    }

    // the nodes are defined using other_rc
    var inst_nodes = network_data[other_rc+'_nodes'];
    var num_nodes = inst_nodes.length;

    var nodes_names = utils.pluck(inst_nodes, 'name');
    var tmp = nodes_names.sort();

    var alpha_index = underscore.map(tmp, function(d){
      return network_data[other_rc+'_nodes_names'].indexOf(d);
    });

    matrix.orders['alpha_'+inst_rc] = alpha_index;

    var possible_orders = ['clust','rank'];

    if (_.has(inst_nodes[0], 'rankvar')){
      possible_orders.push('rankvar');
    }

    if (params.viz.all_cats[other_rc].length > 0){
      underscore.each( params.viz.all_cats[other_rc], function(inst_cat){
        // the index of the category has replaced - with _
        inst_cat = inst_cat.replace('-','_');
        possible_orders.push(inst_cat+'_index');
      });
    }

    underscore.each(possible_orders, function(inst_order){

      var tmp_order_index = d3.range(num_nodes)
        .sort(function(a,b){
          return inst_nodes[b][inst_order] - inst_nodes[a][inst_order];
        });

      matrix.orders[inst_order+'_'+inst_rc] = tmp_order_index;

    });

  });


  if (utils.has(network_data, 'all_links')) {
    matrix.max_link = underscore.max(network_data.all_links, function (d) {
      return Math.abs(d.value);
    }).value;
  } else {
    matrix.max_link = underscore.max(network_data.links, function (d) {
      return Math.abs(d.value);
    }).value;
  }

  matrix.abs_max_val = Math.abs(matrix.max_link) * params.clamp_opacity;

  if (params.input_domain === 0) {
    if (matrix.opacity_function === 'linear') {
      matrix.opacity_scale = d3.scale.linear()
        .domain([0, matrix.abs_max_val]).clamp(true)
        .range([0.0, 1.0]);
    } else if (matrix.opacity_function === 'log') {
      matrix.opacity_scale = d3.scale.log()
        .domain([0.001, matrix.abs_max_val]).clamp(true)
        .range([0.0, 1.0]);
    }
  } else {
    if (matrix.opacity_function === 'linear') {
      matrix.opacity_scale = d3.scale.linear()
        .domain([0, params.input_domain]).clamp(true)
        .range([0.0, 1.0]);
    } else if (matrix.opacity_function === 'log') {
      matrix.opacity_scale = d3.scale.log()
        .domain([0.001, params.input_domain]).clamp(true)
        .range([0.0, 1.0]);
    }
  }

  var has_val_up = utils.has(network_data.links[0], 'value_up');
  var has_val_dn = utils.has(network_data.links[0], 'value_dn');

  if (has_val_up || has_val_dn) {
    matrix.tile_type = 'updn';
  } else {
    matrix.tile_type = 'simple';
  }

  if (utils.has(network_data.links[0], 'highlight')) {
    matrix.highlight = 1;
  } else {
    matrix.highlight = 0;
  }

  matrix.matrix = initialize_matrix(network_data);

  matrix.wait_tooltip = 0;

  return matrix;
};
