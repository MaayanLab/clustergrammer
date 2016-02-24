// var crossfilter = require('crossfilter');
var utils = require('./utils');
var change_network_view = require('./network/change_network_view');
var parent_div_size = require('./parent_div_size');
var initialize_matrix = require('./initialize_matrix');
var zoomed = require('./zoomed');

/* Params: calculates the size of all the visualization elements in the
clustergram.
 */

module.exports = function(input_config) {

  var config = $.extend(true, {}, input_config);
  var params = config;

  if (params.ini_view !== null) {
    params.network_data = change_network_view(params, params.network_data, params.ini_view);
    params.ini_view = null;
  }

  params.labels = {};
  params.labels.super_label_scale = config.super_label_scale;
  params.labels.super_labels = config.super_labels;

  if (params.labels.super_labels) {
    params.labels.super_label_width = 20 * params.labels.super_label_scale;
    params.labels.super = {};
    params.labels.super.row = config.super.row;
    params.labels.super.col = config.super.col;
  } else {
    params.labels.super_label_width = 0;
  }

  params.labels.show_categories = config.show_categories;
  if (params.labels.show_categories) {
    params.labels.class_colors = config.class_colors;
  }
  params.labels.show_label_tooltips = config.show_label_tooltips;

  params.matrix = {};
  params.matrix.tile_colors = config.tile_colors;
  params.matrix.bar_colors = config.bar_colors;
  params.matrix.outline_colors = config.outline_colors;
  params.matrix.hlight_color = config.highlight_color;
  params.matrix.tile_title = config.tile_title;
  params.matrix.show_tile_tooltips = config.show_tile_tooltips;

  params.matrix.make_tile_tooltip = config.make_tile_tooltip;

  params.viz = {};

  params.viz.viz_wrapper = config.root + ' .viz_wrapper';
  params.viz.viz_svg = params.viz.viz_wrapper + ' .viz_svg';

  params.sidebar = {};
  params.sidebar.sidebar_class = 'sidebar_wrapper';

  params.viz.do_zoom = config.do_zoom;
  params.viz.resize = config.resize;
  // background colors
  params.viz.background_color = config.background_color;
  params.viz.super_border_color = config.super_border_color;
  // margin widths
  params.viz.outer_margins = config.outer_margins;
  params.viz.outer_margins_expand = config.outer_margins_expand;
  params.viz.expand = config.ini_expand;
  params.viz.uni_margin = config.uni_margin;
  params.viz.grey_border_width = config.grey_border_width;
  params.viz.show_dendrogram = config.show_dendrogram;
  params.viz.tile_click_hlight = config.tile_click_hlight;

  params.viz.uni_duration = 1000;

  // initialized clicked tile and rows
  params.matrix.click_hlight_x = -666;
  params.matrix.click_hlight_y = -666;
  params.matrix.click_hlight_row = -666;
  params.matrix.click_hlight_col = -666;

  // definition of a large matrix - based on number of links
  // below this cutoff reordering is done with transitions
  params.matrix.def_large_matrix = 10000;

  params.viz.inst_order = config.inst_order;

  params.matrix.opacity_function = config.opacity_scale;

  params.viz.expand_button = config.expand_button;

  var col_nodes = params.network_data.col_nodes;
  var row_nodes = params.network_data.row_nodes;

  // Create wrapper around SVG visualization
  d3.select(config.root).append('div').attr('class', 'viz_wrapper');

  // resize parent div - needs to be run here
  parent_div_size(params);

  params.viz.svg_dim = {};
  params.viz.svg_dim.width = Number(d3.select(params.viz.viz_wrapper).style('width').replace('px', ''));
  params.viz.svg_dim.height = Number(d3.select(params.viz.viz_wrapper).style('height').replace('px', ''));

  params.network_data.row_nodes_names = _.pluck(row_nodes, 'name');
  params.network_data.col_nodes_names = _.pluck(col_nodes, 'name');

  var row_max_char = _.max(row_nodes, function (inst) {
    return inst.name.length;
  }).name.length;
  var col_max_char = _.max(col_nodes, function (inst) {
    return inst.name.length;
  }).name.length;

  params.labels.row_max_char = row_max_char;
  params.labels.col_max_char = col_max_char;

  params.labels.max_label_char = 10;

  var min_num_char = 5;
  var max_num_char = params.labels.max_label_char;

  params.labels.show_char = 10;

  // calc how much of the label to keep
  var keep_label_scale = d3.scale.linear()
    .domain([params.labels.show_char, max_num_char])
    .range([1, params.labels.show_char / max_num_char]).clamp('true');

  params.labels.row_keep = keep_label_scale(row_max_char);
  params.labels.col_keep = keep_label_scale(col_max_char);

  // define label scale
  var min_label_width = 65;
  var max_label_width = 115;
  var label_scale = d3.scale.linear()
    .domain([min_num_char, max_num_char])
    .range([min_label_width, max_label_width]).clamp('true');

  params.norm_label = {};
  params.norm_label.width = {};

  params.norm_label.width.row = label_scale(row_max_char)
    * params.row_label_scale;

  params.norm_label.width.col = label_scale(col_max_char)
    * params.col_label_scale;

  params.norm_label.margin = {};
  params.norm_label.margin.left = params.viz.grey_border_width + params.labels.super_label_width;
  params.norm_label.margin.top = params.viz.grey_border_width + params.labels.super_label_width;

  params.class_room = {};

  params.class_room.symbol_width = 11;

  if (params.viz.show_dendrogram) {
    params.class_room.row = 2 * params.class_room.symbol_width;
    params.class_room.col = params.class_room.symbol_width;

    // TODO check this
    config.group_level = {
      row: 5,
      col: 5
    };

  } else {
    params.class_room.row = params.class_room.symbol_width;
    params.class_room.col = 0;
  }

  params.norm_label.background = {};
  params.norm_label.background.row = params.norm_label.width.row + params.class_room.row + params.viz.uni_margin;
  params.norm_label.background.col = params.norm_label.width.col + params.class_room.col + params.viz.uni_margin;

  params.viz.clust = {};
  params.viz.clust.margin = {};
  params.viz.clust.margin.left = params.norm_label.margin.left + params.norm_label.background.row;
  params.viz.clust.margin.top = params.norm_label.margin.top + params.norm_label.background.col;
  params.viz.spillover_x_offset = label_scale(col_max_char) * 0.7 * params.col_label_scale;

  // reduce width by row/col labels and by grey_border width
  //(reduce width by less since this is less aparent with slanted col labels)
  var ini_clust_width = params.viz.svg_dim.width - (params.labels.super_label_width +
    params.norm_label.width.row + params.class_room.row) - params.viz.grey_border_width - params.viz.spillover_x_offset;

  // there is space between the clustergram and the border
  var ini_clust_height = params.viz.svg_dim.height - (params.labels.super_label_width +
    params.norm_label.width.col + params.class_room.col) - 5 * params.viz.grey_border_width;

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

  if (ini_clust_width / params.viz.num_col_nodes < ini_clust_height / params.viz.num_row_nodes) {

    params.viz.clust.dim.height = ini_clust_width * (params.viz.num_row_nodes / params.viz.num_col_nodes );

    params.viz.force_square = 1;

    if (params.viz.clust.dim.height > ini_clust_height) {
      params.viz.clust.dim.height = ini_clust_height;
      params.viz.force_square = 0;
    }
  }
  else {
    params.viz.clust.dim.height = ini_clust_height;
    params.viz.force_square = 0;
  }

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

  params.matrix.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);
  params.matrix.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

  if (params.viz.inst_order.row === 'alpha') {
    params.matrix.x_scale.domain(params.matrix.orders.alpha_row);
  } else if (params.viz.inst_order.row === 'clust') {
    params.matrix.x_scale.domain(params.matrix.orders.clust_row);
  } else if (params.viz.inst_order.row === 'rank') {
    params.matrix.x_scale.domain(params.matrix.orders.rank_row);
  } else if (params.viz.inst_order.row === 'class') {
    if (utils.has(params.matrix.orders, 'class_row')) {
      params.matrix.x_scale.domain(params.matrix.orders.class_row);
    } else {
      params.matrix.x_scale.domain(params.matrix.orders.clust_row);
    }

  }

  if (params.viz.inst_order.col === 'alpha') {
    params.matrix.y_scale.domain(params.matrix.orders.alpha_col);
  } else if (params.viz.inst_order.col === 'clust') {
    params.matrix.y_scale.domain(params.matrix.orders.clust_col);
  } else if (params.viz.inst_order.col === 'rank') {
    params.matrix.y_scale.domain(params.matrix.orders.rank_col);
  } else if (params.viz.inst_order.col === 'class') {
    if (utils.has(params.matrix.orders, 'class_row')) {
      params.matrix.y_scale.domain(params.matrix.orders.class_col);
    } else {
      params.matrix.y_scale.domain(params.matrix.orders.clust_col);
    }
  }

  params.network_data.links.forEach(function (d) {
    // d.name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
    // d.row_name = row_nodes[d.source].name;
    // d.col_name = col_nodes[d.target].name;
    d.x = params.matrix.x_scale(d.target);
    d.y = params.matrix.y_scale(d.source);
  });

  // // make lnks crossfilter
  // // TODO check if relying on crossfilter
  // params.cf = {};
  // params.cf.links = crossfilter(params.network_data.links);
  // params.cf.dim_x = params.cf.links.dimension(function (d) {
  //   return d.x;
  // });
  // params.cf.dim_y = params.cf.links.dimension(function (d) {
  //   return d.y;
  // });

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

  // TODO check if using run_trans
  params.viz.run_trans = false;

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
