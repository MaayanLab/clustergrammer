// var crossfilter = require('crossfilter');
var utils = require('../utils');
var change_network_view = require('../network/change_network_view');
var parent_div_size = require('../parent_div_size');
var initialize_matrix = require('../initialize_matrix');
var zoomed = require('../zoomed');
var is_force_square = require('./is_force_square');
var get_svg_dim = require('./get_svg_dim');
var set_label_params = require('./set_label_params');
var set_viz_params = require('./set_viz_params');
var set_matrix_params = require('./set_matrix_params');

/* Params: calculates the size of all the visualization elements in the
clustergram.
 */

module.exports = function params(input_config) {

  var config = $.extend(true, {}, input_config);
  var params = config;

  if (params.ini_view !== null) {
    params.network_data = change_network_view(params, params.network_data, params.ini_view);
    params.ini_view = null;
  }

  params = set_label_params(config, params);

  params = set_viz_params(config, params);

  params = set_matrix_params(config, params);

  var col_nodes = params.network_data.col_nodes;
  var row_nodes = params.network_data.row_nodes;

  // Create wrapper around SVG visualization
  d3.select(config.root).append('div').attr('class', 'viz_wrapper');

  // resize parent div - needs to be run here
  parent_div_size(params);

  params = get_svg_dim(params);

  params.network_data.row_nodes_names = _.pluck(row_nodes, 'name');
  params.network_data.col_nodes_names = _.pluck(col_nodes, 'name');

  params.norm_label.margin = {};
  params.norm_label.margin.left = params.viz.grey_border_width + params.labels.super_label_width;
  params.norm_label.margin.top = params.viz.grey_border_width + params.labels.super_label_width;

  if (params.viz.show_dendrogram){
    // setting config globally 
    config.group_level = {row: 5, col: 5};
  }

  params.norm_label.background = {};

  params.norm_label.background.row = params.norm_label.width.row + 
    params.class_room.row + params.viz.uni_margin;

  params.norm_label.background.col = params.norm_label.width.col + 
    params.class_room.col + params.viz.uni_margin;

  params.viz.clust = {};
  params.viz.clust.margin = {};
  params.viz.clust.margin.left = params.norm_label.margin.left + 
    params.norm_label.background.row;

  params.viz.clust.margin.top = params.norm_label.margin.top + 
    params.norm_label.background.col;



  params.colorbar_room = {};
  var tmp_colorbar_room = 0;
  params.colorbar_room.row = tmp_colorbar_room;
  params.colorbar_room.col = tmp_colorbar_room;

  var row_info_space = params.labels.super_label_width + 
    params.norm_label.width.row + params.class_room.row + params.colorbar_room.row;

  // reduce width by row/col labels and by grey_border width
  //(reduce width by less since this is less aparent with slanted col labels)
  var ini_clust_width = params.viz.svg_dim.width - row_info_space 
    - params.viz.grey_border_width - params.viz.spillover_x_offset;

  params.viz.num_col_nodes = col_nodes.length;
  params.viz.num_row_nodes = row_nodes.length;

  params.viz.clust.dim = {};

  var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]);
  tmp_x_scale.domain(_.range(col_nodes.length));
  var triangle_height = tmp_x_scale.rangeBand() / 2;

  if (triangle_height > params.norm_label.width.col) {
    ini_clust_width = ini_clust_width * ( params.norm_label.width.col / triangle_height );
  }
  params.viz.clust.dim.width = ini_clust_width;

  params = is_force_square(params);

  if (config.force_square === 1) {
    params.viz.force_square = 1;
  }

  var enr_max = Math.abs(_.max(col_nodes, function (d) {
    return Math.abs(d.value);
  }).value);

  params.labels.bar_scale_col = d3.scale
    .linear()
    .domain([0, enr_max])
    .range([0, 0.75 * params.norm_label.width.col]);

  enr_max = Math.abs(_.max(row_nodes, function (d) {
    return Math.abs(d.value);
  }).value);
  params.labels.bar_scale_row = d3.scale
    .linear()
    .domain([0, enr_max])
    .range([0, params.norm_label.width.row]);

  var tmp;
  var row_nodes_names = _.pluck(row_nodes, 'name');
  tmp = row_nodes_names.sort();
  var row_alpha_index = _.map(tmp, function(d){
    return params.network_data.row_nodes_names.indexOf(d);
  });

  var col_nodes_names = _.pluck(col_nodes, 'name');
  tmp = col_nodes_names.sort();
  var col_alpha_index = _.map(tmp, function(d){
    return params.network_data.col_nodes_names.indexOf(d);
  });  

  // Define Orderings
  params.matrix.orders = {
    // ini
    alpha_row: col_alpha_index,
    alpha_col: row_alpha_index,
    // rank
    rank_row: d3.range(params.viz.num_col_nodes).sort(function (a, b) {
      return col_nodes[b].rank - col_nodes[a].rank;
    }),
    rank_col: d3.range(params.viz.num_row_nodes).sort(function (a, b) {
      return row_nodes[b].rank - row_nodes[a].rank;
    }),
    // clustered
    clust_row: d3.range(params.viz.num_col_nodes).sort(function (a, b) {
      return col_nodes[b].clust - col_nodes[a].clust;
    }),
    clust_col: d3.range(params.viz.num_row_nodes).sort(function (a, b) {
      return row_nodes[b].clust - row_nodes[a].clust;
    })
  };

  // check if rankvar order is available 
  if (_.has(params.network_data.row_nodes[0],'rankvar') ){
    params.matrix.orders.rankvar_row = d3.range(params.viz.num_col_nodes).sort(function (a, b) {
      return col_nodes[b].rankvar - col_nodes[a].rankvar;
    });

    params.matrix.orders.rankvar_col = d3.range(params.viz.num_row_nodes).sort(function (a, b) {
      return row_nodes[b].rankvar - row_nodes[a].rankvar;
    });
  }

  // // define class ordering - define on front-end
  // if (utils.has(col_nodes[0],'cl')){

  //   // the order should be interpreted as the nth node should be positioned here
  //   // in the order

  //   var tmp_col_nodes = _.sortBy(col_nodes,'cl')

  //   var ordered_col_names = []
  //   for (var i=0; i< tmp_col_nodes.length; i++){
  //     ordered_col_names.push( tmp_col_nodes[i].name );
  //   }

  //   var order_col_class = []
  //   for (var i=0; i< col_nodes.length; i++){
  //     var inst_col_name = ordered_col_names[i];
  //     order_col_class.push( _.indexOf( params.network_data.col_nodes_names, inst_col_name) );
  //   }

  //   params.matrix.orders.class_row = order_col_class;
  // }

  if (utils.has(col_nodes[0], 'cl_index')) {
    params.matrix.orders.class_row = d3.range(params.viz.num_col_nodes).sort(function (a, b) {
      return col_nodes[b].cl_index - col_nodes[a].cl_index;
    });
  }

  params.matrix.x_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.width]);

  params.matrix.y_scale = d3.scale.ordinal()
    .rangeBands([0, params.viz.clust.dim.height]);

  params.matrix.x_scale
    .domain( params.matrix.orders[ params.viz.inst_order.row + '_row' ] );

  params.matrix.y_scale
    .domain( params.matrix.orders[ params.viz.inst_order.col + '_col' ] );

  params.network_data.links.forEach(function (d) {
    d.x = params.matrix.x_scale(d.target);
    d.y = params.matrix.y_scale(d.source);
  });

  params.matrix.matrix = initialize_matrix(params.network_data);

  params.viz.border_fraction = 55;
  params.viz.border_width = params.matrix.x_scale.rangeBand() /
    params.viz.border_fraction;

  params.viz.zoom_switch = (params.viz.clust.dim.width / params.viz.num_col_nodes) / (params.viz.clust.dim.height / params.viz.num_row_nodes);

  if (params.viz.zoom_switch < 1) {
    params.viz.zoom_switch = 1;
  }

  params.matrix.rect_width = params.matrix.x_scale.rangeBand() - 1 * params.viz.border_width;
  params.matrix.rect_height = params.matrix.y_scale.rangeBand() - 1 * params.viz.border_width / params.viz.zoom_switch;

  params.scale_font_offset = d3.scale
    .linear().domain([1, 0])
    .range([0.8, 0.5]);

  params.labels.default_fs_row = params.matrix.y_scale.rangeBand() * 1.01;
  params.labels.default_fs_col = params.matrix.x_scale.rangeBand() * 0.87;

  params.viz.zoom_scale_font = {};
  params.viz.zoom_scale_font.row = 1;
  params.viz.zoom_scale_font.col = 1;

  params.viz.real_zoom = params.norm_label.width.col / (params.matrix.x_scale.rangeBand() / 2);

  if (utils.has(params.network_data, 'all_links')) {
    params.matrix.max_link = _.max(params.network_data.all_links, function (d) {
      return Math.abs(d.value);
    }).value;
  } else {
    params.matrix.max_link = _.max(params.network_data.links, function (d) {
      return Math.abs(d.value);
    }).value;
  }

  if (config.input_domain === 0) {
    if (params.matrix.opacity_function === 'linear') {
      params.matrix.opacity_scale = d3.scale.linear()
        .domain([0, Math.abs(params.matrix.max_link)]).clamp(true)
        .range([0.0, 1.0]);
    } else if (params.matrix.opacity_function === 'log') {
      params.matrix.opacity_scale = d3.scale.log()
        .domain([0.001, Math.abs(params.matrix.max_link)]).clamp(true)
        .range([0.0, 1.0]);
    }
  } else {
    if (params.matrix.opacity_function === 'linear') {
      params.matrix.opacity_scale = d3.scale.linear()
        .domain([0, config.input_domain]).clamp(true)
        .range([0.0, 1.0]);
    } else if (params.matrix.opacity_function === 'log') {
      params.matrix.opacity_scale = d3.scale.log()
        .domain([0.001, config.input_domain]).clamp(true)
        .range([0.0, 1.0]);
    }
  }


  if (utils.has(params.network_data.links[0], 'value_up') || utils.has(params.network_data.links[0], 'value_dn')) {
    params.matrix.tile_type = 'updn';
  } else {
    params.matrix.tile_type = 'simple';
  }

  if (utils.has(params.network_data.links[0], 'highlight')) {
    params.matrix.highlight = 1;
  } else {
    params.matrix.highlight = 0;
  }

  params.zoom_behavior = d3.behavior.zoom()
    .scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch])
    .on('zoom', function(){
      zoomed(params);
    });

  return params;
};
