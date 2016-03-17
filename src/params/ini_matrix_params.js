var utils = require('../utils');
var initialize_matrix = require('../initialize_matrix');

module.exports = function ini_matrix_params(config, viz, network_data){

  var matrix = {};
  matrix.tile_colors = config.tile_colors;
  matrix.bar_colors = config.bar_colors;
  matrix.outline_colors = config.outline_colors;
  matrix.hlight_color = config.highlight_color;
  matrix.tile_title = config.tile_title;
  matrix.show_tile_tooltips = config.show_tile_tooltips;
  matrix.make_tile_tooltip = config.make_tile_tooltip;

  // initialized clicked tile and rows
  matrix.click_hlight_x = -666;
  matrix.click_hlight_y = -666;
  matrix.click_hlight_row = -666;
  matrix.click_hlight_col = -666;

  // definition of a large matrix - based on number of links
  // below this cutoff reordering is done with transitions
  matrix.def_large_matrix = 10000;

  matrix.opacity_function = config.opacity_scale;

  matrix.orders = {};

  _.each(['row','col'], function(inst_rc){

    // row ordering is based on col info and vice versa 
    var swap_rc;
    if (inst_rc==='row'){
      swap_rc = 'col';
    } else {
      swap_rc = 'row';
    }

    // the nodes are defined using swap_rc 
    var inst_nodes = network_data[swap_rc+'_nodes'];
    var num_nodes = inst_nodes.length;

    var nodes_names = _.pluck(inst_nodes, 'name');
    var tmp = nodes_names.sort();

    var alpha_index = _.map(tmp, function(d){
      return network_data[swap_rc+'_nodes_names'].indexOf(d);
    });

    matrix.orders['alpha_'+inst_rc] = alpha_index;

    var possible_orders = ['clust','rank'];

    if (_.has(inst_nodes[0], 'rankvar')){
      possible_orders.push('rankvar');
    }; 

    _.each(possible_orders, function(inst_order){

      matrix.orders[inst_order+'_'+inst_rc] = d3.range(num_nodes)
        .sort(function(a,b){
          return inst_nodes[b][inst_order] - inst_nodes[a][inst_order];
        })

    });

    // matrix.orders['rank_'+inst_rc] = d3.range(num_nodes).sort(function (a, b) {
    //   return inst_nodes[b].rank - inst_nodes[a].rank;
    // });

  });

  var col_nodes = network_data.col_nodes;
  var row_nodes = network_data.row_nodes;

  //-------------------------------------------//



  // matrix.orders['rank_row'] = d3.range(viz.num_col_nodes).sort(function (a, b) {
  //     return col_nodes[b].rank - col_nodes[a].rank;
  //   });
  // matrix.orders['rank_col'] = d3.range(viz.num_row_nodes).sort(function (a, b) {
  //     return row_nodes[b].rank - row_nodes[a].rank;
  //   });

  // matrix.orders['clust_row'] = d3.range(viz.num_col_nodes).sort(function (a, b) {
  //     return col_nodes[b].clust - col_nodes[a].clust;
  //   });

  // matrix.orders['clust_col'] = d3.range(viz.num_row_nodes).sort(function (a, b) {
  //     return row_nodes[b].clust - row_nodes[a].clust;
  //   });

  // // check if rankvar order is available 
  // if (_.has(network_data.row_nodes[0],'rankvar') ){
  //   matrix.orders.rankvar_row = d3.range(viz.num_col_nodes).sort(function (a, b) {
  //     return col_nodes[b].rankvar - col_nodes[a].rankvar;
  //   });

  //   matrix.orders.rankvar_col = d3.range(viz.num_row_nodes).sort(function (a, b) {
  //     return row_nodes[b].rankvar - row_nodes[a].rankvar;
  //   });
  // }

  // define class ordering - define on front-end
  if (utils.has(col_nodes[0],'cat-0')){

    // the nth node should be positioned at this place in the array 
    var tmp_col_nodes = _.sortBy(col_nodes,'cat-0');

    var ordered_col_names = [];
    for (var i=0; i< tmp_col_nodes.length; i++){
      ordered_col_names.push( tmp_col_nodes[i].name );
    }

    var order_col_class = [];
    for (i=0; i< col_nodes.length; i++){
      var inst_col_name = ordered_col_names[i];
      order_col_class.push( _.indexOf( network_data.col_nodes_names, inst_col_name) );
    }

    matrix.orders['cat-0_row'] = order_col_class;
  }

  if (utils.has(col_nodes[0], 'cl_index')) {
    matrix.orders['cat-0_row'] = d3.range(viz.num_col_nodes).sort(function (a, b) {
      return col_nodes[b].cl_index - col_nodes[a].cl_index;
    });
  }


  if (utils.has(network_data, 'all_links')) {
    matrix.max_link = _.max(network_data.all_links, function (d) {
      return Math.abs(d.value);
    }).value;
  } else {
    matrix.max_link = _.max(network_data.links, function (d) {
      return Math.abs(d.value);
    }).value;
  }

  if (config.input_domain === 0) {
    if (matrix.opacity_function === 'linear') {
      matrix.opacity_scale = d3.scale.linear()
        .domain([0, Math.abs(matrix.max_link)]).clamp(true)
        .range([0.0, 1.0]);
    } else if (matrix.opacity_function === 'log') {
      matrix.opacity_scale = d3.scale.log()
        .domain([0.001, Math.abs(matrix.max_link)]).clamp(true)
        .range([0.0, 1.0]);
    }
  } else {
    if (matrix.opacity_function === 'linear') {
      matrix.opacity_scale = d3.scale.linear()
        .domain([0, config.input_domain]).clamp(true)
        .range([0.0, 1.0]);
    } else if (matrix.opacity_function === 'log') {
      matrix.opacity_scale = d3.scale.log()
        .domain([0.001, config.input_domain]).clamp(true)
        .range([0.0, 1.0]);
    }
  }


  if (utils.has(network_data.links[0], 'value_up') || utils.has(network_data.links[0], 'value_dn')) {
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

  return matrix;
};