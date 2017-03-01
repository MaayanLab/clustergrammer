var Clustergrammer =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_config = __webpack_require__(1);
	var make_params = __webpack_require__(9);
	var make_viz = __webpack_require__(39);
	var resize_viz = __webpack_require__(90);
	var play_demo = __webpack_require__(131);
	var ini_demo = __webpack_require__(171);
	var filter_viz_using_nodes = __webpack_require__(174);
	var filter_viz_using_names = __webpack_require__(175);
	var update_cats = __webpack_require__(176);
	var reset_cats = __webpack_require__(177);
	var two_translate_zoom = __webpack_require__(82);
	var external_update_view = __webpack_require__(179);
	var export_matrix = __webpack_require__(182);
	var brush_crop_matrix = __webpack_require__(184);
	var run_zoom = __webpack_require__(91);
	var d3_tip_custom = __webpack_require__(50);

	// moved d3.slider to src
	d3.slider = __webpack_require__(186);

	/* eslint-disable */

	var awesomplete = __webpack_require__(188);
	// getting css from src
	__webpack_require__(190);
	__webpack_require__(194);

	/* clustergrammer v1.12.8
	 * Nick Fernandez, Ma'ayan Lab, Icahn School of Medicine at Mount Sinai
	 * (c) 2017
	 */
	function Clustergrammer(args) {

	  /* Main program
	   * ----------------------------------------------------------------------- */
	  // consume and validate user input
	  // build giant config object
	  // visualize based on config object
	  // handle user events

	  // consume and validate user arguments, produce configuration object
	  var config = make_config(args);

	  var cgm = {};

	  // make visualization parameters using configuration object
	  cgm.params = make_params(config);
	  cgm.config = config;

	  // set up zoom
	  cgm.params.zoom_behavior = d3.behavior.zoom().scaleExtent([1, cgm.params.viz.real_zoom * cgm.params.viz.zoom_switch]).on('zoom', function () {
	    run_zoom(cgm);
	  });

	  cgm.params.zoom_behavior.translate([cgm.params.viz.clust.margin.left, cgm.params.viz.clust.margin.top]);

	  if (cgm.params.use_sidebar) {
	    var make_sidebar = __webpack_require__(196);
	    make_sidebar(cgm);
	  }

	  // make visualization using parameters
	  make_viz(cgm);

	  function external_resize() {

	    d3.select(cgm.params.viz.viz_svg).style('opacity', 0.5);

	    var wait_time = 500;
	    if (this.params.viz.run_trans === true) {
	      wait_time = 2500;
	    }

	    setTimeout(resize_fun, wait_time, this);
	  }

	  function resize_fun(cgm) {
	    resize_viz(cgm);
	  }

	  function run_update_cats(cat_data) {
	    update_cats(this, cat_data);
	  }

	  function zoom_api(pan_dx, pan_dy, fin_zoom) {
	    two_translate_zoom(this, pan_dx, pan_dy, fin_zoom);
	  }

	  function expose_d3_tip_custom() {
	    // this allows external modules to have access to d3_tip
	    return d3_tip_custom;
	  }

	  // add more API endpoints
	  cgm.update_view = external_update_view;
	  cgm.resize_viz = external_resize;
	  cgm.play_demo = play_demo;
	  cgm.ini_demo = ini_demo;
	  cgm.filter_viz_using_nodes = filter_viz_using_nodes;
	  cgm.filter_viz_using_names = filter_viz_using_names;
	  cgm.update_cats = run_update_cats;
	  cgm.reset_cats = reset_cats;
	  cgm.zoom = zoom_api;
	  cgm.export_matrix = export_matrix;
	  cgm.brush_crop_matrix = brush_crop_matrix;
	  cgm.d3_tip_custom = expose_d3_tip_custom;

	  return cgm;
	}

	module.exports = Clustergrammer;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var transpose_network = __webpack_require__(3);
	var get_available_filters = __webpack_require__(4);
	var get_filter_default_state = __webpack_require__(5);
	var set_defaults = __webpack_require__(6);
	var check_sim_mat = __webpack_require__(7);
	var check_nodes_for_categories = __webpack_require__(8);

	module.exports = function make_config(args) {

	  var defaults = set_defaults();

	  // Mixin defaults with user-defined arguments.
	  var config = utils.extend(defaults, args);

	  config.network_data = args.network_data;

	  var super_string = ': ';

	  // replace undersores with space in row/col names
	  _.each(['row', 'col'], function (inst_rc) {

	    var inst_nodes = config.network_data[inst_rc + '_nodes'];

	    var has_cats = check_nodes_for_categories(inst_nodes);

	    inst_nodes.forEach(function (d, i) {

	      // add index to row_nodes and col_nodes
	      d[inst_rc + '_index'] = i;

	      if (has_cats) {
	        config.super_labels = true;
	        config.super[inst_rc] = d.name.split(super_string)[0];
	        d.name = d.name.split(super_string)[1];
	      }

	      d.name = d.name.replace(/_/g, ' ');
	    });
	  });

	  config.network_data.row_nodes_names = utils.pluck(config.network_data.row_nodes, 'name');
	  config.network_data.col_nodes_names = utils.pluck(config.network_data.col_nodes, 'name');

	  config.sim_mat = check_sim_mat(config);

	  var filters = get_available_filters(config.network_data.views);

	  var default_states = {};
	  _.each(_.keys(filters.possible_filters), function (inst_filter) {
	    var tmp_state = get_filter_default_state(filters.filter_data, inst_filter);

	    default_states[inst_filter] = tmp_state;
	  });

	  // process view
	  if (_.has(config.network_data, 'views')) {
	    config.network_data.views.forEach(function (inst_view) {

	      _.each(_.keys(filters.possible_filters), function (inst_filter) {
	        if (!_.has(inst_view, inst_filter)) {
	          inst_view[inst_filter] = default_states[inst_filter];
	        }
	      });

	      var inst_nodes = inst_view.nodes;

	      // proc row/col nodes names in views
	      _.each(['row', 'col'], function (inst_rc) {

	        var has_cats = check_nodes_for_categories(inst_nodes[inst_rc + '_nodes']);

	        inst_nodes[inst_rc + '_nodes'].forEach(function (d, i) {

	          // add index to row_nodes and col_nodes
	          d[inst_rc + '_index'] = i;

	          if (has_cats) {
	            d.name = d.name.split(super_string)[1];
	          }

	          d.name = d.name.replace(/_/g, ' ');
	        });
	      });
	    });
	  }

	  var col_nodes = config.network_data.col_nodes;
	  var row_nodes = config.network_data.row_nodes;

	  // add names and instantaneous positions to links
	  config.network_data.links.forEach(function (d) {
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

	  if (utils.has(config.network_data.links[0], 'value_orig')) {
	    config.keep_orig = true;
	  } else {
	    config.keep_orig = false;
	  }

	  return config;
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/* Utility functions
	 * ----------------------------------------------------------------------- */
	module.exports = {
	  normal_name: function normal_name(d) {
	    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
	    return inst_name;
	  },
	  is_supported_order: function is_supported_order(order) {
	    return order === 'ini' || order === 'clust' || order === 'rank_var' || order === 'rank' || order === 'class' || order == 'alpha';
	  },

	  /* Returns whether or not an object has a certain property.
	   */
	  has: function has(obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  },

	  property: function property(key) {
	    return function (obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  },

	  // Convenience version of a common use case of `map`: fetching a property.
	  pluck: function pluck(arr, key) {
	    var self = this;
	    // Double check that we have lodash or underscore available
	    if (window._) {
	      // Underscore provides a _.pluck function. Use that.
	      if (typeof _.pluck === 'function') {
	        return _.pluck(arr, key);
	      } else if (typeof _.map === 'function') {
	        // Lodash does not have a pluck function.
	        // Use _.map with the property function defined above.
	        return _.map(arr, self.property(key));
	      }
	    } else if (arr.map && typeof arr.map === 'function') {
	      // If lodash or underscore not available, check to see if the native arr.map is available.
	      // If so, use it with the property function defined above.
	      return arr.map(self.property(key));
	    }
	  },

	  /* Returns true if the object is undefined.
	   */
	  is_undefined: function is_undefined(obj) {
	    return obj === void 0;
	  },

	  /* Mixes two objects in together, overwriting a target with a source.
	   */
	  extend: function extend(target, source) {
	    target = target || {};
	    for (var prop in source) {
	      if (_typeof(source[prop]) === 'object') {
	        target[prop] = this.extend(target[prop], source[prop]);
	      } else {
	        target[prop] = source[prop];
	      }
	    }
	    return target;
	  }
		};

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	/* Transpose network.
	 */
	module.exports = function (net) {
	  var tnet = {},
	      inst_link,
	      i;

	  tnet.row_nodes = net.col_nodes;
	  tnet.col_nodes = net.row_nodes;
	  tnet.links = [];

	  for (i = 0; i < net.links.length; i++) {
	    inst_link = {};
	    inst_link.source = net.links[i].target;
	    inst_link.target = net.links[i].source;
	    inst_link.value = net.links[i].value;

	    // Optional highlight.
	    if (utils.has(net.links[i], 'highlight')) {
	      inst_link.highlight = net.links[i].highlight;
	    }
	    if (utils.has(net.links[i], 'value_up')) {
	      inst_link.value_up = net.links[i].value_up;
	    }
	    if (utils.has(net.links[i], 'value_dn')) {
	      inst_link.value_dn = net.links[i].value_dn;
	    }
	    if (utils.has(net.links[i], 'info')) {
	      inst_link.info = net.links[i].info;
	    }
	    tnet.links.push(inst_link);
	  }

	  return tnet;
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function get_available_filters(views) {

	  var possible_filters = {};
	  var filter_data = {};

	  _.each(views, function (inst_view) {
	    var inst_keys = _.keys(inst_view);

	    _.each(inst_keys, function (inst_key) {

	      if (inst_key != 'nodes') {

	        if (!_.has(filter_data, inst_key)) {
	          filter_data[inst_key] = [];
	        }

	        filter_data[inst_key].push(inst_view[inst_key]);

	        filter_data[inst_key] = _.uniq(filter_data[inst_key]);
	      }
	    });
	  });

	  var tmp_filters = _.keys(filter_data);

	  _.each(tmp_filters, function (inst_filter) {

	    var options = filter_data[inst_filter];
	    var num_options = options.length;

	    var filter_type = 'categorical';
	    _.each(options, function (inst_option) {
	      if (typeof inst_option === 'number') {
	        filter_type = 'numerical';
	      }
	    });

	    if (num_options > 1) {
	      possible_filters[inst_filter] = filter_type;
	    }
	  });

	  var filters = {};
	  filters.possible_filters = possible_filters;
	  filters.filter_data = filter_data;

	  return filters;
		};

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function get_filter_default_state(filter_data, filter_type) {

	  var default_state = filter_data[filter_type].sort(function (a, b) {
	    return b - a;
	  })[0];

	  default_state = String(default_state);

	  return default_state;
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function set_defaults() {

	  var defaults = {
	    // Label options
	    row_label_scale: 1,
	    col_label_scale: 1,
	    super_labels: false,
	    super: {},
	    show_label_tooltips: true,
	    show_tile_tooltips: true,
	    // matrix options
	    transpose: false,
	    tile_colors: ['#FF0000', '#1C86EE'],
	    bar_colors: ['#FF0000', '#1C86EE'],
	    // value-cat colors
	    // cat_value_colors: ['#2F4F4F', '#8A2BE2'],
	    cat_value_colors: ['#2F4F4F', '#9370DB'],
	    outline_colors: ['orange', 'black'],
	    highlight_color: '#FFFF00',
	    tile_title: false,
	    // Default domain is set to 0: the domain will be set automatically
	    input_domain: 0,
	    opacity_scale: 'linear',
	    do_zoom: true,
	    is_zoom: 0,
	    is_slider_drag: false,
	    is_cropping: false,
	    background_color: '#FFFFFF',
	    super_border_color: '#F5F5F5',
	    outer_margins: {
	      top: 0,
	      bottom: 0,
	      left: 0,
	      right: 0
	    },
	    ini_expand: false,
	    grey_border_width: 2,
	    tile_click_hlight: false,
	    super_label_scale: 1,
	    make_tile_tooltip: function make_tile_tooltip(d) {
	      return d.info;
	    },
	    // initialize view, e.g. initialize with row filtering
	    ini_view: null,
	    // record of requested views
	    requested_view: null,
	    use_sidebar: true,
	    title: null,
	    about: null,
	    sidebar_width: 160,
	    sidebar_icons: true,
	    row_search_placeholder: 'Row',
	    buffer_width: 10,
	    show_sim_mat: false,
	    cat_colors: null,
	    resize: true,
	    clamp_opacity: 0.85,
	    expand_button: true,
	    max_allow_fs: 20,
	    dendro_filter: { 'row': false, 'col': false },
	    cat_filter: { 'row': false, 'col': false },
	    crop_filter_nodes: { 'row': false, 'col': false },
	    row_tip_callback: null,
	    col_tip_callback: null,
	    tile_tip_callback: null,
	    matrix_update_callback: null,
	    dendro_callback: null,
	    new_cat_data: null
	  };

	  return defaults;
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function check_sim_mat(config) {

	  var sim_mat = false;

	  var num_rows = config.network_data.row_nodes_names.length;
	  var num_cols = config.network_data.col_nodes_names.length;

	  if (num_rows == num_cols) {

	    // the sort here was causing errors 
	    var rows = config.network_data.row_nodes_names;
	    var cols = config.network_data.col_nodes_names;
	    sim_mat = true;

	    _.each(rows, function (inst_row) {
	      var inst_index = rows.indexOf(inst_row);
	      if (inst_row !== cols[inst_index]) {
	        sim_mat = false;
	      }
	    });
	  }

	  if (sim_mat) {
	    config.expand_button = false;
	  }

	  return sim_mat;
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function check_nodes_for_categories(nodes) {

	  var super_string = ': ';
	  var has_cat = true;

	  _.each(nodes, function (inst_node) {
	    if (inst_node.name.indexOf(super_string) < 0) {
	      has_cat = false;
	    }
	  });

	  return has_cat;
		};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_network_using_view = __webpack_require__(10);
	var ini_sidebar_params = __webpack_require__(13);
	var make_requested_view = __webpack_require__(14);
	var get_available_filters = __webpack_require__(4);
	var calc_viz_params = __webpack_require__(15);
	var ini_zoom_info = __webpack_require__(38);

	/*
	Params: calculates the size of all the visualization elements in the
	clustergram.
	 */

	module.exports = function make_params(input_config) {

	  var config = $.extend(true, {}, input_config);
	  var params = config;

	  // keep a copy of inst_view
	  params.inst_nodes = {};
	  params.inst_nodes.row_nodes = params.network_data.row_nodes;
	  params.inst_nodes.col_nodes = params.network_data.col_nodes;

	  // when pre-loading the visualization using a view
	  if (params.ini_view !== null) {

	    var requested_view = params.ini_view;

	    var filters = get_available_filters(params.network_data.views);

	    params.viz = {};
	    params.viz.possible_filters = filters.possible_filters;
	    params.viz.filter_data = filters.filter_data;

	    requested_view = make_requested_view(params, requested_view);
	    params.network_data = make_network_using_view(config, params, requested_view);

	    // save ini_view as requested_view
	    params.requested_view = requested_view;
	  }

	  params = calc_viz_params(params);

	  if (params.use_sidebar) {
	    params.sidebar = ini_sidebar_params(params);
	  }

	  params.zoom_info = ini_zoom_info();

	  return params;
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var filter_network_using_new_nodes = __webpack_require__(11);
	var get_subset_views = __webpack_require__(12);

	module.exports = function make_network_using_view(config, params, requested_view) {

	  var orig_views = config.network_data.views;

	  var is_enr = false;
	  if (_.has(orig_views[0], 'enr_score_type')) {
	    is_enr = true;
	  }

	  var sub_views = get_subset_views(params, orig_views, requested_view);

	  //////////////////////////////
	  // Enrichr specific rules
	  //////////////////////////////
	  if (is_enr && sub_views.length == 0) {
	    requested_view = { 'N_row_sum': 'all', 'N_col_sum': '10' };
	    sub_views = get_subset_views(params, orig_views, requested_view);
	  }

	  var inst_view = sub_views[0];

	  var new_network_data;

	  // get new_network_data or default back to old_network_data
	  if (typeof inst_view !== 'undefined') {
	    var new_nodes = inst_view.nodes;
	    new_network_data = filter_network_using_new_nodes(config, new_nodes);
	  } else {
	    new_network_data = config.network_data;
	  }

	  return new_network_data;
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);

	module.exports = function filter_network_using_new_nodes(config, new_nodes) {

	  var links = config.network_data.links;

	  // get new names of rows and cols
	  var row_names = utils.pluck(new_nodes.row_nodes, 'name');
	  var col_names = utils.pluck(new_nodes.col_nodes, 'name');

	  var new_links = _.filter(links, function (d) {
	    var inst_row = d.name.split('_')[0];
	    var inst_col = d.name.split('_')[1];

	    var row_index = _.indexOf(row_names, inst_row);
	    var col_index = _.indexOf(col_names, inst_col);

	    if (row_index > -1 & col_index > -1) {
	      // redefine source and target
	      d.source = row_index;
	      d.target = col_index;
	      return d;
	    }
	  });

	  // set up new_network_data
	  var new_network_data = {};
	  // rows
	  new_network_data.row_nodes = new_nodes.row_nodes;
	  new_network_data.row_nodes_names = row_names;
	  // cols
	  new_network_data.col_nodes = new_nodes.col_nodes;
	  new_network_data.col_nodes_names = col_names;
	  // links
	  new_network_data.links = new_links;
	  // save all links
	  new_network_data.all_links = links;
	  // add back all views
	  new_network_data.views = config.network_data.views;

	  return new_network_data;
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var get_filter_default_state = __webpack_require__(5);

	module.exports = function get_subset_views(params, views, requested_view) {

	  var inst_value;
	  var found_filter;

	  var request_filters = _.keys(requested_view);

	  // find a view that matches all of the requested view/filter-attributes 
	  _.each(request_filters, function (inst_filter) {

	    inst_value = requested_view[inst_filter];

	    // if the value is a number, then convert it to an integer 
	    if (/[^a-z_]/i.test(inst_value)) {
	      inst_value = parseInt(inst_value, 10);
	    }

	    // only run filtering if any of the views has the filter 
	    found_filter = false;
	    _.each(views, function (tmp_view) {
	      if (utils.has(tmp_view, inst_filter)) {
	        found_filter = true;
	      }
	    });

	    if (found_filter) {
	      views = _.filter(views, function (d) {
	        return d[inst_filter] == inst_value;
	      });
	    }
	  });

	  // remove duplicate complete default states 
	  var export_views = [];
	  var found_default = false;
	  var check_default;
	  var inst_default_state;

	  // check if each view is a default state: all filters are at default 
	  // there can only be one of these 
	  _.each(views, function (inst_view) {

	    check_default = true;

	    // check each filter in a view to see if it is in the default state 
	    _.each(_.keys(params.viz.possible_filters), function (inst_filter) {

	      inst_default_state = get_filter_default_state(params.viz.filter_data, inst_filter);

	      if (inst_view[inst_filter] != inst_default_state) {
	        check_default = false;
	      }
	    });

	    // found defaule view, only append if you have not already found a default
	    if (check_default) {
	      if (found_default === false) {
	        found_default = true;
	        export_views.push(inst_view);
	      }
	    } else {
	      export_views.push(inst_view);
	    }
	  });

	  // if (export_views.length > 1){
	  //   console.log('found more than one view in get_subset_views')
	  //   console.log(requested_view)
	  //   console.log(export_views)
	  // } else {
	  //   console.log('found single view in get_subset_views')
	  //   console.log(requested_view)
	  //   console.log(export_views[0])
	  //   console.log('\n')
	  // }

	  return export_views;
		};

/***/ },
/* 13 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function ini_sidebar_params(params) {
	  var sidebar = {};

	  sidebar.wrapper = {};
	  // sidebar.wrapper.width = 170;

	  sidebar.row_search = {};
	  sidebar.row_search.box = {};
	  sidebar.row_search.box.height = 34;
	  sidebar.row_search.box.width = 95;
	  sidebar.row_search.placeholder = params.row_search_placeholder;
	  sidebar.row_search.margin_left = 7;

	  sidebar.slider = {};
	  sidebar.slider.width = params.sidebar_width - 30;
	  sidebar.slider.margin_left = 15;

	  sidebar.key_cat = {};
	  sidebar.key_cat.width = params.sidebar_width - 15;
	  sidebar.key_cat.margin_left = 5;
	  sidebar.key_cat.max_height = 100;

	  sidebar.title = params.title;
	  sidebar.title_margin_left = 7;
	  sidebar.about = params.about;
	  sidebar.width = params.sidebar_width;

	  sidebar.buttons = {};
	  sidebar.buttons.width = params.sidebar_width - 15;

	  sidebar.text = {};

	  sidebar.icons = params.sidebar_icons;
	  sidebar.icon_margin_left = -5;

	  return sidebar;
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function make_view_request(params, requested_view) {

	  // this will add all necessary information to a view request 
	  // it will grab necessary view information from the sliders 

	  // only one component will be changed at a time 
	  var changed_component = _.keys(requested_view)[0];

	  // add additional filter information from othe possible filters 
	  _.each(_.keys(params.viz.possible_filters), function (inst_filter) {

	    if (inst_filter != changed_component) {

	      if (!d3.select(params.root + ' .slider_' + inst_filter).empty()) {

	        var inst_state = d3.select(params.root + ' .slider_' + inst_filter).attr('current_state');

	        requested_view[inst_filter] = inst_state;
	      }
	    }
	  });

	  return requested_view;
		};

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ini_label_params = __webpack_require__(16);
	var ini_viz_params = __webpack_require__(17);
	var set_viz_wrapper_size = __webpack_require__(23);
	var get_svg_dim = __webpack_require__(25);
	var calc_label_params = __webpack_require__(26);
	var calc_clust_width = __webpack_require__(27);
	var calc_clust_height = __webpack_require__(28);
	var calc_val_max = __webpack_require__(29);
	var calc_matrix_params = __webpack_require__(30);
	var set_zoom_params = __webpack_require__(35);
	var calc_default_fs = __webpack_require__(37);

	module.exports = function calc_viz_params(params) {
	  var preserve_cats = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];


	  params.labels = ini_label_params(params);
	  params.viz = ini_viz_params(params, preserve_cats);

	  set_viz_wrapper_size(params);

	  params = get_svg_dim(params);
	  params.viz = calc_label_params(params.viz);
	  params.viz = calc_clust_width(params.viz);
	  params.viz = calc_clust_height(params.viz);

	  if (params.sim_mat) {
	    if (params.viz.clust.dim.width <= params.viz.clust.dim.height) {
	      params.viz.clust.dim.height = params.viz.clust.dim.width;
	    } else {
	      params.viz.clust.dim.width = params.viz.clust.dim.height;
	    }
	  }

	  params = calc_val_max(params);
	  params = calc_matrix_params(params);
	  params = set_zoom_params(params);
	  params = calc_default_fs(params);

	  return params;
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function ini_label_params(params) {

	  var labels = {};
	  labels.super_label_scale = params.super_label_scale;
	  labels.super_labels = params.super_labels;
	  labels.super_label_fs = 13.8;

	  if (labels.super_labels) {
	    labels.super = {};
	    labels.super.row = params.super.row;
	    labels.super.col = params.super.col;
	  }

	  labels.show_label_tooltips = params.show_label_tooltips;

	  labels.row_max_char = _.max(params.network_data.row_nodes, function (inst) {
	    return inst.name.length;
	  }).name.length;

	  labels.col_max_char = _.max(params.network_data.col_nodes, function (inst) {
	    return inst.name.length;
	  }).name.length;

	  labels.max_allow_fs = params.max_allow_fs;

	  return labels;
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var get_available_filters = __webpack_require__(4);
	var make_cat_params = __webpack_require__(18);

	module.exports = function ini_viz_params(params) {
	  var preserve_cats = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];


	  var viz = {};

	  viz.root = params.root;

	  viz.root_tips = params.root.replace('#', '.') + '_' + 'd3-tip';

	  viz.viz_wrapper = params.root + ' .viz_wrapper';
	  viz.do_zoom = params.do_zoom;
	  viz.background_color = params.background_color;
	  viz.super_border_color = params.super_border_color;
	  viz.outer_margins = params.outer_margins;
	  viz.is_expand = params.ini_expand;
	  viz.grey_border_width = params.grey_border_width;
	  viz.show_dendrogram = params.show_dendrogram;
	  viz.tile_click_hlight = params.tile_click_hlight;
	  viz.inst_order = params.inst_order;
	  viz.expand_button = params.expand_button;
	  viz.sim_mat = params.sim_mat;
	  viz.dendro_filter = params.dendro_filter;
	  viz.cat_filter = params.cat_filter;
	  viz.cat_value_colors = params.cat_value_colors;

	  viz.viz_svg = viz.viz_wrapper + ' .viz_svg';

	  viz.zoom_element = viz.viz_wrapper + ' .viz_svg';

	  viz.uni_duration = 1000;
	  // extra space below the clustergram (was 5)
	  // will increase this to accomidate dendro slider
	  viz.bottom_space = 10;
	  viz.run_trans = false;
	  viz.duration = 1000;

	  viz.resize = params.resize;
	  if (utils.has(params, 'size')) {
	    viz.fixed_size = params.size;
	  } else {
	    viz.fixed_size = false;
	  }

	  // width is 1 over this value
	  viz.border_fraction = 65;
	  viz.uni_margin = 5;

	  viz.super_labels = {};
	  viz.super_labels.margin = {};
	  viz.super_labels.dim = {};
	  viz.super_labels.margin.left = viz.grey_border_width;
	  viz.super_labels.margin.top = viz.grey_border_width;
	  viz.super_labels.dim.width = 0;
	  if (params.labels.super_labels) {
	    viz.super_labels.dim.width = 15 * params.labels.super_label_scale;
	  }

	  viz.triangle_opacity = 0.6;

	  viz.norm_labels = {};
	  viz.norm_labels.width = {};

	  viz.dendro_room = {};
	  if (viz.show_dendrogram) {
	    viz.dendro_room.symbol_width = 10;
	  } else {
	    viz.dendro_room.symbol_width = 0;
	  }

	  viz.cat_colors = params.cat_colors;

	  viz = make_cat_params(params, viz, preserve_cats);

	  if (_.has(params, 'group_level') == false) {
	    if (viz.show_dendrogram) {
	      params.group_level = {};
	    }
	    params.group_level.row = 5;
	    params.group_level.col = 5;
	  }

	  viz.dendro_opacity = 0.35;

	  viz.spillover_col_slant = viz.norm_labels.width.col;

	  var filters = get_available_filters(params.network_data.views);

	  viz.possible_filters = filters.possible_filters;
	  viz.filter_data = filters.filter_data;

	  viz.viz_nodes = {};

	  // nodes that should be visible based on visible area
	  viz.viz_nodes.row = params.network_data.row_nodes_names;
	  viz.viz_nodes.col = params.network_data.col_nodes_names;

	  // nodes that are currently visible
	  viz.viz_nodes.curr_row = params.network_data.row_nodes_names;
	  viz.viz_nodes.curr_col = params.network_data.col_nodes_names;

	  // correct panning in x direction
	  viz.x_offset = 0;

	  return viz;
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var process_category_info = __webpack_require__(19);
	var calc_cat_params = __webpack_require__(22);

	module.exports = function make_cat_params(params, viz) {
	  var preserve_cats = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];


	  viz = process_category_info(params, viz, preserve_cats);
	  viz = calc_cat_params(params, viz);

	  return viz;
		};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var colors = __webpack_require__(20);
	var check_if_value_cats = __webpack_require__(21);

	module.exports = function process_category_info(params, viz) {
	  var preserve_cats = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];


	  var super_string = ': ';
	  var tmp_super;
	  var inst_info;
	  var inst_color;

	  viz.show_categories = {};
	  viz.all_cats = {};
	  viz.cat_names = {};
	  viz.cat_info = {};

	  // this will hold the information for calculating the opacity of the value
	  // function
	  var ini_val_opacity = {};
	  ini_val_opacity.row = null;
	  ini_val_opacity.col = null;

	  var predefine_colors = false;
	  if (viz.cat_colors === null) {
	    viz.cat_colors = {};
	    viz.cat_colors.value_opacity = ini_val_opacity;
	    predefine_colors = false;
	  } else {
	    predefine_colors = true;
	  }

	  if (preserve_cats === false) {
	    predefine_colors = false;
	  }

	  var num_colors = 0;
	  _.each(['row', 'col'], function (inst_rc) {

	    viz.show_categories[inst_rc] = false;

	    viz.all_cats[inst_rc] = [];
	    var tmp_keys = _.keys(params.network_data[inst_rc + '_nodes'][0]);

	    _.each(tmp_keys, function (d) {

	      if (d.indexOf('cat-') >= 0) {
	        viz.show_categories[inst_rc] = true;
	        viz.all_cats[inst_rc].push(d);
	      }
	    });

	    viz.cat_info[inst_rc] = null;

	    if (viz.show_categories[inst_rc]) {

	      if (predefine_colors === false) {
	        viz.cat_colors[inst_rc] = {};
	      }

	      viz.cat_info[inst_rc] = {};
	      viz.cat_names[inst_rc] = {};

	      _.each(viz.all_cats[inst_rc], function (cat_title) {

	        _.each(params.network_data[inst_rc + '_nodes'], function (inst_node) {

	          // look for title of category in category name
	          if (typeof inst_node[cat_title] === 'string') {

	            if (inst_node[cat_title].indexOf(super_string) > 0) {
	              tmp_super = inst_node[cat_title].split(super_string)[0];
	              viz.cat_names[inst_rc][cat_title] = tmp_super;
	            } else {
	              viz.cat_names[inst_rc][cat_title] = cat_title;
	            }
	          } else {
	            viz.cat_names[inst_rc][cat_title] = cat_title;
	          }
	        });

	        var cat_instances = utils.pluck(params.network_data[inst_rc + '_nodes'], cat_title);
	        var cat_states = _.uniq(cat_instances).sort();

	        // check whether all the categories are of value type
	        inst_info = check_if_value_cats(cat_states);

	        // add histogram to inst_info
	        if (inst_info.type === 'cat_strings') {
	          var cat_hist = _.countBy(cat_instances);
	          inst_info.cat_hist = cat_hist;
	        } else {
	          inst_info.cat_hist = null;
	        }

	        // pass info_info object
	        viz.cat_info[inst_rc][cat_title] = inst_info;

	        if (predefine_colors === false) {

	          viz.cat_colors[inst_rc][cat_title] = {};

	          _.each(cat_states, function (cat_tmp, i) {

	            inst_color = colors.get_random_color(i + num_colors);

	            viz.cat_colors[inst_rc][cat_title][cat_tmp] = inst_color;

	            // hack to get 'Not' categories to not be dark colored
	            // also doing this for false
	            if (typeof cat_tmp === 'string') {
	              if (cat_tmp.indexOf('Not ') >= 0 || cat_tmp.indexOf(': false') > 0) {
	                viz.cat_colors[inst_rc][cat_title][cat_tmp] = '#eee';
	              }
	            }

	            num_colors = num_colors + 1;
	          });
	        }
	      });
	    }

	    if (params.sim_mat) {
	      // sending row color info to columns since row color info can be updated
	      // using the update_cats endpoint
	      viz.cat_colors.col = viz.cat_colors.row;
	    }
	  });

	  viz.cat_colors = viz.cat_colors;

	  viz.cat_colors.opacity = 0.6;
	  viz.cat_colors.active_opacity = 0.9;

	  return viz;
	};

/***/ },
/* 20 */
/***/ function(module, exports) {

	"use strict";

	// colors from http://graphicdesign.stackexchange.com/revisions/3815/8
	var all_colors;

	all_colors = ["#393b79", "#aec7e8", "#ff7f0e", "#ffbb78", "#98df8a", "#bcbd22", "#404040", "#ff9896", "#c5b0d5", "#8c564b", "#1f77b4", "#5254a3", "#FFDB58", "#c49c94", "#e377c2", "#7f7f7f", "#2ca02c", "#9467bd", "#dbdb8d", "#17becf", "#637939", "#6b6ecf", "#9c9ede", "#d62728", "#8ca252", "#8c6d31", "#bd9e39", "#e7cb94", "#843c39", "#ad494a", "#d6616b", "#7b4173", "#a55194", "#ce6dbd", "#de9ed6"];

	// too light colors 
	// "#e7969c",
	// "#c7c7c7", 
	// "#f7b6d2", 
	// "#cedb9c", 
	// "#9edae5", 

	function get_default_color() {
	  return '#EEE';
	}

	function get_random_color(i) {
	  return all_colors[i % get_num_colors()];
	}

	function get_num_colors() {
	  return all_colors.length;
	}

	module.exports = {
	  get_default_color: get_default_color,
	  get_random_color: get_random_color,
	  get_num_colors: get_num_colors
		};

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function check_if_value_cats(cat_states) {

	  var tmp_cat = cat_states[0];

	  var has_title = false;
	  var might_have_values = false;
	  var cat_types = 'cat_strings';
	  var max_abs_val = NaN;
	  var all_values = [];
	  var cat_scale = null;

	  var super_string = ': ';

	  if (typeof tmp_cat === 'string') {
	    if (tmp_cat.indexOf(super_string) > -1) {
	      has_title = true;
	      tmp_cat = tmp_cat.split(super_string)[1];
	    }
	  }

	  if (isNaN(tmp_cat) == false) {
	    might_have_values = true;
	  }

	  // check each value for number
	  if (might_have_values) {

	    // the default state is that all are now values, check each one
	    cat_types = 'cat_values';

	    _.each(cat_states, function (inst_cat) {

	      if (has_title) {
	        inst_cat = inst_cat.split(super_string)[1];
	      }

	      // checking whether inst_cat is 'not a number'
	      if (isNaN(inst_cat) == true) {
	        cat_types = 'cat_strings';
	      } else {
	        inst_cat = parseFloat(inst_cat);
	        all_values.push(inst_cat);
	      }
	    });
	  }

	  if (cat_types === 'cat_values') {

	    // get absolute value
	    var max_value = _.max(all_values, function (d) {
	      return Math.abs(d);
	    });

	    max_abs_val = Math.abs(max_value);

	    cat_scale = d3.scale.linear().domain([0, max_abs_val]).range([0, 1]);
	  }

	  var inst_info = {};
	  inst_info.type = cat_types;
	  inst_info.max_abs_val = max_abs_val;
	  inst_info.cat_scale = cat_scale;

	  return inst_info;
		};

/***/ },
/* 22 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function calc_cat_params(params, viz) {

	  var separtion_room;

	  // increase the width of the label container based on the label length
	  var label_scale = d3.scale.linear().domain([5, 15]).range([85, 120]).clamp('true');

	  viz.cat_room = {};
	  viz.cat_room.symbol_width = 12;
	  viz.cat_room.separation = 3;

	  _.each(['row', 'col'], function (inst_rc) {

	    viz.norm_labels.width[inst_rc] = label_scale(params.labels[inst_rc + '_max_char']) * params[inst_rc + '_label_scale'];

	    viz['num_' + inst_rc + '_nodes'] = params.network_data[inst_rc + '_nodes'].length;

	    // if (_.has(config, 'group_level')){
	    //   config.group_level[inst_rc] = 5;
	    // }

	    if (inst_rc === 'row') {
	      viz.dendro_room[inst_rc] = viz.dendro_room.symbol_width;
	    } else {
	      viz.dendro_room[inst_rc] = viz.dendro_room.symbol_width + 3 * viz.uni_margin;
	    }

	    var num_cats = viz.all_cats[inst_rc].length;

	    if (viz.show_categories[inst_rc]) {

	      separtion_room = (num_cats - 1) * viz.cat_room.separation;

	      var adjusted_cats;
	      if (inst_rc === 'row') {
	        adjusted_cats = num_cats + 1;
	      } else {
	        adjusted_cats = num_cats;
	      }

	      viz.cat_room[inst_rc] = adjusted_cats * viz.cat_room.symbol_width + separtion_room;
	    } else {
	      // no categories
	      if (inst_rc == 'row') {
	        viz.cat_room[inst_rc] = viz.cat_room.symbol_width;
	      } else {
	        viz.cat_room[inst_rc] = 0;
	      }
	    }
	  });

	  return viz;
		};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_viz_dimensions = __webpack_require__(24);

	module.exports = function set_viz_wrapper_size(params) {

	  // Create wrapper around SVG visualization
	  if (d3.select(params.root + ' .viz_wrapper').empty()) {

	    d3.select(params.root).append('div').classed('sidebar_wrapper', true);

	    d3.select(params.root).append('div').classed('viz_wrapper', true);
	  }

	  var cont_dim = calc_viz_dimensions(params);

	  d3.select(params.root + ' .sidebar_wrapper').style('float', 'left').style('width', params.sidebar_width + 'px').style('height', cont_dim.height + 'px').style('overflow', 'hidden');

	  d3.select(params.viz.viz_wrapper).style('float', 'left').style('width', cont_dim.width + 'px').style('height', cont_dim.height + 'px');
		};

/***/ },
/* 24 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function calc_viz_dimensions(params) {

	  var cont_dim = {};
	  var extra_space = params.buffer_width;

	  // var screen_width = window.innerWidth;
	  // var screen_height = window.innerHeight;

	  // // resize container, then resize visualization within container
	  // d3.select(params.root)
	  //   .style('width', screen_width+'px')
	  //   .style('height', screen_height+'px');

	  var container_width = d3.select(params.root).style('width').replace('px', '');
	  var container_height = d3.select(params.root).style('height').replace('px', '');

	  // get outer_margins
	  var outer_margins;
	  if (params.viz.is_expand === false) {
	    outer_margins = params.viz.outer_margins;
	    cont_dim.width = container_width - params.sidebar_width - extra_space;
	  } else {
	    outer_margins = params.viz.outer_margins;
	    cont_dim.width = container_width - extra_space;
	  }

	  cont_dim.top = outer_margins.top;
	  cont_dim.left = outer_margins.left;

	  if (params.viz.resize) {

	    cont_dim.height = container_height;
	  } else {

	    if (params.viz.is_expand) {
	      cont_dim.width = params.viz.fixed_size.width;
	    } else {
	      cont_dim.width = params.viz.fixed_size.width - params.sidebar_width;
	    }

	    cont_dim.height = params.viz.fixed_size.height;
	  }

	  return cont_dim;
		};

/***/ },
/* 25 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function get_svg_dim(params) {

	  params.viz.svg_dim = {};
	  params.viz.svg_dim.width = Number(d3.select(params.viz.viz_wrapper).style('width').replace('px', ''));

	  params.viz.svg_dim.height = Number(d3.select(params.viz.viz_wrapper).style('height').replace('px', ''));

	  return params;
	};

/***/ },
/* 26 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function calc_label_params(viz) {

	  viz.norm_labels.margin = {};

	  viz.norm_labels.margin.left = viz.super_labels.margin.left + viz.super_labels.dim.width;

	  viz.norm_labels.margin.top = viz.super_labels.margin.top + viz.super_labels.dim.width;

	  viz.label_background = {};

	  viz.label_background.row = viz.norm_labels.width.row + viz.cat_room.row + viz.uni_margin;

	  viz.label_background.col = viz.norm_labels.width.col + viz.cat_room.col + viz.uni_margin;

	  return viz;
	};

/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function calc_clust_width(viz) {

	  viz.clust = {};
	  viz.clust.margin = {};

	  // margin on left/top of the clustergram/matrix 
	  // 1) norm_label margin and width
	  // 2) cat_room and uni_margin 
	  viz.clust.margin.left = viz.norm_labels.margin.left + viz.norm_labels.width.row + viz.cat_room.row + viz.uni_margin;

	  viz.clust.margin.top = viz.norm_labels.margin.top + viz.norm_labels.width.col + viz.cat_room.col + viz.uni_margin;

	  // the clustergram/matrix width is the svg width minus:
	  // the margin of the clustergram on the left 
	  // the room for the spillover on the right 
	  // ** the dendro will fit in the spillover room on the right 
	  var ini_clust_width = viz.svg_dim.width - viz.clust.margin.left - viz.spillover_col_slant;

	  // make tmp scale to calc height of triangle col labels 
	  var tmp_x_scale = d3.scale.ordinal().rangeBands([0, ini_clust_width]).domain(_.range(viz.num_col_nodes));

	  var triangle_height = tmp_x_scale.rangeBand() / 2;

	  // prevent the visualization from being unnecessarily wide 
	  if (triangle_height > viz.norm_labels.width.col) {
	    var reduce_width = viz.norm_labels.width.col / triangle_height;
	    ini_clust_width = ini_clust_width * reduce_width;
	  }

	  viz.clust.dim = {};
	  viz.clust.dim.width = ini_clust_width;

	  return viz;
	};

/***/ },
/* 28 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function calc_clust_height(viz) {

	  // the clustergram/matrix height is the svg width minus: 
	  // the margin of the clustergram on the top 
	  // the dendrogram 
	  // the bottom_space 
	  var ini_clust_height = viz.svg_dim.height - viz.clust.margin.top - viz.dendro_room.col - viz.bottom_space;

	  viz.clust.dim.height = ini_clust_height;

	  return viz;
	};

/***/ },
/* 29 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function calc_val_max(params) {

	  var val_max = Math.abs(_.max(params.network_data.col_nodes, function (d) {
	    return Math.abs(d.value);
	  }).value);

	  params.labels.bar_scale_col = d3.scale.linear().domain([0, val_max]).range([0, 0.75 * params.viz.norm_labels.width.col]);

	  val_max = Math.abs(_.max(params.network_data.row_nodes, function (d) {
	    return Math.abs(d.value);
	  }).value);

	  params.labels.bar_scale_row = d3.scale.linear().domain([0, val_max]).range([0, params.viz.norm_labels.width.row]);

	  return params;
	};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ini_matrix_params = __webpack_require__(31);
	var calc_downsampled_levels = __webpack_require__(33);

	module.exports = function calc_matrix_params(params) {

	  params.matrix = ini_matrix_params(params);

	  // X and Y scales: set domains and ranges
	  //////////////////////////////////////////////
	  params.viz.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);

	  params.viz.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

	  var inst_order;

	  _.each(['row', 'col'], function (inst_rc) {

	    inst_order = params.viz.inst_order[inst_rc];

	    if (inst_order === 'custom') {
	      inst_order = 'clust';
	    }

	    if (inst_rc === 'row') {
	      params.viz.x_scale.domain(params.matrix.orders[inst_order + '_' + inst_rc]);
	    } else {
	      params.viz.y_scale.domain(params.matrix.orders[inst_order + '_' + inst_rc]);
	    }
	  });

	  // border width
	  params.viz.border_width = {};
	  params.viz.border_width.x = params.viz.x_scale.rangeBand() / params.viz.border_fraction;
	  params.viz.border_width.y = params.viz.y_scale.rangeBand() / params.viz.border_fraction;

	  // rect width needs matrix and zoom parameters
	  params.viz.rect_width = params.viz.x_scale.rangeBand() - params.viz.border_width.x;

	  // moved calculateion to calc_matrix_params
	  params.viz.rect_height = params.viz.y_scale.rangeBand() - params.viz.border_width.y;

	  calc_downsampled_levels(params);

	  return params;
		};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var initialize_matrix = __webpack_require__(32);

	module.exports = function ini_matrix_params(params) {

	  var matrix = {};

	  var network_data = params.network_data;

	  matrix.tile_colors = params.tile_colors;
	  matrix.bar_colors = params.bar_colors;
	  matrix.outline_colors = params.outline_colors;
	  matrix.hlight_color = params.highlight_color;
	  matrix.tile_title = params.tile_title;
	  matrix.show_tile_tooltips = params.show_tile_tooltips;
	  matrix.make_tile_tooltip = params.make_tile_tooltip;

	  // initialized clicked tile and rows
	  matrix.click_hlight_x = -666;
	  matrix.click_hlight_y = -666;
	  matrix.click_hlight_row = -666;
	  matrix.click_hlight_col = -666;

	  // definition of a large matrix (num links) determines if transition is run
	  matrix.def_large_matrix = 10000;
	  matrix.opacity_function = params.opacity_scale;

	  matrix.orders = {};

	  _.each(['row', 'col'], function (inst_rc) {

	    // row ordering is based on col info and vice versa
	    var other_rc;
	    if (inst_rc === 'row') {
	      other_rc = 'col';
	    } else {
	      other_rc = 'row';
	    }

	    // the nodes are defined using other_rc
	    var inst_nodes = network_data[other_rc + '_nodes'];
	    var num_nodes = inst_nodes.length;

	    var nodes_names = utils.pluck(inst_nodes, 'name');
	    var tmp = nodes_names.sort();

	    var alpha_index = _.map(tmp, function (d) {
	      return network_data[other_rc + '_nodes_names'].indexOf(d);
	    });

	    matrix.orders['alpha_' + inst_rc] = alpha_index;

	    var possible_orders = ['clust', 'rank'];

	    if (_.has(inst_nodes[0], 'rankvar')) {
	      possible_orders.push('rankvar');
	    }

	    if (params.viz.all_cats[other_rc].length > 0) {
	      _.each(params.viz.all_cats[other_rc], function (inst_cat) {
	        // the index of the category has replaced - with _
	        inst_cat = inst_cat.replace('-', '_');
	        possible_orders.push(inst_cat + '_index');
	      });
	    }

	    _.each(possible_orders, function (inst_order) {

	      var tmp_order_index = d3.range(num_nodes).sort(function (a, b) {
	        return inst_nodes[b][inst_order] - inst_nodes[a][inst_order];
	      });

	      matrix.orders[inst_order + '_' + inst_rc] = tmp_order_index;
	    });
	  });

	  if (utils.has(network_data, 'all_links')) {
	    matrix.max_link = _.max(network_data.all_links, function (d) {
	      return Math.abs(d.value);
	    }).value;
	  } else {
	    matrix.max_link = _.max(network_data.links, function (d) {
	      return Math.abs(d.value);
	    }).value;
	  }

	  matrix.abs_max_val = Math.abs(matrix.max_link) * params.clamp_opacity;

	  if (params.input_domain === 0) {
	    if (matrix.opacity_function === 'linear') {
	      matrix.opacity_scale = d3.scale.linear().domain([0, matrix.abs_max_val]).clamp(true).range([0.0, 1.0]);
	    } else if (matrix.opacity_function === 'log') {
	      matrix.opacity_scale = d3.scale.log().domain([0.001, matrix.abs_max_val]).clamp(true).range([0.0, 1.0]);
	    }
	  } else {
	    if (matrix.opacity_function === 'linear') {
	      matrix.opacity_scale = d3.scale.linear().domain([0, params.input_domain]).clamp(true).range([0.0, 1.0]);
	    } else if (matrix.opacity_function === 'log') {
	      matrix.opacity_scale = d3.scale.log().domain([0.001, params.input_domain]).clamp(true).range([0.0, 1.0]);
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

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);

	module.exports = function (network_data) {
	  var matrix = [];
	  var ini_object;

	  var keep_orig;
	  if (utils.has(network_data.links[0], 'value_orig')) {
	    keep_orig = true;
	  } else {
	    keep_orig = false;
	  }

	  network_data.row_nodes.forEach(function (tmp, row_index) {

	    matrix[row_index] = {};
	    matrix[row_index].name = network_data.row_nodes[row_index].name;
	    matrix[row_index].row_index = row_index;

	    matrix[row_index].row_data = d3.range(network_data.col_nodes.length).map(function (col_index) {

	      if (utils.has(network_data.links[0], 'value_up') || utils.has(network_data.links[0], 'value_dn')) {

	        ini_object = {
	          pos_x: col_index,
	          pos_y: row_index,
	          value: 0,
	          value_up: 0,
	          value_dn: 0,
	          highlight: 0
	        };
	      } else {

	        ini_object = {
	          pos_x: col_index,
	          pos_y: row_index,
	          value: 0,
	          highlight: 0
	        };
	      }

	      if (keep_orig) {
	        ini_object.value_orig = 0;
	      }

	      return ini_object;
	    });
	  });

	  network_data.links.forEach(function (link) {

	    // transfer additional link information is necessary
	    matrix[link.source].row_data[link.target].value = link.value;
	    matrix[link.source].row_data[link.target].row_name = link.row_name;
	    matrix[link.source].row_data[link.target].col_name = link.col_name;

	    if (utils.has(link, 'value_up') || utils.has(link, 'value_dn')) {
	      matrix[link.source].row_data[link.target].value_up = link.value_up;
	      matrix[link.source].row_data[link.target].value_dn = link.value_dn;
	    }

	    if (keep_orig) {
	      matrix[link.source].row_data[link.target].value_orig = link.value_orig;
	    }

	    if (link.highlight) {
	      matrix[link.source].row_data[link.target].highlight = link.highlight;
	    }
	    if (link.info) {
	      matrix[link.source].row_data[link.target].info = link.info;
	    }
	  });

	  return matrix;
	};

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_downsampled_matrix = __webpack_require__(34);

	module.exports = function calc_downsampled_levels(params) {

	  // console.log('---- before ---------')
	  // console.log(params.matrix.matrix[0].row_data[0].value)

	  // height of downsampled rectangles
	  var ds_height = 3;

	  var min_rect_height = 2;

	  var total_zoom = ds_height / params.viz.rect_height;

	  // amount of zooming that is tolerated for the downsampled rows
	  var inst_zt = 2;
	  params.viz.ds_zt = inst_zt;

	  var num_levels = Math.floor(Math.log(total_zoom) / Math.log(inst_zt));

	  if (params.viz.rect_height < min_rect_height && num_levels > 0) {

	    // increase ds opacity, as more rows are compressed into a single downsampled
	    // row, increase the opacity of the downsampled row. Max increase will be 2x
	    // when 100 or more rows are compressed
	    var max_opacity_scale = 2;
	    params.viz.ds_opacity_scale = d3.scale.linear().domain([1, 100]).range([1, max_opacity_scale]).clamp(true);

	    var ds;

	    params.viz.ds_num_levels = num_levels;

	    // array of downsampled parameters
	    params.viz.ds = [];

	    // array of downsampled matrices at varying levels
	    params.matrix.ds_matrix = [];

	    var inst_order = params.viz.inst_order.row;

	    // cloning
	    var mat = $.extend(true, {}, params.matrix.matrix);

	    // calculate parameters for different levels
	    for (var i = 0; i < num_levels; i++) {

	      // instantaneous ds_level (-1 means no downsampling)
	      params.viz.ds_level = 0;

	      ds = {};

	      ds.height = ds_height;
	      ds.num_levels = num_levels;

	      var inst_zoom_tolerance = Math.pow(inst_zt, i);

	      ds.zt = inst_zoom_tolerance;

	      // the number of downsampled rows is given by the height of the clustergram
	      // divided by the adjusted height of the downsampled rect.
	      // the adjusted height is the height divided by the zooming tolerance of
	      // the downsampled layer

	      // number of downsampled rows
	      ds.num_rows = Math.round(params.viz.clust.dim.height / (ds.height / inst_zoom_tolerance));

	      // x_scale
	      /////////////////////////
	      ds.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);

	      ds.x_scale.domain(params.matrix.orders[inst_order + '_row']);

	      // y_scale
	      /////////////////////////
	      ds.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);
	      ds.y_scale.domain(d3.range(ds.num_rows + 1));

	      ds.rect_height = ds.y_scale.rangeBand() - params.viz.border_width.y;

	      params.viz.ds.push(ds);

	      var matrix = calc_downsampled_matrix(params, mat, i);
	      params.matrix.ds_matrix.push(matrix);
	    }

	    // reset row viz_nodes since downsampling
	    params.viz.viz_nodes.row = d3.range(params.matrix.ds_matrix[0].length).map(String);
	  } else {
	    // set ds to null if no downsampling is done
	    params.viz.ds = null;
	    // instantaneous ds_level (-1 means no downsampling)
	    params.viz.ds_level = -1;
	    params.viz.ds_num_levels = 0;
	  }

	  // console.log('---- after ---------')
	  // console.log(params.matrix.matrix[0].row_data[0].value)
		};

/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function calc_downsampled_matrix(params, mat, ds_level) {

	  var inst_num_rows = params.viz.ds[ds_level].num_rows;

	  var num_compressed_rows = params.network_data.row_nodes.length / inst_num_rows;

	  // increase ds opacity, as more rows are compressed into a single downsampled
	  // row, increase the opacity of the downsampled row.
	  var opacity_factor = params.viz.ds_opacity_scale(num_compressed_rows);

	  var mod_val = params.viz.clust.dim.height / inst_num_rows;

	  var ds_mat = [];
	  var inst_obj;

	  var len_ds_array = inst_num_rows + 1;

	  var i;
	  var x;

	  // initialize array of objects
	  for (i = 0; i < len_ds_array; i++) {

	    inst_obj = {};
	    inst_obj.row_index = i;
	    inst_obj.name = String(i);
	    inst_obj.all_names = [];

	    ds_mat.push(inst_obj);
	  }

	  _.each(mat, function (inst_row) {

	    // row ordering information is contained in y_scale
	    var inst_y = params.viz.y_scale(inst_row.row_index);

	    var ds_index = Math.round(inst_y / mod_val);

	    var inst_row_data = inst_row.row_data;

	    // gather names
	    ds_mat[ds_index].all_names.push(inst_row.name);

	    // gather row_data
	    if (_.has(ds_mat[ds_index], 'row_data')) {

	      for (x = 0; x < inst_row_data.length; x++) {
	        ds_mat[ds_index].row_data[x].value = ds_mat[ds_index].row_data[x].value + inst_row_data[x].value;
	      }
	    } else {

	      var new_data = [];
	      for (x = 0; x < inst_row_data.length; x++) {
	        new_data[x] = inst_row_data[x];
	      }

	      ds_mat[ds_index].row_data = new_data;
	    }
	  });

	  // average the values
	  _.each(ds_mat, function (tmp_ds) {

	    var tmp_row_data = tmp_ds.row_data;

	    var num_names = tmp_ds.all_names.length;

	    _.each(tmp_row_data, function (tmp_obj) {
	      tmp_obj.value = tmp_obj.value / num_names * opacity_factor;
	    });
	  });

	  // all names were found
	  var all_names = [];

	  _.each(ds_mat, function (inst_row) {
	    all_names = all_names.concat(inst_row.all_names);
	  });

	  return ds_mat;
		};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_zoom_switching = __webpack_require__(36);

	module.exports = function set_zoom_params(params) {

	  params.viz.zoom_scale_font = {};
	  params.viz.zoom_scale_font.row = 1;
	  params.viz.zoom_scale_font.col = 1;

	  var max_zoom_limit = 0.75;
	  var half_col_height = params.viz.x_scale.rangeBand() / 2;
	  params.viz.real_zoom = params.viz.norm_labels.width.col / half_col_height * max_zoom_limit;

	  params.viz = calc_zoom_switching(params.viz);

	  return params;
	};

/***/ },
/* 36 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function calc_zoom_switching(viz) {

	  var width_by_col = viz.clust.dim.width / viz.num_col_nodes;
	  var height_by_row = viz.clust.dim.height / viz.num_row_nodes;
	  viz.zoom_switch = width_by_col / height_by_row;

	  viz.zoom_switch_y = 1;

	  if (viz.zoom_switch < 1) {
	    viz.zoom_switch_y = 1 / viz.zoom_switch;
	    viz.zoom_switch = 1;
	  }

	  return viz;
	};

/***/ },
/* 37 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function calc_default_fs(params) {

	  params.labels.default_fs_row = params.viz.y_scale.rangeBand() * 1.01;
	  params.labels.default_fs_col = params.viz.x_scale.rangeBand() * 0.87;

	  if (params.labels.default_fs_row > params.labels.max_allow_fs) {
	    params.labels.default_fs_row = params.labels.max_allow_fs;
	  }

	  if (params.labels.default_fs_col > params.labels.max_allow_fs) {
	    params.labels.default_fs_col = params.labels.max_allow_fs;
	  }

	  return params;
		};

/***/ },
/* 38 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function ini_zoom_info() {

	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;

	  return zoom_info;
		};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var generate_matrix = __webpack_require__(40);
	var make_row_label_container = __webpack_require__(51);
	var make_col_label_container = __webpack_require__(69);
	var generate_super_labels = __webpack_require__(77);
	var spillover = __webpack_require__(78);
	var initialize_resizing = __webpack_require__(89);
	var ini_doubleclick = __webpack_require__(99);
	var make_col_cat = __webpack_require__(118);
	var make_row_cat = __webpack_require__(124);
	var trim_text = __webpack_require__(84);
	var make_row_dendro = __webpack_require__(125);
	var make_col_dendro = __webpack_require__(126);
	var make_svg_dendro_sliders = __webpack_require__(127);
	var make_row_dendro_spillover = __webpack_require__(130);

	module.exports = function Viz(cgm) {

	  var params = cgm.params;

	  d3.select(params.viz.viz_wrapper + ' svg').remove();

	  var svg_group = d3.select(params.viz.viz_wrapper).append('svg').attr('class', 'viz_svg').attr('id', 'svg_' + params.root.replace('#', '')).attr('width', params.viz.svg_dim.width).attr('height', params.viz.svg_dim.height).attr('is_zoom', 0).attr('stopped_zoom', 1);

	  svg_group.append('rect').attr('class', 'super_background').style('width', params.viz.svg_dim.width).style('height', params.viz.svg_dim.height).style('fill', 'white');

	  generate_matrix(params, svg_group);

	  make_row_label_container(cgm);

	  if (params.viz.show_dendrogram) {
	    make_row_dendro(cgm);
	    make_col_dendro(cgm);
	  }

	  make_row_dendro_spillover(cgm);

	  make_col_label_container(cgm);

	  // initial trim text
	  if (params.viz.ds_level === -1) {
	    _.each(['row', 'col'], function (inst_rc) {

	      var inst_fs = Number(d3.select('.' + inst_rc + '_label_group').select('text').style('font-size').replace('px', ''));

	      var min_trim_fs = 8;
	      if (inst_fs > min_trim_fs) {
	        d3.selectAll(params.root + ' .' + inst_rc + '_label_group').each(function () {
	          trim_text(params, this, inst_rc);
	        });
	      }
	    });
	  }

	  // make category colorbars
	  make_row_cat(cgm);
	  if (params.viz.show_categories.col) {
	    make_col_cat(cgm);
	  }

	  spillover(cgm);

	  if (params.labels.super_labels) {
	    generate_super_labels(params);
	  }

	  // sliders should go above super labels
	  make_svg_dendro_sliders(cgm);

	  function border_colors() {
	    var inst_color = params.viz.super_border_color;
	    if (params.viz.is_expand) {
	      inst_color = 'white';
	    }
	    return inst_color;
	  }

	  // left border
	  d3.select(params.viz.viz_svg).append('rect').classed('left_border', true).classed('borders', true).attr('fill', border_colors).attr('width', params.viz.grey_border_width).attr('height', params.viz.svg_dim.height).attr('transform', 'translate(0,0)');

	  // right border
	  d3.select(params.viz.viz_svg).append('rect').classed('right_border', true).classed('borders', true).attr('fill', border_colors).attr('width', params.viz.grey_border_width).attr('height', params.viz.svg_dim.height).attr('transform', function () {
	    var inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
	    return 'translate(' + inst_offset + ',0)';
	  });

	  // top border
	  d3.select(params.viz.viz_svg).append('rect').classed('top_border', true).classed('borders', true).attr('fill', border_colors).attr('width', params.viz.svg_dim.width).attr('height', params.viz.grey_border_width).attr('transform', function () {
	    var inst_offset = 0;
	    return 'translate(' + inst_offset + ',0)';
	  });

	  // bottom border
	  d3.select(params.viz.viz_svg).append('rect').classed('bottom_border', true).classed('borders', true).attr('fill', border_colors).attr('width', params.viz.svg_dim.width).attr('height', params.viz.grey_border_width).attr('transform', function () {
	    var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
	    return 'translate(0,' + inst_offset + ')';
	  });

	  initialize_resizing(cgm);

	  ini_doubleclick(cgm);

	  if (params.viz.do_zoom) {
	    d3.select(params.viz.zoom_element).call(params.zoom_behavior);
	  }

	  d3.select(params.viz.zoom_element).on('dblclick.zoom', null);
		};

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var draw_gridlines = __webpack_require__(41);
	var add_click_hlight = __webpack_require__(42);
	var make_matrix_rows = __webpack_require__(43);

	module.exports = function (params, svg_elem) {
	  var network_data = params.network_data;

	  var matrix = [];
	  var clust_group;

	  // append a group that will hold clust_group and position it once
	  clust_group = svg_elem.append('g').attr('class', 'clust_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.clust.margin.top + ')').append('g').attr('class', 'clust_group').classed('clust_group', true);

	  // clustergram background rect
	  clust_group.append('rect').classed('background', true).classed('grey_background', true).style('fill', '#eee').style('opacity', 0.25).attr('width', params.viz.clust.dim.width).attr('height', params.viz.clust.dim.height);

	  // pass in params and the rows (row_nodes) that need to be made
	  // in this case all row nodes
	  // make_matrix_rows(params, params.matrix.matrix, params.network_data.row_nodes_names);

	  // initialize at ds_level 0
	  if (params.viz.ds === null) {
	    // do not use downsampled matrix
	    make_matrix_rows(params, params.matrix.matrix, 'all', params.viz.ds_level);
	  } else {
	    // use downsampled matrix
	    make_matrix_rows(params, params.matrix.ds_matrix[0], 'all', params.viz.ds_level);
	  }

	  // add callback function to tile group - if one is supplied by the user
	  if (typeof params.click_tile === 'function') {
	    d3.selectAll(params.root + ' .tile').on('click', function (d) {

	      // export row/col name and value from tile
	      var tile_info = {};
	      tile_info.row = params.network_data.row_nodes[d.pos_y].name;
	      tile_info.col = params.network_data.col_nodes[d.pos_x].name;
	      tile_info.value = d.value;

	      if (utils.has(d, 'value_up')) {
	        tile_info.value_up = d.value_up;
	      }
	      if (utils.has(d, 'value_dn')) {
	        tile_info.value_dn = d.value_dn;
	      }
	      if (utils.has(d, 'info')) {
	        tile_info.info = d.info;
	      }
	      // run the user supplied callback function
	      params.click_tile(tile_info);
	      add_click_hlight(params, this);
	    });
	  } else {

	    // highlight clicked tile
	    if (params.tile_click_hlight) {
	      d3.selectAll(params.root + ' .tile').on('click', function () {
	        add_click_hlight(params, this);
	      });
	    }
	  }

	  // draw grid lines after drawing tiles
	  var delays = {};
	  var duration = 0;
	  delays.enter = 0;
	  draw_gridlines(params, delays, duration);

	  // Matrix API
	  return {
	    get_clust_group: function get_clust_group() {
	      return clust_group;
	    },
	    get_matrix: function get_matrix() {
	      return matrix;
	    },
	    get_nodes: function get_nodes(type) {
	      if (type === 'row') {
	        return network_data.row_nodes;
	      }
	      return network_data.col_nodes;
	    }
	  };
		};

/***/ },
/* 41 */
/***/ function(module, exports) {

	"use strict";

	// var grid_lines_viz = require('./grid_lines_viz');
	// var toggle_grid_lines = require('./toggle_grid_lines');

	module.exports = function draw_gridlines(params, delays, duration) {

	  // var row_nodes = params.network_data.row_nodes;
	  // var col_nodes = params.network_data.col_nodes;

	  // // Fade in new gridlines
	  // ///////////////////////////

	  // // append horizontal line groups
	  // var horz_lines = d3.select(params.root+' .clust_group')
	  //   .selectAll('.horz_lines')
	  //   .data(row_nodes, function(d){return d.name;})
	  //   .enter()
	  //   .append('g')
	  //   .attr('class','horz_lines');

	  // // append vertical line groups
	  // var vert_lines = d3.select(params.root+' .clust_group')
	  //   .selectAll('.vert_lines')
	  //   .data(col_nodes)
	  //   .enter()
	  //   .append('g')
	  //   .attr('class', 'vert_lines');

	  // grid_lines_viz(params, duration);

	  // horz_lines
	  //   .select('line')
	  //   .attr('opacity',0)
	  //   .attr('stroke','white')
	  //   .attr('opacity', 1);

	  // vert_lines
	  //   .select('line')
	  //   .style('stroke', 'white')
	  //   .attr('opacity',0)
	  //   .transition().delay(delays.enter).duration(2*duration)
	  //   .attr('opacity', 1);

	  // toggle_grid_lines(params);

	};

/***/ },
/* 42 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params, clicked_rect) {

	  // get x position of rectangle
	  d3.select(clicked_rect).each(function (d) {
	    var pos_x = d.pos_x;
	    var pos_y = d.pos_y;

	    d3.selectAll(params.root + ' .click_hlight').remove();

	    if (pos_x != params.matrix.click_hlight_x || pos_y != params.matrix.click_hlight_y) {

	      // save pos_x to params.viz.click_hlight_x
	      params.matrix.click_hlight_x = pos_x;
	      params.matrix.click_hlight_y = pos_y;

	      // draw the highlighting rectangle as four rectangles
	      // so that the width and height can be controlled
	      // separately

	      var rel_width_hlight = 6;
	      var opacity_hlight = 0.85;

	      var hlight_width = rel_width_hlight * params.viz.border_width.x;
	      var hlight_height = rel_width_hlight * params.viz.border_width.y; ///params.viz.zoom_switch;

	      // top highlight
	      d3.select(clicked_rect.parentNode).append('rect').classed('click_hlight', true).classed('top_hlight', true).attr('width', params.viz.x_scale.rangeBand()).attr('height', hlight_height).attr('fill', params.matrix.hlight_color).attr('transform', function () {
	        return 'translate(' + params.viz.x_scale(pos_x) + ',0)';
	      }).attr('opacity', opacity_hlight);

	      // left highlight
	      d3.select(clicked_rect.parentNode).append('rect').classed('click_hlight', true).classed('left_hlight', true).attr('width', hlight_width).attr('height', params.viz.y_scale.rangeBand() - hlight_height * 0.99).attr('fill', params.matrix.hlight_color).attr('transform', function () {
	        return 'translate(' + params.viz.x_scale(pos_x) + ',' + hlight_height * 0.99 + ')';
	      }).attr('opacity', opacity_hlight);

	      // right highlight
	      d3.select(clicked_rect.parentNode).append('rect').classed('click_hlight', true).classed('right_hlight', true).attr('width', hlight_width).attr('height', params.viz.y_scale.rangeBand() - hlight_height * 0.99).attr('fill', params.matrix.hlight_color).attr('transform', function () {
	        var tmp_translate = params.viz.x_scale(pos_x) + params.viz.x_scale.rangeBand() - hlight_width;
	        return 'translate(' + tmp_translate + ',' + hlight_height * 0.99 + ')';
	      }).attr('opacity', opacity_hlight);

	      // bottom highlight
	      d3.select(clicked_rect.parentNode).append('rect').classed('click_hlight', true).classed('bottom_hlight', true).attr('width', function () {
	        return params.viz.x_scale.rangeBand() - 1.98 * hlight_width;
	      }).attr('height', hlight_height).attr('fill', params.matrix.hlight_color).attr('transform', function () {
	        var tmp_translate_x = params.viz.x_scale(pos_x) + hlight_width * 0.99;
	        var tmp_translate_y = params.viz.y_scale.rangeBand() - hlight_height;
	        return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
	      }).attr('opacity', opacity_hlight);
	    } else {
	      params.matrix.click_hlight_x = -666;
	      params.matrix.click_hlight_y = -666;
	    }
	  });
	};

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_simple_rows = __webpack_require__(44);
	var d3_tip_custom = __webpack_require__(50);

	// current matrix can change with downsampling
	module.exports = function make_matrix_rows(params, current_matrix) {
	  var row_names = arguments.length <= 2 || arguments[2] === undefined ? 'all' : arguments[2];
	  var ds_level = arguments.length <= 3 || arguments[3] === undefined ? -1 : arguments[3];


	  // defaults
	  var y_scale = params.viz.y_scale;
	  var make_tip = true;
	  var row_class = 'row';

	  if (ds_level >= 0) {
	    y_scale = params.viz.ds[ds_level].y_scale;
	    make_tip = false;
	    row_class = 'ds' + String(ds_level) + '_row';
	  }

	  if (make_tip) {

	    // do not remove tile_tip here
	    /////////////////////////////////

	    // make rows in the matrix - add key names to rows in matrix
	    /////////////////////////////////////////////////////////////
	    // d3-tooltip - for tiles
	    var tip = d3_tip_custom().attr('class', function () {
	      var root_tip_selector = params.viz.root_tips.replace('.', '');
	      var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_tile_tip';
	      return class_string;
	    }).style('display', 'none').direction('nw').offset([0, 0]).html(function (d) {
	      var inst_value = String(d.value.toFixed(3));
	      var tooltip_string;

	      if (params.keep_orig) {
	        var orig_value = String(d.value_orig.toFixed(3));
	        tooltip_string = '<p>' + d.row_name + ' and ' + d.col_name + '</p>' + '<p> normalized value: ' + inst_value + '</p>' + '<div> original value: ' + orig_value + '</div>';
	      } else {
	        tooltip_string = '<p>' + d.row_name + ' and ' + d.col_name + '</p>' + '<div> value: ' + inst_value + '</div>';
	      }

	      return tooltip_string;
	    });

	    // d3.select(params.root+' .clust_group')
	    //   .call(tip);
	  } else {
	    tip = null;
	  }

	  // gather a subset of row data from the matrix or use all rows
	  var matrix_subset = [];
	  if (row_names === 'all') {
	    matrix_subset = current_matrix;
	  } else {
	    _.each(current_matrix, function (inst_row) {
	      if (_.contains(row_names, inst_row.name)) {
	        matrix_subset.push(inst_row);
	      }
	    });
	  }

	  d3.select(params.root + ' .clust_group').selectAll('.row').data(matrix_subset, function (d) {
	    return d.name;
	  }).enter().append('g').classed(row_class, true).attr('transform', function (d) {
	    return 'translate(0,' + y_scale(d.row_index) + ')';
	  }).each(function (d) {
	    make_simple_rows(params, d, tip, this, ds_level);
	  });

	  if (params.viz.ds_level === -1 && tip != null) {
	    d3.selectAll(params.root + ' .row').call(tip);
	  }
		};

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* eslint-disable */

	var draw_up_tile = __webpack_require__(45);
	var draw_dn_tile = __webpack_require__(46);
	var mouseover_tile = __webpack_require__(47);
	var mouseout_tile = __webpack_require__(48);
	var fine_position_tile = __webpack_require__(49);

	module.exports = function make_simple_rows(params, inst_data, tip, row_selection) {
	  var ds_level = arguments.length <= 4 || arguments[4] === undefined ? -1 : arguments[4];


	  var inp_row_data = inst_data.row_data;

	  var make_tip = true;
	  var rect_height = params.viz.rect_height;
	  if (ds_level >= 0) {
	    make_tip = false;
	    rect_height = params.viz.ds[ds_level].rect_height;
	  }

	  var keep_orig;
	  if (_.has(params.network_data.links[0], 'value_orig')) {
	    keep_orig = true;
	  } else {
	    keep_orig = false;
	  }

	  var row_values;
	  if (keep_orig === false) {
	    // value: remove zero values to make visualization faster
	    row_values = _.filter(inp_row_data, function (num) {
	      return num.value !== 0;
	    });
	  } else {
	    row_values = inp_row_data;
	  }

	  // generate tiles in the current row
	  var tile = d3.select(row_selection).selectAll('rect').data(row_values, function (d) {
	    return d.col_name;
	  }).enter().append('rect').attr('class', 'tile row_tile').attr('width', params.viz.rect_width).attr('height', rect_height).style('fill', function (d) {
	    // switch the color based on up/dn value
	    var inst_fill;
	    if (d.value_orig === 'NaN') {
	      inst_fill = '#000000';
	    } else {
	      inst_fill = d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
	    }
	    return inst_fill;
	  }).style('fill-opacity', function (d) {
	    // calculate output opacity using the opacity scale
	    var inst_opacity;
	    if (d.value_orig === 'NaN') {
	      // console.log('found NaN while making tiles');
	      inst_opacity = 0.175;
	    } else {
	      inst_opacity = params.matrix.opacity_scale(Math.abs(d.value));
	    }
	    return inst_opacity;
	  }).attr('transform', function (d) {
	    return fine_position_tile(params, d);
	  });

	  if (make_tip) {
	    tile.on('mouseover', function () {
	      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	        args[_key] = arguments[_key];
	      }
	      mouseover_tile(params, this, tip, args);
	    }).on('mouseout', function () {
	      mouseout_tile(params, this, tip);
	    });
	  }

	  // // tile circles
	  // /////////////////////////////
	  // var tile = d3.select(row_selection)
	  //   .selectAll('circle')
	  //   .data(row_values, function(d){ return d.col_name; })
	  //   .enter()
	  //   .append('circle')
	  //   .attr('cx', params.viz.rect_height/2)
	  //   .attr('cy', params.viz.rect_height/2)
	  //   .attr('r', params.viz.rect_height/3)
	  //   .attr('class', 'tile_circle')
	  //   // .attr('width', params.viz.rect_width/2)
	  //   // .attr('height', params.viz.rect_height/2)
	  //   // // switch the color based on up/dn value
	  //   // .style('fill', function(d) {
	  //   //   // return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
	  //   //   return 'black';
	  //   // })
	  //   .on('mouseover', function(...args) {
	  //       mouseover_tile(params, this, tip, args);
	  //   })
	  //   .on('mouseout', function() {
	  //     mouseout_tile(params, this, tip);
	  //   })
	  //   .style('fill-opacity', function(d) {
	  //     // calculate output opacity using the opacity scale
	  //     var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
	  //     if (output_opacity < 0.3){
	  //       output_opacity = 0;
	  //     } else if (output_opacity < 0.6){
	  //       output_opacity = 0.35;
	  //     } else {
	  //       output_opacity = 1;
	  //     }
	  //     return output_opacity;
	  //     // return 0.1;
	  //   })
	  //   .attr('transform', function(d) {
	  //     return fine_position_tile(params, d);
	  //   });


	  if (params.matrix.tile_type == 'updn') {

	    // value split
	    var row_split_data = _.filter(inp_row_data, function (num) {
	      return num.value_up != 0 || num.value_dn != 0;
	    });

	    // tile_up
	    d3.select(row_selection).selectAll('.tile_up').data(row_split_data, function (d) {
	      return d.col_name;
	    }).enter().append('path').attr('class', 'tile_up').attr('d', function () {
	      return draw_up_tile(params);
	    }).attr('transform', function (d) {
	      fine_position_tile(params, d);
	    }).style('fill', function () {
	      return params.matrix.tile_colors[0];
	    }).style('fill-opacity', function (d) {
	      var inst_opacity = 0;
	      if (Math.abs(d.value_dn) > 0) {
	        inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
	      }
	      return inst_opacity;
	    }).on('mouseover', function () {
	      for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	        args[_key2] = arguments[_key2];
	      }

	      mouseover_tile(params, this, tip, args);
	    }).on('mouseout', function () {
	      mouseout_tile(params, this, tip);
	    });

	    // tile_dn
	    d3.select(row_selection).selectAll('.tile_dn').data(row_split_data, function (d) {
	      return d.col_name;
	    }).enter().append('path').attr('class', 'tile_dn').attr('d', function () {
	      return draw_dn_tile(params);
	    }).attr('transform', function (d) {
	      fine_position_tile(params, d);
	    }).style('fill', function () {
	      return params.matrix.tile_colors[1];
	    }).style('fill-opacity', function (d) {
	      var inst_opacity = 0;
	      if (Math.abs(d.value_up) > 0) {
	        inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
	      }
	      return inst_opacity;
	    }).on('mouseover', function () {
	      for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
	        args[_key3] = arguments[_key3];
	      }

	      mouseover_tile(params, this, tip, args);
	    }).on('mouseout', function () {
	      mouseout_tile(params, this, tip);
	    });

	    // remove rect when tile is split
	    tile.each(function (d) {
	      if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
	        d3.select(this).remove();
	      }
	    });
	  }

	  // append title to group
	  if (params.matrix.tile_title) {
	    tile.append('title').text(function (d) {
	      var inst_string = 'value: ' + d.value;
	      return inst_string;
	    });
	  }
		};

/***/ },
/* 45 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function draw_up_tile(params) {

	  var start_x = 0;
	  var final_x = params.viz.x_scale.rangeBand() - params.viz.border_width.x; ///params.viz.zoom_switch_y;
	  var start_y = 0;
	  var final_y = params.viz.y_scale.rangeBand() - params.viz.border_width.y; ///params.viz.zoom_switch;

	  var output_string = 'M' + start_x + ',' + start_y + ', L' + start_x + ', ' + final_y + ', L' + final_x + ',0 Z';

	  return output_string;
	};

/***/ },
/* 46 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function draw_dn_tile(params) {

	  var start_x = 0;
	  var final_x = params.viz.x_scale.rangeBand() - params.viz.border_width.x;
	  var start_y = params.viz.y_scale.rangeBand() - params.viz.border_width.y;
	  var final_y = params.viz.y_scale.rangeBand() - params.viz.border_width.y;

	  var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' + final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';

	  return output_string;
	};

/***/ },
/* 47 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function mouseover_tile(params, inst_selection, tip, inst_arguments) {

	  var inst_data = inst_arguments[0];
	  var args = [].slice.call(inst_arguments);
	  var timeout;
	  var delay = 1000;

	  d3.select(inst_selection).classed('hovering', true);

	  _.each(['row', 'col'], function (inst_rc) {

	    d3.selectAll(params.root + ' .' + inst_rc + '_label_group text').style('font-weight', function (d) {
	      var font_weight;
	      var inst_found = inst_data[inst_rc + '_name'].replace(/_/g, ' ') === d.name;
	      if (inst_found) {
	        font_weight = 'bold';
	      } else {
	        font_weight = 'normal';
	      }
	      return font_weight;
	    });
	  });

	  args.push(inst_selection);
	  clearTimeout(timeout);
	  timeout = setTimeout(check_if_hovering, delay, inst_selection);

	  function check_if_hovering() {
	    if (d3.select(inst_selection).classed('hovering')) {

	      var inst_zoom = Number(d3.select(params.root + ' .viz_svg').attr('is_zoom'));

	      if (inst_zoom === 0) {

	        if (params.matrix.show_tile_tooltips && tip !== null) {

	          d3.selectAll(params.viz.root_tips + '_tile_tip').style('display', 'block');

	          tip.show.apply(inst_selection, args);

	          if (params.tile_tip_callback != null) {
	            var tile_info = args[0];
	            params.tile_tip_callback(tile_info);
	          }
	        }
	      }
	    }
	  }
		};

/***/ },
/* 48 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function mouseout_tile(params, inst_selection, tip) {

	  d3.select(inst_selection).classed('hovering', false);

	  d3.selectAll(params.viz.root_tips + '_tile_tip').style('display', 'none');

	  _.each(['row', 'col'], function (inst_rc) {

	    d3.selectAll(params.root + ' .' + inst_rc + '_label_group text').style('font-weight', 'normal');
	  });

	  if (tip != null) {
	    tip.hide();
	  }
	};

/***/ },
/* 49 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function fine_position_tile(params, d) {

	  var offset_x;

	  // prevent rows not in x_scale domain from causing errors
	  if (d.pos_x in params.viz.x_scale.domain()) {
	    offset_x = params.viz.x_scale(d.pos_x);
	  } else {
	    offset_x = 0;
	  }

	  var x_pos = offset_x + 0.5 * params.viz.border_width.x;
	  var y_pos = 0.5 * params.viz.border_width.y;
	  return 'translate(' + x_pos + ',' + y_pos + ')';
	};

/***/ },
/* 50 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function d3_tip_custom() {
	  /* eslint-disable */
	  // Copyright (c) 2013 Justin Palmer
	  //
	  // Tooltips for d3.js SVG visualizations

	  // Public - contructs a new tooltip
	  //
	  // Returns a tip
	  // ******************
	  // Nick Fernandez modified version 4-19-2016
	  // improved multiple svg, scrolling+zooming support
	  // made syntax fixes
	  //////////////////////////////////////////////
	  var direction = d3_tip_direction,
	      offset = d3_tip_offset,
	      html = d3_tip_html,
	      node = initNode(),
	      svg = null,
	      point = null,
	      target = null;

	  function tip(vis) {
	    svg = getSVGNode(vis);
	    point = svg.createSVGPoint();
	    document.body.appendChild(node);
	  }

	  // Public - show the tooltip on the screen
	  //
	  // Returns a tip
	  tip.show = function () {

	    var args = Array.prototype.slice.call(arguments);
	    if (args[args.length - 1] instanceof SVGElement) {
	      target = args.pop();
	    }

	    var content = html.apply(this, args);
	    var poffset = offset.apply(this, args);
	    var dir = direction.apply(this, args);
	    var nodel = d3.select(node);
	    var i = 0;
	    var coords;

	    // add z-index to make sure tooltips appear on top
	    nodel.html(content).style({ opacity: 1, 'pointer-events': 'all' }).style('z-index', 99);

	    while (i--) {
	      nodel.classed(directions[i], false);
	    }
	    coords = direction_callbacks.get(dir).apply(this);
	    nodel.classed(dir, true).style({
	      top: coords.top + poffset[0] + 'px',
	      left: coords.left + poffset[1] + 'px'
	    });

	    // quick fix for fading tile tooltips
	    if (isFunction(this) === false) {

	      var inst_class = d3.select(this).attr('class');

	      if (inst_class.indexOf('tile') >= 0) {
	        setTimeout(fade_tips, 5000, this);
	      }
	    }

	    return tip;
	  };

	  // Public - hide the tooltip
	  //
	  // Returns a tip
	  tip.hide = function () {
	    var nodel = d3.select(node);
	    nodel.style({ opacity: 0, 'pointer-events': 'none' });
	    return tip;
	  };

	  // Public: Proxy attr calls to the d3 tip container.  Sets or gets attribute value.
	  //
	  // n - name of the attribute
	  // v - value of the attribute
	  //
	  // Returns tip or attribute value
	  tip.attr = function (n) {
	    if (arguments.length < 2 && typeof n === 'string') {
	      return d3.select(node).attr(n);
	    } else {
	      var args = Array.prototype.slice.call(arguments);
	      d3.selection.prototype.attr.apply(d3.select(node), args);
	    }

	    return tip;
	  };

	  // Public: Proxy style calls to the d3 tip container.  Sets or gets a style value.
	  //
	  // n - name of the property
	  // v - value of the property
	  //
	  // Returns tip or style property value
	  tip.style = function (n) {
	    if (arguments.length < 2 && typeof n === 'string') {
	      return d3.select(node).style(n);
	    } else {
	      var args = Array.prototype.slice.call(arguments);
	      d3.selection.prototype.style.apply(d3.select(node), args);
	    }

	    return tip;
	  };

	  // Public: Set or get the direction of the tooltip
	  //
	  // v - One of n(north), s(south), e(east), or w(west), nw(northwest),
	  //     sw(southwest), ne(northeast) or se(southeast)
	  //
	  // Returns tip or direction
	  tip.direction = function (v) {
	    if (!arguments.length) {
	      return direction;
	    }
	    direction = v == null ? v : d3.functor(v);

	    return tip;
	  };

	  // Public: Sets or gets the offset of the tip
	  //
	  // v - Array of [x, y] offset
	  //
	  // Returns offset or
	  tip.offset = function (v) {
	    if (!arguments.length) {
	      return offset;
	    }
	    offset = v == null ? v : d3.functor(v);

	    return tip;
	  };

	  // Public: sets or gets the html value of the tooltip
	  //
	  // v - String value of the tip
	  //
	  // Returns html value or tip
	  tip.html = function (v) {
	    if (!arguments.length) {
	      return html;
	    }
	    html = v == null ? v : d3.functor(v);

	    return tip;
	  };

	  function d3_tip_direction() {
	    return 'n';
	  }
	  function d3_tip_offset() {
	    return [0, 0];
	  }
	  function d3_tip_html() {
	    return ' ';
	  }

	  var direction_callbacks = d3.map({
	    n: direction_n,
	    s: direction_s,
	    e: direction_e,
	    w: direction_w,
	    nw: direction_nw,
	    ne: direction_ne,
	    sw: direction_sw,
	    se: direction_se,
	    south_custom: direction_south_custom
	  }),
	      directions = direction_callbacks.keys();

	  function direction_south_custom() {
	    var bbox = getScreenBBox();

	    return {
	      top: bbox.s.y,
	      left: bbox.s.x
	    };
	  }

	  function direction_n() {
	    var bbox = getScreenBBox();
	    return {
	      top: bbox.n.y - node.offsetHeight,
	      left: bbox.n.x - node.offsetWidth / 2
	    };
	  }

	  function direction_s() {
	    var bbox = getScreenBBox();
	    return {
	      top: bbox.s.y,
	      left: bbox.s.x - node.offsetWidth / 2
	    };
	  }

	  function direction_e() {
	    var bbox = getScreenBBox();
	    return {
	      top: bbox.e.y - node.offsetHeight / 2,
	      left: bbox.e.x
	    };
	  }

	  function direction_w() {
	    var bbox = getScreenBBox();
	    return {
	      top: bbox.w.y - node.offsetHeight / 2,
	      left: bbox.w.x - node.offsetWidth
	    };
	  }

	  function direction_nw() {
	    var bbox = getScreenBBox();
	    return {
	      top: bbox.nw.y - node.offsetHeight,
	      left: bbox.nw.x - node.offsetWidth
	    };
	  }

	  function direction_ne() {
	    var bbox = getScreenBBox();
	    return {
	      top: bbox.ne.y - node.offsetHeight,
	      left: bbox.ne.x
	    };
	  }

	  function direction_sw() {
	    var bbox = getScreenBBox();
	    return {
	      top: bbox.sw.y,
	      left: bbox.sw.x - node.offsetWidth
	    };
	  }

	  function direction_se() {
	    var bbox = getScreenBBox();
	    return {
	      top: bbox.se.y,
	      left: bbox.e.x
	    };
	  }

	  function initNode() {
	    var node = d3.select(document.createElement('div'));
	    node.style({
	      position: 'absolute',
	      opacity: 0,
	      pointerEvents: 'none',
	      boxSizing: 'border-box'
	    });

	    return node.node();
	  }

	  function getSVGNode(el) {
	    el = el.node();
	    if (el.tagName.toLowerCase() == 'svg') {
	      return el;
	    }

	    return el.ownerSVGElement;
	  }

	  // Private - gets the screen coordinates of a shape
	  //
	  // Given a shape on the screen, will return an SVGPoint for the directions
	  // n(north), s(south), e(east), w(west), ne(northeast), se(southeast), nw(northwest),
	  // sw(southwest).
	  //
	  //    +-+-+
	  //    |   |
	  //    +   +
	  //    |   |
	  //    +-+-+
	  //
	  // Returns an Object {n, s, e, w, nw, sw, ne, se}
	  function getScreenBBox() {
	    var targetel = target || d3.event.target;
	    var bbox = {};
	    var matrix = targetel.getScreenCTM();
	    var tbbox = targetel.getBBox();
	    var width = tbbox.width;
	    var height = tbbox.height;
	    var x = tbbox.x;
	    var y = tbbox.y;
	    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	    var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

	    // Nick - prevents bugs with scrolling and zooming on the same object
	    matrix.a = 1;
	    matrix.d = 1;
	    // changing order of adding scrolling,
	    // original ordering was causing problems with pre-translated or rotated
	    // elements.
	    matrix.e = matrix.e + scrollLeft;
	    matrix.f = matrix.f + scrollTop;
	    point.x = x; //+ scrollLeft
	    point.y = y; //+ scrollTop

	    bbox.nw = point.matrixTransform(matrix);
	    point.x = point.x + width;
	    bbox.ne = point.matrixTransform(matrix);
	    point.y = point.y + height;
	    bbox.se = point.matrixTransform(matrix);
	    point.x = point.x - width;
	    bbox.sw = point.matrixTransform(matrix);
	    point.y = point.y - height / 2;
	    bbox.w = point.matrixTransform(matrix);
	    point.x = point.x + width;
	    bbox.e = point.matrixTransform(matrix);
	    point.x = point.x - width / 2;
	    point.y = point.y - height / 2;
	    bbox.n = point.matrixTransform(matrix);
	    point.y = point.y + height;
	    bbox.s = point.matrixTransform(matrix);

	    return bbox;
	  }

	  // only fade tips if you are still hovering on the current tip
	  function fade_tips(inst_selection) {

	    var is_hovering = d3.select(inst_selection).classed('hovering');

	    if (is_hovering) {
	      d3.selectAll('.d3-tip').transition().duration(250).style('opacity', 0).style('display', 'none');
	    }
	  }

	  function isFunction(functionToCheck) {
	    var getType = {};
	    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	  }

	  return tip;
	};

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_labels = __webpack_require__(52);

	module.exports = function make_row_label_container(cgm, text_delay) {

	  var params = cgm.params;

	  var row_container;

	  // row container holds all row text and row visualizations (triangles rects)
	  ////////////////////////////////////////////////////////////////////////////
	  if (d3.select(params.viz.viz_svg + ' .row_container').empty()) {
	    row_container = d3.select(params.viz.viz_svg).append('g').classed('row_container', true).attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' + params.viz.clust.margin.top + ')');
	  } else {
	    row_container = d3.select(params.viz.viz_svg).select('.row_container').attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' + params.viz.clust.margin.top + ')');
	  }

	  if (d3.select(params.root + ' .row_white_background').empty()) {
	    row_container.append('rect').classed('row_white_background', true).classed('white_bars', true).attr('fill', params.viz.background_color).attr('width', params.viz.label_background.row).attr('height', 30 * params.viz.clust.dim.height + 'px');
	  }

	  // add container to hold text row labels if not already there
	  if (d3.select(params.root + ' .row_label_container').empty()) {
	    row_container.append('g').classed('row_label_container', true).attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)').append('g').classed('row_label_zoom_container', true);
	  } else {
	    row_container.select(params.root + ' .row_label_container').attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)');
	  }

	  // make row labels in the container
	  ///////////////////////////////////////
	  if (params.viz.ds_level === -1) {
	    make_row_labels(cgm, 'all', text_delay);
	  }
		};

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var add_row_click_hlight = __webpack_require__(53);
	var row_reorder = __webpack_require__(54);
	var make_row_tooltips = __webpack_require__(68);

	module.exports = function make_row_labels(cgm) {
	  var row_names = arguments.length <= 1 || arguments[1] === undefined ? 'all' : arguments[1];
	  var text_delay = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];


	  // console.log('make_row_labels')
	  // console.log(row_names)

	  var params = cgm.params;
	  var row_nodes = [];

	  if (row_names === 'all') {
	    row_nodes = params.network_data.row_nodes;
	  } else {
	    _.each(params.network_data.row_nodes, function (inst_row) {
	      if (_.contains(row_names, inst_row.name)) {
	        row_nodes.push(inst_row);
	      }
	    });
	  }

	  // make row labels in row_label_zoom_container, bind row_nodes data
	  var row_labels = d3.select(params.root + ' .row_label_zoom_container').selectAll('g').data(row_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').classed('row_label_group', true);

	  var row_nodes_names = params.network_data.row_nodes_names;
	  row_labels.attr('transform', function (d) {
	    // var inst_index = d.row_index;
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	  });

	  row_labels.on('dblclick', function (d) {

	    var data_attr = '__data__';
	    var row_name = this[data_attr].name;

	    // if (params.sim_mat){
	    //   row_reorder(cgm, this, row_name);

	    //   d3.selectAll(params.root+' .col_label_text')
	    //     .filter(function(d){
	    //       return d.name == row_name;}
	    //       )[0][0];

	    //   // this is causing buggyness may reenable
	    //   // col_reorder -> two_translate_zoom -> show_visible_area -> make_row_labels -> col_reorder
	    //   // col_reorder(cgm, col_selection, row_name);

	    // } else {
	    //   row_reorder(cgm, this, row_name);
	    // }

	    row_reorder(cgm, this, row_name);

	    if (params.tile_click_hlight) {
	      add_row_click_hlight(this, d.ini);
	    }
	  });

	  make_row_tooltips(params);

	  // append rectangle behind text
	  row_labels.insert('rect').style('opacity', 0);

	  // append row label text
	  row_labels.append('text').attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35).attr('text-anchor', 'end').style('font-size', params.labels.default_fs_row + 'px').text(function (d) {
	    return utils.normal_name(d);
	  }).attr('pointer-events', 'none').style('opacity', 0).style('cursor', 'default').transition().delay(text_delay).duration(text_delay).style('opacity', 1);

	  // change the size of the highlighting rects
	  row_labels.each(function () {
	    var bbox = d3.select(this).select('text')[0][0].getBBox();
	    d3.select(this).select('rect').attr('x', bbox.x).attr('y', 0).attr('width', bbox.width).attr('height', params.viz.y_scale.rangeBand()).style('fill', function () {
	      var inst_hl = 'yellow';
	      return inst_hl;
	    }).style('opacity', function (d) {
	      var inst_opacity = 0;
	      // highlight target genes
	      if (d.target === 1) {
	        inst_opacity = 1;
	      }
	      return inst_opacity;
	    });
	  });

	  // almost-deprecated row value bars
	  ///////////////////////////////
	  if (utils.has(params.network_data.row_nodes[0], 'value')) {

	    row_labels.append('rect').classed('row_bars', true).attr('width', function (d) {
	      var inst_value = 0;
	      inst_value = params.labels.bar_scale_row(Math.abs(d.value));
	      return inst_value;
	    }).attr('x', function (d) {
	      var inst_value = 0;
	      inst_value = -params.labels.bar_scale_row(Math.abs(d.value));
	      return inst_value;
	    }).attr('height', params.viz.y_scale.rangeBand()).attr('fill', function (d) {
	      return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
	    }).attr('opacity', 0.4);
	  }
		};

/***/ },
/* 53 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params, clicked_row, id_clicked_row) {
	  if (id_clicked_row != params.click_hlight_row) {

	    var rel_width_hlight = 6;
	    var opacity_hlight = 0.85;
	    // var hlight_width  = rel_width_hlight*params.viz.border_width;
	    var hlight_height = rel_width_hlight * params.viz.border_width.x; // /params.viz.zoom_switch;

	    d3.selectAll(params.root + ' .click_hlight').remove();

	    // // highlight selected row
	    // d3.selectAll(params.root+' .row_label_group')
	    //   .select('rect')
	    // d3.select(this)
	    //   .select('rect')
	    //   .style('opacity', 1);

	    d3.select(clicked_row).append('rect').classed('click_hlight', true).classed('row_top_hlight', true).attr('width', params.viz.svg_dim.width).attr('height', hlight_height).attr('fill', params.matrix.hlight_color).attr('opacity', opacity_hlight);

	    d3.select(clicked_row).append('rect').classed('click_hlight', true).classed('row_bottom_hlight', true).attr('width', params.viz.svg_dim.width).attr('height', hlight_height).attr('fill', params.matrix.hlight_color).attr('opacity', opacity_hlight).attr('transform', function () {
	      var tmp_translate_y = params.viz.y_scale.rangeBand() - hlight_height;
	      return 'translate(0,' + tmp_translate_y + ')';
	    });
	  } else {
	    d3.selectAll(params.root + ' .click_hlight').remove();
	    params.click_hlight_row = -666;
	  }
		};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var reposition_tile_highlight = __webpack_require__(55);
	var toggle_dendro_view = __webpack_require__(56);
	var ini_zoom_info = __webpack_require__(38);
	var get_previous_zoom = __webpack_require__(67);
	var calc_downsampled_levels = __webpack_require__(33);

	module.exports = function row_reorder(cgm, row_selection, inst_row) {

	  var params = cgm.params;
	  var prev_zoom = get_previous_zoom(params);

	  if (prev_zoom.zoom_y === 1 && prev_zoom.zoom_x === 1) {

	    params.viz.inst_order.row = 'custom';
	    toggle_dendro_view(cgm, 'col');

	    d3.selectAll(params.root + ' .toggle_col_order .btn').classed('active', false);

	    params.viz.run_trans = true;

	    var mat = $.extend(true, {}, params.matrix.matrix);
	    var row_nodes = params.network_data.row_nodes;
	    var col_nodes = params.network_data.col_nodes;

	    // find the index of the row
	    var tmp_arr = [];
	    row_nodes.forEach(function (node) {
	      tmp_arr.push(node.name);
	    });

	    // find index
	    inst_row = _.indexOf(tmp_arr, inst_row);

	    // gather the values of the input genes
	    tmp_arr = [];
	    col_nodes.forEach(function (node, index) {
	      tmp_arr.push(mat[inst_row].row_data[index].value);
	    });

	    // sort the rows
	    var tmp_sort = d3.range(tmp_arr.length).sort(function (a, b) {
	      return tmp_arr[b] - tmp_arr[a];
	    });

	    // resort cols (cols are reorderd by double clicking a row)
	    params.viz.x_scale.domain(tmp_sort);

	    // save to custom col order
	    params.matrix.orders.custom_row = tmp_sort;

	    // reorder matrix
	    ////////////////////
	    var t;
	    if (params.network_data.links.length > params.matrix.def_large_matrix) {
	      t = d3.select(params.root + ' .viz_svg');
	    } else {
	      t = d3.select(params.root + ' .viz_svg').transition().duration(2500);
	    }

	    var col_nodes_names = params.network_data.col_nodes_names;

	    // Move Col Labels
	    t.select('.col_zoom_container').selectAll('.col_label_text').attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ')rotate(-90)';
	    });

	    // reorder col_class groups
	    t.selectAll('.col_cat_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });

	    // reorder tiles in matrix (do not change row order)
	    if (params.viz.ds_level === -1) {
	      t.selectAll('.tile').attr('transform', function (d) {
	        return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
	      });

	      t.selectAll('.tile_up').attr('transform', function (d) {
	        return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
	      });

	      t.selectAll('.tile_dn').attr('transform', function (d) {
	        return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
	      });
	    }

	    // highlight selected row
	    ///////////////////////////////
	    // unhilight and unbold all columns (already unbolded earlier)
	    d3.selectAll(params.root + ' .row_label_group').select('rect').style('opacity', 0);
	    // highlight column name
	    d3.select(row_selection).select('rect').style('opacity', 1);

	    reposition_tile_highlight(params);

	    // redefine x and y positions
	    params.network_data.links.forEach(function (d) {
	      d.x = params.viz.x_scale(d.target);
	      d.y = params.viz.y_scale(d.source);
	    });

	    params.zoom_info = ini_zoom_info();

	    setTimeout(function () {
	      params.viz.run_trans = false;
	    }, 2500);

	    // calculate downsmapling if necessary
	    if (params.viz.ds_num_levels > 0 && params.viz.ds_level >= 0) {

	      calc_downsampled_levels(params);

	      // var zooming_stopped = true;
	      // var zooming_out = true;
	      // var make_all_rows = true;
	      // // show_visible_area is also run with two_translate_zoom, but at that point
	      // // the parameters were not updated and two_translate_zoom if only run
	      // // if needed to reset zoom
	      // show_visible_area(cgm, zooming_stopped, zooming_out, make_all_rows);
	    }
	  }
		};

/***/ },
/* 55 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params) {

	  // resize click hlight
	  var rel_width_hlight = 6;
	  // var opacity_hlight = 0.85;

	  var hlight_width = rel_width_hlight * params.viz.border_width.x;
	  var hlight_height = rel_width_hlight * params.viz.border_width.y; ///params.viz.zoom_switch;
	  // reposition tile highlight
	  ////////////////////////////////

	  // top highlight
	  d3.select(params.root + ' .top_hlight').attr('width', params.viz.x_scale.rangeBand()).attr('height', hlight_height).transition().duration(2500).attr('transform', function () {
	    return 'translate(' + params.viz.x_scale(params.matrix.click_hlight_x) + ',0)';
	  });

	  // left highlight
	  d3.select(params.root + ' .left_hlight').attr('width', hlight_width).attr('height', params.viz.y_scale.rangeBand() - hlight_height * 0.99).transition().duration(2500).attr('transform', function () {
	    return 'translate(' + params.viz.x_scale(params.matrix.click_hlight_x) + ',' + hlight_height * 0.99 + ')';
	  });

	  // right highlight
	  d3.select(params.root + ' .right_hlight').attr('width', hlight_width).attr('height', params.viz.y_scale.rangeBand() - hlight_height * 0.99).transition().duration(2500).attr('transform', function () {
	    var tmp_translate = params.viz.x_scale(params.matrix.click_hlight_x) + params.viz.x_scale.rangeBand() - hlight_width;
	    return 'translate(' + tmp_translate + ',' + hlight_height * 0.99 + ')';
	  });

	  // bottom highlight
	  d3.select(params.root + ' .bottom_hlight').attr('width', function () {
	    return params.viz.x_scale.rangeBand() - 1.98 * hlight_width;
	  }).attr('height', hlight_height).transition().duration(2500).attr('transform', function () {
	    var tmp_translate_x = params.viz.x_scale(params.matrix.click_hlight_x) + hlight_width * 0.99;
	    var tmp_translate_y = params.viz.y_scale.rangeBand() - hlight_height;
	    return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
	  });
		};

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_dendro_triangles = __webpack_require__(57);

	module.exports = function toggle_dendro_view(cgm, inst_rc) {
	  var wait_time = arguments.length <= 2 || arguments[2] === undefined ? 1500 : arguments[2];


	  var params = cgm.params;

	  // row and col are reversed
	  if (inst_rc === 'row') {
	    if (params.viz.inst_order.col === 'clust') {
	      // the last true tells the viz that I'm chaning group size and not to
	      // delay the change in dendro
	      setTimeout(make_dendro_triangles, wait_time, cgm, 'row', true);
	    }
	  }

	  if (inst_rc === 'col') {
	    if (params.viz.inst_order.row === 'clust') {
	      setTimeout(make_dendro_triangles, wait_time, cgm, 'col', true);
	    }
	  }

	  if (params.viz.inst_order.row != 'clust' && params.viz.dendro_filter.col === false) {
	    d3.selectAll(params.root + ' .col_dendro_group').style('opacity', 0).on('mouseover', null).on('mouseout', null);

	    d3.select(params.root + ' .col_slider_group').style('opacity', 0);

	    // toggle crop buttons
	    d3.selectAll(params.root + ' .col_dendro_crop_buttons').style('opacity', 0).on('mouseover', null).on('mouseout', null);
	  }

	  if (params.viz.inst_order.col != 'clust' && params.viz.dendro_filter.row === false) {

	    d3.selectAll(params.root + ' .row_dendro_group').style('opacity', 0).on('mouseover', null).on('mouseout', null).on('click', null);

	    d3.select(params.root + ' .row_slider_group').style('opacity', 0);

	    // toggle crop buttons
	    d3.selectAll(params.root + ' .row_dendro_crop_buttons').style('opacity', 0).on('mouseover', null).on('mouseout', null);
	  }
	};

/***/ },
/* 57 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_row_dendro_triangles = __webpack_require__(58);
	var calc_col_dendro_triangles = __webpack_require__(59);
	var dendro_group_highlight = __webpack_require__(60);
	var d3_tip_custom = __webpack_require__(50);
	var make_dendro_crop_buttons = __webpack_require__(62);
	var make_cat_breakdown_graph = __webpack_require__(65);

	module.exports = function make_dendro_triangles(cgm, inst_rc) {
	  var is_change_group = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  var params = cgm.params;

	  // in case sim_mat
	  if (inst_rc === 'both') {
	    inst_rc = 'row';
	  }

	  var other_rc;
	  if (inst_rc === 'row') {
	    other_rc = 'col';
	  } else {
	    other_rc = 'row';
	  }

	  // orders are switched!
	  if (params.viz.inst_order[other_rc] === 'clust') {
	    d3.select(params.root + ' .' + inst_rc + '_slider_group').style('opacity', 1);
	  }

	  var dendro_info;

	  if (inst_rc === 'row') {
	    dendro_info = calc_row_dendro_triangles(params);
	  } else {
	    dendro_info = calc_col_dendro_triangles(params);
	  }

	  if (d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_crop_buttons').empty() === false) {
	    make_dendro_crop_buttons(cgm, inst_rc);
	  }

	  // constant dendrogram opacity
	  var inst_dendro_opacity = params.viz.dendro_opacity;

	  function still_hovering(inst_selection, inst_data, i) {

	    if (d3.select(inst_selection).classed('hovering')) {

	      // define where graph should be built
	      var inst_selector = params.viz.root_tips + '_' + inst_rc + '_dendro_tip';

	      // prevent mouseover from making multiple graphs
	      if (d3.select(inst_selector + ' .cat_graph').empty()) {

	        if (params.viz.cat_info[inst_rc] !== null) {
	          make_cat_breakdown_graph(params, inst_rc, inst_data, dendro_info[i], inst_selector, true);
	        }
	      }

	      d3.selectAll(params.viz.root_tips + '_' + inst_rc + '_dendro_tip').style('opacity', 1);
	    }
	  }

	  var wait_before_tooltip = 500;

	  // remove any old dendro tooltips from this visualization
	  d3.selectAll(cgm.params.viz.root_tips + '_' + inst_rc + '_dendro_tip').remove();

	  // run transition rules
	  var run_transition;
	  if (d3.selectAll(params.root + ' .' + inst_rc + '_dendro_group').empty()) {
	    run_transition = false;
	  } else {
	    run_transition = true;
	    d3.selectAll(params.root + ' .' + inst_rc + '_dendro_group').remove();
	    // d3.selectAll(params.root+' .dendro_tip').remove();
	  }

	  // d3-tooltip
	  var tmp_y_offset = 0;
	  var tmp_x_offset = -5;
	  var dendro_tip = d3_tip_custom().attr('class', function () {
	    // add root element to class
	    var root_tip_selector = params.viz.root_tips.replace('.', '');
	    var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_' + inst_rc + '_dendro_tip';

	    return class_string;
	  }).direction('nw').offset([tmp_y_offset, tmp_x_offset]).style('display', 'block').style('opacity', 0);

	  dendro_tip.html(function () {
	    var full_string = '<div class="cluster_info_container"></div>Click for cluster information <br>' + 'and additional options.';
	    return full_string;
	  });

	  if (is_change_group) {
	    run_transition = false;
	  }

	  var dendro_traps = d3.select(params.root + ' .' + inst_rc + '_dendro_container').selectAll('path').data(dendro_info, function (d) {
	    return d.name;
	  }).enter().append('path').style('opacity', 0).attr('class', inst_rc + '_dendro_group').style('fill', 'black');

	  // draw triangles (shown as trapezoids)
	  //////////////////////////////////////////
	  var start_x;
	  var start_y;
	  var mid_x;
	  var mid_y;
	  var final_x;
	  var final_y;

	  // row triangles
	  dendro_traps.attr('d', function (d) {

	    if (inst_rc === 'row') {
	      // row triangles
	      start_x = 0;
	      start_y = d.pos_top;
	      mid_x = 30;
	      mid_y = d.pos_mid;
	      final_x = 0;
	      final_y = d.pos_bot;
	    } else {
	      // column triangles
	      start_x = d.pos_top;
	      start_y = 0;
	      mid_x = d.pos_mid;
	      mid_y = 30;
	      final_x = d.pos_bot;
	      final_y = 0;
	    }

	    var output_string = 'M' + start_x + ',' + start_y + ', L' + mid_x + ', ' + mid_y + ', L' + final_x + ',' + final_y + ' Z';
	    return output_string;
	  });

	  dendro_traps.on('mouseover', function (d, i) {

	    // if (params.sim_mat){
	    //   inst_rc = 'both';
	    // }

	    // run instantly on mouseover
	    d3.select(this).classed('hovering', true);

	    if (cgm.params.dendro_callback != null) {
	      cgm.params.dendro_callback(this);
	    }

	    // display tip
	    // this is needed for it to show in the right place and the opacity
	    // will be toggled to delay the tooltip for the user
	    d3.select(params.viz.root_tips + '_' + inst_rc + '_dendro_tip').style('display', 'block');

	    dendro_group_highlight(params, this, d, inst_rc);

	    // show the tip (make sure it is displaying before it is shown)
	    dendro_tip.show(d);

	    // set opacity to zero
	    d3.select(params.viz.root_tips + '_' + inst_rc + '_dendro_tip').style('opacity', 0);

	    // check if still hovering
	    setTimeout(still_hovering, wait_before_tooltip, this, d, i);
	  }).on('mouseout', function () {
	    if (params.viz.inst_order[other_rc] === 'clust') {
	      d3.select(this).style('opacity', inst_dendro_opacity);
	    }

	    d3.selectAll(params.root + ' .dendro_shadow').remove();

	    d3.select(this).classed('hovering', false);
	    dendro_tip.hide(this);
	  }).on('click', function (d, i) {

	    $(params.root + ' .dendro_info').modal('toggle');

	    var group_string = d.all_names.join(', ');
	    d3.select(params.root + ' .dendro_info input').attr('value', group_string);

	    var inst_selector = '.dendro_info';

	    // remove old graphs
	    d3.select('.dendro_info .cluster_info_container .cat_graph').remove();

	    if (params.viz.cat_info[inst_rc] !== null) {
	      make_cat_breakdown_graph(params, inst_rc, d, dendro_info[i], inst_selector);
	    }
	  }).call(dendro_tip);

	  var triangle_opacity;
	  if (params.viz.inst_order[other_rc] === 'clust') {
	    triangle_opacity = inst_dendro_opacity;
	  } else {
	    triangle_opacity = 0;
	  }

	  if (run_transition) {

	    d3.select(params.root + ' .' + inst_rc + '_dendro_container').selectAll('path').transition().delay(1000).duration(1000).style('opacity', triangle_opacity);
	  } else {

	    d3.select(params.root + ' .' + inst_rc + '_dendro_container').selectAll('path').style('opacity', triangle_opacity);
	  }
		};

/***/ },
/* 58 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function calc_row_dendro_triangles(params) {

	  var triangle_info = {};
	  var inst_level = params.group_level.row;
	  var row_nodes = params.network_data.row_nodes;
	  var row_nodes_names = params.network_data.row_nodes_names;

	  _.each(row_nodes, function (d) {

	    // console.log('row_node '+d.name)

	    var tmp_group = d.group[inst_level];
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    var inst_top = params.viz.y_scale(inst_index);
	    var inst_bot = inst_top + params.viz.y_scale.rangeBand();

	    if (_.has(triangle_info, tmp_group) === false) {
	      triangle_info[tmp_group] = {};
	      triangle_info[tmp_group].name_top = d.name;
	      triangle_info[tmp_group].name_bot = d.name;
	      triangle_info[tmp_group].pos_top = inst_top;
	      triangle_info[tmp_group].pos_bot = inst_bot;
	      triangle_info[tmp_group].pos_mid = (inst_top + inst_bot) / 2;
	      triangle_info[tmp_group].name = tmp_group;
	      triangle_info[tmp_group].all_names = [];
	      triangle_info[tmp_group].inst_rc = 'row';
	    }

	    triangle_info[tmp_group].all_names.push(d.name);

	    if (inst_top < triangle_info[tmp_group].pos_top) {
	      triangle_info[tmp_group].name_top = d.name;
	      triangle_info[tmp_group].pos_top = inst_top;
	      triangle_info[tmp_group].pos_mid = (inst_top + triangle_info[tmp_group].pos_bot) / 2;
	    }

	    if (inst_bot > triangle_info[tmp_group].pos_bot) {
	      triangle_info[tmp_group].name_bot = d.name;
	      triangle_info[tmp_group].pos_bot = inst_bot;
	      triangle_info[tmp_group].pos_mid = (triangle_info[tmp_group].pos_top + inst_bot) / 2;
	    }
	  });

	  var group_info = [];

	  _.each(triangle_info, function (d) {
	    group_info.push(d);
	  });

	  return group_info;
	};

/***/ },
/* 59 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function calc_col_dendro_triangles(params) {

	  var triangle_info = {};
	  var inst_level = params.group_level.col;
	  var col_nodes = params.network_data.col_nodes;
	  var col_nodes_names = params.network_data.col_nodes_names;

	  _.each(col_nodes, function (d) {

	    var tmp_group = d.group[inst_level];
	    var inst_index = _.indexOf(col_nodes_names, d.name);
	    var inst_top = params.viz.x_scale(inst_index);
	    var inst_bot = inst_top + params.viz.x_scale.rangeBand();

	    if (_.has(triangle_info, tmp_group) === false) {
	      triangle_info[tmp_group] = {};
	      triangle_info[tmp_group].name_top = d.name;
	      triangle_info[tmp_group].name_bot = d.name;
	      triangle_info[tmp_group].pos_top = inst_top;
	      triangle_info[tmp_group].pos_bot = inst_bot;
	      triangle_info[tmp_group].pos_mid = (inst_top + inst_bot) / 2;
	      triangle_info[tmp_group].name = tmp_group;
	      triangle_info[tmp_group].all_names = [];
	      triangle_info[tmp_group].inst_rc = 'col';
	    }

	    triangle_info[tmp_group].all_names.push(d.name);

	    if (inst_top < triangle_info[tmp_group].pos_top) {
	      triangle_info[tmp_group].name_top = d.name;
	      triangle_info[tmp_group].pos_top = inst_top;
	      triangle_info[tmp_group].pos_mid = (inst_top + triangle_info[tmp_group].pos_bot) / 2;
	    }

	    if (inst_bot > triangle_info[tmp_group].pos_bot) {
	      triangle_info[tmp_group].name_bot = d.name;
	      triangle_info[tmp_group].pos_bot = inst_bot;
	      triangle_info[tmp_group].pos_mid = (triangle_info[tmp_group].pos_top + inst_bot) / 2;
	    }
	  });

	  var group_info = [];

	  _.each(triangle_info, function (d) {
	    group_info.push(d);
	  });

	  return group_info;
		};

/***/ },
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var dendro_shade_bars = __webpack_require__(61);

	module.exports = function dendro_group_highlight(params, inst_selection, inst_data, inst_rc) {

	  // only make shadows if there is more than one crop button
	  if (d3.selectAll(params.root + ' .' + inst_rc + '_dendro_crop_buttons')[0].length > 1) {
	    setTimeout(still_hovering, 500);
	  } else {
	    d3.selectAll(params.root + ' .dendro_shadow').remove();
	  }

	  function still_hovering() {

	    // check that user is still hovering over dendrogram group
	    if (d3.select(inst_selection).classed('hovering')) {

	      // check that user is not using dendrogram slider
	      if (params.is_slider_drag === false) {

	        d3.select(inst_selection).style('opacity', 0.7);

	        make_shadow_bars();
	      }
	    }
	  }

	  function make_shadow_bars() {

	    if (inst_rc === 'row') {

	      // row and col labling are reversed
	      if (params.viz.inst_order.col === 'clust') {
	        dendro_shade_bars(params, inst_selection, inst_rc, inst_data);
	      }
	    } else if (inst_rc === 'col') {

	      // row and col labeling are reversed
	      if (params.viz.inst_order.row === 'clust') {
	        dendro_shade_bars(params, inst_selection, inst_rc, inst_data);
	      }
	    } else if (inst_rc === 'both') {

	      if (params.viz.inst_order.col === 'clust') {
	        dendro_shade_bars(params, inst_selection, 'row', inst_data);
	      }
	      if (params.viz.inst_order.row === 'clust') {
	        dendro_shade_bars(params, inst_selection, 'col', inst_data);
	      }
	    }
	  }
	};

/***/ },
/* 61 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function dendro_shade_bars(params, inst_selection, inst_rc, inst_data) {

	  var inst_opacity = 0.2;
	  var bot_height;

	  d3.selectAll(params.root + ' .dendro_shadow').remove();

	  if (inst_rc == 'row') {

	    // top shade
	    d3.select(params.root + ' .clust_group').append('rect').style('width', params.viz.clust.dim.width + 'px').style('height', inst_data.pos_top + 'px').style('fill', 'black').classed('dendro_shadow', true).style('opacity', inst_opacity);

	    bot_height = params.viz.clust.dim.height - inst_data.pos_bot;
	    // bottom shade
	    d3.select(params.root + ' .clust_group').append('rect').style('width', params.viz.clust.dim.width + 'px').style('height', bot_height + 'px').attr('transform', 'translate(0,' + inst_data.pos_bot + ')').style('fill', 'black').classed('dendro_shadow', true).style('opacity', inst_opacity);
	  } else if (inst_rc === 'col') {

	    // top shade
	    d3.select(params.root + ' .clust_group').append('rect').style('width', inst_data.pos_top + 'px').style('height', params.viz.clust.dim.height + 'px').style('fill', 'black').classed('dendro_shadow', true).style('opacity', inst_opacity);

	    // bottom shade
	    bot_height = params.viz.clust.dim.width - inst_data.pos_bot;
	    d3.select(params.root + ' .clust_group').append('rect').style('width', bot_height + 'px').style('height', params.viz.clust.dim.height + 'px').attr('transform', 'translate(' + inst_data.pos_bot + ',0)').style('fill', 'black').classed('dendro_shadow', true).style('opacity', inst_opacity);
	  }
		};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_row_dendro_triangles = __webpack_require__(58);
	var calc_col_dendro_triangles = __webpack_require__(59);
	var d3_tip_custom = __webpack_require__(50);
	var dendro_group_highlight = __webpack_require__(60);
	var run_dendro_filter = __webpack_require__(63);
	var zoom_crop_triangles = __webpack_require__(64);

	module.exports = function make_dendro_crop_buttons(cgm, inst_rc) {

	  var params = cgm.params;

	  var button_opacity = params.viz.dendro_opacity * 0.60;

	  // information needed to make dendro
	  var dendro_info;
	  var other_rc;
	  if (inst_rc === 'row') {
	    dendro_info = calc_row_dendro_triangles(params);
	    other_rc = 'col';
	  } else {
	    dendro_info = calc_col_dendro_triangles(params);
	    other_rc = 'row';
	  }

	  // d3-tooltip
	  var tmp_y_offset = 0;
	  var tmp_x_offset = -5;
	  var dendro_crop_tip = d3_tip_custom().attr('class', function () {
	    var root_tip_selector = params.viz.root_tips.replace('.', '');
	    var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_' + inst_rc + '_dendro_crop_tip';

	    return class_string;
	  }).direction('nw').offset([tmp_y_offset, tmp_x_offset]);

	  var wait_before_tooltip = 500;

	  d3.selectAll(params.viz.root_tips + '_' + inst_rc + '_dendro_crop_tip').remove();
	  d3.selectAll(params.root + ' .' + inst_rc + '_dendro_crop_buttons').remove();

	  var icons;
	  // position triangles
	  var start_x;
	  var start_y;
	  var mid_x;
	  var mid_y;
	  var final_x;
	  var final_y;

	  // need to improve to account for zooming
	  var min_tri_height = 45;
	  var scale_down_tri = 0.25;
	  var tri_height;
	  var tri_width;
	  var tri_dim;

	  // make crop buttons or undo buttons
	  var button_class = inst_rc + '_dendro_crop_buttons';
	  if (d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_icons_group').classed('ran_filter') === false) {

	    // Crop Triangle
	    //////////////////////////////
	    icons = d3.select(params.root + ' .' + inst_rc + '_dendro_icons_group').selectAll('path').data(dendro_info, function (d) {
	      return d.name;
	    }).enter().append('path').classed(button_class, true).attr('d', function (d) {

	      // redefine
	      tri_height = 10;
	      tri_width = 10;

	      var tmp_height = d.pos_bot - d.pos_top;

	      // Row Dendrogram Crop Triangle
	      if (inst_rc === 'row') {

	        if (tmp_height < min_tri_height) {
	          tri_height = tmp_height * scale_down_tri;
	        }

	        // pointing left
	        start_x = tri_width;
	        start_y = -tri_height;
	        mid_x = 0;
	        mid_y = 0;
	        final_x = tri_width;
	        final_y = tri_height;

	        tri_dim = tri_height;

	        // Column Dendrogram Crop Triangle
	      } else {

	        if (tmp_height < min_tri_height) {
	          tri_width = tmp_height * scale_down_tri;
	        }

	        // pointing upward
	        start_x = -tri_width;
	        start_y = tri_height;
	        mid_x = 0;
	        mid_y = 0;
	        final_x = tri_width;
	        final_y = tri_height;

	        tri_dim = tri_width;
	      }

	      // save triangle height
	      // d3.select(this)[0][0].__data__.tri_dim = tri_dim;
	      var data_key = '__data__';
	      d3.select(this)[0][0][data_key].tri_dim = tri_dim;

	      var output_string = 'M' + start_x + ',' + start_y + ', L' + mid_x + ', ' + mid_y + ', L' + final_x + ',' + final_y + ' Z';

	      return output_string;
	    });

	    dendro_crop_tip.html(function () {
	      var full_string = 'Click to crop cluster';
	      return full_string;
	    });
	  } else {

	    // Undo Triangle
	    //////////////////////////////
	    icons = d3.select(params.root + ' .' + inst_rc + '_dendro_icons_group').selectAll('path').data(dendro_info, function (d) {
	      return d.name;
	    }).enter().append('path').classed(button_class, true).attr('d', function (d) {

	      // redefine
	      tri_height = 10;
	      tri_width = 12;

	      var tmp_height = d.pos_bot - d.pos_top;

	      if (inst_rc === 'row') {

	        if (tmp_height < min_tri_height) {
	          tri_height = tmp_height * scale_down_tri;
	        }

	        // pointing right
	        start_x = 0;
	        start_y = -tri_height;
	        mid_x = tri_width;
	        mid_y = 0;
	        final_x = 0;
	        final_y = tri_height;
	      } else {

	        if (tmp_height < min_tri_height) {
	          tri_width = tmp_height * scale_down_tri;
	        }

	        // pointing downward
	        start_x = -tri_width;
	        start_y = 0;
	        mid_x = 0;
	        mid_y = tri_height;
	        final_x = tri_width;
	        final_y = 0;
	      }

	      // save triangle height
	      var data_key = '__data__';
	      d3.select(this)[0][0][data_key].tri_dim = 10;

	      var output_string = 'M' + start_x + ',' + start_y + ', L' + mid_x + ', ' + mid_y + ', L' + final_x + ',' + final_y + ' Z';

	      return output_string;
	    });

	    dendro_crop_tip.html(function () {
	      var full_string = 'Click to undo crop';
	      return full_string;
	    });
	  }

	  icons.style('cursor', 'pointer').style('opacity', function () {

	    var inst_opacity;

	    // if (d3.select(this).classed('hide_crop')){
	    //   inst_opacity = 0;
	    // } else {
	    //   inst_opacity = button_opacity;
	    // }

	    inst_opacity = button_opacity;
	    return inst_opacity;
	  }).attr('transform', function (d) {
	    var inst_translate;

	    var inst_x;
	    var inst_y;

	    if (inst_rc === 'row') {
	      inst_x = params.viz.uni_margin;
	      inst_y = d.pos_mid;
	    } else {
	      inst_x = d.pos_mid;
	      inst_y = params.viz.uni_margin;
	    }

	    inst_translate = 'translate(' + inst_x + ',' + inst_y + ')';
	    return inst_translate;
	  }).on('mouseover', function (d) {

	    d3.select(this).classed('hovering', true);

	    dendro_crop_tip.show(d);

	    dendro_group_highlight(params, this, d, inst_rc);

	    // display with zero opacity
	    d3.selectAll(params.viz.root_tips + '_' + inst_rc + '_dendro_crop_tip').style('opacity', 0).style('display', 'block');

	    // check if still hovering
	    setTimeout(still_hovering, wait_before_tooltip, this);
	  }).on('mouseout', function () {

	    d3.select(this).classed('hovering', false);

	    d3.selectAll(params.root + ' .dendro_shadow').remove();

	    d3.select(this).style('opacity', button_opacity);

	    dendro_crop_tip.hide(this);
	  }).on('click', function (d) {

	    // give user visual cue
	    d3.select(this).style('opacity', 0.9).transition().duration(1000).style('opacity', 0);

	    // remove dendro shadows when clicked
	    d3.selectAll(params.root + ' .dendro_shadow').remove();

	    /* filter using dendrogram */
	    if (cgm.params.dendro_filter.row === false && cgm.params.dendro_filter.col === false && cgm.params.cat_filter.row === false && cgm.params.cat_filter.col === false) {

	      // Run Filtering
	      ///////////////////
	      // use class as 'global' variable
	      d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_icons_group').attr('transform', 'translate(0,0), scale(1,1)').classed('ran_filter', true);

	      d3.select(cgm.params.root + ' .' + other_rc + '_dendro_icons_group').attr('transform', 'translate(0,0), scale(1,1)');

	      // do not display dendrogram slider if filtering has been run
	      d3.select(cgm.params.root + ' .' + inst_rc + '_slider_group').style('display', 'none');

	      // do not display other crop buttons since they are inactive
	      d3.select(cgm.params.root + ' .' + other_rc + '_dendro_icons_container').style('display', 'none');

	      // do not display brush-crop button if performing dendro crop
	      d3.select(cgm.params.root + ' .crop_button').style('opacity', 0.2);
	    } else {

	      // Undo Filtering
	      ///////////////////
	      // use class as 'global' variable
	      d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_icons_group').attr('transform', 'translate(0,0), scale(1,1)').classed('ran_filter', false);

	      d3.select(cgm.params.root + ' .' + other_rc + '_dendro_icons_group').attr('transform', 'translate(0,0), scale(1,1)');

	      if (params.viz.inst_order[other_rc] === 'clust') {
	        // display slider when cropping has not been done
	        d3.select(cgm.params.root + ' .' + inst_rc + '_slider_group').style('display', 'block');
	      }

	      // display other crop buttons when cropping has not been done
	      d3.select(cgm.params.root + ' .' + other_rc + '_dendro_icons_container').style('display', 'block');

	      // display brush-crop button if not performing dendro crop
	      d3.select(cgm.params.root + ' .crop_button').style('opacity', 1);
	    }

	    run_dendro_filter(cgm, d, inst_rc);
	  }).call(dendro_crop_tip);

	  // ordering has been reversed
	  if (params.viz.inst_order[other_rc] != 'clust') {
	    // do not display if not in cluster order
	    d3.select(params.root + ' .' + inst_rc + '_dendro_icons_group').selectAll('path').style('display', 'none');
	  }

	  function still_hovering(inst_selection) {

	    if (d3.select(inst_selection).classed('hovering')) {
	      // increase opacity
	      d3.selectAll(params.viz.root_tips + '_' + inst_rc + '_dendro_crop_tip').style('opacity', 1).style('display', 'block');
	    }
	  }

	  zoom_crop_triangles(params, params.zoom_info, inst_rc);
		};

/***/ },
/* 63 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function run_dendro_filter(cgm, d, inst_rc) {

	  var names = {};

	  if (cgm.params.dendro_filter.row === false && cgm.params.dendro_filter.col === false && cgm.params.cat_filter.row === false && cgm.params.cat_filter.col === false) {

	    d3.select(cgm.params.root + ' .' + inst_rc + '_slider_group').style('opacity', 0.35).style('pointer-events', 'none');

	    names[inst_rc] = d.all_names;

	    var tmp_names = cgm.params.network_data[inst_rc + '_nodes_names'];

	    // keep a backup of the inst_view
	    var inst_row_nodes = cgm.params.network_data.row_nodes;
	    var inst_col_nodes = cgm.params.network_data.col_nodes;

	    cgm.filter_viz_using_names(names);

	    cgm.params.inst_nodes.row_nodes = inst_row_nodes;
	    cgm.params.inst_nodes.col_nodes = inst_col_nodes;

	    d3.selectAll(cgm.params.root + ' .dendro_shadow').transition().duration(1000).style('opacity', 0).remove();

	    // keep the names of all the nodes
	    cgm.params.dendro_filter[inst_rc] = tmp_names;

	    /* reset filter */
	  } else {

	    names[inst_rc] = cgm.params.dendro_filter[inst_rc];

	    cgm.filter_viz_using_names(names);
	    cgm.params.dendro_filter[inst_rc] = false;
	  }
		};

/***/ },
/* 64 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function zoom_crop_triangles(params, zoom_info, inst_rc) {

	  if (inst_rc === 'row') {

	    // transform icons (undo zoom on triangles)
	    d3.select(params.root + ' .row_dendro_icons_group').selectAll('path').attr('transform', function (d) {
	      var inst_x = params.viz.uni_margin;
	      var inst_y = d.pos_mid;
	      var curr_zoom = zoom_info.zoom_y;
	      var tri_dim = d3.select(this).data()[0].tri_dim;
	      var inst_zoom = constrain_zoom(curr_zoom, tri_dim);
	      return 'translate(' + inst_x + ',' + inst_y + ') ' + 'scale(1, ' + 1 / inst_zoom + ')';
	    });
	  } else {

	    // transform icons (undo zoom on triangles)
	    d3.select(params.root + ' .col_dendro_icons_group').selectAll('path').attr('transform', function (d) {
	      var inst_x = d.pos_mid;
	      var inst_y = params.viz.uni_margin;
	      var curr_zoom = zoom_info.zoom_x;
	      var tri_dim = d3.select(this).data()[0].tri_dim;
	      var inst_zoom = constrain_zoom(curr_zoom, tri_dim);
	      return 'translate(' + inst_x + ',' + inst_y + ') ' + 'scale(' + 1 / inst_zoom + ', 1)';
	    });
	  }

	  function constrain_zoom(curr_zoom, tri_height) {
	    var inst_zoom;
	    var default_tri_height = 10;
	    if (tri_height * curr_zoom < default_tri_height) {
	      inst_zoom = 1;
	    } else {
	      var max_zoom = default_tri_height / tri_height;
	      inst_zoom = curr_zoom / max_zoom;
	    }
	    return inst_zoom;
	  }
		};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_cat_cluster_breakdown = __webpack_require__(66);

	module.exports = function make_cat_breakdown_graph(params, inst_rc, inst_data, dendro_info, selector) {
	  var tooltip = arguments.length <= 5 || arguments[5] === undefined ? false : arguments[5];


	  // in case sim_mat
	  if (inst_rc === 'both') {
	    inst_rc = 'row';
	  }

	  var cat_breakdown = calc_cat_cluster_breakdown(params, inst_data, inst_rc);

	  if (cat_breakdown.length > 0) {

	    // put cluster information in dendro_tip
	    ///////////////////////////////////////////
	    var cluster_info_container = d3.select(selector + ' .cluster_info_container');

	    // loop through cat_breakdown data
	    var super_string = ': ';
	    var paragraph_string = '<p>';
	    var width = 225;
	    var bar_offset = 23;
	    var bar_height = 20;
	    var max_string_length = 15;
	    var bar_width = 135;
	    var title_height = 27;

	    // limit on the number of category types shown
	    var max_cats = 3;
	    // limit the number of bars shown
	    var max_bars = 20;

	    // calculate height needed for svg based don cat_breakdown data
	    var svg_height = 20;
	    _.each(cat_breakdown.slice(0, max_cats), function (tmp_break) {
	      var num_bars = tmp_break.bar_data.length;
	      if (num_bars > max_bars) {
	        num_bars = max_bars;
	      }
	      svg_height = svg_height + title_height * (num_bars + 1);
	    });

	    // Cluster Information Title (for tooltip only not modal)
	    if (tooltip) {
	      cluster_info_container.append('text').text('Cluster Information');
	    }

	    var main_dendro_svg = cluster_info_container.append('div').style('margin-top', '5px').classed('cat_graph', true).append('svg').style('height', svg_height + 'px').style('width', width + 'px');

	    // make background
	    main_dendro_svg.append('rect').classed('cat_background', true).style('height', svg_height + 'px').style('width', width + 'px').style('fill', 'white').style('opacity', 1);

	    // the total amout to shift down the next category
	    var shift_down = title_height;

	    // limit the category-types
	    cat_breakdown = cat_breakdown.slice(0, max_cats);

	    _.each(cat_breakdown, function (cat_data) {

	      // only keep the top 5 categories
	      cat_data.bar_data = cat_data.bar_data.slice(0, max_bars);

	      cluster_info_container.style('margin-bottom', '5px');

	      var cat_graph_group = main_dendro_svg.append('g').classed('cat_graph_group', true).attr('transform', 'translate(10, ' + shift_down + ')');

	      // shift down based on number of bars
	      shift_down = shift_down + title_height * (cat_data.bar_data.length + 1);

	      var inst_title = cat_data.type_name;
	      // ensure that title is not too long
	      if (inst_title.length >= max_string_length) {
	        inst_title = inst_title.slice(0, max_string_length) + '..';
	      }

	      // make title
	      cat_graph_group.append('text').classed('cat_graph_title', true).text(inst_title).style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').style('font-weight', 800);

	      var count_offset = 15;
	      // make P-value title
	      cat_graph_group.append('text').text('Count').attr('transform', function () {
	        var inst_x = bar_width + count_offset;
	        var inst_translate = 'translate(' + inst_x + ', 0)';
	        return inst_translate;
	      });

	      var line_y = 4;
	      cat_graph_group.append('line').attr('x1', 0).attr('x2', bar_width).attr('y1', line_y).attr('y2', line_y).style('stroke', 'blue').style('stroke-width', 1).style('opacity', 1.0);

	      var cat_bar_container = cat_graph_group.append('g').classed('cat_bar_container', true).attr('transform', 'translate(0, 10)');

	      // make bar groups (hold bar and text)
	      var cat_bar_groups = cat_bar_container.selectAll('g').data(cat_data.bar_data).enter().append('g').attr('transform', function (d, i) {
	        var inst_y = i * bar_offset;
	        return 'translate(0,' + inst_y + ')';
	      });

	      var bar_scale = d3.scale.linear()
	      // bar length is max when all nodes in cluster are of
	      // a single cat
	      // .domain([0, cat_data.num_in_clust])
	      // bar length is max based on the max number in one cat
	      .domain([0, cat_data.bar_data[0][2]]).range([0, bar_width]);

	      // make bars
	      cat_bar_groups.append('rect').style('height', bar_height + 'px').style('width', function (d) {
	        var inst_width = bar_scale(d[2]);
	        return inst_width + 'px';
	      }).style('fill', function (d) {
	        // cat color is stored in the third element
	        return d[3];
	      }).style('opacity', params.viz.cat_colors.opacity).style('stroke', 'grey').style('stroke-width', '0.5px');

	      // make bar labels
	      cat_bar_groups.append('text').classed('bar_labels', true).text(function (d) {
	        var inst_text = d[1];
	        if (inst_text.indexOf(super_string) > 0) {
	          inst_text = inst_text.split(super_string)[1];
	        }
	        if (inst_text.indexOf(paragraph_string) > 0) {
	          // required for Enrichr category names (needs improvements)
	          inst_text = inst_text.split(paragraph_string)[0];
	        }
	        // ensure that bar name is not too long
	        if (inst_text.length >= max_string_length) {
	          inst_text = inst_text.slice(0, max_string_length) + '..';
	        }
	        return inst_text;
	      }).attr('transform', function () {
	        return 'translate(5, ' + 0.75 * bar_height + ')';
	      }).style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').style('font-weight', 400);

	      // make bar labels
	      var shift_count_num = 25;
	      cat_bar_groups.append('text').classed('count_labels', true).text(function (d) {
	        return String(d[4]);
	      }).attr('transform', function () {
	        var inst_x = bar_width + count_offset + shift_count_num;
	        var inst_y = 0.75 * bar_height;
	        return 'translate(' + inst_x + ', ' + inst_y + ')';
	      }).style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').style('font-weight', 400).style('text-anchor', 'end');
	    });

	    // reposition tooltip
	    /////////////////////////////////////////////////
	    if (tooltip) {

	      var dendro_tip = d3.select(selector);
	      var old_top = dendro_tip.style('top').split('.px')[0];
	      var old_left = dendro_tip.style('left').split('.px')[0];
	      var shift_top = 0;
	      var shift_left = 0;

	      // shifting
	      if (inst_rc === 'row') {

	        // rows
	        //////////////
	        shift_top = svg_height + 30;
	        shift_left = 32;

	        // prevent graph from being too high
	        if (dendro_info.pos_top < svg_height) {
	          shift_top = -(svg_height + (dendro_info.pos_mid - dendro_info.pos_top) / 2);
	        }
	      } else {

	        // columns
	        //////////////
	        shift_top = svg_height + 32;
	        shift_left = 30;
	      }

	      dendro_tip.style('top', function () {
	        var new_top = String(parseInt(old_top, 10) - shift_top) + 'px';
	        return new_top;
	      }).style('left', function () {
	        var new_left = String(parseInt(old_left, 10) - shift_left) + 'px';
	        return new_left;
	      });
	    }
	  }
		};

/***/ },
/* 66 */
/***/ function(module, exports) {

	'use strict';

	// var run_fisher_exact_clust = require('./run_fisher_exact_clust');

	module.exports = function calc_cat_cluster_breakdown(params, inst_data, inst_rc) {
	  // Category-breakdown of dendrogram-clusters
	  /////////////////////////////////////////////
	  /*
	   1. get information for nodes in cluster
	  2. find category-types that are string-type
	  3. count instances of each category name for each category-type
	   */

	  // in case sim_mat
	  if (inst_rc === 'both') {
	    inst_rc = 'row';
	  }

	  // 1: get information for nodes in cluster
	  ///////////////////////////////////////////

	  // names of nodes in cluster
	  var clust_names = inst_data.all_names;
	  // array of nodes in the cluster
	  var clust_nodes = [];
	  var all_nodes = params.network_data[inst_rc + '_nodes'];

	  // // n: number drawn in cluster
	  // var n = clust_names.length;
	  // // big_n: total number of nodes
	  // var big_n = all_nodes.length;

	  var inst_name;
	  _.each(all_nodes, function (inst_node) {

	    inst_name = inst_node.name;

	    if (clust_names.indexOf(inst_name) >= 0) {
	      clust_nodes.push(inst_node);
	    }
	  });

	  // 2: find category-types that are string-type
	  ///////////////////////////////////////////////

	  var cat_breakdown = [];

	  if (params.viz.cat_info[inst_rc] !== null) {

	    var inst_cat_info = params.viz.cat_info[inst_rc];

	    // tmp list of all categories
	    var tmp_types_index = _.keys(inst_cat_info);
	    // this will hold the indexes of string-type categories
	    var cat_types_index = [];

	    // var inst_node = params.network_data[inst_rc+'_nodes'][0];

	    // get category names (only include string-type categories)
	    var cat_types_names = [];
	    var type_name;
	    var inst_index;
	    var cat_index;
	    for (var i = 0; i < tmp_types_index.length; i++) {

	      cat_index = 'cat-' + String(i);

	      if (params.viz.cat_info[inst_rc][cat_index].type === 'cat_strings') {
	        type_name = params.viz.cat_names[inst_rc][cat_index];
	        cat_types_names.push(type_name);
	        cat_types_index.push(cat_index);
	      }
	    }

	    var tmp_run_count = {};
	    var inst_breakdown = {};
	    var bar_data;
	    var fraction_index = 2;
	    var radix_param = 10;

	    var no_title_given;
	    if (type_name === cat_index) {
	      no_title_given = true;
	    } else {
	      no_title_given = false;
	    }

	    if (cat_types_names.length > 0) {

	      // 3: count instances of each category name for each category-type
	      var cat_name;
	      var num_in_clust = clust_names.length;
	      _.each(cat_types_index, function (cat_index) {

	        inst_index = cat_index.split('-')[1];
	        type_name = cat_types_names[inst_index];

	        if (no_title_given) {
	          if (cat_index.indexOf('-') >= 0) {
	            var tmp_num = parseInt(cat_index.split('-')[1], radix_param) + 1;
	            type_name = 'Category ' + String(tmp_num);
	          } else {
	            // backup behavior
	            type_name = 'Category';
	          }
	        }

	        tmp_run_count[type_name] = {};

	        // loop throught nodes and keep running count of categories
	        _.each(clust_nodes, function (tmp_node) {

	          cat_name = tmp_node[cat_index];

	          if (cat_name.indexOf(': ') >= 0) {
	            cat_name = cat_name.split(': ')[1];
	          }

	          if (cat_name in tmp_run_count[type_name]) {
	            tmp_run_count[type_name][cat_name] = tmp_run_count[type_name][cat_name] + 1; // /num_in_clust;
	          } else {
	            tmp_run_count[type_name][cat_name] = 1; // /num_in_clust;
	          }
	        });

	        inst_breakdown = {};
	        inst_breakdown.type_name = type_name;
	        inst_breakdown.num_in_clust = num_in_clust;

	        // sort cat info in cat_breakdown
	        bar_data = [];
	        var bar_color;
	        var cat_title_and_name;
	        var inst_run_count = tmp_run_count[type_name];

	        for (var inst_cat in inst_run_count) {

	          // if no cat-title given
	          if (no_title_given) {
	            cat_title_and_name = inst_cat;
	          } else {
	            cat_title_and_name = type_name + ': ' + inst_cat;
	          }

	          // k: number of cat-nodes drawn in cluster
	          // var k = parseInt(inst_run_count[inst_cat] * n, 10);
	          var k = inst_run_count[inst_cat];

	          // // big_k: total number of cat-nodes
	          // var big_k = params.viz.cat_info[inst_rc][cat_index].cat_hist[cat_title_and_name];

	          // var ft = parseFloat(run_fisher_exact_clust(k, n, big_k, big_n));

	          bar_color = params.viz.cat_colors[inst_rc][cat_index][cat_title_and_name];

	          bar_data.push([cat_index, cat_title_and_name, inst_run_count[inst_cat], bar_color, k]);
	        }

	        bar_data.sort(function (a, b) {
	          return b[fraction_index] - a[fraction_index];
	        });

	        inst_breakdown.bar_data = bar_data;

	        cat_breakdown.push(inst_breakdown);
	      });
	    }
	  }

	  return cat_breakdown;
	};

/***/ },
/* 67 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function get_previous_zoom(params) {
	  var prev_zoom = {};

	  var inst_trans = d3.select(params.root + ' .clust_group').attr('transform');

	  if (inst_trans != null) {

	    // prevent from crashing if no scaling was done
	    if (inst_trans.indexOf('scale') > 0) {
	      prev_zoom.zoom_x = parseFloat(inst_trans.split('scale')[1].replace('(', '').replace(')', '').split(',')[0]);

	      prev_zoom.zoom_y = parseFloat(inst_trans.split('scale')[1].replace('(', '').replace(')', '').split(',')[1]);
	    } else {
	      prev_zoom.zoom_x = 1;
	      prev_zoom.zoom_y = 1;
	    }
	  } else {
	    prev_zoom.zoom_x = 1;
	    prev_zoom.zoom_y = 1;
	  }

	  return prev_zoom;
		};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d3_tip_custom = __webpack_require__(50);

	module.exports = function make_row_tooltips(params) {

	  if (params.labels.show_label_tooltips) {

	    // remove old tooltips
	    d3.selectAll(params.viz.root_tips + '_row_tip').remove();

	    var root_tip_selector = params.viz.root_tips.replace('.', '');

	    // d3-tooltip
	    var row_tip = d3_tip_custom().attr('class', function () {
	      var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_row_tip';
	      return class_string;
	    }).direction('e').offset([0, 10]).style('display', 'none').html(function (d) {
	      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
	      return "<span>" + inst_name + "</span>";
	    });

	    d3.select(params.viz.viz_wrapper).select(params.root + ' .row_container').call(row_tip);

	    d3.select(params.root + ' .row_label_zoom_container').selectAll('g').on('mouseover', function (d) {

	      d3.select(params.viz.root_tips + '_row_tip').classed(d.name, true);

	      d3.selectAll(params.viz.root_tips + '_row_tip').style('display', 'block');

	      d3.select(this).select('text').classed('active', true);

	      row_tip.show(d);

	      if (params.row_tip_callback != null) {
	        params.row_tip_callback(params.viz.root_tips, d);
	      }
	    }).on('mouseout', function mouseout(d) {

	      d3.selectAll(params.viz.root_tips + '_row_tip').style('display', 'none').classed(d.name, false);

	      d3.select(this).select('text').classed('active', false);

	      row_tip.hide(d);
	    });
	  } else {

	    d3.select(params.root + ' .row_label_zoom_container').selectAll('g').on('mouseover', function () {
	      d3.select(this).select('text').classed('active', true);
	    }).on('mouseout', function mouseout() {
	      d3.select(this).select('text').classed('active', false);
	    });
	  }
		};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var add_col_click_hlight = __webpack_require__(70);
	var col_reorder = __webpack_require__(71);
	var row_reorder = __webpack_require__(54);
	var make_col_tooltips = __webpack_require__(75);
	var col_viz_aid_triangle = __webpack_require__(76);

	module.exports = function make_col_label_container(cgm) {
	  var text_delay = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];


	  var params = cgm.params;
	  var col_container;

	  var col_nodes = params.network_data.col_nodes;

	  // offset click group column label
	  var x_offset_click = params.viz.x_scale.rangeBand() / 2 + params.viz.border_width.x;
	  // reduce width of rotated rects


	  // make container to pre-position zoomable elements
	  if (d3.select(params.root + ' .col_container').empty()) {

	    col_container = d3.select(params.viz.viz_svg).append('g').attr('class', 'col_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.norm_labels.margin.top + ')');

	    // white background rect for col labels
	    col_container.append('rect').attr('fill', params.viz.background_color) //!! prog_colors
	    .attr('width', 30 * params.viz.clust.dim.width + 'px').attr('height', params.viz.label_background.col).attr('class', 'white_bars');

	    // col labels
	    col_container.append('g').attr('class', 'col_label_outer_container')
	    // position the outer col label group
	    .attr('transform', 'translate(0,' + params.viz.norm_labels.width.col + ')').append('g').attr('class', 'col_zoom_container');
	  } else {

	    col_container = d3.select(params.root + ' .col_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.norm_labels.margin.top + ')');

	    // white background rect for col labels
	    col_container.select('.white_bars').attr('fill', params.viz.background_color) //!! prog_colors
	    .attr('width', 30 * params.viz.clust.dim.width + 'px').attr('height', params.viz.label_background.col);

	    // col labels
	    col_container.select(params.root + ' .col_label_outer_container');
	  }

	  // add main column label group
	  var col_label_obj = d3.select(params.root + ' .col_zoom_container').selectAll('.col_label_text').data(col_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'col_label_text').attr('transform', function (d) {
	    var inst_index = d.col_index;
	    return 'translate(' + params.viz.x_scale(inst_index) + ', 0) rotate(-90)';
	  });

	  // append group for individual column label
	  var col_label_group = col_label_obj
	  // append new group for rect and label (not white lines)
	  .append('g').attr('class', 'col_label_group')
	  // rotate column labels
	  .attr('transform', 'translate(' + params.viz.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)').on('mouseover', function () {
	    d3.select(this).select('text').classed('active', true);
	  }).on('mouseout', function () {
	    d3.select(this).select('text').classed('active', false);
	  });

	  // append column value bars
	  if (utils.has(params.network_data.col_nodes[0], 'value')) {

	    col_label_group.append('rect').attr('class', 'col_bars').attr('width', function (d) {
	      var inst_value = 0;
	      if (d.value > 0) {
	        inst_value = params.labels.bar_scale_col(d.value);
	      }
	      return inst_value;
	    })
	    // rotate labels - reduce width if rotating
	    .attr('height', params.viz.x_scale.rangeBand() * 0.66).style('fill', function (d) {
	      return d.value > 0 ? params.matrix.bar_colors[0] : params.matrix.bar_colors[1];
	    }).attr('opacity', 0.6);
	  }

	  // add column label
	  col_label_group.append('text').attr('x', 0)
	  // manually tuned
	  .attr('y', params.viz.x_scale.rangeBand() * 0.64).attr('dx', params.viz.border_width.x).attr('text-anchor', 'start').attr('full_name', function (d) {
	    return d.name;
	  })
	  // original font size
	  .style('font-size', params.labels.default_fs_col + 'px').style('cursor', 'default').text(function (d) {
	    return utils.normal_name(d);
	  })
	  // .attr('pointer-events','none')
	  .style('opacity', 0).transition().delay(text_delay).duration(text_delay).style('opacity', 1);

	  make_col_tooltips(params);

	  // add triangle under rotated labels
	  col_label_group.append('path').style('stroke-width', 0).attr('d', function () {
	    return col_viz_aid_triangle(params);
	  }).attr('fill', '#eee').style('opacity', 0).transition().delay(text_delay).duration(text_delay).style('opacity', params.viz.triangle_opacity);

	  // add col callback function
	  d3.selectAll(params.root + ' .col_label_text').on('click', function (d) {

	    if (typeof params.click_label == 'function') {
	      params.click_label(d.name, 'col');
	      add_col_click_hlight(params, this, d.ini);
	    } else {

	      if (params.tile_click_hlight) {
	        add_col_click_hlight(params, this, d.ini);
	      }
	    }
	  }).on('dblclick', function (d) {

	    var data_attr = '__data__';
	    var col_name = this[data_attr].name;

	    if (params.sim_mat) {
	      col_reorder(cgm, this, col_name);

	      var row_selection = d3.selectAll(params.root + ' .row_label_group').filter(function (d) {
	        return d.name == col_name;
	      })[0][0];

	      row_reorder(cgm, row_selection, col_name);
	    } else {
	      col_reorder(cgm, this, col_name);
	    }

	    if (params.tile_click_hlight) {
	      add_col_click_hlight(params, this, d.ini);
	    }
	  });
		};

/***/ },
/* 70 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params, clicked_col, id_clicked_col) {

	  if (id_clicked_col != params.click_hlight_col) {

	    params.click_hlight_col = id_clicked_col;

	    var rel_width_hlight = 6;
	    var opacity_hlight = 0.85;
	    var hlight_width = rel_width_hlight * params.viz.border_width.x;
	    // var hlight_height = rel_width_hlight*params.viz.border_width/params.viz.zoom_switch;

	    d3.selectAll(params.root + ' .click_hlight').remove();

	    // // highlight selected column
	    // ///////////////////////////////
	    // // unhilight and unbold all columns (already unbolded earlier)
	    // d3.selectAll('.col_label_text')
	    //   .select('rect')
	    //   .style('opacity', 0);
	    // // highlight column name
	    // d3.select(clicked_col)
	    //   .select('rect')
	    //   .style('opacity', 1);

	    d3.select(clicked_col).append('rect').classed('click_hlight', true).classed('col_top_hlight', true).attr('width', params.viz.clust.dim.height).attr('height', hlight_width).attr('fill', params.matrix.hlight_color).attr('opacity', opacity_hlight).attr('transform', function () {
	      var tmp_translate_y = 0;
	      var tmp_translate_x = -(params.viz.clust.dim.height + params.viz.cat_room.col + params.viz.uni_margin);
	      return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
	    });

	    d3.select(clicked_col).append('rect').classed('click_hlight', true).classed('col_bottom_hlight', true).attr('width', params.viz.clust.dim.height).attr('height', hlight_width).attr('fill', params.matrix.hlight_color).attr('opacity', opacity_hlight).attr('transform', function () {
	      // reverse x and y since rotated
	      var tmp_translate_y = params.viz.x_scale.rangeBand() - hlight_width;
	      var tmp_translate_x = -(params.viz.clust.dim.height + params.viz.cat_room.col + params.viz.uni_margin);
	      return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
	    });
	  } else {
	    d3.selectAll(params.root + ' .click_hlight').remove();
	    params.click_hlight_col = -666;
	  }
		};

/***/ },
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// var utils = require('../Utils_clust');
	var reposition_tile_highlight = __webpack_require__(55);
	var toggle_dendro_view = __webpack_require__(56);
	var show_visible_area = __webpack_require__(72);
	var ini_zoom_info = __webpack_require__(38);
	var get_previous_zoom = __webpack_require__(67);
	var calc_downsampled_levels = __webpack_require__(33);

	module.exports = function col_reorder(cgm, col_selection, inst_term) {

	  var params = cgm.params;
	  var prev_zoom = get_previous_zoom(params);

	  if (prev_zoom.zoom_y === 1 && prev_zoom.zoom_x === 1) {

	    params.viz.inst_order.col = 'custom';

	    toggle_dendro_view(cgm, 'col');

	    d3.selectAll(params.root + ' .toggle_row_order .btn').classed('active', false);

	    params.viz.run_trans = true;

	    var mat = $.extend(true, {}, params.matrix.matrix);
	    var row_nodes = params.network_data.row_nodes;
	    var col_nodes = params.network_data.col_nodes;

	    // find the column number of col_selection term from col_nodes
	    // gather column node names
	    var tmp_arr = [];
	    col_nodes.forEach(function (node) {
	      tmp_arr.push(node.name);
	    });

	    // find index
	    var inst_col = _.indexOf(tmp_arr, inst_term);

	    // gather the values of the input genes
	    tmp_arr = [];
	    row_nodes.forEach(function (node, index) {
	      tmp_arr.push(mat[index].row_data[inst_col].value);
	    });

	    // sort the cols
	    var tmp_sort = d3.range(tmp_arr.length).sort(function (a, b) {
	      return tmp_arr[b] - tmp_arr[a];
	    });

	    // resort rows (rows are reorderd by double clicking a col)
	    params.viz.y_scale.domain(tmp_sort);

	    // save to custom row order
	    params.matrix.orders.custom_col = tmp_sort;

	    var t;

	    var row_nodes_names = params.network_data.row_nodes_names;

	    // reorder
	    if (params.network_data.links.length > params.matrix.def_large_matrix) {
	      t = d3.select(params.root + ' .viz_svg');
	    } else {
	      t = d3.select(params.root + ' .viz_svg').transition().duration(2500);
	    }

	    // reorder row_label_triangle groups
	    t.selectAll('.row_cat_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // Move Row Labels
	    t.select('.row_label_zoom_container').selectAll('.row_label_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // only update matri if not downsampled
	    if (params.viz.ds_level === -1) {
	      // reorder matrix rows
	      t.selectAll('.row').attr('transform', function (d) {
	        var inst_index = _.indexOf(row_nodes_names, d.name);
	        return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	      });
	    }

	    // highlight selected column
	    ///////////////////////////////
	    // unhilight and unbold all columns (already unbolded earlier)
	    d3.selectAll(params.root + ' .col_label_text').select('.highlight_rect').style('opacity', 0);
	    // highlight column name
	    d3.select(col_selection).select('.highlight_rect').style('opacity', 1);

	    // redefine x and y positions
	    params.network_data.links.forEach(function (d) {
	      d.x = params.viz.x_scale(d.target);
	      d.y = params.viz.y_scale(d.source);
	    });

	    reposition_tile_highlight(params);

	    params.zoom_info = ini_zoom_info();

	    setTimeout(function () {
	      params.viz.run_trans = false;
	    }, 2500);

	    // calculate downsmapling if necessary
	    if (params.viz.ds_num_levels > 0 && params.viz.ds_level >= 0) {

	      calc_downsampled_levels(params);

	      var zooming_stopped = true;
	      var zooming_out = true;
	      var make_all_rows = true;
	      // show_visible_area is also run with two_translate_zoom, but at that point
	      // the parameters were not updated and two_translate_zoom if only run
	      // if needed to reset zoom
	      show_visible_area(cgm, zooming_stopped, zooming_out, make_all_rows);
	    }
	  }
		};

/***/ },
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var find_viz_rows = __webpack_require__(73);
	var make_matrix_rows = __webpack_require__(43);
	var make_row_labels = __webpack_require__(52);
	var make_row_visual_aid_triangles = __webpack_require__(74);

	module.exports = function show_visible_area(cgm) {
	  var zooming_stopped = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	  var zooming_out = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
	  var make_all_rows = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];


	  // console.log('show_visible_area stopped: ' + String(zooming_stopped));

	  var params = cgm.params;
	  var zoom_info = params.zoom_info;

	  // update ds_level if necessary
	  //////////////////////////////////////////////
	  var check_ds_level = params.viz.ds_level;
	  var old_ds_level = params.viz.ds_level;

	  // toggle the downsampling level (if necessary)
	  if (params.viz.ds === null) {
	    check_ds_level = -1;
	  } else {

	    check_ds_level = Math.floor(Math.log(zoom_info.zoom_y) / Math.log(params.viz.ds_zt));

	    if (check_ds_level > params.viz.ds_num_levels - 1) {
	      check_ds_level = -1;
	    }
	  }

	  // check if override_ds is necessary
	  //////////////////////////////////////////////
	  // force update of view if moving to more coarse view
	  var override_ds = false;

	  if (old_ds_level == -1) {
	    // transitioning to more coarse downsampling view (from real data)
	    if (check_ds_level >= 0) {
	      override_ds = true;
	    }
	  } else {
	    // transitioning to more coarse downsampling view
	    if (check_ds_level < old_ds_level) {
	      override_ds = true;
	    }
	  }

	  // update level if zooming has stopped or if transitioning to more coarse view
	  var new_ds_level;

	  if (zooming_stopped === true || override_ds === true) {

	    // update new_ds_level if necessary (if decreasing detail, zooming out)
	    new_ds_level = check_ds_level;

	    // set zooming_stopped to true in case of override_ds
	    zooming_stopped = true;

	    params.viz.ds_level = new_ds_level;
	  } else {
	    // keep the old level (zooming is still occuring and not zooming out)
	    new_ds_level = old_ds_level;
	  }

	  var viz_area = {};
	  var buffer_size = 5;
	  // get translation vector absolute values
	  viz_area.min_x = Math.abs(zoom_info.trans_x) / zoom_info.zoom_x - (buffer_size + 1) * params.viz.rect_width;
	  viz_area.min_y = Math.abs(zoom_info.trans_y) / zoom_info.zoom_y - (buffer_size + 1) * params.viz.rect_height;

	  viz_area.max_x = Math.abs(zoom_info.trans_x) / zoom_info.zoom_x + params.viz.clust.dim.width / zoom_info.zoom_x + buffer_size * params.viz.rect_width;

	  viz_area.max_y = Math.abs(zoom_info.trans_y) / zoom_info.zoom_y + params.viz.clust.dim.height / zoom_info.zoom_y + buffer_size * params.viz.rect_height;

	  // generate lists of visible rows/cols
	  find_viz_rows(params, viz_area);

	  var missing_rows;
	  if (make_all_rows === false) {
	    missing_rows = _.difference(params.viz.viz_nodes.row, params.viz.viz_nodes.curr_row);
	  } else {
	    // make all rows (reordering)
	    missing_rows = 'all';

	    // remove downsampled rows
	    d3.selectAll(params.root + ' .ds' + String(new_ds_level) + '_row').remove();
	  }

	  if (params.viz.ds != null) {
	    var ds_row_class = '.ds' + String(params.viz.ds_level) + '_row';
	    d3.selectAll(ds_row_class).style('display', 'block');
	  }

	  // if downsampling
	  if (new_ds_level >= 0) {
	    // remove old rows
	    d3.selectAll(params.root + ' .row').remove();
	    // remove tile tooltips and row tooltips
	    d3.selectAll(params.viz.root_tips + '_tile_tip').remove();
	    d3.selectAll(params.viz.root_tips + '_row_tip').remove();
	  }

	  // default state for downsampling
	  var inst_matrix;

	  if (new_ds_level < 0) {
	    // set matrix to default matrix
	    inst_matrix = params.matrix.matrix;

	    // make row visual-aid triangles
	    make_row_visual_aid_triangles(params);
	  } else {
	    // set matrix to downsampled matrix
	    inst_matrix = params.matrix.ds_matrix[new_ds_level];

	    d3.selectAll(params.root + ' .row_cat_group path').remove();
	  }

	  // also remove row visual aid triangles if zooming out
	  if (zooming_out === true) {
	    d3.selectAll(params.root + ' .row_cat_group path').remove();
	  }

	  // remove rows and labels that are not visible and change ds_level
	  /* run when zooming has stopped */
	  if (zooming_stopped === true) {

	    // remove not visible matrix rows
	    if (new_ds_level >= 0) {

	      // remove downsampled rows
	      d3.selectAll(params.root + ' .ds' + String(new_ds_level) + '_row').each(function (d) {
	        if (_.contains(params.viz.viz_nodes.row, d.name) === false) {
	          d3.select(this).remove();
	        }
	      });
	    } else {
	      // remove real data rows
	      d3.selectAll(params.root + ' .row').each(function (d) {
	        if (_.contains(params.viz.viz_nodes.row, d.name) === false) {
	          d3.select(this).remove();
	        }
	      });
	    }

	    // remove not visible row labels
	    d3.selectAll(params.root + ' .row_label_group').each(function (d) {
	      if (_.contains(params.viz.viz_nodes.row, d.name) === false) {
	        d3.select(this).remove();
	      }
	    });

	    // level change
	    if (new_ds_level != old_ds_level) {

	      // console.log('old: ' + String(old_ds_level) + ' new: '+ String(new_ds_level));

	      // all visible rows are missing at new downsampling level
	      missing_rows = params.viz.viz_nodes.row;

	      // remove old level rows
	      d3.selectAll(params.root + ' .ds' + String(old_ds_level) + '_row').remove();
	    }
	  }

	  // console.log('missing_rows: ' + String(missing_rows))
	  // console.log(missing_rows)

	  // only make new matrix_rows if there are missing rows
	  if (missing_rows.length >= 1 || missing_rows === 'all') {
	    make_matrix_rows(params, inst_matrix, missing_rows, new_ds_level);
	  }

	  // only make new row_labels if there are missing row_labels, downsampled, and
	  // not zooming out or zooming has stopped
	  if (new_ds_level === -1) {

	    if (zooming_out === false || zooming_stopped) {

	      // check if labels need to be made
	      ///////////////////////////////////
	      // get the names visible row_labels
	      var visible_row_labels = [];
	      d3.selectAll(params.root + ' .row_label_group').each(function (d) {
	        visible_row_labels.push(d.name);
	      });

	      // find missing labels
	      var missing_row_labels = _.difference(params.viz.viz_nodes.row, visible_row_labels);

	      // make labels
	      //////////////////////////////////
	      // only make row labels if there are any missing
	      var addback_thresh = 1;
	      if (missing_row_labels.length > addback_thresh) {
	        make_row_labels(cgm, missing_row_labels);
	      }
	    }
	  }
		};

/***/ },
/* 73 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function find_viz_rows(params, viz_area) {

	  var should_be_rows = [];
	  var curr_rows = [];

	  // find rows that should be visible
	  var y_trans;

	  // default y_scale (no downsampling)
	  var y_scale = params.viz.y_scale;
	  var ds_level = params.viz.ds_level;
	  var row_names = params.network_data.row_nodes_names;
	  var row_class = '.row';

	  // need to turn this on
	  /////////////////////////////
	  if (ds_level >= 0) {
	    y_scale = params.viz.ds[ds_level].y_scale;

	    row_names = d3.range(params.matrix.ds_matrix[ds_level].length).map(String);

	    row_class = '.ds' + String(ds_level) + '_row';
	  }

	  for (var i = 0; i < row_names.length; i++) {

	    // y_scale (works for downsampled data or non-downsampled data)
	    y_trans = y_scale(i);

	    if (y_trans < viz_area.max_y && y_trans > viz_area.min_y) {
	      should_be_rows.push(row_names[i]);
	    }
	  }

	  // find currently visible rows
	  d3.selectAll(params.root + ' ' + row_class).each(function (d) {
	    curr_rows.push(d.name);
	  });

	  // nodes that should be visible
	  params.viz.viz_nodes.row = should_be_rows;
	  // nodes that are visible
	  params.viz.viz_nodes.curr_row = curr_rows;
		};

/***/ },
/* 74 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function make_row_visual_aid_triangles(params) {

	  if (d3.select(params.root + ' .row_cat_group path').empty() === true) {
	    d3.selectAll(params.root + ' .row_cat_group').append('path').attr('d', function () {
	      var origin_x = params.viz.cat_room.symbol_width - 1;
	      var origin_y = 0;
	      var mid_x = 1;
	      var mid_y = params.viz.y_scale.rangeBand() / 2;
	      var final_x = params.viz.cat_room.symbol_width - 1;
	      var final_y = params.viz.y_scale.rangeBand();
	      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
	      return output_string;
	    }).attr('fill', '#eee').style('opacity', params.viz.triangle_opacity);
	  }
		};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d3_tip_custom = __webpack_require__(50);

	module.exports = function make_col_tooltips(params) {

	  if (params.labels.show_label_tooltips) {

	    // remove old col tooltips
	    d3.selectAll(params.viz.root_tips + '_col_tip').remove();

	    // d3-tooltip
	    var col_tip = d3_tip_custom().attr('class', function () {
	      var root_tip_selector = params.viz.root_tips.replace('.', '');
	      var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_col_tip';
	      return class_string;
	    }).direction('w').offset([20, 0]).style('display', 'none').html(function (d) {
	      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
	      return "<span>" + inst_name + "</span>";
	    });

	    d3.select(params.viz.viz_wrapper).select('svg').select(params.root + ' .col_zoom_container').selectAll('.col_label_group').select('text').call(col_tip);

	    d3.select(params.root + ' .col_zoom_container').selectAll('.col_label_group').on('mouseover', function (d) {

	      d3.selectAll(params.viz.root_tips + '_col_tip').style('display', 'block');

	      col_tip.show(d);
	      if (params.col_tip_callback != null) {
	        params.col_tip_callback(d);
	      }
	    }).on('mouseout', function () {
	      col_tip.hide(this);

	      d3.selectAll(params.viz.root_tips + '_col_tip').style('display', 'none');
	    });
	  }
		};

/***/ },
/* 76 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function col_viz_aid_triangle(params) {

	  // x and y are flipped since its rotated
	  var reduce_rect_width = params.viz.x_scale.rangeBand() * 0.36;
	  var origin_y = -params.viz.border_width.x;
	  var start_x = 0;
	  var final_x = params.viz.x_scale.rangeBand() - reduce_rect_width;
	  var start_y = -(params.viz.x_scale.rangeBand() - reduce_rect_width + params.viz.border_width.x);
	  var final_y = -params.viz.border_width.x;
	  var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' + start_x + ', L ' + final_y + ',' + final_x + ' Z';
	  return output_string;
	};

/***/ },
/* 77 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params) {

	  d3.select(params.viz.viz_svg).append('rect').attr('fill', params.viz.background_color).attr('height', params.viz.super_labels.dim.width + 'px').attr('width', '3000px').classed('super_col_bkg', true).classed('white_bars', true).attr('transform', 'translate(0,' + params.viz.super_labels.margin.top + ')');

	  d3.select(params.viz.viz_svg).append('text').attr('class', 'super_col').text(params.labels.super.col).attr('text-anchor', 'center').attr('transform', function () {

	    var inst_text_width = d3.select(this)[0][0].getBBox().width;

	    var inst_x = params.viz.clust.dim.width / 2 + params.viz.norm_labels.width.row - inst_text_width / 2;
	    var inst_y = params.viz.super_labels.dim.width;
	    return 'translate(' + inst_x + ',' + inst_y + ')';
	  }).style('font-size', function () {
	    var inst_font_size = params.labels.super_label_fs * params.labels.super_label_scale;
	    return inst_font_size + 'px';
	  }).style('font-weight', 300);

	  d3.select(params.viz.viz_svg).append('rect').attr('fill', params.viz.background_color).attr('width', params.viz.super_labels.dim.width + 'px').attr('height', '3000px').classed('super_row_bkg', true).classed('white_bars', true).attr('transform', 'translate(' + params.viz.super_labels.margin.left + ',0)');

	  // append super title row group - used to separate translation from rotation
	  d3.select(params.viz.viz_svg).append('g').classed('super_row', true).attr('transform', function () {
	    // position in the middle of the clustergram
	    var inst_x = params.viz.super_labels.dim.width;
	    var inst_y = params.viz.clust.dim.height / 2 + params.viz.norm_labels.width.col;
	    return 'translate(' + inst_x + ',' + inst_y + ')';
	  });

	  // super row label (rotate the already translated title )
	  d3.select(params.root + ' .super_row').append('text').text(params.labels.super.row).attr('text-anchor', 'center').attr('transform', function () {
	    var inst_text_width = d3.select(this)[0][0].getBBox().width;
	    var inst_x_offset = inst_text_width / 2 + params.viz.norm_labels.width.col;
	    var inst_offset = 'translate(0,' + inst_x_offset + '), rotate(-90)';
	    return inst_offset;
	  }).style('font-size', function () {
	    var inst_font_size = params.labels.super_label_fs * params.labels.super_label_scale;
	    return inst_font_size + 'px';
	  }).style('font-weight', 300);
		};

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_title = __webpack_require__(79);
	var ini_cat_reorder = __webpack_require__(80);
	var make_row_cat_super_labels = __webpack_require__(88);
	var make_dendro_crop_buttons = __webpack_require__(62);

	module.exports = function Spillover(cgm) {

	  var params = cgm.params;

	  var viz = params.viz;

	  // hide spillover from slanted column labels on right side
	  d3.select(viz.root + ' .col_container').append('path').style('stroke-width', '0').attr('d', 'M 0,0 L 1000,-1000, L 1000,0 Z').attr('fill', viz.background_color) //!! prog_colors
	  .attr('class', 'right_slant_triangle').attr('transform', 'translate(' + viz.clust.dim.width + ',' + viz.norm_labels.width.col + ')');

	  // hide spillover from slanted column labels on left side
	  d3.select(viz.root + ' .col_container').append('path').style('stroke-width', '0').attr('d', 'M 0,0 L 500,-500, L 0,-500 Z').attr('fill', viz.background_color).attr('class', 'left_slant_triangle')
	  // shift left by 1 px to prevent cutting off labels
	  .attr('transform', 'translate(-1,' + viz.norm_labels.width.col + ')');

	  var rect_height = viz.clust.margin.top + viz.uni_margin / 5;
	  // white rect to cover excess labels
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color) //!! prog_colors
	  .attr('width', viz.clust.margin.left).attr('height', rect_height).attr('class', 'top_left_white');

	  var inst_height = viz.cat_room.col + 1.5 * viz.uni_margin;
	  // white rect to cover excess labels
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color).attr('width', 2 * viz.clust.dim.width).attr('height', inst_height).attr('class', 'top_right_white').attr('transform', function () {
	    var tmp_left = viz.clust.margin.left + viz.clust.dim.width;
	    var tmp_top = viz.norm_labels.width.col + viz.norm_labels.margin.top - viz.uni_margin;
	    return 'translate(' + tmp_left + ', ' + tmp_top + ')';
	  });

	  x_offset = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin;
	  y_offset = viz.norm_labels.margin.top + viz.norm_labels.width.col + 2.5 * viz.uni_margin;
	  var cat_text_size = 1.15 * viz.cat_room.symbol_width;
	  var cat_super_opacity = 0.65;
	  var extra_y_room = 1.25;

	  // col category super labels
	  if (viz.show_categories.col) {

	    d3.select(viz.viz_svg).selectAll().data(viz.all_cats.col).enter().append('text').classed('col_cat_super', true).style('font-size', cat_text_size + 'px').style('opacity', cat_super_opacity).style('cursor', 'default').attr('transform', function (d) {
	      var inst_cat = parseInt(d.split('-')[1], 10);
	      var inst_y = y_offset + extra_y_room * viz.cat_room.symbol_width * inst_cat;
	      return 'translate(' + x_offset + ',' + inst_y + ')';
	    }).text(function (d) {
	      return get_cat_title(viz, d, 'col');
	    });
	  }

	  // row category super labels
	  make_row_cat_super_labels(cgm);

	  // white border bottom - prevent clustergram from hitting border
	  if (viz.show_dendrogram) {
	    // quick fix to make room for crop buttons
	    y_offset = viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col - 2 * viz.uni_margin;
	  } else {
	    y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  }

	  var b_spill_container = d3.select(viz.viz_svg).append('g').classed('bottom_spillover_container', true).attr('transform', function () {
	    // shift up enough to show the entire border width
	    return 'translate(0,' + y_offset + ')';
	  });

	  b_spill_container.append('rect').attr('class', 'bottom_spillover').attr('fill', viz.background_color) //!! prog_colors
	  .attr('width', viz.svg_dim.width).attr('height', 2 * viz.svg_dim.height);

	  x_offset = viz.clust.margin.left;
	  y_offset = 0;
	  b_spill_container.append('g').classed('col_dendro_icons_container', true).attr('transform', 'translate(' + x_offset + ',' + y_offset + ')').append('g').classed('col_dendro_icons_group', true);

	  make_dendro_crop_buttons(cgm, 'col');

	  var x_offset = viz.clust.margin.left + viz.clust.dim.width;
	  var y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  var tmp_width = viz.cat_room.col + viz.clust.dim.width;
	  var tmp_height = viz.cat_room.row + 10 * viz.uni_margin;
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color).attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  }).classed('white_bars', true).classed('dendro_corner_spillover', true);

	  // hide spillover left top of col dendrogram
	  x_offset = 0;
	  y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  tmp_width = viz.clust.margin.left;
	  tmp_height = viz.clust.dim.height * 10;
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color).attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  }).classed('white_bars', true).classed('dendro_col_spillover', true);

	  ini_cat_reorder(cgm);
		};

/***/ },
/* 79 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function get_cat_title(viz, inst_cat, inst_rc) {
	  var cat_title;

	  // make default title if none is given
	  if (viz.cat_names[inst_rc][inst_cat] === inst_cat) {
	    var inst_num = parseInt(inst_cat.split('-')[1], 10) + 1;
	    // generate placeholder title
	    cat_title = 'Category ' + inst_num;
	  } else {
	    // make real title
	    cat_title = viz.cat_names[inst_rc][inst_cat];
	  }

	  return cat_title;
		};

/***/ },
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var all_reorder = __webpack_require__(81);

	module.exports = function ini_cat_reorder(cgm) {
	  /* eslint-disable */

	  var params = cgm.params;

	  _.each(['row', 'col'], function (inst_rc) {

	    if (params.viz.show_categories[inst_rc]) {
	      d3.selectAll(params.root + ' .' + inst_rc + '_cat_super').on('dblclick', function () {

	        if (params.sim_mat) {
	          inst_rc = 'both';
	        }

	        d3.selectAll(params.root + ' .toggle_' + inst_rc + '_order .btn').classed('active', false);

	        var order_id = this.__data__.replace('-', '_') + '_index';
	        if (params.viz.sim_mat) {
	          all_reorder(cgm, order_id, 'row');
	          all_reorder(cgm, order_id, 'col');
	        } else {
	          all_reorder(cgm, order_id, inst_rc);
	        }
	      });
	    }
	  });
	};

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toggle_dendro_view = __webpack_require__(56);
	var show_visible_area = __webpack_require__(72);
	var ini_zoom_info = __webpack_require__(38);
	var calc_downsampled_levels = __webpack_require__(33);
	var two_translate_zoom = __webpack_require__(82);
	var get_previous_zoom = __webpack_require__(67);

	module.exports = function (cgm, inst_order, inst_rc) {

	  var params = cgm.params;

	  var prev_zoom = get_previous_zoom(params);

	  var delay_reorder = 0;
	  if (prev_zoom.zoom_y != 1 || prev_zoom.zoom_x != 1) {
	    // reset zoom before reordering
	    two_translate_zoom(cgm, 0, 0, 1);
	    delay_reorder = 1200;
	  }

	  // row/col names are swapped, will improve later
	  var other_rc;
	  if (inst_rc === 'row') {
	    other_rc = 'col';
	  } else if (inst_rc === 'col') {
	    other_rc = 'row';
	  }

	  params.viz.run_trans = true;

	  // save order state
	  if (other_rc === 'row') {
	    params.viz.inst_order.row = inst_order;
	  } else if (other_rc === 'col') {
	    params.viz.inst_order.col = inst_order;
	  }

	  if (params.viz.show_dendrogram) {
	    toggle_dendro_view(cgm, inst_rc);
	  }

	  if (other_rc === 'row') {
	    params.viz.x_scale.domain(params.matrix.orders[params.viz.inst_order.row + '_row']);
	  } else if (other_rc == 'col') {
	    params.viz.y_scale.domain(params.matrix.orders[params.viz.inst_order.col + '_col']);
	  }

	  // only animate transition if there are a small number of tiles
	  var t;
	  if (d3.selectAll(params.root + ' .tile')[0].length < params.matrix.def_large_matrix) {
	    t = d3.select(params.root + ' .viz_svg').transition().duration(2500).delay(delay_reorder);
	  } else {
	    t = d3.select(params.root + ' .viz_svg');
	  }

	  var row_nodes_names = params.network_data.row_nodes_names;
	  var col_nodes_names = params.network_data.col_nodes_names;

	  // only update matrix if not downsampled (otherwise rows are updated)
	  if (params.viz.ds_level === -1) {

	    t.selectAll('.row').attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    }).selectAll('.tile').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });

	    t.selectAll('.tile_up').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });

	    t.selectAll('.tile_dn').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });
	  }

	  // Move Row Labels
	  t.select('.row_label_zoom_container').selectAll('.row_label_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	  });

	  // Move Col Labels
	  t.select('.col_zoom_container').selectAll('.col_label_text').attr('transform', function (d) {
	    var inst_index = _.indexOf(col_nodes_names, d.name);
	    return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	  });

	  // reorder row categories
	  t.selectAll('.row_cat_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	  });

	  // reorder col_class groups
	  t.selectAll('.col_cat_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(col_nodes_names, d.name);
	    return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	  });

	  // redefine x and y positions
	  params.network_data.links.forEach(function (d) {
	    d.x = params.viz.x_scale(d.target);
	    d.y = params.viz.y_scale(d.source);
	  });

	  params.zoom_info = ini_zoom_info();

	  // calculate downsmapling if necessary
	  if (params.viz.ds_num_levels > 0 && params.viz.ds_level >= 0) {

	    calc_downsampled_levels(params);
	    var zooming_stopped = true;
	    var zooming_out = true;
	    var make_all_rows = true;

	    // show_visible_area is also run with two_translate_zoom, but at that point
	    // the parameters were not updated and two_translate_zoom if only run
	    // if needed to reset zoom
	    show_visible_area(cgm, zooming_stopped, zooming_out, make_all_rows);
	  }

	  setTimeout(function () {
	    params.viz.run_trans = false;
	  }, 2500);
		};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var label_constrain_and_trim = __webpack_require__(83);
	var show_visible_area = __webpack_require__(72);
	var ini_zoom_info = __webpack_require__(38);
	var toggle_grid_lines = __webpack_require__(87);

	module.exports = function two_translate_zoom(cgm, pan_dx, pan_dy, fin_zoom) {

	  var params = cgm.params;

	  d3.selectAll(params.viz.root_tips).style('display', 'none');

	  params.zoom_info = ini_zoom_info();

	  show_visible_area(cgm);

	  // do not allow while transitioning, e.g. reordering
	  if (!params.viz.run_trans) {

	    // define the commonly used variable half_height
	    var half_height = params.viz.clust.dim.height / 2;

	    // y pan room, the pan room has to be less than half_height since
	    // zooming in on a gene that is near the top of the clustergram also causes
	    // panning out of the visible region
	    var y_pan_room = half_height / params.viz.zoom_switch;

	    // prevent visualization from panning down too much
	    // when zooming into genes near the top of the clustergram
	    if (pan_dy >= half_height - y_pan_room) {

	      // explanation of panning rules
	      /////////////////////////////////
	      // prevent the clustergram from panning down too much
	      // if the amount of panning is equal to the half_height then it needs to be reduced
	      // effectively, the the visualization needs to be moved up (negative) by some factor
	      // of the half-width-of-the-visualization.
	      //
	      // If there was no zooming involved, then the
	      // visualization would be centered first, then panned to center the top term
	      // this would require a
	      // correction to re-center it. However, because of the zooming the offset is
	      // reduced by the zoom factor (this is because the panning is occurring on something
	      // that will be zoomed into - this is why the pan_dy value is not scaled in the two
	      // translate transformations, but it has to be scaled afterwards to set the translate
	      // vector)
	      // pan_dy = half_height - (half_height)/params.viz.zoom_switch

	      // if pan_dy is greater than the pan room, then panning has to be restricted
	      // start by shifting back up (negative) by half_height/params.viz.zoom_switch then shift back down
	      // by the difference between half_height and pan_dy (so that the top of the clustergram is
	      // visible)
	      var shift_top_viz = half_height - pan_dy;
	      var shift_up_viz = -half_height / params.viz.zoom_switch + shift_top_viz;

	      // reduce pan_dy so that the visualization does not get panned to far down
	      pan_dy = pan_dy + shift_up_viz;
	    }

	    // prevent visualization from panning up too much
	    // when zooming into genes at the bottom of the clustergram
	    if (pan_dy < -(half_height - y_pan_room)) {

	      shift_top_viz = half_height + pan_dy;

	      shift_up_viz = half_height / params.viz.zoom_switch - shift_top_viz; //- move_up_one_row;

	      // reduce pan_dy so that the visualization does not get panned to far down
	      pan_dy = pan_dy + shift_up_viz;
	    }

	    // will improve this !!
	    var zoom_y = fin_zoom;
	    var zoom_x;
	    if (fin_zoom <= params.viz.zoom_switch) {
	      zoom_x = 1;
	    } else {
	      zoom_x = fin_zoom / params.viz.zoom_switch;
	    }

	    // search duration - the duration of zooming and panning
	    var search_duration = 700;

	    // center_y
	    var center_y = -(zoom_y - 1) * half_height;

	    // transform clust group
	    ////////////////////////////
	    d3.select(params.root + ' .clust_group').transition().duration(search_duration)
	    // first apply the margin transformation
	    // then zoom, then apply the final transformation
	    .attr('transform', 'translate(' + [0, 0 + center_y] + ')' + ' scale(' + zoom_x + ',' + zoom_y + ')' + 'translate(' + [pan_dx, pan_dy] + ')');

	    // transform row labels
	    d3.select(params.root + ' .row_label_zoom_container').transition().duration(search_duration).attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' + zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

	    // transform row_cat_container
	    // use the offset saved in params, only zoom in the y direction
	    d3.select(params.root + ' .row_cat_container').transition().duration(search_duration).attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

	    d3.select(params.root + ' .row_dendro_container').transition().duration(search_duration).attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' + zoom_x + ',' + zoom_y + ')' + 'translate(' + [params.viz.uni_margin / 2, pan_dy] + ')');

	    // toggle crop buttons
	    var inst_button_opacity;
	    _.each(['row', 'col'], function (inst_rc) {

	      inst_button_opacity = d3.select(params.root + ' .' + inst_rc + '_dendro_crop_buttons').style('opacity');
	      d3.selectAll(params.root + ' .' + inst_rc + '_dendro_crop_buttons').style('opacity', 0);
	      setTimeout(show_crop_buttons, 700, inst_rc, inst_button_opacity);
	    });

	    // transform col labels
	    d3.select(params.root + ' .col_zoom_container').transition().duration(search_duration).attr('transform', ' scale(' + zoom_x + ',' + zoom_x + ')' + 'translate(' + [pan_dx, 0] + ')');

	    // transform col_class
	    d3.select(params.root + ' .col_cat_container').transition().duration(search_duration).attr('transform', ' scale(' + zoom_x + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

	    d3.select(params.root + ' .col_dendro_container').transition().duration(search_duration).attr('transform', ' scale(' + zoom_x + ',' + 1 + ')' + 'translate(' + [pan_dx, params.viz.uni_margin / 2] + ')');

	    // set y translate: center_y is positive, positive moves the visualization down
	    // the translate vector has the initial margin, the first y centering, and pan_dy
	    // times the scaling zoom_y
	    var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;
	    var net_x_offset = params.viz.clust.margin.left + pan_dx;

	    // reset the zoom and translate
	    params.zoom_behavior.scale(zoom_y).translate([net_x_offset, net_y_offset]);

	    label_constrain_and_trim(params);

	    // re-size of the highlighting rects
	    /////////////////////////////////////////
	    if (d3.select(params.root + ' .row_label_zoom_container text').empty() === false) {
	      d3.select(params.root + ' .row_label_zoom_container').each(function () {
	        // get the bounding box of the row label text
	        var bbox = d3.select(this).select('text')[0][0].getBBox();

	        // use the bounding box to set the size of the rect
	        d3.select(this).select('rect').attr('x', bbox.x * 0.5).attr('y', 0).attr('width', bbox.width * 0.5).attr('height', params.viz.y_scale.rangeBand()).style('fill', 'yellow');
	      });
	    }

	    // reset crop button zooming
	    d3.select(params.root + ' .row_dendro_icons_group').attr('transform', 'translate(' + [0, 0 + center_y] + ')' + ' scale(' + zoom_x + ',' + zoom_y + ')' + 'translate(' + [pan_dx, pan_dy] + ')');

	    d3.select(params.root + ' .row_dendro_icons_group').selectAll('path').attr('transform', function (d) {
	      var inst_x = params.viz.uni_margin;
	      var inst_y = d.pos_mid;
	      return 'translate(' + inst_x + ',' + inst_y + ') ' + 'scale(1, ' + 1 / zoom_y + ')';
	    });

	    d3.select(params.root + ' .col_dendro_icons_group').attr('transform', 'translate(' + [0, 0 + center_y] + ')' + ' scale(' + zoom_x + ',' + zoom_y + ')' + 'translate(' + [pan_dx, pan_dy] + ')');

	    d3.select(params.root + ' .col_dendro_icons_group').selectAll('path').attr('transform', function (d) {
	      var inst_x = d.pos_mid;
	      var inst_y = params.viz.uni_margin;
	      return 'translate(' + inst_x + ',' + inst_y + ') ' + 'scale(' + 1 / zoom_x + ',1)';
	    });

	    // column value bars
	    ///////////////////////
	    // reduce the height of the column value bars based on the zoom applied
	    // recalculate the height and divide by the zooming scale
	    // col_label_obj.select('rect')
	    if (utils.has(params.network_data.col_nodes[0], 'value')) {

	      d3.selectAll(params.root + ' .col_bars').attr('width', function (d) {
	        var inst_value = 0;
	        if (d.value > 0) {
	          inst_value = params.labels.bar_scale_col(d.value) / zoom_x;
	        }
	        return inst_value;
	      });
	    }

	    if (utils.has(params.network_data.row_nodes[0], 'value')) {

	      d3.selectAll(params.root + ' .row_bars').transition().duration(search_duration).attr('width', function (d) {
	        var inst_value = 0;
	        inst_value = params.labels.bar_scale_row(Math.abs(d.value)) / zoom_y;
	        return inst_value;
	      }).attr('x', function (d) {
	        var inst_value = 0;
	        inst_value = -params.labels.bar_scale_row(Math.abs(d.value)) / zoom_y;
	        return inst_value;
	      });
	    }

	    toggle_grid_lines(params);
	  }

	  function show_crop_buttons(inst_rc, inst_button_opacity) {
	    d3.selectAll(params.root + ' .' + inst_rc + '_dendro_crop_buttons').transition().duration(search_duration).style('opacity', inst_button_opacity);
	  }
		};

/***/ },
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var trim_text = __webpack_require__(84);
	var constrain_font_size = __webpack_require__(85);

	module.exports = function label_constrain_and_trim(params) {

	  // console.log('label_constrain_and_trim');

	  // reset text in rows and columns
	  d3.selectAll(params.root + ' .row_label_group').select('text').text(function (d) {
	    return utils.normal_name(d);
	  });

	  d3.selectAll(params.root + ' .col_label_text').select('text').text(function (d) {
	    return utils.normal_name(d);
	  });

	  constrain_font_size(params);

	  d3.selectAll(params.root + ' .row_label_group').each(function () {
	    trim_text(params, this, 'row');
	  });

	  d3.selectAll(params.root + ' .col_label_group').each(function () {
	    trim_text(params, this, 'col');
	  });
		};

/***/ },
/* 84 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params, inst_selection, inst_rc) {
	  if (d3.select(inst_selection).style('display') != 'none') {

	    // trim text that is longer than the container 
	    var inst_zoom;
	    var inst_width;
	    var trimmed_text;
	    var current_num_char;
	    var inst_text;
	    var original_text;
	    var keep_num_char;
	    var i;

	    var max_width = params.viz.norm_labels.width[inst_rc];

	    if (inst_rc === 'row') {
	      if (params.viz.zoom_switch_y) {
	        inst_zoom = params.zoom_behavior.scale() / params.viz.zoom_switch_y;
	      } else {
	        inst_zoom = params.zoom_behavior.scale();
	      }
	      // num_trims = params.labels.row_max_char;
	    } else {
	      if (params.viz.zoom_switch > 1) {
	        inst_zoom = params.zoom_behavior.scale() / params.viz.zoom_switch;
	      } else {
	        inst_zoom = params.zoom_behavior.scale();
	      }
	      // num_trims = params.labels.col_max_char;
	    }

	    var num_trims;
	    d3.select(inst_selection).select('text').each(function (d) {
	      num_trims = d.name.length;
	    });

	    var tmp_width = d3.select(inst_selection).select('text').node().getBBox().width;

	    inst_width = calc_width(tmp_width, inst_zoom);

	    if (inst_width > max_width) {

	      for (i = 1; i < num_trims; i++) {
	        if (inst_width > max_width) {

	          d3.select(inst_selection).select('text').text(trim);

	          tmp_width = d3.select(inst_selection).select('text').node().getBBox().width;

	          inst_width = calc_width(tmp_width, inst_zoom);
	        }
	      }
	    } else if (inst_width < max_width * 0.75) {

	      for (i = 1; i < num_trims; i++) {
	        if (inst_width < max_width * 0.75) {

	          d3.select(inst_selection).select('text').text(add_back);

	          tmp_width = d3.select(inst_selection).select('text').node().getBBox().width;

	          inst_width = calc_width(tmp_width, inst_zoom);
	        }
	      }
	    }
	  }

	  function trim() {
	    inst_text = d3.select(this).text();
	    current_num_char = inst_text.length;
	    keep_num_char = current_num_char - 3;
	    trimmed_text = inst_text.substring(0, keep_num_char) + '..';
	    return trimmed_text;
	  }

	  function add_back(d) {
	    inst_text = d3.select(this).text();
	    if (inst_text.slice(-2) === '..') {
	      current_num_char = inst_text.length - 2;
	    } else {
	      current_num_char = inst_text.length;
	    }

	    original_text = d.name;
	    keep_num_char = current_num_char + 2;
	    trimmed_text = original_text.substring(0, keep_num_char) + '..';

	    // if '..' was added to original text 
	    if (trimmed_text.length > original_text.length) {
	      trimmed_text = original_text;
	    }

	    return trimmed_text;
	  }

	  function calc_width(tmp_width, inst_zoom) {
	    if (inst_zoom < 1) {
	      inst_width = tmp_width;
	    } else {
	      inst_width = tmp_width * inst_zoom;
	    }

	    return inst_width;
	  }
		};

/***/ },
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_real_font_size = __webpack_require__(86);

	module.exports = function constrain_font_size(params) {

	  var tmp_font_size = params.labels.default_fs_row;
	  var inst_zoom;
	  var min_font_size = 3;

	  var real_font_size = calc_real_font_size(params);

	  // rows
	  ////////////////////////////////////
	  if (real_font_size.row > min_font_size) {

	    if (real_font_size.row > params.labels.max_allow_fs) {

	      if (params.viz.zoom_switch_y) {
	        inst_zoom = params.zoom_behavior.scale() / params.viz.zoom_switch_y;
	      } else {
	        inst_zoom = params.zoom_behavior.scale();
	      }

	      if (inst_zoom < 1) {
	        inst_zoom = 1;
	      }

	      tmp_font_size = params.labels.max_allow_fs / inst_zoom;

	      d3.selectAll(params.root + ' .row_label_group').select('text').style('font-size', tmp_font_size + 'px').attr('y', params.viz.rect_height * 0.5 + tmp_font_size * 0.35);
	    } else {
	      d3.selectAll(params.root + ' .row_label_group').select('text').style('font-size', params.labels.default_fs_row + 'px').attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);
	    }
	  }

	  // columns
	  //////////////////////////////////////
	  if (real_font_size.col > min_font_size) {

	    if (real_font_size.col > params.labels.max_allow_fs) {

	      if (params.viz.zoom_switch > 1) {
	        inst_zoom = params.zoom_behavior.scale() / params.viz.zoom_switch;
	      } else {
	        inst_zoom = params.zoom_behavior.scale();
	      }

	      if (inst_zoom < 1) {
	        inst_zoom = 1;
	      }

	      tmp_font_size = params.labels.max_allow_fs / inst_zoom;

	      if (tmp_font_size > 0.7 * params.viz.rect_width) {
	        tmp_font_size = 0.7 * params.viz.rect_width;
	      }

	      d3.selectAll(params.root + ' .col_label_text').select('text').style('font-size', tmp_font_size + 'px');
	    } else {
	      d3.selectAll(params.root + ' .col_label_text').select('text').style('font-size', params.labels.default_fs_col + 'px');
	    }
	  }
		};

/***/ },
/* 86 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function calc_real_font_size(params) {

	  var real_font_size = {};
	  // zoom_switch behavior has to change with zoom_switch_y
	  if (params.viz.zoom_switch > 1) {
	    real_font_size.row = params.labels.default_fs_row * params.zoom_behavior.scale();
	    real_font_size.col = params.labels.default_fs_col * params.zoom_behavior.scale(); ///params.viz.zoom_switch;
	  } else {
	    real_font_size.row = params.labels.default_fs_row * params.zoom_behavior.scale() / params.viz.zoom_switch_y;
	    real_font_size.col = params.labels.default_fs_col * params.zoom_behavior.scale();
	  }

	  return real_font_size;
		};

/***/ },
/* 87 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function toggle_grid_lines(params) {

	  if (params.zoom_info.zoom_x * params.viz.border_width.x > 1) {
	    d3.selectAll(params.root + ' .vert_lines').select('line').style('display', 'block').style('opacity', 0).transition().style('opacity', 1);
	  } else {
	    d3.selectAll(params.root + ' .vert_lines').select('line').style('display', 'none');
	  }

	  if (params.zoom_info.zoom_y * params.viz.border_width.y > 1) {
	    d3.selectAll(params.root + ' .horz_lines').select('line').style('display', 'block').style('opacity', 0).transition().style('opacity', 1);
	  } else {
	    d3.selectAll(params.root + ' .horz_lines').select('line').style('display', 'none');
	  }
	};

/***/ },
/* 88 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_title = __webpack_require__(79);
	var d3_tip_custom = __webpack_require__(50);

	module.exports = function make_row_cat_super_labels(cgm) {

	  var params = cgm.params;

	  var viz = params.viz;
	  var extra_x_room = 2.75;

	  if (d3.select(params.root + ' .row_cat_label_container').empty()) {

	    d3.select(cgm.params.viz.viz_svg).append('g').classed('row_cat_label_container', true);

	    // append background section for optional value-bars (e.g. enrichment pvals)
	    d3.select(cgm.params.viz.viz_svg + ' .row_cat_label_container').append('g').classed('row_cat_label_bar_container', true);
	  }

	  var x_offset = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin;
	  var y_offset = viz.norm_labels.margin.top + viz.norm_labels.width.col + 2.5 * viz.uni_margin;
	  var cat_text_size = 1.15 * viz.cat_room.symbol_width;
	  var cat_super_opacity = 0.65;
	  var extra_y_room = 1.25;

	  d3.select(params.root + ' .row_cat_label_container').attr('transform', function () {
	    x_offset = viz.norm_labels.margin.left + viz.norm_labels.width.row + viz.cat_room.symbol_width + extra_x_room * viz.uni_margin;
	    y_offset = viz.clust.margin.top - viz.uni_margin;
	    return 'translate(' + x_offset + ',' + y_offset + ') rotate(-90)';
	  });

	  // clear old categories
	  d3.selectAll(params.root + ' .row_cat_label_container text').remove();
	  d3.selectAll(params.root + ' .row_cat_selection_bar').remove();
	  // d3.selectAll(params.root+' .row_cat_label_bar_container rect').remove();

	  // remove any old row_cat_super tooltips from this visualization
	  d3.selectAll(cgm.params.viz.root_tips + '_row_cat_super').remove();

	  // d3-tooltip
	  var tmp_y_offset = 50; // viz.clust.margin.top - viz.uni_margin;
	  var tmp_x_offset = -75;
	  var cat_tip = d3_tip_custom().attr('class', function () {
	    var root_tip_selector = params.viz.root_tips.replace('.', '');
	    var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_row_cat_super';
	    return class_string;
	  }).direction('south_custom').offset([tmp_y_offset, tmp_x_offset]).style('display', 'none').style('opacity', 0).html(function (d) {

	    var full_string;

	    var tmp_string = params.network_data.row_nodes[0][d];

	    if (tmp_string.indexOf('<p>') > -1) {

	      var start_string = tmp_string.split(': ')[0];
	      var end_string = tmp_string.split('<p>')[1];

	      full_string = start_string + '<p>' + end_string;
	    } else {

	      full_string = get_cat_title(viz, d, 'row');
	    }

	    return full_string;
	  });

	  var unit_length = extra_y_room * viz.cat_room.symbol_width;
	  var bar_width = unit_length * 0.9;

	  // do not show row label categories if you are viewing a similarity matrix
	  if (viz.sim_mat === false) {

	    d3.select(params.root + ' .row_cat_label_container').selectAll().data(viz.all_cats.row).enter().append('text').style('width', '100px').style('height', bar_width + 'px').classed('row_cat_super', true).style('font-size', cat_text_size + 'px').style('opacity', cat_super_opacity).style('cursor', 'default').attr('transform', function (d) {
	      var inst_y = extra_y_room * viz.cat_room.symbol_width * parseInt(d.split('-')[1], 10);
	      return 'translate(0,' + inst_y + ')';
	    }).text(function (d) {
	      return get_cat_title(viz, d, 'row');
	    });

	    // // optional bar behind name
	    // ///////////////////////////////
	    // d3.select('.row_cat_label_bar_container')
	    //   .selectAll()
	    //   .data(viz.all_cats.row)
	    //   .enter()
	    //   .append('rect')
	    //   .style('height', bar_width +'px')
	    //   .style('fill', 'green')
	    //   .style('width','60px')
	    //   .style('opacity', 0)
	    //   .attr('transform', function(d){
	    //     var inst_y = unit_length * (parseInt( d.split('-')[1], 10 ) -0.75 );
	    //     return 'translate(0,'+inst_y+')';
	    //   })

	    // selection bar
	    ///////////////////////////////
	    d3.select(params.root + ' .row_cat_label_container').selectAll().data(viz.all_cats.row).enter().append('rect').classed('row_cat_super', true).classed('row_cat_selection_bar', true).style('height', bar_width + 'px').style('fill', 'green').style('width', '120px').style('opacity', 0).attr('transform', function (d) {
	      var inst_y = unit_length * (parseInt(d.split('-')[1], 10) - 0.75);
	      return 'translate(0,' + inst_y + ')';
	    }).on('mouseover', function (d) {

	      d3.selectAll(params.viz.root_tips + '_row_cat_super').style('display', 'block').style('opacity', 1);

	      cat_tip.show(d);
	    }).on('mouseout', function () {
	      cat_tip.hide(this);
	      // might not need
	      d3.selectAll('.d3-tip').style('display', 'none');

	      d3.selectAll(params.viz.root_tips + '_row_cat_super').style('display', 'none').style('opacity', 0);
	    });
	  }

	  // row category super-label mouseover
	  //////////////////////////////////////
	  if (d3.select(params.root + ' .row_cat_selection_bar').empty() === false) {
	    d3.selectAll(params.root + ' .row_cat_selection_bar').call(cat_tip);
	  }
		};

/***/ },
/* 89 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resize_viz = __webpack_require__(90);

	module.exports = function initialize_resizing(cgm) {

	  var params = cgm.params;

	  var exp_button;

	  // d3.select(window).on('resize', null);

	  // // resize window
	  // if (params.viz.resize) {
	  //   d3.select(window).on('resize', function () {

	  //     d3.select(params.viz.viz_svg).style('opacity', 0.5);

	  //     var wait_time = 500;
	  //     if (params.viz.run_trans === true) {
	  //       wait_time = 2500;
	  //     }

	  //     setTimeout(resize_viz, wait_time, params);
	  //   });
	  // }

	  // if (params.viz.expand_button) {

	  d3.select(params.root + ' .expand_button').on('click', null);
	  var expand_opacity = 0.4;

	  if (d3.select(params.root + ' .expand_button').empty()) {
	    exp_button = d3.select(params.viz.viz_svg).append('text').attr('class', 'expand_button');
	  } else {
	    exp_button = d3.select(params.root + ' .expand_button');
	  }

	  exp_button.attr('text-anchor', 'middle').attr('dominant-baseline', 'central').attr('font-family', 'FontAwesome').attr('font-size', '30px').text(function () {
	    if (params.viz.is_expand === false) {
	      // expand button
	      return '';
	    } else {
	      // menu button
	      return '';
	    }
	  }).attr('y', '25px').attr('x', '25px').style('cursor', 'pointer').style('opacity', expand_opacity).on('mouseover', function () {
	    d3.select(this).style('opacity', 0.75);
	  }).on('mouseout', function () {
	    d3.select(this).style('opacity', expand_opacity);
	  }).on('click', function () {

	    // expand view
	    if (params.viz.is_expand === false) {

	      d3.select(this).text(function () {
	        // menu button
	        return '';
	      });
	      params.viz.is_expand = true;

	      d3.selectAll(params.root + ' .borders').style('fill', 'white');
	      // d3.select(params.root+' .footer_section').style('display', 'none');
	      d3.select(params.root + ' .sidebar_wrapper').style('display', 'none');

	      // contract view
	    } else {

	      d3.select(this).text(function () {
	        // expand button
	        return '';
	      });

	      params.viz.is_expand = false;

	      d3.selectAll(params.root + ' .borders').style('fill', '#eee');
	      // d3.select(params.root+' .footer_section').style('display', 'block');
	      d3.select(params.root + ' .viz_wrapper').style('width', '100px');
	      d3.select(params.root + ' .sidebar_wrapper').style('display', 'block');
	    }

	    // // resize parent div
	    // set_viz_wrapper_size(params);

	    d3.select(params.viz.viz_svg).style('opacity', 0.5);
	    var wait_time = 500;
	    if (params.viz.run_trans == true) {
	      wait_time = 2500;
	    }
	    setTimeout(resize_viz, wait_time, cgm);
	  });
	  // }
	};

/***/ },
/* 90 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var run_zoom = __webpack_require__(91);
	var ini_doubleclick = __webpack_require__(99);
	var reset_zoom = __webpack_require__(100);
	var resize_dendro = __webpack_require__(101);
	var resize_super_labels = __webpack_require__(102);
	var resize_spillover = __webpack_require__(103);
	var resize_borders = __webpack_require__(104);
	var resize_row_labels = __webpack_require__(105);
	var resize_highlights = __webpack_require__(106);
	var resize_row_viz = __webpack_require__(107);
	var resize_col_labels = __webpack_require__(108);
	var resize_col_text = __webpack_require__(109);
	var resize_col_triangle = __webpack_require__(110);
	var resize_col_hlight = __webpack_require__(111);
	var recalc_params_for_resize = __webpack_require__(112);
	var resize_row_tiles = __webpack_require__(113);
	var resize_label_bars = __webpack_require__(114);
	var label_constrain_and_trim = __webpack_require__(83);
	var make_dendro_triangles = __webpack_require__(57);
	var toggle_dendro_view = __webpack_require__(56);
	var show_visible_area = __webpack_require__(72);
	var calc_viz_dimensions = __webpack_require__(24);
	var position_play_button = __webpack_require__(115);
	var make_row_cat_super_labels = __webpack_require__(88);
	var ini_cat_reorder = __webpack_require__(80);
	var position_svg_dendro_slider = __webpack_require__(116);
	var ini_zoom_info = __webpack_require__(38);
	var grid_lines_viz = __webpack_require__(117);

	module.exports = function resize_viz(cgm) {

	  var params = cgm.params;

	  var cont_dim = calc_viz_dimensions(params);

	  d3.select(params.root + ' .play_button');
	  // .style('opacity', 0.2);


	  d3.select(params.root + ' .sidebar_wrapper').style('height', cont_dim.height + 'px');

	  d3.select(params.viz.viz_wrapper)
	  // .style('float', 'left')
	  .style('margin-top', cont_dim.top + 'px').style('width', cont_dim.width + 'px').style('height', cont_dim.height + 'px');

	  params = recalc_params_for_resize(params);

	  params.zoom_info = ini_zoom_info();

	  reset_zoom(params);

	  var svg_group = d3.select(params.viz.viz_svg);

	  // redefine x and y positions
	  _.each(params.network_data.links, function (d) {
	    d.x = params.viz.x_scale(d.target);
	    d.y = params.viz.y_scale(d.source);
	  });

	  // disable zoom while transitioning
	  svg_group.on('.zoom', null);

	  params.zoom_behavior.scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch]).on('zoom', function () {
	    run_zoom(cgm);
	  });

	  // reenable zoom after transition
	  if (params.viz.do_zoom) {
	    svg_group.call(params.zoom_behavior);
	  }

	  // prevent normal double click zoom etc
	  ini_doubleclick(cgm);

	  svg_group.attr('width', params.viz.svg_dim.width).attr('height', params.viz.svg_dim.height);

	  svg_group.select('.super_background').style('width', params.viz.svg_dim.width).style('height', params.viz.svg_dim.height);

	  svg_group.select('.grey_background').attr('width', params.viz.clust.dim.width).attr('height', params.viz.clust.dim.height);

	  setTimeout(position_play_button, 100, params);

	  var row_nodes = params.network_data.row_nodes;
	  var row_nodes_names = utils.pluck(row_nodes, 'name');

	  resize_row_tiles(params, svg_group);

	  svg_group.selectAll('.highlighting_rect').attr('width', params.viz.x_scale.rangeBand() * 0.80).attr('height', params.viz.y_scale.rangeBand() * 0.80);

	  resize_highlights(params);

	  // resize row labels
	  ///////////////////////////

	  resize_row_labels(params, svg_group);
	  resize_row_viz(params, svg_group);

	  // change the size of the highlighting rects
	  svg_group.selectAll('.row_label_group').each(function () {
	    var bbox = d3.select(this).select('text')[0][0].getBBox();
	    d3.select(this).select('rect').attr('x', bbox.x).attr('y', 0).attr('width', bbox.width).attr('height', params.viz.rect_height).style('fill', 'yellow').style('opacity', function (d) {
	      var inst_opacity = 0;
	      // highlight target genes
	      if (d.target === 1) {
	        inst_opacity = 1;
	      }
	      return inst_opacity;
	    });
	  });

	  // necessary to properly position row labels vertically
	  svg_group.selectAll('.row_label_group').select('text').attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);

	  if (utils.has(params.network_data.row_nodes[0], 'value')) {
	    resize_label_bars(cgm, svg_group);
	  }

	  svg_group.selectAll('.row_cat_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	  });

	  svg_group.selectAll('.row_cat_group').select('path').attr('d', function () {
	    var origin_x = params.viz.cat_room.symbol_width - 1;
	    var origin_y = 0;
	    var mid_x = 1;
	    var mid_y = params.viz.rect_height / 2;
	    var final_x = params.viz.cat_room.symbol_width - 1;
	    var final_y = params.viz.rect_height;
	    var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
	    return output_string;
	  });

	  var is_resize = true;
	  if (params.viz.show_dendrogram) {
	    make_dendro_triangles(cgm, 'row', is_resize);
	    make_dendro_triangles(cgm, 'col', is_resize);
	    resize_dendro(params, svg_group);

	    toggle_dendro_view(cgm, 'row', 0);
	    toggle_dendro_view(cgm, 'col', 0);
	  } else {
	    resize_dendro(params, svg_group);
	  }

	  resize_col_labels(params, svg_group);
	  resize_col_text(params, svg_group);
	  resize_col_triangle(params, svg_group);
	  resize_col_hlight(params, svg_group);

	  resize_super_labels(params, svg_group);
	  resize_spillover(params.viz, svg_group);

	  grid_lines_viz(params);

	  resize_borders(params, svg_group);

	  // reset zoom and translate
	  params.zoom_behavior.scale(1).translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

	  label_constrain_and_trim(params);

	  // reposition matrix
	  d3.select(params.root + ' .clust_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.clust.margin.top + ')');

	  // removed, this was causing bugs
	  if (cgm.params.viz.ds_level === -1) {
	    show_visible_area(cgm);
	  }

	  make_row_cat_super_labels(cgm);

	  d3.select(params.viz.viz_svg).style('opacity', 1);

	  ini_cat_reorder(cgm);

	  d3.select(cgm.params.root + ' .row_slider_group').style('opacity', 0);
	  d3.select(cgm.params.root + ' .col_slider_group').style('opacity', 0);

	  setTimeout(position_svg_dendro_slider, 500, cgm, 'row');
	  setTimeout(position_svg_dendro_slider, 500, cgm, 'col');
		};

/***/ },
/* 91 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var run_transformation = __webpack_require__(92);
	var zoom_rules_y = __webpack_require__(97);
	var zoom_rules_x = __webpack_require__(98);

	module.exports = function zoomed(cgm) {

	  var params = cgm.params;

	  var zoom_info = {};
	  zoom_info.zoom_x = d3.event.scale;
	  zoom_info.zoom_y = d3.event.scale;

	  // subtract away the margin to easily calculate pan_room etc.
	  zoom_info.trans_x = params.zoom_behavior.translate()[0] - params.viz.clust.margin.left;
	  zoom_info.trans_y = params.zoom_behavior.translate()[1] - params.viz.clust.margin.top;

	  d3.selectAll(params.viz.root_tips).style('display', 'none');

	  // // there will be negative trans_x that is not allowed while zooming in the
	  // // y direction only. Switch this to positive and add it to the trans_x when
	  // // x-zooming is allowed (will be reset when zooming has stopped)
	  // if (zoom_info.zoom_y < params.viz.zoom_switch){
	  //   // console.log('below')
	  //   cgm.params.viz.x_offset = -(zoom_info.trans_x + 100);
	  // }

	  // console.log('x_offset: ' + String(cgm.params.viz.x_offset))

	  // transfer zoom_info to params
	  params.zoom_info = zoom_rules_y(params, zoom_info);
	  params.zoom_info = zoom_rules_x(params, zoom_info);

	  // do not run transformation if moving slider
	  if (params.is_slider_drag === false && params.is_cropping === false) {

	    // reset translate vector - add back margins to trans_x and trans_y
	    var new_x = params.zoom_info.trans_x + params.viz.clust.margin.left;
	    var new_y = params.zoom_info.trans_y + params.viz.clust.margin.top;

	    params.zoom_behavior.translate([new_x, new_y]);
	    cgm.params = params;

	    run_transformation(cgm);
	  }
		};

/***/ },
/* 92 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var constrain_font_size = __webpack_require__(85);
	var show_visible_area = __webpack_require__(72);
	var resize_label_val_bars = __webpack_require__(93);
	var zoom_crop_triangles = __webpack_require__(64);
	var get_previous_zoom = __webpack_require__(67);
	var run_when_zoom_stopped = __webpack_require__(94);
	var check_zoom_stop_status = __webpack_require__(96);

	module.exports = function run_transformation(cgm) {

	  var params = cgm.params;

	  var zoom_info = params.zoom_info;

	  var prev_zoom = get_previous_zoom(params);

	  d3.select(params.root + ' .clust_group').attr('transform', 'translate(' + [zoom_info.trans_x, zoom_info.trans_y] + ') scale(' + zoom_info.zoom_x + ',' + zoom_info.zoom_y + ')');

	  d3.select(params.root + ' .row_label_zoom_container').attr('transform', 'translate(' + [0, zoom_info.trans_y] + ') scale(' + zoom_info.zoom_y + ')');

	  d3.select(params.root + ' .col_zoom_container').attr('transform', 'translate(' + [zoom_info.trans_x, 0] + ') scale(' + zoom_info.zoom_x + ')');

	  d3.select(params.root + ' .row_cat_container').attr('transform', 'translate(' + [0, zoom_info.trans_y] + ') scale( 1,' + zoom_info.zoom_y + ')');

	  d3.select(params.root + ' .row_dendro_container').attr('transform', 'translate(' + [params.viz.uni_margin / 2, zoom_info.trans_y] + ') ' + 'scale( 1,' + zoom_info.zoom_y + ')');

	  d3.select(params.root + ' .row_dendro_icons_group').attr('transform', function () {
	    var inst_y = zoom_info.trans_y;
	    var inst_translate = 'translate(' + [0, inst_y] + ') ';
	    var inst_zoom = 'scale(1, ' + zoom_info.zoom_y + ')';
	    var transform_string = inst_translate + inst_zoom;
	    return transform_string;
	  });

	  d3.select(params.root + ' .col_dendro_icons_group').attr('transform', function () {
	    var inst_x = zoom_info.trans_x;
	    var inst_translate = 'translate(' + [inst_x, 0] + ')';
	    var inst_zoom = 'scale(' + zoom_info.zoom_x + ', 1)';
	    var transform_string = inst_translate + inst_zoom;
	    return transform_string;
	  });

	  zoom_crop_triangles(params, zoom_info, 'row');
	  zoom_crop_triangles(params, zoom_info, 'col');

	  d3.select(params.root + ' .col_cat_container').attr('transform', 'translate(' + [zoom_info.trans_x, 0] + ') scale(' + zoom_info.zoom_x + ',1)');

	  d3.select(params.root + ' .col_dendro_container').attr('transform', 'translate(' + [zoom_info.trans_x, params.viz.uni_margin / 2] + ') scale(' + zoom_info.zoom_x + ',1)');

	  resize_label_val_bars(params, zoom_info);

	  d3.select(params.root + ' .viz_svg').attr('is_zoom', function () {
	    var inst_zoom = Number(d3.select(params.root + ' .viz_svg').attr('is_zoom'));
	    d3.select(params.root + ' .viz_svg').attr('stopped_zoom', 1);
	    return inst_zoom + 1;
	  });

	  // this function runs with a slight delay and tells the visualization that
	  // this particular zoom event is over, reducing the total number of zoom
	  // events that need to finish
	  var not_zooming = function not_zooming() {

	    d3.select(params.root + ' .viz_svg').attr('is_zoom', function () {
	      var inst_zoom = Number(d3.select(params.root + ' .viz_svg').attr('is_zoom'));
	      return inst_zoom - 1;
	    });
	  };

	  constrain_font_size(params);

	  if (zoom_info.zoom_y <= prev_zoom.zoom_y) {

	    var zooming_out = false;
	    if (zoom_info.zoom_y < prev_zoom.zoom_y) {
	      zooming_out = true;
	    }

	    // zooming has not stopped and zooming out is true
	    var zooming_stopped = false;
	    show_visible_area(cgm, zooming_stopped, zooming_out);
	  }

	  setTimeout(not_zooming, 50);
	  setTimeout(check_if_zooming_has_stopped, 100, cgm);

	  function check_if_zooming_has_stopped(cgm) {
	    var params = cgm.params;

	    var stop_attributes = check_zoom_stop_status(params);

	    if (stop_attributes === true) {
	      // wait and double check that zooming has stopped
	      setTimeout(run_when_zoom_stopped, 50, cgm);
	    }
	  }
		};

/***/ },
/* 93 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);

	module.exports = function resize_label_val_bars(params) {

	  var zoom_info = params.zoom_info;

	  // resize label bars if necessary
	  if (utils.has(params.network_data.row_nodes[0], 'value')) {
	    d3.selectAll(params.root + ' .row_bars').attr('width', function (d) {
	      var inst_value = 0;
	      inst_value = params.labels.bar_scale_row(Math.abs(d.value)) / zoom_info.zoom_y;
	      return inst_value;
	    }).attr('x', function (d) {
	      var inst_value = 0;
	      inst_value = -params.labels.bar_scale_row(Math.abs(d.value)) / zoom_info.zoom_y;
	      return inst_value;
	    });
	  }

	  if (utils.has(params.network_data.col_nodes[0], 'value')) {
	    d3.selectAll(params.root + ' .col_bars').attr('width', function (d) {
	      var inst_value = 0;
	      if (d.value > 0) {
	        inst_value = params.labels.bar_scale_col(d.value) / zoom_info.zoom_x;
	      }
	      return inst_value;
	    });
	  }
		};

/***/ },
/* 94 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var constrain_font_size = __webpack_require__(85);
	var trim_text = __webpack_require__(84);
	var num_visible_labels = __webpack_require__(95);
	var toggle_grid_lines = __webpack_require__(87);
	var show_visible_area = __webpack_require__(72);
	var check_zoom_stop_status = __webpack_require__(96);

	module.exports = function run_when_zoom_stopped(cgm) {

	  var params = cgm.params;

	  var stop_attributes = check_zoom_stop_status(params);

	  if (stop_attributes === true) {

	    // ///////////////////////////////////////////////
	    // // zooming has stopped
	    // ///////////////////////////////////////////////
	    // console.log('\nZOOMING HAS ACTUALLY STOPPED\n============================');
	    // console.log(params.zoom_info.zoom_y)

	    _.each(['row', 'col'], function (inst_rc) {

	      d3.selectAll(params.root + ' .' + inst_rc + '_label_group').select('text').style('opacity', 1);

	      d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').select('path').style('display', 'block');
	    });

	    show_visible_area(cgm, true);

	    d3.selectAll(params.viz.root_tips).style('display', 'block');

	    d3.selectAll(params.root + ' .row_label_group').select('text').style('display', 'none');
	    d3.selectAll(params.root + ' .row_label_group').select('text').style('display', 'block');

	    d3.select(params.root + ' .viz_svg').attr('stopped_zoom', 0);

	    d3.selectAll(params.root + ' .row_label_group').select('text').style('display', 'block');
	    d3.selectAll(params.root + ' .col_label_group').select('text').style('display', 'block');

	    toggle_grid_lines(params);

	    // reset x_offset
	    cgm.params.viz.x_offset = 0;

	    var max_labels_to_trim = 150;
	    // probably do not need
	    /////////////////////////
	    _.each(['row', 'col'], function (inst_rc) {

	      var inst_num_visible = num_visible_labels(params, inst_rc);

	      if (inst_num_visible < max_labels_to_trim) {
	        d3.selectAll(params.root + ' .' + inst_rc + '_label_group').each(function () {
	          trim_text(params, this, inst_rc);
	        });
	      }
	    });

	    text_patch();

	    constrain_font_size(params);

	    // this makes sure that the text is visible after zooming and trimming
	    // there is buggy behavior in chrome when zooming into large matrices
	    // I'm running it twice in quick succession
	    setTimeout(text_patch, 100);
	  }

	  function text_patch() {

	    _.each(['row', 'col'], function (inst_rc) {

	      d3.selectAll(params.root + ' .' + inst_rc + '_label_group').filter(function () {
	        return d3.select(this).style('display') != 'none';
	      }).select('text').style('font-size', function () {
	        var inst_fs = Number(d3.select(this).style('font-size').replace('px', ''));
	        return inst_fs;
	      });
	    });
	  }
		};

/***/ },
/* 95 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function num_visible_labels(params, inst_rc) {

	  // counting the number of visible labels, probably not necessary

	  var num_visible;
	  if (inst_rc === 'row') {

	    // initialize at high number
	    num_visible = 10000;

	    // only count visible rows if no downsampling
	    if (params.viz.ds_level === -1) {
	      num_visible = d3.selectAll(params.root + ' .row')[0].length;
	    }
	  } else if (inst_rc === 'col') {

	    num_visible = d3.selectAll(params.root + ' .' + inst_rc + '_label_text').filter(function () {
	      return d3.select(this).style('display') != 'none';
	    })[0].length;
	  }

	  return num_visible;
	};

/***/ },
/* 96 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function check_zoom_stop_status(params) {

	  var inst_zoom = Number(d3.select(params.root + ' .viz_svg').attr('is_zoom'));

	  var check_stop = Number(d3.select(params.root + ' .viz_svg').attr('stopped_zoom'));

	  var stop_attributes = false;
	  if (inst_zoom === 0 && check_stop != 0) {
	    stop_attributes = true;
	  }

	  return stop_attributes;
	};

/***/ },
/* 97 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function zoom_rules_y(params, zoom_info) {

	  var viz = params.viz;
	  // zoom in the x direction before zooming in the y direction
	  if (viz.zoom_switch_y > 1) {
	    if (zoom_info.zoom_y < viz.zoom_switch_y) {
	      zoom_info.trans_y = 0;
	      zoom_info.zoom_y = 1;
	    } else {
	      zoom_info.zoom_y = zoom_info.zoom_y / viz.zoom_switch_y;
	    }
	  }

	  // calculate panning room available in the y direction
	  zoom_info.pan_room_y = (zoom_info.zoom_y - 1) * viz.clust.dim.height;

	  // console.log( 'pan_room_y: ' +  String(zoom_info.pan_room_y) + ' ' + String(-zoom_info.trans_y))

	  // no positive panning or panning more than pan_room
	  if (zoom_info.trans_y >= 0) {
	    zoom_info.trans_y = 0;
	    // console.log('y no positive panning\n\n')
	  } else if (zoom_info.trans_y <= -zoom_info.pan_room_y) {
	    zoom_info.trans_y = -zoom_info.pan_room_y;
	    // console.log('y restrict pan room \n\n')
	  }

	  return zoom_info;
	};

/***/ },
/* 98 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function zoom_rules_x(params, zoom_info) {

	  var viz = params.viz;

	  // zoom in the y direction before zooming in the x direction
	  if (viz.zoom_switch > 1) {

	    if (zoom_info.zoom_x < viz.zoom_switch) {

	      // remove this
	      // zoom_info.trans_x = - params.viz.clust.margin.left;

	      zoom_info.zoom_x = 1;
	    } else {
	      zoom_info.zoom_x = zoom_info.zoom_x / viz.zoom_switch;

	      // console.log('********* zoom_x: ' + String(zoom_info.zoom_x))

	      // zoom_info.trans_x = zoom_info.trans_x + params.viz.x_offset;
	      // zoom_info.trans_x = zoom_info.trans_x * (params.zoom_info.zoom_x/params.zoom_info.zoom_y);
	    }
	  }

	  // calculate panning room available in the x direction
	  zoom_info.pan_room_x = (zoom_info.zoom_x - 1) * viz.clust.dim.width;

	  // console.log( 'pan_room_x: ' +  String(zoom_info.pan_room_x) + ' trans_x: ' + String(-zoom_info.trans_x))

	  // no positive panning or panning more than pan_room
	  if (zoom_info.trans_x > 0) {
	    zoom_info.trans_x = 0;
	    // console.log('no positive panning\n\n')
	  } else if (zoom_info.trans_x <= -zoom_info.pan_room_x) {
	    zoom_info.trans_x = -zoom_info.pan_room_x;
	    // console.log('******* restrict pan room\n\n')
	  }

	  return zoom_info;
	};

/***/ },
/* 99 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var two_translate_zoom = __webpack_require__(82);

	module.exports = function ini_doubleclick(cgm) {

	  var params = cgm.params;
	  // disable double-click zoom
	  d3.selectAll(params.viz.zoom_element).on('dblclick.zoom', null);

	  d3.select(params.viz.zoom_element).on('dblclick', function () {
	    two_translate_zoom(cgm, 0, 0, 1);
	  });
	};

/***/ },
/* 100 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params) {

	  // reset zoom
	  //////////////////////////////
	  var zoom_y = 1;
	  // var zoom_x = 1;
	  var pan_dx = 0;
	  var pan_dy = 0;

	  var half_height = params.viz.clust.dim.height / 2;
	  var center_y = -(zoom_y - 1) * half_height;

	  d3.select(params.root + ' .clust_group').attr('transform', 'translate(' + [0, 0 + center_y] + ')' + ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx, pan_dy] + ')');

	  d3.select(params.root + ' .row_label_zoom_container').attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' + zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

	  d3.select(params.root + ' .row_cat_container').attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

	  d3.select(params.root + ' .row_dendro_container').attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' + zoom_y + ',' + zoom_y + ')' + 'translate(' + [params.viz.uni_margin / 2, pan_dy] + ')');

	  d3.select(params.root + ' .col_zoom_container').attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

	  d3.select(params.root + ' .col_cat_container').attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

	  d3.select(params.root + ' .col_dendro_container').attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [pan_dx, params.viz.uni_margin / 2] + ')');

	  // reset crop button zooming
	  d3.select(params.root + ' .row_dendro_icons_group').attr('transform', function () {
	    return 'translate(0,0) scale(1)';
	  });

	  d3.select(params.root + ' .row_dendro_icons_group').selectAll('path').attr('transform', function (d) {
	    var inst_x = 7;
	    var inst_y = d.pos_mid;
	    return 'translate(' + inst_x + ',' + inst_y + ') ' + 'scale(1, 1)';
	  });
		};

/***/ },
/* 101 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_dendro(params, svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  // resize dendrogram
	  ///////////////////

	  var delays = {};

	  if (delay_info === false) {
	    delays.run_transition = false;
	  } else {
	    delays = delay_info;
	  }

	  var duration = params.viz.duration;
	  var col_nodes = params.network_data.col_nodes;
	  var col_nodes_names = params.network_data.col_nodes_names;

	  var dendro_group;
	  if (delays.run_transition) {

	    dendro_group = svg_group.transition().delay(delays.update).duration(duration);

	    svg_group.selectAll('.col_cat_group')
	    // data binding needed for loss/gain of columns
	    .data(col_nodes, function (d) {
	      return d.name;
	    }).transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });

	    svg_group.selectAll('.col_dendro_group')
	    // data binding needed for loss/gain of columns
	    .data(col_nodes, function (d) {
	      return d.name;
	    }).transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });
	  } else {

	    dendro_group = svg_group;

	    svg_group.selectAll('.col_cat_group')
	    // data binding needed for loss/gain of columns
	    .data(col_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });

	    d3.select(params.root).selectAll('.col_dendro_group')
	    // data binding needed for loss/gain of columns
	    .data(col_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });
	  }

	  var i;
	  var inst_class;

	  _.each(['row', 'col'], function (inst_rc) {

	    var num_cats = params.viz.all_cats[inst_rc].length;

	    for (i = 0; i < num_cats; i++) {
	      inst_class = '.' + inst_rc + '_cat_rect_' + String(i);

	      if (inst_rc === 'row') {
	        dendro_group.selectAll(inst_class).attr('height', params.viz.y_scale.rangeBand());
	      } else {
	        dendro_group.selectAll(inst_class).attr('width', params.viz.x_scale.rangeBand());
	      }
	    }
	  });

	  // position row_dendro_outer_container
	  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
	  var y_offset = params.viz.clust.margin.top;
	  var spillover_width = params.viz.dendro_room.row + params.viz.uni_margin;

	  d3.select(params.root + ' .viz_svg').select('row_dendro_outer_container').attr('transform', 'translate(' + x_offset + ',' + y_offset + ')');

	  d3.select(params.root + ' .row_dendro_outer_container').select('.row_dendro_spillover').attr('width', spillover_width + 'px').attr('height', params.viz.svg_dim.height);

	  x_offset = params.viz.clust.margin.left;
	  y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;
	  var spillover_height = params.viz.dendro_room.col + params.viz.uni_margin;

	  d3.select(params.root + ' .col_dendro_outer_container').select('.col_dendro_spillover').attr('width', params.viz.svg_dim.width).attr('height', spillover_height + 'px');

	  d3.select(params.root + ' .col_dendro_outer_container').select('.col_dendro_spillover_top').attr('width', params.viz.svg_dim.width).attr('height', params.viz.svg_dim.height).attr('transform', 'translate(0,' + params.viz.dendro_room.col + ')');

	  x_offset = params.viz.clust.margin.left;
	  y_offset = 0;
	  d3.select(params.root + ' .col_dendro_icons_container').attr('transform', 'translate(' + x_offset + ',' + y_offset + ')');
		};

/***/ },
/* 102 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_super_labels(params, ini_svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  var delays = {};
	  var duration = params.viz.duration;
	  var svg_group;

	  if (delay_info === false) {
	    delays.run_transition = false;
	  } else {
	    delays = delay_info;
	  }

	  if (delays.run_transition) {
	    svg_group = ini_svg_group.transition().delay(delays.update).duration(duration);
	  } else {
	    svg_group = ini_svg_group;
	  }

	  svg_group.select('.super_col_bkg').attr('height', params.viz.super_labels.dim.width + 'px').attr('transform', 'translate(0,' + params.viz.grey_border_width + ')');

	  // super col title
	  svg_group.select('.super_col').attr('transform', function () {
	    var inst_x = params.viz.clust.dim.width / 2 + params.viz.norm_labels.width.row;
	    var inst_y = params.viz.super_labels.dim.width;
	    return 'translate(' + inst_x + ',' + inst_y + ')';
	  });

	  svg_group.select('.super_row_bkg').attr('width', params.viz.super_labels.dim.width + 'px').attr('transform', 'translate(' + params.viz.grey_border_width + ',0)');

	  svg_group.select('.super_row').attr('transform', function () {
	    var inst_x = params.viz.super_labels.dim.width;
	    var inst_y = params.viz.clust.dim.height / 2 + params.viz.norm_labels.width.col;
	    return 'translate(' + inst_x + ',' + inst_y + ')';
	  });
		};

/***/ },
/* 103 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_spillover(viz, ini_svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  var delays = {};
	  var duration = viz.duration;
	  var svg_group;

	  if (delay_info === false) {
	    delays.run_transition = false;
	  } else {
	    delays = delay_info;
	  }

	  if (delays.run_transition) {
	    svg_group = ini_svg_group.transition().delay(delays.update).duration(duration);
	  } else {
	    svg_group = ini_svg_group;
	  }

	  svg_group.select(viz.root + ' .right_slant_triangle').attr('transform', 'translate(' + viz.clust.dim.width + ',' + viz.norm_labels.width.col + ')');

	  svg_group.select(viz.root + ' .left_slant_triangle').attr('transform', 'translate(-1,' + viz.norm_labels.width.col + ')');

	  var rect_height = viz.clust.margin.top + viz.uni_margin / 5;
	  svg_group.select(viz.root + ' .top_left_white').attr('width', viz.clust.margin.left).attr('height', rect_height);

	  var tmp_left = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin + viz.dendro_room.row;
	  var tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

	  svg_group.select(viz.root + ' .right_spillover_container').attr('transform', function () {
	    return 'translate(' + tmp_left + ', 0)';
	  });

	  tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

	  svg_group.select(viz.root + ' .right_spillover_container rect').attr('transform', function () {
	    return 'translate( 0,' + tmp_top + ')';
	  });

	  svg_group.select(viz.root + ' .right_spillover').attr('height', viz.svg_dim.height + 'px');

	  // resize dendro spillovers
	  var x_offset = viz.clust.margin.left + viz.clust.dim.width;
	  var y_offset = tmp_top;
	  var tmp_width = viz.dendro_room.row + viz.uni_margin;
	  var tmp_height = viz.cat_room.col + viz.uni_margin;
	  d3.select(viz.root + ' .dendro_row_spillover').attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  });

	  // hide spillover left top of col dendrogram
	  x_offset = 0;
	  y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  tmp_width = viz.clust.margin.left;
	  tmp_height = viz.clust.dim.height * 10;

	  svg_group.select('.dendro_col_spillover').attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  });

	  x_offset = viz.clust.margin.left + viz.clust.dim.width;
	  y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  tmp_width = viz.cat_room.col + viz.clust.dim.width;
	  tmp_height = viz.cat_room.row + viz.uni_margin;

	  svg_group.select('.dendro_corner_spillover').attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  });

	  x_offset = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin;
	  y_offset = viz.norm_labels.margin.top + viz.norm_labels.width.col + 2.5 * viz.uni_margin;
	  var extra_x_room = 2.75;
	  var extra_y_room = 1.2;

	  // reposition category superlabels
	  if (viz.show_categories.col) {

	    d3.selectAll(viz.root + ' .col_cat_super').attr('transform', function (d) {
	      var inst_cat = parseInt(d.split('-')[1], 10);
	      var inst_y = y_offset + extra_y_room * viz.cat_room.symbol_width * inst_cat;
	      return 'translate(' + x_offset + ',' + inst_y + ')';
	    });
	  }

	  if (viz.show_categories.row) {
	    d3.select(viz.root + ' .row_cat_label_container').attr('transform', function () {
	      x_offset = viz.norm_labels.margin.left + viz.norm_labels.width.row + viz.cat_room.symbol_width + extra_x_room * viz.uni_margin;
	      y_offset = viz.clust.margin.top - viz.uni_margin;
	      return 'translate(' + x_offset + ',' + y_offset + ') rotate(-90)';
	    });
	  }

	  // white border bottom - prevent clustergram from hitting border
	  if (viz.show_dendrogram) {
	    y_offset = viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col - 2 * viz.uni_margin;
	  } else {
	    y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  }

	  d3.select(viz.root + ' .bottom_spillover_container').attr('transform', function () {
	    // shift up enough to show the entire border width
	    return 'translate(0,' + y_offset + ')';
	  });

	  svg_group.select(viz.root + ' .bottom_spillover').attr('width', viz.svg_dim.width).attr('height', 2 * viz.svg_dim.height);

	  var inst_height = viz.cat_room.col + 1.5 * viz.uni_margin;
	  // white rect to cover excess labels
	  d3.select(viz.viz_svg + ' .top_right_white').attr('fill', viz.background_color).attr('width', 2 * viz.clust.dim.width).attr('height', inst_height).attr('transform', function () {
	    var tmp_left = viz.clust.margin.left + viz.clust.dim.width;
	    var tmp_top = viz.norm_labels.width.col + viz.norm_labels.margin.top - viz.uni_margin;
	    return 'translate(' + tmp_left + ', ' + tmp_top + ')';
	  });
		};

/***/ },
/* 104 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_borders(params, svg_group) {

	  // left border
	  svg_group.select('.left_border').attr('width', params.viz.grey_border_width).attr('height', params.viz.svg_dim.height).attr('transform', 'translate(0,0)');

	  // right border
	  svg_group.select('.right_border').attr('width', params.viz.grey_border_width).attr('height', params.viz.svg_dim.height).attr('transform', function () {
	    var inst_offset = params.viz.svg_dim.width - params.viz.grey_border_width;
	    return 'translate(' + inst_offset + ',0)';
	  });

	  // top border
	  svg_group.select('.top_border').attr('width', params.viz.svg_dim.width).attr('height', params.viz.grey_border_width).attr('transform', function () {
	    var inst_offset = 0;
	    return 'translate(' + inst_offset + ',0)';
	  });

	  // bottom border
	  svg_group.select('.bottom_border').attr('width', params.viz.svg_dim.width).attr('height', params.viz.grey_border_width).attr('transform', function () {
	    var inst_offset = params.viz.svg_dim.height - params.viz.grey_border_width;
	    return 'translate(0,' + inst_offset + ')';
	  });
		};

/***/ },
/* 105 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_row_labels(params, ini_svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  var delays = {};
	  var duration = params.viz.duration;
	  var svg_group;

	  var row_nodes = params.network_data.row_nodes;
	  var row_nodes_names = params.network_data.row_nodes_names;

	  if (delay_info === false) {
	    delays.run_transition = false;
	  } else {
	    delays = delay_info;
	  }

	  if (delays.run_transition) {

	    ini_svg_group.selectAll('.row_label_group')
	    // data bind necessary for loss/gain of rows
	    .data(row_nodes, function (d) {
	      return d.name;
	    }).transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    }).attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);

	    svg_group = ini_svg_group.transition().delay(delays.update).duration(duration);
	  } else {

	    ini_svg_group.selectAll('.row_label_group')
	    // data bind necessary for loss/gain of rows
	    .data(row_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    }).attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);

	    svg_group = ini_svg_group;
	  }

	  svg_group.select(params.root + ' .row_container').attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' + params.viz.clust.margin.top + ')');

	  svg_group.select(params.root + ' .row_container').select('.white_bars').attr('width', params.viz.label_background.row).attr('height', 30 * params.viz.clust.dim.height + 'px');

	  svg_group.select(params.root + ' .row_container').select('.row_label_container').attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)');
		};

/***/ },
/* 106 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_highlights(params) {

	  // reposition tile highlight
	  ////////////////////////////////

	  var rel_width_hlight = 6;
	  // var opacity_hlight = 0.85;
	  var hlight_width = rel_width_hlight * params.viz.border_width.x;
	  var hlight_height = rel_width_hlight * params.viz.border_width.y; ///params.viz.zoom_switch;

	  // top highlight
	  d3.select(params.root + ' .top_hlight').attr('width', params.viz.rect_width).attr('height', hlight_height).attr('transform', function () {
	    return 'translate(' + params.viz.x_scale(params.matrix.click_hlight_x) + ',0)';
	  });

	  // left highlight
	  d3.select(params.root + ' .left_hlight').attr('width', hlight_width).attr('height', params.viz.rect_width - hlight_height * 0.99).attr('transform', function () {
	    return 'translate(' + params.viz.x_scale(params.matrix.click_hlight_x) + ',' + hlight_height * 0.99 + ')';
	  });

	  // right highlight
	  d3.select(params.root + ' .right_hlight').attr('width', hlight_width).attr('height', params.viz.rect_height - hlight_height * 0.99).attr('transform', function () {
	    var tmp_translate = params.viz.x_scale(params.matrix.click_hlight_x) + params.viz.rect_width - hlight_width;
	    return 'translate(' + tmp_translate + ',' + hlight_height * 0.99 + ')';
	  });

	  // bottom highlight
	  d3.select(params.root + ' .bottom_hlight').attr('width', function () {
	    return params.viz.rect_width - 1.98 * hlight_width;
	  }).attr('height', hlight_height).attr('transform', function () {
	    var tmp_translate_x = params.viz.x_scale(params.matrix.click_hlight_x) + hlight_width * 0.99;
	    var tmp_translate_y = params.viz.rect_height - hlight_height;
	    return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
	  });

	  // resize row highlight
	  /////////////////////////
	  d3.select(params.root + ' .row_top_hlight').attr('width', params.viz.svg_dim.width).attr('height', hlight_height);

	  d3.select(params.root + ' .row_bottom_hlight').attr('width', params.viz.svg_dim.width).attr('height', hlight_height).attr('transform', function () {
	    var tmp_translate_y = params.viz.rect_height - hlight_height;
	    return 'translate(0,' + tmp_translate_y + ')';
	  });

	  // resize col highlight
	  /////////////////////////
	  d3.select(params.root + ' .col_top_hlight').attr('width', params.viz.clust.dim.height).attr('height', hlight_width).attr('transform', function () {
	    var tmp_translate_y = 0;
	    var tmp_translate_x = -(params.viz.clust.dim.height + params.viz.cat_room.col + params.viz.uni_margin);
	    return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
	  });

	  d3.select(params.root + ' .col_bottom_hlight').attr('width', params.viz.clust.dim.height).attr('height', hlight_width).attr('transform', function () {
	    var tmp_translate_y = params.viz.rect_width - hlight_width;
	    var tmp_translate_x = -(params.viz.clust.dim.height + params.viz.cat_room.col + params.viz.uni_margin);
	    return 'translate(' + tmp_translate_x + ',' + tmp_translate_y + ')';
	  });
		};

/***/ },
/* 107 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_row_viz(params, ini_svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  var delays = {};
	  var duration = params.viz.duration;
	  var svg_group;

	  if (delay_info === false) {
	    delays.run_transition = false;
	  } else {
	    delays = delay_info;
	  }

	  if (delays.run_transition) {
	    svg_group = ini_svg_group.transition().delay(delays.update).duration(duration);
	  } else {
	    svg_group = ini_svg_group;
	  }

	  svg_group.select('.row_cat_outer_container').attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)').select('white_bars').attr('width', params.viz.cat_room.row + 'px').attr('height', function () {
	    var inst_height = params.viz.clust.dim.height;
	    return inst_height;
	  });

	  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
	  var y_offset = params.viz.clust.margin.top;
	  svg_group.select('.row_dendro_outer_container').attr('transform', 'translate(' + x_offset + ',' + y_offset + ')');

	  // !! tmp resize col dendro
	  x_offset = params.viz.clust.margin.left;
	  y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;

	  svg_group.select(' .col_dendro_outer_container').attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  });
		};

/***/ },
/* 108 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params, ini_svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  var delays = {};
	  var duration = params.viz.duration;
	  var svg_group;

	  var col_nodes = params.network_data.col_nodes;
	  var col_nodes_names = params.network_data.col_nodes_names;

	  if (delay_info === false) {
	    delays.run_transition = false;
	  } else {
	    delays = delay_info;
	  }

	  if (delays.run_transition) {
	    svg_group = ini_svg_group.transition().delay(delays.update).duration(duration);

	    ini_svg_group.selectAll('.col_label_text').data(col_nodes, function (d) {
	      return d.name;
	    }).transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ', 0) rotate(-90)';
	    });
	  } else {
	    svg_group = ini_svg_group;

	    ini_svg_group.selectAll('.col_label_text').data(col_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ', 0) rotate(-90)';
	    });
	  }

	  // offset click group column label
	  var x_offset_click = params.viz.x_scale.rangeBand() / 2 + params.viz.border_width.x;

	  svg_group.select(params.root + ' .col_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.norm_labels.margin.top + ')');

	  svg_group.select(params.root + ' .col_container').select('.white_bars').attr('width', 30 * params.viz.clust.dim.width + 'px').attr('height', params.viz.label_background.col);

	  svg_group.select(params.root + ' .col_container').select('.col_label_outer_container').attr('transform', 'translate(0,' + params.viz.norm_labels.width.col + ')');

	  svg_group.selectAll('.col_label_group').attr('transform', 'translate(' + params.viz.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

	  svg_group.selectAll('.col_label_group').select('text').attr('y', params.viz.x_scale.rangeBand() * 0.60).attr('dx', 2 * params.viz.border_width.x);
		};

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);

	module.exports = function resize_col_text(params, svg_group) {
	  svg_group.selectAll('.col_label_group').select('text').style('font-size', params.labels.default_fs_col + 'px').text(function (d) {
	    return utils.normal_name(d);
	  });

	  svg_group.selectAll('.col_label_group').each(function () {
	    d3.select(this).select('text')[0][0].getBBox();
	  });
	};

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var col_viz_aid_triangle = __webpack_require__(76);

	module.exports = function resize_col_triangle(params, ini_svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  // resize column triangle
	  var ini_triangle_group = ini_svg_group.selectAll('.col_label_group').select('path');

	  var delays = {};
	  var duration = params.viz.duration;

	  if (delay_info === false) {
	    delays.run_transition = false;
	  } else {
	    delays = delay_info;
	  }

	  var triangle_group;
	  if (delays.run_transition) {
	    triangle_group = ini_triangle_group.transition().delay(delays.update).duration(duration);
	  } else {
	    triangle_group = ini_triangle_group;
	  }

	  triangle_group.attr('d', function () {
	    return col_viz_aid_triangle(params);
	  }).attr('fill', '#eee');
		};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);

	module.exports = function resize_col_hlight(params, svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  var delays = {};
	  // var duration = params.viz.duration;

	  if (delay_info === false) {
	    delays.run_transition = false;
	  } else {
	    delays = delay_info;
	  }

	  if (utils.has(params.network_data.col_nodes[0], 'value')) {

	    svg_group.selectAll('.col_bars').data(params.network_data.col_nodes, function (d) {
	      return d.name;
	    }).attr('width', function (d) {

	      var inst_value = 0;

	      if (d.value > 0) {
	        inst_value = params.labels.bar_scale_col(d.value);
	      }
	      return inst_value;
	    })
	    // rotate labels - reduce width if rotating
	    .attr('height', params.viz.rect_width * 0.66);
	  }
		};

/***/ },
/* 112 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_svg_dim = __webpack_require__(25);
	var calc_clust_height = __webpack_require__(28);
	var calc_clust_width = __webpack_require__(27);
	var calc_default_fs = __webpack_require__(37);
	var calc_zoom_switching = __webpack_require__(36);

	module.exports = function recalc_params_for_resize(params) {

	  // Resetting some visualization parameters
	  params = get_svg_dim(params);
	  params.viz = calc_clust_width(params.viz);
	  params.viz = calc_clust_height(params.viz);

	  if (params.sim_mat) {
	    if (params.viz.clust.dim.width <= params.viz.clust.dim.height) {
	      params.viz.clust.dim.height = params.viz.clust.dim.width;
	    } else {
	      params.viz.clust.dim.width = params.viz.clust.dim.height;
	    }
	  }

	  params.viz = calc_zoom_switching(params.viz);

	  // redefine x_scale and y_scale rangeBands
	  params.viz.x_scale.rangeBands([0, params.viz.clust.dim.width]);
	  params.viz.y_scale.rangeBands([0, params.viz.clust.dim.height]);

	  // redefine border width
	  params.viz.border_width.x = params.viz.x_scale.rangeBand() / params.viz.border_fraction;
	  params.viz.border_width.y = params.viz.y_scale.rangeBand() / params.viz.border_fraction;

	  params.viz.rect_width = params.viz.x_scale.rangeBand() - params.viz.border_width.x;
	  params.viz.rect_height = params.viz.y_scale.rangeBand() - params.viz.border_width.y;

	  // for downsampling
	  if (params.viz.ds != null) {
	    for (var i; i < params.viz.ds.length; i++) {
	      params.viz.ds[i].rect_height = params.viz.ds[i].y_scale.rangeBand() - params.viz.border_width.y;
	    }
	  }

	  // recalc downsampled y_scale if necessary
	  if (params.viz.ds_num_levels > 0) {
	    _.each(params.viz.ds, function (inst_ds) {

	      // y_scale
	      /////////////////////////
	      inst_ds.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);
	      inst_ds.y_scale.domain(d3.range(inst_ds.num_rows + 1));

	      inst_ds.rect_height = inst_ds.y_scale.rangeBand() - params.viz.border_width.y;
	    });
	  }

	  // redefine zoom extent
	  params.viz.real_zoom = params.viz.norm_labels.width.col / (params.viz.rect_width / 2);

	  // the default font sizes are set here
	  params = calc_default_fs(params);

	  return params;
	};

/***/ },
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var draw_up_tile = __webpack_require__(45);
	var draw_dn_tile = __webpack_require__(46);
	var fine_position_tile = __webpack_require__(49);

	module.exports = function resize_row_tiles(params, svg_group) {

	  var row_nodes_names = params.network_data.row_nodes_names;

	  if (params.viz.ds_level === -1) {

	    // no downsampling
	    ///////////////////////

	    // resize rows
	    svg_group.selectAll('.row').attr('transform', function (d) {
	      var tmp_index = _.indexOf(row_nodes_names, d.name);
	      var inst_y = params.viz.y_scale(tmp_index);
	      return 'translate(0,' + inst_y + ')';
	    });

	    // resize tiles
	    svg_group.selectAll('.row').selectAll('.tile').attr('transform', function (d) {
	      return fine_position_tile(params, d);
	    }).attr('width', params.viz.rect_width).attr('height', params.viz.rect_height);

	    // resize tile_up
	    svg_group.selectAll('.row').selectAll('.tile_up').attr('d', function () {
	      return draw_up_tile(params);
	    }).attr('transform', function (d) {
	      return fine_position_tile(params, d);
	    });

	    // resize tile_dn
	    svg_group.selectAll('.row').selectAll('.tile_dn').attr('d', function () {
	      return draw_dn_tile(params);
	    }).attr('transform', function (d) {
	      return fine_position_tile(params, d);
	    });
	  } else {

	    // downsampling
	    /////////////////////////

	    var ds_level = params.viz.ds_level;
	    var row_class = '.ds' + String(ds_level) + '_row';
	    var ds_rect_height = params.viz.ds[ds_level].rect_height;

	    svg_group.selectAll(row_class).attr('transform', function (d) {
	      var inst_y = params.viz.ds[ds_level].y_scale(d.row_index);
	      return 'translate(0,' + inst_y + ')';
	    });

	    // reset ds-tiles
	    svg_group.selectAll(row_class).selectAll('.tile').attr('transform', function (d) {
	      return fine_position_tile(params, d);
	    }).attr('width', params.viz.rect_width).attr('height', ds_rect_height);
	  }
		};

/***/ },
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_val_max = __webpack_require__(29);

	module.exports = function resize_label_bars(cgm, svg_group) {
	  var params = cgm.params;

	  // // set bar scale
	  // var val_max = Math.abs(_.max( params.network_data.row_nodes, function(d) {
	  //   return Math.abs(d.value);
	  // } ).value) ;

	  // params.labels.bar_scale_row = d3.scale
	  //   .linear()
	  //   .domain([0, val_max])
	  //   .range([0, params.viz.norm_labels.width.row ]);

	  params = calc_val_max(params);

	  svg_group.selectAll('.row_bars')
	  // .transition().delay(delays.update).duration(duration)
	  .attr('width', function (d) {
	    var inst_value = 0;
	    inst_value = params.labels.bar_scale_row(Math.abs(d.value));
	    return inst_value;
	  }).attr('x', function (d) {
	    var inst_value = 0;
	    inst_value = -params.labels.bar_scale_row(Math.abs(d.value));
	    return inst_value;
	  }).attr('height', params.viz.y_scale.rangeBand());
		};

/***/ },
/* 115 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function position_play_button(params) {

	  var clust_transform = d3.select(params.root + ' .clust_container').attr('transform');

	  var clust_x = Number(clust_transform.split('(')[1].split(',')[0]);
	  var clust_y = Number(clust_transform.split(',')[1].replace(')', ''));
	  var trans_x = clust_x + params.viz.clust.dim.width / 2;
	  var trans_y = clust_y + params.viz.clust.dim.height / 2;

	  d3.select(params.root + ' .play_button').attr('transform', function () {
	    return 'translate(' + trans_x + ',' + trans_y + ')';
	  });
		};

/***/ },
/* 116 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function position_svg_dendro_slider(cgm, inst_rc) {

	  var viz = cgm.params.viz;
	  var tmp_left;
	  var tmp_top;
	  if (inst_rc === 'row') {

	    // row dendrogram
	    ///////////////////////

	    // keep slider near clustergram
	    var max_room = viz.svg_dim.width - 3 * viz.uni_margin;

	    // position close to row dendrogram trapezoids
	    tmp_left = viz.clust.margin.left + viz.clust.dim.width + 5 * viz.dendro_room.row;

	    if (tmp_left > max_room) {
	      tmp_left = max_room;
	    }

	    tmp_top = viz.clust.margin.top + 3 * viz.uni_margin;
	  } else {

	    // column dendrogram
	    ///////////////////////
	    tmp_left = 2 * viz.uni_margin;
	    // tmp_top =  viz.svg_dim.height - 2.5 * viz.uni_margin;
	    tmp_top = viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col - 2 * viz.uni_margin;
	  }

	  d3.select(cgm.params.root + ' .' + inst_rc + '_slider_group').attr('transform', function () {
	    var inst_translation;
	    if (inst_rc === 'row') {
	      inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')';
	    } else {
	      inst_translation = 'translate(' + tmp_left + ',' + tmp_top + '), rotate(-90)';
	    }
	    return inst_translation;
	  }).style('opacity', 1);
		};

/***/ },
/* 117 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function grid_lines_viz(params) {
	  var duration = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];


	  var delay = 0;
	  if (duration > 0) {
	    delay = 2000;
	  }

	  var horz_lines = d3.selectAll(params.root + ' .horz_lines');
	  var vert_lines = d3.selectAll(params.root + ' .vert_lines');

	  horz_lines.style('opacity', 0).attr('transform', function (d) {
	    var inst_index = d.row_index;
	    var inst_trans = params.viz.y_scale(inst_index);
	    return 'translate(  0,' + inst_trans + ') rotate(0)';
	  }).transition().duration(duration).delay(delay).style('opacity', 1);

	  horz_lines.append('line').attr('x1', 0).attr('x2', params.viz.clust.dim.width).style('stroke-width', function () {
	    var inst_width = params.viz.border_width.y;
	    return inst_width + 'px';
	  });

	  vert_lines.style('opacity', 0).attr('transform', function (d) {
	    var inst_index = d.col_index;
	    var inst_trans = params.viz.x_scale(inst_index);
	    return 'translate(' + inst_trans + ') rotate(-90)';
	  }).transition().duration(duration).delay(delay).style('opacity', 1);

	  vert_lines.append('line').attr('x1', 0).attr('x2', -params.viz.clust.dim.height).style('stroke-width', function () {
	    var inst_width = params.viz.border_width.x;
	    return inst_width + 'px';
	  });
		};

/***/ },
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cat_tooltip_text = __webpack_require__(119);
	var d3_tip_custom = __webpack_require__(50);
	var reset_cat_opacity = __webpack_require__(120);
	var ini_cat_opacity = __webpack_require__(121);
	var click_filter_cats = __webpack_require__(122);
	var get_cat_names = __webpack_require__(123);

	module.exports = function make_col_cat(cgm) {

	  var params = cgm.params;

	  // make or reuse outer container
	  if (d3.select(params.root + ' .col_cat_outer_container').empty()) {
	    d3.select(params.root + ' .col_container').append('g').attr('class', 'col_cat_outer_container').attr('transform', function () {
	      var inst_offset = params.viz.norm_labels.width.col + 2;
	      return 'translate(0,' + inst_offset + ')';
	    }).append('g').attr('class', 'col_cat_container');
	  } else {
	    d3.select(params.root + ' .col_container').select('col_cat_outer_container').attr('transform', function () {
	      var inst_offset = params.viz.norm_labels.width.col + 2;
	      return 'translate(0,' + inst_offset + ')';
	    });
	  }

	  // remove old col_cat_tips
	  d3.selectAll(params.viz.root_tips + '_col_cat_tip').remove();

	  // d3-tooltip
	  var cat_tip = d3_tip_custom().attr('class', function () {
	    var root_tip_selector = params.viz.root_tips.replace('.', '');
	    var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_col_cat_tip';
	    return class_string;
	  }).direction('s').offset([5, 0]).style('display', 'none').html(function (d) {
	    return cat_tooltip_text(params, d, this, 'col');
	  });

	  // append groups - each will hold classification rects
	  d3.select(params.root + ' .col_cat_container').selectAll('g').data(params.network_data.col_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'col_cat_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(params.network_data.col_nodes_names, d.name);
	    // return 'translate(' + params.viz.x_scale(d.col_index) + ',0)';
	    return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	  });

	  d3.select(params.root + ' .col_cat_container').selectAll('.col_cat_group').call(cat_tip);

	  // add category rects
	  d3.selectAll(params.root + ' .col_cat_group').each(function () {

	    var inst_selection = this;
	    var cat_rect;

	    _.each(params.viz.all_cats.col, function (inst_cat) {

	      var inst_num = parseInt(inst_cat.split('-')[1], 10);
	      var cat_rect_class = 'col_cat_rect_' + String(inst_num);

	      if (d3.select(inst_selection).select('.' + cat_rect_class).empty()) {
	        cat_rect = d3.select(inst_selection).append('rect').attr('class', cat_rect_class).attr('cat', inst_cat).attr('transform', function () {
	          var cat_room = params.viz.cat_room.symbol_width + params.viz.cat_room.separation;
	          var inst_shift = inst_num * cat_room;
	          return 'translate(0,' + inst_shift + ')';
	        }).on('click', function (d) {

	          if (d3.select(this).classed('cat_strings')) {

	            if (d3.event.shiftKey === true) {
	              click_filter_cats_db(cgm, d, this, 'col');
	            } else {

	              var found_names = get_cat_names(params, d, this, 'col');

	              $(params.root + ' .dendro_info').modal('toggle');
	              var group_string = found_names.join(', ');
	              d3.select(params.root + ' .dendro_info input').attr('value', group_string);
	            }
	          }
	        });
	      } else {
	        cat_rect = d3.select(inst_selection).select('.' + cat_rect_class);
	      }

	      cat_rect.attr('width', params.viz.x_scale.rangeBand()).attr('height', params.viz.cat_room.symbol_width).style('fill', function (d) {
	        var cat_name = d[inst_cat];
	        var inst_color = params.viz.cat_colors.col[inst_cat][cat_name];
	        return inst_color;
	      }).on('mouseover', cat_tip.show).on('mouseout', function () {
	        cat_tip.hide(this);
	        reset_cat_opacity(params);
	        d3.select(this).classed('hovering', false);

	        d3.selectAll('.d3-tip').style('display', 'none');
	      });

	      ini_cat_opacity(params.viz, 'col', cat_rect, inst_cat);
	    });
	  });

	  var click_filter_cats_db = _.debounce(click_filter_cats, 1500);
		};

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_title = __webpack_require__(79);

	module.exports = function cat_tooltip_text(params, inst_data, inst_selection, inst_rc) {

	  d3.selectAll(params.viz.root_tips + '_col_cat_tip').style('display', 'block');

	  d3.selectAll(params.viz.root_tips + '_row_cat_tip').style('display', 'block');

	  // category index
	  var inst_cat = d3.select(inst_selection).attr('cat');
	  var cat_title = get_cat_title(params.viz, inst_cat, inst_rc);
	  var cat_name = inst_data[inst_cat];

	  if (typeof cat_name === 'string') {
	    if (cat_name.indexOf(': ') >= 0) {
	      cat_name = cat_name.split(': ')[1];
	    }
	  }

	  var cat_string = cat_title + ': ' + cat_name;

	  d3.select(inst_selection).classed('hovering', true);

	  setTimeout(highlight_categories, 500);

	  return cat_string;

	  function highlight_categories() {

	    var run_highlighting = false;

	    if (d3.select(inst_selection).classed('hovering')) {

	      var node_types = [inst_rc];

	      if (params.viz.sim_mat) {
	        node_types = ['row', 'col'];
	      }

	      _.each(node_types, function (tmp_rc) {

	        // only highlight string categories that are not 'false' categories
	        if (typeof cat_name === 'string') {
	          if (cat_name.indexOf('Not ') < 0 && cat_name != 'false') {
	            run_highlighting = true;
	          }
	        }

	        if (run_highlighting) {

	          d3.selectAll(params.root + ' .' + tmp_rc + '_cat_group').selectAll('rect').style('opacity', function (d) {

	            var inst_opacity = d3.select(this).style('opacity');

	            if (d3.select(this).classed('cat_strings') && d3.select(this).classed('filtered_cat') === false) {

	              var tmp_name;
	              var tmp_cat = d3.select(this).attr('cat');

	              if (d[tmp_cat].indexOf(': ') >= 0) {
	                tmp_name = d[tmp_cat].split(': ')[1];
	              } else {
	                tmp_name = d[tmp_cat];
	              }

	              if (tmp_cat === inst_cat && tmp_name === cat_name) {
	                inst_opacity = params.viz.cat_colors.active_opacity;
	              } else {
	                inst_opacity = params.viz.cat_colors.opacity / 4;
	              }
	            }

	            return inst_opacity;
	          });
	        }
	      });
	    }
	  }
		};

/***/ },
/* 120 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function reset_cat_opacity(params) {

	  _.each(['row', 'col'], function (inst_rc) {

	    d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').selectAll('rect').style('opacity', function () {

	      var inst_opacity = d3.select(this).style('opacity');

	      if (d3.select(this).classed('cat_strings') && d3.select(this).classed('filtered_cat') === false) {
	        inst_opacity = params.viz.cat_colors.opacity;
	      }

	      return inst_opacity;
	    });
	  });
		};

/***/ },
/* 121 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function ini_cat_opacity(viz, inst_rc, cat_rect, inst_cat) {
	  var updating = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];


	  // debugger;

	  var super_string = ': ';
	  var inst_type = viz.cat_info[inst_rc][inst_cat].type;

	  // set opacity based on string or value cats
	  if (inst_type === 'cat_strings') {

	    // optionally have categories transition in
	    if (updating) {
	      cat_rect.classed('cat_strings', true).style('opacity', 0).transition().duration(1000).style('opacity', viz.cat_colors.opacity);
	    } else {
	      // opacity is fixed
	      cat_rect.classed('cat_strings', true).style('opacity', viz.cat_colors.opacity);
	    }
	  } else {

	    // opacity varies based on value
	    cat_rect.classed('cat_values', true).style('opacity', function (d) {

	      var unprocessed_val = d[inst_cat];

	      var cat_value = get_cat_value(unprocessed_val);

	      return viz.cat_info[inst_rc][inst_cat].cat_scale(Math.abs(cat_value));
	    }).style('fill', function (d) {
	      var inst_color;

	      var cat_value = get_cat_value(d[inst_cat]);

	      // get positive and negative colors
	      if (cat_value > 0) {
	        inst_color = viz.cat_value_colors[0];
	      } else {
	        inst_color = viz.cat_value_colors[1];
	      }

	      return inst_color;
	    });
	  }

	  function get_cat_value(unprocessed_value) {
	    if (typeof unprocessed_value === 'string') {

	      if (unprocessed_value.indexOf(super_string) > -1) {
	        unprocessed_value = unprocessed_value.split(super_string)[1];
	      }
	    }

	    var cat_value = parseFloat(unprocessed_value);

	    return cat_value;
	  }
		};

/***/ },
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_names = __webpack_require__(123);

	module.exports = function click_filter_cats(cgm, inst_data, inst_selection, inst_rc) {

	  var params = cgm.params;

	  var inst_cat = d3.select(inst_selection).attr('cat');
	  var cat_name = inst_data[inst_cat];

	  var found_names = get_cat_names(params, inst_data, inst_selection, inst_rc);

	  var switch_rc = { 'row': 'col', 'col': 'row' };
	  var other_rc = switch_rc[inst_rc];

	  var filter_names = {};
	  filter_names[inst_rc] = found_names;

	  if (cgm.params.cat_filter[inst_rc] === false) {

	    if (cgm.params.dendro_filter.row === false && cgm.params.dendro_filter.col === false && cgm.params.cat_filter[other_rc] === false) {

	      var tmp_names = cgm.params.network_data.col_nodes_names;

	      // keep a backup of the inst_view
	      var inst_row_nodes = cgm.params.network_data.row_nodes;
	      var inst_col_nodes = cgm.params.network_data.col_nodes;

	      // run filtering using found names
	      cgm.filter_viz_using_names(filter_names);

	      // save backup of the inst_view
	      cgm.params.inst_nodes.row_nodes = inst_row_nodes;
	      cgm.params.inst_nodes.col_nodes = inst_col_nodes;

	      // must set this after filtering has been run
	      cgm.params.cat_filter[inst_rc] = tmp_names;

	      highlight_filtered_cat(inst_rc, inst_cat, cat_name);
	    }
	  } else {

	    // get backup of names
	    filter_names = cgm.params.cat_filter[inst_rc];

	    // reset filter
	    cgm.filter_viz_using_names(filter_names);
	    // must set this after filtering has been run
	    cgm.params.cat_filter[inst_rc] = false;

	    // there are no filtered cats
	    d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').selectAll('rect').classed('filtered_cat', false);
	  }

	  function highlight_filtered_cat(inst_rc, inst_cat, cat_name) {

	    d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').selectAll('rect').style('opacity', function (d) {

	      var inst_opacity = d3.select(this).style('opacity');

	      if (d3.select(this).classed('cat_strings')) {

	        var tmp_name;
	        var tmp_cat = d3.select(this).attr('cat');

	        // no need to filter out title
	        tmp_name = d[tmp_cat];

	        if (tmp_cat === inst_cat && tmp_name === cat_name) {
	          inst_opacity = 1;

	          d3.select(this).classed('filtered_cat', true);
	        }
	        // else {
	        //   inst_opacity = params.viz.cat_colors.opacity/4;
	        // }
	      }

	      return inst_opacity;
	    });
	  }
		};

/***/ },
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);

	module.exports = function get_cat_names(params, inst_data, inst_selection, inst_rc) {

	  // category index
	  var inst_cat = d3.select(inst_selection).attr('cat');
	  var cat_name = inst_data[inst_cat];
	  var tmp_nodes = params.network_data[inst_rc + '_nodes'];

	  var found_nodes = _.filter(tmp_nodes, function (d) {
	    return d[inst_cat] == cat_name;
	  });

	  var found_names = utils.pluck(found_nodes, 'name');

	  return found_names;
	};

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cat_tooltip_text = __webpack_require__(119);
	var d3_tip_custom = __webpack_require__(50);
	var reset_cat_opacity = __webpack_require__(120);
	var ini_cat_opacity = __webpack_require__(121);
	var click_filter_cats = __webpack_require__(122);
	var get_cat_names = __webpack_require__(123);

	module.exports = function make_row_cat(cgm) {
	  var updating = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


	  var params = cgm.params;

	  // make or reuse outer container
	  if (d3.select(params.root + ' .row_cat_outer_container').empty()) {
	    d3.select(params.root + ' .row_container').append('g').attr('class', 'row_cat_outer_container').attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)').append('g').attr('class', 'row_cat_container');
	  } else {
	    d3.select(params.root + ' .row_container').select('row_cat_outer_container').attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)');
	  }

	  // white background
	  if (d3.select(params.root + ' .row_cat_container').select('.white_bars').empty()) {
	    d3.select(params.root + ' .row_cat_container').append('rect').attr('class', 'white_bars').attr('fill', params.viz.background_color).attr('width', params.viz.cat_room.row + 'px').attr('height', function () {
	      var inst_height = params.viz.clust.dim.height;
	      return inst_height;
	    });
	  } else {
	    d3.select(params.root + ' .row_cat_container').select('.white_bars').attr('fill', params.viz.background_color).attr('width', params.viz.cat_room.row + 'px').attr('height', function () {
	      var inst_height = params.viz.clust.dim.height;
	      return inst_height;
	    });
	  }

	  // remove old col_cat_tips
	  d3.selectAll(params.viz.root_tips + '_row_cat_tip').remove();

	  // d3-tooltip
	  var cat_tip = d3_tip_custom().attr('class', function () {
	    var root_tip_selector = params.viz.root_tips.replace('.', '');
	    var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_row_cat_tip';
	    return class_string;
	  }).direction('e').offset([5, 0]).style('display', 'none').html(function (d) {
	    return cat_tooltip_text(params, d, this, 'row');
	  });

	  // groups that hold classification triangle and colorbar rect
	  d3.select(params.root + ' .row_cat_container').selectAll('g').data(params.network_data.row_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'row_cat_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(params.network_data.row_nodes_names, d.name);
	    return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	  });

	  d3.select(params.root + ' .row_cat_container').selectAll('.row_cat_group').call(cat_tip);

	  // add row visual-aid triangles (if no downsampling)
	  // if (params.viz.ds_level === -1){
	  // d3.selectAll(params.root+' .row_cat_group')
	  //   .append('path')
	  //   .attr('d', function() {
	  //     var origin_x = params.viz.cat_room.symbol_width - 1;
	  //     var origin_y = 0;
	  //     var mid_x = 1;
	  //     var mid_y = params.viz.y_scale.rangeBand() / 2;
	  //     var final_x = params.viz.cat_room.symbol_width - 1;
	  //     var final_y = params.viz.y_scale.rangeBand();
	  //     var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' +
	  //       mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
	  //     return output_string;
	  //   })
	  //   .attr('fill', '#eee')
	  //   .style('opacity', params.viz.triangle_opacity);
	  // }

	  var cat_rect;
	  var inst_selection;

	  d3.selectAll(params.root + ' .row_cat_group rect').remove();

	  if (params.viz.show_categories.row) {

	    d3.selectAll(params.root + ' .row_cat_group').each(function () {

	      inst_selection = this;

	      _.each(params.viz.all_cats.row, function (inst_cat) {

	        var inst_num = parseInt(inst_cat.split('-')[1], 10);
	        var cat_rect_class = 'row_cat_rect_' + String(inst_num);

	        if (d3.select(inst_selection).select('.' + cat_rect_class).empty()) {
	          cat_rect = d3.select(inst_selection).append('rect').attr('class', cat_rect_class).attr('cat', inst_cat);
	        } else {
	          cat_rect = d3.select(inst_selection).select('.' + cat_rect_class);
	        }

	        cat_rect.attr('width', params.viz.cat_room.symbol_width).attr('height', params.viz.y_scale.rangeBand()).style('fill', function (d) {
	          var cat_name = d[inst_cat];
	          var inst_color = params.viz.cat_colors.row[inst_cat][cat_name];
	          return inst_color;
	        }).attr('x', function () {
	          var inst_offset = params.viz.cat_room.symbol_width + params.viz.uni_margin / 2;
	          return inst_offset + 'px';
	        }).attr('transform', function () {
	          var cat_room = params.viz.cat_room.symbol_width + params.viz.cat_room.separation;
	          var inst_shift = inst_num * cat_room;
	          return 'translate(' + inst_shift + ',0)';
	        }).on('click', function (d) {

	          if (d3.select(this).classed('cat_strings')) {

	            if (d3.event.shiftKey === true) {
	              click_filter_cats_db(cgm, d, this, 'row');
	            } else {

	              var found_names = get_cat_names(params, d, this, 'row');

	              $(params.root + ' .dendro_info').modal('toggle');
	              var group_string = found_names.join(', ');
	              d3.select(params.root + ' .dendro_info input').attr('value', group_string);
	            }
	          }
	        }).on('mouseover', cat_tip.show).on('mouseout', function () {
	          cat_tip.hide(this);
	          reset_cat_opacity(params);
	          d3.select(this).classed('hovering', false);

	          d3.selectAll('.d3-tip').style('display', 'none');
	        });

	        ini_cat_opacity(params.viz, 'row', cat_rect, inst_cat, updating);
	      });
	    });
	  }

	  var click_filter_cats_db = _.debounce(click_filter_cats, 1500);
		};

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_dendro_triangles = __webpack_require__(57);

	module.exports = function make_row_dendro(cgm) {

	  var params = cgm.params;

	  var spillover_width = params.viz.dendro_room.row + params.viz.uni_margin;

	  // position row_dendro_outer_container
	  var x_offset = params.viz.clust.margin.left + params.viz.clust.dim.width;
	  var y_offset = params.viz.clust.margin.top;

	  // make or reuse outer container
	  if (d3.select(params.root + ' .row_dendro_outer_container').empty()) {

	    d3.select(params.root + ' .viz_svg').append('g').attr('class', 'row_dendro_outer_container').attr('transform', 'translate(' + x_offset + ',' + y_offset + ')');

	    d3.select(params.root + ' .row_dendro_outer_container').append('rect').classed('row_dendro_spillover', true).attr('fill', params.viz.background_color).attr('width', spillover_width + 'px').attr('height', params.viz.svg_dim.height);

	    d3.select(params.root + ' .row_dendro_outer_container').append('g').attr('class', 'row_dendro_container').attr('transform', 'translate(' + params.viz.uni_margin / 2 + ',0)');
	  } else {
	    d3.select(params.root + ' .viz_svg').select('row_dendro_outer_container').attr('transform', 'translate(' + x_offset + ',' + y_offset + ')');

	    d3.select(params.root + ' .row_dendro_outer_container').select('.row_dendro_spillover').attr('width', spillover_width + 'px').attr('height', params.viz.svg_dim.height);
	  }

	  make_dendro_triangles(cgm, 'row', false);

	  if (params.viz.inst_order.col != 'clust') {
	    d3.selectAll(params.root + ' .row_dendro_group').remove();
	  }
		};

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_dendro_triangles = __webpack_require__(57);

	module.exports = function make_col_dendro(cgm) {

	  var params = cgm.params;

	  // position col_dendro_outer_container
	  var x_offset = params.viz.clust.margin.left;
	  var y_offset = params.viz.clust.margin.top + params.viz.clust.dim.height;
	  var spillover_height = params.viz.dendro_room.col + params.viz.uni_margin;

	  // make or reuse outer container
	  if (d3.select(params.root + ' .col_dendro_outer_container').empty()) {

	    d3.select(params.root + ' .viz_svg').append('g').attr('class', 'col_dendro_outer_container').attr('transform', 'translate(' + x_offset + ',' + y_offset + ')');

	    d3.select(params.root + ' .col_dendro_outer_container').append('rect').classed('col_dendro_spillover', true).attr('fill', params.viz.background_color).attr('width', params.viz.svg_dim.width).attr('height', spillover_height + 'px');

	    d3.select(params.root + ' .col_dendro_outer_container').append('g').attr('class', 'col_dendro_container').attr('transform', 'translate(0,' + params.viz.uni_margin / 2 + ')');

	    d3.select(params.root + ' .col_dendro_outer_container').append('rect').classed('col_dendro_spillover_top', true).attr('fill', params.viz.background_color).attr('width', params.viz.svg_dim.width).attr('height', params.viz.svg_dim.height).attr('transform', 'translate(0,' + params.viz.dendro_room.col + ')');
	  } else {

	    d3.select(params.root + ' .viz_svg').select('col_dendro_outer_container').attr('transform', 'translate(' + x_offset + ',' + y_offset + ')');

	    d3.select(params.root + ' .col_dendro_outer_container').select('.col_dendro_spillover').attr('width', params.viz.svg_dim.width).attr('height', spillover_height + 'px');
	  }

	  make_dendro_triangles(cgm, 'col', false);

	  if (params.viz.inst_order.row != 'clust') {
	    d3.selectAll(params.root + ' .col_dendro_group').remove();
	  }
		};

/***/ },
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var build_svg_dendro_slider = __webpack_require__(128);

	module.exports = function make_svg_dendro_sliders(cgm) {

	  build_svg_dendro_slider(cgm, 'row');
	  build_svg_dendro_slider(cgm, 'col');
		};

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var change_groups = __webpack_require__(129);
	var position_svg_dendro_slider = __webpack_require__(116);

	module.exports = function build_svg_dendro_slider(cgm, inst_rc) {

	  var slider_length = 100;

	  var drag = d3.behavior.drag().on("drag", dragging).on('dragend', function () {
	    cgm.params.is_slider_drag = false;
	  });

	  var slider_group = d3.select(cgm.params.root + ' .viz_svg').append('g').classed(inst_rc + '_slider_group', true);

	  position_svg_dendro_slider(cgm, inst_rc);

	  var rect_height = slider_length + 20;
	  var rect_width = 30;
	  slider_group.append('rect').classed(inst_rc + '_slider_background', true).attr('height', rect_height + 'px').attr('width', rect_width + 'px').attr('fill', cgm.params.viz.background_color).attr('transform', function () {
	    var translate_string = 'translate(-10, -5)';
	    return translate_string;
	  }).style('opacity', 0);

	  slider_group.append("line").style('stroke-width', slider_length / 7 + 'px').style('stroke', 'black').style('stroke-linecap', 'round').style('opacity', 0.0).attr("y1", 0).attr("y2", function () {
	    return slider_length - 2;
	  }).on('click', click_dendro_slider);

	  var offset_triangle = -slider_length / 40;
	  slider_group.append('path').style('fill', 'black').attr('transform', 'translate(' + offset_triangle + ', 0)').attr('d', function () {

	    // up triangle
	    var start_x = 0;
	    var start_y = 0;

	    var mid_x = 0;
	    var mid_y = slider_length;

	    var final_x = slider_length / 10;
	    var final_y = 0;

	    var output_string = 'M' + start_x + ',' + start_y + ', L' + mid_x + ', ' + mid_y + ', L' + final_x + ',' + final_y + ' Z';

	    return output_string;
	  }).style('opacity', 0.35).on('click', click_dendro_slider);

	  var default_opacity = 0.35;
	  var high_opacity = 0.6;
	  slider_group.append('circle').classed(inst_rc + '_group_circle', true).attr('r', slider_length * 0.08).attr('transform', function () {
	    return 'translate(0, ' + slider_length / 2 + ')';
	  }).style('fill', 'blue').style('opacity', default_opacity).on('mouseover', function () {
	    d3.select(this).style('opacity', high_opacity);
	  }).on('mouseout', function () {
	    d3.select(this).style('opacity', default_opacity);
	  }).call(drag);

	  function dragging() {

	    cgm.params.is_slider_drag = true;

	    // d[0] = d3.event.x;
	    var slider_pos = d3.event.y;

	    if (slider_pos < 0) {
	      slider_pos = 0;
	    }

	    if (slider_pos > slider_length) {
	      slider_pos = slider_length;
	    }

	    if (this.nextSibling) {
	      this.parentNode.appendChild(this);
	    }

	    slider_pos = d3.round(slider_pos, -1);

	    var slider_value = 10 - slider_pos / 10;

	    d3.select(this).attr("transform", "translate(0, " + slider_pos + ")");

	    change_groups(cgm, inst_rc, slider_value);
	  }

	  function click_dendro_slider() {

	    var clicked_line_position = d3.mouse(this);

	    var rel_pos = d3.round(clicked_line_position[1], -1);

	    d3.select(cgm.params.root + ' .' + inst_rc + '_group_circle').attr('transform', 'translate(0, ' + rel_pos + ')');

	    var slider_value = 10 - rel_pos / 10;

	    change_groups(cgm, inst_rc, slider_value);
	  }
	};

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// var build_color_groups = require('./build_color_groups');
	var make_dendro_triangles = __webpack_require__(57);

	/* Changes the groupings (x- and y-axis color bars).
	 */
	module.exports = function (cgm, inst_rc, inst_index) {

	  var params = cgm.params;

	  if (inst_rc === 'row') {
	    params.group_level.row = inst_index;
	  } else if (inst_rc === 'col') {
	    params.group_level.col = inst_index;
	  }

	  var is_change_group = true;

	  make_dendro_triangles(cgm, inst_rc, is_change_group);
		};

/***/ },
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_dendro_crop_buttons = __webpack_require__(62);

	module.exports = function make_row_dendro_spillover(cgm) {

	  var viz = cgm.params.viz;

	  // hide spillover from right
	  var tmp_left = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin + viz.dendro_room.row;

	  var r_spill_container = d3.select(viz.viz_svg).append('g').classed('right_spillover_container', true).attr('transform', function () {
	    return 'translate(' + tmp_left + ', 0)';
	  });

	  var tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

	  r_spill_container.append('rect').attr('fill', viz.background_color) //!! prog_colors
	  .attr('width', 10 * viz.clust.dim.width).attr('height', viz.svg_dim.height + 'px').attr('class', 'white_bars').attr('class', 'right_spillover').attr('transform', function () {
	    return 'translate( 0,' + tmp_top + ')';
	  });

	  var x_offset = 0;
	  var y_offset = viz.clust.margin.top;
	  r_spill_container.append('g').classed('row_dendro_icons_container', true).attr('transform', 'translate(' + x_offset + ',' + y_offset + ')').append('g').classed('row_dendro_icons_group', true);

	  make_dendro_crop_buttons(cgm, 'row');

	  // hide spillover from top of row dendrogram
	  x_offset = viz.clust.margin.left + viz.clust.dim.width;
	  y_offset = tmp_top;

	  var tmp_width = viz.dendro_room.row + viz.uni_margin;
	  var tmp_height = viz.cat_room.col + viz.uni_margin;
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color).attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  }).classed('white_bars', true).classed('dendro_row_spillover', true);
		};

/***/ },
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* eslint-disable */

	var run_segment = __webpack_require__(132);
	var play_intro = __webpack_require__(133);
	var play_zoom = __webpack_require__(135);
	var play_reset_zoom = __webpack_require__(136);
	var play_reorder_row = __webpack_require__(138);
	var play_reorder_buttons = __webpack_require__(139);
	var play_search = __webpack_require__(141);
	var play_filter = __webpack_require__(142);
	var quick_cluster = __webpack_require__(165);
	var play_groups = __webpack_require__(166);
	var play_categories = __webpack_require__(167);
	var play_conclusion = __webpack_require__(168);
	var toggle_play_button = __webpack_require__(169);
	var play_menu_button = __webpack_require__(170);

	module.exports = function play_demo() {

	  var cgm = this;
	  var params = cgm.params;

	  if (d3.select(params.root + ' .running_demo').empty()) {

	    // prevent more than one demo from running at once
	    d3.select(params.root + ' .play_button').classed('running_demo', true);

	    toggle_play_button(params, false);

	    // prevent user interaction while playing
	    $.blockUI({ css: {
	        border: 'none',
	        padding: '15px',
	        backgroundColor: '#000',
	        '-webkit-border-radius': '10px',
	        '-moz-border-radius': '10px',
	        opacity: 0,
	        color: '#fff',
	        cursor: 'default'
	      } });

	    d3.selectAll('.blockUI').style('opacity', 0);

	    // intro text
	    var inst_time = 750;

	    if (cgm.params.viz.is_expand === false) {
	      inst_time = run_segment(params, inst_time, quick_cluster);
	      inst_time = inst_time - 1500;
	    }

	    // clustergram interaction
	    ///////////////////////////////////
	    inst_time = run_segment(params, inst_time, play_intro);
	    inst_time = run_segment(params, inst_time, play_zoom);
	    inst_time = run_segment(cgm, inst_time, play_reset_zoom);
	    inst_time = run_segment(params, inst_time, play_categories);
	    inst_time = run_segment(params, inst_time, play_reorder_row);

	    // sidebar interaction
	    ///////////////////////////////////
	    inst_time = run_segment(params, inst_time, play_menu_button);
	    inst_time = run_segment(params, inst_time, play_groups);
	    inst_time = run_segment(params, inst_time, play_reorder_buttons);
	    inst_time = run_segment(params, inst_time, play_search);
	    inst_time = run_segment(cgm, inst_time, play_filter);

	    // conclusion
	    ///////////////////////////////////
	    inst_time = run_segment(params, inst_time, quick_cluster);
	    inst_time = run_segment(params, inst_time, play_conclusion);
	  }
		};

/***/ },
/* 132 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function run_segment(segment_data, inst_time, inst_segment) {
	  /* eslint-disable */

	  var timer = setTimeout(inst_segment().run, inst_time, segment_data);

	  // set up kill demo that will stop setTimeouts
	  //////////////////////////////////////////////////
	  // if (clear_timer){
	  //   clearTimeout(timer);
	  // }

	  var inst_duration = inst_segment().get_duration();
	  inst_time = inst_time + inst_duration;

	  return inst_time;
		};

/***/ },
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);

	module.exports = function play_intro() {

	  var speed_up = 1;

	  function run(params) {
	    var text_1 = 'Clustergrammer allows users to generate\ninteractive and ' + 'sharable visualizations\nby uploading a matrix';
	    var text_2 = "This demo will quickly overview some\nof Clustergrammer's " + "interactive features";

	    setTimeout(demo_text, 0, params, text_1, 4500 / speed_up);
	    setTimeout(demo_text, 4500 / speed_up, params, text_2, 4500 / speed_up);
	  }

	  function get_duration() {
	    return 10000 / speed_up;
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 134 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function demo_text(params, text, read_duration) {

	  var split_text = text.split('\n');

	  if (split_text.length < 3) {
	    split_text.push('');
	  }

	  d3.select(params.root + ' .demo_group').style('opacity', 0).transition().duration(250).style('opacity', 1).transition().duration(250).delay(read_duration).style('opacity', 0);

	  for (var i = 0; i < split_text.length; i++) {

	    var inst_text_num = i + 1;

	    // make text box 
	    //////////////////
	    var inst_text_obj = d3.select(params.root + ' .demo_group').select('#text_' + inst_text_num).text(split_text[i]);
	    var bbox = inst_text_obj[0][0].getBBox();

	    var box_opacity = 0.9;

	    var tmp_fs = Number(d3.select('.demo_group').select('text').style('font-size').replace('px', ''));
	    var shift_height = tmp_fs * 1.3;

	    d3.select(params.root + ' .demo_group').select('.rect_' + inst_text_num).style('fill', 'white').attr('width', bbox.width + 20).attr('height', bbox.height).attr('x', -10).attr('y', bbox.y + i * shift_height).style('opacity', box_opacity);
	  }
		};

/***/ },
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var two_translate_zoom = __webpack_require__(82);

	module.exports = function play_zoom() {

	  function run(cgm) {

	    var params = cgm.params;
	    var text = 'Zoom and pan by\nscrolling and dragging';
	    demo_text(params, text, 4000);

	    setTimeout(two_translate_zoom, 1500, cgm, 0, 0, 4);
	  }

	  function get_duration() {
	    return 4000;
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var two_translate_zoom = __webpack_require__(82);
	var sim_click = __webpack_require__(137);

	module.exports = function play_reset_zoom() {

	  function run(cgm) {

	    var params = cgm.params;

	    var text = 'Reset zoom by double-clicking\n';
	    demo_text(params, text, 4000);

	    setTimeout(sim_click, 2000, params, 'double', 300, 300);
	    setTimeout(two_translate_zoom, 2400, cgm, 0, 0, 1);
	  }

	  function get_duration() {
	    return 4500;
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 137 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function sim_click(params, single_double, pos_x, pos_y) {

	  var click_duration = 200;

	  var click_circle = d3.select(params.root + ' .viz_svg').append('circle').attr('cx', pos_x).attr('cy', pos_y).attr('r', 25).style('stroke', 'black').style('stroke-width', '3px').style('fill', '#007f00').style('opacity', 0.5);

	  if (single_double === 'double') {
	    click_circle.transition().duration(click_duration).style('opacity', 0.0).transition().duration(50).style('opacity', 0.5).transition().duration(click_duration).style('opacity', 0.0).remove();
	  } else {
	    click_circle.transition().duration(click_duration).style('opacity', 0.0).transition().duration(250).remove();
	  }
		};

/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var sim_click = __webpack_require__(137);

	module.exports = function play_reorder_row() {
	  /* eslint-disable */

	  function run(params) {

	    var text = 'Reorder the matrix based on a single\nrow or column by double-clicking a\nlabel';
	    demo_text(params, text, 7000);

	    var inst_element = get_row_element(params, 'EGFR');

	    var group_trans = d3.select(inst_element).attr('transform');

	    var container_trans = d3.select(params.root + ' .clust_container').attr('transform').split(',')[1].replace(')', '');

	    var x_trans = params.viz.norm_labels.width.row * 0.9;

	    var row_trans = group_trans.split(',')[1].replace(')', '');
	    var y_trans = String(Number(row_trans) + Number(container_trans) + params.viz.rect_height / 2);

	    var wait_click = 4000;
	    setTimeout(sim_click, wait_click, params, 'double', x_trans, y_trans);
	    var wait_reorder = wait_click + 300;
	    setTimeout(fire_double_click_row, wait_reorder, params, inst_element);
	  }

	  function get_duration() {
	    return 8000;
	  }

	  function get_row_element(params, inst_row) {

	    var inst_element = d3.selectAll(params.root + ' .row_label_group').filter(function () {
	      var inst_data = this.__data__;
	      return inst_data.name == inst_row;
	    })[0][0];

	    return inst_element;
	  }

	  function fire_double_click_row(params, inst_element) {

	    $(inst_element).d3DblClick();
	  }

	  // allows doubleclicking on d3 element
	  jQuery.fn.d3DblClick = function () {
	    this.each(function (i, e) {
	      var evt = document.createEvent("MouseEvents");
	      evt.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	      e.dispatchEvent(evt);
	    });
	  };

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var highlight_sidebar_element = __webpack_require__(140);

	module.exports = function play_reorder_buttons() {
	  /* eslint-disable */

	  function run(params) {

	    var text = 'Reorder all rows and columns\nby clicking the reorder\n buttons';
	    demo_text(params, text, 9000);

	    setTimeout(highlight_sidebar_element, 3000, params, 'toggle_col_order');
	    setTimeout(click_reorder_button, 3500, params, 'col', 'rank');

	    setTimeout(highlight_sidebar_element, 7000, params, 'toggle_row_order');
	    setTimeout(click_reorder_button, 7500, params, 'row', 'rank');
	  }

	  function get_duration() {
	    return 11000;
	  }

	  function click_reorder_button(params, inst_rc, inst_order) {
	    var inst_button = d3.selectAll('.toggle_' + inst_rc + '_order .btn').filter(function () {
	      return this.__data__ == inst_order;
	    })[0];

	    $(inst_button).click();
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 140 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function highlight_sidebar_element(params, highlight_class) {
	  var duration = arguments.length <= 2 || arguments[2] === undefined ? 4000 : arguments[2];


	  if (highlight_class.indexOf('slider') < 0) {
	    d3.select(params.root + ' .' + highlight_class).style('background', '#007f00').style('box-shadow', '0px 0px 10px 5px #007f00').transition().duration(1).delay(duration).style('background', '#FFFFFF').style('box-shadow', 'none');
	  } else {
	    d3.select(params.root + ' .' + highlight_class).style('box-shadow', '0px 0px 10px 5px #007f00').transition().duration(1).delay(duration).style('box-shadow', 'none');
	  }
		};

/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var highlight_sidebar_element = __webpack_require__(140);
	var two_translate_zoom = __webpack_require__(82);

	module.exports = function play_search() {

	  function run(cgm) {

	    var params = cgm.params;
	    var text = 'Search for rows using\nthe search box';
	    demo_text(params, text, 5000);

	    var ini_delay = 2500;
	    setTimeout(highlight_sidebar_element, ini_delay, params, 'gene_search_container');

	    // manually mimic typing and autocomplete
	    setTimeout(type_out_search, ini_delay + 1000, params, 'E');
	    setTimeout(type_out_search, ini_delay + 1500, params, 'EG');
	    setTimeout(type_out_search, ini_delay + 2000, params, 'EGF');
	    setTimeout(type_out_search, ini_delay + 2500, params, 'EGFR');

	    setTimeout(run_search, 5500, params);

	    setTimeout(two_translate_zoom, 7500, cgm, 0, 0, 1);
	  }

	  function get_duration() {
	    return 10000;
	  }

	  function type_out_search(params, inst_string) {
	    $(params.root + ' .gene_search_box').val(inst_string);
	    $(params.root + ' .gene_search_box').autocomplete("search", inst_string);
	  }

	  function run_search(params) {
	    $(params.root + ' .submit_gene_button').click();
	    $(params.root + ' .gene_search_box').autocomplete("search", '');
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var highlight_sidebar_element = __webpack_require__(140);
	var update_viz_with_view = __webpack_require__(143);

	module.exports = function play_filter() {

	  function run(cgm) {
	    var params = cgm.params;

	    var text = 'Filter rows based on sum or\nvariance using the sliders';
	    demo_text(params, text, 4000);

	    var filter_type = 'N_row_sum';

	    setTimeout(highlight_sidebar_element, 5000, params, 'slider_' + filter_type, 13000);

	    text = 'Filter: Top 20 rows by sum';
	    setTimeout(demo_text, 5000, params, text, 4000);
	    setTimeout(run_update, 5300, cgm, filter_type, 20, 1);

	    text = 'Filter: Top 10 rows by sum';
	    setTimeout(demo_text, 10000, params, text, 4000);
	    setTimeout(run_update, 10300, cgm, filter_type, 10, 2);

	    text = 'Filter: All rows';
	    setTimeout(demo_text, 15000, params, text, 4000);
	    setTimeout(run_update, 15300, cgm, filter_type, 'all', 0);
	  }

	  function get_duration() {
	    return 19500;
	  }

	  function run_update(cgm, filter_type, filter_value, filter_index) {

	    var params = cgm.params;

	    var requested_view = {};
	    requested_view[filter_type] = filter_value;
	    update_viz_with_view(cgm, requested_view);

	    // quick fix for slider
	    $(params.root + ' .slider_' + filter_type).slider("value", filter_index);

	    var unit_name;
	    if (filter_type === 'N_row_sum') {
	      unit_name = 'sum';
	    } else {
	      unit_name = 'variance';
	    }

	    d3.select(params.root + ' .title_' + filter_type).text('Top rows ' + unit_name + ': ' + filter_value);
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_network_using_view = __webpack_require__(10);
	var disable_sidebar = __webpack_require__(144);
	var update_viz_with_network = __webpack_require__(145);

	module.exports = function update_viz_with_view(cgm, requested_view) {

	  disable_sidebar(cgm.params);

	  // make new_network_data by filtering the original network data
	  var new_network_data = make_network_using_view(cgm.config, cgm.params, requested_view);

	  // reset crop button
	  d3.select(cgm.params.root + ' .crop_button').style('color', '#337ab7').classed('fa-crop', true).classed('fa-undo', false).classed('active_cropping', false);

	  // reset dendrogram filtering when updating with a new view
	  // e.g. with the row filter sliders
	  _.each(['row', 'col'], function (inst_rc) {

	    // set class to reflect that no filtering was ran
	    d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_icons_group').classed('ran_filter', false);

	    // display all crop buttons when cropping has not been done
	    d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_icons_container').style('display', 'block');
	  });

	  update_viz_with_network(cgm, new_network_data);
		};

/***/ },
/* 144 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function disable_sidebar(params) {

	  d3.selectAll(params.root + ' .btn').attr('disabled', true);
	  d3.select(params.viz.viz_svg).style('opacity', 0.70);
		};

/***/ },
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_params = __webpack_require__(9);
	var define_enter_exit_delays = __webpack_require__(146);
	var enter_exit_update = __webpack_require__(147);
	var initialize_resizing = __webpack_require__(89);
	var make_col_cat = __webpack_require__(118);
	var make_row_cat = __webpack_require__(124);
	var make_row_dendro = __webpack_require__(125);
	var make_col_dendro = __webpack_require__(126);
	var ini_sidebar = __webpack_require__(158);
	var enable_sidebar = __webpack_require__(160);
	var ini_doubleclick = __webpack_require__(99);
	var update_reorder_buttons = __webpack_require__(161);
	var make_row_cat_super_labels = __webpack_require__(88);
	var modify_row_node_cats = __webpack_require__(162);
	var run_zoom = __webpack_require__(91);
	var ds_enter_exit_update = __webpack_require__(164);
	var make_cat_params = __webpack_require__(18);

	module.exports = function update_viz_with_network(cgm, new_network_data) {

	  // set runnning_update class, prevents multiple update from running at once
	  d3.select(cgm.params.viz.viz_svg).classed('running_update', true);

	  // remove downsampled rows always
	  d3.selectAll(cgm.params.root + ' .ds' + String(cgm.params.viz.ds_level) + '_row').remove();

	  // run optional callback function
	  if (cgm.params.matrix_update_callback != null) {
	    cgm.params.matrix_update_callback();
	  }

	  var inst_group_level = cgm.params.group_level;
	  var inst_crop_fitler = cgm.params.crop_filter_nodes;

	  // make tmp config to make new params
	  var tmp_config = jQuery.extend(true, {}, cgm.config);

	  var new_cat_data = null;

	  // bring in 'new' category data
	  if (cgm.params.new_cat_data != null) {
	    modify_row_node_cats(cgm.params.new_cat_data, new_network_data.row_nodes);
	    new_cat_data = cgm.params.new_cat_data;
	    cgm.params.new_cat_data = new_cat_data;
	    // do not preserve the updated (row) cats
	    var preserve_cats = false;
	    cgm.params.viz = make_cat_params(cgm.params, cgm.params.viz, preserve_cats);
	  }

	  tmp_config.network_data = new_network_data;
	  tmp_config.inst_order = cgm.params.viz.inst_order;
	  tmp_config.input_domain = cgm.params.matrix.opacity_scale.domain()[1];

	  update_reorder_buttons(tmp_config, cgm.params);

	  tmp_config.ini_expand = false;
	  tmp_config.ini_view = null;
	  tmp_config.current_col_cat = cgm.params.current_col_cat;

	  // disabled, causing problems when cropping
	  // always preserve category colors when updating
	  tmp_config.cat_colors = cgm.params.viz.cat_colors;

	  var new_params = make_params(tmp_config);

	  // this function is sensitive to further updates, so run here
	  var delays = define_enter_exit_delays(cgm.params, new_params);

	  // pass the newly calcluated params back to the cgm object
	  cgm.params = new_params;

	  // set up zoom
	  cgm.params.zoom_behavior = d3.behavior.zoom().scaleExtent([1, cgm.params.viz.real_zoom * cgm.params.viz.zoom_switch]).on('zoom', function () {
	    run_zoom(cgm);
	  });

	  // have persistent group levels while updating
	  cgm.params.group_level = inst_group_level;

	  // have persistent crop_filter_nodes while updating
	  cgm.params.crop_filter_nodes = inst_crop_fitler;

	  // console.log('num ds levles after update: '+ String(cgm.params.viz.ds_num_levels))

	  // only run enter-exit-updates if there is no downsampling
	  if (cgm.params.viz.ds_num_levels === 0) {
	    // new_network_data is necessary
	    enter_exit_update(cgm, new_network_data, delays);
	  } else {
	    ds_enter_exit_update(cgm);
	  }

	  // reduce opacity during update
	  d3.select(cgm.params.viz.viz_svg).style('opacity', 0.70);

	  make_row_cat(cgm);
	  make_row_cat_super_labels(cgm);

	  if (cgm.params.viz.show_categories.col) {
	    make_col_cat(cgm);
	  }

	  if (cgm.params.viz.show_dendrogram) {
	    make_row_dendro(cgm);
	    make_col_dendro(cgm);
	  }

	  initialize_resizing(cgm);

	  d3.select(cgm.params.viz.viz_svg).call(cgm.params.zoom_behavior);

	  ini_doubleclick(cgm);

	  ini_sidebar(cgm);

	  cgm.params.viz.run_trans = true;

	  // d3.selectAll(cgm.params.viz.root_tips)
	  //   .style('opacity',0);

	  setTimeout(enable_sidebar, 2500, cgm.params);

	  setTimeout(d3.selectAll(cgm.params.root + ' .dendro_shadow').remove(), 500);

	  function finish_update() {
	    d3.select(cgm.params.viz.viz_svg).transition().duration(250).style('opacity', 1.0);

	    setTimeout(finish_update_class, 1000);
	  }

	  setTimeout(finish_update, delays.enter);

	  function finish_update_class() {
	    d3.select(cgm.params.viz.viz_svg).classed('running_update', false);
	  }
		};

/***/ },
/* 146 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (old_params, params) {

	  // exit, update, enter

	  // check if exit or enter or both are required
	  var old_row_nodes = old_params.network_data.row_nodes;
	  var old_col_nodes = old_params.network_data.col_nodes;
	  var old_row = _.map(old_row_nodes, function (d) {
	    return d.name;
	  });
	  var old_col = _.map(old_col_nodes, function (d) {
	    return d.name;
	  });
	  var all_old_nodes = old_row.concat(old_col);

	  var row_nodes = params.network_data.row_nodes;
	  var col_nodes = params.network_data.col_nodes;
	  var row = _.map(row_nodes, function (d) {
	    return d.name;
	  });
	  var col = _.map(col_nodes, function (d) {
	    return d.name;
	  });
	  var all_nodes = row.concat(col);

	  var exit_nodes = _.difference(all_old_nodes, all_nodes).length;
	  var enter_nodes = _.difference(all_nodes, all_old_nodes).length;

	  var delays = {};

	  if (exit_nodes > 0) {
	    delays.update = 1000;
	  } else {
	    delays.update = 0;
	  }

	  if (enter_nodes > 0) {
	    delays.enter = 1000;
	  } else {
	    delays.enter = 0;
	  }

	  delays.enter = delays.enter + delays.update;

	  delays.run_transition = true;

	  var old_num_links = old_params.network_data.links.length;
	  var new_num_links = params.network_data.links.length;
	  var cutoff_num_links = 0.5 * params.matrix.def_large_matrix;

	  if (old_num_links > cutoff_num_links || new_num_links > cutoff_num_links) {
	    delays.run_transition = false;
	    delays.update = 0;
	    delays.enter = 0;
	  }

	  return delays;
	};

/***/ },
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var reset_size_after_update = __webpack_require__(148);
	var make_row_label_container = __webpack_require__(51);
	var make_col_label_container = __webpack_require__(69);
	var eeu_existing_row = __webpack_require__(149);
	var exit_components = __webpack_require__(153);
	var draw_gridlines = __webpack_require__(41);
	var enter_row_groups = __webpack_require__(154);
	var resize_containers = __webpack_require__(157);
	var label_constrain_and_trim = __webpack_require__(83);
	var d3_tip_custom = __webpack_require__(50);

	module.exports = function enter_exit_update(cgm, network_data, delays) {

	  var params = cgm.params;

	  // remove old tooltips
	  d3.selectAll(params.viz.root_tips).remove();

	  // d3-tooltip - for tiles
	  var tip = d3_tip_custom().attr('class', function () {
	    var root_tip_selector = params.viz.root_tips.replace('.', '');
	    var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_tile_tip';
	    return class_string;
	  }).direction('nw').offset([0, 0]).style('display', 'none').html(function (d) {
	    var inst_value = String(d.value.toFixed(3));
	    var tooltip_string;

	    if (params.keep_orig) {
	      var orig_value = String(d.value_orig.toFixed(3));
	      tooltip_string = '<p>' + d.row_name + ' and ' + d.col_name + '</p>' + '<p> normalized value: ' + inst_value + '</p>' + '<div> original value: ' + orig_value + '</div>';
	    } else {
	      tooltip_string = '<p>' + d.row_name + ' and ' + d.col_name + '</p>' + '<div> value: ' + inst_value + '</div>';
	    }

	    return tooltip_string;
	  });

	  d3.select(params.root + ' .clust_group').call(tip);

	  // necessary for repositioning clust, col and col-cat containers
	  resize_containers(params);

	  var duration = 1000;

	  // make global so that names can be accessed
	  var row_nodes = network_data.row_nodes;
	  var col_nodes = network_data.col_nodes;
	  var links = network_data.links;

	  //
	  var tile_data = links;

	  // add name to links for object constancy
	  for (var i = 0; i < tile_data.length; i++) {
	    var d = tile_data[i];
	    tile_data[i].name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
	  }

	  // move rows
	  var move_rows = d3.select(params.root + ' .clust_group').selectAll('.row').data(params.matrix.matrix, function (d) {
	    return d.name;
	  });

	  if (delays.run_transition) {
	    move_rows.transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var tmp_index = d.row_index;
	      return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
	    });
	  } else {
	    move_rows.attr('transform', function (d) {
	      var tmp_index = d.row_index;
	      return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
	    });
	  }

	  // update existing rows - enter, exit, update tiles in existing row
	  d3.select(params.root + ' .clust_group').selectAll('.row').each(function (d) {
	    // TODO add tip back to arguments
	    var inst_selection = this;
	    eeu_existing_row(params, d, delays, duration, inst_selection, tip);
	  });

	  d3.selectAll(params.root + ' .horz_lines').remove();
	  d3.selectAll(params.root + ' .vert_lines').remove();

	  // exit
	  ////////////
	  exit_components(params, delays, duration);

	  // resize clust components using appropriate delays
	  reset_size_after_update(cgm, duration, delays);

	  // enter new elements
	  //////////////////////////
	  enter_row_groups(params, delays, duration, tip);

	  // update existing rows
	  make_row_label_container(cgm, duration);
	  make_col_label_container(cgm, duration);

	  draw_gridlines(params, delays, duration);

	  setTimeout(label_constrain_and_trim, 2000, params);
		};

/***/ },
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var calc_clust_height = __webpack_require__(28);
	var get_svg_dim = __webpack_require__(25);
	var calc_clust_width = __webpack_require__(27);
	var reset_zoom = __webpack_require__(100);
	var resize_dendro = __webpack_require__(101);
	var resize_super_labels = __webpack_require__(102);
	var resize_spillover = __webpack_require__(103);
	var resize_row_labels = __webpack_require__(105);
	var resize_row_viz = __webpack_require__(107);
	var resize_col_labels = __webpack_require__(108);
	var resize_col_text = __webpack_require__(109);
	var resize_col_triangle = __webpack_require__(110);
	var resize_col_hlight = __webpack_require__(111);
	var resize_label_bars = __webpack_require__(114);
	var calc_default_fs = __webpack_require__(37);
	var calc_zoom_switching = __webpack_require__(36);
	// var show_visible_area = require('../zoom/show_visible_area');
	var ini_zoom_info = __webpack_require__(38);

	module.exports = function reset_size_after_update(cgm) {
	  var duration = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	  var delays = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];


	  if (delays === null) {
	    delays = {};
	    delays.enter = 0;
	    delays.update = 0;
	    delays.run_transition = false;
	  }

	  var params = cgm.params;

	  var row_nodes = cgm.params.network_data.row_nodes;
	  // var col_nodes = cgm.params.network_data.col_nodes;
	  // var links = cgm.params.network_data.links;

	  params.zoom_info = ini_zoom_info();

	  // // not sure if this is necessary
	  // ////////////////////////////
	  // show_visible_area(params);
	  // // quick fix for column filtering
	  // setTimeout(show_visible_area, 2200, cgm);

	  var row_nodes_names = params.network_data.row_nodes_names;

	  reset_zoom(params);

	  // Resetting some visualization parameters
	  params = get_svg_dim(params);
	  params.viz = calc_clust_width(params.viz);
	  params.viz = calc_clust_height(params.viz);

	  if (params.sim_mat) {
	    if (params.viz.clust.dim.width <= params.viz.clust.dim.height) {
	      params.viz.clust.dim.height = params.viz.clust.dim.width;
	    } else {
	      params.viz.clust.dim.width = params.viz.clust.dim.height;
	    }
	  }
	  params.viz = calc_zoom_switching(params.viz);

	  // redefine x_scale and y_scale rangeBands
	  params.viz.x_scale.rangeBands([0, params.viz.clust.dim.width]);
	  params.viz.y_scale.rangeBands([0, params.viz.clust.dim.height]);

	  // redefine zoom extent
	  params.viz.real_zoom = params.viz.norm_labels.width.col / (params.viz.x_scale.rangeBand() / 2);
	  params.zoom_behavior.scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch]);

	  // redefine border width
	  params.viz.border_width.x = params.viz.x_scale.rangeBand() / params.viz.border_fraction;
	  params.viz.border_width.y = params.viz.y_scale.rangeBand() / params.viz.border_fraction;

	  params = calc_default_fs(params);

	  // resize the svg
	  ///////////////////////
	  var svg_group = d3.select(params.viz.viz_wrapper).select('svg');

	  svg_group.select(params.root + ' .grey_background').transition().delay(delays.update).duration(duration).attr('width', params.viz.clust.dim.width).attr('height', params.viz.clust.dim.height);

	  resize_row_labels(params, svg_group, delays);

	  // do not delay the font size change since this will break the bounding box calc
	  svg_group.selectAll('.row_label_group').select('text').style('font-size', params.labels.default_fs_row + 'px').text(function (d) {
	    return utils.normal_name(d);
	  });

	  // change the size of the highlighting rects
	  svg_group.selectAll('.row_label_group').each(function () {
	    var bbox = d3.select(this).select('text')[0][0].getBBox();
	    d3.select(this).select('rect').attr('x', bbox.x).attr('y', 0).attr('width', bbox.width).attr('height', params.viz.y_scale.rangeBand()).style('fill', 'yellow').style('opacity', function (d) {
	      var inst_opacity = 0;
	      // highlight target genes
	      if (d.target === 1) {
	        inst_opacity = 1;
	      }
	      return inst_opacity;
	    });
	  });

	  resize_row_viz(params, svg_group, delays);

	  if (delays.run_transition) {

	    // positioning row text after row text size may have been reduced
	    svg_group.selectAll('.row_label_group').select('text').transition().delay(delays.update).duration(duration).attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);

	    svg_group.selectAll('.row_cat_group').data(row_nodes, function (d) {
	      return d.name;
	    }).transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	    });

	    svg_group.selectAll('.row_cat_group').select('path').transition().delay(delays.update).duration(duration).attr('d', function () {
	      var origin_x = params.viz.cat_room.symbol_width - 1;
	      var origin_y = 0;
	      var mid_x = 1;
	      var mid_y = params.viz.y_scale.rangeBand() / 2;
	      var final_x = params.viz.cat_room.symbol_width - 1;
	      var final_y = params.viz.y_scale.rangeBand();
	      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
	      return output_string;
	    });

	    svg_group.selectAll('.row_dendro_group').data(row_nodes, function (d) {
	      return d.name;
	    }).transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	    });
	  } else {

	    // positioning row text after row text size may have been reduced
	    svg_group.selectAll('.row_label_group').select('text').attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);

	    svg_group.selectAll('.row_cat_group').data(row_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	    });

	    svg_group.selectAll('.row_cat_group').select('path').attr('d', function () {
	      var origin_x = params.viz.cat_room.symbol_width - 1;
	      var origin_y = 0;
	      var mid_x = 1;
	      var mid_y = params.viz.y_scale.rangeBand() / 2;
	      var final_x = params.viz.cat_room.symbol_width - 1;
	      var final_y = params.viz.y_scale.rangeBand();
	      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
	      return output_string;
	    });

	    svg_group.selectAll('.row_dendro_group').data(row_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	    });
	  }

	  if (utils.has(params.network_data.row_nodes[0], 'value')) {

	    resize_label_bars(cgm, svg_group);
	  }

	  // resize col labels
	  ///////////////////////
	  // reduce width of rotated rects

	  resize_col_labels(params, svg_group, delays);
	  resize_col_text(params, svg_group);
	  resize_col_triangle(params, svg_group, delays);

	  resize_col_hlight(params, svg_group, delays);

	  resize_dendro(params, svg_group, delays);
	  resize_super_labels(params, svg_group, delays);
	  resize_spillover(params.viz, svg_group, delays);

	  // reset zoom and translate
	  params.zoom_behavior.scale(1).translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);
		};

/***/ },
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var exit_existing_row = __webpack_require__(150);
	var enter_existing_row = __webpack_require__(151);
	var update_split_tiles = __webpack_require__(152);
	var mouseover_tile = __webpack_require__(47);
	var mouseout_tile = __webpack_require__(48);
	var fine_position_tile = __webpack_require__(49);

	// TODO add tip back to arguments
	module.exports = function eeu_existing_row(params, ini_inp_row_data, delays, duration, row_selection, tip) {

	  var inp_row_data = ini_inp_row_data.row_data;

	  // remove zero values from
	  var row_values = _.filter(inp_row_data, function (num) {
	    return num.value != 0;
	  });

	  // bind data to tiles
	  var cur_row_tiles = d3.select(row_selection).selectAll('.tile').data(row_values, function (d) {
	    return d.col_name;
	  });

	  exit_existing_row(params, delays, cur_row_tiles, inp_row_data, row_selection);

	  ///////////////////////////
	  // Update
	  ///////////////////////////

	  // update tiles in x direction
	  var update_row_tiles = cur_row_tiles.on('mouseover', function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    mouseover_tile(params, this, tip, args);
	  }).on('mouseout', function mouseout() {
	    mouseout_tile(params, this, tip);
	  });

	  var col_nodes_names = params.network_data.col_nodes_names;

	  if (delays.run_transition) {

	    update_row_tiles.transition().delay(delays.update).duration(duration).attr('width', params.viz.rect_width).attr('height', params.viz.rect_height).attr('transform', function (d) {
	      if (_.contains(col_nodes_names, d.col_name)) {
	        return fine_position_tile(params, d);
	      } else {
	        return 'translate(0,0)';
	      }
	    });
	  } else {
	    update_row_tiles.attr('width', params.viz.rect_width).attr('height', params.viz.rect_height).attr('transform', function (d) {
	      if (_.contains(col_nodes_names, d.col_name)) {
	        return fine_position_tile(params, d);
	      } else {
	        return 'translate(0,0)';
	      }
	    });
	  }

	  if (params.matrix.tile_type == 'updn') {
	    update_split_tiles(params, inp_row_data, row_selection, delays, duration, cur_row_tiles, tip);
	  }

	  enter_existing_row(params, delays, duration, cur_row_tiles, tip);
		};

/***/ },
/* 150 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function exit_existing_row(params, delays, cur_row_tiles, inp_row_data, row_selection) {

	  if (delays.run_transition) {
	    cur_row_tiles.exit().transition().duration(300).attr('fill-opacity', 0).remove();
	  } else {
	    cur_row_tiles.exit().attr('fill-opacity', 0).remove();
	  }

	  if (params.matrix.tile_type == 'updn') {

	    // value split
	    var row_split_data = _.filter(inp_row_data, function (num) {
	      return num.value_up != 0 || num.value_dn != 0;
	    });

	    // tile_up
	    var cur_tiles_up = d3.select(row_selection).selectAll('.tile_up').data(row_split_data, function (d) {
	      return d.col_name;
	    });

	    if (delays.run_transition) {
	      cur_tiles_up.exit().transition().duration(300).attr('fill', '0').remove();
	    } else {
	      cur_tiles_up.exit().attr('fill', 0).remove();
	    }

	    // tile_dn
	    var cur_tiles_dn = d3.select(row_selection).selectAll('.tile_dn').data(row_split_data, function (d) {
	      return d.col_name;
	    });

	    if (delays.run_transition) {
	      cur_tiles_dn.exit().transition().duration(300).attr('fill', 0).remove();
	    } else {
	      cur_tiles_dn.exit().attr('fill', 0).remove();
	    }
	  }
		};

/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mouseover_tile = __webpack_require__(47);
	var mouseout_tile = __webpack_require__(48);
	var fine_position_tile = __webpack_require__(49);

	module.exports = function enter_existing_row(params, delays, duration, cur_row_tiles, tip) {

	  // enter new tiles
	  var new_tiles = cur_row_tiles.enter().append('rect').attr('class', 'tile row_tile').attr('width', params.viz.rect_width).attr('height', params.viz.rect_height).on('mouseover', function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    mouseover_tile(params, this, tip, args);
	  }).on('mouseout', function mouseout() {
	    mouseout_tile(params, this, tip);
	  }).attr('fill-opacity', 0).attr('transform', function (d) {
	    return fine_position_tile(params, d);
	  });

	  if (delays.run_transition) {
	    new_tiles.transition().delay(delays.enter).duration(duration).style('fill', function (d) {
	      return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
	    }).attr('fill-opacity', function (d) {
	      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
	      return output_opacity;
	    });
	  } else {
	    new_tiles.style('fill', function (d) {
	      return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
	    }).attr('fill-opacity', function (d) {
	      var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
	      return output_opacity;
	    });
	  }

	  // remove new tiles if necessary
	  new_tiles.each(function (d) {
	    if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
	      d3.select(this).remove();
	    }
	  });
	};

/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var draw_up_tile = __webpack_require__(45);
	var draw_dn_tile = __webpack_require__(46);
	var mouseover_tile = __webpack_require__(47);
	var mouseout_tile = __webpack_require__(48);
	var fine_position_tile = __webpack_require__(49);

	module.exports = function update_split_tiles(params, inp_row_data, row_selection, delays, duration, cur_row_tiles, tip) {

	  // value split
	  var row_split_data = _.filter(inp_row_data, function (num) {
	    return num.value_up != 0 || num.value_dn != 0;
	  });

	  // tile_up
	  var cur_tiles_up = d3.select(row_selection).selectAll('.tile_up').data(row_split_data, function (d) {
	    return d.col_name;
	  });

	  // update split tiles_up
	  var update_tiles_up = cur_tiles_up.on('mouseover', function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    mouseover_tile(params, this, tip, args);
	  }).on('mouseout', function mouseout() {
	    mouseout_tile(params, this, tip);
	  });

	  if (delays.run_transition) {
	    update_tiles_up.transition().delay(delays.update).duration(duration).attr('d', function () {
	      return draw_up_tile(params);
	    }).attr('transform', function (d) {
	      return fine_position_tile(params, d);
	    });
	  } else {
	    update_tiles_up.attr('d', function () {
	      return draw_up_tile(params);
	    }).attr('transform', function (d) {
	      return fine_position_tile(params, d);
	    });
	  }

	  // tile_dn
	  var cur_tiles_dn = d3.select(row_selection).selectAll('.tile_dn').data(row_split_data, function (d) {
	    return d.col_name;
	  });

	  // update split tiles_dn
	  var update_tiles_dn = cur_tiles_dn.on('mouseover', function () {
	    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	      args[_key2] = arguments[_key2];
	    }

	    mouseover_tile(params, this, tip, args);
	  }).on('mouseout', function mouseout() {
	    mouseout_tile(params, this, tip);
	  });

	  if (delays.run_transition) {
	    update_tiles_dn.transition().delay(delays.update).duration(duration).attr('d', function () {
	      return draw_dn_tile(params);
	    }).attr('transform', function (d) {
	      return fine_position_tile(params, d);
	    });
	  } else {
	    update_tiles_dn.attr('d', function () {
	      return draw_dn_tile(params);
	    }).attr('transform', function (d) {
	      return fine_position_tile(params, d);
	    });
	  }

	  // remove tiles when splitting is done
	  cur_row_tiles.selectAll('.tile').each(function (d) {
	    if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
	      d3.select(this).remove();
	    }
	  });
	};

/***/ },
/* 153 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function exit_components(params, delays, duration) {

	  var row_nodes = params.network_data.row_nodes;
	  var col_nodes = params.network_data.col_nodes;

	  // remove entire rows
	  var exiting_rows = d3.select(params.root + ' .clust_group').selectAll('.row').data(params.matrix.matrix, function (d) {
	    return d.name;
	  }).exit();

	  if (delays.run_transition) {
	    exiting_rows.transition().duration(duration).style('opacity', 0).remove();
	  } else {
	    exiting_rows.style('opacity', 0).remove();
	  }

	  // remove row labels
	  d3.selectAll(params.root + ' .row_label_group').data(row_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();

	  // remove column labels
	  d3.selectAll(params.root + ' .col_label_group').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();

	  // remove row triangles and colorbars
	  d3.selectAll(params.root + ' .row_cat_group').data(row_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();

	  // remove row triangles and colorbars
	  d3.selectAll(params.root + ' .row_dendro_group').data(row_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();

	  d3.selectAll(params.root + ' .col_label_text').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();

	  d3.selectAll(params.root + ' .horz_lines').data(row_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();

	  d3.selectAll(params.root + ' .vert_lines').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();

	  // remove dendrogram
	  d3.selectAll(params.root + ' .col_cat_group').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();

	  d3.selectAll(params.root + ' .col_dendro_group').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().transition().duration(duration).style('opacity', 0).remove();
		};

/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var enter_new_rows = __webpack_require__(155);

	module.exports = function enter_row_groups(params, delays, duration, tip) {

	  // enter new rows
	  var new_row_groups = d3.select(params.root + ' .clust_group').selectAll('.row').data(params.matrix.matrix, function (d) {
	    return d.name;
	  }).enter().append('g').classed('row', true).attr('transform', function (d) {
	    return 'translate(0,' + params.viz.y_scale(d.row_index) + ')';
	  });

	  new_row_groups.each(function (d) {
	    enter_new_rows(params, d, delays, duration, tip, this);
	  });
		};

/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var enter_split_tiles = __webpack_require__(156);
	var mouseover_tile = __webpack_require__(47);
	var mouseout_tile = __webpack_require__(48);
	var fine_position_tile = __webpack_require__(49);

	// make each row in the clustergram
	module.exports = function enter_new_rows(params, ini_inp_row_data, delays, duration, tip, row_selection) {

	  var inp_row_data = ini_inp_row_data.row_data;

	  // remove zero values to make visualization faster
	  var row_data = _.filter(inp_row_data, function (num) {
	    return num.value !== 0;
	  });

	  // update tiles
	  ////////////////////////////////////////////
	  var tile = d3.select(row_selection).selectAll('rect').data(row_data, function (d) {
	    return d.col_name;
	  }).enter().append('rect').attr('class', 'tile row_tile').attr('width', params.viz.rect_width).attr('height', params.viz.rect_height)
	  // switch the color based on up/dn value
	  .style('fill', function (d) {
	    return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
	  }).on('mouseover', function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    mouseover_tile(params, this, tip, args);
	  }).on('mouseout', function mouseout() {
	    mouseout_tile(params, this, tip);
	  });

	  tile.style('fill-opacity', 0).transition().delay(delays.enter).duration(duration).style('fill-opacity', function (d) {
	    // calculate output opacity using the opacity scale
	    var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
	    return output_opacity;
	  });

	  tile.attr('transform', function (d) {
	    return fine_position_tile(params, d);
	  });

	  if (params.matrix.tile_type == 'updn') {
	    enter_split_tiles(params, inp_row_data, row_selection, tip, delays, duration, tile);
	  }
		};

/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var draw_up_tile = __webpack_require__(45);
	var draw_dn_tile = __webpack_require__(46);
	var fine_position_tile = __webpack_require__(49);

	module.exports = function enter_split_tiles(params, inp_row_data, row_selection, tip, delays, duration, tile) {

	  // value split
	  var row_split_data = _.filter(inp_row_data, function (num) {
	    return num.value_up != 0 || num.value_dn != 0;
	  });

	  // tile_up
	  var new_tiles_up = d3.select(row_selection).selectAll('.tile_up').data(row_split_data, function (d) {
	    return d.col_name;
	  }).enter().append('path').attr('class', 'tile_up').attr('d', function () {
	    return draw_up_tile(params);
	  }).attr('transform', function (d) {
	    return fine_position_tile(params, d);
	  }).style('fill', function () {
	    return params.matrix.tile_colors[0];
	  }).on('mouseover', function (p) {
	    // highlight row - set text to active if
	    d3.selectAll(params.root + ' .row_label_group text').classed('active', function (d) {
	      return p.row_name === d.name;
	    });

	    d3.selectAll(params.root + ' .col_label_text text').classed('active', function (d) {
	      return p.col_name === d.name;
	    });
	    if (params.matrix.show_tile_tooltips) {
	      tip.show(p);
	    }
	  }).on('mouseout', function () {
	    d3.selectAll(params.root + ' text').classed('active', false);
	    if (params.matrix.show_tile_tooltips) {
	      tip.hide();
	    }
	  });

	  new_tiles_up.style('fill-opacity', 0).transition().delay(delays.enter).duration(duration).style('fill-opacity', function (d) {
	    var inst_opacity = 0;
	    if (Math.abs(d.value_dn) > 0) {
	      inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_up));
	    }
	    return inst_opacity;
	  });

	  // tile_dn
	  var new_tiles_dn = d3.select(row_selection).selectAll('.tile_dn').data(row_split_data, function (d) {
	    return d.col_name;
	  }).enter().append('path').attr('class', 'tile_dn').attr('d', function () {
	    return draw_dn_tile(params);
	  }).attr('transform', function (d) {
	    return fine_position_tile(params, d);
	  }).style('fill', function () {
	    return params.matrix.tile_colors[1];
	  }).on('mouseover', function (p) {
	    // highlight row - set text to active if
	    d3.selectAll(params.root + ' .row_label_group text').classed('active', function (d) {
	      return p.row_name === d.name;
	    });

	    d3.selectAll(params.root + ' .col_label_text text').classed('active', function (d) {
	      return p.col_name === d.name;
	    });
	    if (params.matrix.show_tile_tooltips) {
	      tip.show(p);
	    }
	  }).on('mouseout', function () {
	    d3.selectAll(params.root + ' text').classed('active', false);
	    if (params.matrix.show_tile_tooltips) {
	      tip.hide();
	    }
	  });

	  new_tiles_dn.style('fill-opacity', 0).transition().delay(delays.enter).duration(duration).style('fill-opacity', function (d) {
	    var inst_opacity = 0;
	    if (Math.abs(d.value_up) > 0) {
	      inst_opacity = params.matrix.opacity_scale(Math.abs(d.value_dn));
	    }
	    return inst_opacity;
	  });

	  // remove tiles when splitting is done
	  tile.each(function (d) {
	    if (Math.abs(d.value_up) > 0 && Math.abs(d.value_dn) > 0) {
	      d3.select(this).remove();
	    }
	  });
		};

/***/ },
/* 157 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_containers(params) {

	  // reposition matrix
	  d3.select(params.root + ' .clust_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.clust.margin.top + ')');

	  // reposition col container
	  d3.select(params.root + ' .col_label_outer_container').attr('transform', 'translate(0,' + params.viz.norm_labels.width.col + ')');

	  // reposition col_viz container
	  d3.select(params.root + ' .col_cat_outer_container').attr('transform', function () {
	    var inst_offset = params.viz.norm_labels.width.col + 2;
	    return 'translate(0,' + inst_offset + ')';
	  });
		};

/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* eslint-disable */

	var change_groups = __webpack_require__(129);
	var all_reorder = __webpack_require__(81);
	var ini_cat_reorder = __webpack_require__(80);
	var run_row_search = __webpack_require__(159);

	module.exports = function ini_sidebar(cgm) {

	  var params = cgm.params;

	  var input = d3.select(params.root + ' .gene_search_box')[0][0];
	  var awesomplete = new Awesomplete(input, { minChars: 1, maxItems: 15 });
	  var entities = cgm.params.network_data.row_nodes_names;
	  awesomplete.list = entities;

	  // submit genes button
	  $(params.root + ' .gene_search_box').keyup(function (e) {
	    if (e.keyCode === 13) {
	      var search_gene = $(params.root + ' .gene_search_box').val();
	      run_row_search(cgm, search_gene, entities);
	    }
	  });

	  $(params.root + ' .submit_gene_button').off().click(function () {
	    var search_gene = $(params.root + ' .gene_search_box').val();
	    run_row_search(cgm, search_gene, entities);
	  });

	  var reorder_types;
	  if (params.sim_mat) {
	    reorder_types = ['both'];
	  } else {
	    reorder_types = ['row', 'col'];
	  }

	  _.each(reorder_types, function (inst_rc) {

	    // reorder buttons
	    $(params.root + ' .toggle_' + inst_rc + '_order .btn').off().click(function (evt) {

	      var order_id = $(evt.target).attr('name').replace('_row', '').replace('_col', '');

	      d3.selectAll(params.root + ' .toggle_' + inst_rc + '_order .btn').classed('active', false);

	      d3.select(this).classed('active', true);

	      if (inst_rc != 'both') {
	        all_reorder(cgm, order_id, inst_rc);
	      } else {
	        all_reorder(cgm, order_id, 'row');
	        all_reorder(cgm, order_id, 'col');
	      }
	    });
	  });

	  ini_cat_reorder(cgm);

	  // Opacity Slider
	  //////////////////////////////////////////////////////////////////////
	  if (d3.select(cgm.params.root + ' .opacity_slider').select('#handle-one').empty()) {

	    var slider_fun = d3.slider().snap(true).value(1).min(0.1).max(1.9).step(0.1).on('slide', function (evt, value) {
	      run_on_opacity_slide(evt, value);
	    });

	    d3.select(cgm.params.root + ' .opacity_slider').call(slider_fun);
	  }

	  function run_on_dendro_slide(evt, value, inst_rc) {
	    $("#amount").val("$" + value);
	    var inst_index = value * 10;
	    // var inst_rc;

	    if (inst_rc != 'both') {
	      change_groups(cgm, inst_rc, inst_index);
	    } else {
	      change_groups(cgm, 'row', inst_index);
	      change_groups(cgm, 'col', inst_index);
	    }
	  }

	  function run_on_opacity_slide(evt, value) {

	    var inst_index = 2 - value;
	    var scaled_max = cgm.params.matrix.abs_max_val * inst_index;

	    cgm.params.matrix.opacity_scale.domain([0, scaled_max]);

	    d3.selectAll(cgm.params.root + ' .tile').style('fill-opacity', function (d) {
	      // calculate output opacity using the opacity scale
	      var output_opacity = cgm.params.matrix.opacity_scale(Math.abs(d.value));
	      return output_opacity;
	    });
	  }
		};

/***/ },
/* 159 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var two_translate_zoom = __webpack_require__(82);

	module.exports = function run_row_search(cgm, search_term, entities) {

	  var prop = 'name';

	  if (entities.indexOf(search_term) !== -1) {

	    // unhighlight
	    d3.selectAll(cgm.params.root + ' .row_label_group').select('rect').style('opacity', 0);

	    // calc pan_dy
	    var idx = _.indexOf(entities, search_term);
	    var inst_y_pos = cgm.params.viz.y_scale(idx);
	    var pan_dy = cgm.params.viz.clust.dim.height / 2 - inst_y_pos;

	    two_translate_zoom(cgm, 0, pan_dy, cgm.params.viz.zoom_switch);

	    // set y zoom to zoom_switch
	    cgm.params.zoom_info.zoom_y = cgm.params.viz.zoom_switch;

	    // highlight
	    d3.selectAll(cgm.params.root + ' .row_label_group').filter(function (d) {
	      return d[prop] === search_term;
	    }).select('rect').style('opacity', 1);
	  }
		};

/***/ },
/* 160 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function enable_sidebar(params) {

	  /* only enable dendrogram sliders if there has been no dendro_filtering */

	  // only enable reordering if params.dendro_filter.row === false
	  if (params.dendro_filter.row === false) {

	    // orders are switched!
	    if (params.viz.inst_order.col === 'clust') {
	      d3.select(params.root + ' .row_slider_group').style('opacity', 1).style('pointer-events', 'all');
	    }
	  }

	  d3.selectAll(params.root + ' .toggle_row_order .btn').attr('disabled', null);

	  if (params.dendro_filter.col === false) {

	    // orders are switched!
	    if (params.viz.inst_order.row === 'clust') {
	      d3.select(params.root + ' .col_slider_group').style('opacity', 1).style('pointer-events', 'all');
	    }
	  }

	  d3.selectAll(params.root + ' .toggle_col_order .btn').attr('disabled', null);

	  d3.selectAll(params.root + ' .gene_search_button .btn').attr('disabled', null);

	  params.viz.run_trans = false;
		};

/***/ },
/* 161 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function update_reorder_buttons(tmp_config, params) {
	  _.each(['row', 'col'], function (inst_rc) {

	    var other_rc;
	    if (inst_rc === 'row') {
	      other_rc = 'col';
	    } else {
	      other_rc = 'row';
	    }

	    d3.selectAll(params.root + ' .toggle_' + other_rc + '_order .btn').filter(function () {
	      return d3.select(this).attr('name') === tmp_config.inst_order[inst_rc];
	    }).classed('active', true);
	  });
	};

/***/ },
/* 162 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var remove_node_cats = __webpack_require__(163);
	var utils = __webpack_require__(2);

	module.exports = function modify_row_node_cats(cat_data, inst_nodes) {
	  var strip_names = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  var cat_type_num = 0;
	  var inst_index = 0;
	  var inst_cat_title;
	  var inst_cats;
	  var inst_members;
	  var inst_name;
	  var inst_category;
	  var inst_cat_name;
	  var inst_full_cat;
	  var inst_cat_num;

	  // loop through row nodes
	  //////////////////////////
	  _.each(inst_nodes, function (inst_node) {

	    inst_name = inst_node.name;

	    // not sure if this is needed
	    // inst_name = inst_name.toUpperCase();

	    if (strip_names === true) {
	      // only consider first part of inst_name
	      ////////////////////////////////////////////
	      // may improve this
	      if (inst_name.indexOf(' ')) {
	        inst_name = inst_name.split(' ')[0];
	      } else if (inst_name.indexOf('_')) {
	        inst_name = inst_name.split('_')[0];
	      }
	    }

	    cat_type_num = 0;

	    remove_node_cats(inst_node);

	    // loop through each category type
	    _.each(cat_data, function (inst_cat_data) {

	      inst_cat_title = inst_cat_data.cat_title;
	      inst_cats = inst_cat_data.cats;

	      // initialize with no category
	      inst_category = 'false';
	      inst_index = -1;

	      inst_cat_num = 0;
	      // loop through each category in the category-type
	      _.each(inst_cats, function (inst_cat) {

	        inst_cat_name = inst_cat.cat_name;
	        inst_members = inst_cat.members;

	        // add category if node is a member
	        if (_.contains(inst_members, inst_name)) {

	          inst_category = inst_cat_name;
	          inst_index = inst_cat_num;
	        }

	        inst_cat_num = inst_cat_num + 1;
	      });

	      if (utils.has(inst_cat_data, 'pval')) {

	        var inst_pval = inst_cat_data.pval.toExponential();
	        inst_full_cat = inst_cat_title + ': ' + inst_category + '<p> Pval ' + String(inst_pval) + '</p>';
	      } else {

	        inst_full_cat = inst_cat_title + ': ' + inst_category;
	      }

	      inst_node['cat-' + String(cat_type_num)] = inst_full_cat;
	      inst_node['cat_' + String(cat_type_num) + '_index'] = inst_index;

	      cat_type_num = cat_type_num + 1;
	    });
	  });
		};

/***/ },
/* 163 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function remove_node_cats(inst_node) {

	  var all_props = _.keys(inst_node);

	  _.each(all_props, function (inst_prop) {

	    if (inst_prop.indexOf('cat-') > -1) {
	      delete inst_node[inst_prop];
	    }

	    if (inst_prop.indexOf('cat_') > -1) {
	      delete inst_node[inst_prop];
	    }
	  });
		};

/***/ },
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var reset_size_after_update = __webpack_require__(148);
	var make_col_label_container = __webpack_require__(69);
	var show_visible_area = __webpack_require__(72);
	var resize_containers = __webpack_require__(157);

	module.exports = function ds_enter_exit_update(cgm) {

	  // console.log('======== ds_enter_exit_update ===============');

	  // remove row labels, remove non-downsampled rows, and add downsampled rows
	  d3.selectAll(cgm.params.root + ' .row_cat_group').remove();
	  d3.selectAll(cgm.params.root + ' .row_label_group').remove();
	  d3.selectAll(cgm.params.root + ' .row').remove();

	  // no need to re-calculate the downsampled layers
	  // calc_downsampled_levels(params);
	  var zooming_stopped = true;
	  var zooming_out = true;
	  var make_all_rows = true;

	  // show_visible_area is also run with two_translate_zoom, but at that point
	  // the parameters were not updated and two_translate_zoom if only run
	  // if needed to reset zoom
	  show_visible_area(cgm, zooming_stopped, zooming_out, make_all_rows);

	  make_col_label_container(cgm);

	  var col_nodes = cgm.params.network_data.col_nodes;

	  // remove column labels
	  d3.selectAll(cgm.params.root + ' .col_label_group').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().style('opacity', 0).remove();

	  d3.selectAll(cgm.params.root + ' .col_label_text').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().style('opacity', 0).remove();

	  d3.selectAll(cgm.params.root + ' .col_cat_group').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().style('opacity', 0).remove();

	  d3.selectAll(cgm.params.root + ' .col_dendro_group').data(col_nodes, function (d) {
	    return d.name;
	  }).exit().style('opacity', 0).remove();

	  // necessary for repositioning clust, col and col-cat containers
	  resize_containers(cgm.params);

	  // seeing if this fixes resizing issue
	  var delays = {};
	  delays.enter = 0;
	  delays.update = 0;
	  delays.run_transition = false;
	  var duration = 0;
	  reset_size_after_update(cgm, duration, delays);
		};

/***/ },
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var sim_click = __webpack_require__(137);

	module.exports = function quick_cluster() {
	  /* eslint-disable */

	  function run(params) {

	    var x_trans = Number(d3.select(params.root + ' .expand_button').attr('x').replace('px', ''));
	    var y_trans = Number(d3.select(params.root + ' .expand_button').attr('y').replace('px', ''));

	    var wait_click = 0;
	    var wait_real_click = 400;
	    setTimeout(sim_click, wait_click, params, 'single', x_trans, y_trans);
	    setTimeout(click_menu_button, wait_real_click, params);

	    setTimeout(reset_cluster_order, 1500, params);
	  }

	  function get_duration() {
	    return 3500;
	  }

	  function click_menu_button(params) {
	    $(params.root + ' .expand_button').d3Click();
	  };

	  function reset_cluster_order(params) {
	    click_reorder_button(params, 'row', 'clust');
	    click_reorder_button(params, 'col', 'clust');
	  }

	  function click_reorder_button(params, inst_rc, inst_order) {
	    var inst_button = d3.selectAll('.toggle_' + inst_rc + '_order .btn').filter(function () {
	      return this.__data__ == inst_order;
	    })[0];

	    $(inst_button).click();
	  }

	  // allows doubleclicking on d3 element
	  jQuery.fn.d3Click = function () {
	    this.each(function (i, e) {
	      var evt = document.createEvent("MouseEvents");
	      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	      e.dispatchEvent(evt);
	    });
	  };

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 166 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var highlight_sidebar_element = __webpack_require__(140);
	var change_groups = __webpack_require__(129);

	module.exports = function play_groups() {
	  /* eslint-disable */

	  function run(params) {

	    var text = 'Identify row and column groups\nof varying sizes using ' + ' the\nsliders and dendrogram';
	    demo_text(params, text, 10000);

	    setTimeout(highlight_sidebar_element, 3000, params, 'slider_col', 7000);

	    setTimeout(change_group_slider, 4000, params, 'row', 3);
	    setTimeout(change_group_slider, 5000, params, 'row', 4);
	    setTimeout(change_group_slider, 6000, params, 'row', 5);
	    setTimeout(change_group_slider, 7000, params, 'row', 6);
	    setTimeout(change_group_slider, 8000, params, 'row', 7);
	    setTimeout(change_group_slider, 9000, params, 'row', 5);
	  }

	  function get_duration() {
	    return 11000;
	  }

	  function change_group_slider(params, inst_rc, inst_value) {
	    $(cgm.params.root + ' .slider_col').slider("value", inst_value / 10);
	    change_groups(cgm, inst_rc, inst_value);
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var sim_click = __webpack_require__(137);

	module.exports = function play_category() {
	  /* eslint-disable */

	  function run(params) {

	    var text = 'Row and column categories\ncan be use to reorder\nby double-clicking';
	    demo_text(params, text, 7000);

	    var inst_element = d3.selectAll(params.root + ' .col_cat_super').filter(function () {
	      return this.__data__ === 'cat-1';
	    })[0];

	    var tmp_pos = d3.select('.col_cat_super').attr('transform');
	    var x_trans = Number(tmp_pos.split('(')[1].split(',')[0].replace(')', '')) + 20;
	    var y_trans = Number(tmp_pos.split(',')[1].replace(')', ''));

	    var wait_click = 4000;
	    setTimeout(sim_click, wait_click, params, 'double', x_trans, y_trans);

	    var wait_reorder = wait_click + 300;
	    setTimeout(fire_double_click_row, wait_reorder, params, inst_element);
	  }

	  function get_duration() {
	    return 8000;
	  }

	  function fire_double_click_row(params, inst_element) {
	    $(inst_element).d3DblClick();
	  }

	  // allows doubleclicking on d3 element
	  jQuery.fn.d3DblClick = function () {
	    this.each(function (i, e) {
	      var evt = document.createEvent("MouseEvents");
	      evt.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	      e.dispatchEvent(evt);
	    });
	  };
	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var toggle_play_button = __webpack_require__(169);

	module.exports = function play_conclusion() {

	  function run(params) {
	    var text_1 = "Clustergrammer is built with gene\nexpression data in mind" + " and interfaces\nwith several Ma'ayan lab web tools";
	    var text_2 = "The example data being visualized is\ngene expression data" + " obtained from the\nCancer Cell Line Encyclopedia";
	    var text_3 = "For more information please view\nthe help documentation";

	    setTimeout(demo_text, 0, params, text_1, 4500);
	    setTimeout(demo_text, 4500, params, text_2, 4500);
	    setTimeout(demo_text, 9000, params, text_3, 4500);

	    setTimeout(reset_demo, 14000, params);
	  }

	  function reset_demo(params) {

	    // prevent more than one demo from running at once 
	    d3.select(params.root + ' .play_button').classed('running_demo', false);

	    toggle_play_button(params, true);
	  }

	  function get_duration() {
	    return 12000;
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 169 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function toggle_play_button(params, show) {

	  if (show === false) {
	    d3.select(params.root + ' .play_button').transition().duration(500).style('opacity', 0);
	  } else {
	    d3.select(params.root + ' .play_button').transition().duration(500).style('opacity', 1);

	    $.unblockUI();
	  }
		};

/***/ },
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(134);
	var sim_click = __webpack_require__(137);

	module.exports = function play_menu_button() {
	  /* eslint-disable */

	  function run(params) {

	    var text = 'View additional controls\nby clicking the menu button';
	    demo_text(params, text, 4000);

	    // var inst_element = get_row_element(params, 'EGFR');

	    // var group_trans = d3.select(inst_element).attr('transform');

	    // var container_trans = d3.select(params.root+' .clust_container')
	    //   .attr('transform')
	    //   .split(',')[1].replace(')','');

	    // var x_trans = params.viz.norm_labels.width.row * 0.9;

	    // var row_trans = group_trans.split(',')[1].replace(')','');
	    // var y_trans = String(Number(row_trans) + Number(container_trans) + 
	    //   params.viz.rect_height/2);

	    var x_trans = Number(d3.select(params.root + ' .expand_button').attr('x').replace('px', ''));
	    var y_trans = Number(d3.select(params.root + ' .expand_button').attr('y').replace('px', ''));

	    var wait_click = 3000;
	    var wait_real_click = 3400;
	    setTimeout(sim_click, wait_click, params, 'single', x_trans, y_trans);
	    setTimeout(click_menu_button, wait_real_click, params);
	  }

	  function get_duration() {
	    return 5000;
	  }

	  function click_menu_button(params) {
	    $(params.root + ' .expand_button').d3Click();
	  };

	  function get_row_element(params, inst_row) {

	    var inst_element = d3.selectAll(params.root + ' .row_label_group').filter(function () {
	      var inst_data = this.__data__;
	      return inst_data.name == inst_row;
	    })[0][0];

	    return inst_element;
	  }

	  // allows doubleclicking on d3 element
	  jQuery.fn.d3Click = function () {
	    this.each(function (i, e) {
	      var evt = document.createEvent("MouseEvents");
	      evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	      e.dispatchEvent(evt);
	    });
	  };

	  // allows doubleclicking on d3 element
	  jQuery.fn.d3DblClick = function () {
	    this.each(function (i, e) {
	      var evt = document.createEvent("MouseEvents");
	      evt.initMouseEvent("dblclick", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	      e.dispatchEvent(evt);
	    });
	  };
	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 171 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_play_button = __webpack_require__(172);
	var make_demo_text_containers = __webpack_require__(173);

	module.exports = function ini_demo() {

	  var cgm = this;
	  var params = cgm.params;

	  make_play_button(cgm);

	  var demo_text_size = 30;
	  make_demo_text_containers(params, demo_text_size);
		};

/***/ },
/* 172 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var position_play_button = __webpack_require__(115);

	module.exports = function make_play_button(cgm) {

	  var params = cgm.params;

	  if (d3.select(params.root + ' .play_button').empty()) {

	    var play_button = d3.select(params.root + ' .viz_svg').append('g').classed('play_button', true).classed('running_demo', false);

	    position_play_button(params);

	    play_button.append('circle').style('r', 45).style('fill', 'white').style('stroke', 'black').style('stroke-width', '3px').style('opacity', 0.5);

	    play_button.append('path').attr('d', function () {

	      var tri_w = 40;
	      var tri_h = 22;
	      var tri_offset = 15;

	      return 'M-' + tri_offset + ',-' + tri_h + ' l ' + tri_w + ',' + tri_h + ' l -' + tri_w + ',' + tri_h + ' z ';
	    }).style('fill', 'black').style('opacity', 0.5);

	    // mouseover behavior
	    play_button.on('mouseover', function () {
	      d3.select(this).select('path').style('fill', 'red').style('opacity', 1);

	      d3.select(this).select('circle').style('opacity', 1);
	    }).on('mouseout', function () {
	      d3.select(this).select('path').style('fill', 'black').style('opacity', 0.5);
	      d3.select(this).select('circle').style('opacity', 0.5);
	    }).on('click', function () {
	      // running from anonymous function to keep this defined correctly 
	      cgm.play_demo();
	    });
	  }
		};

/***/ },
/* 173 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function make_demo_text_containers(params, demo_text_size) {

	  if (d3.select(params.root + ' .demo_group').empty()) {

	    var clust_transform = d3.select(params.root + ' .clust_container').attr('transform');
	    var clust_x = Number(clust_transform.split('(')[1].split(',')[0]);
	    var clust_y = Number(clust_transform.split(',')[1].replace(')', ''));

	    // demo text container 
	    var demo_group = d3.select(params.root + ' .viz_svg').append('g').classed('demo_group', true).attr('transform', function () {
	      var pos_x = clust_x + 20;
	      var pos_y = clust_y + 40;
	      return 'translate(' + pos_x + ',' + pos_y + ')';
	    });

	    demo_group.append('rect').classed('rect_1', true);

	    demo_group.append('rect').classed('rect_2', true);

	    demo_group.append('rect').classed('rect_3', true);

	    var shift_height = 1.3 * demo_text_size;

	    demo_group.append('text').attr('id', 'text_1').attr('font-size', demo_text_size + 'px').attr('font-weight', 1000).attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif');

	    demo_group.append('text').attr('id', 'text_2').attr('font-size', demo_text_size + 'px').attr('font-weight', 1000).attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').attr('transform', function () {
	      return 'translate(0,' + String(shift_height) + ')';
	    });

	    demo_group.append('text').attr('id', 'text_3').attr('font-size', demo_text_size + 'px').attr('font-weight', 1000).attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').attr('transform', function () {
	      return 'translate(0,' + String(2 * shift_height) + ')';
	    });
	  }
		};

/***/ },
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var filter_network_using_new_nodes = __webpack_require__(11);
	var update_viz_with_network = __webpack_require__(145);

	module.exports = function filter_viz_using_nodes(new_nodes) {

	  var new_network_data = filter_network_using_new_nodes(this.config, new_nodes);
	  update_viz_with_network(this, new_network_data);
		};

/***/ },
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var filter_network_using_new_nodes = __webpack_require__(11);
	var update_viz_with_network = __webpack_require__(145);

	module.exports = function filter_viz_using_names(names) {
	  var external_cgm = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


	  // names is an object with row and column names that will be used to filter
	  // the matrix

	  var cgm;
	  if (external_cgm === false) {
	    cgm = this;
	  } else {
	    cgm = external_cgm;
	  }

	  var params = cgm.params;
	  var new_nodes = {};
	  var found_nodes;

	  _.each(['row', 'col'], function (inst_rc) {

	    // I'm requiring view 0
	    // var orig_nodes = params.network_data.views[0].nodes[inst_rc+'_nodes'];
	    var orig_nodes = params.inst_nodes[inst_rc + '_nodes'];

	    if (_.has(names, inst_rc)) {

	      var inst_names = names[inst_rc];
	      found_nodes = $.grep(orig_nodes, function (d) {
	        return $.inArray(d.name, inst_names) > -1;
	      });
	    } else {
	      found_nodes = orig_nodes;
	    }

	    new_nodes[inst_rc + '_nodes'] = found_nodes;
	  });

	  var new_network_data = filter_network_using_new_nodes(cgm.config, new_nodes);

	  // takes entire cgm object
	  // last argument tells it to not preserve categoty colors
	  update_viz_with_network(cgm, new_network_data);
		};

/***/ },
/* 176 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_cat = __webpack_require__(124);
	var calc_viz_params = __webpack_require__(15);
	var resize_viz = __webpack_require__(90);
	var modify_row_node_cats = __webpack_require__(162);

	module.exports = function update_cats(cgm, cat_data) {

	  // do not change column category info
	  var col_cat_colors = cgm.params.viz.cat_colors.col;

	  modify_row_node_cats(cat_data, cgm.params.network_data.row_nodes, true);
	  // modify the current inst copy of nodes
	  modify_row_node_cats(cat_data, cgm.params.inst_nodes.row_nodes, true);

	  // recalculate the visualization parameters using the updated network_data
	  cgm.params = calc_viz_params(cgm.params, false);

	  // // set up zoom
	  // cgm.params.zoom_behavior = d3.behavior.zoom()
	  //   .scaleExtent([1, cgm.params.viz.real_zoom * cgm.params.viz.zoom_switch])
	  //   .on('zoom', function(){
	  //     zoomed(cgm);
	  //   });

	  make_row_cat(cgm, true);
	  resize_viz(cgm);

	  cgm.params.new_cat_data = cat_data;

	  cgm.params.viz.cat_colors.col = col_cat_colors;
		};

/***/ },
/* 177 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_cat = __webpack_require__(124);
	var calc_viz_params = __webpack_require__(15);
	var resize_viz = __webpack_require__(90);
	var modify_row_node_cats = __webpack_require__(162);
	var make_default_cat_data = __webpack_require__(178);

	module.exports = function reset_cats() {
	  var run_resize_viz = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];


	  var tmp_cgm = this;

	  var cat_data = make_default_cat_data(tmp_cgm);

	  // do not change column category info
	  var col_cat_colors = tmp_cgm.params.viz.cat_colors.col;

	  modify_row_node_cats(cat_data, tmp_cgm.params.network_data.row_nodes);
	  // modify the current inst copy of nodes
	  modify_row_node_cats(cat_data, tmp_cgm.params.inst_nodes.row_nodes);

	  tmp_cgm.params.new_cat_data = cat_data;
	  tmp_cgm.params.viz.cat_colors.col = col_cat_colors;

	  if (run_resize_viz) {

	    // resize visualizatino
	    ////////////////////////////
	    // recalculate the visualization parameters using the updated network_data
	    tmp_cgm.params = calc_viz_params(tmp_cgm.params, false);

	    make_row_cat(tmp_cgm, true);
	    resize_viz(tmp_cgm);
	  }
		};

/***/ },
/* 178 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function make_default_cat_data(cgm) {

	  // only row category resetting is supported currently

	  // get row_nodes from config, since this is has the original network
	  var row_nodes = cgm.config.network_data.row_nodes;
	  var title_sep = ': ';

	  // contains all the category information stored as an array of
	  // cat_type
	  var cat_data = [];
	  var cat_type;
	  var cat_info;
	  var found_cat_title;
	  var found_cat_name;
	  var cat_name;

	  _.each(row_nodes, function (inst_node) {

	    var all_props = _.keys(inst_node);

	    _.each(all_props, function (inst_prop) {

	      if (inst_prop.indexOf('cat-') > -1) {

	        cat_name = inst_node[inst_prop];

	        // default title and name
	        var cat_title = inst_prop;
	        cat_name = inst_node[inst_prop];
	        var cat_string = inst_node[inst_prop];
	        var cat_row_name = inst_node.name;

	        if (cat_string.indexOf(title_sep) > -1) {
	          cat_title = cat_string.split(title_sep)[0];
	          cat_name = cat_string.split(title_sep)[1];
	        }

	        // cat_data is empty
	        if (cat_data.length === 0) {

	          add_new_cat_type(cat_title, cat_name, cat_row_name);

	          // cat_data is not empty
	        } else {

	          // look for cat_title in cat_data
	          found_cat_title = false;
	          _.each(cat_data, function (inst_cat_type) {

	            // check each cat_type object for a matching title
	            if (cat_title === inst_cat_type.cat_title) {
	              found_cat_title = true;

	              // check if cat_name is in cats
	              found_cat_name = false;
	              _.each(inst_cat_type.cats, function (inst_cat_obj) {

	                // found category name, add cat_row_name to members
	                if (cat_name === inst_cat_obj.cat_name) {
	                  found_cat_name = true;

	                  // add cat_row_name to members
	                  inst_cat_obj.members.push(cat_row_name);
	                }
	              });

	              // did not find cat name in cat_type - add cat_info for new
	              // category
	              if (found_cat_name === false) {
	                cat_info = {};
	                cat_info.cat_name = cat_name;
	                cat_info.members = [];
	                cat_info.members.push(cat_row_name);
	                inst_cat_type.cats.push(cat_info);
	              }
	            }
	          });

	          // did not find category type, initialize category type object
	          if (found_cat_title === false) {

	            add_new_cat_type(cat_title, cat_name, cat_row_name);
	          }
	        }
	      }
	    });
	  });

	  function add_new_cat_type(cat_title, cat_name, cat_row_name) {

	    // initialize cat_type object to push to cat_data
	    cat_type = {};
	    cat_type.cat_title = cat_title;
	    cat_type.cats = [];

	    // initialize cat_info (e.g. 'true' category has members [...])
	    cat_info = {};
	    cat_info.cat_name = cat_name;
	    cat_info.members = [];
	    cat_info.members.push(cat_row_name);

	    cat_type.cats.push(cat_info);

	    cat_data.push(cat_type);
	  }

	  return cat_data;
	};

/***/ },
/* 179 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var update_viz_with_view = __webpack_require__(143);
	var reset_other_filter_sliders = __webpack_require__(180);

	module.exports = function external_update_view(filter_type, inst_state) {

	  // add something to control slider position
	  /////////////////////////////////////////////

	  var cgm = this;

	  var requested_view = {};
	  requested_view[filter_type] = inst_state;
	  update_viz_with_view(this, requested_view);

	  reset_other_filter_sliders(cgm, filter_type, inst_state);
	};

/***/ },
/* 180 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(181);

	module.exports = function reset_other_filter_sliders(cgm, filter_type, inst_state) {

	  var params = cgm.params;
	  var inst_rc;
	  var reset_rc;

	  d3.select(params.root + ' .slider_' + filter_type).attr('current_state', inst_state);

	  _.each(_.keys(params.viz.possible_filters), function (reset_filter) {

	    if (filter_type.indexOf('row') > -1) {
	      inst_rc = 'row';
	    } else if (filter_type.indexOf('col') > -1) {
	      inst_rc = 'col';
	    } else {
	      inst_rc = 'neither';
	    }

	    if (reset_filter.indexOf('row') > -1) {
	      reset_rc = 'row';
	    } else if (reset_filter.indexOf('col') > -1) {
	      reset_rc = 'col';
	    } else {
	      reset_rc = 'neither';
	    }

	    if (filter_type != reset_filter && inst_rc != 'neither') {

	      if (inst_rc == reset_rc) {

	        var tmp_title = make_filter_title(params, reset_filter);

	        cgm.slider_functions[reset_filter].value(0);

	        d3.select(params.root + ' .title_' + reset_filter).text(tmp_title.text + tmp_title.state);

	        d3.select(params.root + ' .slider_' + reset_filter).attr('current_state', tmp_title.state);
	      }
	    }
	  });

	  var filter_title = make_filter_title(params, filter_type);

	  d3.select(params.root + ' .title_' + filter_type).text(filter_title.text + inst_state + filter_title.suffix);
		};

/***/ },
/* 181 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_filter_default_state = __webpack_require__(5);

	module.exports = function make_filter_title(params, filter_type) {

	  var filter_title = {};
	  var title = {};
	  var type = {};

	  filter_title.state = get_filter_default_state(params.viz.filter_data, filter_type);

	  type.top = filter_type.split('_')[0];
	  type.node = filter_type.split('_')[1];
	  type.measure = filter_type.split('_')[2];

	  if (type.node === 'row') {
	    title.node = 'rows';
	  } else {
	    title.node = 'columns';
	  }

	  if (type.top === 'N') {
	    // filter_title.suffix = ' '+title.node;
	    filter_title.suffix = '';
	  }

	  if (type.top === 'pct') {
	    filter_title.suffix = '%';
	  }

	  if (type.measure == 'sum') {
	    title.measure = 'sum';
	  } else if (type.measure == 'var') {
	    title.measure = 'variance';
	  }

	  if (type.measure === 'sum') {
	    filter_title.text = 'Top ' + title.node + ' ' + title.measure + ': ';
	  }

	  if (type.measure === 'var') {
	    filter_title.text = 'Top ' + title.node + ' ' + title.measure + ': ';
	  }

	  // Enrichr specific rules 
	  if (_.keys(params.viz.possible_filters).indexOf('enr_score_type') > -1) {
	    if (type.node === 'col') {
	      filter_title.text = 'Top Enriched Terms: ';
	      filter_title.suffix = '';
	    }
	  }

	  return filter_title;
	};

/***/ },
/* 182 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var file_saver = __webpack_require__(183);

	module.exports = function export_matrix() {

	  var saveAs = file_saver();

	  var params = this.params;
	  var inst_matrix = params.matrix;

	  // get order indexes
	  var order_indexes = {};
	  var inst_name;
	  _.each(['row', 'col'], function (tmp_rc) {

	    var inst_rc;
	    // row/col names are reversed in saved orders
	    if (tmp_rc === 'row') {
	      inst_rc = 'col';
	    } else {
	      inst_rc = 'row';
	    }

	    // use tmp_rc
	    inst_name = params.inst_order[tmp_rc];

	    // use tmp_rc
	    order_indexes[inst_rc] = inst_matrix.orders[inst_name + '_' + tmp_rc];
	  });

	  var matrix_string = '\t';
	  var row_nodes = params.network_data.row_nodes;
	  var col_nodes = params.network_data.col_nodes;
	  var cat_name;

	  // // original column entry
	  // _.each(order_indexes['col'], function(inst_index){
	  //   var inst_col = col_nodes[inst_index];
	  //   var col_name = make_full_name(inst_col, 'col');
	  //   matrix_string = matrix_string + col_name + '\t';
	  // });

	  // alternate column entry
	  for (var c_i = 0; c_i < order_indexes.col.length; c_i++) {

	    var inst_index = order_indexes.col[c_i];

	    var inst_col = col_nodes[inst_index];
	    var col_name = make_full_name(inst_col, 'col');

	    if (c_i < order_indexes.col.length - 1) {
	      matrix_string = matrix_string + col_name + '\t';
	    } else {
	      matrix_string = matrix_string + col_name;
	    }
	  }

	  var row_data;
	  matrix_string = matrix_string + '\n';

	  _.each(order_indexes.row, function (inst_index) {

	    // row names
	    row_data = inst_matrix.matrix[inst_index].row_data;

	    // var row_name = inst_matrix.matrix[inst_index].name;
	    var inst_row = row_nodes[inst_index];

	    // var row_name = inst_row.name;
	    var row_name = make_full_name(inst_row, 'row');

	    matrix_string = matrix_string + row_name + '\t';

	    // // original data entry
	    // _.each(order_indexes['col'], function(col_index){
	    //   matrix_string = matrix_string + String(row_data[col_index].value) + '\t';
	    // })

	    // alternate data entry
	    for (var r_i = 0; r_i < order_indexes.col.length; r_i++) {

	      // get the order
	      var col_index = order_indexes.col[r_i];

	      if (r_i < order_indexes.col.length - 1) {
	        matrix_string = matrix_string + String(row_data[col_index].value) + '\t';
	      } else {
	        matrix_string = matrix_string + String(row_data[col_index].value);
	      }
	    }

	    matrix_string = matrix_string + '\n';
	  });

	  function make_full_name(inst_node, inst_rc) {

	    var inst_name = inst_node.name;

	    var num_cats = params.viz.all_cats[inst_rc].length;

	    // make tuple if necessary
	    if (num_cats > 0) {

	      inst_name = "('" + inst_name + "'";

	      for (var cat_index = 0; cat_index < num_cats; cat_index++) {
	        cat_name = 'cat-' + String(cat_index);

	        // inst_name =  inst_name + ", " + inst_node[cat_name];
	        inst_name = inst_name + ", '" + inst_node[cat_name] + "'";
	      }
	    }

	    inst_name = inst_name + ')';

	    return inst_name;
	  }

	  var blob = new Blob([matrix_string], { type: 'text/plain;charset=utf-8' });
	  saveAs(blob, 'clustergrammer.txt');
		};

/***/ },
/* 183 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function file_saver() {
	  /* eslint-disable */
	  /* FileSaver.js
	   * A saveAs() FileSaver implementation.
	   * 2013-01-23
	   * 
	   * By Eli Grey, http://eligrey.com
	   * License: X11/MIT
	   *   See LICENSE.md
	   */

	  /*global self */
	  /*jslint bitwise: true, regexp: true, confusion: true, es5: true, vars: true, white: true,
	    plusplus: true */

	  /*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/FileSaver.js */

	  var saveAs = saveAs || navigator.msSaveBlob && navigator.msSaveBlob.bind(navigator) || function (view) {
	    "use strict";

	    var doc = view.document
	    // only get URL when necessary in case BlobBuilder.js hasn't overridden it yet
	    ,
	        get_URL = function get_URL() {
	      return view.URL || view.webkitURL || view;
	    },
	        URL = view.URL || view.webkitURL || view,
	        save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
	        can_use_save_link = "download" in save_link,
	        click = function click(node) {
	      var event = doc.createEvent("MouseEvents");
	      event.initMouseEvent("click", true, false, view, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	      node.dispatchEvent(event);
	    },
	        webkit_req_fs = view.webkitRequestFileSystem,
	        req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem,
	        throw_outside = function throw_outside(ex) {
	      (view.setImmediate || view.setTimeout)(function () {
	        throw ex;
	      }, 0);
	    },
	        force_saveable_type = "application/octet-stream",
	        fs_min_size = 0,
	        deletion_queue = [],
	        process_deletion_queue = function process_deletion_queue() {
	      var i = deletion_queue.length;
	      while (i--) {
	        var file = deletion_queue[i];
	        if (typeof file === "string") {
	          // file is an object URL
	          URL.revokeObjectURL(file);
	        } else {
	          // file is a File
	          file.remove();
	        }
	      }
	      deletion_queue.length = 0; // clear queue
	    },
	        dispatch = function dispatch(filesaver, event_types, event) {
	      event_types = [].concat(event_types);
	      var i = event_types.length;
	      while (i--) {
	        var listener = filesaver["on" + event_types[i]];
	        if (typeof listener === "function") {
	          try {
	            listener.call(filesaver, event || filesaver);
	          } catch (ex) {
	            throw_outside(ex);
	          }
	        }
	      }
	    },
	        FileSaver = function FileSaver(blob, name) {
	      // First try a.download, then web filesystem, then object URLs
	      var filesaver = this,
	          type = blob.type,
	          blob_changed = false,
	          object_url,
	          target_view,
	          get_object_url = function get_object_url() {
	        var object_url = get_URL().createObjectURL(blob);
	        deletion_queue.push(object_url);
	        return object_url;
	      },
	          dispatch_all = function dispatch_all() {
	        dispatch(filesaver, "writestart progress write writeend".split(" "));
	      }
	      // on any filesys errors revert to saving with object URLs
	      ,
	          fs_error = function fs_error() {
	        // don't create more object URLs than needed
	        if (blob_changed || !object_url) {
	          object_url = get_object_url(blob);
	        }
	        if (target_view) {
	          target_view.location.href = object_url;
	        }
	        filesaver.readyState = filesaver.DONE;
	        dispatch_all();
	      },
	          abortable = function abortable(func) {
	        return function () {
	          if (filesaver.readyState !== filesaver.DONE) {
	            return func.apply(this, arguments);
	          }
	        };
	      },
	          create_if_not_found = { create: true, exclusive: false },
	          slice;
	      filesaver.readyState = filesaver.INIT;
	      if (!name) {
	        name = "download";
	      }
	      if (can_use_save_link) {
	        object_url = get_object_url(blob);
	        save_link.href = object_url;
	        save_link.download = name;
	        click(save_link);
	        filesaver.readyState = filesaver.DONE;
	        dispatch_all();
	        return;
	      }
	      // Object and web filesystem URLs have a problem saving in Google Chrome when
	      // viewed in a tab, so I force save with application/octet-stream
	      // http://code.google.com/p/chromium/issues/detail?id=91158
	      if (view.chrome && type && type !== force_saveable_type) {
	        slice = blob.slice || blob.webkitSlice;
	        blob = slice.call(blob, 0, blob.size, force_saveable_type);
	        blob_changed = true;
	      }
	      // Since I can't be sure that the guessed media type will trigger a download
	      // in WebKit, I append .download to the filename.
	      // https://bugs.webkit.org/show_bug.cgi?id=65440
	      if (webkit_req_fs && name !== "download") {
	        name += ".download";
	      }
	      if (type === force_saveable_type || webkit_req_fs) {
	        target_view = view;
	      } else {
	        target_view = view.open();
	      }
	      if (!req_fs) {
	        fs_error();
	        return;
	      }
	      fs_min_size += blob.size;
	      req_fs(view.TEMPORARY, fs_min_size, abortable(function (fs) {
	        fs.root.getDirectory("saved", create_if_not_found, abortable(function (dir) {
	          var save = function save() {
	            dir.getFile(name, create_if_not_found, abortable(function (file) {
	              file.createWriter(abortable(function (writer) {
	                writer.onwriteend = function (event) {
	                  target_view.location.href = file.toURL();
	                  deletion_queue.push(file);
	                  filesaver.readyState = filesaver.DONE;
	                  dispatch(filesaver, "writeend", event);
	                };
	                writer.onerror = function () {
	                  var error = writer.error;
	                  if (error.code !== error.ABORT_ERR) {
	                    fs_error();
	                  }
	                };
	                "writestart progress write abort".split(" ").forEach(function (event) {
	                  writer["on" + event] = filesaver["on" + event];
	                });
	                writer.write(blob);
	                filesaver.abort = function () {
	                  writer.abort();
	                  filesaver.readyState = filesaver.DONE;
	                };
	                filesaver.readyState = filesaver.WRITING;
	              }), fs_error);
	            }), fs_error);
	          };
	          dir.getFile(name, { create: false }, abortable(function (file) {
	            // delete file if it already exists
	            file.remove();
	            save();
	          }), abortable(function (ex) {
	            if (ex.code === ex.NOT_FOUND_ERR) {
	              save();
	            } else {
	              fs_error();
	            }
	          }));
	        }), fs_error);
	      }), fs_error);
	    },
	        FS_proto = FileSaver.prototype,
	        saveAs = function saveAs(blob, name) {
	      return new FileSaver(blob, name);
	    };
	    FS_proto.abort = function () {
	      var filesaver = this;
	      filesaver.readyState = filesaver.DONE;
	      dispatch(filesaver, "abort");
	    };
	    FS_proto.readyState = FS_proto.INIT = 0;
	    FS_proto.WRITING = 1;
	    FS_proto.DONE = 2;

	    FS_proto.error = FS_proto.onwritestart = FS_proto.onprogress = FS_proto.onwrite = FS_proto.onabort = FS_proto.onerror = FS_proto.onwriteend = null;

	    view.addEventListener("unload", process_deletion_queue, false);
	    return saveAs;
	  }(self);

	  return saveAs;
		};

/***/ },
/* 184 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var deactivate_cropping = __webpack_require__(185);

	module.exports = function brush_crop_matrix() {

	  // get rows/cols from brush-extent
	  // works for differnt brushing directions (e.g. start end sites)

	  var cgm = this;
	  var params = cgm.params;

	  var clust_width = params.viz.clust.dim.width;
	  var clust_height = params.viz.clust.dim.height;

	  var x = d3.scale.linear().domain([0, clust_width]).range([0, clust_width]);
	  var y = d3.scale.linear().domain([0, clust_height]).range([0, clust_height]);

	  // make brush group
	  d3.select(params.root + ' .clust_container').append('g').classed('brush_group', true);

	  cgm.params.is_cropping = true;

	  var brush = d3.svg.brush().x(x).y(y).on("brushend", brushend);

	  d3.select(params.root + ' .brush_group').call(brush);

	  function brushend() {

	    // do not display dendro crop buttons when cropping with brushing
	    d3.select(cgm.params.root + ' .col_dendro_icons_container').style('display', 'none');
	    d3.select(cgm.params.root + ' .row_dendro_icons_container').style('display', 'none');

	    var brushing_extent = brush.extent();
	    var brush_start = brushing_extent[0];
	    var brush_end = brushing_extent[1];

	    var x_start = brush_start[0];
	    var x_end = brush_end[0];

	    var y_start = brush_start[1];
	    var y_end = brush_end[1];

	    if (x_start != x_end && y_start != y_end) {

	      setTimeout(deactivate_cropping, 500, cgm);

	      // find cropped nodes
	      var found_nodes = find_cropped_nodes(x_start, x_end, y_start, y_end, brush_start, brush_end);

	      cgm.filter_viz_using_names(found_nodes);

	      d3.select(params.root + ' .crop_button').style('color', '#337ab7').classed('fa-crop', false).classed('fa-undo', true);
	    }
	  }

	  function find_cropped_nodes(x_start, x_end, y_start, y_end, brush_start, brush_end) {

	    // reverse if necessary (depending on how brushing was done)
	    if (x_start > x_end) {
	      x_start = brush_end[0];
	      x_end = brush_start[0];
	    }

	    if (y_start > y_end) {
	      y_start = brush_end[1];
	      y_end = brush_start[1];
	    }

	    // add room to brushing
	    y_start = y_start - params.viz.rect_height;
	    x_start = x_start - params.viz.rect_width;

	    var found_nodes = {};
	    found_nodes.row = [];
	    found_nodes.col = [];

	    // d3.selectAll(params.root+' .row_label_group')
	    //   .each(function(inst_row){

	    //     // there is already bound data on the rows
	    //     var inst_trans = d3.select(this)
	    //       .attr('transform');

	    //     var y_trans = Number(inst_trans.split(',')[1].split(')')[0]);

	    //     if (y_trans > y_start && y_trans < y_end){

	    //       found_nodes.row.push(inst_row.name);

	    //     }

	    //   });

	    _.each(params.matrix.matrix, function (row_data) {
	      var y_trans = params.viz.y_scale(row_data.row_index);

	      if (y_trans > y_start && y_trans < y_end) {
	        found_nodes.row.push(row_data.name);
	      }
	    });

	    d3.selectAll(params.root + ' .col_label_text').each(function (inst_col) {

	      // there is already bound data on the cols
	      var inst_trans = d3.select(this).attr('transform');

	      var x_trans = Number(inst_trans.split(',')[0].split('(')[1]);

	      if (x_trans > x_start && x_trans < x_end) {

	        found_nodes.col.push(inst_col.name);
	      }
	    });

	    return found_nodes;
	  }

	  d3.selectAll(params.root + ' .extent').style('opacity', 0.2).style('fill', 'black');
		};

/***/ },
/* 185 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function deactivate_cropping(cgm) {

	  d3.select(cgm.params.root + ' .brush_group').transition().style('opacity', 0).remove();

	  cgm.params.is_cropping = false;
		};

/***/ },
/* 186 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/*
	    D3.js Slider
	    Inspired by jQuery UI Slider
	    Copyright (c) 2013, Bjorn Sandvik - http://blog.thematicmapping.org
	    BSD license: http://opensource.org/licenses/BSD-3-Clause
	*/
	(function (root, factory) {
	  if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(187)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {
	    if (process.browser) {
	      // Browserify. Import css too using cssify.
	      require('./d3.slider.css');
	    }
	    // Node. Does not work with strict CommonJS, but
	    // only CommonJS-like environments that support module.exports,
	    // like Node.
	    module.exports = factory(require('d3'));
	  } else {
	    // Browser globals (root is window)
	    root.d3.slider = factory(root.d3);
	  }
	})(undefined, function (d3) {
	  return function module() {
	    "use strict";

	    // Public variables width default settings

	    var min = 0,
	        max = 100,
	        step = 0.01,
	        animate = false,
	        orientation = "horizontal",
	        axis = false,
	        margin = 50,
	        value,
	        active = 1,
	        snap = false,
	        scale;

	    // Private variables
	    var axisScale,
	        dispatch = d3.dispatch("slide", "slideend"),
	        formatPercent = d3.format(".2%"),
	        tickFormat = d3.format(".0"),
	        handle1,
	        handle2 = null,
	        divRange,
	        sliderLength;

	    function slider(selection) {
	      selection.each(function () {

	        // Create scale if not defined by user
	        if (!scale) {
	          scale = d3.scale.linear().domain([min, max]);
	        }

	        // Start value
	        value = value || scale.domain()[0];

	        // DIV container
	        var div = d3.select(this).classed("d3-slider d3-slider-" + orientation, true);

	        var drag = d3.behavior.drag();
	        drag.on('dragend', function () {
	          dispatch.slideend(d3.event, value);
	        });

	        // Slider handle
	        //if range slider, create two
	        // var divRange;

	        if (toType(value) == "array" && value.length == 2) {
	          handle1 = div.append("a").classed("d3-slider-handle", true).attr("xlink:href", "#").attr('id', "handle-one").on("click", stopPropagation).call(drag);
	          handle2 = div.append("a").classed("d3-slider-handle", true).attr('id', "handle-two").attr("xlink:href", "#").on("click", stopPropagation).call(drag);
	        } else {
	          handle1 = div.append("a").classed("d3-slider-handle", true).attr("xlink:href", "#").attr('id', "handle-one").on("click", stopPropagation).call(drag);
	        }

	        // Horizontal slider
	        if (orientation === "horizontal") {

	          div.on("click", onClickHorizontal);

	          if (toType(value) == "array" && value.length == 2) {
	            divRange = d3.select(this).append('div').classed("d3-slider-range", true);

	            handle1.style("left", formatPercent(scale(value[0])));
	            divRange.style("left", formatPercent(scale(value[0])));
	            drag.on("drag", onDragHorizontal);

	            var width = 100 - parseFloat(formatPercent(scale(value[1])));
	            handle2.style("left", formatPercent(scale(value[1])));
	            divRange.style("right", width + "%");
	            drag.on("drag", onDragHorizontal);
	          } else {
	            handle1.style("left", formatPercent(scale(value)));
	            drag.on("drag", onDragHorizontal);
	          }

	          sliderLength = parseInt(div.style("width"), 10);
	        } else {
	          // Vertical

	          div.on("click", onClickVertical);
	          drag.on("drag", onDragVertical);
	          if (toType(value) == "array" && value.length == 2) {
	            divRange = d3.select(this).append('div').classed("d3-slider-range-vertical", true);

	            handle1.style("bottom", formatPercent(scale(value[0])));
	            divRange.style("bottom", formatPercent(scale(value[0])));
	            drag.on("drag", onDragVertical);

	            var top = 100 - parseFloat(formatPercent(scale(value[1])));
	            handle2.style("bottom", formatPercent(scale(value[1])));
	            divRange.style("top", top + "%");
	            drag.on("drag", onDragVertical);
	          } else {
	            handle1.style("bottom", formatPercent(scale(value)));
	            drag.on("drag", onDragVertical);
	          }

	          sliderLength = parseInt(div.style("height"), 10);
	        }

	        if (axis) {
	          createAxis(div);
	        }

	        function createAxis(dom) {

	          // Create axis if not defined by user
	          if (typeof axis === "boolean") {

	            axis = d3.svg.axis().ticks(Math.round(sliderLength / 100)).tickFormat(tickFormat).orient(orientation === "horizontal" ? "bottom" : "right");
	          }

	          // Copy slider scale to move from percentages to pixels
	          axisScale = scale.ticks ? scale.copy().range([0, sliderLength]) : scale.copy().rangePoints([0, sliderLength], 0.5);
	          axis.scale(axisScale);

	          // Create SVG axis container
	          var svg = dom.append("svg").classed("d3-slider-axis d3-slider-axis-" + axis.orient(), true).on("click", stopPropagation);

	          var g = svg.append("g");

	          // Horizontal axis
	          if (orientation === "horizontal") {

	            svg.style("margin-left", -margin + "px");

	            svg.attr({
	              width: sliderLength + margin * 2,
	              height: margin
	            });

	            if (axis.orient() === "top") {
	              svg.style("top", -margin + "px");
	              g.attr("transform", "translate(" + margin + "," + margin + ")");
	            } else {
	              // bottom
	              g.attr("transform", "translate(" + margin + ",0)");
	            }
	          } else {
	            // Vertical

	            svg.style("top", -margin + "px");

	            svg.attr({
	              width: margin,
	              height: sliderLength + margin * 2
	            });

	            if (axis.orient() === "left") {
	              svg.style("left", -margin + "px");
	              g.attr("transform", "translate(" + margin + "," + margin + ")");
	            } else {
	              // right
	              g.attr("transform", "translate(" + 0 + "," + margin + ")");
	            }
	          }

	          g.call(axis);
	        }

	        function onClickHorizontal() {
	          if (toType(value) != "array") {
	            var pos = Math.max(0, Math.min(sliderLength, d3.event.offsetX || d3.event.layerX));
	            moveHandle(scale.invert ? stepValue(scale.invert(pos / sliderLength)) : nearestTick(pos / sliderLength));
	          }
	        }

	        function onClickVertical() {
	          if (toType(value) != "array") {
	            var pos = sliderLength - Math.max(0, Math.min(sliderLength, d3.event.offsetY || d3.event.layerY));
	            moveHandle(scale.invert ? stepValue(scale.invert(pos / sliderLength)) : nearestTick(pos / sliderLength));
	          }
	        }

	        function onDragHorizontal() {
	          if (d3.event.sourceEvent.target.id === "handle-one") {
	            active = 1;
	          } else if (d3.event.sourceEvent.target.id == "handle-two") {
	            active = 2;
	          }
	          var pos = Math.max(0, Math.min(sliderLength, d3.event.x));
	          moveHandle(scale.invert ? stepValue(scale.invert(pos / sliderLength)) : nearestTick(pos / sliderLength));
	        }

	        function onDragVertical() {
	          if (d3.event.sourceEvent.target.id === "handle-one") {
	            active = 1;
	          } else if (d3.event.sourceEvent.target.id == "handle-two") {
	            active = 2;
	          }
	          var pos = sliderLength - Math.max(0, Math.min(sliderLength, d3.event.y));
	          moveHandle(scale.invert ? stepValue(scale.invert(pos / sliderLength)) : nearestTick(pos / sliderLength));
	        }

	        function stopPropagation() {
	          d3.event.stopPropagation();
	        }
	      });
	    }

	    // Move slider handle on click/drag
	    function moveHandle(newValue) {
	      var currentValue = toType(value) == "array" && value.length == 2 ? value[active - 1] : value,
	          oldPos = formatPercent(scale(stepValue(currentValue))),
	          newPos = formatPercent(scale(stepValue(newValue))),
	          position = orientation === "horizontal" ? "left" : "bottom";
	      if (oldPos !== newPos) {

	        if (toType(value) == "array" && value.length == 2) {
	          value[active - 1] = newValue;
	          if (d3.event) {
	            dispatch.slide(d3.event, value);
	          };
	        } else {
	          if (d3.event) {
	            dispatch.slide(d3.event.sourceEvent || d3.event, value = newValue);
	          };
	        }

	        if (value[0] >= value[1]) return;
	        if (active === 1) {
	          if (toType(value) == "array" && value.length == 2) {
	            position === "left" ? divRange.style("left", newPos) : divRange.style("bottom", newPos);
	          }

	          if (animate) {
	            handle1.transition().styleTween(position, function () {
	              return d3.interpolate(oldPos, newPos);
	            }).duration(typeof animate === "number" ? animate : 250);
	          } else {
	            handle1.style(position, newPos);
	          }
	        } else {

	          var width = 100 - parseFloat(newPos);
	          var top = 100 - parseFloat(newPos);

	          position === "left" ? divRange.style("right", width + "%") : divRange.style("top", top + "%");

	          if (animate) {
	            handle2.transition().styleTween(position, function () {
	              return d3.interpolate(oldPos, newPos);
	            }).duration(typeof animate === "number" ? animate : 250);
	          } else {
	            handle2.style(position, newPos);
	          }
	        }
	      }
	    }

	    // Calculate nearest step value
	    function stepValue(val) {

	      if (val === scale.domain()[0] || val === scale.domain()[1]) {
	        return val;
	      }

	      var alignValue = val;
	      if (snap) {
	        alignValue = nearestTick(scale(val));
	      } else {
	        var valModStep = (val - scale.domain()[0]) % step;
	        alignValue = val - valModStep;

	        if (Math.abs(valModStep) * 2 >= step) {
	          alignValue += valModStep > 0 ? step : -step;
	        }
	      };

	      return alignValue;
	    }

	    // Find the nearest tick
	    function nearestTick(pos) {
	      var ticks = scale.ticks ? scale.ticks() : scale.domain();
	      var dist = ticks.map(function (d) {
	        return pos - scale(d);
	      });
	      var i = -1,
	          index = 0,
	          r = scale.ticks ? scale.range()[1] : scale.rangeExtent()[1];
	      do {
	        i++;
	        if (Math.abs(dist[i]) < r) {
	          r = Math.abs(dist[i]);
	          index = i;
	        };
	      } while (dist[i] > 0 && i < dist.length - 1);

	      return ticks[index];
	    };

	    // Return the type of an object
	    function toType(v) {
	      return {}.toString.call(v).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
	    };

	    // Getter/setter functions
	    slider.min = function (_) {
	      if (!arguments.length) return min;
	      min = _;
	      return slider;
	    };

	    slider.max = function (_) {
	      if (!arguments.length) return max;
	      max = _;
	      return slider;
	    };

	    slider.step = function (_) {
	      if (!arguments.length) return step;
	      step = _;
	      return slider;
	    };

	    slider.animate = function (_) {
	      if (!arguments.length) return animate;
	      animate = _;
	      return slider;
	    };

	    slider.orientation = function (_) {
	      if (!arguments.length) return orientation;
	      orientation = _;
	      return slider;
	    };

	    slider.axis = function (_) {
	      if (!arguments.length) return axis;
	      axis = _;
	      return slider;
	    };

	    slider.margin = function (_) {
	      if (!arguments.length) return margin;
	      margin = _;
	      return slider;
	    };

	    slider.value = function (_) {
	      if (!arguments.length) return value;
	      if (value) {
	        moveHandle(stepValue(_));
	      };
	      value = _;
	      return slider;
	    };

	    slider.snap = function (_) {
	      if (!arguments.length) return snap;
	      snap = _;
	      return slider;
	    };

	    slider.scale = function (_) {
	      if (!arguments.length) return scale;
	      scale = _;
	      return slider;
	    };

	    d3.rebind(slider, dispatch, "on");

	    return slider;
	  };
	});

/***/ },
/* 187 */
/***/ function(module, exports) {

	module.exports = d3;

/***/ },
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module) {"use strict";

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/**
	 * Simple, lightweight, usable local autocomplete library for modern browsers
	 * Because there weren’t enough autocomplete scripts in the world? Because I’m completely insane and have NIH syndrome? Probably both. :P
	 * @author Lea Verou http://leaverou.github.io/awesomplete
	 * MIT license
	 */

	(function () {

		var _ = function _(input, o) {
			var me = this;

			// Setup

			this.input = $(input);
			this.input.setAttribute("autocomplete", "off");
			this.input.setAttribute("aria-autocomplete", "list");

			o = o || {};

			configure(this, {
				minChars: 2,
				maxItems: 10,
				autoFirst: false,
				data: _.DATA,
				filter: _.FILTER_CONTAINS,
				sort: _.SORT_BYLENGTH,
				item: _.ITEM,
				replace: _.REPLACE
			}, o);

			this.index = -1;

			// Create necessary elements

			this.container = $.create("div", {
				className: "awesomplete",
				around: input
			});

			this.ul = $.create("ul", {
				hidden: "hidden",
				inside: this.container
			});

			this.status = $.create("span", {
				className: "visually-hidden",
				role: "status",
				"aria-live": "assertive",
				"aria-relevant": "additions",
				inside: this.container
			});

			// Bind events

			$.bind(this.input, {
				"input": this.evaluate.bind(this),
				"blur": this.close.bind(this, { reason: "blur" }),
				"keydown": function keydown(evt) {
					var c = evt.keyCode;

					// If the dropdown `ul` is in view, then act on keydown for the following keys:
					// Enter / Esc / Up / Down
					if (me.opened) {
						if (c === 13 && me.selected) {
							// Enter
							evt.preventDefault();
							me.select();
						} else if (c === 27) {
							// Esc
							me.close({ reason: "esc" });
						} else if (c === 38 || c === 40) {
							// Down/Up arrow
							evt.preventDefault();
							me[c === 38 ? "previous" : "next"]();
						}
					}
				}
			});

			$.bind(this.input.form, { "submit": this.close.bind(this, { reason: "submit" }) });

			$.bind(this.ul, { "mousedown": function mousedown(evt) {
					var li = evt.target;

					if (li !== this) {

						while (li && !/li/i.test(li.nodeName)) {
							li = li.parentNode;
						}

						if (li && evt.button === 0) {
							// Only select on left click
							evt.preventDefault();
							me.select(li, evt.target);
						}
					}
				} });

			if (this.input.hasAttribute("list")) {
				this.list = "#" + this.input.getAttribute("list");
				this.input.removeAttribute("list");
			} else {
				this.list = this.input.getAttribute("data-list") || o.list || [];
			}

			_.all.push(this);
		};

		_.prototype = {
			set list(list) {
				if (Array.isArray(list)) {
					this._list = list;
				} else if (typeof list === "string" && list.indexOf(",") > -1) {
					this._list = list.split(/\s*,\s*/);
				} else {
					// Element or CSS selector
					list = $(list);

					if (list && list.children) {
						var items = [];
						slice.apply(list.children).forEach(function (el) {
							if (!el.disabled) {
								var text = el.textContent.trim();
								var value = el.value || text;
								var label = el.label || text;
								if (value !== "") {
									items.push({ label: label, value: value });
								}
							}
						});
						this._list = items;
					}
				}

				if (document.activeElement === this.input) {
					this.evaluate();
				}
			},

			get selected() {
				return this.index > -1;
			},

			get opened() {
				return !this.ul.hasAttribute("hidden");
			},

			close: function close(o) {
				if (!this.opened) {
					return;
				}

				this.ul.setAttribute("hidden", "");
				this.index = -1;

				$.fire(this.input, "awesomplete-close", o || {});
			},

			open: function open() {
				this.ul.removeAttribute("hidden");

				if (this.autoFirst && this.index === -1) {
					this.goto(0);
				}

				$.fire(this.input, "awesomplete-open");
			},

			next: function next() {
				var count = this.ul.children.length;

				this.goto(this.index < count - 1 ? this.index + 1 : -1);
			},

			previous: function previous() {
				var count = this.ul.children.length;

				this.goto(this.selected ? this.index - 1 : count - 1);
			},

			// Should not be used, highlights specific item without any checks!
			goto: function goto(i) {
				var lis = this.ul.children;

				if (this.selected) {
					lis[this.index].setAttribute("aria-selected", "false");
				}

				this.index = i;

				if (i > -1 && lis.length > 0) {
					lis[i].setAttribute("aria-selected", "true");
					this.status.textContent = lis[i].textContent;

					$.fire(this.input, "awesomplete-highlight", {
						text: this.suggestions[this.index]
					});
				}
			},

			select: function select(selected, origin) {
				if (selected) {
					this.index = $.siblingIndex(selected);
				} else {
					selected = this.ul.children[this.index];
				}

				if (selected) {
					var suggestion = this.suggestions[this.index];

					var allowed = $.fire(this.input, "awesomplete-select", {
						text: suggestion,
						origin: origin || selected
					});

					if (allowed) {
						this.replace(suggestion);
						this.close({ reason: "select" });
						$.fire(this.input, "awesomplete-selectcomplete", {
							text: suggestion
						});
					}
				}
			},

			evaluate: function evaluate() {
				var me = this;
				var value = this.input.value;

				if (value.length >= this.minChars && this._list.length > 0) {
					this.index = -1;
					// Populate list with options that match
					this.ul.innerHTML = "";

					this.suggestions = this._list.map(function (item) {
						return new Suggestion(me.data(item, value));
					}).filter(function (item) {
						return me.filter(item, value);
					}).sort(this.sort).slice(0, this.maxItems);

					this.suggestions.forEach(function (text) {
						me.ul.appendChild(me.item(text, value));
					});

					if (this.ul.children.length === 0) {
						this.close({ reason: "nomatches" });
					} else {
						this.open();
					}
				} else {
					this.close({ reason: "nomatches" });
				}
			}
		};

		// Static methods/properties

		_.all = [];

		_.FILTER_CONTAINS = function (text, input) {
			return RegExp($.regExpEscape(input.trim()), "i").test(text);
		};

		_.FILTER_STARTSWITH = function (text, input) {
			return RegExp("^" + $.regExpEscape(input.trim()), "i").test(text);
		};

		_.SORT_BYLENGTH = function (a, b) {
			if (a.length !== b.length) {
				return a.length - b.length;
			}

			return a < b ? -1 : 1;
		};

		_.ITEM = function (text, input) {
			var html = input === '' ? text : text.replace(RegExp($.regExpEscape(input.trim()), "gi"), "<mark>$&</mark>");
			return $.create("li", {
				innerHTML: html,
				"aria-selected": "false"
			});
		};

		_.REPLACE = function (text) {
			this.input.value = text.value;
		};

		_.DATA = function (item /*, input*/) {
			return item;
		};

		// Private functions

		function Suggestion(data) {
			var o = Array.isArray(data) ? { label: data[0], value: data[1] } : (typeof data === "undefined" ? "undefined" : _typeof(data)) === "object" && "label" in data && "value" in data ? data : { label: data, value: data };

			this.label = o.label || o.value;
			this.value = o.value;
		}
		Object.defineProperty(Suggestion.prototype = Object.create(String.prototype), "length", {
			get: function get() {
				return this.label.length;
			}
		});
		Suggestion.prototype.toString = Suggestion.prototype.valueOf = function () {
			return "" + this.label;
		};

		function configure(instance, properties, o) {
			for (var i in properties) {
				var initial = properties[i],
				    attrValue = instance.input.getAttribute("data-" + i.toLowerCase());

				if (typeof initial === "number") {
					instance[i] = parseInt(attrValue);
				} else if (initial === false) {
					// Boolean options must be false by default anyway
					instance[i] = attrValue !== null;
				} else if (initial instanceof Function) {
					instance[i] = null;
				} else {
					instance[i] = attrValue;
				}

				if (!instance[i] && instance[i] !== 0) {
					instance[i] = i in o ? o[i] : initial;
				}
			}
		}

		// Helpers

		var slice = Array.prototype.slice;

		function $(expr, con) {
			return typeof expr === "string" ? (con || document).querySelector(expr) : expr || null;
		}

		function $$(expr, con) {
			return slice.call((con || document).querySelectorAll(expr));
		}

		$.create = function (tag, o) {
			var element = document.createElement(tag);

			for (var i in o) {
				var val = o[i];

				if (i === "inside") {
					$(val).appendChild(element);
				} else if (i === "around") {
					var ref = $(val);
					ref.parentNode.insertBefore(element, ref);
					element.appendChild(ref);
				} else if (i in element) {
					element[i] = val;
				} else {
					element.setAttribute(i, val);
				}
			}

			return element;
		};

		$.bind = function (element, o) {
			if (element) {
				for (var event in o) {
					var callback = o[event];

					event.split(/\s+/).forEach(function (event) {
						element.addEventListener(event, callback);
					});
				}
			}
		};

		$.fire = function (target, type, properties) {
			var evt = document.createEvent("HTMLEvents");

			evt.initEvent(type, true, true);

			for (var j in properties) {
				evt[j] = properties[j];
			}

			return target.dispatchEvent(evt);
		};

		$.regExpEscape = function (s) {
			return s.replace(/[-\\^$*+?.()|[\]{}]/g, "\\$&");
		};

		$.siblingIndex = function (el) {
			/* eslint-disable no-cond-assign */
			for (var i = 0; el = el.previousElementSibling; i++) {}
			return i;
		};

		// Initialization

		function init() {
			$$("input.awesomplete").forEach(function (input) {
				new _(input);
			});
		}

		// Are we in a browser? Check for Document constructor
		if (typeof Document !== "undefined") {
			// DOM already loaded?
			if (document.readyState !== "loading") {
				init();
			} else {
				// Wait for it
				document.addEventListener("DOMContentLoaded", init);
			}
		}

		_.$ = $;
		_.$$ = $$;

		// Make sure to export Awesomplete on self when in a browser
		if (typeof self !== "undefined") {
			self.Awesomplete = _;
		}

		// Expose Awesomplete as a CJS module
		if (( false ? "undefined" : _typeof(module)) === "object" && module.exports) {
			module.exports = _;
		}

		return _;
		})();
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(189)(module)))

/***/ },
/* 189 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
		};

/***/ },
/* 190 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(191);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(193)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./d3.slider.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./d3.slider.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 191 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(192)();
	// imports


	// module
	exports.push([module.id, ".d3-slider {\n    position: relative;\n    font-family: Verdana,Arial,sans-serif;\n    font-size: 1.1em;\n    border: 1px solid #aaaaaa;\n    z-index: 2;\n}\n\n.d3-slider-horizontal {\n    height: .8em;\n}  \n\n.d3-slider-range {\n  background:#2980b9;\n  left:0px;\n  right:0px;\n  height: 0.8em;\n  position: absolute;\n}\n\n.d3-slider-range-vertical {\n  background:#2980b9;\n  left:0px;\n  right:0px;\n  position: absolute;\n  top:0;\n}\n\n.d3-slider-vertical {\n    width: .8em;\n    height: 100px;\n}      \n\n.d3-slider-handle {\n    position: absolute;\n    width: 1.2em;\n    height: 1.2em;\n    border: 1px solid #d3d3d3;\n    border-radius: 4px;\n    background: #eee;\n    background: linear-gradient(to bottom, #eee 0%, #ddd 100%);\n    z-index: 3;\n}\n\n.d3-slider-handle:hover {\n    border: 1px solid #999999;\n}\n\n.d3-slider-horizontal .d3-slider-handle {\n    top: -.3em;\n    margin-left: -.6em;\n}\n\n.d3-slider-axis {\n    position: relative;\n    z-index: 1;    \n}\n\n.d3-slider-axis-bottom {\n    top: .8em;\n}\n\n.d3-slider-axis-right {\n    left: .8em;\n}\n\n.d3-slider-axis path {\n    stroke-width: 0;\n    fill: none;\n}\n\n.d3-slider-axis line {\n    fill: none;\n    stroke: #aaa;\n    shape-rendering: crispEdges;\n}\n\n.d3-slider-axis text {\n    font-size: 11px;\n}\n\n.d3-slider-vertical .d3-slider-handle {\n    left: -.25em;\n    margin-left: 0;\n    margin-bottom: -.6em;      \n}", ""]);

	// exports


/***/ },
/* 192 */
/***/ function(module, exports) {

	"use strict";

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function () {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
				if (item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function (modules, mediaQuery) {
			if (typeof modules === "string") modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for (var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if (typeof id === "number") alreadyImportedModules[id] = true;
			}
			for (i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if (mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if (mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};

/***/ },
/* 193 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 194 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(195);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(193)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../css-loader/index.js!./awesomplete.css", function() {
				var newContent = require("!!./../css-loader/index.js!./awesomplete.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 195 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(192)();
	// imports


	// module
	exports.push([module.id, "[hidden] { display: none; }\n\n.visually-hidden {\n\tposition: absolute;\n\tclip: rect(0, 0, 0, 0);\n}\n\ndiv.awesomplete {\n\tdisplay: inline-block;\n\tposition: relative;\n}\n\ndiv.awesomplete > input {\n\tdisplay: block;\n}\n\ndiv.awesomplete > ul {\n\tposition: absolute;\n\tleft: 0;\n\tz-index: 1;\n\tmin-width: 100%;\n\tbox-sizing: border-box;\n\tlist-style: none;\n\tpadding: 0;\n\tborder-radius: .3em;\n\tmargin: .2em 0 0;\n\tbackground: hsla(0,0%,100%,.9);\n\tbackground: linear-gradient(to bottom right, white, hsla(0,0%,100%,.8));\n\tborder: 1px solid rgba(0,0,0,.3);\n\tbox-shadow: .05em .2em .6em rgba(0,0,0,.2);\n\ttext-shadow: none;\n}\n\ndiv.awesomplete > ul[hidden],\ndiv.awesomplete > ul:empty {\n\tdisplay: none;\n}\n\n@supports (transform: scale(0)) {\n\tdiv.awesomplete > ul {\n\t\ttransition: .3s cubic-bezier(.4,.2,.5,1.4);\n\t\ttransform-origin: 1.43em -.43em;\n\t}\n\t\n\tdiv.awesomplete > ul[hidden],\n\tdiv.awesomplete > ul:empty {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t\tdisplay: block;\n\t\ttransition-timing-function: ease;\n\t}\n}\n\n\t/* Pointer */\n\tdiv.awesomplete > ul:before {\n\t\tcontent: \"\";\n\t\tposition: absolute;\n\t\ttop: -.43em;\n\t\tleft: 1em;\n\t\twidth: 0; height: 0;\n\t\tpadding: .4em;\n\t\tbackground: white;\n\t\tborder: inherit;\n\t\tborder-right: 0;\n\t\tborder-bottom: 0;\n\t\t-webkit-transform: rotate(45deg);\n\t\ttransform: rotate(45deg);\n\t}\n\n\tdiv.awesomplete > ul > li {\n\t\tposition: relative;\n\t\tpadding: .2em .5em;\n\t\tcursor: pointer;\n\t}\n\t\n\tdiv.awesomplete > ul > li:hover {\n\t\tbackground: hsl(200, 40%, 80%);\n\t\tcolor: black;\n\t}\n\t\n\tdiv.awesomplete > ul > li[aria-selected=\"true\"] {\n\t\tbackground: hsl(205, 40%, 40%);\n\t\tcolor: white;\n\t}\n\t\n\t\tdiv.awesomplete mark {\n\t\t\tbackground: hsl(65, 100%, 50%);\n\t\t}\n\t\t\n\t\tdiv.awesomplete li:hover mark {\n\t\t\tbackground: hsl(68, 100%, 41%);\n\t\t}\n\t\t\n\t\tdiv.awesomplete li[aria-selected=\"true\"] mark {\n\t\t\tbackground: hsl(86, 100%, 21%);\n\t\t\tcolor: inherit;\n\t\t}", ""]);

	// exports


/***/ },
/* 196 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ini_sidebar = __webpack_require__(158);
	var set_up_filters = __webpack_require__(197);
	var set_up_search = __webpack_require__(202);
	var set_up_reorder = __webpack_require__(203);
	var set_sidebar_ini_view = __webpack_require__(204);
	var make_icons = __webpack_require__(205);
	var make_modals = __webpack_require__(207);
	var set_up_opacity_slider = __webpack_require__(209);

	/* Represents sidebar with controls.
	 */
	module.exports = function sidebar(cgm) {

	  var params = cgm.params;

	  var sidebar = d3.select(params.root + ' .sidebar_wrapper');

	  // console.log('is_expand ',params.viz.is_expand)

	  if (params.viz.is_expand) {
	    sidebar.style('display', 'none');
	  }

	  sidebar.append('div').classed('title_section', true);

	  if (params.sidebar.title != null) {
	    sidebar.select('.title_section').append('h4')
	    // .style('margin-left', params.sidebar.title_margin_left+'px')
	    .style('margin-left', '20px').style('margin-top', '5px').style('margin-bottom', '0px').text(params.sidebar.title);
	  }

	  sidebar.append('div').style('padding-right', '2px').classed('about_section', true);

	  if (params.sidebar.about != null) {

	    sidebar.select('.about_section').append('h5').classed('sidebar_text', true).style('margin-left', '7px').style('margin-top', '5px').style('margin-bottom', '2px').style('text-align', 'justify').html(params.sidebar.about);
	  }

	  sidebar.append('div').classed('icons_section', true).style('text-align', 'center');

	  make_modals(params);
	  if (params.sidebar.icons) {
	    make_icons(cgm, sidebar);
	  }

	  set_up_reorder(params, sidebar);

	  set_up_search(sidebar, params);

	  set_up_opacity_slider(sidebar);

	  var possible_filter_names = _.keys(params.viz.possible_filters);

	  if (possible_filter_names.indexOf('enr_score_type') > -1) {
	    possible_filter_names.sort(function (a, b) {
	      return a.toLowerCase().localeCompare(b.toLowerCase());
	    });
	  }

	  cgm.slider_functions = {};

	  _.each(possible_filter_names, function (inst_filter) {
	    set_up_filters(cgm, inst_filter);
	  });

	  ini_sidebar(cgm);

	  // when initializing the visualization using a view
	  if (params.ini_view !== null) {

	    set_sidebar_ini_view(params);

	    params.ini_view = null;
	  }
		};

/***/ },
/* 197 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_slider_filter = __webpack_require__(198);
	var make_button_filter = __webpack_require__(201);

	module.exports = function set_up_filters(cgm, filter_type) {

	  var params = cgm.params;

	  var div_filters = d3.select(params.root + ' .sidebar_wrapper').append('div').classed('div_filters', true).style('padding-left', '10px').style('padding-right', '10px');

	  if (params.viz.possible_filters[filter_type] == 'numerical') {
	    make_slider_filter(cgm, filter_type, div_filters);
	  } else if (params.viz.possible_filters[filter_type] == 'categorical') {
	    make_button_filter(cgm, filter_type, div_filters);
	  }
		};

/***/ },
/* 198 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(181);
	var run_filter_slider = __webpack_require__(199);
	var get_filter_default_state = __webpack_require__(5);
	var get_subset_views = __webpack_require__(12);

	d3.slider = __webpack_require__(186);

	module.exports = function make_slider_filter(cgm, filter_type, div_filters) {

	  var params = cgm.params;
	  var inst_view = {};

	  var possible_filters = _.keys(params.viz.possible_filters);

	  _.each(possible_filters, function (tmp_filter) {
	    if (tmp_filter != filter_type) {
	      var default_state = get_filter_default_state(params.viz.filter_data, tmp_filter);
	      inst_view[tmp_filter] = default_state;
	    }
	  });

	  var filter_title = make_filter_title(params, filter_type);

	  div_filters.append('div').classed('title_' + filter_type, true).classed('sidebar_text', true).classed('slider_description', true).style('margin-top', '5px').style('margin-bottom', '3px').text(filter_title.text + filter_title.state + filter_title.suffix);

	  div_filters.append('div').classed('slider_' + filter_type, true).classed('slider', true).attr('current_state', filter_title.state);

	  var views = params.network_data.views;

	  var available_views = get_subset_views(params, views, inst_view);

	  // sort available views by filter_type value
	  available_views = available_views.sort(function (a, b) {
	    return b[filter_type] - a[filter_type];
	  });

	  var inst_max = available_views.length - 1;

	  var ini_value = 0;
	  // change the starting position of the slider if necessary
	  if (params.requested_view !== null && filter_type in params.requested_view) {

	    var inst_filter_value = params.requested_view[filter_type];

	    if (inst_filter_value != 'all') {

	      var found_value = available_views.map(function (e) {
	        return e[filter_type];
	      }).indexOf(inst_filter_value);

	      if (found_value > 0) {
	        ini_value = found_value;
	      }
	    }
	  }

	  // Filter Slider
	  //////////////////////////////////////////////////////////////////////
	  var slide_filter_fun = d3.slider().value(ini_value).min(0).max(inst_max).step(1).on('slide', function (evt, value) {
	    run_filter_slider_db(cgm, filter_type, available_views, value);
	  }).on('slideend', function (evt, value) {
	    run_filter_slider_db(cgm, filter_type, available_views, value);
	  });

	  // save slider function in order to reset value later
	  cgm.slider_functions[filter_type] = slide_filter_fun;

	  d3.select(cgm.params.root + ' .slider_' + filter_type).call(slide_filter_fun);

	  //////////////////////////////////////////////////////////////////////

	  var run_filter_slider_db = _.debounce(run_filter_slider, 800);
		};

/***/ },
/* 199 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var update_viz_with_view = __webpack_require__(143);
	var reset_other_filter_sliders = __webpack_require__(180);
	var get_current_orders = __webpack_require__(200);
	var make_requested_view = __webpack_require__(14);

	module.exports = function run_filter_slider(cgm, filter_type, available_views, inst_index) {

	  // only update if not running update
	  if (d3.select(cgm.params.viz.viz_svg).classed('running_update') === false) {

	    var params = cgm.params;

	    // get value
	    var inst_state = available_views[inst_index][filter_type];

	    reset_other_filter_sliders(cgm, filter_type, inst_state);

	    params = get_current_orders(params);

	    var requested_view = {};
	    requested_view[filter_type] = inst_state;

	    requested_view = make_requested_view(params, requested_view);

	    if (_.has(available_views[0], 'enr_score_type')) {
	      var enr_state = d3.select(params.root + ' .toggle_enr_score_type').attr('current_state');

	      requested_view.enr_score_type = enr_state;
	    }

	    update_viz_with_view(cgm, requested_view);
	  }
		};

/***/ },
/* 200 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function get_current_orders(params) {

	  // get current orders 
	  var other_rc;
	  _.each(['row', 'col'], function (inst_rc) {

	    if (inst_rc === 'row') {
	      other_rc = 'col';
	    } else {
	      other_rc = 'row';
	    }

	    if (d3.select(params.root + ' .toggle_' + other_rc + '_order .active').empty() === false) {

	      params.viz.inst_order[inst_rc] = d3.select(params.root + ' .toggle_' + other_rc + '_order').select('.active').attr('name');
	    } else {

	      // default to cluster ordering 
	      params.viz.inst_order[inst_rc] = 'clust';
	    }
	  });

	  return params;
	};

/***/ },
/* 201 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// var update_network = require('../network/update_network');
	var make_requested_view = __webpack_require__(14);

	module.exports = function make_button_filter(config, params, filter_type, div_filters) {

	  /*
	  Enrichr specific code
	  */

	  var buttons = div_filters.append('div').classed('categorical_filter', true).classed('toggle_' + filter_type, true).classed('btn-group-vertical', true).style('width', '100%').style('margin-top', '10px').attr('current_state', 'combined_score');

	  var filter_options = params.viz.filter_data[filter_type];

	  var button_dict = {
	    'combined_score': 'Combined Score',
	    'pval': 'P-Value',
	    'zscore': 'Z-score'
	  };

	  buttons.selectAll('button').data(filter_options).enter().append('button').attr('type', 'button').classed('btn', true).classed('btn-primary', true).classed('.filter_button', true).classed('active', function (d) {
	    var is_active = false;
	    if (d == 'combined_score') {
	      is_active = true;
	    }
	    return is_active;
	  }).attr('name', function (d) {
	    return d;
	  }).html(function (d) {
	    return button_dict[d];
	  });

	  $(params.root + ' .categorical_filter .btn').off().click(function () {

	    d3.selectAll(params.root + ' .categorical_filter .btn').classed('active', false);

	    d3.select(this).classed('active', true);

	    var inst_state = d3.select(this).attr('name');

	    var requested_view = { 'enr_score_type': inst_state };

	    make_requested_view(params, requested_view);

	    d3.select(params.root + ' .toggle_enr_score_type').attr('current_state', inst_state);
	  });
		};

/***/ },
/* 202 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function set_up_search(sidebar, params) {

	  var search_container = sidebar.append('div')
	  // .classed('row',true)
	  .classed('gene_search_container', true).style('padding-left', '10px').style('padding-right', '10px').style('margin-top', '10px');

	  search_container.append('input').classed('form-control', true).classed('gene_search_box', true).classed('sidebar_text', true).attr('type', 'text').attr('placeholder', params.sidebar.row_search.placeholder).style('height', params.sidebar.row_search.box.height + 'px');

	  search_container.append('div').classed('gene_search_button', true).style('margin-top', '5px').attr('data-toggle', 'buttons').append('button').classed('sidebar_text', true).html('Search').attr('type', 'button').classed('btn', true).classed('btn-primary', true).classed('submit_gene_button', true).style('width', '100%').style('font-size', '14px');
		};

/***/ },
/* 203 */
/***/ function(module, exports) {

	'use strict';

	// var get_cat_title = require('../categories/get_cat_title');

	module.exports = function set_up_reorder(params, sidebar) {

	  var button_dict;
	  var tmp_orders;
	  var rc_dict = { 'row': 'Row', 'col': 'Column', 'both': '' };
	  var is_active;
	  var inst_reorder;
	  // var all_cats;
	  // var inst_order_label;

	  var reorder_section = sidebar.append('div').style('padding-left', '10px').style('padding-right', '10px').classed('reorder_section', true);

	  var reorder_types;
	  if (params.sim_mat) {
	    reorder_types = ['both'];
	  } else {
	    reorder_types = ['row', 'col'];
	  }

	  _.each(reorder_types, function (inst_rc) {

	    button_dict = {
	      'clust': 'Cluster',
	      'rank': 'Rank by Sum',
	      'rankvar': 'Rank by Variance',
	      'ini': 'Initial Order',
	      'alpha': 'Alphabetically'
	    };

	    var other_rc;
	    if (inst_rc === 'row') {
	      other_rc = 'col';
	    } else {
	      other_rc = 'row';
	    }

	    tmp_orders = Object.keys(params.matrix.orders);

	    var possible_orders = [];

	    _.each(tmp_orders, function (inst_name) {

	      if (inst_name.indexOf(other_rc) > -1) {
	        inst_name = inst_name.replace('_row', '').replace('_col', '');

	        if (inst_name.indexOf('cat_') < 0) {
	          possible_orders.push(inst_name);
	        }
	      }
	    });

	    // specific to Enrichr
	    if (_.keys(params.viz.filter_data).indexOf('enr_score_type') > -1) {
	      possible_orders = ['clust', 'rank'];
	    }

	    possible_orders = _.uniq(possible_orders);

	    possible_orders = possible_orders.sort();

	    var reorder_text;
	    if (inst_rc != 'both') {
	      reorder_text = ' Order';
	    } else {
	      reorder_text = 'Reorder Matrix';
	    }

	    reorder_section.append('div').classed('sidebar_button_text', true).style('clear', 'both').style('margin-top', '10px').html(rc_dict[inst_rc] + reorder_text);

	    inst_reorder = reorder_section.append('div').classed('btn-group-vertical', true).style('width', '100%').classed('toggle_' + inst_rc + '_order', true).attr('role', 'group');

	    inst_reorder.selectAll('.button').data(possible_orders).enter().append('button').attr('type', 'button').classed('btn', true).classed('btn-primary', true).classed('sidebar_button_text', true).classed('active', function (d) {
	      is_active = false;
	      if (d == params.viz.inst_order[other_rc]) {
	        is_active = true;
	      }
	      return is_active;
	    }).attr('name', function (d) {
	      return d;
	    }).html(function (d) {
	      return button_dict[d];
	    });
	  });
		};

/***/ },
/* 204 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(181);

	module.exports = function set_sidebar_ini_view(params) {

	  _.each(_.keys(params.ini_view), function (inst_filter) {

	    // initialize filter slider using ini_view
	    var inst_value = params.ini_view[inst_filter];

	    var filter_type = params.viz.possible_filters[inst_filter];

	    if (filter_type === 'numerical') {

	      if (inst_value != 'all') {
	        inst_value = parseInt(inst_value, 10);
	      }

	      if (params.viz.filter_data[inst_filter].indexOf(inst_value) <= -1) {
	        inst_value = 'all';
	      }

	      var filter_title = make_filter_title(params, inst_filter);

	      d3.select(params.root + ' .title_' + inst_filter).text(filter_title.text + inst_value + filter_title.suffix);

	      d3.select(params.root + ' .slider_' + inst_filter).attr('current_state', inst_value);
	    } else {

	      // set up button initialization

	    }
	  });
		};

/***/ },
/* 205 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var file_saver = __webpack_require__(183);
	var two_translate_zoom = __webpack_require__(82);
	var deactivate_cropping = __webpack_require__(185);
	var save_svg_png = __webpack_require__(206);

	module.exports = function make_icons(cgm, sidebar) {

	  var params = cgm.params;
	  // var saveSvgAsPng = save_svg_png();
	  var saveAs = file_saver();

	  var row = sidebar.select('.icons_section').style('margin-top', '7px').style('margin-left', '5%');

	  var width_pct = '22%';
	  var padding_left = '0px';
	  var padding_right = '0px';

	  row.append('div').classed('clust_icon', true).style('float', 'left').style('width', width_pct).style('padding-left', padding_left).style('padding-right', padding_right).append('i').classed('fa', true).classed('fa-share-alt', true).classed('icon_buttons', true).style('font-size', '25px').on('click', function () {
	    $(params.root + ' .share_info').modal('toggle');
	    $('.share_url').val(window.location.href);
	  }).classed('sidebar_tooltip', true).append('span').classed('sidebar_tooltip_text', true).html('Share').style('left', '0%');

	  row.append('div').classed('clust_icon', true).style('float', 'left').style('width', width_pct).style('padding-left', padding_left).style('padding-right', padding_right).append('i').classed('fa', true).classed('fa-camera', true).classed('icon_buttons', true).style('font-size', '25px').on('click', function () {

	    $(params.root + ' .picture_info').modal('toggle');
	  }).classed('sidebar_tooltip', true).append('span').classed('sidebar_tooltip_text', true).html('Take snapshot').style('left', '-100%');

	  row.append('div').classed('clust_icon', true).style('float', 'left').style('width', width_pct).style('padding-left', padding_left).style('padding-right', padding_right).append('i').classed('fa', true).classed('fa fa-cloud-download', true).classed('icon_buttons', true).style('font-size', '25px').on('click', function () {

	    cgm.export_matrix();
	  }).classed('sidebar_tooltip', true).append('span').classed('sidebar_tooltip_text', true).html('Download matrix').style('left', '-200%');

	  row.append('div').classed('clust_icon', true).style('float', 'left').style('width', width_pct).style('padding-left', padding_left).style('padding-right', '-5px').append('i').classed('fa', true).classed('fa-crop', true).classed('crop_button', true).classed('icon_buttons', true).style('font-size', '25px').on('click', function () {

	    // do nothing if dendro filtering has been done
	    if (cgm.params.dendro_filter.row === false && cgm.params.dendro_filter.col === false) {

	      var is_crop = d3.select(this).classed('fa-crop');

	      var is_undo = d3.select(this).classed('fa-undo');

	      // press crop button (can be active/incative)
	      if (is_crop) {

	        // keep list of names to return to state
	        cgm.params.crop_filter_nodes = {};
	        cgm.params.crop_filter_nodes.row_nodes = cgm.params.network_data.row_nodes;
	        cgm.params.crop_filter_nodes.col_nodes = cgm.params.network_data.col_nodes;

	        cgm.brush_crop_matrix();

	        if (d3.select(this).classed('active_cropping') === false) {

	          // set active_cropping (button turns red)
	          d3.select(this).classed('active_cropping', true).style('color', 'red');
	        } else {
	          // deactivate cropping (button turns blue)
	          d3.select(this).classed('active_cropping', false).style('color', '#337ab7');

	          deactivate_cropping(cgm);
	        }
	      }

	      // press undo button
	      if (is_undo) {

	        d3.select(params.root + ' .crop_button').style('color', '#337ab7').classed('fa-crop', true).classed('fa-undo', false);

	        // cgm.filter_viz_using_names(cgm.params.crop_filter_nodes);
	        cgm.filter_viz_using_nodes(cgm.params.crop_filter_nodes);

	        // show dendro crop buttons after brush-cropping has been undone
	        d3.select(cgm.params.root + ' .col_dendro_icons_container').style('display', 'block');
	        d3.select(cgm.params.root + ' .row_dendro_icons_container').style('display', 'block');
	      }

	      two_translate_zoom(cgm, 0, 0, 1);
	    }
	  }).classed('sidebar_tooltip', true).append('span').classed('sidebar_tooltip_text', true).html('Crop matrix').style('left', '-400%');

	  // save svg: example from: http://bl.ocks.org/pgiraud/8955139#profile.json
	  ////////////////////////////////////////////////////////////////////////////
	  function save_clust_svg() {

	    d3.select(params.root + ' .expand_button').style('opacity', 0);

	    var html = d3.select(params.root + " svg").attr("title", "test2").attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg").node().parentNode.innerHTML;

	    var blob = new Blob([html], { type: "image/svg+xml" });

	    saveAs(blob, "clustergrammer.svg");

	    d3.select(params.root + ' .expand_button').style('opacity', 0.4);
	  }

	  d3.select(params.root + ' .download_buttons').append('p').append('a').html('Download SVG').on('click', function () {
	    save_clust_svg();
	  });

	  var svg_id = 'svg_' + params.root.replace('#', '');

	  // save as PNG
	  /////////////////////////////////////////
	  d3.select(params.root + ' .download_buttons').append('p').append('a').html('Download PNG').on('click', function () {
	    d3.select(params.root + ' .expand_button').style('opacity', 0);
	    // saveSvgAsPng(document.getElementById(svg_id), "clustergrammer.png");
	    save_svg_png.saveSvgAsPng(document.getElementById(svg_id), "clustergrammer.png");
	    d3.select(params.root + ' .expand_button').style('opacity', 0.4);
	  });
		};

/***/ },
/* 206 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	(function () {
	  var out$ = typeof exports != 'undefined' && exports || "function" != 'undefined' && {} || this;

	  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd" [<!ENTITY nbsp "&#160;">]>';

	  function isElement(obj) {
	    return obj instanceof HTMLElement || obj instanceof SVGElement;
	  }

	  function requireDomNode(el) {
	    if (!isElement(el)) {
	      throw new Error('an HTMLElement or SVGElement is required; got ' + el);
	    }
	  }

	  function isExternal(url) {
	    return url && url.lastIndexOf('http', 0) == 0 && url.lastIndexOf(window.location.host) == -1;
	  }

	  function inlineImages(el, callback) {
	    requireDomNode(el);

	    var images = el.querySelectorAll('image'),
	        left = images.length,
	        checkDone = function checkDone() {
	      if (left === 0) {
	        callback();
	      }
	    };

	    checkDone();
	    for (var i = 0; i < images.length; i++) {
	      (function (image) {
	        var href = image.getAttributeNS("http://www.w3.org/1999/xlink", "href");
	        if (href) {
	          if (isExternal(href.value)) {
	            console.warn("Cannot render embedded images linking to external hosts: " + href.value);
	            return;
	          }
	        }
	        var canvas = document.createElement('canvas');
	        var ctx = canvas.getContext('2d');
	        var img = new Image();
	        img.crossOrigin = "anonymous";
	        href = href || image.getAttribute('href');
	        if (href) {
	          img.src = href;
	          img.onload = function () {
	            canvas.width = img.width;
	            canvas.height = img.height;
	            ctx.drawImage(img, 0, 0);
	            image.setAttributeNS("http://www.w3.org/1999/xlink", "href", canvas.toDataURL('image/png'));
	            left--;
	            checkDone();
	          };
	          img.onerror = function () {
	            console.log("Could not load " + href);
	            left--;
	            checkDone();
	          };
	        } else {
	          left--;
	          checkDone();
	        }
	      })(images[i]);
	    }
	  }

	  function styles(el, options, cssLoadedCallback) {
	    var selectorRemap = options.selectorRemap;
	    var modifyStyle = options.modifyStyle;
	    var css = "";
	    // each font that has extranl link is saved into queue, and processed
	    // asynchronously
	    var fontsQueue = [];
	    var sheets = document.styleSheets;
	    for (var i = 0; i < sheets.length; i++) {
	      try {
	        var rules = sheets[i].cssRules;
	      } catch (e) {
	        console.warn("Stylesheet could not be loaded: " + sheets[i].href);
	        continue;
	      }

	      if (rules != null) {
	        for (var j = 0, match; j < rules.length; j++, match = null) {
	          var rule = rules[j];
	          if (typeof rule.style != "undefined") {
	            var selectorText;

	            try {
	              selectorText = rule.selectorText;
	            } catch (err) {
	              console.warn('The following CSS rule has an invalid selector: "' + rule + '"', err);
	            }

	            try {
	              if (selectorText) {
	                match = el.querySelector(selectorText);
	              }
	            } catch (err) {
	              console.warn('Invalid CSS selector "' + selectorText + '"', err);
	            }

	            if (match) {
	              var selector = selectorRemap ? selectorRemap(rule.selectorText) : rule.selectorText;
	              var cssText = modifyStyle ? modifyStyle(rule.style.cssText) : rule.style.cssText;
	              css += selector + " { " + cssText + " }\n";
	            } else if (rule.cssText.match(/^@font-face/)) {
	              // below we are trying to find matches to external link. E.g.
	              // @font-face {
	              //   // ...
	              //   src: local('Abel'), url(https://fonts.gstatic.com/s/abel/v6/UzN-iejR1VoXU2Oc-7LsbvesZW2xOQ-xsNqO47m55DA.woff2);
	              // }
	              //
	              // This regex will save extrnal link into first capture group
	              var fontUrlRegexp = /url\(["']?(.+?)["']?\)/;
	              // TODO: This needs to be changed to support multiple url declarations per font.
	              var fontUrlMatch = rule.cssText.match(fontUrlRegexp);

	              var externalFontUrl = fontUrlMatch && fontUrlMatch[1] || '';
	              var fontUrlIsDataURI = externalFontUrl.match(/^data:/);
	              if (fontUrlIsDataURI) {
	                // We should ignore data uri - they are already embedded
	                externalFontUrl = '';
	              }

	              if (externalFontUrl) {
	                // okay, we are lucky. We can fetch this font later
	                fontsQueue.push({
	                  text: rule.cssText,
	                  // Pass url regex, so that once font is downladed, we can run `replace()` on it
	                  fontUrlRegexp: fontUrlRegexp,
	                  format: getFontMimeTypeFromUrl(externalFontUrl),
	                  url: externalFontUrl
	                });
	              } else {
	                // otherwise, use previous logic
	                css += rule.cssText + '\n';
	              }
	            }
	          }
	        }
	      }
	    }

	    // Now all css is processed, it's time to handle scheduled fonts
	    processFontQueue(fontsQueue);

	    function getFontMimeTypeFromUrl(fontUrl) {
	      var supportedFormats = {
	        'woff2': 'font/woff2',
	        'woff': 'font/woff',
	        'otf': 'application/x-font-opentype',
	        'ttf': 'application/x-font-ttf',
	        'eot': 'application/vnd.ms-fontobject',
	        'sfnt': 'application/font-sfnt',
	        'svg': 'image/svg+xml'
	      };
	      var extensions = Object.keys(supportedFormats);
	      for (var i = 0; i < extensions.length; ++i) {
	        var extension = extensions[i];
	        // TODO: This is not bullet proof, it needs to handle edge cases...
	        if (fontUrl.indexOf('.' + extension) > 0) {
	          return supportedFormats[extension];
	        }
	      }

	      // If you see this error message, you probably need to update code above.
	      console.error('Unknown font format for ' + fontUrl + '; Fonts may not be working correctly');
	      return 'application/octet-stream';
	    }

	    function processFontQueue(queue) {
	      if (queue.length > 0) {
	        // load fonts one by one until we have anything in the queue:
	        var font = queue.pop();
	        processNext(font);
	      } else {
	        // no more fonts to load.
	        cssLoadedCallback(css);
	      }

	      function processNext(font) {
	        // TODO: This could benefit from caching.
	        var oReq = new XMLHttpRequest();
	        oReq.addEventListener('load', fontLoaded);
	        oReq.addEventListener('error', transferFailed);
	        oReq.addEventListener('abort', transferFailed);
	        oReq.open('GET', font.url);
	        oReq.responseType = 'arraybuffer';
	        oReq.send();

	        function fontLoaded() {
	          // TODO: it may be also worth to wait until fonts are fully loaded before
	          // attempting to rasterize them. (e.g. use https://developer.mozilla.org/en-US/docs/Web/API/FontFaceSet )
	          var fontBits = oReq.response;
	          var fontInBase64 = arrayBufferToBase64(fontBits);
	          updateFontStyle(font, fontInBase64);
	        }

	        function transferFailed(e) {
	          console.warn('Failed to load font from: ' + font.url);
	          console.warn(e);
	          css += font.text + '\n';
	          processFontQueue();
	        }

	        function updateFontStyle(font, fontInBase64) {
	          var dataUrl = 'url("data:' + font.format + ';base64,' + fontInBase64 + '")';
	          css += font.text.replace(font.fontUrlRegexp, dataUrl) + '\n';

	          // schedule next font download on next tick.
	          setTimeout(function () {
	            processFontQueue(queue);
	          }, 0);
	        }
	      }
	    }

	    function arrayBufferToBase64(buffer) {
	      var binary = '';
	      var bytes = new Uint8Array(buffer);
	      var len = bytes.byteLength;

	      for (var i = 0; i < len; i++) {
	        binary += String.fromCharCode(bytes[i]);
	      }

	      return window.btoa(binary);
	    }
	  }

	  function getDimension(el, clone, dim) {
	    var v = el.viewBox && el.viewBox.baseVal && el.viewBox.baseVal[dim] || clone.getAttribute(dim) !== null && !clone.getAttribute(dim).match(/%$/) && parseInt(clone.getAttribute(dim)) || el.getBoundingClientRect()[dim] || parseInt(clone.style[dim]) || parseInt(window.getComputedStyle(el).getPropertyValue(dim));
	    return typeof v === 'undefined' || v === null || isNaN(parseFloat(v)) ? 0 : v;
	  }

	  function reEncode(data) {
	    data = encodeURIComponent(data);
	    data = data.replace(/%([0-9A-F]{2})/g, function (match, p1) {
	      var c = String.fromCharCode('0x' + p1);
	      return c === '%' ? '%25' : c;
	    });
	    return decodeURIComponent(data);
	  }

	  out$.prepareSvg = function (el, options, cb) {
	    requireDomNode(el);

	    options = options || {};
	    options.scale = options.scale || 1;
	    options.responsive = options.responsive || false;
	    var xmlns = "http://www.w3.org/2000/xmlns/";

	    inlineImages(el, function () {
	      var outer = document.createElement("div");
	      var clone = el.cloneNode(true);
	      var width, height;
	      if (el.tagName == 'svg') {
	        width = options.width || getDimension(el, clone, 'width');
	        height = options.height || getDimension(el, clone, 'height');
	      } else if (el.getBBox) {
	        var box = el.getBBox();
	        width = box.x + box.width;
	        height = box.y + box.height;
	        clone.setAttribute('transform', clone.getAttribute('transform').replace(/translate\(.*?\)/, ''));

	        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	        svg.appendChild(clone);
	        clone = svg;
	      } else {
	        console.error('Attempted to render non-SVG element', el);
	        return;
	      }

	      clone.setAttribute("version", "1.1");
	      if (!clone.getAttribute('xmlns')) {
	        clone.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
	      }
	      if (!clone.getAttribute('xmlns:xlink')) {
	        clone.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
	      }

	      if (options.responsive) {
	        clone.removeAttribute('width');
	        clone.removeAttribute('height');
	        clone.setAttribute('preserveAspectRatio', 'xMinYMin meet');
	      } else {
	        clone.setAttribute("width", width * options.scale);
	        clone.setAttribute("height", height * options.scale);
	      }

	      clone.setAttribute("viewBox", [options.left || 0, options.top || 0, width, height].join(" "));

	      var fos = clone.querySelectorAll('foreignObject > *');
	      for (var i = 0; i < fos.length; i++) {
	        if (!fos[i].getAttribute('xmlns')) {
	          fos[i].setAttributeNS(xmlns, "xmlns", "http://www.w3.org/1999/xhtml");
	        }
	      }

	      outer.appendChild(clone);

	      // In case of custom fonts we need to fetch font first, and then inline
	      // its url into data-uri format (encode as base64). That's why style
	      // processing is done asynchonously. Once all inlining is finshed
	      // cssLoadedCallback() is called.
	      styles(el, options, cssLoadedCallback);

	      function cssLoadedCallback(css) {
	        // here all fonts are inlined, so that we can render them properly.
	        var s = document.createElement('style');
	        s.setAttribute('type', 'text/css');
	        s.innerHTML = "<![CDATA[\n" + css + "\n]]>";
	        var defs = document.createElement('defs');
	        defs.appendChild(s);
	        clone.insertBefore(defs, clone.firstChild);

	        if (cb) {
	          var outHtml = outer.innerHTML;
	          outHtml = outHtml.replace(/NS\d+:href/gi, 'xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href');
	          cb(outHtml, width, height);
	        }
	      }
	    });
	  };

	  out$.svgAsDataUri = function (el, options, cb) {
	    out$.prepareSvg(el, options, function (svg) {
	      var uri = 'data:image/svg+xml;base64,' + window.btoa(reEncode(doctype + svg));
	      if (cb) {
	        cb(uri);
	      }
	    });
	  };

	  out$.svgAsPngUri = function (el, options, cb) {
	    requireDomNode(el);

	    options = options || {};
	    options.encoderType = options.encoderType || 'image/png';
	    options.encoderOptions = options.encoderOptions || 0.8;

	    var convertToPng = function convertToPng(src, w, h) {
	      var canvas = document.createElement('canvas');
	      var context = canvas.getContext('2d');
	      canvas.width = w;
	      canvas.height = h;

	      if (options.canvg) {
	        options.canvg(canvas, src);
	      } else {
	        context.drawImage(src, 0, 0);
	      }

	      if (options.backgroundColor) {
	        context.globalCompositeOperation = 'destination-over';
	        context.fillStyle = options.backgroundColor;
	        context.fillRect(0, 0, canvas.width, canvas.height);
	      }

	      var png;
	      try {
	        png = canvas.toDataURL(options.encoderType, options.encoderOptions);
	      } catch (e) {
	        if (typeof SecurityError !== 'undefined' && e instanceof SecurityError || e.name == "SecurityError") {
	          console.error("Rendered SVG images cannot be downloaded in this browser.");
	          return;
	        } else {
	          throw e;
	        }
	      }
	      cb(png);
	    };

	    if (options.canvg) {
	      out$.prepareSvg(el, options, convertToPng);
	    } else {
	      out$.svgAsDataUri(el, options, function (uri) {
	        var image = new Image();

	        image.onload = function () {
	          convertToPng(image, image.width, image.height);
	        };

	        image.onerror = function () {
	          console.error('There was an error loading the data URI as an image on the following SVG\n', window.atob(uri.slice(26)), '\n', "Open the following link to see browser's diagnosis\n", uri);
	        };

	        image.src = uri;
	      });
	    }
	  };

	  out$.download = function (name, uri) {
	    if (navigator.msSaveOrOpenBlob) {
	      navigator.msSaveOrOpenBlob(uriToBlob(uri), name);
	    } else {
	      var saveLink = document.createElement('a');
	      var downloadSupported = 'download' in saveLink;
	      if (downloadSupported) {
	        saveLink.download = name;
	        saveLink.href = uri;
	        saveLink.style.display = 'none';
	        document.body.appendChild(saveLink);
	        saveLink.click();
	        document.body.removeChild(saveLink);
	      } else {
	        window.open(uri, '_temp', 'menubar=no,toolbar=no,status=no');
	      }
	    }
	  };

	  function uriToBlob(uri) {
	    var byteString = window.atob(uri.split(',')[1]);
	    var mimeString = uri.split(',')[0].split(':')[1].split(';')[0];
	    var buffer = new ArrayBuffer(byteString.length);
	    var intArray = new Uint8Array(buffer);
	    for (var i = 0; i < byteString.length; i++) {
	      intArray[i] = byteString.charCodeAt(i);
	    }
	    return new Blob([buffer], { type: mimeString });
	  }

	  out$.saveSvg = function (el, name, options) {
	    requireDomNode(el);

	    options = options || {};
	    out$.svgAsDataUri(el, options, function (uri) {
	      out$.download(name, uri);
	    });
	  };

	  out$.saveSvgAsPng = function (el, name, options) {
	    requireDomNode(el);

	    options = options || {};
	    out$.svgAsPngUri(el, options, function (uri) {
	      out$.download(name, uri);
	    });
	  };

	  // if define is defined create as an AMD module
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return out$;
	    }.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
		})();

/***/ },
/* 207 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_modal_skeleton = __webpack_require__(208);

	module.exports = function ini_modals(params) {

	  // share modal
	  ///////////////////////////////////////
	  var share_modal = make_modal_skeleton(params, 'share_info');

	  share_modal.header.append('a').attr('target', '_blank').attr('href', '/clustergrammer/');

	  share_modal.header.append('h4').classed('modal-title', true).html('Share the visualization using the current URL:');

	  share_modal.body.append('input').classed('bootstrap_highlight', true).classed('share_url', true);

	  // picture modal
	  ///////////////////////////////////////
	  var screenshot_modal = make_modal_skeleton(params, 'picture_info');

	  screenshot_modal.header.append('h4').classed('modal-title', true).html('Save a snapshot of the visualization');

	  screenshot_modal.body.append('div').classed('download_buttons', true);

	  // dendro modal
	  ///////////////////////////////////////
	  var dendro_modal = make_modal_skeleton(params, 'dendro_info');

	  dendro_modal.header.append('h4').classed('modal-title', true).html('Cluster Information');

	  dendro_modal.body.append('g').classed('cluster_info_container', true);

	  dendro_modal.body.append('div').classed('dendro_text', true).append('input').classed('bootstrap_highlight', true).classed('current_names', true).style('width', '100%');
		};

/***/ },
/* 208 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function make_modal_skeleton(params, modal_class) {

	  var modal_skeleton = {};

	  var modal = d3.select(params.root).append('div').classed('modal', true).classed('fade', true).classed(modal_class, true).attr('role', 'dialog');

	  var modal_dialog = modal.append('div').classed('modal-dialog', true);

	  var modal_content = modal_dialog.append('div').classed('modal-content', true);

	  modal_skeleton.header = modal_content.append('div').classed('modal-header', true);

	  modal_skeleton.header.append('button').attr('type', 'button').classed('close', true).attr('data-dismiss', 'modal').html('&times;');

	  modal_skeleton.body = modal_content.append('div').classed('modal-body', true);

	  return modal_skeleton;
		};

/***/ },
/* 209 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function set_up_opacity_slider(sidebar) {

	  var slider_container = sidebar.append('div').classed('opacity_slider_container', true).style('margin-top', '5px').style('padding-left', '10px').style('padding-right', '10px');

	  slider_container.append('div').classed('sidebar_text', true).classed('opacity_slider_text', true).style('margin-bottom', '3px').text('Opacity Slider');

	  slider_container.append('div').classed('slider', true).classed('opacity_slider', true);
		};

/***/ }
/******/ ]);
//# sourceMappingURL=clustergrammer.js.map