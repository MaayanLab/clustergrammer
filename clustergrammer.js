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
	var make_params = __webpack_require__(10);
	var make_viz = __webpack_require__(44);
	var resize_viz = __webpack_require__(81);
	var play_demo = __webpack_require__(106);
	var ini_demo = __webpack_require__(150);
	var update_network = __webpack_require__(118);

	/* clustergrammer 1.0
	 * Nick Fernandez, Ma'ayan Lab, Icahn School of Medicine at Mount Sinai
	 * (c) 2016
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
	  // make visualization parameters using configuration object
	  var params = make_params(config);

	  var cgm = {};
	  cgm.params = params;
	  cgm.config = config;

	  if (params.use_sidebar) {
	    var make_sidebar = __webpack_require__(153);
	    params = make_sidebar(cgm);
	  }

	  // make visualization using parameters
	  make_viz(params);

	  function external_resize() {

	    d3.select(params.viz.viz_svg).style('opacity', 0.5);

	    var wait_time = 500;
	    if (this.params.viz.run_trans === true) {
	      wait_time = 2500;
	    }

	    setTimeout(resize_fun, wait_time, this);
	  }

	  function resize_fun(cgm) {
	    // use this params, because this will have the latest params
	    resize_viz(cgm.params);
	  }

	  function external_update_view(requested_view) {
	    params = update_network(this, requested_view);
	  }

	  // add more API endpoints
	  cgm.update_view = external_update_view;
	  cgm.resize_viz = external_resize;
	  cgm.play_demo = play_demo;
	  cgm.ini_demo = ini_demo;

	  return cgm;
	}

		module.exports = Clustergrammer;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var colors = __webpack_require__(3);
	var transpose_network = __webpack_require__(4);
	var get_available_filters = __webpack_require__(5);
	var get_filter_default_state = __webpack_require__(6);
	var set_defaults = __webpack_require__(7);
	var check_sim_mat = __webpack_require__(8);
	var check_nodes_for_categories = __webpack_require__(9);

	module.exports = function make_config(args) {

	  var defaults = set_defaults();

	  // Mixin defaults with user-defined arguments.
	  var config = utils.extend(defaults, args);

	  config.network_data = args.network_data;

	  var super_string = ': ';
	  var tmp_super;

	  // replace undersores with space in row/col names
	  _.each(['row', 'col'], function (inst_rc) {

	    var inst_nodes = config.network_data[inst_rc + '_nodes'];

	    var has_cats = check_nodes_for_categories(inst_nodes);

	    inst_nodes.forEach(function (d) {

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

	        inst_nodes[inst_rc + '_nodes'].forEach(function (d) {

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

	  config.show_categories = {};
	  config.all_cats = {};
	  config.cat_names = {};

	  var predefine_colors = false;
	  if (config.cat_colors === null) {
	    config.cat_colors = {};
	    predefine_colors = false;
	  } else {
	    predefine_colors = true;
	  }

	  var num_colors = 0;
	  _.each(['row', 'col'], function (inst_rc) {

	    config.show_categories[inst_rc] = false;

	    config.all_cats[inst_rc] = [];
	    var tmp_keys = _.keys(config.network_data[inst_rc + '_nodes'][0]);

	    _.each(tmp_keys, function (d) {
	      if (d.indexOf('cat-') >= 0) {
	        config.show_categories[inst_rc] = true;
	        config.all_cats[inst_rc].push(d);
	      }
	    });

	    if (config.show_categories[inst_rc]) {

	      if (predefine_colors === false) {
	        config.cat_colors[inst_rc] = {};
	      }
	      config.cat_names[inst_rc] = {};

	      _.each(config.all_cats[inst_rc], function (inst_cat) {

	        _.each(config.network_data[inst_rc + '_nodes'], function (inst_node) {

	          if (inst_node[inst_cat].indexOf(super_string) > 0) {
	            tmp_super = inst_node[inst_cat].split(super_string)[0];
	            config.cat_names[inst_rc][inst_cat] = tmp_super;
	          } else {
	            config.cat_names[inst_rc][inst_cat] = inst_cat;
	          }
	        });

	        var names_of_cat = _.uniq(utils.pluck(config.network_data[inst_rc + '_nodes'], inst_cat)).sort();

	        if (predefine_colors === false) {

	          config.cat_colors[inst_rc][inst_cat] = {};

	          _.each(names_of_cat, function (cat_tmp, i) {

	            var inst_color = colors.get_random_color(i + num_colors);

	            config.cat_colors[inst_rc][inst_cat][cat_tmp] = inst_color;

	            // hack to get 'Not' categories to not be dark colored
	            if (cat_tmp.indexOf('Not ') >= 0) {
	              config.cat_colors[inst_rc][inst_cat][cat_tmp] = '#eee';
	            }

	            num_colors = num_colors + 1;
	          });
	        }
	      });
	    }

	    if (config.sim_mat) {
	      config.cat_colors.row = config.cat_colors.col;
	    }
	  });

	  // check for category information
	  if (config.show_categories.col) {
	    // generate a dictionary of columns in each category
	    config.cat_dict = {};
	    col_nodes.forEach(function (d) {

	      // initialize array for each category
	      if (!utils.has(config.cat_dict, d.cat)) {
	        config.cat_dict[d.cat] = [];
	      }
	      // add column name to category array
	      config.cat_dict[d.cat].push(d.name);
	    });
	  }

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
/* 4 */
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
/* 5 */
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
/* 6 */
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
/* 7 */
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
	    outline_colors: ['orange', 'black'],
	    highlight_color: '#FFFF00',
	    tile_title: false,
	    // Default domain is set to 0: the domain will be set automatically
	    input_domain: 0,
	    opacity_scale: 'linear',
	    do_zoom: true,
	    is_zoom: 0,
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
	    use_sidebar: true,
	    title: null,
	    about: null,
	    sidebar_width: 170,
	    sidebar_icons: true,
	    row_search_placeholder: 'Row',
	    buffer_width: 10,
	    show_sim_mat: false,
	    cat_colors: null,
	    resize: true,
	    clamp_opacity: 0.85,
	    expand_button: true,
	    max_allow_fs: 20
	  };

	  return defaults;
		};

/***/ },
/* 8 */
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
/* 9 */
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
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// var crossfilter = require('crossfilter');
	var change_network_view = __webpack_require__(11);
	var set_viz_wrapper_size = __webpack_require__(14);
	var calc_clust_width = __webpack_require__(16);
	var calc_clust_height = __webpack_require__(17);
	var get_svg_dim = __webpack_require__(18);
	var ini_label_params = __webpack_require__(19);
	var ini_viz_params = __webpack_require__(20);
	var ini_matrix_params = __webpack_require__(21);
	var calc_default_fs = __webpack_require__(23);
	var calc_matrix_params = __webpack_require__(24);
	var calc_label_params = __webpack_require__(25);
	var calc_val_max = __webpack_require__(26);
	var set_zoom_params = __webpack_require__(27);
	var ini_sidebar_params = __webpack_require__(42);
	var make_requested_view = __webpack_require__(43);
	var get_available_filters = __webpack_require__(5);

	/* 
	Params: calculates the size of all the visualization elements in the
	clustergram.
	 */

	module.exports = function make_params(input_config) {

	  var config = $.extend(true, {}, input_config);
	  var params = config;

	  // when pre-loading the visualization using a view
	  if (params.ini_view !== null) {

	    var requested_view = params.ini_view;

	    var filters = get_available_filters(params.network_data.views);

	    params.viz = {};
	    params.viz.possible_filters = filters.possible_filters;
	    params.viz.filter_data = filters.filter_data;

	    requested_view = make_requested_view(params, requested_view);

	    // requested_view.enr_score_type = 'combined_score';

	    params.network_data = change_network_view(params, params.network_data, requested_view);
	  }

	  params.labels = ini_label_params(config, params.network_data);
	  params.viz = ini_viz_params(config, params);

	  params.matrix = ini_matrix_params(config, params.viz, params.network_data);

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
	  params = calc_matrix_params(config, params);
	  params = set_zoom_params(params);
	  params = calc_default_fs(params);

	  if (params.use_sidebar) {
	    params.sidebar = ini_sidebar_params(params);
	  }

	  return params;
		};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var filter_using_new_nodes = __webpack_require__(12);
	var get_subset_views = __webpack_require__(13);

	module.exports = function change_network_view(params, orig_network_data, requested_view) {

	  var views = orig_network_data.views;
	  var inst_view;

	  var is_enr = false;
	  if (_.has(views[0], 'enr_score_type')) {
	    is_enr = true;
	  }

	  // ////////////////////////////////////////
	  // // tmp N_col_sum measure
	  // ////////////////////////////////////////
	  // requested_view.N_col_sum = 30;

	  views = get_subset_views(params, views, requested_view);

	  // Enrichr specific rules
	  if (is_enr && views.length == 0) {

	    requested_view = { 'N_row_sum': 'all', 'N_col_sum': '10' };

	    views = orig_network_data.views;

	    views = get_subset_views(params, views, requested_view);
	  }

	  inst_view = views[0];

	  var new_network_data;

	  // get new_network_data or default back to old_network_data
	  if (typeof inst_view !== 'undefined') {
	    var new_nodes = inst_view.nodes;
	    var links = orig_network_data.links;
	    new_network_data = filter_using_new_nodes(params, new_nodes, links, views);
	  } else {
	    new_network_data = orig_network_data;
	  }

	  // pass on views
	  new_network_data.views = orig_network_data.views;

	  return new_network_data;
		};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);

	module.exports = function (params, new_nodes, links, views) {

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

	  // pass on all views
	  new_network_data.views = views;

	  return new_network_data;
		};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var get_filter_default_state = __webpack_require__(6);

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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_viz_dimensions = __webpack_require__(15);

	module.exports = function set_viz_wrapper_size(params) {

	  // Create wrapper around SVG visualization
	  if (d3.select(params.root + ' .viz_wrapper').empty()) {

	    d3.select(params.root).append('div').classed('sidebar_wrapper', true);

	    d3.select(params.root).append('div').classed('viz_wrapper', true);
	  }

	  var cont_dim = calc_viz_dimensions(params);

	  // var sidebar_margin = 5;

	  d3.select(params.root).style('clear', 'both');

	  d3.select(params.root + ' .sidebar_wrapper')
	  // .style('margin-left',sidebar_margin+'px')
	  .style('float', 'left').style('width', params.sidebar_width + 'px').style('height', cont_dim.height + 'px').style('overflow', 'hidden');

	  d3.select(params.viz.viz_wrapper).style('float', 'left').style('width', cont_dim.width + 'px')
	  // .style('width', '100px')
	  .style('height', cont_dim.height + 'px');
		};

/***/ },
/* 15 */
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
/* 16 */
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
/* 17 */
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
/* 18 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function get_svg_dim(params) {

	  params.viz.svg_dim = {};
	  params.viz.svg_dim.width = Number(d3.select(params.viz.viz_wrapper).style('width').replace('px', ''));

	  params.viz.svg_dim.height = Number(d3.select(params.viz.viz_wrapper).style('height').replace('px', ''));

	  return params;
		};

/***/ },
/* 19 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function set_label_params(config, network_data) {

	  var labels = {};
	  labels.super_label_scale = config.super_label_scale;
	  labels.super_labels = config.super_labels;
	  labels.super_label_fs = 13.8;

	  if (labels.super_labels) {
	    labels.super = {};
	    labels.super.row = config.super.row;
	    labels.super.col = config.super.col;
	  }

	  labels.show_label_tooltips = config.show_label_tooltips;

	  labels.row_max_char = _.max(network_data.row_nodes, function (inst) {
	    return inst.name.length;
	  }).name.length;

	  labels.col_max_char = _.max(network_data.col_nodes, function (inst) {
	    return inst.name.length;
	  }).name.length;

	  labels.max_allow_fs = config.max_allow_fs;

	  return labels;
		};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var get_available_filters = __webpack_require__(5);

	module.exports = function ini_viz_params(config, params) {

	  var viz = {};

	  viz.root = config.root;
	  viz.viz_wrapper = config.root + ' .viz_wrapper';
	  viz.do_zoom = config.do_zoom;
	  viz.background_color = config.background_color;
	  viz.super_border_color = config.super_border_color;
	  viz.outer_margins = config.outer_margins;
	  viz.is_expand = config.ini_expand;
	  viz.grey_border_width = config.grey_border_width;
	  viz.show_dendrogram = config.show_dendrogram;
	  viz.tile_click_hlight = config.tile_click_hlight;
	  viz.inst_order = config.inst_order;
	  viz.expand_button = config.expand_button;
	  viz.all_cats = config.all_cats;
	  viz.cat_colors = config.cat_colors;
	  viz.cat_names = config.cat_names;
	  viz.sim_mat = config.sim_mat;

	  viz.viz_svg = viz.viz_wrapper + ' .viz_svg';

	  viz.zoom_element = viz.viz_wrapper + ' .viz_svg';

	  viz.uni_duration = 1000;
	  viz.bottom_space = 5;
	  viz.run_trans = false;
	  viz.duration = 1000;
	  if (viz.show_dendrogram) {
	    config.group_level = {};
	  }

	  viz.resize = config.resize;
	  if (utils.has(config, 'size')) {
	    viz.fixed_size = config.size;
	  } else {
	    viz.fixed_size = false;
	  }

	  // width is 1 over this value
	  viz.border_fraction = 55;
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

	  viz.show_categories = {};
	  viz.cat_room = {};
	  viz.cat_room.symbol_width = 12;
	  viz.cat_room.separation = 3;

	  viz.cat_colors.opacity = 0.6;
	  viz.cat_colors.active_opacity = 0.9;

	  viz.triangle_opacity = 0.6;

	  viz.norm_labels = {};
	  viz.norm_labels.width = {};

	  viz.dendro_room = {};
	  if (viz.show_dendrogram) {
	    viz.dendro_room.symbol_width = 10;
	  } else {
	    viz.dendro_room.symbol_width = 0;
	  }

	  var separtion_room;

	  // increase the width of the label container based on the label length
	  var label_scale = d3.scale.linear().domain([5, 15]).range([85, 120]).clamp('true');

	  _.each(['row', 'col'], function (inst_rc) {

	    viz.show_categories[inst_rc] = config.show_categories[inst_rc];
	    viz.norm_labels.width[inst_rc] = label_scale(params.labels[inst_rc + '_max_char']) * params[inst_rc + '_label_scale'];

	    viz['num_' + inst_rc + '_nodes'] = params.network_data[inst_rc + '_nodes'].length;

	    if (_.has(config, 'group_level')) {
	      config.group_level[inst_rc] = 5;
	    }

	    if (inst_rc === 'row') {
	      viz.dendro_room[inst_rc] = viz.dendro_room.symbol_width;
	    } else {
	      viz.dendro_room[inst_rc] = viz.dendro_room.symbol_width + viz.uni_margin;
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

	  viz.dendro_opacity = 0.35;

	  viz.spillover_col_slant = viz.norm_labels.width.col;

	  var filters = get_available_filters(params.network_data.views);

	  viz.possible_filters = filters.possible_filters;
	  viz.filter_data = filters.filter_data;

	  return viz;
		};

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var initialize_matrix = __webpack_require__(22);

	module.exports = function ini_matrix_params(config, viz, network_data) {

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

	  // definition of a large matrix (num links) determines if transition is run
	  matrix.def_large_matrix = 10000;
	  matrix.opacity_function = config.opacity_scale;

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

	    if (viz.all_cats[other_rc].length > 0) {
	      _.each(viz.all_cats[other_rc], function (inst_cat) {
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

	  matrix.abs_max_val = Math.abs(matrix.max_link) * config.clamp_opacity;

	  if (config.input_domain === 0) {
	    if (matrix.opacity_function === 'linear') {
	      matrix.opacity_scale = d3.scale.linear().domain([0, matrix.abs_max_val]).clamp(true).range([0.0, 1.0]);
	    } else if (matrix.opacity_function === 'log') {
	      matrix.opacity_scale = d3.scale.log().domain([0.001, matrix.abs_max_val]).clamp(true).range([0.0, 1.0]);
	    }
	  } else {
	    if (matrix.opacity_function === 'linear') {
	      matrix.opacity_scale = d3.scale.linear().domain([0, config.input_domain]).clamp(true).range([0.0, 1.0]);
	    } else if (matrix.opacity_function === 'log') {
	      matrix.opacity_scale = d3.scale.log().domain([0.001, config.input_domain]).clamp(true).range([0.0, 1.0]);
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
/* 22 */
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
/* 23 */
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
/* 24 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function calc_matrix_params(config, params) {

	  params.viz.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);

	  params.viz.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

	  params.viz.x_scale.domain(params.matrix.orders[params.viz.inst_order.row + '_row']);

	  params.viz.y_scale.domain(params.matrix.orders[params.viz.inst_order.col + '_col']);

	  params.viz.border_width = params.viz.x_scale.rangeBand() / params.viz.border_fraction;

	  return params;
		};

/***/ },
/* 25 */
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
/* 26 */
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
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var zoomed = __webpack_require__(28);
	var calc_zoom_switching = __webpack_require__(41);

	module.exports = function set_zoom_params(params) {

	  params.viz.zoom_scale_font = {};
	  params.viz.zoom_scale_font.row = 1;
	  params.viz.zoom_scale_font.col = 1;

	  var max_zoom_limit = 0.75;
	  var half_col_height = params.viz.x_scale.rangeBand() / 2;
	  params.viz.real_zoom = params.viz.norm_labels.width.col / half_col_height * max_zoom_limit;

	  params.viz = calc_zoom_switching(params.viz);

	  params.zoom_behavior = d3.behavior.zoom().scaleExtent([1, params.viz.real_zoom * params.viz.zoom_switch]).on('zoom', function () {
	    zoomed(params);
	  });

	  // rect width needs matrix and zoom parameters
	  params.viz.rect_width = params.viz.x_scale.rangeBand() - params.viz.border_width;

	  params.viz.rect_height = params.viz.y_scale.rangeBand() - params.viz.border_width / params.viz.zoom_switch;

	  return params;
		};

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var apply_zoom = __webpack_require__(29);

	module.exports = function zoomed(params) {

	  var zoom_info = {};
	  zoom_info.zoom_x = d3.event.scale;
	  zoom_info.zoom_y = d3.event.scale;
	  zoom_info.trans_x = d3.event.translate[0] - params.viz.clust.margin.left;
	  zoom_info.trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

	  apply_zoom(params, zoom_info);
		};

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var run_transformation = __webpack_require__(30);
	var zoom_rules_y = __webpack_require__(39);
	var zoom_rules_x = __webpack_require__(40);

	module.exports = function apply_zoom(params, zoom_info) {

	  d3.selectAll('.tile_tip').style('display', 'none');

	  zoom_info = zoom_rules_y(params, zoom_info);

	  zoom_info = zoom_rules_x(params, zoom_info);

	  run_transformation(params, zoom_info);
		};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var constrain_font_size = __webpack_require__(31);
	var zooming_has_stopped = __webpack_require__(33);
	var show_visible_area = __webpack_require__(36);
	var resize_label_val_bars = __webpack_require__(38);
	var num_visible_labels = __webpack_require__(34);

	module.exports = function run_transformation(params, zoom_info) {

	  // apply transformation and reset translate vector
	  // translate clustergram
	  d3.select(params.root + ' .clust_group').attr('transform', 'translate(' + [zoom_info.trans_x, zoom_info.trans_y] + ') scale(' + zoom_info.zoom_x + ',' + zoom_info.zoom_y + ')');

	  // labels
	  /////////////////////////////
	  d3.select(params.root + ' .row_label_zoom_container').attr('transform', 'translate(' + [0, zoom_info.trans_y] + ') scale(' + zoom_info.zoom_y + ')');

	  // move down col labels as zooming occurs, subtract trans_x - 20 almost works
	  d3.select(params.root + ' .col_zoom_container').attr('transform', 'translate(' + [zoom_info.trans_x, 0] + ') scale(' + zoom_info.zoom_x + ')');

	  d3.select(params.root + ' .row_cat_container').attr('transform', 'translate(' + [0, zoom_info.trans_y] + ') scale( 1,' + zoom_info.zoom_y + ')');

	  d3.select(params.root + ' .row_dendro_container').attr('transform', 'translate(' + [params.viz.uni_margin / 2, zoom_info.trans_y] + ') ' + 'scale( 1,' + zoom_info.zoom_y + ')');

	  // transform col_class
	  d3.select(params.root + ' .col_cat_container').attr('transform', 'translate(' + [zoom_info.trans_x, 0] + ') scale(' + zoom_info.zoom_x + ',1)');

	  d3.select(params.root + ' .col_dendro_container').attr('transform', 'translate(' + [zoom_info.trans_x, params.viz.uni_margin / 2] + ') scale(' + zoom_info.zoom_x + ',1)');

	  // reset translate vector - add back margins to trans_x and trans_y
	  params.zoom_behavior.translate([zoom_info.trans_x + params.viz.clust.margin.left, zoom_info.trans_y + params.viz.clust.margin.top]);

	  constrain_font_size(params);

	  resize_label_val_bars(params, zoom_info);

	  d3.select(params.root + ' .viz_svg').attr('is_zoom', function () {
	    var inst_zoom = Number(d3.select(params.root + ' .viz_svg').attr('is_zoom'));
	    d3.select(params.root + ' .viz_svg').attr('stopped_zoom', 1);
	    return inst_zoom + 1;
	  });

	  var not_zooming = function not_zooming() {

	    d3.select(params.root + ' .viz_svg').attr('is_zoom', function () {
	      var inst_zoom = Number(d3.select(params.root + ' .viz_svg').attr('is_zoom'));
	      return inst_zoom - 1;
	    });
	  };

	  setTimeout(not_zooming, 100);

	  setTimeout(zooming_has_stopped, 1000, params);

	  _.each(['row', 'col'], function (inst_rc) {

	    var inst_num_visible = num_visible_labels(params, inst_rc);

	    if (inst_num_visible > 250) {

	      d3.selectAll(params.root + ' .' + inst_rc + '_label_group').select('text').style('display', 'none');

	      d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').select('path').style('display', 'none');

	      d3.selectAll('.horz_lines').select('line').style('display', 'none');
	      d3.selectAll('.vert_lines').select('line').style('display', 'none');
	    } else {

	      if (inst_num_visible > 40) {

	        var calc_show_char = d3.scale.linear().domain([1, 500]).range([3, 1]).clamp(true);

	        var num_show_char = Math.floor(calc_show_char(inst_num_visible));

	        d3.selectAll(params.root + ' .' + inst_rc + '_label_group').select('text').style('opacity', 0.5).text(function (d) {
	          return d.name.substring(0, num_show_char) + '..';
	        });
	      }
	    }
	  });

	  // // experimental tile display toggling
	  // var inst_zoom = Number(d3.select(params.root+' .viz_svg').attr('is_zoom'));

	  // if (inst_zoom == 1){
	  //   d3.selectAll(params.root+' .hide_tile')
	  //     .style('display', 'none');
	  // }

	  show_visible_area(params, zoom_info);
		};

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_real_font_size = __webpack_require__(32);

	module.exports = function constrain_font_size(params) {

	  var tmp_font_size = params.labels.default_fs_row;
	  var inst_zoom;

	  var real_font_size = calc_real_font_size(params);

	  // rows
	  ////////////////////////////////////
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

	  // columns
	  //////////////////////////////////////

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
		};

/***/ },
/* 32 */
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
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var num_visible_labels = __webpack_require__(34);
	var trim_text = __webpack_require__(35);
	var constrain_font_size = __webpack_require__(31);

	module.exports = function zooming_has_stopped(params) {

	  var inst_zoom = Number(d3.select(params.root + ' .viz_svg').attr('is_zoom'));

	  _.each(['row', 'col'], function (inst_rc) {

	    d3.selectAll(params.root + ' .' + inst_rc + '_label_group').select('text').style('opacity', 1);

	    d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').select('path').style('display', 'block');
	  });

	  if (inst_zoom === 0) {

	    var check_stop = Number(d3.select(params.root + ' .viz_svg').attr('stopped_zoom'));

	    if (check_stop != 0) {

	      // // experimental tile display toggling
	      // d3.selectAll(params.root+' .hide_tile')
	      //   .style('display','block');

	      d3.selectAll(params.root + ' .row_label_group').select('text').style('display', 'none');
	      d3.selectAll(params.root + ' .row_label_group').select('text').style('display', 'block');

	      d3.select(params.root + ' .viz_svg').attr('stopped_zoom', 0);

	      d3.selectAll(params.root + ' .row_label_group').select('text').style('display', 'block');
	      d3.selectAll(params.root + ' .col_label_group').select('text').style('display', 'block');

	      d3.selectAll(params.root + ' .horz_lines').select('line').style('display', 'block');
	      d3.selectAll(params.root + ' .vert_lines').select('line').style('display', 'block');

	      _.each(['row', 'col'], function (inst_rc) {

	        var inst_num_visible = num_visible_labels(params, inst_rc);

	        if (inst_num_visible < 125) {
	          d3.selectAll(params.root + ' .' + inst_rc + '_label_group').each(function () {
	            trim_text(params, this, inst_rc);
	          });
	        }
	      });

	      text_patch();

	      constrain_font_size(params);
	    }

	    // this makes sure that the text is visible after zooming and trimming
	    // there is buggy behavior in chrome when zooming into large matrices
	    // I'm running it twice in quick succession
	    setTimeout(text_patch, 25);
	    setTimeout(text_patch, 100);
	    // setTimeout( text_patch, 2000 );
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
/* 34 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function num_visible_labels(params, inst_rc) {

	  var group_name;
	  if (inst_rc === 'row') {
	    group_name = 'group';
	  } else if (inst_rc === 'col') {
	    group_name = 'text';
	  }

	  var num_visible = d3.selectAll(params.root + ' .' + inst_rc + '_label_' + group_name).filter(function () {
	    return d3.select(this).style('display') != 'none';
	  })[0].length;

	  return num_visible;
		};

/***/ },
/* 35 */
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
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toggle_element_display = __webpack_require__(37);

	module.exports = function show_visible_area(params, zoom_info) {

	  var vis_area = {};

	  // get translation vector absolute values
	  vis_area.min_x = Math.abs(zoom_info.trans_x) / zoom_info.zoom_x - 3 * params.viz.rect_width;
	  vis_area.min_y = Math.abs(zoom_info.trans_y) / zoom_info.zoom_y - 3 * params.viz.rect_height;

	  vis_area.max_x = Math.abs(zoom_info.trans_x) / zoom_info.zoom_x + params.viz.clust.dim.width / zoom_info.zoom_x;
	  vis_area.max_y = Math.abs(zoom_info.trans_y) / zoom_info.zoom_y + params.viz.clust.dim.height / zoom_info.zoom_y;

	  // toggle labels and rows
	  ///////////////////////////////////////////////
	  d3.selectAll(params.root + ' .row_label_group').each(function () {
	    toggle_element_display(vis_area, this, 'row');
	  });

	  d3.selectAll(params.root + ' .row').each(function () {
	    toggle_element_display(vis_area, this, 'row');
	  });

	  // toggle col labels
	  d3.selectAll(params.root + ' .col_label_text').each(function () {
	    toggle_element_display(vis_area, this, 'col');
	  });

	  return vis_area;
		};

/***/ },
/* 37 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function toggle_element_display(vis_area, inst_selection, inst_rc) {

	  var inst_trans = d3.select(inst_selection).attr('transform');

	  if (inst_rc === 'row') {

	    var y_trans = Number(inst_trans.split(',')[1].split(')')[0]);

	    d3.select(inst_selection).style('display', function () {
	      var inst_display;
	      if (y_trans < vis_area.max_y && y_trans > vis_area.min_y) {
	        inst_display = 'block';
	      } else {
	        inst_display = 'none';
	      }
	      return inst_display;
	    });
	  } else {

	    var x_trans = Number(inst_trans.split('(')[1].split(',')[0].split(')')[0]);

	    d3.select(inst_selection).style('display', function () {
	      var inst_display;
	      if (x_trans < vis_area.max_x && x_trans > vis_area.min_x) {
	        inst_display = 'block';
	      } else {
	        inst_display = 'none';
	      }

	      return inst_display;
	    });
	  }
		};

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);

	module.exports = function resize_label_val_bars(params, zoom_info) {

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
/* 39 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function zoom_rules_y(params, zoom_info) {

	  // zoom in the x direction before zooming in the y direction
	  if (params.viz.zoom_switch_y > 1) {
	    if (zoom_info.zoom_y < params.viz.zoom_switch_y) {
	      zoom_info.trans_y = 0;
	      zoom_info.zoom_y = 1;
	    } else {
	      zoom_info.zoom_y = zoom_info.zoom_y / params.viz.zoom_switch_y;
	    }
	  }

	  // calculate panning room available in the y direction
	  zoom_info.pan_room_y = (zoom_info.zoom_y - 1) * params.viz.clust.dim.height;

	  // no positive panning or panning more than pan_room
	  if (zoom_info.trans_y >= 0) {
	    zoom_info.trans_y = 0;
	  } else if (zoom_info.trans_y <= -zoom_info.pan_room_y) {
	    zoom_info.trans_y = -zoom_info.pan_room_y;
	  }

	  return zoom_info;
		};

/***/ },
/* 40 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function zoom_rules_x(params, zoom_info) {

	  // zoom in the y direction before zooming in the x direction
	  if (params.viz.zoom_switch > 1) {
	    if (zoom_info.zoom_x < params.viz.zoom_switch) {
	      zoom_info.trans_x = 0;
	      zoom_info.zoom_x = 1;
	    } else {
	      zoom_info.zoom_x = zoom_info.zoom_x / params.viz.zoom_switch;
	    }
	  }

	  // calculate panning room available in the x direction
	  zoom_info.pan_room_x = (zoom_info.zoom_x - 1) * params.viz.clust.dim.width;

	  // no positive panning or panning more than pan_room
	  if (zoom_info.trans_x > 0) {
	    zoom_info.trans_x = 0;
	  } else if (zoom_info.trans_x <= -zoom_info.pan_room_x) {
	    zoom_info.trans_x = -zoom_info.pan_room_x;
	  }

	  return zoom_info;
		};

/***/ },
/* 41 */
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
/* 42 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function ini_sidebar_params(params) {
	  var sidebar = {};

	  sidebar.wrapper = {};
	  sidebar.wrapper.width = 170;

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
	  sidebar.text.width = params.sidebar_width - 15;

	  sidebar.icons = params.sidebar_icons;
	  sidebar.icon_margin_left = -5;

	  return sidebar;
		};

/***/ },
/* 43 */
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
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var generate_matrix = __webpack_require__(45);
	var make_rows = __webpack_require__(54);
	var make_cols = __webpack_require__(69);
	var generate_super_labels = __webpack_require__(72);
	var spillover = __webpack_require__(73);
	var search = __webpack_require__(77);
	var initialize_resizing = __webpack_require__(80);
	var ini_doubleclick = __webpack_require__(82);
	var make_col_cat = __webpack_require__(100);
	var make_row_cat = __webpack_require__(103);
	var trim_text = __webpack_require__(35);
	var make_row_dendro = __webpack_require__(104);
	var make_col_dendro = __webpack_require__(105);

	module.exports = function make_viz(params) {

	  d3.select(params.viz.viz_wrapper + ' svg').remove();

	  var svg_group = d3.select(params.viz.viz_wrapper).append('svg').attr('class', 'viz_svg').attr('id', 'svg_' + params.root.replace('#', '')).attr('width', params.viz.svg_dim.width).attr('height', params.viz.svg_dim.height).attr('is_zoom', 0).attr('stopped_zoom', 1);

	  svg_group.append('rect').attr('class', 'super_background').style('width', params.viz.svg_dim.width).style('height', params.viz.svg_dim.height).style('fill', 'white');

	  generate_matrix(params, svg_group);

	  var delay_text = 0;
	  make_rows(params, delay_text);

	  if (params.viz.show_dendrogram) {
	    make_row_dendro(params);
	    make_col_dendro(params);
	  }

	  make_cols(params, delay_text);

	  _.each(['row', 'col'], function (inst_rc) {

	    var inst_fs = Number(d3.select('.' + inst_rc + '_label_group').select('text').style('font-size').replace('px', ''));

	    var min_trim_fs = 8;
	    if (inst_fs > min_trim_fs) {
	      d3.selectAll(params.root + ' .' + inst_rc + '_label_group').each(function () {
	        trim_text(params, this, inst_rc);
	      });
	    }
	  });

	  // make category colorbars
	  make_row_cat(params);
	  if (params.viz.show_categories.col) {
	    make_col_cat(params);
	  }

	  spillover(params);

	  if (params.labels.super_labels) {
	    generate_super_labels(params);
	  }

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

	  initialize_resizing(params);

	  ini_doubleclick(params);

	  if (params.viz.do_zoom) {
	    d3.select(params.viz.zoom_element)
	    // d3.select(params.root+' .clust_container')
	    .call(params.zoom_behavior);
	  }

	  d3.select(params.viz.zoom_element)
	  // d3.select(params.root+' .clust_container')
	  .on('dblclick.zoom', null);

	  search(params, params.network_data.row_nodes, 'name');

	  // var opacity_slider = function (inst_slider) {

	  //   // var max_link = params.matrix.max_link;
	  //   var slider_scale = d3.scale
	  //     .linear()
	  //     .domain([0, 1])
	  //     .range([1, 0.1]);

	  //   var slider_factor = slider_scale(inst_slider);

	  //   if (params.matrix.opacity_function === 'linear') {
	  //     params.matrix.opacity_scale = d3.scale.linear()
	  //       .domain([0, slider_factor * Math.abs(params.matrix.max_link)])
	  //       .clamp(true)
	  //       .range([0.0, 1.0]);
	  //   } else if (params.matrix.opacity_function === 'log') {
	  //     params.matrix.opacity_scale = d3.scale.log()
	  //       .domain([0.0001, slider_factor * Math.abs(params.matrix.max_link)])
	  //       .clamp(true)
	  //       .range([0.0, 1.0]);
	  //   }

	  //   d3.selectAll(params.root+' .tile')
	  //     .style('fill-opacity', function (d) {
	  //       return params.matrix.opacity_scale(Math.abs(d.value));
	  //     });

	  // };

	  // function reset_zoom(inst_scale) {
	  //   two_translate_zoom(params, 0, 0, inst_scale);
	  // }
		};

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var draw_gridlines = __webpack_require__(46);
	var add_click_hlight = __webpack_require__(47);
	var make_simple_rows = __webpack_require__(48);
	var d3_tip_custom = __webpack_require__(53);

	module.exports = function (params, svg_elem) {
	  var network_data = params.network_data;

	  var matrix = [],
	      row_nodes = network_data.row_nodes,
	      col_nodes = network_data.col_nodes,
	      clust_group;

	  var row_nodes_names = utils.pluck(row_nodes, 'name');

	  // append a group that will hold clust_group and position it once
	  clust_group = svg_elem.append('g').attr('class', 'clust_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.clust.margin.top + ')').append('g').attr('class', 'clust_group').classed('clust_group', true);

	  // d3-tooltip - for tiles
	  var tip = d3_tip_custom().attr('class', 'd3-tip tile_tip').direction('nw').offset([0, 0]).html(function (d) {
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

	  // clustergram background rect
	  clust_group.append('rect').classed('background', true).classed('grey_background', true).style('fill', '#eee').style('opacity', 0.25).attr('width', params.viz.clust.dim.width).attr('height', params.viz.clust.dim.height);

	  // make row matrix - add key names to rows in matrix
	  clust_group.selectAll('.row').data(params.matrix.matrix, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'row').attr('transform', function (d) {
	    var tmp_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
	  }).each(function (d) {
	    make_simple_rows(params, d, tip, this);
	  });

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
	  draw_gridlines(params, row_nodes, col_nodes);

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
/* 46 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params, row_nodes, col_nodes) {

	  var row_nodes_names = params.network_data.row_nodes_names;
	  var col_nodes_names = params.network_data.col_nodes_names;

	  d3.selectAll(params.root + ' .horz_lines').remove();

	  d3.selectAll(params.root + ' .vert_lines').remove();

	  // append horizontal lines
	  d3.select(params.root + ' .clust_group').selectAll('.horz_lines').data(row_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'horz_lines').attr('transform', function (d) {
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ') rotate(0)';
	  }).append('line').attr('x1', 0).attr('x2', params.viz.clust.dim.width).style('stroke-width', function () {
	    var inst_width;
	    if (params.viz.zoom_switch > 1) {
	      inst_width = params.viz.border_width / params.viz.zoom_switch;
	    } else {
	      inst_width = params.viz.border_width;
	    }
	    return inst_width + 'px';
	  }).style('stroke', 'white');

	  // append vertical line groups
	  d3.select(params.root + ' .clust_group').selectAll('.vert_lines').data(col_nodes).enter().append('g').attr('class', 'vert_lines').attr('transform', function (d) {
	    var inst_index = _.indexOf(col_nodes_names, d.name);
	    return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	  }).append('line').attr('x1', 0).attr('x2', -params.viz.clust.dim.height).style('stroke-width', function () {
	    var inst_width;
	    if (params.viz.zoom_switch_y > 1) {
	      inst_width = params.viz.border_width / params.viz.zoom_switch_y;
	    } else {
	      inst_width = params.viz.border_width;
	    }
	    return inst_width + 'px';
	  }).style('stroke', 'white');
		};

/***/ },
/* 47 */
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

	      var hlight_width = rel_width_hlight * params.viz.border_width;
	      var hlight_height = rel_width_hlight * params.viz.border_width / params.viz.zoom_switch;

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
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var draw_up_tile = __webpack_require__(49);
	var draw_dn_tile = __webpack_require__(50);
	var mouseover_tile = __webpack_require__(51);
	var mouseout_tile = __webpack_require__(52);

	module.exports = function make_simple_rows(params, ini_inp_row_data, tip, row_selection) {

	  var inp_row_data = ini_inp_row_data.row_data;

	  // value: remove zero values to make visualization faster
	  var row_values = _.filter(inp_row_data, function (num) {
	    return num.value !== 0;
	  });

	  // generate tiles in the current row
	  var tile = d3.select(row_selection).selectAll('rect').data(row_values, function (d) {
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
	  }).on('mouseout', function () {
	    mouseout_tile(params, this, tip);
	  }).style('fill-opacity', function (d) {
	    // calculate output opacity using the opacity scale
	    var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
	    return output_opacity;
	  }).attr('transform', function (d) {
	    var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	    var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	    return 'translate(' + x_pos + ',' + y_pos + ')';
	  });

	  // // tile circles
	  // /////////////////////////////
	  // var tile = d3.select(row_selection)
	  //   .selectAll('circle')
	  //   .data(row_values, function(d){ return d.col_name; })
	  //   .enter()
	  //   .append('circle')
	  //   .attr('cx', params.viz.rect_height/4)
	  //   .attr('cy', params.viz.rect_height/4)
	  //   .attr('r', params.viz.rect_height/4)
	  //   .attr('class', 'tile_circle')
	  //   // .attr('width', params.viz.rect_width/2)
	  //   // .attr('height', params.viz.rect_height/2)
	  //   // // switch the color based on up/dn value
	  //   // .style('fill', function(d) {
	  //   //   // return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
	  //   //   return 'black';
	  //   // })
	  //   // .on('mouseover', function(...args) {
	  //   //     mouseover_tile(params, this, tip, args);
	  //   // })
	  //   // .on('mouseout', function() {
	  //   //   mouseout_tile(params, this, tip);
	  //   // })
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
	  //     var x_pos = params.viz.x_scale(d.pos_x) + 0.5*params.viz.border_width + params.viz.rect_width/4;
	  //     var y_pos = 0.5*params.viz.border_width/params.viz.zoom_switch + params.viz.rect_height/4;
	  //     return 'translate(' + x_pos + ','+y_pos+')';
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
	      var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	      var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	      return 'translate(' + x_pos + ',' + y_pos + ')';
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
	      var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	      var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	      return 'translate(' + x_pos + ',' + y_pos + ')';
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
/* 49 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function draw_up_tile(params) {

	  var start_x = 0;
	  var final_x = params.viz.x_scale.rangeBand() - params.viz.border_width / params.viz.zoom_switch_y;
	  var start_y = 0;
	  var final_y = params.viz.y_scale.rangeBand() - params.viz.border_width / params.viz.zoom_switch;

	  var output_string = 'M' + start_x + ',' + start_y + ', L' + start_x + ', ' + final_y + ', L' + final_x + ',0 Z';

	  return output_string;
		};

/***/ },
/* 50 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function draw_dn_tile(params) {

	  var start_x = 0;
	  var final_x = params.viz.x_scale.rangeBand() - params.viz.border_width / params.viz.zoom_switch_y;
	  var start_y = params.viz.y_scale.rangeBand() - params.viz.border_width / params.viz.zoom_switch;
	  var final_y = params.viz.y_scale.rangeBand() - params.viz.border_width / params.viz.zoom_switch;

	  var output_string = 'M' + start_x + ', ' + start_y + ' ,   L' + final_x + ', ' + final_y + ',  L' + final_x + ',0 Z';

	  return output_string;
		};

/***/ },
/* 51 */
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

	        if (params.matrix.show_tile_tooltips) {
	          d3.selectAll('.d3-tip').style('display', 'block');
	          tip.show.apply(inst_selection, args);
	        }
	      }
	    }
	  }
		};

/***/ },
/* 52 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function mouseout_tile(params, inst_selection, tip) {

	  d3.select(inst_selection).classed('hovering', false);

	  _.each(['row', 'col'], function (inst_rc) {

	    d3.selectAll(params.root + ' .' + inst_rc + '_label_group text').style('font-weight', 'normal');
	  });

	  tip.hide();
		};

/***/ },
/* 53 */
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

	    nodel.html(content).style({ opacity: 1, 'pointer-events': 'all' });

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
	        setTimeout(fade_tips, 10000, this);
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
	    se: direction_se
	  }),
	      directions = direction_callbacks.keys();

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
	      d3.selectAll('.d3-tip').transition().duration(250).style('opacity', 0);
	    }
	  }

	  function isFunction(functionToCheck) {
	    var getType = {};
	    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	  }

	  return tip;
		};

/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var add_row_click_hlight = __webpack_require__(55);
	var row_reorder = __webpack_require__(56);
	var col_reorder = __webpack_require__(67);
	var make_row_tooltips = __webpack_require__(68);

	module.exports = function (params, text_delay) {
	  var row_nodes = params.network_data.row_nodes;

	  var row_nodes_names = params.network_data.row_nodes_names;
	  var row_container;

	  // row container holds all row text and row visualizations (triangles rects)
	  if (d3.select(params.viz.viz_svg + ' .row_container').empty()) {
	    row_container = d3.select(params.viz.viz_svg).append('g').attr('class', 'row_container').attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' + params.viz.clust.margin.top + ')');
	  } else {
	    row_container = d3.select(params.viz.viz_svg).select('.row_container').attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' + params.viz.clust.margin.top + ')');
	  }

	  if (d3.select(params.root + ' .row_white_background').empty()) {
	    row_container.append('rect').classed('row_white_background', true).classed('white_bars', true).attr('fill', params.viz.background_color).attr('width', params.viz.label_background.row).attr('height', 30 * params.viz.clust.dim.height + 'px');
	  }

	  if (d3.select(params.root + ' .row_label_container').empty()) {
	    // container to hold text row labels
	    row_container.append('g').attr('class', 'row_label_container').attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)').append('g').attr('class', 'row_label_zoom_container');
	  } else {
	    // container to hold text row labels
	    row_container.select(params.root + ' .row_label_container').attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)');
	  }

	  var row_labels = d3.select(params.root + ' .row_label_zoom_container').selectAll('g').data(row_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'row_label_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	  });

	  d3.select(params.root + ' .row_label_zoom_container').selectAll('.row_label_group').on('dblclick', function (d) {

	    var data_attr = '__data__';
	    var row_name = this[data_attr].name;

	    if (params.sim_mat) {
	      row_reorder(params, this, row_name);

	      var col_selection = d3.selectAll(params.root + ' .col_label_text').filter(function (d) {
	        return d.name == row_name;
	      })[0][0];

	      col_reorder(params, col_selection, row_name);
	    } else {
	      row_reorder(params, this, row_name);
	    }
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

	  if (utils.has(params.network_data.row_nodes[0], 'value')) {

	    row_labels.append('rect').attr('class', 'row_bars').attr('width', function (d) {
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

	  // add row callback function
	  d3.selectAll(params.root + ' .row_label_group').on('click', function (d) {
	    if (typeof params.click_label == 'function') {
	      params.click_label(d.name, 'row');
	      add_row_click_hlight(params, this, d.ini);
	    } else {
	      if (params.tile_click_hlight) {
	        add_row_click_hlight(params, this, d.ini);
	      }
	    }
	  });
		};

/***/ },
/* 55 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params, clicked_row, id_clicked_row) {
	  if (id_clicked_row != params.click_hlight_row) {

	    var rel_width_hlight = 6;
	    var opacity_hlight = 0.85;
	    // var hlight_width  = rel_width_hlight*params.viz.border_width;
	    var hlight_height = rel_width_hlight * params.viz.border_width / params.viz.zoom_switch;

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
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var reposition_tile_highlight = __webpack_require__(57);
	var toggle_dendro_view = __webpack_require__(58);
	var show_visible_area = __webpack_require__(36);

	module.exports = function row_reorder(params, row_selection, inst_row) {

	  params.viz.inst_order.row = 'custom';
	  toggle_dendro_view(params, 'col');

	  d3.selectAll(params.root + ' .col_dendro_group').style('opacity', 0);

	  d3.selectAll(params.root + ' .toggle_col_order .btn').classed('active', false);

	  // // get inst row (gene)
	  // var inst_row = d3.select(row_selection).select('text').text();

	  params.viz.run_trans = true;

	  var mat = params.matrix.matrix;
	  var row_nodes = params.network_data.row_nodes;
	  var col_nodes = params.network_data.col_nodes;

	  var col_nodes_names = utils.pluck(col_nodes, 'name');

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

	  // resort cols
	  params.viz.x_scale.domain(tmp_sort);

	  var t;

	  // reorder matrix
	  ////////////////////
	  if (params.network_data.links.length > params.matrix.def_large_matrix) {

	    // define the t variable as the transition function
	    t = d3.select(params.root + ' .clust_group');

	    // Move Col Labels
	    d3.select(params.root + ' .col_zoom_container').selectAll('.col_label_text').attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ')rotate(-90)';
	    });

	    // reorder col_class groups
	    d3.selectAll(params.root + ' .col_cat_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });
	  } else {

	    // define the t variable as the transition function
	    t = d3.select(params.root + ' .clust_group').transition().duration(2500);

	    // Move Col Labels
	    d3.select(params.root + ' .col_zoom_container').selectAll('.col_label_text').transition().duration(2500).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ')rotate(-90)';
	    });

	    // reorder col_class groups
	    d3.selectAll(params.root + ' .col_cat_group').transition().duration(2500).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });
	  }

	  // reorder matrix
	  t.selectAll('.tile').attr('transform', function (d) {
	    return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
	  });

	  t.selectAll('.tile_up').attr('transform', function (d) {
	    return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
	  });

	  t.selectAll('.tile_dn').attr('transform', function (d) {
	    return 'translate(' + params.viz.x_scale(d.pos_x) + ',0)';
	  });

	  // highlight selected column
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

	  // reset visible area
	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;
	  show_visible_area(params, zoom_info);

	  setTimeout(function () {
	    params.viz.run_trans = false;
	  }, 2500);
		};

/***/ },
/* 57 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (params) {

	  // resize click hlight
	  var rel_width_hlight = 6;
	  // var opacity_hlight = 0.85;

	  var hlight_width = rel_width_hlight * params.viz.border_width;
	  var hlight_height = rel_width_hlight * params.viz.border_width / params.viz.zoom_switch;
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
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_dendro_triangles = __webpack_require__(59);
	var make_col_dendro_triangles = __webpack_require__(65);

	module.exports = function toggle_dendro_view(params, row_col) {
	  var wait_time = arguments.length <= 2 || arguments[2] === undefined ? 1500 : arguments[2];


	  // row and col are reversed
	  if (row_col === 'row') {
	    if (params.viz.inst_order.col === 'clust') {
	      // the last true tells the viz that I'm chaning group size and not to
	      // delay the change in dendro
	      setTimeout(make_row_dendro_triangles, wait_time, params, true);
	    }
	  }

	  if (row_col === 'col') {
	    if (params.viz.inst_order.row === 'clust') {
	      setTimeout(make_col_dendro_triangles, wait_time, params, true);
	    }
	  }

	  if (params.viz.inst_order.row != 'clust') {
	    d3.selectAll(params.root + ' .col_dendro_group').style('opacity', 0).on('mouseover', null).on('mouseout', null);
	  }

	  if (params.viz.inst_order.col != 'clust') {
	    d3.selectAll(params.root + ' .row_dendro_group').style('opacity', 0).on('mouseover', null).on('mouseout', null);
	  }
		};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_row_dendro_triangles = __webpack_require__(60);
	var dendro_group_highlight = __webpack_require__(61);
	var dendro_mouseover = __webpack_require__(63);
	var dendro_mouseout = __webpack_require__(64);

	module.exports = function make_row_dendro_triangles(params) {
	  var is_change_group = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


	  var dendro_info = calc_row_dendro_triangles(params);

	  var run_transition;
	  if (d3.selectAll(params.root + ' .row_dendro_group').empty()) {
	    run_transition = false;
	  } else {
	    run_transition = true;
	    d3.selectAll(params.root + ' .row_dendro_group').remove();
	  }

	  if (is_change_group) {
	    run_transition = false;
	  }

	  d3.select(params.root + ' .row_dendro_container').selectAll('path').data(dendro_info, function (d) {
	    return d.name;
	  }).enter().append('path').style('opacity', 0).attr('class', 'row_dendro_group').attr('d', function (d) {

	    // up triangle
	    var start_x = 0;
	    var start_y = d.pos_top;

	    var mid_x = 30;
	    var mid_y = d.pos_mid;

	    var final_x = 0;
	    var final_y = d.pos_bot;

	    var output_string = 'M' + start_x + ',' + start_y + ', L' + mid_x + ', ' + mid_y + ', L' + final_x + ',' + final_y + ' Z';

	    return output_string;
	  }).style('fill', 'black').on('mouseover', function (d) {
	    var inst_rc;
	    if (params.sim_mat) {
	      inst_rc = 'both';
	    } else {
	      inst_rc = 'row';
	    }
	    dendro_mouseover(this);
	    dendro_group_highlight(params, this, d, inst_rc);
	  }).on('mouseout', function () {
	    if (params.viz.inst_order.col === 'clust') {
	      d3.select(this).style('opacity', params.viz.dendro_opacity);
	    }
	    d3.selectAll(params.root + ' .dendro_shadow').remove();
	    dendro_mouseout(this);
	  }).on('click', function (d) {
	    d3.select(params.root + ' .dendro_info').select('.modal-title').html('Rows in Group');

	    $(params.root + ' .dendro_info .current_names').val(d.all_names.join(', '));

	    $(params.root + ' .dendro_info').modal('toggle');
	  });

	  var triangle_opacity;
	  if (params.viz.inst_order.col === 'clust') {
	    triangle_opacity = params.viz.dendro_opacity;
	  } else {
	    triangle_opacity = 0;
	  }

	  if (run_transition) {

	    d3.select(params.root + ' .row_dendro_container').selectAll('path').transition().delay(1000).duration(1000).style('opacity', triangle_opacity);
	  } else {

	    d3.select(params.root + ' .row_dendro_container').selectAll('path').style('opacity', triangle_opacity);
	  }
		};

/***/ },
/* 60 */
/***/ function(module, exports) {

	"use strict";

	module.exports = function calc_row_dendro_triangles(params) {

	  var triangle_info = {};
	  var inst_level = params.group_level.row;
	  var row_nodes = params.network_data.row_nodes;
	  var row_nodes_names = params.network_data.row_nodes_names;

	  _.each(row_nodes, function (d) {

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
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var dendro_shade_bars = __webpack_require__(62);
	module.exports = function dendro_group_highlight(params, inst_selection, inst_data, inst_rc) {

	  var wait_before_make_shade = 200;

	  setTimeout(still_hovering, wait_before_make_shade);

	  function still_hovering() {
	    if (d3.select(inst_selection).classed('hovering')) {
	      make_shade_bars();
	    }
	  }

	  function make_shade_bars() {

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
/* 62 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function dendro_shade_bars(params, inst_selection, inst_rc, inst_data) {

	  var inst_opacity = 0.2;
	  var select_opacity = 0.7;
	  var bot_height;

	  if (inst_rc == 'row') {

	    d3.select(inst_selection).style('opacity', select_opacity);

	    // top shade
	    d3.select(params.root + ' .clust_group').append('rect').style('width', params.viz.clust.dim.width + 'px').style('height', inst_data.pos_top + 'px').style('fill', 'black').style('opacity', inst_opacity).classed('dendro_shadow', true);

	    bot_height = params.viz.clust.dim.height - inst_data.pos_bot;
	    // bottom shade
	    d3.select(params.root + ' .clust_group').append('rect').style('width', params.viz.clust.dim.width + 'px').style('height', bot_height + 'px').attr('transform', 'translate(0,' + inst_data.pos_bot + ')').style('fill', 'black').style('opacity', inst_opacity).classed('dendro_shadow', true);
	  } else if (inst_rc === 'col') {

	    d3.select(inst_selection).style('opacity', select_opacity);

	    // top shade
	    d3.select(params.root + ' .clust_group').append('rect').style('width', inst_data.pos_top + 'px').style('height', params.viz.clust.dim.height + 'px').style('fill', 'black').style('opacity', inst_opacity).classed('dendro_shadow', true);

	    // bottom shade
	    bot_height = params.viz.clust.dim.width - inst_data.pos_bot;
	    d3.select(params.root + ' .clust_group').append('rect').style('width', bot_height + 'px').style('height', params.viz.clust.dim.height + 'px').attr('transform', 'translate(' + inst_data.pos_bot + ',0)').style('fill', 'black').style('opacity', inst_opacity).classed('dendro_shadow', true);
	  }
		};

/***/ },
/* 63 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function dendro_mouseover(inst_selection) {
	  d3.select(inst_selection).classed('hovering', true);
		};

/***/ },
/* 64 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function dendro_mouseout(inst_selection) {
	  d3.select(inst_selection).classed('hovering', false);
		};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_col_dendro_triangles = __webpack_require__(66);
	var dendro_group_highlight = __webpack_require__(61);
	var dendro_mouseover = __webpack_require__(63);
	var dendro_mouseout = __webpack_require__(64);

	module.exports = function make_col_dendro_triangles(params) {
	  var is_change_group = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


	  var dendro_info = calc_col_dendro_triangles(params);

	  var run_transition;
	  if (d3.selectAll(params.root + ' .col_dendro_group').empty()) {
	    run_transition = false;
	  } else {
	    run_transition = true;
	    d3.selectAll(params.root + ' .col_dendro_group').remove();
	  }

	  if (is_change_group) {
	    run_transition = false;
	  }

	  d3.select(params.root + ' .col_dendro_container').selectAll('path').data(dendro_info, function (d) {
	    return d.name;
	  }).enter().append('path').style('opacity', 0).attr('class', 'col_dendro_group').attr('d', function (d) {

	    // up triangle
	    var start_x = d.pos_top;
	    var start_y = 0;

	    var mid_x = d.pos_mid;
	    var mid_y = 30;

	    var final_x = d.pos_bot;
	    var final_y = 0;

	    var output_string = 'M' + start_x + ',' + start_y + ', L' + mid_x + ', ' + mid_y + ', L' + final_x + ',' + final_y + ' Z';

	    return output_string;
	  }).style('fill', 'black').on('mouseover', function (d) {
	    var inst_rc;
	    if (params.sim_mat) {
	      inst_rc = 'both';
	    } else {
	      inst_rc = 'col';
	    }
	    dendro_mouseover(this);
	    dendro_group_highlight(params, this, d, inst_rc);
	  }).on('mouseout', function () {
	    if (params.viz.inst_order.col === 'clust') {
	      d3.select(this).style('opacity', params.viz.dendro_opacity);
	    }
	    d3.selectAll(params.root + ' .dendro_shadow').remove();
	    dendro_mouseout(this);
	  }).on('click', function (d) {

	    d3.select(params.root + ' .dendro_info').select('.modal-title').html('Columns in Group');

	    $(params.root + ' .dendro_info .current_names').val(d.all_names.join(', '));

	    $(params.root + ' .dendro_info').modal('toggle');
	  });

	  var triangle_opacity;

	  if (params.viz.inst_order.row === 'clust') {
	    triangle_opacity = params.viz.dendro_opacity;
	  } else {
	    triangle_opacity = 0;
	  }

	  if (run_transition) {

	    d3.select(params.root + ' .col_dendro_container').selectAll('path').transition().delay(1000).duration(1000).style('opacity', triangle_opacity);
	  } else {

	    d3.select(params.root + ' .col_dendro_container').selectAll('path').style('opacity', triangle_opacity);
	  }
		};

/***/ },
/* 66 */
/***/ function(module, exports) {

	"use strict";

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
/* 67 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var reposition_tile_highlight = __webpack_require__(57);
	var toggle_dendro_view = __webpack_require__(58);
	var show_visible_area = __webpack_require__(36);

	module.exports = function col_reorder(params, col_selection, inst_term) {

	  params.viz.inst_order.col = 'custom';
	  toggle_dendro_view(params, 'col');

	  d3.selectAll(params.root + ' .row_dendro_group').style('opacity', 0);

	  d3.selectAll(params.root + ' .toggle_row_order .btn').classed('active', false);

	  params.viz.run_trans = true;

	  var mat = params.matrix.matrix;
	  var row_nodes = params.network_data.row_nodes;
	  var col_nodes = params.network_data.col_nodes;

	  var row_nodes_names = utils.pluck(row_nodes, 'name');

	  // // get inst col (term)
	  // var inst_term = d3.select(col_selection).select('text').attr('full_name');

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

	  // resort cols
	  ////////////////////////////
	  params.viz.y_scale.domain(tmp_sort);

	  var t;

	  // reorder
	  if (params.network_data.links.length > params.matrix.def_large_matrix) {
	    t = d3.select(params.root + ' .clust_group');

	    // reorder row_label_triangle groups
	    d3.selectAll(params.root + ' .row_cat_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // Move Row Labels
	    d3.select(params.root + ' .row_label_zoom_container').selectAll('.row_label_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });
	  } else {

	    t = d3.select(params.root + ' .clust_group').transition().duration(2500);

	    // reorder row_label_triangle groups
	    d3.selectAll(params.root + ' .row_cat_group').transition().duration(2500).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // Move Row Labels
	    d3.select(params.root + ' .row_label_zoom_container').selectAll('.row_label_group').transition().duration(2500).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });
	  }

	  // reorder matrix rows
	  t.selectAll('.row').attr('transform', function (d) {
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	  });

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

	  // reset visible area
	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;
	  show_visible_area(params, zoom_info);

	  setTimeout(function () {
	    params.viz.run_trans = false;
	  }, 2500);
		};

/***/ },
/* 68 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d3_tip_custom = __webpack_require__(53);

	module.exports = function make_tooltips(params) {

	  if (params.labels.show_label_tooltips) {

	    // d3-tooltip
	    var row_tip = d3_tip_custom().attr('class', 'd3-tip').direction('e').offset([0, 10]).html(function (d) {
	      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
	      return "<span>" + inst_name + "</span>";
	    });

	    d3.select(params.viz.viz_wrapper).select(params.root + ' .row_container').call(row_tip);

	    d3.select(params.root + ' .row_label_zoom_container').selectAll('g').on('mouseover', function (d) {

	      d3.selectAll('.d3-tip').style('opacity', 0);

	      d3.select(this).select('text').classed('active', true);

	      row_tip.show(d);
	    }).on('mouseout', function mouseout(d) {
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
	var col_reorder = __webpack_require__(67);
	var row_reorder = __webpack_require__(56);
	var make_col_tooltips = __webpack_require__(71);

	module.exports = function (params, text_delay) {

	  var col_container;

	  var col_nodes = params.network_data.col_nodes;
	  var col_nodes_names = params.network_data.col_nodes_names;

	  // offset click group column label
	  var x_offset_click = params.viz.x_scale.rangeBand() / 2 + params.viz.border_width;
	  // reduce width of rotated rects
	  var reduce_rect_width = params.viz.x_scale.rangeBand() * 0.36;

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
	    var inst_index = _.indexOf(col_nodes_names, d.name);
	    return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
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
	  .attr('y', params.viz.x_scale.rangeBand() * 0.64).attr('dx', params.viz.border_width).attr('text-anchor', 'start').attr('full_name', function (d) {
	    return d.name;
	  })
	  // original font size
	  .style('font-size', params.labels.default_fs_col + 'px').style('cursor', 'default').text(function (d) {
	    return utils.normal_name(d);
	  })
	  // .attr('pointer-events','none')
	  .style('opacity', 0).transition().delay(text_delay).duration(text_delay).style('opacity', 1);

	  make_col_tooltips(params);

	  // this is interferring with text tooltip
	  //////////////////////////////////////////
	  // // append rectangle behind text
	  // col_label_group
	  //   .insert('rect')
	  //   .attr('class','.highlight_rect')
	  //   .attr('x', 0)
	  //   .attr('y', 0)
	  //   .attr('width', 10*params.viz.rect_height)
	  //   .attr('height', 0.67*params.viz.rect_width)
	  //   .style('opacity', 0);

	  // add triangle under rotated labels
	  col_label_group.append('path').style('stroke-width', 0).attr('d', function () {
	    // x and y are flipped since its rotated
	    var origin_y = -params.viz.border_width;
	    var start_x = 0;
	    var final_x = params.viz.x_scale.rangeBand() - reduce_rect_width;
	    var start_y = -(params.viz.x_scale.rangeBand() - reduce_rect_width + params.viz.border_width);
	    var final_y = -params.viz.border_width;
	    var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' + start_x + ', L ' + final_y + ',' + final_x + ' Z';
	    return output_string;
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
	      col_reorder(params, this, col_name);

	      var row_selection = d3.selectAll(params.root + ' .row_label_group').filter(function (d) {
	        return d.name == col_name;
	      })[0][0];

	      row_reorder(params, row_selection, col_name);
	    } else {
	      col_reorder(params, this, col_name);
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
	    var hlight_width = rel_width_hlight * params.viz.border_width;
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

	var d3_tip_custom = __webpack_require__(53);

	module.exports = function make_col_tooltips(params) {

	  if (params.labels.show_label_tooltips) {

	    // d3-tooltip
	    var col_tip = d3_tip_custom().attr('class', 'd3-tip').direction('w').offset([20, 0]).style('display', 'block').html(function (d) {
	      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
	      return "<span>" + inst_name + "</span>";
	    });

	    d3.select(params.viz.viz_wrapper).select('svg').select(params.root + ' .col_zoom_container').selectAll('.col_label_group').select('text').call(col_tip);

	    d3.select(params.root + ' .col_zoom_container')
	    // .selectAll('.col_label_text')
	    .selectAll('.col_label_group')
	    // .selectAll('text')
	    .on('mouseover', col_tip.show).on('mouseout', function () {
	      col_tip.hide(this);
	    });
	  }
		};

/***/ },
/* 72 */
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
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_title = __webpack_require__(74);
	var ini_cat_reorder = __webpack_require__(75);

	module.exports = function Spillover(params) {

	  var viz = params.viz;

	  // hide spillover from slanted column labels on right side
	  d3.select(viz.root + ' .col_container').append('path').style('stroke-width', '0').attr('d', 'M 0,0 L 1000,-1000, L 1000,0 Z').attr('fill', viz.background_color) //!! prog_colors
	  .attr('class', 'right_slant_triangle').attr('transform', 'translate(' + viz.clust.dim.width + ',' + viz.norm_labels.width.col + ')');

	  // hide spillover from slanted column labels on left side
	  d3.select(viz.root + ' .col_container').append('path').style('stroke-width', '0').attr('d', 'M 0,0 L 500,-500, L 0,-500 Z').attr('fill', viz.background_color).attr('class', 'left_slant_triangle')
	  // shift left by 1 px to prevent cutting off labels
	  .attr('transform', 'translate(-1,' + viz.norm_labels.width.col + ')');

	  // white rect to cover excess labels
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color) //!! prog_colors
	  .attr('width', viz.clust.margin.left).attr('height', viz.clust.margin.top).attr('class', 'top_left_white');

	  var tmp_left = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin + viz.dendro_room.row;
	  var tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

	  // hide spillover from right
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color) //!! prog_colors
	  .attr('width', 10 * viz.clust.dim.width).attr('height', viz.svg_dim.height + 'px').attr('transform', function () {
	    return 'translate(' + tmp_left + ',' + tmp_top + ')';
	  }).attr('class', 'white_bars').attr('class', 'right_spillover');

	  // hide spillover from top of row dendrogram
	  var x_offset = viz.clust.margin.left + viz.clust.dim.width;
	  var y_offset = tmp_top;
	  var tmp_width = viz.dendro_room.row + viz.uni_margin;
	  var tmp_height = viz.cat_room.col + viz.uni_margin;
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color).attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  }).classed('white_bars', true).classed('dendro_row_spillover', true);

	  // hide spillover left top of col dendrogram
	  x_offset = 0;
	  y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  tmp_width = viz.clust.margin.left;
	  tmp_height = viz.clust.dim.height * 10;
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color).attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  }).classed('white_bars', true).classed('dendro_col_spillover', true);

	  x_offset = viz.clust.margin.left + viz.clust.dim.width;
	  y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  tmp_width = viz.cat_room.col + viz.clust.dim.width;
	  tmp_height = viz.cat_room.row + viz.uni_margin;
	  d3.select(viz.viz_svg).append('rect').attr('fill', viz.background_color).attr('width', tmp_width).attr('height', tmp_height).attr('transform', function () {
	    return 'translate(' + x_offset + ',' + y_offset + ')';
	  }).classed('white_bars', true).classed('dendro_corner_spillover', true);

	  x_offset = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin;
	  y_offset = viz.norm_labels.margin.top + viz.norm_labels.width.col + 2.5 * viz.uni_margin;
	  var cat_text_size = 1.15 * viz.cat_room.symbol_width;
	  var cat_super_opacity = 0.65;
	  var extra_x_room = 2.75;
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
	  if (viz.show_categories.row) {
	    var row_cat_label_container = d3.select(viz.viz_svg).append('g').classed('row_cat_label_container', true).attr('transform', function () {
	      x_offset = viz.norm_labels.margin.left + viz.norm_labels.width.row + viz.cat_room.symbol_width + extra_x_room * viz.uni_margin;
	      y_offset = viz.clust.margin.top - viz.uni_margin;
	      return 'translate(' + x_offset + ',' + y_offset + ') rotate(-90)';
	    });

	    if (viz.sim_mat === false) {

	      row_cat_label_container.selectAll().data(viz.all_cats.row).enter().append('text').classed('row_cat_super', true).style('font-size', cat_text_size + 'px').style('opacity', cat_super_opacity).style('cursor', 'default').attr('transform', function (d) {
	        var inst_y = extra_y_room * viz.cat_room.symbol_width * parseInt(d.split('-')[1], 10);
	        return 'translate(0,' + inst_y + ')';
	      }).text(function (d) {
	        return get_cat_title(viz, d, 'row');
	      });
	    }
	  }

	  // white border bottom - prevent clustergram from hitting border
	  if (viz.show_dendrogram) {
	    y_offset = viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col;
	  } else {
	    y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  }
	  d3.select(viz.viz_svg).append('rect').attr('class', 'bottom_spillover').attr('fill', viz.background_color) //!! prog_colors
	  .attr('width', viz.svg_dim.width)
	  // make this border twice the width of the grey border
	  .attr('height', 2 * viz.svg_dim.height).attr('transform', function () {
	    // shift up enough to show the entire border width
	    var inst_offset = y_offset;
	    return 'translate(0,' + inst_offset + ')';
	  });

	  ini_cat_reorder(params);
		};

/***/ },
/* 74 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function get_cat_title(viz, inst_cat, inst_rc) {
	  var cat_title;

	  // make default title if none is given
	  if (viz.cat_names[inst_rc][inst_cat] === inst_cat) {
	    var inst_num = parseInt(inst_cat.split('-')[1], 10) + 1;
	    cat_title = 'Category ' + inst_num;
	  } else {
	    cat_title = viz.cat_names[inst_rc][inst_cat];
	  }

	  return cat_title;
		};

/***/ },
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var all_reorder = __webpack_require__(76);

	module.exports = function ini_cat_reorder(params) {
	  /* eslint-disable */

	  _.each(['row', 'col'], function (inst_rc) {

	    if (params.viz.show_categories[inst_rc]) {
	      d3.selectAll(params.root + ' .' + inst_rc + '_cat_super').on('dblclick', function () {

	        if (params.sim_mat) {
	          inst_rc = 'both';
	        }

	        d3.selectAll(params.root + ' .toggle_' + inst_rc + '_order .btn').classed('active', false);

	        var order_id = this.__data__.replace('-', '_') + '_index';
	        if (params.viz.sim_mat) {
	          all_reorder(params, order_id, 'row');
	          all_reorder(params, order_id, 'col');
	        } else {
	          all_reorder(params, order_id, inst_rc);
	        }
	      });
	    }
	  });
		};

/***/ },
/* 76 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var toggle_dendro_view = __webpack_require__(58);
	var show_visible_area = __webpack_require__(36);

	module.exports = function (params, inst_order, tmp_row_col) {

	  // row/col names are swapped, will improve later
	  var row_col;
	  if (tmp_row_col === 'row') {
	    row_col = 'col';
	  } else if (tmp_row_col === 'col') {
	    row_col = 'row';
	  }

	  params.viz.run_trans = true;

	  // save order state
	  if (row_col === 'row') {
	    params.viz.inst_order.row = inst_order;
	  } else if (row_col === 'col') {
	    params.viz.inst_order.col = inst_order;
	  }

	  if (params.viz.show_dendrogram) {
	    toggle_dendro_view(params, tmp_row_col);
	  }

	  var row_nodes_obj = params.network_data.row_nodes;
	  var row_nodes_names = utils.pluck(row_nodes_obj, 'name');

	  var col_nodes_obj = params.network_data.col_nodes;
	  var col_nodes_names = utils.pluck(col_nodes_obj, 'name');

	  if (row_col === 'row') {

	    params.viz.x_scale.domain(params.matrix.orders[params.viz.inst_order.row + '_row']);
	  } else if (row_col == 'col') {

	    params.viz.y_scale.domain(params.matrix.orders[params.viz.inst_order.col + '_col']);
	  }

	  var t;

	  // only animate transition if there are a small number of tiles
	  if (d3.selectAll(params.root + ' .tile')[0].length < params.matrix.def_large_matrix) {

	    // define the t variable as the transition function
	    t = d3.select(params.root + ' .clust_group').transition().duration(2500);

	    t.selectAll('.row').attr('transform', function (d) {
	      var tmp_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
	    });

	    t.selectAll('.row').selectAll('.tile').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });

	    t.selectAll('.row').selectAll('.tile_circle').attr('transform', function (d) {
	      var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width + params.viz.rect_width / 4;
	      var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch + params.viz.rect_height / 4;
	      return 'translate(' + x_pos + ' , ' + y_pos + ')';
	    });

	    t.selectAll('.tile_up').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });

	    t.selectAll('.tile_dn').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });

	    // Move Row Labels
	    d3.select(params.root + ' .row_label_zoom_container').selectAll('.row_label_group').transition().duration(2500).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // t.selectAll('.column')
	    d3.select(params.root + ' .col_zoom_container').selectAll('.col_label_text').transition().duration(2500).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	    });

	    // reorder row_label_triangle groups
	    d3.selectAll(params.root + ' .row_cat_group').transition().duration(2500).attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // reorder col_class groups
	    d3.selectAll(params.root + ' .col_cat_group').transition().duration(2500).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });
	  } else {

	    // define the t variable as the transition function
	    t = d3.select(params.root + ' .clust_group');

	    // reorder matrix
	    t.selectAll('.row').attr('transform', function (d) {
	      var tmp_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
	    }).selectAll('.tile').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });

	    t.selectAll('.tile_up').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });

	    t.selectAll('.tile_dn').attr('transform', function (d) {
	      return 'translate(' + params.viz.x_scale(d.pos_x) + ' , 0)';
	    });

	    // Move Row Labels
	    d3.select(params.root + ' .row_label_zoom_container').selectAll('.row_label_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // t.selectAll('.column')
	    d3.select(params.root + ' .col_zoom_container').selectAll('.col_label_text').attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	    });

	    // reorder row_label_triangle groups
	    d3.selectAll(params.root + ' .row_cat_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // reorder col_class groups
	    d3.selectAll(params.root + ' .col_cat_group').attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });
	  }

	  // redefine x and y positions
	  params.network_data.links.forEach(function (d) {
	    d.x = params.viz.x_scale(d.target);
	    d.y = params.viz.y_scale(d.source);
	  });

	  // reset visible area
	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;
	  show_visible_area(params, zoom_info);

	  setTimeout(function () {
	    params.viz.run_trans = false;
	  }, 2500);
		};

/***/ },
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var two_translate_zoom = __webpack_require__(78);

	/* Handles searching rows or columns.
	 TODO need to generalize to column and row
	 * ----------------------------------------------------------------------- */
	module.exports = function (params, nodes, prop) {

	  /* Collect entities from row or columns.
	   */
	  var entities = [];
	  var i;

	  for (i = 0; i < nodes.length; i++) {
	    entities.push(nodes[i][prop]);
	  }

	  /* Find a gene (row) in the clustergram.
	   */
	  function find_entity(search_term) {

	    if (entities.indexOf(search_term) !== -1) {

	      // unhighlight
	      d3.selectAll(params.root + ' .row_label_group').select('rect').style('opacity', 0);

	      // calc pan_dy
	      var idx = _.indexOf(entities, search_term);
	      var inst_y_pos = params.viz.y_scale(idx);
	      var pan_dy = params.viz.clust.dim.height / 2 - inst_y_pos;

	      two_translate_zoom(params, 0, pan_dy, params.viz.zoom_switch);

	      // highlight
	      d3.selectAll(params.root + ' .row_label_group').filter(function (d) {
	        return d[prop] === search_term;
	      }).select('rect').style('opacity', 1);
	    }
	  }

	  return {
	    find_entity: find_entity,
	    get_entities: entities
	  };
		};

/***/ },
/* 78 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var label_constrain_and_trim = __webpack_require__(79);
	var show_visible_area = __webpack_require__(36);

	module.exports = function two_translate_zoom(params, pan_dx, pan_dy, fin_zoom) {

	  d3.selectAll('.tile_tip').style('display', 'none');

	  // reset visible area
	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;

	  show_visible_area(params, zoom_info);

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

	    // transform col labels
	    d3.select(params.root + ' .col_zoom_container').transition().duration(search_duration).attr('transform', ' scale(' + zoom_x + ',' + zoom_x + ')' + 'translate(' + [pan_dx, 0] + ')');

	    // transform col_class
	    d3.select(params.root + ' .col_cat_container').transition().duration(search_duration).attr('transform', ' scale(' + zoom_x + ',' + 1 + ')' + 'translate(' + [pan_dx, 0] + ')');

	    d3.select(params.root + ' .col_dendro_container').transition().duration(search_duration).attr('transform', ' scale(' + zoom_x + ',' + 1 + ')' + 'translate(' + [pan_dx, params.viz.uni_margin / 2] + ')');

	    // set y translate: center_y is positive, positive moves the visualization down
	    // the translate vector has the initial margin, the first y centering, and pan_dy
	    // times the scaling zoom_y
	    var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

	    // reset the zoom and translate
	    params.zoom_behavior.scale(zoom_y).translate([pan_dx, net_y_offset]);

	    label_constrain_and_trim(params);

	    // re-size of the highlighting rects
	    /////////////////////////////////////////
	    d3.select(params.root + ' .row_label_zoom_container').each(function () {
	      // get the bounding box of the row label text
	      var bbox = d3.select(this).select('text')[0][0].getBBox();

	      // use the bounding box to set the size of the rect
	      d3.select(this).select('rect').attr('x', bbox.x * 0.5).attr('y', 0).attr('width', bbox.width * 0.5).attr('height', params.viz.y_scale.rangeBand()).style('fill', 'yellow');
	    });

	    // column value bars
	    ///////////////////////
	    // reduce the height of the column value bars based on the zoom applied
	    // recalculate the height and divide by the zooming scale
	    // col_label_obj.select('rect')
	    if (utils.has(params.network_data.col_nodes[0], 'value')) {

	      d3.selectAll(params.root + ' .col_bars')
	      // .transition()
	      // .duration(search_duration)
	      .attr('width', function (d) {
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
	  }
		};

/***/ },
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var trim_text = __webpack_require__(35);
	var constrain_font_size = __webpack_require__(31);

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
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resize_viz = __webpack_require__(81);

	module.exports = function (params) {

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
	    setTimeout(resize_viz, wait_time, params);
	  });
	  // }
		};

/***/ },
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// var crossfilter = require('crossfilter');
	var utils = __webpack_require__(2);
	var zoomed = __webpack_require__(28);
	var ini_doubleclick = __webpack_require__(82);
	var reset_zoom = __webpack_require__(83);
	var resize_dendro = __webpack_require__(84);
	var resize_grid_lines = __webpack_require__(85);
	var resize_super_labels = __webpack_require__(86);
	var resize_spillover = __webpack_require__(87);
	var resize_borders = __webpack_require__(88);
	var resize_row_labels = __webpack_require__(89);
	var resize_highlights = __webpack_require__(90);
	var resize_row_viz = __webpack_require__(91);
	var resize_col_labels = __webpack_require__(92);
	var resize_col_text = __webpack_require__(93);
	var resize_col_triangle = __webpack_require__(94);
	var resize_col_hlight = __webpack_require__(95);
	var recalc_params_for_resize = __webpack_require__(96);
	var resize_row_tiles = __webpack_require__(97);
	var resize_label_bars = __webpack_require__(98);
	var label_constrain_and_trim = __webpack_require__(79);
	var make_row_dendro_triangles = __webpack_require__(59);
	var make_col_dendro_triangles = __webpack_require__(65);
	var toggle_dendro_view = __webpack_require__(58);
	var show_visible_area = __webpack_require__(36);
	var calc_viz_dimensions = __webpack_require__(15);
	var position_play_button = __webpack_require__(99);

	module.exports = function (params) {

	  var cont_dim = calc_viz_dimensions(params);

	  d3.select(params.root + ' .play_button');
	  // .style('opacity', 0.2);

	  // reset visible area
	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;

	  show_visible_area(params, zoom_info);

	  d3.select(params.root + ' .sidebar_wrapper').style('height', cont_dim.height + 'px');

	  d3.select(params.viz.viz_wrapper)
	  // .style('float', 'left')
	  .style('margin-top', cont_dim.top + 'px').style('width', cont_dim.width + 'px').style('height', cont_dim.height + 'px');

	  params = recalc_params_for_resize(params);

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
	    zoomed(params);
	  });

	  // reenable zoom after transition
	  if (params.viz.do_zoom) {
	    svg_group.call(params.zoom_behavior);
	  }

	  // prevent normal double click zoom etc
	  ini_doubleclick(params);

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
	    resize_label_bars(params, svg_group);
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
	    make_row_dendro_triangles(params, is_resize);
	    make_col_dendro_triangles(params, is_resize);
	    resize_dendro(params, svg_group);

	    toggle_dendro_view(params, 'row', 0);
	    toggle_dendro_view(params, 'col', 0);
	  }

	  resize_col_labels(params, svg_group);
	  resize_col_text(params, svg_group);
	  resize_col_triangle(params, svg_group);
	  resize_col_hlight(params, svg_group);

	  resize_super_labels(params, svg_group);
	  resize_spillover(params.viz, svg_group);

	  // specific to screen resize
	  resize_grid_lines(params, svg_group);
	  resize_borders(params, svg_group);

	  // reset zoom and translate
	  params.zoom_behavior.scale(1).translate([params.viz.clust.margin.left, params.viz.clust.margin.top]);

	  label_constrain_and_trim(params);

	  d3.select(params.viz.viz_svg).style('opacity', 1);
		};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var two_translate_zoom = __webpack_require__(78);

	module.exports = function (params) {
	  // disable double-click zoom
	  d3.selectAll(params.viz.zoom_element).on('dblclick.zoom', null);

	  d3.select(params.viz.zoom_element).on('dblclick', function () {
	    two_translate_zoom(params, 0, 0, 1);
	  });
		};

/***/ },
/* 83 */
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
		};

/***/ },
/* 84 */
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
		};

/***/ },
/* 85 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_grid_lines(params, svg_group) {

	  var col_nodes_names = params.network_data.col_nodes_names;
	  var row_nodes_names = params.network_data.row_nodes_names;

	  // reposition grid lines
	  svg_group.selectAll('.horz_lines').attr('transform', function (d) {
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ') rotate(0)';
	  });

	  svg_group.selectAll('.horz_lines').select('line').attr('x2', params.viz.clust.dim.width).style('stroke-width', function () {
	    var inst_width;
	    if (params.viz.zoom_switch > 1) {
	      inst_width = params.viz.border_width / params.viz.zoom_switch;
	    } else {
	      inst_width = params.viz.border_width;
	    }
	    return inst_width + 'px';
	  });

	  svg_group.selectAll('.vert_lines').attr('transform', function (d) {
	    var inst_index = _.indexOf(col_nodes_names, d.name);
	    return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	  });

	  svg_group.selectAll('.vert_lines').select('line').attr('x2', -params.viz.clust.dim.height).style('stroke-width', function () {
	    var inst_width;
	    if (params.viz.zoom_switch_y > 1) {
	      inst_width = params.viz.border_width / params.viz.zoom_switch_y;
	    } else {
	      inst_width = params.viz.border_width;
	    }
	    return inst_width + 'px';
	  });
		};

/***/ },
/* 86 */
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
/* 87 */
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

	  svg_group.select(viz.root + ' .top_left_white').attr('width', viz.clust.margin.left).attr('height', viz.clust.margin.top);

	  var tmp_left = viz.clust.margin.left + viz.clust.dim.width + viz.uni_margin + viz.dendro_room.row;
	  var tmp_top = viz.norm_labels.margin.top + viz.norm_labels.width.col;

	  svg_group.select(viz.root + ' .right_spillover').attr('transform', function () {
	    return 'translate(' + tmp_left + ',' + tmp_top + ')';
	  }).attr('height', viz.svg_dim.height + 'px');

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
	    y_offset = viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col;
	  } else {
	    y_offset = viz.clust.margin.top + viz.clust.dim.height;
	  }
	  svg_group.select(viz.root + ' .bottom_spillover').attr('width', viz.svg_dim.width).attr('height', 2 * viz.svg_dim.height).attr('transform', function () {
	    // shift up enough to show the entire border width
	    var inst_offset = y_offset;
	    return 'translate(0,' + inst_offset + ')';
	  });
		};

/***/ },
/* 88 */
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
/* 89 */
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
/* 90 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_highlights(params) {

	  // reposition tile highlight
	  ////////////////////////////////

	  var rel_width_hlight = 6;
	  // var opacity_hlight = 0.85;
	  var hlight_width = rel_width_hlight * params.viz.border_width;
	  var hlight_height = rel_width_hlight * params.viz.border_width / params.viz.zoom_switch;

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
/* 91 */
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
/* 92 */
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
	      return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	    });
	  } else {
	    svg_group = ini_svg_group;

	    ini_svg_group.selectAll('.col_label_text').data(col_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = _.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	    });
	  }

	  // offset click group column label
	  var x_offset_click = params.viz.x_scale.rangeBand() / 2 + params.viz.border_width;

	  svg_group.select(params.root + ' .col_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.norm_labels.margin.top + ')');

	  svg_group.select(params.root + ' .col_container').select('.white_bars').attr('width', 30 * params.viz.clust.dim.width + 'px').attr('height', params.viz.label_background.col);

	  svg_group.select(params.root + ' .col_container').select('.col_label_outer_container').attr('transform', 'translate(0,' + params.viz.norm_labels.width.col + ')');

	  svg_group.selectAll('.col_label_group').attr('transform', 'translate(' + params.viz.x_scale.rangeBand() / 2 + ',' + x_offset_click + ') rotate(45)');

	  svg_group.selectAll('.col_label_group').select('text').attr('y', params.viz.x_scale.rangeBand() * 0.60).attr('dx', 2 * params.viz.border_width);
		};

/***/ },
/* 93 */
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
/* 94 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function resize_col_triangle(params, ini_svg_group) {
	  var delay_info = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];


	  // resize column triangle
	  var ini_triangle_group = ini_svg_group.selectAll('.col_label_group').select('path');

	  var delays = {};
	  var duration = params.viz.duration;

	  // var row_nodes = params.network_data.row_nodes;
	  // var row_nodes_names = params.network_data.row_nodes_names;

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

	  var reduce_rect_width = params.viz.x_scale.rangeBand() * 0.36;

	  triangle_group.attr('d', function () {
	    // x and y are flipped since its rotated
	    var origin_y = -params.viz.border_width;
	    var start_x = 0;
	    var final_x = params.viz.x_scale.rangeBand() - reduce_rect_width;
	    var start_y = -(params.viz.x_scale.rangeBand() - reduce_rect_width + params.viz.border_width);
	    var final_y = -params.viz.border_width;
	    var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' + start_x + ', L ' + final_y + ',' + final_x + ' Z';
	    return output_string;
	  }).attr('fill', '#eee');
		};

/***/ },
/* 95 */
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
/* 96 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_svg_dim = __webpack_require__(18);
	var calc_clust_height = __webpack_require__(17);
	var calc_clust_width = __webpack_require__(16);
	var calc_default_fs = __webpack_require__(23);
	var calc_zoom_switching = __webpack_require__(41);

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

	  // precalc rect_width and height
	  params.viz.rect_width = params.viz.x_scale.rangeBand();
	  params.viz.rect_height = params.viz.y_scale.rangeBand();

	  // redefine zoom extent
	  params.viz.real_zoom = params.viz.norm_labels.width.col / (params.viz.rect_width / 2);

	  // redefine border width
	  params.viz.border_width = params.viz.rect_width / 55;

	  // the default font sizes are set here
	  params = calc_default_fs(params);

	  return params;
		};

/***/ },
/* 97 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var draw_up_tile = __webpack_require__(49);
	var draw_dn_tile = __webpack_require__(50);

	module.exports = function resize_row_tiles(params, svg_group) {

	  var row_nodes = params.network_data.row_nodes;
	  var row_nodes_names = utils.pluck(row_nodes, 'name');

	  svg_group.selectAll('.row').attr('transform', function (d) {
	    var tmp_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
	  });

	  // reset tiles
	  svg_group.selectAll('.row').selectAll('.tile').attr('transform', function (d) {
	    var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	    var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	    return 'translate(' + x_pos + ',' + y_pos + ')';
	  }).attr('width', params.viz.rect_width).attr('height', params.viz.rect_height);

	  // reset tile_up
	  svg_group.selectAll('.row').selectAll('.tile_up').attr('d', function () {
	    return draw_up_tile(params);
	  }).attr('transform', function (d) {
	    var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	    var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	    return 'translate(' + x_pos + ',' + y_pos + ')';
	  });

	  svg_group.selectAll('.row').selectAll('.tile_dn').attr('d', function () {
	    return draw_dn_tile(params);
	  }).attr('transform', function (d) {
	    var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	    var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	    return 'translate(' + x_pos + ',' + y_pos + ')';
	  });
		};

/***/ },
/* 98 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_val_max = __webpack_require__(26);

	module.exports = function resize_label_bars(params, svg_group) {

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
/* 99 */
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
/* 100 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cat_tooltip_text = __webpack_require__(101);
	var d3_tip_custom = __webpack_require__(53);
	var reset_cat_opacity = __webpack_require__(102);

	module.exports = function make_col_cat(params) {

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

	  // d3-tooltip
	  var cat_tip = d3_tip_custom().attr('class', 'd3-tip').direction('s').offset([5, 0]).style('display', 'block').html(function (d) {
	    return cat_tooltip_text(params, d, this, 'col');
	  });

	  // append groups - each will hold classification rects
	  d3.select(params.root + ' .col_cat_container').selectAll('g').data(params.network_data.col_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'col_cat_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(params.network_data.col_nodes_names, d.name);
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
	        });
	      } else {
	        cat_rect = d3.select(inst_selection).select('.' + cat_rect_class);
	      }

	      cat_rect.attr('width', params.viz.x_scale.rangeBand()).attr('height', params.viz.cat_room.symbol_width).style('fill', function (d) {
	        return params.viz.cat_colors.col[inst_cat][d[inst_cat]];
	      }).style('opacity', params.viz.cat_colors.opacity).on('mouseover', cat_tip.show).on('mouseout', function () {

	        cat_tip.hide(this);

	        reset_cat_opacity(params);

	        d3.select(this).classed('hovering', false);
	      });
	    });
	  });
		};

/***/ },
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_title = __webpack_require__(74);
	var utils = __webpack_require__(2);

	module.exports = function cat_tooltip_text(params, inst_data, inst_selection, inst_rc) {

	  // category index
	  var inst_cat = d3.select(inst_selection).attr('cat');
	  var cat_title = get_cat_title(params.viz, inst_cat, inst_rc);
	  var cat_name = inst_data[inst_cat];

	  if (cat_name.indexOf(': ') >= 0) {
	    cat_name = cat_name.split(': ')[1];
	  }

	  var cat_string = cat_title + ': ' + cat_name;

	  var pval_name = inst_cat.replace('-', '_') + '_pval';
	  var inst_pval;
	  if (utils.has(inst_data, pval_name)) {
	    inst_pval = inst_data[inst_cat.replace('-', '_') + '_pval'];
	    // there are three significant digits in the pval
	    inst_pval = inst_pval.toFixed(3);
	    cat_string = cat_string + ' (pval: ' + String(inst_pval) + ')';
	  }

	  d3.select(inst_selection).classed('hovering', true);

	  setTimeout(highlight_categories, 700);

	  return cat_string;

	  function highlight_categories() {

	    if (d3.select(inst_selection).classed('hovering')) {

	      var node_types = [inst_rc];

	      if (params.viz.sim_mat) {
	        node_types = ['row', 'col'];
	      }

	      _.each(node_types, function (tmp_rc) {

	        if (cat_name.indexOf('Not ') < 0) {
	          d3.selectAll(params.root + ' .' + tmp_rc + '_cat_group').selectAll('rect').style('opacity', function (d) {
	            var inst_opacity;
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

	            return inst_opacity;
	          });
	        }
	      });
	    }
	  }
		};

/***/ },
/* 102 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function reset_cat_opacity(params) {

	  _.each(['row', 'col'], function (inst_rc) {
	    d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').selectAll('rect').style('opacity', params.viz.cat_colors.opacity);
	  });
		};

/***/ },
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cat_tooltip_text = __webpack_require__(101);
	var d3_tip_custom = __webpack_require__(53);
	var reset_cat_opacity = __webpack_require__(102);

	module.exports = function make_row_cat(params) {

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
	    d3.select(params.root + ' .row_cat_container').select('class', 'white_bars').attr('fill', params.viz.background_color).attr('width', params.viz.cat_room.row + 'px').attr('height', function () {
	      var inst_height = params.viz.clust.dim.height;
	      return inst_height;
	    });
	  }

	  // d3-tooltip
	  var cat_tip = d3_tip_custom().attr('class', 'd3-tip').direction('e').offset([5, 0]).style('display', 'block').html(function (d) {
	    return cat_tooltip_text(params, d, this, 'row');
	  });

	  // groups that hold classification triangle and colorbar rect
	  var row_cat_group = d3.select(params.root + ' .row_cat_container').selectAll('g').data(params.network_data.row_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'row_cat_group').attr('transform', function (d) {
	    var inst_index = _.indexOf(params.network_data.row_nodes_names, d.name);
	    return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	  });

	  d3.select(params.root + ' .row_cat_container').selectAll('.row_cat_group').call(cat_tip);

	  // add row triangles
	  row_cat_group.append('path').attr('d', function () {
	    var origin_x = params.viz.cat_room.symbol_width - 1;
	    var origin_y = 0;
	    var mid_x = 1;
	    var mid_y = params.viz.y_scale.rangeBand() / 2;
	    var final_x = params.viz.cat_room.symbol_width - 1;
	    var final_y = params.viz.y_scale.rangeBand();
	    var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ', L ' + final_x + ',' + final_y + ' Z';
	    return output_string;
	  }).attr('fill', '#eee').style('opacity', params.viz.triangle_opacity);

	  var cat_rect;
	  var inst_selection;

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
	          var inst_color = params.viz.cat_colors.row[inst_cat][d[inst_cat]];
	          return inst_color;
	        }).attr('x', function () {
	          var inst_offset = params.viz.cat_room.symbol_width + params.viz.uni_margin / 2;
	          return inst_offset + 'px';
	        }).attr('transform', function () {
	          var cat_room = params.viz.cat_room.symbol_width + params.viz.cat_room.separation;
	          var inst_shift = inst_num * cat_room;
	          return 'translate(' + inst_shift + ',0)';
	        }).style('opacity', params.viz.cat_colors.opacity).on('mouseover', cat_tip.show).on('mouseout', function () {

	          cat_tip.hide(this);

	          reset_cat_opacity(params);

	          d3.select(this).classed('hovering', false);
	        });
	      });
	    });
	  }
		};

/***/ },
/* 104 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_dendro_triangles = __webpack_require__(59);

	module.exports = function make_row_dendro(params) {

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

	  make_row_dendro_triangles(params);

	  if (params.viz.inst_order.col != 'clust') {
	    d3.selectAll(params.root + ' .row_dendro_group').remove();
	  }
		};

/***/ },
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_col_dendro_triangles = __webpack_require__(65);

	module.exports = function make_col_dendro(params) {

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

	  make_col_dendro_triangles(params);

	  if (params.viz.inst_order.row != 'clust') {
	    d3.selectAll(params.root + ' .col_dendro_group').remove();
	  }
		};

/***/ },
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* eslint-disable */

	var run_segment = __webpack_require__(107);
	var play_intro = __webpack_require__(108);
	var play_zoom = __webpack_require__(110);
	var play_reset_zoom = __webpack_require__(111);
	var play_reorder_row = __webpack_require__(113);
	var play_reorder_buttons = __webpack_require__(114);
	var play_search = __webpack_require__(116);
	var play_filter = __webpack_require__(117);
	var quick_cluster = __webpack_require__(144);
	var play_groups = __webpack_require__(145);
	var play_categories = __webpack_require__(146);
	var play_conclusion = __webpack_require__(147);
	var toggle_play_button = __webpack_require__(148);
	var play_menu_button = __webpack_require__(149);

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
	    inst_time = run_segment(params, inst_time, play_reset_zoom);
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
/* 107 */
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
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);

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
/* 109 */
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
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var two_translate_zoom = __webpack_require__(78);

	module.exports = function play_zoom() {

	  function run(params) {
	    var text = 'Zoom and pan by\nscrolling and dragging';
	    demo_text(params, text, 4000);

	    setTimeout(two_translate_zoom, 1500, params, 0, 0, 4);
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
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var two_translate_zoom = __webpack_require__(78);
	var sim_click = __webpack_require__(112);

	module.exports = function play_reset_zoom() {

	  function run(params) {

	    var text = 'Reset zoom by double-clicking\n';
	    demo_text(params, text, 4000);

	    setTimeout(sim_click, 2000, params, 'double', 300, 300);
	    setTimeout(two_translate_zoom, 2400, params, 0, 0, 1);
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
/* 112 */
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
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var sim_click = __webpack_require__(112);

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
/* 114 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var highlight_sidebar_element = __webpack_require__(115);

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
/* 115 */
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
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var highlight_sidebar_element = __webpack_require__(115);
	var two_translate_zoom = __webpack_require__(78);

	module.exports = function play_search() {

	  function run(params) {

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

	    setTimeout(two_translate_zoom, 7500, params, 0, 0, 1);
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
/* 117 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var highlight_sidebar_element = __webpack_require__(115);
	var update_network = __webpack_require__(118);

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
	    update_network(cgm, requested_view);

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
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var change_network_view = __webpack_require__(11);
	var disable_sidebar = __webpack_require__(119);

	var update_with_new_network = __webpack_require__(126);

	module.exports = function (cgm, requested_view) {
	  var old_params = cgm.params;
	  var config = cgm.config;

	  disable_sidebar(old_params);

	  // make new_network_data by filtering the original network data
	  var config_copy = jQuery.extend(true, {}, config);

	  var new_network_data = change_network_view(old_params, config_copy.network_data, requested_view);

	  var params = update_with_new_network(config, old_params, new_network_data);

	  cgm.params = params;

	  return params;
		};

/***/ },
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(120);
	module.exports = function disable_sidebar(params) {
	  $(params.root + ' .slider').slider('disable');
	  d3.selectAll(params.root + ' .btn').attr('disabled', true);
	  d3.select(params.viz.viz_svg).style('opacity', 0.70);

	  // d3.selectAll(params.root+' .category_section')
	  // .on('click', '')
	  // .select('text')
	  // .style('opacity',0.5);
		};

/***/ },
/* 120 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var jQuery = __webpack_require__(121);
	__webpack_require__(123);
	__webpack_require__(124);
	__webpack_require__(125);

	/*!
	 * jQuery UI Slider 1.10.4
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/slider/
	 *
	 * Depends:
	 *	jquery.ui.core.js
	 *	jquery.ui.mouse.js
	 *	jquery.ui.widget.js
	 */
	(function ($, undefined) {

		// number of pages in a slider
		// (how many times can you page up/down to go through the whole range)
		var numPages = 5;

		$.widget("ui.slider", $.ui.mouse, {
			version: "1.10.4",
			widgetEventPrefix: "slide",

			options: {
				animate: false,
				distance: 0,
				max: 100,
				min: 0,
				orientation: "horizontal",
				range: false,
				step: 1,
				value: 0,
				values: null,

				// callbacks
				change: null,
				slide: null,
				start: null,
				stop: null
			},

			_create: function _create() {
				this._keySliding = false;
				this._mouseSliding = false;
				this._animateOff = true;
				this._handleIndex = null;
				this._detectOrientation();
				this._mouseInit();

				this.element.addClass("ui-slider" + " ui-slider-" + this.orientation + " ui-widget" + " ui-widget-content" + " ui-corner-all");

				this._refresh();
				this._setOption("disabled", this.options.disabled);

				this._animateOff = false;
			},

			_refresh: function _refresh() {
				this._createRange();
				this._createHandles();
				this._setupEvents();
				this._refreshValue();
			},

			_createHandles: function _createHandles() {
				var i,
				    handleCount,
				    options = this.options,
				    existingHandles = this.element.find(".ui-slider-handle").addClass("ui-state-default ui-corner-all"),
				    handle = "<a class='ui-slider-handle ui-state-default ui-corner-all' href='#'></a>",
				    handles = [];

				handleCount = options.values && options.values.length || 1;

				if (existingHandles.length > handleCount) {
					existingHandles.slice(handleCount).remove();
					existingHandles = existingHandles.slice(0, handleCount);
				}

				for (i = existingHandles.length; i < handleCount; i++) {
					handles.push(handle);
				}

				this.handles = existingHandles.add($(handles.join("")).appendTo(this.element));

				this.handle = this.handles.eq(0);

				this.handles.each(function (i) {
					$(this).data("ui-slider-handle-index", i);
				});
			},

			_createRange: function _createRange() {
				var options = this.options,
				    classes = "";

				if (options.range) {
					if (options.range === true) {
						if (!options.values) {
							options.values = [this._valueMin(), this._valueMin()];
						} else if (options.values.length && options.values.length !== 2) {
							options.values = [options.values[0], options.values[0]];
						} else if ($.isArray(options.values)) {
							options.values = options.values.slice(0);
						}
					}

					if (!this.range || !this.range.length) {
						this.range = $("<div></div>").appendTo(this.element);

						classes = "ui-slider-range" +
						// note: this isn't the most fittingly semantic framework class for this element,
						// but worked best visually with a variety of themes
						" ui-widget-header ui-corner-all";
					} else {
						this.range.removeClass("ui-slider-range-min ui-slider-range-max")
						// Handle range switching from true to min/max
						.css({
							"left": "",
							"bottom": ""
						});
					}

					this.range.addClass(classes + (options.range === "min" || options.range === "max" ? " ui-slider-range-" + options.range : ""));
				} else {
					if (this.range) {
						this.range.remove();
					}
					this.range = null;
				}
			},

			_setupEvents: function _setupEvents() {
				var elements = this.handles.add(this.range).filter("a");
				this._off(elements);
				this._on(elements, this._handleEvents);
				this._hoverable(elements);
				this._focusable(elements);
			},

			_destroy: function _destroy() {
				this.handles.remove();
				if (this.range) {
					this.range.remove();
				}

				this.element.removeClass("ui-slider" + " ui-slider-horizontal" + " ui-slider-vertical" + " ui-widget" + " ui-widget-content" + " ui-corner-all");

				this._mouseDestroy();
			},

			_mouseCapture: function _mouseCapture(event) {
				var position,
				    normValue,
				    distance,
				    closestHandle,
				    index,
				    allowed,
				    offset,
				    mouseOverHandle,
				    that = this,
				    o = this.options;

				if (o.disabled) {
					return false;
				}

				this.elementSize = {
					width: this.element.outerWidth(),
					height: this.element.outerHeight()
				};
				this.elementOffset = this.element.offset();

				position = { x: event.pageX, y: event.pageY };
				normValue = this._normValueFromMouse(position);
				distance = this._valueMax() - this._valueMin() + 1;
				this.handles.each(function (i) {
					var thisDistance = Math.abs(normValue - that.values(i));
					if (distance > thisDistance || distance === thisDistance && (i === that._lastChangedValue || that.values(i) === o.min)) {
						distance = thisDistance;
						closestHandle = $(this);
						index = i;
					}
				});

				allowed = this._start(event, index);
				if (allowed === false) {
					return false;
				}
				this._mouseSliding = true;

				this._handleIndex = index;

				closestHandle.addClass("ui-state-active").focus();

				offset = closestHandle.offset();
				mouseOverHandle = !$(event.target).parents().addBack().is(".ui-slider-handle");
				this._clickOffset = mouseOverHandle ? { left: 0, top: 0 } : {
					left: event.pageX - offset.left - closestHandle.width() / 2,
					top: event.pageY - offset.top - closestHandle.height() / 2 - (parseInt(closestHandle.css("borderTopWidth"), 10) || 0) - (parseInt(closestHandle.css("borderBottomWidth"), 10) || 0) + (parseInt(closestHandle.css("marginTop"), 10) || 0)
				};

				if (!this.handles.hasClass("ui-state-hover")) {
					this._slide(event, index, normValue);
				}
				this._animateOff = true;
				return true;
			},

			_mouseStart: function _mouseStart() {
				return true;
			},

			_mouseDrag: function _mouseDrag(event) {
				var position = { x: event.pageX, y: event.pageY },
				    normValue = this._normValueFromMouse(position);

				this._slide(event, this._handleIndex, normValue);

				return false;
			},

			_mouseStop: function _mouseStop(event) {
				this.handles.removeClass("ui-state-active");
				this._mouseSliding = false;

				this._stop(event, this._handleIndex);
				this._change(event, this._handleIndex);

				this._handleIndex = null;
				this._clickOffset = null;
				this._animateOff = false;

				return false;
			},

			_detectOrientation: function _detectOrientation() {
				this.orientation = this.options.orientation === "vertical" ? "vertical" : "horizontal";
			},

			_normValueFromMouse: function _normValueFromMouse(position) {
				var pixelTotal, pixelMouse, percentMouse, valueTotal, valueMouse;

				if (this.orientation === "horizontal") {
					pixelTotal = this.elementSize.width;
					pixelMouse = position.x - this.elementOffset.left - (this._clickOffset ? this._clickOffset.left : 0);
				} else {
					pixelTotal = this.elementSize.height;
					pixelMouse = position.y - this.elementOffset.top - (this._clickOffset ? this._clickOffset.top : 0);
				}

				percentMouse = pixelMouse / pixelTotal;
				if (percentMouse > 1) {
					percentMouse = 1;
				}
				if (percentMouse < 0) {
					percentMouse = 0;
				}
				if (this.orientation === "vertical") {
					percentMouse = 1 - percentMouse;
				}

				valueTotal = this._valueMax() - this._valueMin();
				valueMouse = this._valueMin() + percentMouse * valueTotal;

				return this._trimAlignValue(valueMouse);
			},

			_start: function _start(event, index) {
				var uiHash = {
					handle: this.handles[index],
					value: this.value()
				};
				if (this.options.values && this.options.values.length) {
					uiHash.value = this.values(index);
					uiHash.values = this.values();
				}
				return this._trigger("start", event, uiHash);
			},

			_slide: function _slide(event, index, newVal) {
				var otherVal, newValues, allowed;

				if (this.options.values && this.options.values.length) {
					otherVal = this.values(index ? 0 : 1);

					if (this.options.values.length === 2 && this.options.range === true && (index === 0 && newVal > otherVal || index === 1 && newVal < otherVal)) {
						newVal = otherVal;
					}

					if (newVal !== this.values(index)) {
						newValues = this.values();
						newValues[index] = newVal;
						// A slide can be canceled by returning false from the slide callback
						allowed = this._trigger("slide", event, {
							handle: this.handles[index],
							value: newVal,
							values: newValues
						});
						otherVal = this.values(index ? 0 : 1);
						if (allowed !== false) {
							this.values(index, newVal);
						}
					}
				} else {
					if (newVal !== this.value()) {
						// A slide can be canceled by returning false from the slide callback
						allowed = this._trigger("slide", event, {
							handle: this.handles[index],
							value: newVal
						});
						if (allowed !== false) {
							this.value(newVal);
						}
					}
				}
			},

			_stop: function _stop(event, index) {
				var uiHash = {
					handle: this.handles[index],
					value: this.value()
				};
				if (this.options.values && this.options.values.length) {
					uiHash.value = this.values(index);
					uiHash.values = this.values();
				}

				this._trigger("stop", event, uiHash);
			},

			_change: function _change(event, index) {
				if (!this._keySliding && !this._mouseSliding) {
					var uiHash = {
						handle: this.handles[index],
						value: this.value()
					};
					if (this.options.values && this.options.values.length) {
						uiHash.value = this.values(index);
						uiHash.values = this.values();
					}

					//store the last changed value index for reference when handles overlap
					this._lastChangedValue = index;

					this._trigger("change", event, uiHash);
				}
			},

			value: function value(newValue) {
				if (arguments.length) {
					this.options.value = this._trimAlignValue(newValue);
					this._refreshValue();
					this._change(null, 0);
					return;
				}

				return this._value();
			},

			values: function values(index, newValue) {
				var vals, newValues, i;

				if (arguments.length > 1) {
					this.options.values[index] = this._trimAlignValue(newValue);
					this._refreshValue();
					this._change(null, index);
					return;
				}

				if (arguments.length) {
					if ($.isArray(arguments[0])) {
						vals = this.options.values;
						newValues = arguments[0];
						for (i = 0; i < vals.length; i += 1) {
							vals[i] = this._trimAlignValue(newValues[i]);
							this._change(null, i);
						}
						this._refreshValue();
					} else {
						if (this.options.values && this.options.values.length) {
							return this._values(index);
						} else {
							return this.value();
						}
					}
				} else {
					return this._values();
				}
			},

			_setOption: function _setOption(key, value) {
				var i,
				    valsLength = 0;

				if (key === "range" && this.options.range === true) {
					if (value === "min") {
						this.options.value = this._values(0);
						this.options.values = null;
					} else if (value === "max") {
						this.options.value = this._values(this.options.values.length - 1);
						this.options.values = null;
					}
				}

				if ($.isArray(this.options.values)) {
					valsLength = this.options.values.length;
				}

				$.Widget.prototype._setOption.apply(this, arguments);

				switch (key) {
					case "orientation":
						this._detectOrientation();
						this.element.removeClass("ui-slider-horizontal ui-slider-vertical").addClass("ui-slider-" + this.orientation);
						this._refreshValue();
						break;
					case "value":
						this._animateOff = true;
						this._refreshValue();
						this._change(null, 0);
						this._animateOff = false;
						break;
					case "values":
						this._animateOff = true;
						this._refreshValue();
						for (i = 0; i < valsLength; i += 1) {
							this._change(null, i);
						}
						this._animateOff = false;
						break;
					case "min":
					case "max":
						this._animateOff = true;
						this._refreshValue();
						this._animateOff = false;
						break;
					case "range":
						this._animateOff = true;
						this._refresh();
						this._animateOff = false;
						break;
				}
			},

			//internal value getter
			// _value() returns value trimmed by min and max, aligned by step
			_value: function _value() {
				var val = this.options.value;
				val = this._trimAlignValue(val);

				return val;
			},

			//internal values getter
			// _values() returns array of values trimmed by min and max, aligned by step
			// _values( index ) returns single value trimmed by min and max, aligned by step
			_values: function _values(index) {
				var val, vals, i;

				if (arguments.length) {
					val = this.options.values[index];
					val = this._trimAlignValue(val);

					return val;
				} else if (this.options.values && this.options.values.length) {
					// .slice() creates a copy of the array
					// this copy gets trimmed by min and max and then returned
					vals = this.options.values.slice();
					for (i = 0; i < vals.length; i += 1) {
						vals[i] = this._trimAlignValue(vals[i]);
					}

					return vals;
				} else {
					return [];
				}
			},

			// returns the step-aligned value that val is closest to, between (inclusive) min and max
			_trimAlignValue: function _trimAlignValue(val) {
				if (val <= this._valueMin()) {
					return this._valueMin();
				}
				if (val >= this._valueMax()) {
					return this._valueMax();
				}
				var step = this.options.step > 0 ? this.options.step : 1,
				    valModStep = (val - this._valueMin()) % step,
				    alignValue = val - valModStep;

				if (Math.abs(valModStep) * 2 >= step) {
					alignValue += valModStep > 0 ? step : -step;
				}

				// Since JavaScript has problems with large floats, round
				// the final value to 5 digits after the decimal point (see #4124)
				return parseFloat(alignValue.toFixed(5));
			},

			_valueMin: function _valueMin() {
				return this.options.min;
			},

			_valueMax: function _valueMax() {
				return this.options.max;
			},

			_refreshValue: function _refreshValue() {
				var lastValPercent,
				    valPercent,
				    value,
				    valueMin,
				    valueMax,
				    oRange = this.options.range,
				    o = this.options,
				    that = this,
				    animate = !this._animateOff ? o.animate : false,
				    _set = {};

				if (this.options.values && this.options.values.length) {
					this.handles.each(function (i) {
						valPercent = (that.values(i) - that._valueMin()) / (that._valueMax() - that._valueMin()) * 100;
						_set[that.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
						$(this).stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);
						if (that.options.range === true) {
							if (that.orientation === "horizontal") {
								if (i === 0) {
									that.range.stop(1, 1)[animate ? "animate" : "css"]({ left: valPercent + "%" }, o.animate);
								}
								if (i === 1) {
									that.range[animate ? "animate" : "css"]({ width: valPercent - lastValPercent + "%" }, { queue: false, duration: o.animate });
								}
							} else {
								if (i === 0) {
									that.range.stop(1, 1)[animate ? "animate" : "css"]({ bottom: valPercent + "%" }, o.animate);
								}
								if (i === 1) {
									that.range[animate ? "animate" : "css"]({ height: valPercent - lastValPercent + "%" }, { queue: false, duration: o.animate });
								}
							}
						}
						lastValPercent = valPercent;
					});
				} else {
					value = this.value();
					valueMin = this._valueMin();
					valueMax = this._valueMax();
					valPercent = valueMax !== valueMin ? (value - valueMin) / (valueMax - valueMin) * 100 : 0;
					_set[this.orientation === "horizontal" ? "left" : "bottom"] = valPercent + "%";
					this.handle.stop(1, 1)[animate ? "animate" : "css"](_set, o.animate);

					if (oRange === "min" && this.orientation === "horizontal") {
						this.range.stop(1, 1)[animate ? "animate" : "css"]({ width: valPercent + "%" }, o.animate);
					}
					if (oRange === "max" && this.orientation === "horizontal") {
						this.range[animate ? "animate" : "css"]({ width: 100 - valPercent + "%" }, { queue: false, duration: o.animate });
					}
					if (oRange === "min" && this.orientation === "vertical") {
						this.range.stop(1, 1)[animate ? "animate" : "css"]({ height: valPercent + "%" }, o.animate);
					}
					if (oRange === "max" && this.orientation === "vertical") {
						this.range[animate ? "animate" : "css"]({ height: 100 - valPercent + "%" }, { queue: false, duration: o.animate });
					}
				}
			},

			_handleEvents: {
				keydown: function keydown(event) {
					var allowed,
					    curVal,
					    newVal,
					    step,
					    index = $(event.target).data("ui-slider-handle-index");

					switch (event.keyCode) {
						case $.ui.keyCode.HOME:
						case $.ui.keyCode.END:
						case $.ui.keyCode.PAGE_UP:
						case $.ui.keyCode.PAGE_DOWN:
						case $.ui.keyCode.UP:
						case $.ui.keyCode.RIGHT:
						case $.ui.keyCode.DOWN:
						case $.ui.keyCode.LEFT:
							event.preventDefault();
							if (!this._keySliding) {
								this._keySliding = true;
								$(event.target).addClass("ui-state-active");
								allowed = this._start(event, index);
								if (allowed === false) {
									return;
								}
							}
							break;
					}

					step = this.options.step;
					if (this.options.values && this.options.values.length) {
						curVal = newVal = this.values(index);
					} else {
						curVal = newVal = this.value();
					}

					switch (event.keyCode) {
						case $.ui.keyCode.HOME:
							newVal = this._valueMin();
							break;
						case $.ui.keyCode.END:
							newVal = this._valueMax();
							break;
						case $.ui.keyCode.PAGE_UP:
							newVal = this._trimAlignValue(curVal + (this._valueMax() - this._valueMin()) / numPages);
							break;
						case $.ui.keyCode.PAGE_DOWN:
							newVal = this._trimAlignValue(curVal - (this._valueMax() - this._valueMin()) / numPages);
							break;
						case $.ui.keyCode.UP:
						case $.ui.keyCode.RIGHT:
							if (curVal === this._valueMax()) {
								return;
							}
							newVal = this._trimAlignValue(curVal + step);
							break;
						case $.ui.keyCode.DOWN:
						case $.ui.keyCode.LEFT:
							if (curVal === this._valueMin()) {
								return;
							}
							newVal = this._trimAlignValue(curVal - step);
							break;
					}

					this._slide(event, index, newVal);
				},
				click: function click(event) {
					event.preventDefault();
				},
				keyup: function keyup(event) {
					var index = $(event.target).data("ui-slider-handle-index");

					if (this._keySliding) {
						this._keySliding = false;
						this._stop(event, index);
						this._change(event, index);
						$(event.target).removeClass("ui-state-active");
					}
				}
			}

		});
		})(jQuery);

/***/ },
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(module) {"use strict";var _typeof=typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"?function(obj){return typeof obj;}:function(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol?"symbol":typeof obj;}; /*!
	 * jQuery JavaScript Library v2.2.3
	 * http://jquery.com/
	 *
	 * Includes Sizzle.js
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2016-04-05T19:26Z
	 */(function(global,factory){if(( false?"undefined":_typeof(module))==="object"&&_typeof(module.exports)==="object"){ // For CommonJS and CommonJS-like environments where a proper `window`
	// is present, execute the factory and get jQuery.
	// For environments that do not have a `window` with a `document`
	// (such as Node.js), expose a factory as module.exports.
	// This accentuates the need for the creation of a real `window`.
	// e.g. var jQuery = require("jquery")(window);
	// See ticket #14549 for more info.
	module.exports=global.document?factory(global,true):function(w){if(!w.document){throw new Error("jQuery requires a window with a document");}return factory(w);};}else {factory(global);} // Pass this if window is not defined yet
	})(typeof window!=="undefined"?window:undefined,function(window,noGlobal){ // Support: Firefox 18+
	// Can't be in strict mode, several libs including ASP.NET trace
	// the stack via arguments.caller.callee and Firefox dies if
	// you try to trace through "use strict" call chains. (#13335)
	//"use strict";
	var arr=[];var document=window.document;var _slice=arr.slice;var concat=arr.concat;var push=arr.push;var indexOf=arr.indexOf;var class2type={};var toString=class2type.toString;var hasOwn=class2type.hasOwnProperty;var support={};var version="2.2.3", // Define a local copy of jQuery
	jQuery=function jQuery(selector,context){ // The jQuery object is actually just the init constructor 'enhanced'
	// Need init if jQuery is called (just allow error to be thrown if not included)
	return new jQuery.fn.init(selector,context);}, // Support: Android<4.1
	// Make sure we trim BOM and NBSP
	rtrim=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, // Matches dashed string for camelizing
	rmsPrefix=/^-ms-/,rdashAlpha=/-([\da-z])/gi, // Used by jQuery.camelCase as callback to replace()
	fcamelCase=function fcamelCase(all,letter){return letter.toUpperCase();};jQuery.fn=jQuery.prototype={ // The current version of jQuery being used
	jquery:version,constructor:jQuery, // Start with an empty selector
	selector:"", // The default length of a jQuery object is 0
	length:0,toArray:function toArray(){return _slice.call(this);}, // Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get:function get(num){return num!=null? // Return just the one element from the set
	num<0?this[num+this.length]:this[num]: // Return all the elements in a clean array
	_slice.call(this);}, // Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack:function pushStack(elems){ // Build a new jQuery matched element set
	var ret=jQuery.merge(this.constructor(),elems); // Add the old object onto the stack (as a reference)
	ret.prevObject=this;ret.context=this.context; // Return the newly-formed element set
	return ret;}, // Execute a callback for every element in the matched set.
	each:function each(callback){return jQuery.each(this,callback);},map:function map(callback){return this.pushStack(jQuery.map(this,function(elem,i){return callback.call(elem,i,elem);}));},slice:function slice(){return this.pushStack(_slice.apply(this,arguments));},first:function first(){return this.eq(0);},last:function last(){return this.eq(-1);},eq:function eq(i){var len=this.length,j=+i+(i<0?len:0);return this.pushStack(j>=0&&j<len?[this[j]]:[]);},end:function end(){return this.prevObject||this.constructor();}, // For internal use only.
	// Behaves like an Array's method, not like a jQuery method.
	push:push,sort:arr.sort,splice:arr.splice};jQuery.extend=jQuery.fn.extend=function(){var options,name,src,copy,copyIsArray,clone,target=arguments[0]||{},i=1,length=arguments.length,deep=false; // Handle a deep copy situation
	if(typeof target==="boolean"){deep=target; // Skip the boolean and the target
	target=arguments[i]||{};i++;} // Handle case when target is a string or something (possible in deep copy)
	if((typeof target==="undefined"?"undefined":_typeof(target))!=="object"&&!jQuery.isFunction(target)){target={};} // Extend jQuery itself if only one argument is passed
	if(i===length){target=this;i--;}for(;i<length;i++){ // Only deal with non-null/undefined values
	if((options=arguments[i])!=null){ // Extend the base object
	for(name in options){src=target[name];copy=options[name]; // Prevent never-ending loop
	if(target===copy){continue;} // Recurse if we're merging plain objects or arrays
	if(deep&&copy&&(jQuery.isPlainObject(copy)||(copyIsArray=jQuery.isArray(copy)))){if(copyIsArray){copyIsArray=false;clone=src&&jQuery.isArray(src)?src:[];}else {clone=src&&jQuery.isPlainObject(src)?src:{};} // Never move original objects, clone them
	target[name]=jQuery.extend(deep,clone,copy); // Don't bring in undefined values
	}else if(copy!==undefined){target[name]=copy;}}}} // Return the modified object
	return target;};jQuery.extend({ // Unique for each copy of jQuery on the page
	expando:"jQuery"+(version+Math.random()).replace(/\D/g,""), // Assume jQuery is ready without the ready module
	isReady:true,error:function error(msg){throw new Error(msg);},noop:function noop(){},isFunction:function isFunction(obj){return jQuery.type(obj)==="function";},isArray:Array.isArray,isWindow:function isWindow(obj){return obj!=null&&obj===obj.window;},isNumeric:function isNumeric(obj){ // parseFloat NaNs numeric-cast false positives (null|true|false|"")
	// ...but misinterprets leading-number strings, particularly hex literals ("0x...")
	// subtraction forces infinities to NaN
	// adding 1 corrects loss of precision from parseFloat (#15100)
	var realStringObj=obj&&obj.toString();return !jQuery.isArray(obj)&&realStringObj-parseFloat(realStringObj)+1>=0;},isPlainObject:function isPlainObject(obj){var key; // Not plain objects:
	// - Any object or value whose internal [[Class]] property is not "[object Object]"
	// - DOM nodes
	// - window
	if(jQuery.type(obj)!=="object"||obj.nodeType||jQuery.isWindow(obj)){return false;} // Not own constructor property must be Object
	if(obj.constructor&&!hasOwn.call(obj,"constructor")&&!hasOwn.call(obj.constructor.prototype||{},"isPrototypeOf")){return false;} // Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own
	for(key in obj){}return key===undefined||hasOwn.call(obj,key);},isEmptyObject:function isEmptyObject(obj){var name;for(name in obj){return false;}return true;},type:function type(obj){if(obj==null){return obj+"";} // Support: Android<4.0, iOS<6 (functionish RegExp)
	return (typeof obj==="undefined"?"undefined":_typeof(obj))==="object"||typeof obj==="function"?class2type[toString.call(obj)]||"object":typeof obj==="undefined"?"undefined":_typeof(obj);}, // Evaluates a script in a global context
	globalEval:function globalEval(code){var script,indirect=eval;code=jQuery.trim(code);if(code){ // If the code includes a valid, prologue position
	// strict mode pragma, execute code by injecting a
	// script tag into the document.
	if(code.indexOf("use strict")===1){script=document.createElement("script");script.text=code;document.head.appendChild(script).parentNode.removeChild(script);}else { // Otherwise, avoid the DOM node creation, insertion
	// and removal by using an indirect global eval
	indirect(code);}}}, // Convert dashed to camelCase; used by the css and data modules
	// Support: IE9-11+
	// Microsoft forgot to hump their vendor prefix (#9572)
	camelCase:function camelCase(string){return string.replace(rmsPrefix,"ms-").replace(rdashAlpha,fcamelCase);},nodeName:function nodeName(elem,name){return elem.nodeName&&elem.nodeName.toLowerCase()===name.toLowerCase();},each:function each(obj,callback){var length,i=0;if(isArrayLike(obj)){length=obj.length;for(;i<length;i++){if(callback.call(obj[i],i,obj[i])===false){break;}}}else {for(i in obj){if(callback.call(obj[i],i,obj[i])===false){break;}}}return obj;}, // Support: Android<4.1
	trim:function trim(text){return text==null?"":(text+"").replace(rtrim,"");}, // results is for internal usage only
	makeArray:function makeArray(arr,results){var ret=results||[];if(arr!=null){if(isArrayLike(Object(arr))){jQuery.merge(ret,typeof arr==="string"?[arr]:arr);}else {push.call(ret,arr);}}return ret;},inArray:function inArray(elem,arr,i){return arr==null?-1:indexOf.call(arr,elem,i);},merge:function merge(first,second){var len=+second.length,j=0,i=first.length;for(;j<len;j++){first[i++]=second[j];}first.length=i;return first;},grep:function grep(elems,callback,invert){var callbackInverse,matches=[],i=0,length=elems.length,callbackExpect=!invert; // Go through the array, only saving the items
	// that pass the validator function
	for(;i<length;i++){callbackInverse=!callback(elems[i],i);if(callbackInverse!==callbackExpect){matches.push(elems[i]);}}return matches;}, // arg is for internal usage only
	map:function map(elems,callback,arg){var length,value,i=0,ret=[]; // Go through the array, translating each of the items to their new values
	if(isArrayLike(elems)){length=elems.length;for(;i<length;i++){value=callback(elems[i],i,arg);if(value!=null){ret.push(value);}} // Go through every key on the object,
	}else {for(i in elems){value=callback(elems[i],i,arg);if(value!=null){ret.push(value);}}} // Flatten any nested arrays
	return concat.apply([],ret);}, // A global GUID counter for objects
	guid:1, // Bind a function to a context, optionally partially applying any
	// arguments.
	proxy:function proxy(fn,context){var tmp,args,proxy;if(typeof context==="string"){tmp=fn[context];context=fn;fn=tmp;} // Quick check to determine if target is callable, in the spec
	// this throws a TypeError, but we will just return undefined.
	if(!jQuery.isFunction(fn)){return undefined;} // Simulated bind
	args=_slice.call(arguments,2);proxy=function proxy(){return fn.apply(context||this,args.concat(_slice.call(arguments)));}; // Set the guid of unique handler to the same of original handler, so it can be removed
	proxy.guid=fn.guid=fn.guid||jQuery.guid++;return proxy;},now:Date.now, // jQuery.support is not used in Core but other projects attach their
	// properties to it so it needs to exist.
	support:support}); // JSHint would error on this code due to the Symbol not being defined in ES5.
	// Defining this global in .jshintrc would create a danger of using the global
	// unguarded in another place, it seems safer to just disable JSHint for these
	// three lines.
	/* jshint ignore: start */if(typeof Symbol==="function"){jQuery.fn[Symbol.iterator]=arr[Symbol.iterator];} /* jshint ignore: end */ // Populate the class2type map
	jQuery.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(i,name){class2type["[object "+name+"]"]=name.toLowerCase();});function isArrayLike(obj){ // Support: iOS 8.2 (not reproducible in simulator)
	// `in` check used to prevent JIT error (gh-2145)
	// hasOwn isn't used here due to false negatives
	// regarding Nodelist length in IE
	var length=!!obj&&"length" in obj&&obj.length,type=jQuery.type(obj);if(type==="function"||jQuery.isWindow(obj)){return false;}return type==="array"||length===0||typeof length==="number"&&length>0&&length-1 in obj;}var Sizzle= /*!
	 * Sizzle CSS Selector Engine v2.2.1
	 * http://sizzlejs.com/
	 *
	 * Copyright jQuery Foundation and other contributors
	 * Released under the MIT license
	 * http://jquery.org/license
	 *
	 * Date: 2015-10-17
	 */function(window){var i,support,Expr,getText,isXML,tokenize,compile,select,outermostContext,sortInput,hasDuplicate, // Local document vars
	setDocument,document,docElem,documentIsHTML,rbuggyQSA,rbuggyMatches,matches,contains, // Instance-specific data
	expando="sizzle"+1*new Date(),preferredDoc=window.document,dirruns=0,done=0,classCache=createCache(),tokenCache=createCache(),compilerCache=createCache(),sortOrder=function sortOrder(a,b){if(a===b){hasDuplicate=true;}return 0;}, // General-purpose constants
	MAX_NEGATIVE=1<<31, // Instance methods
	hasOwn={}.hasOwnProperty,arr=[],pop=arr.pop,push_native=arr.push,push=arr.push,slice=arr.slice, // Use a stripped-down indexOf as it's faster than native
	// http://jsperf.com/thor-indexof-vs-for/5
	indexOf=function indexOf(list,elem){var i=0,len=list.length;for(;i<len;i++){if(list[i]===elem){return i;}}return -1;},booleans="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", // Regular expressions
	// http://www.w3.org/TR/css3-selectors/#whitespace
	whitespace="[\\x20\\t\\r\\n\\f]", // http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
	identifier="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", // Attribute selectors: http://www.w3.org/TR/selectors/#attribute-selectors
	attributes="\\["+whitespace+"*("+identifier+")(?:"+whitespace+ // Operator (capture 2)
	"*([*^$|!~]?=)"+whitespace+ // "Attribute values must be CSS identifiers [capture 5] or strings [capture 3 or capture 4]"
	"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+identifier+"))|)"+whitespace+"*\\]",pseudos=":("+identifier+")(?:\\(("+ // To reduce the number of selectors needing tokenize in the preFilter, prefer arguments:
	// 1. quoted (capture 3; capture 4 or capture 5)
	"('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|"+ // 2. simple (capture 6)
	"((?:\\\\.|[^\\\\()[\\]]|"+attributes+")*)|"+ // 3. anything else (capture 2)
	".*"+")\\)|)", // Leading and non-escaped trailing whitespace, capturing some non-whitespace characters preceding the latter
	rwhitespace=new RegExp(whitespace+"+","g"),rtrim=new RegExp("^"+whitespace+"+|((?:^|[^\\\\])(?:\\\\.)*)"+whitespace+"+$","g"),rcomma=new RegExp("^"+whitespace+"*,"+whitespace+"*"),rcombinators=new RegExp("^"+whitespace+"*([>+~]|"+whitespace+")"+whitespace+"*"),rattributeQuotes=new RegExp("="+whitespace+"*([^\\]'\"]*?)"+whitespace+"*\\]","g"),rpseudo=new RegExp(pseudos),ridentifier=new RegExp("^"+identifier+"$"),matchExpr={"ID":new RegExp("^#("+identifier+")"),"CLASS":new RegExp("^\\.("+identifier+")"),"TAG":new RegExp("^("+identifier+"|[*])"),"ATTR":new RegExp("^"+attributes),"PSEUDO":new RegExp("^"+pseudos),"CHILD":new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+whitespace+"*(even|odd|(([+-]|)(\\d*)n|)"+whitespace+"*(?:([+-]|)"+whitespace+"*(\\d+)|))"+whitespace+"*\\)|)","i"),"bool":new RegExp("^(?:"+booleans+")$","i"), // For use in libraries implementing .is()
	// We use this for POS matching in `select`
	"needsContext":new RegExp("^"+whitespace+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+whitespace+"*((?:-\\d)?\\d*)"+whitespace+"*\\)|)(?=[^-]|$)","i")},rinputs=/^(?:input|select|textarea|button)$/i,rheader=/^h\d$/i,rnative=/^[^{]+\{\s*\[native \w/, // Easily-parseable/retrievable ID or TAG or CLASS selectors
	rquickExpr=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,rsibling=/[+~]/,rescape=/'|\\/g, // CSS escapes http://www.w3.org/TR/CSS21/syndata.html#escaped-characters
	runescape=new RegExp("\\\\([\\da-f]{1,6}"+whitespace+"?|("+whitespace+")|.)","ig"),funescape=function funescape(_,escaped,escapedWhitespace){var high="0x"+escaped-0x10000; // NaN means non-codepoint
	// Support: Firefox<24
	// Workaround erroneous numeric interpretation of +"0x"
	return high!==high||escapedWhitespace?escaped:high<0? // BMP codepoint
	String.fromCharCode(high+0x10000): // Supplemental Plane codepoint (surrogate pair)
	String.fromCharCode(high>>10|0xD800,high&0x3FF|0xDC00);}, // Used for iframes
	// See setDocument()
	// Removing the function wrapper causes a "Permission Denied"
	// error in IE
	unloadHandler=function unloadHandler(){setDocument();}; // Optimize for push.apply( _, NodeList )
	try{push.apply(arr=slice.call(preferredDoc.childNodes),preferredDoc.childNodes); // Support: Android<4.0
	// Detect silently failing push.apply
	arr[preferredDoc.childNodes.length].nodeType;}catch(e){push={apply:arr.length? // Leverage slice if possible
	function(target,els){push_native.apply(target,slice.call(els));}: // Support: IE<9
	// Otherwise append directly
	function(target,els){var j=target.length,i=0; // Can't trust NodeList.length
	while(target[j++]=els[i++]){}target.length=j-1;}};}function Sizzle(selector,context,results,seed){var m,i,elem,nid,nidselect,match,groups,newSelector,newContext=context&&context.ownerDocument, // nodeType defaults to 9, since context defaults to document
	nodeType=context?context.nodeType:9;results=results||[]; // Return early from calls with invalid selector or context
	if(typeof selector!=="string"||!selector||nodeType!==1&&nodeType!==9&&nodeType!==11){return results;} // Try to shortcut find operations (as opposed to filters) in HTML documents
	if(!seed){if((context?context.ownerDocument||context:preferredDoc)!==document){setDocument(context);}context=context||document;if(documentIsHTML){ // If the selector is sufficiently simple, try using a "get*By*" DOM method
	// (excepting DocumentFragment context, where the methods don't exist)
	if(nodeType!==11&&(match=rquickExpr.exec(selector))){ // ID selector
	if(m=match[1]){ // Document context
	if(nodeType===9){if(elem=context.getElementById(m)){ // Support: IE, Opera, Webkit
	// TODO: identify versions
	// getElementById can match elements by name instead of ID
	if(elem.id===m){results.push(elem);return results;}}else {return results;} // Element context
	}else { // Support: IE, Opera, Webkit
	// TODO: identify versions
	// getElementById can match elements by name instead of ID
	if(newContext&&(elem=newContext.getElementById(m))&&contains(context,elem)&&elem.id===m){results.push(elem);return results;}} // Type selector
	}else if(match[2]){push.apply(results,context.getElementsByTagName(selector));return results; // Class selector
	}else if((m=match[3])&&support.getElementsByClassName&&context.getElementsByClassName){push.apply(results,context.getElementsByClassName(m));return results;}} // Take advantage of querySelectorAll
	if(support.qsa&&!compilerCache[selector+" "]&&(!rbuggyQSA||!rbuggyQSA.test(selector))){if(nodeType!==1){newContext=context;newSelector=selector; // qSA looks outside Element context, which is not what we want
	// Thanks to Andrew Dupont for this workaround technique
	// Support: IE <=8
	// Exclude object elements
	}else if(context.nodeName.toLowerCase()!=="object"){ // Capture the context ID, setting it first if necessary
	if(nid=context.getAttribute("id")){nid=nid.replace(rescape,"\\$&");}else {context.setAttribute("id",nid=expando);} // Prefix every selector in the list
	groups=tokenize(selector);i=groups.length;nidselect=ridentifier.test(nid)?"#"+nid:"[id='"+nid+"']";while(i--){groups[i]=nidselect+" "+toSelector(groups[i]);}newSelector=groups.join(","); // Expand context for sibling selectors
	newContext=rsibling.test(selector)&&testContext(context.parentNode)||context;}if(newSelector){try{push.apply(results,newContext.querySelectorAll(newSelector));return results;}catch(qsaError){}finally {if(nid===expando){context.removeAttribute("id");}}}}}} // All others
	return select(selector.replace(rtrim,"$1"),context,results,seed);} /**
	 * Create key-value caches of limited size
	 * @returns {function(string, object)} Returns the Object data after storing it on itself with
	 *	property name the (space-suffixed) string and (if the cache is larger than Expr.cacheLength)
	 *	deleting the oldest entry
	 */function createCache(){var keys=[];function cache(key,value){ // Use (key + " ") to avoid collision with native prototype properties (see Issue #157)
	if(keys.push(key+" ")>Expr.cacheLength){ // Only keep the most recent entries
	delete cache[keys.shift()];}return cache[key+" "]=value;}return cache;} /**
	 * Mark a function for special use by Sizzle
	 * @param {Function} fn The function to mark
	 */function markFunction(fn){fn[expando]=true;return fn;} /**
	 * Support testing using an element
	 * @param {Function} fn Passed the created div and expects a boolean result
	 */function assert(fn){var div=document.createElement("div");try{return !!fn(div);}catch(e){return false;}finally { // Remove from its parent by default
	if(div.parentNode){div.parentNode.removeChild(div);} // release memory in IE
	div=null;}} /**
	 * Adds the same handler for all of the specified attrs
	 * @param {String} attrs Pipe-separated list of attributes
	 * @param {Function} handler The method that will be applied
	 */function addHandle(attrs,handler){var arr=attrs.split("|"),i=arr.length;while(i--){Expr.attrHandle[arr[i]]=handler;}} /**
	 * Checks document order of two siblings
	 * @param {Element} a
	 * @param {Element} b
	 * @returns {Number} Returns less than 0 if a precedes b, greater than 0 if a follows b
	 */function siblingCheck(a,b){var cur=b&&a,diff=cur&&a.nodeType===1&&b.nodeType===1&&(~b.sourceIndex||MAX_NEGATIVE)-(~a.sourceIndex||MAX_NEGATIVE); // Use IE sourceIndex if available on both nodes
	if(diff){return diff;} // Check if b follows a
	if(cur){while(cur=cur.nextSibling){if(cur===b){return -1;}}}return a?1:-1;} /**
	 * Returns a function to use in pseudos for input types
	 * @param {String} type
	 */function createInputPseudo(type){return function(elem){var name=elem.nodeName.toLowerCase();return name==="input"&&elem.type===type;};} /**
	 * Returns a function to use in pseudos for buttons
	 * @param {String} type
	 */function createButtonPseudo(type){return function(elem){var name=elem.nodeName.toLowerCase();return (name==="input"||name==="button")&&elem.type===type;};} /**
	 * Returns a function to use in pseudos for positionals
	 * @param {Function} fn
	 */function createPositionalPseudo(fn){return markFunction(function(argument){argument=+argument;return markFunction(function(seed,matches){var j,matchIndexes=fn([],seed.length,argument),i=matchIndexes.length; // Match elements found at the specified indexes
	while(i--){if(seed[j=matchIndexes[i]]){seed[j]=!(matches[j]=seed[j]);}}});});} /**
	 * Checks a node for validity as a Sizzle context
	 * @param {Element|Object=} context
	 * @returns {Element|Object|Boolean} The input node if acceptable, otherwise a falsy value
	 */function testContext(context){return context&&typeof context.getElementsByTagName!=="undefined"&&context;} // Expose support vars for convenience
	support=Sizzle.support={}; /**
	 * Detects XML nodes
	 * @param {Element|Object} elem An element or a document
	 * @returns {Boolean} True iff elem is a non-HTML XML node
	 */isXML=Sizzle.isXML=function(elem){ // documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833)
	var documentElement=elem&&(elem.ownerDocument||elem).documentElement;return documentElement?documentElement.nodeName!=="HTML":false;}; /**
	 * Sets document-related variables once based on the current document
	 * @param {Element|Object} [doc] An element or document object to use to set the document
	 * @returns {Object} Returns the current document
	 */setDocument=Sizzle.setDocument=function(node){var hasCompare,parent,doc=node?node.ownerDocument||node:preferredDoc; // Return early if doc is invalid or already selected
	if(doc===document||doc.nodeType!==9||!doc.documentElement){return document;} // Update global variables
	document=doc;docElem=document.documentElement;documentIsHTML=!isXML(document); // Support: IE 9-11, Edge
	// Accessing iframe documents after unload throws "permission denied" errors (jQuery #13936)
	if((parent=document.defaultView)&&parent.top!==parent){ // Support: IE 11
	if(parent.addEventListener){parent.addEventListener("unload",unloadHandler,false); // Support: IE 9 - 10 only
	}else if(parent.attachEvent){parent.attachEvent("onunload",unloadHandler);}} /* Attributes
		---------------------------------------------------------------------- */ // Support: IE<8
	// Verify that getAttribute really returns attributes and not properties
	// (excepting IE8 booleans)
	support.attributes=assert(function(div){div.className="i";return !div.getAttribute("className");}); /* getElement(s)By*
		---------------------------------------------------------------------- */ // Check if getElementsByTagName("*") returns only elements
	support.getElementsByTagName=assert(function(div){div.appendChild(document.createComment(""));return !div.getElementsByTagName("*").length;}); // Support: IE<9
	support.getElementsByClassName=rnative.test(document.getElementsByClassName); // Support: IE<10
	// Check if getElementById returns elements by name
	// The broken getElementById methods don't pick up programatically-set names,
	// so use a roundabout getElementsByName test
	support.getById=assert(function(div){docElem.appendChild(div).id=expando;return !document.getElementsByName||!document.getElementsByName(expando).length;}); // ID find and filter
	if(support.getById){Expr.find["ID"]=function(id,context){if(typeof context.getElementById!=="undefined"&&documentIsHTML){var m=context.getElementById(id);return m?[m]:[];}};Expr.filter["ID"]=function(id){var attrId=id.replace(runescape,funescape);return function(elem){return elem.getAttribute("id")===attrId;};};}else { // Support: IE6/7
	// getElementById is not reliable as a find shortcut
	delete Expr.find["ID"];Expr.filter["ID"]=function(id){var attrId=id.replace(runescape,funescape);return function(elem){var node=typeof elem.getAttributeNode!=="undefined"&&elem.getAttributeNode("id");return node&&node.value===attrId;};};} // Tag
	Expr.find["TAG"]=support.getElementsByTagName?function(tag,context){if(typeof context.getElementsByTagName!=="undefined"){return context.getElementsByTagName(tag); // DocumentFragment nodes don't have gEBTN
	}else if(support.qsa){return context.querySelectorAll(tag);}}:function(tag,context){var elem,tmp=[],i=0, // By happy coincidence, a (broken) gEBTN appears on DocumentFragment nodes too
	results=context.getElementsByTagName(tag); // Filter out possible comments
	if(tag==="*"){while(elem=results[i++]){if(elem.nodeType===1){tmp.push(elem);}}return tmp;}return results;}; // Class
	Expr.find["CLASS"]=support.getElementsByClassName&&function(className,context){if(typeof context.getElementsByClassName!=="undefined"&&documentIsHTML){return context.getElementsByClassName(className);}}; /* QSA/matchesSelector
		---------------------------------------------------------------------- */ // QSA and matchesSelector support
	// matchesSelector(:active) reports false when true (IE9/Opera 11.5)
	rbuggyMatches=[]; // qSa(:focus) reports false when true (Chrome 21)
	// We allow this because of a bug in IE8/9 that throws an error
	// whenever `document.activeElement` is accessed on an iframe
	// So, we allow :focus to pass through QSA all the time to avoid the IE error
	// See http://bugs.jquery.com/ticket/13378
	rbuggyQSA=[];if(support.qsa=rnative.test(document.querySelectorAll)){ // Build QSA regex
	// Regex strategy adopted from Diego Perini
	assert(function(div){ // Select is set to empty string on purpose
	// This is to test IE's treatment of not explicitly
	// setting a boolean content attribute,
	// since its presence should be enough
	// http://bugs.jquery.com/ticket/12359
	docElem.appendChild(div).innerHTML="<a id='"+expando+"'></a>"+"<select id='"+expando+"-\r\\' msallowcapture=''>"+"<option selected=''></option></select>"; // Support: IE8, Opera 11-12.16
	// Nothing should be selected when empty strings follow ^= or $= or *=
	// The test attribute must be unknown in Opera but "safe" for WinRT
	// http://msdn.microsoft.com/en-us/library/ie/hh465388.aspx#attribute_section
	if(div.querySelectorAll("[msallowcapture^='']").length){rbuggyQSA.push("[*^$]="+whitespace+"*(?:''|\"\")");} // Support: IE8
	// Boolean attributes and "value" are not treated correctly
	if(!div.querySelectorAll("[selected]").length){rbuggyQSA.push("\\["+whitespace+"*(?:value|"+booleans+")");} // Support: Chrome<29, Android<4.4, Safari<7.0+, iOS<7.0+, PhantomJS<1.9.8+
	if(!div.querySelectorAll("[id~="+expando+"-]").length){rbuggyQSA.push("~=");} // Webkit/Opera - :checked should return selected option elements
	// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
	// IE8 throws error here and will not see later tests
	if(!div.querySelectorAll(":checked").length){rbuggyQSA.push(":checked");} // Support: Safari 8+, iOS 8+
	// https://bugs.webkit.org/show_bug.cgi?id=136851
	// In-page `selector#id sibing-combinator selector` fails
	if(!div.querySelectorAll("a#"+expando+"+*").length){rbuggyQSA.push(".#.+[+~]");}});assert(function(div){ // Support: Windows 8 Native Apps
	// The type and name attributes are restricted during .innerHTML assignment
	var input=document.createElement("input");input.setAttribute("type","hidden");div.appendChild(input).setAttribute("name","D"); // Support: IE8
	// Enforce case-sensitivity of name attribute
	if(div.querySelectorAll("[name=d]").length){rbuggyQSA.push("name"+whitespace+"*[*^$|!~]?=");} // FF 3.5 - :enabled/:disabled and hidden elements (hidden elements are still enabled)
	// IE8 throws error here and will not see later tests
	if(!div.querySelectorAll(":enabled").length){rbuggyQSA.push(":enabled",":disabled");} // Opera 10-11 does not throw on post-comma invalid pseudos
	div.querySelectorAll("*,:x");rbuggyQSA.push(",.*:");});}if(support.matchesSelector=rnative.test(matches=docElem.matches||docElem.webkitMatchesSelector||docElem.mozMatchesSelector||docElem.oMatchesSelector||docElem.msMatchesSelector)){assert(function(div){ // Check to see if it's possible to do matchesSelector
	// on a disconnected node (IE 9)
	support.disconnectedMatch=matches.call(div,"div"); // This should fail with an exception
	// Gecko does not error, returns false instead
	matches.call(div,"[s!='']:x");rbuggyMatches.push("!=",pseudos);});}rbuggyQSA=rbuggyQSA.length&&new RegExp(rbuggyQSA.join("|"));rbuggyMatches=rbuggyMatches.length&&new RegExp(rbuggyMatches.join("|")); /* Contains
		---------------------------------------------------------------------- */hasCompare=rnative.test(docElem.compareDocumentPosition); // Element contains another
	// Purposefully self-exclusive
	// As in, an element does not contain itself
	contains=hasCompare||rnative.test(docElem.contains)?function(a,b){var adown=a.nodeType===9?a.documentElement:a,bup=b&&b.parentNode;return a===bup||!!(bup&&bup.nodeType===1&&(adown.contains?adown.contains(bup):a.compareDocumentPosition&&a.compareDocumentPosition(bup)&16));}:function(a,b){if(b){while(b=b.parentNode){if(b===a){return true;}}}return false;}; /* Sorting
		---------------------------------------------------------------------- */ // Document order sorting
	sortOrder=hasCompare?function(a,b){ // Flag for duplicate removal
	if(a===b){hasDuplicate=true;return 0;} // Sort on method existence if only one input has compareDocumentPosition
	var compare=!a.compareDocumentPosition-!b.compareDocumentPosition;if(compare){return compare;} // Calculate position if both inputs belong to the same document
	compare=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b): // Otherwise we know they are disconnected
	1; // Disconnected nodes
	if(compare&1||!support.sortDetached&&b.compareDocumentPosition(a)===compare){ // Choose the first element that is related to our preferred document
	if(a===document||a.ownerDocument===preferredDoc&&contains(preferredDoc,a)){return -1;}if(b===document||b.ownerDocument===preferredDoc&&contains(preferredDoc,b)){return 1;} // Maintain original order
	return sortInput?indexOf(sortInput,a)-indexOf(sortInput,b):0;}return compare&4?-1:1;}:function(a,b){ // Exit early if the nodes are identical
	if(a===b){hasDuplicate=true;return 0;}var cur,i=0,aup=a.parentNode,bup=b.parentNode,ap=[a],bp=[b]; // Parentless nodes are either documents or disconnected
	if(!aup||!bup){return a===document?-1:b===document?1:aup?-1:bup?1:sortInput?indexOf(sortInput,a)-indexOf(sortInput,b):0; // If the nodes are siblings, we can do a quick check
	}else if(aup===bup){return siblingCheck(a,b);} // Otherwise we need full lists of their ancestors for comparison
	cur=a;while(cur=cur.parentNode){ap.unshift(cur);}cur=b;while(cur=cur.parentNode){bp.unshift(cur);} // Walk down the tree looking for a discrepancy
	while(ap[i]===bp[i]){i++;}return i? // Do a sibling check if the nodes have a common ancestor
	siblingCheck(ap[i],bp[i]): // Otherwise nodes in our document sort first
	ap[i]===preferredDoc?-1:bp[i]===preferredDoc?1:0;};return document;};Sizzle.matches=function(expr,elements){return Sizzle(expr,null,null,elements);};Sizzle.matchesSelector=function(elem,expr){ // Set document vars if needed
	if((elem.ownerDocument||elem)!==document){setDocument(elem);} // Make sure that attribute selectors are quoted
	expr=expr.replace(rattributeQuotes,"='$1']");if(support.matchesSelector&&documentIsHTML&&!compilerCache[expr+" "]&&(!rbuggyMatches||!rbuggyMatches.test(expr))&&(!rbuggyQSA||!rbuggyQSA.test(expr))){try{var ret=matches.call(elem,expr); // IE 9's matchesSelector returns false on disconnected nodes
	if(ret||support.disconnectedMatch|| // As well, disconnected nodes are said to be in a document
	// fragment in IE 9
	elem.document&&elem.document.nodeType!==11){return ret;}}catch(e){}}return Sizzle(expr,document,null,[elem]).length>0;};Sizzle.contains=function(context,elem){ // Set document vars if needed
	if((context.ownerDocument||context)!==document){setDocument(context);}return contains(context,elem);};Sizzle.attr=function(elem,name){ // Set document vars if needed
	if((elem.ownerDocument||elem)!==document){setDocument(elem);}var fn=Expr.attrHandle[name.toLowerCase()], // Don't get fooled by Object.prototype properties (jQuery #13807)
	val=fn&&hasOwn.call(Expr.attrHandle,name.toLowerCase())?fn(elem,name,!documentIsHTML):undefined;return val!==undefined?val:support.attributes||!documentIsHTML?elem.getAttribute(name):(val=elem.getAttributeNode(name))&&val.specified?val.value:null;};Sizzle.error=function(msg){throw new Error("Syntax error, unrecognized expression: "+msg);}; /**
	 * Document sorting and removing duplicates
	 * @param {ArrayLike} results
	 */Sizzle.uniqueSort=function(results){var elem,duplicates=[],j=0,i=0; // Unless we *know* we can detect duplicates, assume their presence
	hasDuplicate=!support.detectDuplicates;sortInput=!support.sortStable&&results.slice(0);results.sort(sortOrder);if(hasDuplicate){while(elem=results[i++]){if(elem===results[i]){j=duplicates.push(i);}}while(j--){results.splice(duplicates[j],1);}} // Clear input after sorting to release objects
	// See https://github.com/jquery/sizzle/pull/225
	sortInput=null;return results;}; /**
	 * Utility function for retrieving the text value of an array of DOM nodes
	 * @param {Array|Element} elem
	 */getText=Sizzle.getText=function(elem){var node,ret="",i=0,nodeType=elem.nodeType;if(!nodeType){ // If no nodeType, this is expected to be an array
	while(node=elem[i++]){ // Do not traverse comment nodes
	ret+=getText(node);}}else if(nodeType===1||nodeType===9||nodeType===11){ // Use textContent for elements
	// innerText usage removed for consistency of new lines (jQuery #11153)
	if(typeof elem.textContent==="string"){return elem.textContent;}else { // Traverse its children
	for(elem=elem.firstChild;elem;elem=elem.nextSibling){ret+=getText(elem);}}}else if(nodeType===3||nodeType===4){return elem.nodeValue;} // Do not include comment or processing instruction nodes
	return ret;};Expr=Sizzle.selectors={ // Can be adjusted by the user
	cacheLength:50,createPseudo:markFunction,match:matchExpr,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:true}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:true},"~":{dir:"previousSibling"}},preFilter:{"ATTR":function ATTR(match){match[1]=match[1].replace(runescape,funescape); // Move the given value to match[3] whether quoted or unquoted
	match[3]=(match[3]||match[4]||match[5]||"").replace(runescape,funescape);if(match[2]==="~="){match[3]=" "+match[3]+" ";}return match.slice(0,4);},"CHILD":function CHILD(match){ /* matches from matchExpr["CHILD"]
					1 type (only|nth|...)
					2 what (child|of-type)
					3 argument (even|odd|\d*|\d*n([+-]\d+)?|...)
					4 xn-component of xn+y argument ([+-]?\d*n|)
					5 sign of xn-component
					6 x of xn-component
					7 sign of y-component
					8 y of y-component
				*/match[1]=match[1].toLowerCase();if(match[1].slice(0,3)==="nth"){ // nth-* requires argument
	if(!match[3]){Sizzle.error(match[0]);} // numeric x and y parameters for Expr.filter.CHILD
	// remember that false/true cast respectively to 0/1
	match[4]=+(match[4]?match[5]+(match[6]||1):2*(match[3]==="even"||match[3]==="odd"));match[5]=+(match[7]+match[8]||match[3]==="odd"); // other types prohibit arguments
	}else if(match[3]){Sizzle.error(match[0]);}return match;},"PSEUDO":function PSEUDO(match){var excess,unquoted=!match[6]&&match[2];if(matchExpr["CHILD"].test(match[0])){return null;} // Accept quoted arguments as-is
	if(match[3]){match[2]=match[4]||match[5]||""; // Strip excess characters from unquoted arguments
	}else if(unquoted&&rpseudo.test(unquoted)&&( // Get excess from tokenize (recursively)
	excess=tokenize(unquoted,true))&&( // advance to the next closing parenthesis
	excess=unquoted.indexOf(")",unquoted.length-excess)-unquoted.length)){ // excess is a negative index
	match[0]=match[0].slice(0,excess);match[2]=unquoted.slice(0,excess);} // Return only captures needed by the pseudo filter method (type and argument)
	return match.slice(0,3);}},filter:{"TAG":function TAG(nodeNameSelector){var nodeName=nodeNameSelector.replace(runescape,funescape).toLowerCase();return nodeNameSelector==="*"?function(){return true;}:function(elem){return elem.nodeName&&elem.nodeName.toLowerCase()===nodeName;};},"CLASS":function CLASS(className){var pattern=classCache[className+" "];return pattern||(pattern=new RegExp("(^|"+whitespace+")"+className+"("+whitespace+"|$)"))&&classCache(className,function(elem){return pattern.test(typeof elem.className==="string"&&elem.className||typeof elem.getAttribute!=="undefined"&&elem.getAttribute("class")||"");});},"ATTR":function ATTR(name,operator,check){return function(elem){var result=Sizzle.attr(elem,name);if(result==null){return operator==="!=";}if(!operator){return true;}result+="";return operator==="="?result===check:operator==="!="?result!==check:operator==="^="?check&&result.indexOf(check)===0:operator==="*="?check&&result.indexOf(check)>-1:operator==="$="?check&&result.slice(-check.length)===check:operator==="~="?(" "+result.replace(rwhitespace," ")+" ").indexOf(check)>-1:operator==="|="?result===check||result.slice(0,check.length+1)===check+"-":false;};},"CHILD":function CHILD(type,what,argument,first,last){var simple=type.slice(0,3)!=="nth",forward=type.slice(-4)!=="last",ofType=what==="of-type";return first===1&&last===0? // Shortcut for :nth-*(n)
	function(elem){return !!elem.parentNode;}:function(elem,context,xml){var cache,uniqueCache,outerCache,node,nodeIndex,start,dir=simple!==forward?"nextSibling":"previousSibling",parent=elem.parentNode,name=ofType&&elem.nodeName.toLowerCase(),useCache=!xml&&!ofType,diff=false;if(parent){ // :(first|last|only)-(child|of-type)
	if(simple){while(dir){node=elem;while(node=node[dir]){if(ofType?node.nodeName.toLowerCase()===name:node.nodeType===1){return false;}} // Reverse direction for :only-* (if we haven't yet done so)
	start=dir=type==="only"&&!start&&"nextSibling";}return true;}start=[forward?parent.firstChild:parent.lastChild]; // non-xml :nth-child(...) stores cache data on `parent`
	if(forward&&useCache){ // Seek `elem` from a previously-cached index
	// ...in a gzip-friendly way
	node=parent;outerCache=node[expando]||(node[expando]={}); // Support: IE <9 only
	// Defend against cloned attroperties (jQuery gh-1709)
	uniqueCache=outerCache[node.uniqueID]||(outerCache[node.uniqueID]={});cache=uniqueCache[type]||[];nodeIndex=cache[0]===dirruns&&cache[1];diff=nodeIndex&&cache[2];node=nodeIndex&&parent.childNodes[nodeIndex];while(node=++nodeIndex&&node&&node[dir]||( // Fallback to seeking `elem` from the start
	diff=nodeIndex=0)||start.pop()){ // When found, cache indexes on `parent` and break
	if(node.nodeType===1&&++diff&&node===elem){uniqueCache[type]=[dirruns,nodeIndex,diff];break;}}}else { // Use previously-cached element index if available
	if(useCache){ // ...in a gzip-friendly way
	node=elem;outerCache=node[expando]||(node[expando]={}); // Support: IE <9 only
	// Defend against cloned attroperties (jQuery gh-1709)
	uniqueCache=outerCache[node.uniqueID]||(outerCache[node.uniqueID]={});cache=uniqueCache[type]||[];nodeIndex=cache[0]===dirruns&&cache[1];diff=nodeIndex;} // xml :nth-child(...)
	// or :nth-last-child(...) or :nth(-last)?-of-type(...)
	if(diff===false){ // Use the same loop as above to seek `elem` from the start
	while(node=++nodeIndex&&node&&node[dir]||(diff=nodeIndex=0)||start.pop()){if((ofType?node.nodeName.toLowerCase()===name:node.nodeType===1)&&++diff){ // Cache the index of each encountered element
	if(useCache){outerCache=node[expando]||(node[expando]={}); // Support: IE <9 only
	// Defend against cloned attroperties (jQuery gh-1709)
	uniqueCache=outerCache[node.uniqueID]||(outerCache[node.uniqueID]={});uniqueCache[type]=[dirruns,diff];}if(node===elem){break;}}}}} // Incorporate the offset, then check against cycle size
	diff-=last;return diff===first||diff%first===0&&diff/first>=0;}};},"PSEUDO":function PSEUDO(pseudo,argument){ // pseudo-class names are case-insensitive
	// http://www.w3.org/TR/selectors/#pseudo-classes
	// Prioritize by case sensitivity in case custom pseudos are added with uppercase letters
	// Remember that setFilters inherits from pseudos
	var args,fn=Expr.pseudos[pseudo]||Expr.setFilters[pseudo.toLowerCase()]||Sizzle.error("unsupported pseudo: "+pseudo); // The user may use createPseudo to indicate that
	// arguments are needed to create the filter function
	// just as Sizzle does
	if(fn[expando]){return fn(argument);} // But maintain support for old signatures
	if(fn.length>1){args=[pseudo,pseudo,"",argument];return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase())?markFunction(function(seed,matches){var idx,matched=fn(seed,argument),i=matched.length;while(i--){idx=indexOf(seed,matched[i]);seed[idx]=!(matches[idx]=matched[i]);}}):function(elem){return fn(elem,0,args);};}return fn;}},pseudos:{ // Potentially complex pseudos
	"not":markFunction(function(selector){ // Trim the selector passed to compile
	// to avoid treating leading and trailing
	// spaces as combinators
	var input=[],results=[],matcher=compile(selector.replace(rtrim,"$1"));return matcher[expando]?markFunction(function(seed,matches,context,xml){var elem,unmatched=matcher(seed,null,xml,[]),i=seed.length; // Match elements unmatched by `matcher`
	while(i--){if(elem=unmatched[i]){seed[i]=!(matches[i]=elem);}}}):function(elem,context,xml){input[0]=elem;matcher(input,null,xml,results); // Don't keep the element (issue #299)
	input[0]=null;return !results.pop();};}),"has":markFunction(function(selector){return function(elem){return Sizzle(selector,elem).length>0;};}),"contains":markFunction(function(text){text=text.replace(runescape,funescape);return function(elem){return (elem.textContent||elem.innerText||getText(elem)).indexOf(text)>-1;};}), // "Whether an element is represented by a :lang() selector
	// is based solely on the element's language value
	// being equal to the identifier C,
	// or beginning with the identifier C immediately followed by "-".
	// The matching of C against the element's language value is performed case-insensitively.
	// The identifier C does not have to be a valid language name."
	// http://www.w3.org/TR/selectors/#lang-pseudo
	"lang":markFunction(function(lang){ // lang value must be a valid identifier
	if(!ridentifier.test(lang||"")){Sizzle.error("unsupported lang: "+lang);}lang=lang.replace(runescape,funescape).toLowerCase();return function(elem){var elemLang;do {if(elemLang=documentIsHTML?elem.lang:elem.getAttribute("xml:lang")||elem.getAttribute("lang")){elemLang=elemLang.toLowerCase();return elemLang===lang||elemLang.indexOf(lang+"-")===0;}}while((elem=elem.parentNode)&&elem.nodeType===1);return false;};}), // Miscellaneous
	"target":function target(elem){var hash=window.location&&window.location.hash;return hash&&hash.slice(1)===elem.id;},"root":function root(elem){return elem===docElem;},"focus":function focus(elem){return elem===document.activeElement&&(!document.hasFocus||document.hasFocus())&&!!(elem.type||elem.href||~elem.tabIndex);}, // Boolean properties
	"enabled":function enabled(elem){return elem.disabled===false;},"disabled":function disabled(elem){return elem.disabled===true;},"checked":function checked(elem){ // In CSS3, :checked should return both checked and selected elements
	// http://www.w3.org/TR/2011/REC-css3-selectors-20110929/#checked
	var nodeName=elem.nodeName.toLowerCase();return nodeName==="input"&&!!elem.checked||nodeName==="option"&&!!elem.selected;},"selected":function selected(elem){ // Accessing this property makes selected-by-default
	// options in Safari work properly
	if(elem.parentNode){elem.parentNode.selectedIndex;}return elem.selected===true;}, // Contents
	"empty":function empty(elem){ // http://www.w3.org/TR/selectors/#empty-pseudo
	// :empty is negated by element (1) or content nodes (text: 3; cdata: 4; entity ref: 5),
	//   but not by others (comment: 8; processing instruction: 7; etc.)
	// nodeType < 6 works because attributes (2) do not appear as children
	for(elem=elem.firstChild;elem;elem=elem.nextSibling){if(elem.nodeType<6){return false;}}return true;},"parent":function parent(elem){return !Expr.pseudos["empty"](elem);}, // Element/input types
	"header":function header(elem){return rheader.test(elem.nodeName);},"input":function input(elem){return rinputs.test(elem.nodeName);},"button":function button(elem){var name=elem.nodeName.toLowerCase();return name==="input"&&elem.type==="button"||name==="button";},"text":function text(elem){var attr;return elem.nodeName.toLowerCase()==="input"&&elem.type==="text"&&( // Support: IE<8
	// New HTML5 attribute values (e.g., "search") appear with elem.type === "text"
	(attr=elem.getAttribute("type"))==null||attr.toLowerCase()==="text");}, // Position-in-collection
	"first":createPositionalPseudo(function(){return [0];}),"last":createPositionalPseudo(function(matchIndexes,length){return [length-1];}),"eq":createPositionalPseudo(function(matchIndexes,length,argument){return [argument<0?argument+length:argument];}),"even":createPositionalPseudo(function(matchIndexes,length){var i=0;for(;i<length;i+=2){matchIndexes.push(i);}return matchIndexes;}),"odd":createPositionalPseudo(function(matchIndexes,length){var i=1;for(;i<length;i+=2){matchIndexes.push(i);}return matchIndexes;}),"lt":createPositionalPseudo(function(matchIndexes,length,argument){var i=argument<0?argument+length:argument;for(;--i>=0;){matchIndexes.push(i);}return matchIndexes;}),"gt":createPositionalPseudo(function(matchIndexes,length,argument){var i=argument<0?argument+length:argument;for(;++i<length;){matchIndexes.push(i);}return matchIndexes;})}};Expr.pseudos["nth"]=Expr.pseudos["eq"]; // Add button/input type pseudos
	for(i in {radio:true,checkbox:true,file:true,password:true,image:true}){Expr.pseudos[i]=createInputPseudo(i);}for(i in {submit:true,reset:true}){Expr.pseudos[i]=createButtonPseudo(i);} // Easy API for creating new setFilters
	function setFilters(){}setFilters.prototype=Expr.filters=Expr.pseudos;Expr.setFilters=new setFilters();tokenize=Sizzle.tokenize=function(selector,parseOnly){var matched,match,tokens,type,soFar,groups,preFilters,cached=tokenCache[selector+" "];if(cached){return parseOnly?0:cached.slice(0);}soFar=selector;groups=[];preFilters=Expr.preFilter;while(soFar){ // Comma and first run
	if(!matched||(match=rcomma.exec(soFar))){if(match){ // Don't consume trailing commas as valid
	soFar=soFar.slice(match[0].length)||soFar;}groups.push(tokens=[]);}matched=false; // Combinators
	if(match=rcombinators.exec(soFar)){matched=match.shift();tokens.push({value:matched, // Cast descendant combinators to space
	type:match[0].replace(rtrim," ")});soFar=soFar.slice(matched.length);} // Filters
	for(type in Expr.filter){if((match=matchExpr[type].exec(soFar))&&(!preFilters[type]||(match=preFilters[type](match)))){matched=match.shift();tokens.push({value:matched,type:type,matches:match});soFar=soFar.slice(matched.length);}}if(!matched){break;}} // Return the length of the invalid excess
	// if we're just parsing
	// Otherwise, throw an error or return tokens
	return parseOnly?soFar.length:soFar?Sizzle.error(selector): // Cache the tokens
	tokenCache(selector,groups).slice(0);};function toSelector(tokens){var i=0,len=tokens.length,selector="";for(;i<len;i++){selector+=tokens[i].value;}return selector;}function addCombinator(matcher,combinator,base){var dir=combinator.dir,checkNonElements=base&&dir==="parentNode",doneName=done++;return combinator.first? // Check against closest ancestor/preceding element
	function(elem,context,xml){while(elem=elem[dir]){if(elem.nodeType===1||checkNonElements){return matcher(elem,context,xml);}}}: // Check against all ancestor/preceding elements
	function(elem,context,xml){var oldCache,uniqueCache,outerCache,newCache=[dirruns,doneName]; // We can't set arbitrary data on XML nodes, so they don't benefit from combinator caching
	if(xml){while(elem=elem[dir]){if(elem.nodeType===1||checkNonElements){if(matcher(elem,context,xml)){return true;}}}}else {while(elem=elem[dir]){if(elem.nodeType===1||checkNonElements){outerCache=elem[expando]||(elem[expando]={}); // Support: IE <9 only
	// Defend against cloned attroperties (jQuery gh-1709)
	uniqueCache=outerCache[elem.uniqueID]||(outerCache[elem.uniqueID]={});if((oldCache=uniqueCache[dir])&&oldCache[0]===dirruns&&oldCache[1]===doneName){ // Assign to newCache so results back-propagate to previous elements
	return newCache[2]=oldCache[2];}else { // Reuse newcache so results back-propagate to previous elements
	uniqueCache[dir]=newCache; // A match means we're done; a fail means we have to keep checking
	if(newCache[2]=matcher(elem,context,xml)){return true;}}}}}};}function elementMatcher(matchers){return matchers.length>1?function(elem,context,xml){var i=matchers.length;while(i--){if(!matchers[i](elem,context,xml)){return false;}}return true;}:matchers[0];}function multipleContexts(selector,contexts,results){var i=0,len=contexts.length;for(;i<len;i++){Sizzle(selector,contexts[i],results);}return results;}function condense(unmatched,map,filter,context,xml){var elem,newUnmatched=[],i=0,len=unmatched.length,mapped=map!=null;for(;i<len;i++){if(elem=unmatched[i]){if(!filter||filter(elem,context,xml)){newUnmatched.push(elem);if(mapped){map.push(i);}}}}return newUnmatched;}function setMatcher(preFilter,selector,matcher,postFilter,postFinder,postSelector){if(postFilter&&!postFilter[expando]){postFilter=setMatcher(postFilter);}if(postFinder&&!postFinder[expando]){postFinder=setMatcher(postFinder,postSelector);}return markFunction(function(seed,results,context,xml){var temp,i,elem,preMap=[],postMap=[],preexisting=results.length, // Get initial elements from seed or context
	elems=seed||multipleContexts(selector||"*",context.nodeType?[context]:context,[]), // Prefilter to get matcher input, preserving a map for seed-results synchronization
	matcherIn=preFilter&&(seed||!selector)?condense(elems,preMap,preFilter,context,xml):elems,matcherOut=matcher? // If we have a postFinder, or filtered seed, or non-seed postFilter or preexisting results,
	postFinder||(seed?preFilter:preexisting||postFilter)? // ...intermediate processing is necessary
	[]: // ...otherwise use results directly
	results:matcherIn; // Find primary matches
	if(matcher){matcher(matcherIn,matcherOut,context,xml);} // Apply postFilter
	if(postFilter){temp=condense(matcherOut,postMap);postFilter(temp,[],context,xml); // Un-match failing elements by moving them back to matcherIn
	i=temp.length;while(i--){if(elem=temp[i]){matcherOut[postMap[i]]=!(matcherIn[postMap[i]]=elem);}}}if(seed){if(postFinder||preFilter){if(postFinder){ // Get the final matcherOut by condensing this intermediate into postFinder contexts
	temp=[];i=matcherOut.length;while(i--){if(elem=matcherOut[i]){ // Restore matcherIn since elem is not yet a final match
	temp.push(matcherIn[i]=elem);}}postFinder(null,matcherOut=[],temp,xml);} // Move matched elements from seed to results to keep them synchronized
	i=matcherOut.length;while(i--){if((elem=matcherOut[i])&&(temp=postFinder?indexOf(seed,elem):preMap[i])>-1){seed[temp]=!(results[temp]=elem);}}} // Add elements to results, through postFinder if defined
	}else {matcherOut=condense(matcherOut===results?matcherOut.splice(preexisting,matcherOut.length):matcherOut);if(postFinder){postFinder(null,results,matcherOut,xml);}else {push.apply(results,matcherOut);}}});}function matcherFromTokens(tokens){var checkContext,matcher,j,len=tokens.length,leadingRelative=Expr.relative[tokens[0].type],implicitRelative=leadingRelative||Expr.relative[" "],i=leadingRelative?1:0, // The foundational matcher ensures that elements are reachable from top-level context(s)
	matchContext=addCombinator(function(elem){return elem===checkContext;},implicitRelative,true),matchAnyContext=addCombinator(function(elem){return indexOf(checkContext,elem)>-1;},implicitRelative,true),matchers=[function(elem,context,xml){var ret=!leadingRelative&&(xml||context!==outermostContext)||((checkContext=context).nodeType?matchContext(elem,context,xml):matchAnyContext(elem,context,xml)); // Avoid hanging onto element (issue #299)
	checkContext=null;return ret;}];for(;i<len;i++){if(matcher=Expr.relative[tokens[i].type]){matchers=[addCombinator(elementMatcher(matchers),matcher)];}else {matcher=Expr.filter[tokens[i].type].apply(null,tokens[i].matches); // Return special upon seeing a positional matcher
	if(matcher[expando]){ // Find the next relative operator (if any) for proper handling
	j=++i;for(;j<len;j++){if(Expr.relative[tokens[j].type]){break;}}return setMatcher(i>1&&elementMatcher(matchers),i>1&&toSelector( // If the preceding token was a descendant combinator, insert an implicit any-element `*`
	tokens.slice(0,i-1).concat({value:tokens[i-2].type===" "?"*":""})).replace(rtrim,"$1"),matcher,i<j&&matcherFromTokens(tokens.slice(i,j)),j<len&&matcherFromTokens(tokens=tokens.slice(j)),j<len&&toSelector(tokens));}matchers.push(matcher);}}return elementMatcher(matchers);}function matcherFromGroupMatchers(elementMatchers,setMatchers){var bySet=setMatchers.length>0,byElement=elementMatchers.length>0,superMatcher=function superMatcher(seed,context,xml,results,outermost){var elem,j,matcher,matchedCount=0,i="0",unmatched=seed&&[],setMatched=[],contextBackup=outermostContext, // We must always have either seed elements or outermost context
	elems=seed||byElement&&Expr.find["TAG"]("*",outermost), // Use integer dirruns iff this is the outermost matcher
	dirrunsUnique=dirruns+=contextBackup==null?1:Math.random()||0.1,len=elems.length;if(outermost){outermostContext=context===document||context||outermost;} // Add elements passing elementMatchers directly to results
	// Support: IE<9, Safari
	// Tolerate NodeList properties (IE: "length"; Safari: <number>) matching elements by id
	for(;i!==len&&(elem=elems[i])!=null;i++){if(byElement&&elem){j=0;if(!context&&elem.ownerDocument!==document){setDocument(elem);xml=!documentIsHTML;}while(matcher=elementMatchers[j++]){if(matcher(elem,context||document,xml)){results.push(elem);break;}}if(outermost){dirruns=dirrunsUnique;}} // Track unmatched elements for set filters
	if(bySet){ // They will have gone through all possible matchers
	if(elem=!matcher&&elem){matchedCount--;} // Lengthen the array for every element, matched or not
	if(seed){unmatched.push(elem);}}} // `i` is now the count of elements visited above, and adding it to `matchedCount`
	// makes the latter nonnegative.
	matchedCount+=i; // Apply set filters to unmatched elements
	// NOTE: This can be skipped if there are no unmatched elements (i.e., `matchedCount`
	// equals `i`), unless we didn't visit _any_ elements in the above loop because we have
	// no element matchers and no seed.
	// Incrementing an initially-string "0" `i` allows `i` to remain a string only in that
	// case, which will result in a "00" `matchedCount` that differs from `i` but is also
	// numerically zero.
	if(bySet&&i!==matchedCount){j=0;while(matcher=setMatchers[j++]){matcher(unmatched,setMatched,context,xml);}if(seed){ // Reintegrate element matches to eliminate the need for sorting
	if(matchedCount>0){while(i--){if(!(unmatched[i]||setMatched[i])){setMatched[i]=pop.call(results);}}} // Discard index placeholder values to get only actual matches
	setMatched=condense(setMatched);} // Add matches to results
	push.apply(results,setMatched); // Seedless set matches succeeding multiple successful matchers stipulate sorting
	if(outermost&&!seed&&setMatched.length>0&&matchedCount+setMatchers.length>1){Sizzle.uniqueSort(results);}} // Override manipulation of globals by nested matchers
	if(outermost){dirruns=dirrunsUnique;outermostContext=contextBackup;}return unmatched;};return bySet?markFunction(superMatcher):superMatcher;}compile=Sizzle.compile=function(selector,match /* Internal Use Only */){var i,setMatchers=[],elementMatchers=[],cached=compilerCache[selector+" "];if(!cached){ // Generate a function of recursive functions that can be used to check each element
	if(!match){match=tokenize(selector);}i=match.length;while(i--){cached=matcherFromTokens(match[i]);if(cached[expando]){setMatchers.push(cached);}else {elementMatchers.push(cached);}} // Cache the compiled function
	cached=compilerCache(selector,matcherFromGroupMatchers(elementMatchers,setMatchers)); // Save selector and tokenization
	cached.selector=selector;}return cached;}; /**
	 * A low-level selection function that works with Sizzle's compiled
	 *  selector functions
	 * @param {String|Function} selector A selector or a pre-compiled
	 *  selector function built with Sizzle.compile
	 * @param {Element} context
	 * @param {Array} [results]
	 * @param {Array} [seed] A set of elements to match against
	 */select=Sizzle.select=function(selector,context,results,seed){var i,tokens,token,type,find,compiled=typeof selector==="function"&&selector,match=!seed&&tokenize(selector=compiled.selector||selector);results=results||[]; // Try to minimize operations if there is only one selector in the list and no seed
	// (the latter of which guarantees us context)
	if(match.length===1){ // Reduce context if the leading compound selector is an ID
	tokens=match[0]=match[0].slice(0);if(tokens.length>2&&(token=tokens[0]).type==="ID"&&support.getById&&context.nodeType===9&&documentIsHTML&&Expr.relative[tokens[1].type]){context=(Expr.find["ID"](token.matches[0].replace(runescape,funescape),context)||[])[0];if(!context){return results; // Precompiled matchers will still verify ancestry, so step up a level
	}else if(compiled){context=context.parentNode;}selector=selector.slice(tokens.shift().value.length);} // Fetch a seed set for right-to-left matching
	i=matchExpr["needsContext"].test(selector)?0:tokens.length;while(i--){token=tokens[i]; // Abort if we hit a combinator
	if(Expr.relative[type=token.type]){break;}if(find=Expr.find[type]){ // Search, expanding context for leading sibling combinators
	if(seed=find(token.matches[0].replace(runescape,funescape),rsibling.test(tokens[0].type)&&testContext(context.parentNode)||context)){ // If seed is empty or no tokens remain, we can return early
	tokens.splice(i,1);selector=seed.length&&toSelector(tokens);if(!selector){push.apply(results,seed);return results;}break;}}}} // Compile and execute a filtering function if one is not provided
	// Provide `match` to avoid retokenization if we modified the selector above
	(compiled||compile(selector,match))(seed,context,!documentIsHTML,results,!context||rsibling.test(selector)&&testContext(context.parentNode)||context);return results;}; // One-time assignments
	// Sort stability
	support.sortStable=expando.split("").sort(sortOrder).join("")===expando; // Support: Chrome 14-35+
	// Always assume duplicates if they aren't passed to the comparison function
	support.detectDuplicates=!!hasDuplicate; // Initialize against the default document
	setDocument(); // Support: Webkit<537.32 - Safari 6.0.3/Chrome 25 (fixed in Chrome 27)
	// Detached nodes confoundingly follow *each other*
	support.sortDetached=assert(function(div1){ // Should return 1, but returns 4 (following)
	return div1.compareDocumentPosition(document.createElement("div"))&1;}); // Support: IE<8
	// Prevent attribute/property "interpolation"
	// http://msdn.microsoft.com/en-us/library/ms536429%28VS.85%29.aspx
	if(!assert(function(div){div.innerHTML="<a href='#'></a>";return div.firstChild.getAttribute("href")==="#";})){addHandle("type|href|height|width",function(elem,name,isXML){if(!isXML){return elem.getAttribute(name,name.toLowerCase()==="type"?1:2);}});} // Support: IE<9
	// Use defaultValue in place of getAttribute("value")
	if(!support.attributes||!assert(function(div){div.innerHTML="<input/>";div.firstChild.setAttribute("value","");return div.firstChild.getAttribute("value")==="";})){addHandle("value",function(elem,name,isXML){if(!isXML&&elem.nodeName.toLowerCase()==="input"){return elem.defaultValue;}});} // Support: IE<9
	// Use getAttributeNode to fetch booleans when getAttribute lies
	if(!assert(function(div){return div.getAttribute("disabled")==null;})){addHandle(booleans,function(elem,name,isXML){var val;if(!isXML){return elem[name]===true?name.toLowerCase():(val=elem.getAttributeNode(name))&&val.specified?val.value:null;}});}return Sizzle;}(window);jQuery.find=Sizzle;jQuery.expr=Sizzle.selectors;jQuery.expr[":"]=jQuery.expr.pseudos;jQuery.uniqueSort=jQuery.unique=Sizzle.uniqueSort;jQuery.text=Sizzle.getText;jQuery.isXMLDoc=Sizzle.isXML;jQuery.contains=Sizzle.contains;var dir=function dir(elem,_dir,until){var matched=[],truncate=until!==undefined;while((elem=elem[_dir])&&elem.nodeType!==9){if(elem.nodeType===1){if(truncate&&jQuery(elem).is(until)){break;}matched.push(elem);}}return matched;};var _siblings=function _siblings(n,elem){var matched=[];for(;n;n=n.nextSibling){if(n.nodeType===1&&n!==elem){matched.push(n);}}return matched;};var rneedsContext=jQuery.expr.match.needsContext;var rsingleTag=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/;var risSimple=/^.[^:#\[\.,]*$/; // Implement the identical functionality for filter and not
	function winnow(elements,qualifier,not){if(jQuery.isFunction(qualifier)){return jQuery.grep(elements,function(elem,i){ /* jshint -W018 */return !!qualifier.call(elem,i,elem)!==not;});}if(qualifier.nodeType){return jQuery.grep(elements,function(elem){return elem===qualifier!==not;});}if(typeof qualifier==="string"){if(risSimple.test(qualifier)){return jQuery.filter(qualifier,elements,not);}qualifier=jQuery.filter(qualifier,elements);}return jQuery.grep(elements,function(elem){return indexOf.call(qualifier,elem)>-1!==not;});}jQuery.filter=function(expr,elems,not){var elem=elems[0];if(not){expr=":not("+expr+")";}return elems.length===1&&elem.nodeType===1?jQuery.find.matchesSelector(elem,expr)?[elem]:[]:jQuery.find.matches(expr,jQuery.grep(elems,function(elem){return elem.nodeType===1;}));};jQuery.fn.extend({find:function find(selector){var i,len=this.length,ret=[],self=this;if(typeof selector!=="string"){return this.pushStack(jQuery(selector).filter(function(){for(i=0;i<len;i++){if(jQuery.contains(self[i],this)){return true;}}}));}for(i=0;i<len;i++){jQuery.find(selector,self[i],ret);} // Needed because $( selector, context ) becomes $( context ).find( selector )
	ret=this.pushStack(len>1?jQuery.unique(ret):ret);ret.selector=this.selector?this.selector+" "+selector:selector;return ret;},filter:function filter(selector){return this.pushStack(winnow(this,selector||[],false));},not:function not(selector){return this.pushStack(winnow(this,selector||[],true));},is:function is(selector){return !!winnow(this, // If this is a positional/relative selector, check membership in the returned set
	// so $("p:first").is("p:last") won't return true for a doc with two "p".
	typeof selector==="string"&&rneedsContext.test(selector)?jQuery(selector):selector||[],false).length;}}); // Initialize a jQuery object
	// A central reference to the root jQuery(document)
	var rootjQuery, // A simple way to check for HTML strings
	// Prioritize #id over <tag> to avoid XSS via location.hash (#9521)
	// Strict HTML recognition (#11290: must start with <)
	rquickExpr=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,init=jQuery.fn.init=function(selector,context,root){var match,elem; // HANDLE: $(""), $(null), $(undefined), $(false)
	if(!selector){return this;} // Method init() accepts an alternate rootjQuery
	// so migrate can support jQuery.sub (gh-2101)
	root=root||rootjQuery; // Handle HTML strings
	if(typeof selector==="string"){if(selector[0]==="<"&&selector[selector.length-1]===">"&&selector.length>=3){ // Assume that strings that start and end with <> are HTML and skip the regex check
	match=[null,selector,null];}else {match=rquickExpr.exec(selector);} // Match html or make sure no context is specified for #id
	if(match&&(match[1]||!context)){ // HANDLE: $(html) -> $(array)
	if(match[1]){context=context instanceof jQuery?context[0]:context; // Option to run scripts is true for back-compat
	// Intentionally let the error be thrown if parseHTML is not present
	jQuery.merge(this,jQuery.parseHTML(match[1],context&&context.nodeType?context.ownerDocument||context:document,true)); // HANDLE: $(html, props)
	if(rsingleTag.test(match[1])&&jQuery.isPlainObject(context)){for(match in context){ // Properties of context are called as methods if possible
	if(jQuery.isFunction(this[match])){this[match](context[match]); // ...and otherwise set as attributes
	}else {this.attr(match,context[match]);}}}return this; // HANDLE: $(#id)
	}else {elem=document.getElementById(match[2]); // Support: Blackberry 4.6
	// gEBID returns nodes no longer in the document (#6963)
	if(elem&&elem.parentNode){ // Inject the element directly into the jQuery object
	this.length=1;this[0]=elem;}this.context=document;this.selector=selector;return this;} // HANDLE: $(expr, $(...))
	}else if(!context||context.jquery){return (context||root).find(selector); // HANDLE: $(expr, context)
	// (which is just equivalent to: $(context).find(expr)
	}else {return this.constructor(context).find(selector);} // HANDLE: $(DOMElement)
	}else if(selector.nodeType){this.context=this[0]=selector;this.length=1;return this; // HANDLE: $(function)
	// Shortcut for document ready
	}else if(jQuery.isFunction(selector)){return root.ready!==undefined?root.ready(selector): // Execute immediately if ready is not present
	selector(jQuery);}if(selector.selector!==undefined){this.selector=selector.selector;this.context=selector.context;}return jQuery.makeArray(selector,this);}; // Give the init function the jQuery prototype for later instantiation
	init.prototype=jQuery.fn; // Initialize central reference
	rootjQuery=jQuery(document);var rparentsprev=/^(?:parents|prev(?:Until|All))/, // Methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique={children:true,contents:true,next:true,prev:true};jQuery.fn.extend({has:function has(target){var targets=jQuery(target,this),l=targets.length;return this.filter(function(){var i=0;for(;i<l;i++){if(jQuery.contains(this,targets[i])){return true;}}});},closest:function closest(selectors,context){var cur,i=0,l=this.length,matched=[],pos=rneedsContext.test(selectors)||typeof selectors!=="string"?jQuery(selectors,context||this.context):0;for(;i<l;i++){for(cur=this[i];cur&&cur!==context;cur=cur.parentNode){ // Always skip document fragments
	if(cur.nodeType<11&&(pos?pos.index(cur)>-1: // Don't pass non-elements to Sizzle
	cur.nodeType===1&&jQuery.find.matchesSelector(cur,selectors))){matched.push(cur);break;}}}return this.pushStack(matched.length>1?jQuery.uniqueSort(matched):matched);}, // Determine the position of an element within the set
	index:function index(elem){ // No argument, return index in parent
	if(!elem){return this[0]&&this[0].parentNode?this.first().prevAll().length:-1;} // Index in selector
	if(typeof elem==="string"){return indexOf.call(jQuery(elem),this[0]);} // Locate the position of the desired element
	return indexOf.call(this, // If it receives a jQuery object, the first element is used
	elem.jquery?elem[0]:elem);},add:function add(selector,context){return this.pushStack(jQuery.uniqueSort(jQuery.merge(this.get(),jQuery(selector,context))));},addBack:function addBack(selector){return this.add(selector==null?this.prevObject:this.prevObject.filter(selector));}});function sibling(cur,dir){while((cur=cur[dir])&&cur.nodeType!==1){}return cur;}jQuery.each({parent:function parent(elem){var parent=elem.parentNode;return parent&&parent.nodeType!==11?parent:null;},parents:function parents(elem){return dir(elem,"parentNode");},parentsUntil:function parentsUntil(elem,i,until){return dir(elem,"parentNode",until);},next:function next(elem){return sibling(elem,"nextSibling");},prev:function prev(elem){return sibling(elem,"previousSibling");},nextAll:function nextAll(elem){return dir(elem,"nextSibling");},prevAll:function prevAll(elem){return dir(elem,"previousSibling");},nextUntil:function nextUntil(elem,i,until){return dir(elem,"nextSibling",until);},prevUntil:function prevUntil(elem,i,until){return dir(elem,"previousSibling",until);},siblings:function siblings(elem){return _siblings((elem.parentNode||{}).firstChild,elem);},children:function children(elem){return _siblings(elem.firstChild);},contents:function contents(elem){return elem.contentDocument||jQuery.merge([],elem.childNodes);}},function(name,fn){jQuery.fn[name]=function(until,selector){var matched=jQuery.map(this,fn,until);if(name.slice(-5)!=="Until"){selector=until;}if(selector&&typeof selector==="string"){matched=jQuery.filter(selector,matched);}if(this.length>1){ // Remove duplicates
	if(!guaranteedUnique[name]){jQuery.uniqueSort(matched);} // Reverse order for parents* and prev-derivatives
	if(rparentsprev.test(name)){matched.reverse();}}return this.pushStack(matched);};});var rnotwhite=/\S+/g; // Convert String-formatted options into Object-formatted ones
	function createOptions(options){var object={};jQuery.each(options.match(rnotwhite)||[],function(_,flag){object[flag]=true;});return object;} /*
	 * Create a callback list using the following parameters:
	 *
	 *	options: an optional list of space-separated options that will change how
	 *			the callback list behaves or a more traditional option object
	 *
	 * By default a callback list will act like an event callback list and can be
	 * "fired" multiple times.
	 *
	 * Possible options:
	 *
	 *	once:			will ensure the callback list can only be fired once (like a Deferred)
	 *
	 *	memory:			will keep track of previous values and will call any callback added
	 *					after the list has been fired right away with the latest "memorized"
	 *					values (like a Deferred)
	 *
	 *	unique:			will ensure a callback can only be added once (no duplicate in the list)
	 *
	 *	stopOnFalse:	interrupt callings when a callback returns false
	 *
	 */jQuery.Callbacks=function(options){ // Convert options from String-formatted to Object-formatted if needed
	// (we check in cache first)
	options=typeof options==="string"?createOptions(options):jQuery.extend({},options);var  // Flag to know if list is currently firing
	firing, // Last fire value for non-forgettable lists
	memory, // Flag to know if list was already fired
	_fired, // Flag to prevent firing
	_locked, // Actual callback list
	list=[], // Queue of execution data for repeatable lists
	queue=[], // Index of currently firing callback (modified by add/remove as needed)
	firingIndex=-1, // Fire callbacks
	fire=function fire(){ // Enforce single-firing
	_locked=options.once; // Execute callbacks for all pending executions,
	// respecting firingIndex overrides and runtime changes
	_fired=firing=true;for(;queue.length;firingIndex=-1){memory=queue.shift();while(++firingIndex<list.length){ // Run callback and check for early termination
	if(list[firingIndex].apply(memory[0],memory[1])===false&&options.stopOnFalse){ // Jump to end and forget the data so .add doesn't re-fire
	firingIndex=list.length;memory=false;}}} // Forget the data if we're done with it
	if(!options.memory){memory=false;}firing=false; // Clean up if we're done firing for good
	if(_locked){ // Keep an empty list if we have data for future add calls
	if(memory){list=[]; // Otherwise, this object is spent
	}else {list="";}}}, // Actual Callbacks object
	self={ // Add a callback or a collection of callbacks to the list
	add:function add(){if(list){ // If we have memory from a past run, we should fire after adding
	if(memory&&!firing){firingIndex=list.length-1;queue.push(memory);}(function add(args){jQuery.each(args,function(_,arg){if(jQuery.isFunction(arg)){if(!options.unique||!self.has(arg)){list.push(arg);}}else if(arg&&arg.length&&jQuery.type(arg)!=="string"){ // Inspect recursively
	add(arg);}});})(arguments);if(memory&&!firing){fire();}}return this;}, // Remove a callback from the list
	remove:function remove(){jQuery.each(arguments,function(_,arg){var index;while((index=jQuery.inArray(arg,list,index))>-1){list.splice(index,1); // Handle firing indexes
	if(index<=firingIndex){firingIndex--;}}});return this;}, // Check if a given callback is in the list.
	// If no argument is given, return whether or not list has callbacks attached.
	has:function has(fn){return fn?jQuery.inArray(fn,list)>-1:list.length>0;}, // Remove all callbacks from the list
	empty:function empty(){if(list){list=[];}return this;}, // Disable .fire and .add
	// Abort any current/pending executions
	// Clear all callbacks and values
	disable:function disable(){_locked=queue=[];list=memory="";return this;},disabled:function disabled(){return !list;}, // Disable .fire
	// Also disable .add unless we have memory (since it would have no effect)
	// Abort any pending executions
	lock:function lock(){_locked=queue=[];if(!memory){list=memory="";}return this;},locked:function locked(){return !!_locked;}, // Call all callbacks with the given context and arguments
	fireWith:function fireWith(context,args){if(!_locked){args=args||[];args=[context,args.slice?args.slice():args];queue.push(args);if(!firing){fire();}}return this;}, // Call all the callbacks with the given arguments
	fire:function fire(){self.fireWith(this,arguments);return this;}, // To know if the callbacks have already been called at least once
	fired:function fired(){return !!_fired;}};return self;};jQuery.extend({Deferred:function Deferred(func){var tuples=[ // action, add listener, listener list, final state
	["resolve","done",jQuery.Callbacks("once memory"),"resolved"],["reject","fail",jQuery.Callbacks("once memory"),"rejected"],["notify","progress",jQuery.Callbacks("memory")]],_state="pending",_promise={state:function state(){return _state;},always:function always(){deferred.done(arguments).fail(arguments);return this;},then:function then() /* fnDone, fnFail, fnProgress */{var fns=arguments;return jQuery.Deferred(function(newDefer){jQuery.each(tuples,function(i,tuple){var fn=jQuery.isFunction(fns[i])&&fns[i]; // deferred[ done | fail | progress ] for forwarding actions to newDefer
	deferred[tuple[1]](function(){var returned=fn&&fn.apply(this,arguments);if(returned&&jQuery.isFunction(returned.promise)){returned.promise().progress(newDefer.notify).done(newDefer.resolve).fail(newDefer.reject);}else {newDefer[tuple[0]+"With"](this===_promise?newDefer.promise():this,fn?[returned]:arguments);}});});fns=null;}).promise();}, // Get a promise for this deferred
	// If obj is provided, the promise aspect is added to the object
	promise:function promise(obj){return obj!=null?jQuery.extend(obj,_promise):_promise;}},deferred={}; // Keep pipe for back-compat
	_promise.pipe=_promise.then; // Add list-specific methods
	jQuery.each(tuples,function(i,tuple){var list=tuple[2],stateString=tuple[3]; // promise[ done | fail | progress ] = list.add
	_promise[tuple[1]]=list.add; // Handle state
	if(stateString){list.add(function(){ // state = [ resolved | rejected ]
	_state=stateString; // [ reject_list | resolve_list ].disable; progress_list.lock
	},tuples[i^1][2].disable,tuples[2][2].lock);} // deferred[ resolve | reject | notify ]
	deferred[tuple[0]]=function(){deferred[tuple[0]+"With"](this===deferred?_promise:this,arguments);return this;};deferred[tuple[0]+"With"]=list.fireWith;}); // Make the deferred a promise
	_promise.promise(deferred); // Call given func if any
	if(func){func.call(deferred,deferred);} // All done!
	return deferred;}, // Deferred helper
	when:function when(subordinate /* , ..., subordinateN */){var i=0,resolveValues=_slice.call(arguments),length=resolveValues.length, // the count of uncompleted subordinates
	remaining=length!==1||subordinate&&jQuery.isFunction(subordinate.promise)?length:0, // the master Deferred.
	// If resolveValues consist of only a single Deferred, just use that.
	deferred=remaining===1?subordinate:jQuery.Deferred(), // Update function for both resolve and progress values
	updateFunc=function updateFunc(i,contexts,values){return function(value){contexts[i]=this;values[i]=arguments.length>1?_slice.call(arguments):value;if(values===progressValues){deferred.notifyWith(contexts,values);}else if(! --remaining){deferred.resolveWith(contexts,values);}};},progressValues,progressContexts,resolveContexts; // Add listeners to Deferred subordinates; treat others as resolved
	if(length>1){progressValues=new Array(length);progressContexts=new Array(length);resolveContexts=new Array(length);for(;i<length;i++){if(resolveValues[i]&&jQuery.isFunction(resolveValues[i].promise)){resolveValues[i].promise().progress(updateFunc(i,progressContexts,progressValues)).done(updateFunc(i,resolveContexts,resolveValues)).fail(deferred.reject);}else {--remaining;}}} // If we're not waiting on anything, resolve the master
	if(!remaining){deferred.resolveWith(resolveContexts,resolveValues);}return deferred.promise();}}); // The deferred used on DOM ready
	var readyList;jQuery.fn.ready=function(fn){ // Add the callback
	jQuery.ready.promise().done(fn);return this;};jQuery.extend({ // Is the DOM ready to be used? Set to true once it occurs.
	isReady:false, // A counter to track how many items to wait for before
	// the ready event fires. See #6781
	readyWait:1, // Hold (or release) the ready event
	holdReady:function holdReady(hold){if(hold){jQuery.readyWait++;}else {jQuery.ready(true);}}, // Handle when the DOM is ready
	ready:function ready(wait){ // Abort if there are pending holds or we're already ready
	if(wait===true?--jQuery.readyWait:jQuery.isReady){return;} // Remember that the DOM is ready
	jQuery.isReady=true; // If a normal DOM Ready event fired, decrement, and wait if need be
	if(wait!==true&&--jQuery.readyWait>0){return;} // If there are functions bound, to execute
	readyList.resolveWith(document,[jQuery]); // Trigger any bound ready events
	if(jQuery.fn.triggerHandler){jQuery(document).triggerHandler("ready");jQuery(document).off("ready");}}}); /**
	 * The ready event handler and self cleanup method
	 */function completed(){document.removeEventListener("DOMContentLoaded",completed);window.removeEventListener("load",completed);jQuery.ready();}jQuery.ready.promise=function(obj){if(!readyList){readyList=jQuery.Deferred(); // Catch cases where $(document).ready() is called
	// after the browser event has already occurred.
	// Support: IE9-10 only
	// Older IE sometimes signals "interactive" too soon
	if(document.readyState==="complete"||document.readyState!=="loading"&&!document.documentElement.doScroll){ // Handle it asynchronously to allow scripts the opportunity to delay ready
	window.setTimeout(jQuery.ready);}else { // Use the handy event callback
	document.addEventListener("DOMContentLoaded",completed); // A fallback to window.onload, that will always work
	window.addEventListener("load",completed);}}return readyList.promise(obj);}; // Kick off the DOM ready check even if the user does not
	jQuery.ready.promise(); // Multifunctional method to get and set values of a collection
	// The value/s can optionally be executed if it's a function
	var access=function access(elems,fn,key,value,chainable,emptyGet,raw){var i=0,len=elems.length,bulk=key==null; // Sets many values
	if(jQuery.type(key)==="object"){chainable=true;for(i in key){access(elems,fn,i,key[i],true,emptyGet,raw);} // Sets one value
	}else if(value!==undefined){chainable=true;if(!jQuery.isFunction(value)){raw=true;}if(bulk){ // Bulk operations run against the entire set
	if(raw){fn.call(elems,value);fn=null; // ...except when executing function values
	}else {bulk=fn;fn=function fn(elem,key,value){return bulk.call(jQuery(elem),value);};}}if(fn){for(;i<len;i++){fn(elems[i],key,raw?value:value.call(elems[i],i,fn(elems[i],key)));}}}return chainable?elems: // Gets
	bulk?fn.call(elems):len?fn(elems[0],key):emptyGet;};var acceptData=function acceptData(owner){ // Accepts only:
	//  - Node
	//    - Node.ELEMENT_NODE
	//    - Node.DOCUMENT_NODE
	//  - Object
	//    - Any
	/* jshint -W018 */return owner.nodeType===1||owner.nodeType===9||! +owner.nodeType;};function Data(){this.expando=jQuery.expando+Data.uid++;}Data.uid=1;Data.prototype={register:function register(owner,initial){var value=initial||{}; // If it is a node unlikely to be stringify-ed or looped over
	// use plain assignment
	if(owner.nodeType){owner[this.expando]=value; // Otherwise secure it in a non-enumerable, non-writable property
	// configurability must be true to allow the property to be
	// deleted with the delete operator
	}else {Object.defineProperty(owner,this.expando,{value:value,writable:true,configurable:true});}return owner[this.expando];},cache:function cache(owner){ // We can accept data for non-element nodes in modern browsers,
	// but we should not, see #8335.
	// Always return an empty object.
	if(!acceptData(owner)){return {};} // Check if the owner object already has a cache
	var value=owner[this.expando]; // If not, create one
	if(!value){value={}; // We can accept data for non-element nodes in modern browsers,
	// but we should not, see #8335.
	// Always return an empty object.
	if(acceptData(owner)){ // If it is a node unlikely to be stringify-ed or looped over
	// use plain assignment
	if(owner.nodeType){owner[this.expando]=value; // Otherwise secure it in a non-enumerable property
	// configurable must be true to allow the property to be
	// deleted when data is removed
	}else {Object.defineProperty(owner,this.expando,{value:value,configurable:true});}}}return value;},set:function set(owner,data,value){var prop,cache=this.cache(owner); // Handle: [ owner, key, value ] args
	if(typeof data==="string"){cache[data]=value; // Handle: [ owner, { properties } ] args
	}else { // Copy the properties one-by-one to the cache object
	for(prop in data){cache[prop]=data[prop];}}return cache;},get:function get(owner,key){return key===undefined?this.cache(owner):owner[this.expando]&&owner[this.expando][key];},access:function access(owner,key,value){var stored; // In cases where either:
	//
	//   1. No key was specified
	//   2. A string key was specified, but no value provided
	//
	// Take the "read" path and allow the get method to determine
	// which value to return, respectively either:
	//
	//   1. The entire cache object
	//   2. The data stored at the key
	//
	if(key===undefined||key&&typeof key==="string"&&value===undefined){stored=this.get(owner,key);return stored!==undefined?stored:this.get(owner,jQuery.camelCase(key));} // When the key is not a string, or both a key and value
	// are specified, set or extend (existing objects) with either:
	//
	//   1. An object of properties
	//   2. A key and value
	//
	this.set(owner,key,value); // Since the "set" path can have two possible entry points
	// return the expected data based on which path was taken[*]
	return value!==undefined?value:key;},remove:function remove(owner,key){var i,name,camel,cache=owner[this.expando];if(cache===undefined){return;}if(key===undefined){this.register(owner);}else { // Support array or space separated string of keys
	if(jQuery.isArray(key)){ // If "name" is an array of keys...
	// When data is initially created, via ("key", "val") signature,
	// keys will be converted to camelCase.
	// Since there is no way to tell _how_ a key was added, remove
	// both plain key and camelCase key. #12786
	// This will only penalize the array argument path.
	name=key.concat(key.map(jQuery.camelCase));}else {camel=jQuery.camelCase(key); // Try the string as a key before any manipulation
	if(key in cache){name=[key,camel];}else { // If a key with the spaces exists, use it.
	// Otherwise, create an array by matching non-whitespace
	name=camel;name=name in cache?[name]:name.match(rnotwhite)||[];}}i=name.length;while(i--){delete cache[name[i]];}} // Remove the expando if there's no more data
	if(key===undefined||jQuery.isEmptyObject(cache)){ // Support: Chrome <= 35-45+
	// Webkit & Blink performance suffers when deleting properties
	// from DOM nodes, so set to undefined instead
	// https://code.google.com/p/chromium/issues/detail?id=378607
	if(owner.nodeType){owner[this.expando]=undefined;}else {delete owner[this.expando];}}},hasData:function hasData(owner){var cache=owner[this.expando];return cache!==undefined&&!jQuery.isEmptyObject(cache);}};var dataPriv=new Data();var dataUser=new Data(); //	Implementation Summary
	//
	//	1. Enforce API surface and semantic compatibility with 1.9.x branch
	//	2. Improve the module's maintainability by reducing the storage
	//		paths to a single mechanism.
	//	3. Use the same single mechanism to support "private" and "user" data.
	//	4. _Never_ expose "private" data to user code (TODO: Drop _data, _removeData)
	//	5. Avoid exposing implementation details on user objects (eg. expando properties)
	//	6. Provide a clear path for implementation upgrade to WeakMap in 2014
	var rbrace=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,rmultiDash=/[A-Z]/g;function dataAttr(elem,key,data){var name; // If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if(data===undefined&&elem.nodeType===1){name="data-"+key.replace(rmultiDash,"-$&").toLowerCase();data=elem.getAttribute(name);if(typeof data==="string"){try{data=data==="true"?true:data==="false"?false:data==="null"?null: // Only convert to a number if it doesn't change the string
	+data+""===data?+data:rbrace.test(data)?jQuery.parseJSON(data):data;}catch(e){} // Make sure we set the data so it isn't changed later
	dataUser.set(elem,key,data);}else {data=undefined;}}return data;}jQuery.extend({hasData:function hasData(elem){return dataUser.hasData(elem)||dataPriv.hasData(elem);},data:function data(elem,name,_data){return dataUser.access(elem,name,_data);},removeData:function removeData(elem,name){dataUser.remove(elem,name);}, // TODO: Now that all calls to _data and _removeData have been replaced
	// with direct calls to dataPriv methods, these can be deprecated.
	_data:function _data(elem,name,data){return dataPriv.access(elem,name,data);},_removeData:function _removeData(elem,name){dataPriv.remove(elem,name);}});jQuery.fn.extend({data:function data(key,value){var i,name,data,elem=this[0],attrs=elem&&elem.attributes; // Gets all values
	if(key===undefined){if(this.length){data=dataUser.get(elem);if(elem.nodeType===1&&!dataPriv.get(elem,"hasDataAttrs")){i=attrs.length;while(i--){ // Support: IE11+
	// The attrs elements can be null (#14894)
	if(attrs[i]){name=attrs[i].name;if(name.indexOf("data-")===0){name=jQuery.camelCase(name.slice(5));dataAttr(elem,name,data[name]);}}}dataPriv.set(elem,"hasDataAttrs",true);}}return data;} // Sets multiple values
	if((typeof key==="undefined"?"undefined":_typeof(key))==="object"){return this.each(function(){dataUser.set(this,key);});}return access(this,function(value){var data,camelKey; // The calling jQuery object (element matches) is not empty
	// (and therefore has an element appears at this[ 0 ]) and the
	// `value` parameter was not undefined. An empty jQuery object
	// will result in `undefined` for elem = this[ 0 ] which will
	// throw an exception if an attempt to read a data cache is made.
	if(elem&&value===undefined){ // Attempt to get data from the cache
	// with the key as-is
	data=dataUser.get(elem,key)|| // Try to find dashed key if it exists (gh-2779)
	// This is for 2.2.x only
	dataUser.get(elem,key.replace(rmultiDash,"-$&").toLowerCase());if(data!==undefined){return data;}camelKey=jQuery.camelCase(key); // Attempt to get data from the cache
	// with the key camelized
	data=dataUser.get(elem,camelKey);if(data!==undefined){return data;} // Attempt to "discover" the data in
	// HTML5 custom data-* attrs
	data=dataAttr(elem,camelKey,undefined);if(data!==undefined){return data;} // We tried really hard, but the data doesn't exist.
	return;} // Set the data...
	camelKey=jQuery.camelCase(key);this.each(function(){ // First, attempt to store a copy or reference of any
	// data that might've been store with a camelCased key.
	var data=dataUser.get(this,camelKey); // For HTML5 data-* attribute interop, we have to
	// store property names with dashes in a camelCase form.
	// This might not apply to all properties...*
	dataUser.set(this,camelKey,value); // *... In the case of properties that might _actually_
	// have dashes, we need to also store a copy of that
	// unchanged property.
	if(key.indexOf("-")>-1&&data!==undefined){dataUser.set(this,key,value);}});},null,value,arguments.length>1,null,true);},removeData:function removeData(key){return this.each(function(){dataUser.remove(this,key);});}});jQuery.extend({queue:function queue(elem,type,data){var queue;if(elem){type=(type||"fx")+"queue";queue=dataPriv.get(elem,type); // Speed up dequeue by getting out quickly if this is just a lookup
	if(data){if(!queue||jQuery.isArray(data)){queue=dataPriv.access(elem,type,jQuery.makeArray(data));}else {queue.push(data);}}return queue||[];}},dequeue:function dequeue(elem,type){type=type||"fx";var queue=jQuery.queue(elem,type),startLength=queue.length,fn=queue.shift(),hooks=jQuery._queueHooks(elem,type),next=function next(){jQuery.dequeue(elem,type);}; // If the fx queue is dequeued, always remove the progress sentinel
	if(fn==="inprogress"){fn=queue.shift();startLength--;}if(fn){ // Add a progress sentinel to prevent the fx queue from being
	// automatically dequeued
	if(type==="fx"){queue.unshift("inprogress");} // Clear up the last queue stop function
	delete hooks.stop;fn.call(elem,next,hooks);}if(!startLength&&hooks){hooks.empty.fire();}}, // Not public - generate a queueHooks object, or return the current one
	_queueHooks:function _queueHooks(elem,type){var key=type+"queueHooks";return dataPriv.get(elem,key)||dataPriv.access(elem,key,{empty:jQuery.Callbacks("once memory").add(function(){dataPriv.remove(elem,[type+"queue",key]);})});}});jQuery.fn.extend({queue:function queue(type,data){var setter=2;if(typeof type!=="string"){data=type;type="fx";setter--;}if(arguments.length<setter){return jQuery.queue(this[0],type);}return data===undefined?this:this.each(function(){var queue=jQuery.queue(this,type,data); // Ensure a hooks for this queue
	jQuery._queueHooks(this,type);if(type==="fx"&&queue[0]!=="inprogress"){jQuery.dequeue(this,type);}});},dequeue:function dequeue(type){return this.each(function(){jQuery.dequeue(this,type);});},clearQueue:function clearQueue(type){return this.queue(type||"fx",[]);}, // Get a promise resolved when queues of a certain type
	// are emptied (fx is the type by default)
	promise:function promise(type,obj){var tmp,count=1,defer=jQuery.Deferred(),elements=this,i=this.length,resolve=function resolve(){if(! --count){defer.resolveWith(elements,[elements]);}};if(typeof type!=="string"){obj=type;type=undefined;}type=type||"fx";while(i--){tmp=dataPriv.get(elements[i],type+"queueHooks");if(tmp&&tmp.empty){count++;tmp.empty.add(resolve);}}resolve();return defer.promise(obj);}});var pnum=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;var rcssNum=new RegExp("^(?:([+-])=|)("+pnum+")([a-z%]*)$","i");var cssExpand=["Top","Right","Bottom","Left"];var isHidden=function isHidden(elem,el){ // isHidden might be called from jQuery#filter function;
	// in that case, element will be second argument
	elem=el||elem;return jQuery.css(elem,"display")==="none"||!jQuery.contains(elem.ownerDocument,elem);};function adjustCSS(elem,prop,valueParts,tween){var adjusted,scale=1,maxIterations=20,currentValue=tween?function(){return tween.cur();}:function(){return jQuery.css(elem,prop,"");},initial=currentValue(),unit=valueParts&&valueParts[3]||(jQuery.cssNumber[prop]?"":"px"), // Starting value computation is required for potential unit mismatches
	initialInUnit=(jQuery.cssNumber[prop]||unit!=="px"&&+initial)&&rcssNum.exec(jQuery.css(elem,prop));if(initialInUnit&&initialInUnit[3]!==unit){ // Trust units reported by jQuery.css
	unit=unit||initialInUnit[3]; // Make sure we update the tween properties later on
	valueParts=valueParts||[]; // Iteratively approximate from a nonzero starting point
	initialInUnit=+initial||1;do { // If previous iteration zeroed out, double until we get *something*.
	// Use string for doubling so we don't accidentally see scale as unchanged below
	scale=scale||".5"; // Adjust and apply
	initialInUnit=initialInUnit/scale;jQuery.style(elem,prop,initialInUnit+unit); // Update scale, tolerating zero or NaN from tween.cur()
	// Break the loop if scale is unchanged or perfect, or if we've just had enough.
	}while(scale!==(scale=currentValue()/initial)&&scale!==1&&--maxIterations);}if(valueParts){initialInUnit=+initialInUnit||+initial||0; // Apply relative offset (+=/-=) if specified
	adjusted=valueParts[1]?initialInUnit+(valueParts[1]+1)*valueParts[2]:+valueParts[2];if(tween){tween.unit=unit;tween.start=initialInUnit;tween.end=adjusted;}}return adjusted;}var rcheckableType=/^(?:checkbox|radio)$/i;var rtagName=/<([\w:-]+)/;var rscriptType=/^$|\/(?:java|ecma)script/i; // We have to close these tags to support XHTML (#13200)
	var wrapMap={ // Support: IE9
	option:[1,"<select multiple='multiple'>","</select>"], // XHTML parsers do not magically insert elements in the
	// same way that tag soup parsers do. So we cannot shorten
	// this by omitting <tbody> or other required elements.
	thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]}; // Support: IE9
	wrapMap.optgroup=wrapMap.option;wrapMap.tbody=wrapMap.tfoot=wrapMap.colgroup=wrapMap.caption=wrapMap.thead;wrapMap.th=wrapMap.td;function getAll(context,tag){ // Support: IE9-11+
	// Use typeof to avoid zero-argument method invocation on host objects (#15151)
	var ret=typeof context.getElementsByTagName!=="undefined"?context.getElementsByTagName(tag||"*"):typeof context.querySelectorAll!=="undefined"?context.querySelectorAll(tag||"*"):[];return tag===undefined||tag&&jQuery.nodeName(context,tag)?jQuery.merge([context],ret):ret;} // Mark scripts as having already been evaluated
	function setGlobalEval(elems,refElements){var i=0,l=elems.length;for(;i<l;i++){dataPriv.set(elems[i],"globalEval",!refElements||dataPriv.get(refElements[i],"globalEval"));}}var rhtml=/<|&#?\w+;/;function buildFragment(elems,context,scripts,selection,ignored){var elem,tmp,tag,wrap,contains,j,fragment=context.createDocumentFragment(),nodes=[],i=0,l=elems.length;for(;i<l;i++){elem=elems[i];if(elem||elem===0){ // Add nodes directly
	if(jQuery.type(elem)==="object"){ // Support: Android<4.1, PhantomJS<2
	// push.apply(_, arraylike) throws on ancient WebKit
	jQuery.merge(nodes,elem.nodeType?[elem]:elem); // Convert non-html into a text node
	}else if(!rhtml.test(elem)){nodes.push(context.createTextNode(elem)); // Convert html into DOM nodes
	}else {tmp=tmp||fragment.appendChild(context.createElement("div")); // Deserialize a standard representation
	tag=(rtagName.exec(elem)||["",""])[1].toLowerCase();wrap=wrapMap[tag]||wrapMap._default;tmp.innerHTML=wrap[1]+jQuery.htmlPrefilter(elem)+wrap[2]; // Descend through wrappers to the right content
	j=wrap[0];while(j--){tmp=tmp.lastChild;} // Support: Android<4.1, PhantomJS<2
	// push.apply(_, arraylike) throws on ancient WebKit
	jQuery.merge(nodes,tmp.childNodes); // Remember the top-level container
	tmp=fragment.firstChild; // Ensure the created nodes are orphaned (#12392)
	tmp.textContent="";}}} // Remove wrapper from fragment
	fragment.textContent="";i=0;while(elem=nodes[i++]){ // Skip elements already in the context collection (trac-4087)
	if(selection&&jQuery.inArray(elem,selection)>-1){if(ignored){ignored.push(elem);}continue;}contains=jQuery.contains(elem.ownerDocument,elem); // Append to fragment
	tmp=getAll(fragment.appendChild(elem),"script"); // Preserve script evaluation history
	if(contains){setGlobalEval(tmp);} // Capture executables
	if(scripts){j=0;while(elem=tmp[j++]){if(rscriptType.test(elem.type||"")){scripts.push(elem);}}}}return fragment;}(function(){var fragment=document.createDocumentFragment(),div=fragment.appendChild(document.createElement("div")),input=document.createElement("input"); // Support: Android 4.0-4.3, Safari<=5.1
	// Check state lost if the name is set (#11217)
	// Support: Windows Web Apps (WWA)
	// `name` and `type` must use .setAttribute for WWA (#14901)
	input.setAttribute("type","radio");input.setAttribute("checked","checked");input.setAttribute("name","t");div.appendChild(input); // Support: Safari<=5.1, Android<4.2
	// Older WebKit doesn't clone checked state correctly in fragments
	support.checkClone=div.cloneNode(true).cloneNode(true).lastChild.checked; // Support: IE<=11+
	// Make sure textarea (and checkbox) defaultValue is properly cloned
	div.innerHTML="<textarea>x</textarea>";support.noCloneChecked=!!div.cloneNode(true).lastChild.defaultValue;})();var rkeyEvent=/^key/,rmouseEvent=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,rtypenamespace=/^([^.]*)(?:\.(.+)|)/;function returnTrue(){return true;}function returnFalse(){return false;} // Support: IE9
	// See #13393 for more info
	function safeActiveElement(){try{return document.activeElement;}catch(err){}}function _on(elem,types,selector,data,fn,one){var origFn,type; // Types can be a map of types/handlers
	if((typeof types==="undefined"?"undefined":_typeof(types))==="object"){ // ( types-Object, selector, data )
	if(typeof selector!=="string"){ // ( types-Object, data )
	data=data||selector;selector=undefined;}for(type in types){_on(elem,type,selector,data,types[type],one);}return elem;}if(data==null&&fn==null){ // ( types, fn )
	fn=selector;data=selector=undefined;}else if(fn==null){if(typeof selector==="string"){ // ( types, selector, fn )
	fn=data;data=undefined;}else { // ( types, data, fn )
	fn=data;data=selector;selector=undefined;}}if(fn===false){fn=returnFalse;}else if(!fn){return elem;}if(one===1){origFn=fn;fn=function fn(event){ // Can use an empty set, since event contains the info
	jQuery().off(event);return origFn.apply(this,arguments);}; // Use same guid so caller can remove using origFn
	fn.guid=origFn.guid||(origFn.guid=jQuery.guid++);}return elem.each(function(){jQuery.event.add(this,types,fn,data,selector);});} /*
	 * Helper functions for managing events -- not part of the public interface.
	 * Props to Dean Edwards' addEvent library for many of the ideas.
	 */jQuery.event={global:{},add:function add(elem,types,handler,data,selector){var handleObjIn,eventHandle,tmp,events,t,handleObj,special,handlers,type,namespaces,origType,elemData=dataPriv.get(elem); // Don't attach events to noData or text/comment nodes (but allow plain objects)
	if(!elemData){return;} // Caller can pass in an object of custom data in lieu of the handler
	if(handler.handler){handleObjIn=handler;handler=handleObjIn.handler;selector=handleObjIn.selector;} // Make sure that the handler has a unique ID, used to find/remove it later
	if(!handler.guid){handler.guid=jQuery.guid++;} // Init the element's event structure and main handler, if this is the first
	if(!(events=elemData.events)){events=elemData.events={};}if(!(eventHandle=elemData.handle)){eventHandle=elemData.handle=function(e){ // Discard the second event of a jQuery.event.trigger() and
	// when an event is called after a page has unloaded
	return typeof jQuery!=="undefined"&&jQuery.event.triggered!==e.type?jQuery.event.dispatch.apply(elem,arguments):undefined;};} // Handle multiple events separated by a space
	types=(types||"").match(rnotwhite)||[""];t=types.length;while(t--){tmp=rtypenamespace.exec(types[t])||[];type=origType=tmp[1];namespaces=(tmp[2]||"").split(".").sort(); // There *must* be a type, no attaching namespace-only handlers
	if(!type){continue;} // If event changes its type, use the special event handlers for the changed type
	special=jQuery.event.special[type]||{}; // If selector defined, determine special event api type, otherwise given type
	type=(selector?special.delegateType:special.bindType)||type; // Update special based on newly reset type
	special=jQuery.event.special[type]||{}; // handleObj is passed to all event handlers
	handleObj=jQuery.extend({type:type,origType:origType,data:data,handler:handler,guid:handler.guid,selector:selector,needsContext:selector&&jQuery.expr.match.needsContext.test(selector),namespace:namespaces.join(".")},handleObjIn); // Init the event handler queue if we're the first
	if(!(handlers=events[type])){handlers=events[type]=[];handlers.delegateCount=0; // Only use addEventListener if the special events handler returns false
	if(!special.setup||special.setup.call(elem,data,namespaces,eventHandle)===false){if(elem.addEventListener){elem.addEventListener(type,eventHandle);}}}if(special.add){special.add.call(elem,handleObj);if(!handleObj.handler.guid){handleObj.handler.guid=handler.guid;}} // Add to the element's handler list, delegates in front
	if(selector){handlers.splice(handlers.delegateCount++,0,handleObj);}else {handlers.push(handleObj);} // Keep track of which events have ever been used, for event optimization
	jQuery.event.global[type]=true;}}, // Detach an event or set of events from an element
	remove:function remove(elem,types,handler,selector,mappedTypes){var j,origCount,tmp,events,t,handleObj,special,handlers,type,namespaces,origType,elemData=dataPriv.hasData(elem)&&dataPriv.get(elem);if(!elemData||!(events=elemData.events)){return;} // Once for each type.namespace in types; type may be omitted
	types=(types||"").match(rnotwhite)||[""];t=types.length;while(t--){tmp=rtypenamespace.exec(types[t])||[];type=origType=tmp[1];namespaces=(tmp[2]||"").split(".").sort(); // Unbind all events (on this namespace, if provided) for the element
	if(!type){for(type in events){jQuery.event.remove(elem,type+types[t],handler,selector,true);}continue;}special=jQuery.event.special[type]||{};type=(selector?special.delegateType:special.bindType)||type;handlers=events[type]||[];tmp=tmp[2]&&new RegExp("(^|\\.)"+namespaces.join("\\.(?:.*\\.|)")+"(\\.|$)"); // Remove matching events
	origCount=j=handlers.length;while(j--){handleObj=handlers[j];if((mappedTypes||origType===handleObj.origType)&&(!handler||handler.guid===handleObj.guid)&&(!tmp||tmp.test(handleObj.namespace))&&(!selector||selector===handleObj.selector||selector==="**"&&handleObj.selector)){handlers.splice(j,1);if(handleObj.selector){handlers.delegateCount--;}if(special.remove){special.remove.call(elem,handleObj);}}} // Remove generic event handler if we removed something and no more handlers exist
	// (avoids potential for endless recursion during removal of special event handlers)
	if(origCount&&!handlers.length){if(!special.teardown||special.teardown.call(elem,namespaces,elemData.handle)===false){jQuery.removeEvent(elem,type,elemData.handle);}delete events[type];}} // Remove data and the expando if it's no longer used
	if(jQuery.isEmptyObject(events)){dataPriv.remove(elem,"handle events");}},dispatch:function dispatch(event){ // Make a writable jQuery.Event from the native event object
	event=jQuery.event.fix(event);var i,j,ret,matched,handleObj,handlerQueue=[],args=_slice.call(arguments),handlers=(dataPriv.get(this,"events")||{})[event.type]||[],special=jQuery.event.special[event.type]||{}; // Use the fix-ed jQuery.Event rather than the (read-only) native event
	args[0]=event;event.delegateTarget=this; // Call the preDispatch hook for the mapped type, and let it bail if desired
	if(special.preDispatch&&special.preDispatch.call(this,event)===false){return;} // Determine handlers
	handlerQueue=jQuery.event.handlers.call(this,event,handlers); // Run delegates first; they may want to stop propagation beneath us
	i=0;while((matched=handlerQueue[i++])&&!event.isPropagationStopped()){event.currentTarget=matched.elem;j=0;while((handleObj=matched.handlers[j++])&&!event.isImmediatePropagationStopped()){ // Triggered event must either 1) have no namespace, or 2) have namespace(s)
	// a subset or equal to those in the bound event (both can have no namespace).
	if(!event.rnamespace||event.rnamespace.test(handleObj.namespace)){event.handleObj=handleObj;event.data=handleObj.data;ret=((jQuery.event.special[handleObj.origType]||{}).handle||handleObj.handler).apply(matched.elem,args);if(ret!==undefined){if((event.result=ret)===false){event.preventDefault();event.stopPropagation();}}}}} // Call the postDispatch hook for the mapped type
	if(special.postDispatch){special.postDispatch.call(this,event);}return event.result;},handlers:function handlers(event,_handlers){var i,matches,sel,handleObj,handlerQueue=[],delegateCount=_handlers.delegateCount,cur=event.target; // Support (at least): Chrome, IE9
	// Find delegate handlers
	// Black-hole SVG <use> instance trees (#13180)
	//
	// Support: Firefox<=42+
	// Avoid non-left-click in FF but don't block IE radio events (#3861, gh-2343)
	if(delegateCount&&cur.nodeType&&(event.type!=="click"||isNaN(event.button)||event.button<1)){for(;cur!==this;cur=cur.parentNode||this){ // Don't check non-elements (#13208)
	// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
	if(cur.nodeType===1&&(cur.disabled!==true||event.type!=="click")){matches=[];for(i=0;i<delegateCount;i++){handleObj=_handlers[i]; // Don't conflict with Object.prototype properties (#13203)
	sel=handleObj.selector+" ";if(matches[sel]===undefined){matches[sel]=handleObj.needsContext?jQuery(sel,this).index(cur)>-1:jQuery.find(sel,this,null,[cur]).length;}if(matches[sel]){matches.push(handleObj);}}if(matches.length){handlerQueue.push({elem:cur,handlers:matches});}}}} // Add the remaining (directly-bound) handlers
	if(delegateCount<_handlers.length){handlerQueue.push({elem:this,handlers:_handlers.slice(delegateCount)});}return handlerQueue;}, // Includes some event props shared by KeyEvent and MouseEvent
	props:("altKey bubbles cancelable ctrlKey currentTarget detail eventPhase "+"metaKey relatedTarget shiftKey target timeStamp view which").split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function filter(event,original){ // Add which for key events
	if(event.which==null){event.which=original.charCode!=null?original.charCode:original.keyCode;}return event;}},mouseHooks:{props:("button buttons clientX clientY offsetX offsetY pageX pageY "+"screenX screenY toElement").split(" "),filter:function filter(event,original){var eventDoc,doc,body,button=original.button; // Calculate pageX/Y if missing and clientX/Y available
	if(event.pageX==null&&original.clientX!=null){eventDoc=event.target.ownerDocument||document;doc=eventDoc.documentElement;body=eventDoc.body;event.pageX=original.clientX+(doc&&doc.scrollLeft||body&&body.scrollLeft||0)-(doc&&doc.clientLeft||body&&body.clientLeft||0);event.pageY=original.clientY+(doc&&doc.scrollTop||body&&body.scrollTop||0)-(doc&&doc.clientTop||body&&body.clientTop||0);} // Add which for click: 1 === left; 2 === middle; 3 === right
	// Note: button is not normalized, so don't use it
	if(!event.which&&button!==undefined){event.which=button&1?1:button&2?3:button&4?2:0;}return event;}},fix:function fix(event){if(event[jQuery.expando]){return event;} // Create a writable copy of the event object and normalize some properties
	var i,prop,copy,type=event.type,originalEvent=event,fixHook=this.fixHooks[type];if(!fixHook){this.fixHooks[type]=fixHook=rmouseEvent.test(type)?this.mouseHooks:rkeyEvent.test(type)?this.keyHooks:{};}copy=fixHook.props?this.props.concat(fixHook.props):this.props;event=new jQuery.Event(originalEvent);i=copy.length;while(i--){prop=copy[i];event[prop]=originalEvent[prop];} // Support: Cordova 2.5 (WebKit) (#13255)
	// All events should have a target; Cordova deviceready doesn't
	if(!event.target){event.target=document;} // Support: Safari 6.0+, Chrome<28
	// Target should not be a text node (#504, #13143)
	if(event.target.nodeType===3){event.target=event.target.parentNode;}return fixHook.filter?fixHook.filter(event,originalEvent):event;},special:{load:{ // Prevent triggered image.load events from bubbling to window.load
	noBubble:true},focus:{ // Fire native event if possible so blur/focus sequence is correct
	trigger:function trigger(){if(this!==safeActiveElement()&&this.focus){this.focus();return false;}},delegateType:"focusin"},blur:{trigger:function trigger(){if(this===safeActiveElement()&&this.blur){this.blur();return false;}},delegateType:"focusout"},click:{ // For checkbox, fire native event so checked state will be right
	trigger:function trigger(){if(this.type==="checkbox"&&this.click&&jQuery.nodeName(this,"input")){this.click();return false;}}, // For cross-browser consistency, don't fire native .click() on links
	_default:function _default(event){return jQuery.nodeName(event.target,"a");}},beforeunload:{postDispatch:function postDispatch(event){ // Support: Firefox 20+
	// Firefox doesn't alert if the returnValue field is not set.
	if(event.result!==undefined&&event.originalEvent){event.originalEvent.returnValue=event.result;}}}}};jQuery.removeEvent=function(elem,type,handle){ // This "if" is needed for plain objects
	if(elem.removeEventListener){elem.removeEventListener(type,handle);}};jQuery.Event=function(src,props){ // Allow instantiation without the 'new' keyword
	if(!(this instanceof jQuery.Event)){return new jQuery.Event(src,props);} // Event object
	if(src&&src.type){this.originalEvent=src;this.type=src.type; // Events bubbling up the document may have been marked as prevented
	// by a handler lower down the tree; reflect the correct value.
	this.isDefaultPrevented=src.defaultPrevented||src.defaultPrevented===undefined&& // Support: Android<4.0
	src.returnValue===false?returnTrue:returnFalse; // Event type
	}else {this.type=src;} // Put explicitly provided properties onto the event object
	if(props){jQuery.extend(this,props);} // Create a timestamp if incoming event doesn't have one
	this.timeStamp=src&&src.timeStamp||jQuery.now(); // Mark it as fixed
	this[jQuery.expando]=true;}; // jQuery.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	jQuery.Event.prototype={constructor:jQuery.Event,isDefaultPrevented:returnFalse,isPropagationStopped:returnFalse,isImmediatePropagationStopped:returnFalse,preventDefault:function preventDefault(){var e=this.originalEvent;this.isDefaultPrevented=returnTrue;if(e){e.preventDefault();}},stopPropagation:function stopPropagation(){var e=this.originalEvent;this.isPropagationStopped=returnTrue;if(e){e.stopPropagation();}},stopImmediatePropagation:function stopImmediatePropagation(){var e=this.originalEvent;this.isImmediatePropagationStopped=returnTrue;if(e){e.stopImmediatePropagation();}this.stopPropagation();}}; // Create mouseenter/leave events using mouseover/out and event-time checks
	// so that event delegation works in jQuery.
	// Do the same for pointerenter/pointerleave and pointerover/pointerout
	//
	// Support: Safari 7 only
	// Safari sends mouseenter too often; see:
	// https://code.google.com/p/chromium/issues/detail?id=470258
	// for the description of the bug (it existed in older Chrome versions as well).
	jQuery.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(orig,fix){jQuery.event.special[orig]={delegateType:fix,bindType:fix,handle:function handle(event){var ret,target=this,related=event.relatedTarget,handleObj=event.handleObj; // For mouseenter/leave call the handler if related is outside the target.
	// NB: No relatedTarget if the mouse left/entered the browser window
	if(!related||related!==target&&!jQuery.contains(target,related)){event.type=handleObj.origType;ret=handleObj.handler.apply(this,arguments);event.type=fix;}return ret;}};});jQuery.fn.extend({on:function on(types,selector,data,fn){return _on(this,types,selector,data,fn);},one:function one(types,selector,data,fn){return _on(this,types,selector,data,fn,1);},off:function off(types,selector,fn){var handleObj,type;if(types&&types.preventDefault&&types.handleObj){ // ( event )  dispatched jQuery.Event
	handleObj=types.handleObj;jQuery(types.delegateTarget).off(handleObj.namespace?handleObj.origType+"."+handleObj.namespace:handleObj.origType,handleObj.selector,handleObj.handler);return this;}if((typeof types==="undefined"?"undefined":_typeof(types))==="object"){ // ( types-object [, selector] )
	for(type in types){this.off(type,selector,types[type]);}return this;}if(selector===false||typeof selector==="function"){ // ( types [, fn] )
	fn=selector;selector=undefined;}if(fn===false){fn=returnFalse;}return this.each(function(){jQuery.event.remove(this,types,fn,selector);});}});var rxhtmlTag=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi, // Support: IE 10-11, Edge 10240+
	// In IE/Edge using regex groups here causes severe slowdowns.
	// See https://connect.microsoft.com/IE/feedback/details/1736512/
	rnoInnerhtml=/<script|<style|<link/i, // checked="checked" or checked
	rchecked=/checked\s*(?:[^=]|=\s*.checked.)/i,rscriptTypeMasked=/^true\/(.*)/,rcleanScript=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g; // Manipulating tables requires a tbody
	function manipulationTarget(elem,content){return jQuery.nodeName(elem,"table")&&jQuery.nodeName(content.nodeType!==11?content:content.firstChild,"tr")?elem.getElementsByTagName("tbody")[0]||elem.appendChild(elem.ownerDocument.createElement("tbody")):elem;} // Replace/restore the type attribute of script elements for safe DOM manipulation
	function disableScript(elem){elem.type=(elem.getAttribute("type")!==null)+"/"+elem.type;return elem;}function restoreScript(elem){var match=rscriptTypeMasked.exec(elem.type);if(match){elem.type=match[1];}else {elem.removeAttribute("type");}return elem;}function cloneCopyEvent(src,dest){var i,l,type,pdataOld,pdataCur,udataOld,udataCur,events;if(dest.nodeType!==1){return;} // 1. Copy private data: events, handlers, etc.
	if(dataPriv.hasData(src)){pdataOld=dataPriv.access(src);pdataCur=dataPriv.set(dest,pdataOld);events=pdataOld.events;if(events){delete pdataCur.handle;pdataCur.events={};for(type in events){for(i=0,l=events[type].length;i<l;i++){jQuery.event.add(dest,type,events[type][i]);}}}} // 2. Copy user data
	if(dataUser.hasData(src)){udataOld=dataUser.access(src);udataCur=jQuery.extend({},udataOld);dataUser.set(dest,udataCur);}} // Fix IE bugs, see support tests
	function fixInput(src,dest){var nodeName=dest.nodeName.toLowerCase(); // Fails to persist the checked state of a cloned checkbox or radio button.
	if(nodeName==="input"&&rcheckableType.test(src.type)){dest.checked=src.checked; // Fails to return the selected option to the default selected state when cloning options
	}else if(nodeName==="input"||nodeName==="textarea"){dest.defaultValue=src.defaultValue;}}function domManip(collection,args,callback,ignored){ // Flatten any nested arrays
	args=concat.apply([],args);var fragment,first,scripts,hasScripts,node,doc,i=0,l=collection.length,iNoClone=l-1,value=args[0],isFunction=jQuery.isFunction(value); // We can't cloneNode fragments that contain checked, in WebKit
	if(isFunction||l>1&&typeof value==="string"&&!support.checkClone&&rchecked.test(value)){return collection.each(function(index){var self=collection.eq(index);if(isFunction){args[0]=value.call(this,index,self.html());}domManip(self,args,callback,ignored);});}if(l){fragment=buildFragment(args,collection[0].ownerDocument,false,collection,ignored);first=fragment.firstChild;if(fragment.childNodes.length===1){fragment=first;} // Require either new content or an interest in ignored elements to invoke the callback
	if(first||ignored){scripts=jQuery.map(getAll(fragment,"script"),disableScript);hasScripts=scripts.length; // Use the original fragment for the last item
	// instead of the first because it can end up
	// being emptied incorrectly in certain situations (#8070).
	for(;i<l;i++){node=fragment;if(i!==iNoClone){node=jQuery.clone(node,true,true); // Keep references to cloned scripts for later restoration
	if(hasScripts){ // Support: Android<4.1, PhantomJS<2
	// push.apply(_, arraylike) throws on ancient WebKit
	jQuery.merge(scripts,getAll(node,"script"));}}callback.call(collection[i],node,i);}if(hasScripts){doc=scripts[scripts.length-1].ownerDocument; // Reenable scripts
	jQuery.map(scripts,restoreScript); // Evaluate executable scripts on first document insertion
	for(i=0;i<hasScripts;i++){node=scripts[i];if(rscriptType.test(node.type||"")&&!dataPriv.access(node,"globalEval")&&jQuery.contains(doc,node)){if(node.src){ // Optional AJAX dependency, but won't run scripts if not present
	if(jQuery._evalUrl){jQuery._evalUrl(node.src);}}else {jQuery.globalEval(node.textContent.replace(rcleanScript,""));}}}}}}return collection;}function _remove(elem,selector,keepData){var node,nodes=selector?jQuery.filter(selector,elem):elem,i=0;for(;(node=nodes[i])!=null;i++){if(!keepData&&node.nodeType===1){jQuery.cleanData(getAll(node));}if(node.parentNode){if(keepData&&jQuery.contains(node.ownerDocument,node)){setGlobalEval(getAll(node,"script"));}node.parentNode.removeChild(node);}}return elem;}jQuery.extend({htmlPrefilter:function htmlPrefilter(html){return html.replace(rxhtmlTag,"<$1></$2>");},clone:function clone(elem,dataAndEvents,deepDataAndEvents){var i,l,srcElements,destElements,clone=elem.cloneNode(true),inPage=jQuery.contains(elem.ownerDocument,elem); // Fix IE cloning issues
	if(!support.noCloneChecked&&(elem.nodeType===1||elem.nodeType===11)&&!jQuery.isXMLDoc(elem)){ // We eschew Sizzle here for performance reasons: http://jsperf.com/getall-vs-sizzle/2
	destElements=getAll(clone);srcElements=getAll(elem);for(i=0,l=srcElements.length;i<l;i++){fixInput(srcElements[i],destElements[i]);}} // Copy the events from the original to the clone
	if(dataAndEvents){if(deepDataAndEvents){srcElements=srcElements||getAll(elem);destElements=destElements||getAll(clone);for(i=0,l=srcElements.length;i<l;i++){cloneCopyEvent(srcElements[i],destElements[i]);}}else {cloneCopyEvent(elem,clone);}} // Preserve script evaluation history
	destElements=getAll(clone,"script");if(destElements.length>0){setGlobalEval(destElements,!inPage&&getAll(elem,"script"));} // Return the cloned set
	return clone;},cleanData:function cleanData(elems){var data,elem,type,special=jQuery.event.special,i=0;for(;(elem=elems[i])!==undefined;i++){if(acceptData(elem)){if(data=elem[dataPriv.expando]){if(data.events){for(type in data.events){if(special[type]){jQuery.event.remove(elem,type); // This is a shortcut to avoid jQuery.event.remove's overhead
	}else {jQuery.removeEvent(elem,type,data.handle);}}} // Support: Chrome <= 35-45+
	// Assign undefined instead of using delete, see Data#remove
	elem[dataPriv.expando]=undefined;}if(elem[dataUser.expando]){ // Support: Chrome <= 35-45+
	// Assign undefined instead of using delete, see Data#remove
	elem[dataUser.expando]=undefined;}}}}});jQuery.fn.extend({ // Keep domManip exposed until 3.0 (gh-2225)
	domManip:domManip,detach:function detach(selector){return _remove(this,selector,true);},remove:function remove(selector){return _remove(this,selector);},text:function text(value){return access(this,function(value){return value===undefined?jQuery.text(this):this.empty().each(function(){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){this.textContent=value;}});},null,value,arguments.length);},append:function append(){return domManip(this,arguments,function(elem){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var target=manipulationTarget(this,elem);target.appendChild(elem);}});},prepend:function prepend(){return domManip(this,arguments,function(elem){if(this.nodeType===1||this.nodeType===11||this.nodeType===9){var target=manipulationTarget(this,elem);target.insertBefore(elem,target.firstChild);}});},before:function before(){return domManip(this,arguments,function(elem){if(this.parentNode){this.parentNode.insertBefore(elem,this);}});},after:function after(){return domManip(this,arguments,function(elem){if(this.parentNode){this.parentNode.insertBefore(elem,this.nextSibling);}});},empty:function empty(){var elem,i=0;for(;(elem=this[i])!=null;i++){if(elem.nodeType===1){ // Prevent memory leaks
	jQuery.cleanData(getAll(elem,false)); // Remove any remaining nodes
	elem.textContent="";}}return this;},clone:function clone(dataAndEvents,deepDataAndEvents){dataAndEvents=dataAndEvents==null?false:dataAndEvents;deepDataAndEvents=deepDataAndEvents==null?dataAndEvents:deepDataAndEvents;return this.map(function(){return jQuery.clone(this,dataAndEvents,deepDataAndEvents);});},html:function html(value){return access(this,function(value){var elem=this[0]||{},i=0,l=this.length;if(value===undefined&&elem.nodeType===1){return elem.innerHTML;} // See if we can take a shortcut and just use innerHTML
	if(typeof value==="string"&&!rnoInnerhtml.test(value)&&!wrapMap[(rtagName.exec(value)||["",""])[1].toLowerCase()]){value=jQuery.htmlPrefilter(value);try{for(;i<l;i++){elem=this[i]||{}; // Remove element nodes and prevent memory leaks
	if(elem.nodeType===1){jQuery.cleanData(getAll(elem,false));elem.innerHTML=value;}}elem=0; // If using innerHTML throws an exception, use the fallback method
	}catch(e){}}if(elem){this.empty().append(value);}},null,value,arguments.length);},replaceWith:function replaceWith(){var ignored=[]; // Make the changes, replacing each non-ignored context element with the new content
	return domManip(this,arguments,function(elem){var parent=this.parentNode;if(jQuery.inArray(this,ignored)<0){jQuery.cleanData(getAll(this));if(parent){parent.replaceChild(elem,this);}} // Force callback invocation
	},ignored);}});jQuery.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(name,original){jQuery.fn[name]=function(selector){var elems,ret=[],insert=jQuery(selector),last=insert.length-1,i=0;for(;i<=last;i++){elems=i===last?this:this.clone(true);jQuery(insert[i])[original](elems); // Support: QtWebKit
	// .get() because push.apply(_, arraylike) throws
	push.apply(ret,elems.get());}return this.pushStack(ret);};});var iframe,elemdisplay={ // Support: Firefox
	// We have to pre-define these values for FF (#10227)
	HTML:"block",BODY:"block"}; /**
	 * Retrieve the actual display of a element
	 * @param {String} name nodeName of the element
	 * @param {Object} doc Document object
	 */ // Called only from within defaultDisplay
	function actualDisplay(name,doc){var elem=jQuery(doc.createElement(name)).appendTo(doc.body),display=jQuery.css(elem[0],"display"); // We don't have any data stored on the element,
	// so use "detach" method as fast way to get rid of the element
	elem.detach();return display;} /**
	 * Try to determine the default display value of an element
	 * @param {String} nodeName
	 */function defaultDisplay(nodeName){var doc=document,display=elemdisplay[nodeName];if(!display){display=actualDisplay(nodeName,doc); // If the simple way fails, read from inside an iframe
	if(display==="none"||!display){ // Use the already-created iframe if possible
	iframe=(iframe||jQuery("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement); // Always write a new HTML skeleton so Webkit and Firefox don't choke on reuse
	doc=iframe[0].contentDocument; // Support: IE
	doc.write();doc.close();display=actualDisplay(nodeName,doc);iframe.detach();} // Store the correct default display
	elemdisplay[nodeName]=display;}return display;}var rmargin=/^margin/;var rnumnonpx=new RegExp("^("+pnum+")(?!px)[a-z%]+$","i");var getStyles=function getStyles(elem){ // Support: IE<=11+, Firefox<=30+ (#15098, #14150)
	// IE throws on elements created in popups
	// FF meanwhile throws on frame elements through "defaultView.getComputedStyle"
	var view=elem.ownerDocument.defaultView;if(!view||!view.opener){view=window;}return view.getComputedStyle(elem);};var swap=function swap(elem,options,callback,args){var ret,name,old={}; // Remember the old values, and insert the new ones
	for(name in options){old[name]=elem.style[name];elem.style[name]=options[name];}ret=callback.apply(elem,args||[]); // Revert the old values
	for(name in options){elem.style[name]=old[name];}return ret;};var documentElement=document.documentElement;(function(){var pixelPositionVal,boxSizingReliableVal,pixelMarginRightVal,reliableMarginLeftVal,container=document.createElement("div"),div=document.createElement("div"); // Finish early in limited (non-browser) environments
	if(!div.style){return;} // Support: IE9-11+
	// Style of cloned element affects source element cloned (#8908)
	div.style.backgroundClip="content-box";div.cloneNode(true).style.backgroundClip="";support.clearCloneStyle=div.style.backgroundClip==="content-box";container.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;"+"padding:0;margin-top:1px;position:absolute";container.appendChild(div); // Executing both pixelPosition & boxSizingReliable tests require only one layout
	// so they're executed at the same time to save the second computation.
	function computeStyleTests(){div.style.cssText= // Support: Firefox<29, Android 2.3
	// Vendor-prefix box-sizing
	"-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;"+"position:relative;display:block;"+"margin:auto;border:1px;padding:1px;"+"top:1%;width:50%";div.innerHTML="";documentElement.appendChild(container);var divStyle=window.getComputedStyle(div);pixelPositionVal=divStyle.top!=="1%";reliableMarginLeftVal=divStyle.marginLeft==="2px";boxSizingReliableVal=divStyle.width==="4px"; // Support: Android 4.0 - 4.3 only
	// Some styles come back with percentage values, even though they shouldn't
	div.style.marginRight="50%";pixelMarginRightVal=divStyle.marginRight==="4px";documentElement.removeChild(container);}jQuery.extend(support,{pixelPosition:function pixelPosition(){ // This test is executed only once but we still do memoizing
	// since we can use the boxSizingReliable pre-computing.
	// No need to check if the test was already performed, though.
	computeStyleTests();return pixelPositionVal;},boxSizingReliable:function boxSizingReliable(){if(boxSizingReliableVal==null){computeStyleTests();}return boxSizingReliableVal;},pixelMarginRight:function pixelMarginRight(){ // Support: Android 4.0-4.3
	// We're checking for boxSizingReliableVal here instead of pixelMarginRightVal
	// since that compresses better and they're computed together anyway.
	if(boxSizingReliableVal==null){computeStyleTests();}return pixelMarginRightVal;},reliableMarginLeft:function reliableMarginLeft(){ // Support: IE <=8 only, Android 4.0 - 4.3 only, Firefox <=3 - 37
	if(boxSizingReliableVal==null){computeStyleTests();}return reliableMarginLeftVal;},reliableMarginRight:function reliableMarginRight(){ // Support: Android 2.3
	// Check if div with explicit width and no margin-right incorrectly
	// gets computed margin-right based on width of container. (#3333)
	// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
	// This support function is only executed once so no memoizing is needed.
	var ret,marginDiv=div.appendChild(document.createElement("div")); // Reset CSS: box-sizing; display; margin; border; padding
	marginDiv.style.cssText=div.style.cssText= // Support: Android 2.3
	// Vendor-prefix box-sizing
	"-webkit-box-sizing:content-box;box-sizing:content-box;"+"display:block;margin:0;border:0;padding:0";marginDiv.style.marginRight=marginDiv.style.width="0";div.style.width="1px";documentElement.appendChild(container);ret=!parseFloat(window.getComputedStyle(marginDiv).marginRight);documentElement.removeChild(container);div.removeChild(marginDiv);return ret;}});})();function curCSS(elem,name,computed){var width,minWidth,maxWidth,ret,style=elem.style;computed=computed||getStyles(elem);ret=computed?computed.getPropertyValue(name)||computed[name]:undefined; // Support: Opera 12.1x only
	// Fall back to style even without computed
	// computed is undefined for elems on document fragments
	if((ret===""||ret===undefined)&&!jQuery.contains(elem.ownerDocument,elem)){ret=jQuery.style(elem,name);} // Support: IE9
	// getPropertyValue is only needed for .css('filter') (#12537)
	if(computed){ // A tribute to the "awesome hack by Dean Edwards"
	// Android Browser returns percentage for some values,
	// but width seems to be reliably pixels.
	// This is against the CSSOM draft spec:
	// http://dev.w3.org/csswg/cssom/#resolved-values
	if(!support.pixelMarginRight()&&rnumnonpx.test(ret)&&rmargin.test(name)){ // Remember the original values
	width=style.width;minWidth=style.minWidth;maxWidth=style.maxWidth; // Put in the new values to get a computed value out
	style.minWidth=style.maxWidth=style.width=ret;ret=computed.width; // Revert the changed values
	style.width=width;style.minWidth=minWidth;style.maxWidth=maxWidth;}}return ret!==undefined? // Support: IE9-11+
	// IE returns zIndex value as an integer.
	ret+"":ret;}function addGetHookIf(conditionFn,hookFn){ // Define the hook, we'll check on the first run if it's really needed.
	return {get:function get(){if(conditionFn()){ // Hook not needed (or it's not possible to use it due
	// to missing dependency), remove it.
	delete this.get;return;} // Hook needed; redefine it so that the support test is not executed again.
	return (this.get=hookFn).apply(this,arguments);}};}var  // Swappable if display is none or starts with table
	// except "table", "table-cell", or "table-caption"
	// See here for display values: https://developer.mozilla.org/en-US/docs/CSS/display
	rdisplayswap=/^(none|table(?!-c[ea]).+)/,cssShow={position:"absolute",visibility:"hidden",display:"block"},cssNormalTransform={letterSpacing:"0",fontWeight:"400"},cssPrefixes=["Webkit","O","Moz","ms"],emptyStyle=document.createElement("div").style; // Return a css property mapped to a potentially vendor prefixed property
	function vendorPropName(name){ // Shortcut for names that are not vendor prefixed
	if(name in emptyStyle){return name;} // Check for vendor prefixed names
	var capName=name[0].toUpperCase()+name.slice(1),i=cssPrefixes.length;while(i--){name=cssPrefixes[i]+capName;if(name in emptyStyle){return name;}}}function setPositiveNumber(elem,value,subtract){ // Any relative (+/-) values have already been
	// normalized at this point
	var matches=rcssNum.exec(value);return matches? // Guard against undefined "subtract", e.g., when used as in cssHooks
	Math.max(0,matches[2]-(subtract||0))+(matches[3]||"px"):value;}function augmentWidthOrHeight(elem,name,extra,isBorderBox,styles){var i=extra===(isBorderBox?"border":"content")? // If we already have the right measurement, avoid augmentation
	4: // Otherwise initialize for horizontal or vertical properties
	name==="width"?1:0,val=0;for(;i<4;i+=2){ // Both box models exclude margin, so add it if we want it
	if(extra==="margin"){val+=jQuery.css(elem,extra+cssExpand[i],true,styles);}if(isBorderBox){ // border-box includes padding, so remove it if we want content
	if(extra==="content"){val-=jQuery.css(elem,"padding"+cssExpand[i],true,styles);} // At this point, extra isn't border nor margin, so remove border
	if(extra!=="margin"){val-=jQuery.css(elem,"border"+cssExpand[i]+"Width",true,styles);}}else { // At this point, extra isn't content, so add padding
	val+=jQuery.css(elem,"padding"+cssExpand[i],true,styles); // At this point, extra isn't content nor padding, so add border
	if(extra!=="padding"){val+=jQuery.css(elem,"border"+cssExpand[i]+"Width",true,styles);}}}return val;}function getWidthOrHeight(elem,name,extra){ // Start with offset property, which is equivalent to the border-box value
	var valueIsBorderBox=true,val=name==="width"?elem.offsetWidth:elem.offsetHeight,styles=getStyles(elem),isBorderBox=jQuery.css(elem,"boxSizing",false,styles)==="border-box"; // Support: IE11 only
	// In IE 11 fullscreen elements inside of an iframe have
	// 100x too small dimensions (gh-1764).
	if(document.msFullscreenElement&&window.top!==window){ // Support: IE11 only
	// Running getBoundingClientRect on a disconnected node
	// in IE throws an error.
	if(elem.getClientRects().length){val=Math.round(elem.getBoundingClientRect()[name]*100);}} // Some non-html elements return undefined for offsetWidth, so check for null/undefined
	// svg - https://bugzilla.mozilla.org/show_bug.cgi?id=649285
	// MathML - https://bugzilla.mozilla.org/show_bug.cgi?id=491668
	if(val<=0||val==null){ // Fall back to computed then uncomputed css if necessary
	val=curCSS(elem,name,styles);if(val<0||val==null){val=elem.style[name];} // Computed unit is not pixels. Stop here and return.
	if(rnumnonpx.test(val)){return val;} // Check for style in case a browser which returns unreliable values
	// for getComputedStyle silently falls back to the reliable elem.style
	valueIsBorderBox=isBorderBox&&(support.boxSizingReliable()||val===elem.style[name]); // Normalize "", auto, and prepare for extra
	val=parseFloat(val)||0;} // Use the active box-sizing model to add/subtract irrelevant styles
	return val+augmentWidthOrHeight(elem,name,extra||(isBorderBox?"border":"content"),valueIsBorderBox,styles)+"px";}function showHide(elements,show){var display,elem,hidden,values=[],index=0,length=elements.length;for(;index<length;index++){elem=elements[index];if(!elem.style){continue;}values[index]=dataPriv.get(elem,"olddisplay");display=elem.style.display;if(show){ // Reset the inline display of this element to learn if it is
	// being hidden by cascaded rules or not
	if(!values[index]&&display==="none"){elem.style.display="";} // Set elements which have been overridden with display: none
	// in a stylesheet to whatever the default browser style is
	// for such an element
	if(elem.style.display===""&&isHidden(elem)){values[index]=dataPriv.access(elem,"olddisplay",defaultDisplay(elem.nodeName));}}else {hidden=isHidden(elem);if(display!=="none"||!hidden){dataPriv.set(elem,"olddisplay",hidden?display:jQuery.css(elem,"display"));}}} // Set the display of most of the elements in a second loop
	// to avoid the constant reflow
	for(index=0;index<length;index++){elem=elements[index];if(!elem.style){continue;}if(!show||elem.style.display==="none"||elem.style.display===""){elem.style.display=show?values[index]||"":"none";}}return elements;}jQuery.extend({ // Add in style property hooks for overriding the default
	// behavior of getting and setting a style property
	cssHooks:{opacity:{get:function get(elem,computed){if(computed){ // We should always get a number back from opacity
	var ret=curCSS(elem,"opacity");return ret===""?"1":ret;}}}}, // Don't automatically add "px" to these possibly-unitless properties
	cssNumber:{"animationIterationCount":true,"columnCount":true,"fillOpacity":true,"flexGrow":true,"flexShrink":true,"fontWeight":true,"lineHeight":true,"opacity":true,"order":true,"orphans":true,"widows":true,"zIndex":true,"zoom":true}, // Add in properties whose names you wish to fix before
	// setting or getting the value
	cssProps:{"float":"cssFloat"}, // Get and set the style property on a DOM Node
	style:function style(elem,name,value,extra){ // Don't set styles on text and comment nodes
	if(!elem||elem.nodeType===3||elem.nodeType===8||!elem.style){return;} // Make sure that we're working with the right name
	var ret,type,hooks,origName=jQuery.camelCase(name),style=elem.style;name=jQuery.cssProps[origName]||(jQuery.cssProps[origName]=vendorPropName(origName)||origName); // Gets hook for the prefixed version, then unprefixed version
	hooks=jQuery.cssHooks[name]||jQuery.cssHooks[origName]; // Check if we're setting a value
	if(value!==undefined){type=typeof value==="undefined"?"undefined":_typeof(value); // Convert "+=" or "-=" to relative numbers (#7345)
	if(type==="string"&&(ret=rcssNum.exec(value))&&ret[1]){value=adjustCSS(elem,name,ret); // Fixes bug #9237
	type="number";} // Make sure that null and NaN values aren't set (#7116)
	if(value==null||value!==value){return;} // If a number was passed in, add the unit (except for certain CSS properties)
	if(type==="number"){value+=ret&&ret[3]||(jQuery.cssNumber[origName]?"":"px");} // Support: IE9-11+
	// background-* props affect original clone's values
	if(!support.clearCloneStyle&&value===""&&name.indexOf("background")===0){style[name]="inherit";} // If a hook was provided, use that value, otherwise just set the specified value
	if(!hooks||!("set" in hooks)||(value=hooks.set(elem,value,extra))!==undefined){style[name]=value;}}else { // If a hook was provided get the non-computed value from there
	if(hooks&&"get" in hooks&&(ret=hooks.get(elem,false,extra))!==undefined){return ret;} // Otherwise just get the value from the style object
	return style[name];}},css:function css(elem,name,extra,styles){var val,num,hooks,origName=jQuery.camelCase(name); // Make sure that we're working with the right name
	name=jQuery.cssProps[origName]||(jQuery.cssProps[origName]=vendorPropName(origName)||origName); // Try prefixed name followed by the unprefixed name
	hooks=jQuery.cssHooks[name]||jQuery.cssHooks[origName]; // If a hook was provided get the computed value from there
	if(hooks&&"get" in hooks){val=hooks.get(elem,true,extra);} // Otherwise, if a way to get the computed value exists, use that
	if(val===undefined){val=curCSS(elem,name,styles);} // Convert "normal" to computed value
	if(val==="normal"&&name in cssNormalTransform){val=cssNormalTransform[name];} // Make numeric if forced or a qualifier was provided and val looks numeric
	if(extra===""||extra){num=parseFloat(val);return extra===true||isFinite(num)?num||0:val;}return val;}});jQuery.each(["height","width"],function(i,name){jQuery.cssHooks[name]={get:function get(elem,computed,extra){if(computed){ // Certain elements can have dimension info if we invisibly show them
	// but it must have a current display style that would benefit
	return rdisplayswap.test(jQuery.css(elem,"display"))&&elem.offsetWidth===0?swap(elem,cssShow,function(){return getWidthOrHeight(elem,name,extra);}):getWidthOrHeight(elem,name,extra);}},set:function set(elem,value,extra){var matches,styles=extra&&getStyles(elem),subtract=extra&&augmentWidthOrHeight(elem,name,extra,jQuery.css(elem,"boxSizing",false,styles)==="border-box",styles); // Convert to pixels if value adjustment is needed
	if(subtract&&(matches=rcssNum.exec(value))&&(matches[3]||"px")!=="px"){elem.style[name]=value;value=jQuery.css(elem,name);}return setPositiveNumber(elem,value,subtract);}};});jQuery.cssHooks.marginLeft=addGetHookIf(support.reliableMarginLeft,function(elem,computed){if(computed){return (parseFloat(curCSS(elem,"marginLeft"))||elem.getBoundingClientRect().left-swap(elem,{marginLeft:0},function(){return elem.getBoundingClientRect().left;}))+"px";}}); // Support: Android 2.3
	jQuery.cssHooks.marginRight=addGetHookIf(support.reliableMarginRight,function(elem,computed){if(computed){return swap(elem,{"display":"inline-block"},curCSS,[elem,"marginRight"]);}}); // These hooks are used by animate to expand properties
	jQuery.each({margin:"",padding:"",border:"Width"},function(prefix,suffix){jQuery.cssHooks[prefix+suffix]={expand:function expand(value){var i=0,expanded={}, // Assumes a single number if not a string
	parts=typeof value==="string"?value.split(" "):[value];for(;i<4;i++){expanded[prefix+cssExpand[i]+suffix]=parts[i]||parts[i-2]||parts[0];}return expanded;}};if(!rmargin.test(prefix)){jQuery.cssHooks[prefix+suffix].set=setPositiveNumber;}});jQuery.fn.extend({css:function css(name,value){return access(this,function(elem,name,value){var styles,len,map={},i=0;if(jQuery.isArray(name)){styles=getStyles(elem);len=name.length;for(;i<len;i++){map[name[i]]=jQuery.css(elem,name[i],false,styles);}return map;}return value!==undefined?jQuery.style(elem,name,value):jQuery.css(elem,name);},name,value,arguments.length>1);},show:function show(){return showHide(this,true);},hide:function hide(){return showHide(this);},toggle:function toggle(state){if(typeof state==="boolean"){return state?this.show():this.hide();}return this.each(function(){if(isHidden(this)){jQuery(this).show();}else {jQuery(this).hide();}});}});function Tween(elem,options,prop,end,easing){return new Tween.prototype.init(elem,options,prop,end,easing);}jQuery.Tween=Tween;Tween.prototype={constructor:Tween,init:function init(elem,options,prop,end,easing,unit){this.elem=elem;this.prop=prop;this.easing=easing||jQuery.easing._default;this.options=options;this.start=this.now=this.cur();this.end=end;this.unit=unit||(jQuery.cssNumber[prop]?"":"px");},cur:function cur(){var hooks=Tween.propHooks[this.prop];return hooks&&hooks.get?hooks.get(this):Tween.propHooks._default.get(this);},run:function run(percent){var eased,hooks=Tween.propHooks[this.prop];if(this.options.duration){this.pos=eased=jQuery.easing[this.easing](percent,this.options.duration*percent,0,1,this.options.duration);}else {this.pos=eased=percent;}this.now=(this.end-this.start)*eased+this.start;if(this.options.step){this.options.step.call(this.elem,this.now,this);}if(hooks&&hooks.set){hooks.set(this);}else {Tween.propHooks._default.set(this);}return this;}};Tween.prototype.init.prototype=Tween.prototype;Tween.propHooks={_default:{get:function get(tween){var result; // Use a property on the element directly when it is not a DOM element,
	// or when there is no matching style property that exists.
	if(tween.elem.nodeType!==1||tween.elem[tween.prop]!=null&&tween.elem.style[tween.prop]==null){return tween.elem[tween.prop];} // Passing an empty string as a 3rd parameter to .css will automatically
	// attempt a parseFloat and fallback to a string if the parse fails.
	// Simple values such as "10px" are parsed to Float;
	// complex values such as "rotate(1rad)" are returned as-is.
	result=jQuery.css(tween.elem,tween.prop,""); // Empty strings, null, undefined and "auto" are converted to 0.
	return !result||result==="auto"?0:result;},set:function set(tween){ // Use step hook for back compat.
	// Use cssHook if its there.
	// Use .style if available and use plain properties where available.
	if(jQuery.fx.step[tween.prop]){jQuery.fx.step[tween.prop](tween);}else if(tween.elem.nodeType===1&&(tween.elem.style[jQuery.cssProps[tween.prop]]!=null||jQuery.cssHooks[tween.prop])){jQuery.style(tween.elem,tween.prop,tween.now+tween.unit);}else {tween.elem[tween.prop]=tween.now;}}}}; // Support: IE9
	// Panic based approach to setting things on disconnected nodes
	Tween.propHooks.scrollTop=Tween.propHooks.scrollLeft={set:function set(tween){if(tween.elem.nodeType&&tween.elem.parentNode){tween.elem[tween.prop]=tween.now;}}};jQuery.easing={linear:function linear(p){return p;},swing:function swing(p){return 0.5-Math.cos(p*Math.PI)/2;},_default:"swing"};jQuery.fx=Tween.prototype.init; // Back Compat <1.8 extension point
	jQuery.fx.step={};var fxNow,timerId,rfxtypes=/^(?:toggle|show|hide)$/,rrun=/queueHooks$/; // Animations created synchronously will run synchronously
	function createFxNow(){window.setTimeout(function(){fxNow=undefined;});return fxNow=jQuery.now();} // Generate parameters to create a standard animation
	function genFx(type,includeWidth){var which,i=0,attrs={height:type}; // If we include width, step value is 1 to do all cssExpand values,
	// otherwise step value is 2 to skip over Left and Right
	includeWidth=includeWidth?1:0;for(;i<4;i+=2-includeWidth){which=cssExpand[i];attrs["margin"+which]=attrs["padding"+which]=type;}if(includeWidth){attrs.opacity=attrs.width=type;}return attrs;}function createTween(value,prop,animation){var tween,collection=(Animation.tweeners[prop]||[]).concat(Animation.tweeners["*"]),index=0,length=collection.length;for(;index<length;index++){if(tween=collection[index].call(animation,prop,value)){ // We're done with this property
	return tween;}}}function defaultPrefilter(elem,props,opts){ /* jshint validthis: true */var prop,value,toggle,tween,hooks,oldfire,display,checkDisplay,anim=this,orig={},style=elem.style,hidden=elem.nodeType&&isHidden(elem),dataShow=dataPriv.get(elem,"fxshow"); // Handle queue: false promises
	if(!opts.queue){hooks=jQuery._queueHooks(elem,"fx");if(hooks.unqueued==null){hooks.unqueued=0;oldfire=hooks.empty.fire;hooks.empty.fire=function(){if(!hooks.unqueued){oldfire();}};}hooks.unqueued++;anim.always(function(){ // Ensure the complete handler is called before this completes
	anim.always(function(){hooks.unqueued--;if(!jQuery.queue(elem,"fx").length){hooks.empty.fire();}});});} // Height/width overflow pass
	if(elem.nodeType===1&&("height" in props||"width" in props)){ // Make sure that nothing sneaks out
	// Record all 3 overflow attributes because IE9-10 do not
	// change the overflow attribute when overflowX and
	// overflowY are set to the same value
	opts.overflow=[style.overflow,style.overflowX,style.overflowY]; // Set display property to inline-block for height/width
	// animations on inline elements that are having width/height animated
	display=jQuery.css(elem,"display"); // Test default display if display is currently "none"
	checkDisplay=display==="none"?dataPriv.get(elem,"olddisplay")||defaultDisplay(elem.nodeName):display;if(checkDisplay==="inline"&&jQuery.css(elem,"float")==="none"){style.display="inline-block";}}if(opts.overflow){style.overflow="hidden";anim.always(function(){style.overflow=opts.overflow[0];style.overflowX=opts.overflow[1];style.overflowY=opts.overflow[2];});} // show/hide pass
	for(prop in props){value=props[prop];if(rfxtypes.exec(value)){delete props[prop];toggle=toggle||value==="toggle";if(value===(hidden?"hide":"show")){ // If there is dataShow left over from a stopped hide or show
	// and we are going to proceed with show, we should pretend to be hidden
	if(value==="show"&&dataShow&&dataShow[prop]!==undefined){hidden=true;}else {continue;}}orig[prop]=dataShow&&dataShow[prop]||jQuery.style(elem,prop); // Any non-fx value stops us from restoring the original display value
	}else {display=undefined;}}if(!jQuery.isEmptyObject(orig)){if(dataShow){if("hidden" in dataShow){hidden=dataShow.hidden;}}else {dataShow=dataPriv.access(elem,"fxshow",{});} // Store state if its toggle - enables .stop().toggle() to "reverse"
	if(toggle){dataShow.hidden=!hidden;}if(hidden){jQuery(elem).show();}else {anim.done(function(){jQuery(elem).hide();});}anim.done(function(){var prop;dataPriv.remove(elem,"fxshow");for(prop in orig){jQuery.style(elem,prop,orig[prop]);}});for(prop in orig){tween=createTween(hidden?dataShow[prop]:0,prop,anim);if(!(prop in dataShow)){dataShow[prop]=tween.start;if(hidden){tween.end=tween.start;tween.start=prop==="width"||prop==="height"?1:0;}}} // If this is a noop like .hide().hide(), restore an overwritten display value
	}else if((display==="none"?defaultDisplay(elem.nodeName):display)==="inline"){style.display=display;}}function propFilter(props,specialEasing){var index,name,easing,value,hooks; // camelCase, specialEasing and expand cssHook pass
	for(index in props){name=jQuery.camelCase(index);easing=specialEasing[name];value=props[index];if(jQuery.isArray(value)){easing=value[1];value=props[index]=value[0];}if(index!==name){props[name]=value;delete props[index];}hooks=jQuery.cssHooks[name];if(hooks&&"expand" in hooks){value=hooks.expand(value);delete props[name]; // Not quite $.extend, this won't overwrite existing keys.
	// Reusing 'index' because we have the correct "name"
	for(index in value){if(!(index in props)){props[index]=value[index];specialEasing[index]=easing;}}}else {specialEasing[name]=easing;}}}function Animation(elem,properties,options){var result,stopped,index=0,length=Animation.prefilters.length,deferred=jQuery.Deferred().always(function(){ // Don't match elem in the :animated selector
	delete tick.elem;}),tick=function tick(){if(stopped){return false;}var currentTime=fxNow||createFxNow(),remaining=Math.max(0,animation.startTime+animation.duration-currentTime), // Support: Android 2.3
	// Archaic crash bug won't allow us to use `1 - ( 0.5 || 0 )` (#12497)
	temp=remaining/animation.duration||0,percent=1-temp,index=0,length=animation.tweens.length;for(;index<length;index++){animation.tweens[index].run(percent);}deferred.notifyWith(elem,[animation,percent,remaining]);if(percent<1&&length){return remaining;}else {deferred.resolveWith(elem,[animation]);return false;}},animation=deferred.promise({elem:elem,props:jQuery.extend({},properties),opts:jQuery.extend(true,{specialEasing:{},easing:jQuery.easing._default},options),originalProperties:properties,originalOptions:options,startTime:fxNow||createFxNow(),duration:options.duration,tweens:[],createTween:function createTween(prop,end){var tween=jQuery.Tween(elem,animation.opts,prop,end,animation.opts.specialEasing[prop]||animation.opts.easing);animation.tweens.push(tween);return tween;},stop:function stop(gotoEnd){var index=0, // If we are going to the end, we want to run all the tweens
	// otherwise we skip this part
	length=gotoEnd?animation.tweens.length:0;if(stopped){return this;}stopped=true;for(;index<length;index++){animation.tweens[index].run(1);} // Resolve when we played the last frame; otherwise, reject
	if(gotoEnd){deferred.notifyWith(elem,[animation,1,0]);deferred.resolveWith(elem,[animation,gotoEnd]);}else {deferred.rejectWith(elem,[animation,gotoEnd]);}return this;}}),props=animation.props;propFilter(props,animation.opts.specialEasing);for(;index<length;index++){result=Animation.prefilters[index].call(animation,elem,props,animation.opts);if(result){if(jQuery.isFunction(result.stop)){jQuery._queueHooks(animation.elem,animation.opts.queue).stop=jQuery.proxy(result.stop,result);}return result;}}jQuery.map(props,createTween,animation);if(jQuery.isFunction(animation.opts.start)){animation.opts.start.call(elem,animation);}jQuery.fx.timer(jQuery.extend(tick,{elem:elem,anim:animation,queue:animation.opts.queue})); // attach callbacks from options
	return animation.progress(animation.opts.progress).done(animation.opts.done,animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);}jQuery.Animation=jQuery.extend(Animation,{tweeners:{"*":[function(prop,value){var tween=this.createTween(prop,value);adjustCSS(tween.elem,prop,rcssNum.exec(value),tween);return tween;}]},tweener:function tweener(props,callback){if(jQuery.isFunction(props)){callback=props;props=["*"];}else {props=props.match(rnotwhite);}var prop,index=0,length=props.length;for(;index<length;index++){prop=props[index];Animation.tweeners[prop]=Animation.tweeners[prop]||[];Animation.tweeners[prop].unshift(callback);}},prefilters:[defaultPrefilter],prefilter:function prefilter(callback,prepend){if(prepend){Animation.prefilters.unshift(callback);}else {Animation.prefilters.push(callback);}}});jQuery.speed=function(speed,easing,fn){var opt=speed&&(typeof speed==="undefined"?"undefined":_typeof(speed))==="object"?jQuery.extend({},speed):{complete:fn||!fn&&easing||jQuery.isFunction(speed)&&speed,duration:speed,easing:fn&&easing||easing&&!jQuery.isFunction(easing)&&easing};opt.duration=jQuery.fx.off?0:typeof opt.duration==="number"?opt.duration:opt.duration in jQuery.fx.speeds?jQuery.fx.speeds[opt.duration]:jQuery.fx.speeds._default; // Normalize opt.queue - true/undefined/null -> "fx"
	if(opt.queue==null||opt.queue===true){opt.queue="fx";} // Queueing
	opt.old=opt.complete;opt.complete=function(){if(jQuery.isFunction(opt.old)){opt.old.call(this);}if(opt.queue){jQuery.dequeue(this,opt.queue);}};return opt;};jQuery.fn.extend({fadeTo:function fadeTo(speed,to,easing,callback){ // Show any hidden elements after setting opacity to 0
	return this.filter(isHidden).css("opacity",0).show() // Animate to the value specified
	.end().animate({opacity:to},speed,easing,callback);},animate:function animate(prop,speed,easing,callback){var empty=jQuery.isEmptyObject(prop),optall=jQuery.speed(speed,easing,callback),doAnimation=function doAnimation(){ // Operate on a copy of prop so per-property easing won't be lost
	var anim=Animation(this,jQuery.extend({},prop),optall); // Empty animations, or finishing resolves immediately
	if(empty||dataPriv.get(this,"finish")){anim.stop(true);}};doAnimation.finish=doAnimation;return empty||optall.queue===false?this.each(doAnimation):this.queue(optall.queue,doAnimation);},stop:function stop(type,clearQueue,gotoEnd){var stopQueue=function stopQueue(hooks){var stop=hooks.stop;delete hooks.stop;stop(gotoEnd);};if(typeof type!=="string"){gotoEnd=clearQueue;clearQueue=type;type=undefined;}if(clearQueue&&type!==false){this.queue(type||"fx",[]);}return this.each(function(){var dequeue=true,index=type!=null&&type+"queueHooks",timers=jQuery.timers,data=dataPriv.get(this);if(index){if(data[index]&&data[index].stop){stopQueue(data[index]);}}else {for(index in data){if(data[index]&&data[index].stop&&rrun.test(index)){stopQueue(data[index]);}}}for(index=timers.length;index--;){if(timers[index].elem===this&&(type==null||timers[index].queue===type)){timers[index].anim.stop(gotoEnd);dequeue=false;timers.splice(index,1);}} // Start the next in the queue if the last step wasn't forced.
	// Timers currently will call their complete callbacks, which
	// will dequeue but only if they were gotoEnd.
	if(dequeue||!gotoEnd){jQuery.dequeue(this,type);}});},finish:function finish(type){if(type!==false){type=type||"fx";}return this.each(function(){var index,data=dataPriv.get(this),queue=data[type+"queue"],hooks=data[type+"queueHooks"],timers=jQuery.timers,length=queue?queue.length:0; // Enable finishing flag on private data
	data.finish=true; // Empty the queue first
	jQuery.queue(this,type,[]);if(hooks&&hooks.stop){hooks.stop.call(this,true);} // Look for any active animations, and finish them
	for(index=timers.length;index--;){if(timers[index].elem===this&&timers[index].queue===type){timers[index].anim.stop(true);timers.splice(index,1);}} // Look for any animations in the old queue and finish them
	for(index=0;index<length;index++){if(queue[index]&&queue[index].finish){queue[index].finish.call(this);}} // Turn off finishing flag
	delete data.finish;});}});jQuery.each(["toggle","show","hide"],function(i,name){var cssFn=jQuery.fn[name];jQuery.fn[name]=function(speed,easing,callback){return speed==null||typeof speed==="boolean"?cssFn.apply(this,arguments):this.animate(genFx(name,true),speed,easing,callback);};}); // Generate shortcuts for custom animations
	jQuery.each({slideDown:genFx("show"),slideUp:genFx("hide"),slideToggle:genFx("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(name,props){jQuery.fn[name]=function(speed,easing,callback){return this.animate(props,speed,easing,callback);};});jQuery.timers=[];jQuery.fx.tick=function(){var timer,i=0,timers=jQuery.timers;fxNow=jQuery.now();for(;i<timers.length;i++){timer=timers[i]; // Checks the timer has not already been removed
	if(!timer()&&timers[i]===timer){timers.splice(i--,1);}}if(!timers.length){jQuery.fx.stop();}fxNow=undefined;};jQuery.fx.timer=function(timer){jQuery.timers.push(timer);if(timer()){jQuery.fx.start();}else {jQuery.timers.pop();}};jQuery.fx.interval=13;jQuery.fx.start=function(){if(!timerId){timerId=window.setInterval(jQuery.fx.tick,jQuery.fx.interval);}};jQuery.fx.stop=function(){window.clearInterval(timerId);timerId=null;};jQuery.fx.speeds={slow:600,fast:200, // Default speed
	_default:400}; // Based off of the plugin by Clint Helfers, with permission.
	// http://web.archive.org/web/20100324014747/http://blindsignals.com/index.php/2009/07/jquery-delay/
	jQuery.fn.delay=function(time,type){time=jQuery.fx?jQuery.fx.speeds[time]||time:time;type=type||"fx";return this.queue(type,function(next,hooks){var timeout=window.setTimeout(next,time);hooks.stop=function(){window.clearTimeout(timeout);};});};(function(){var input=document.createElement("input"),select=document.createElement("select"),opt=select.appendChild(document.createElement("option"));input.type="checkbox"; // Support: iOS<=5.1, Android<=4.2+
	// Default value for a checkbox should be "on"
	support.checkOn=input.value!==""; // Support: IE<=11+
	// Must access selectedIndex to make default options select
	support.optSelected=opt.selected; // Support: Android<=2.3
	// Options inside disabled selects are incorrectly marked as disabled
	select.disabled=true;support.optDisabled=!opt.disabled; // Support: IE<=11+
	// An input loses its value after becoming a radio
	input=document.createElement("input");input.value="t";input.type="radio";support.radioValue=input.value==="t";})();var boolHook,attrHandle=jQuery.expr.attrHandle;jQuery.fn.extend({attr:function attr(name,value){return access(this,jQuery.attr,name,value,arguments.length>1);},removeAttr:function removeAttr(name){return this.each(function(){jQuery.removeAttr(this,name);});}});jQuery.extend({attr:function attr(elem,name,value){var ret,hooks,nType=elem.nodeType; // Don't get/set attributes on text, comment and attribute nodes
	if(nType===3||nType===8||nType===2){return;} // Fallback to prop when attributes are not supported
	if(typeof elem.getAttribute==="undefined"){return jQuery.prop(elem,name,value);} // All attributes are lowercase
	// Grab necessary hook if one is defined
	if(nType!==1||!jQuery.isXMLDoc(elem)){name=name.toLowerCase();hooks=jQuery.attrHooks[name]||(jQuery.expr.match.bool.test(name)?boolHook:undefined);}if(value!==undefined){if(value===null){jQuery.removeAttr(elem,name);return;}if(hooks&&"set" in hooks&&(ret=hooks.set(elem,value,name))!==undefined){return ret;}elem.setAttribute(name,value+"");return value;}if(hooks&&"get" in hooks&&(ret=hooks.get(elem,name))!==null){return ret;}ret=jQuery.find.attr(elem,name); // Non-existent attributes return null, we normalize to undefined
	return ret==null?undefined:ret;},attrHooks:{type:{set:function set(elem,value){if(!support.radioValue&&value==="radio"&&jQuery.nodeName(elem,"input")){var val=elem.value;elem.setAttribute("type",value);if(val){elem.value=val;}return value;}}}},removeAttr:function removeAttr(elem,value){var name,propName,i=0,attrNames=value&&value.match(rnotwhite);if(attrNames&&elem.nodeType===1){while(name=attrNames[i++]){propName=jQuery.propFix[name]||name; // Boolean attributes get special treatment (#10870)
	if(jQuery.expr.match.bool.test(name)){ // Set corresponding property to false
	elem[propName]=false;}elem.removeAttribute(name);}}}}); // Hooks for boolean attributes
	boolHook={set:function set(elem,value,name){if(value===false){ // Remove boolean attributes when set to false
	jQuery.removeAttr(elem,name);}else {elem.setAttribute(name,name);}return name;}};jQuery.each(jQuery.expr.match.bool.source.match(/\w+/g),function(i,name){var getter=attrHandle[name]||jQuery.find.attr;attrHandle[name]=function(elem,name,isXML){var ret,handle;if(!isXML){ // Avoid an infinite loop by temporarily removing this function from the getter
	handle=attrHandle[name];attrHandle[name]=ret;ret=getter(elem,name,isXML)!=null?name.toLowerCase():null;attrHandle[name]=handle;}return ret;};});var rfocusable=/^(?:input|select|textarea|button)$/i,rclickable=/^(?:a|area)$/i;jQuery.fn.extend({prop:function prop(name,value){return access(this,jQuery.prop,name,value,arguments.length>1);},removeProp:function removeProp(name){return this.each(function(){delete this[jQuery.propFix[name]||name];});}});jQuery.extend({prop:function prop(elem,name,value){var ret,hooks,nType=elem.nodeType; // Don't get/set properties on text, comment and attribute nodes
	if(nType===3||nType===8||nType===2){return;}if(nType!==1||!jQuery.isXMLDoc(elem)){ // Fix name and attach hooks
	name=jQuery.propFix[name]||name;hooks=jQuery.propHooks[name];}if(value!==undefined){if(hooks&&"set" in hooks&&(ret=hooks.set(elem,value,name))!==undefined){return ret;}return elem[name]=value;}if(hooks&&"get" in hooks&&(ret=hooks.get(elem,name))!==null){return ret;}return elem[name];},propHooks:{tabIndex:{get:function get(elem){ // elem.tabIndex doesn't always return the
	// correct value when it hasn't been explicitly set
	// http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
	// Use proper attribute retrieval(#12072)
	var tabindex=jQuery.find.attr(elem,"tabindex");return tabindex?parseInt(tabindex,10):rfocusable.test(elem.nodeName)||rclickable.test(elem.nodeName)&&elem.href?0:-1;}}},propFix:{"for":"htmlFor","class":"className"}}); // Support: IE <=11 only
	// Accessing the selectedIndex property
	// forces the browser to respect setting selected
	// on the option
	// The getter ensures a default option is selected
	// when in an optgroup
	if(!support.optSelected){jQuery.propHooks.selected={get:function get(elem){var parent=elem.parentNode;if(parent&&parent.parentNode){parent.parentNode.selectedIndex;}return null;},set:function set(elem){var parent=elem.parentNode;if(parent){parent.selectedIndex;if(parent.parentNode){parent.parentNode.selectedIndex;}}}};}jQuery.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){jQuery.propFix[this.toLowerCase()]=this;});var rclass=/[\t\r\n\f]/g;function getClass(elem){return elem.getAttribute&&elem.getAttribute("class")||"";}jQuery.fn.extend({addClass:function addClass(value){var classes,elem,cur,curValue,clazz,j,finalValue,i=0;if(jQuery.isFunction(value)){return this.each(function(j){jQuery(this).addClass(value.call(this,j,getClass(this)));});}if(typeof value==="string"&&value){classes=value.match(rnotwhite)||[];while(elem=this[i++]){curValue=getClass(elem);cur=elem.nodeType===1&&(" "+curValue+" ").replace(rclass," ");if(cur){j=0;while(clazz=classes[j++]){if(cur.indexOf(" "+clazz+" ")<0){cur+=clazz+" ";}} // Only assign if different to avoid unneeded rendering.
	finalValue=jQuery.trim(cur);if(curValue!==finalValue){elem.setAttribute("class",finalValue);}}}}return this;},removeClass:function removeClass(value){var classes,elem,cur,curValue,clazz,j,finalValue,i=0;if(jQuery.isFunction(value)){return this.each(function(j){jQuery(this).removeClass(value.call(this,j,getClass(this)));});}if(!arguments.length){return this.attr("class","");}if(typeof value==="string"&&value){classes=value.match(rnotwhite)||[];while(elem=this[i++]){curValue=getClass(elem); // This expression is here for better compressibility (see addClass)
	cur=elem.nodeType===1&&(" "+curValue+" ").replace(rclass," ");if(cur){j=0;while(clazz=classes[j++]){ // Remove *all* instances
	while(cur.indexOf(" "+clazz+" ")>-1){cur=cur.replace(" "+clazz+" "," ");}} // Only assign if different to avoid unneeded rendering.
	finalValue=jQuery.trim(cur);if(curValue!==finalValue){elem.setAttribute("class",finalValue);}}}}return this;},toggleClass:function toggleClass(value,stateVal){var type=typeof value==="undefined"?"undefined":_typeof(value);if(typeof stateVal==="boolean"&&type==="string"){return stateVal?this.addClass(value):this.removeClass(value);}if(jQuery.isFunction(value)){return this.each(function(i){jQuery(this).toggleClass(value.call(this,i,getClass(this),stateVal),stateVal);});}return this.each(function(){var className,i,self,classNames;if(type==="string"){ // Toggle individual class names
	i=0;self=jQuery(this);classNames=value.match(rnotwhite)||[];while(className=classNames[i++]){ // Check each className given, space separated list
	if(self.hasClass(className)){self.removeClass(className);}else {self.addClass(className);}} // Toggle whole class name
	}else if(value===undefined||type==="boolean"){className=getClass(this);if(className){ // Store className if set
	dataPriv.set(this,"__className__",className);} // If the element has a class name or if we're passed `false`,
	// then remove the whole classname (if there was one, the above saved it).
	// Otherwise bring back whatever was previously saved (if anything),
	// falling back to the empty string if nothing was stored.
	if(this.setAttribute){this.setAttribute("class",className||value===false?"":dataPriv.get(this,"__className__")||"");}}});},hasClass:function hasClass(selector){var className,elem,i=0;className=" "+selector+" ";while(elem=this[i++]){if(elem.nodeType===1&&(" "+getClass(elem)+" ").replace(rclass," ").indexOf(className)>-1){return true;}}return false;}});var rreturn=/\r/g,rspaces=/[\x20\t\r\n\f]+/g;jQuery.fn.extend({val:function val(value){var hooks,ret,isFunction,elem=this[0];if(!arguments.length){if(elem){hooks=jQuery.valHooks[elem.type]||jQuery.valHooks[elem.nodeName.toLowerCase()];if(hooks&&"get" in hooks&&(ret=hooks.get(elem,"value"))!==undefined){return ret;}ret=elem.value;return typeof ret==="string"? // Handle most common string cases
	ret.replace(rreturn,""): // Handle cases where value is null/undef or number
	ret==null?"":ret;}return;}isFunction=jQuery.isFunction(value);return this.each(function(i){var val;if(this.nodeType!==1){return;}if(isFunction){val=value.call(this,i,jQuery(this).val());}else {val=value;} // Treat null/undefined as ""; convert numbers to string
	if(val==null){val="";}else if(typeof val==="number"){val+="";}else if(jQuery.isArray(val)){val=jQuery.map(val,function(value){return value==null?"":value+"";});}hooks=jQuery.valHooks[this.type]||jQuery.valHooks[this.nodeName.toLowerCase()]; // If set returns undefined, fall back to normal setting
	if(!hooks||!("set" in hooks)||hooks.set(this,val,"value")===undefined){this.value=val;}});}});jQuery.extend({valHooks:{option:{get:function get(elem){var val=jQuery.find.attr(elem,"value");return val!=null?val: // Support: IE10-11+
	// option.text throws exceptions (#14686, #14858)
	// Strip and collapse whitespace
	// https://html.spec.whatwg.org/#strip-and-collapse-whitespace
	jQuery.trim(jQuery.text(elem)).replace(rspaces," ");}},select:{get:function get(elem){var value,option,options=elem.options,index=elem.selectedIndex,one=elem.type==="select-one"||index<0,values=one?null:[],max=one?index+1:options.length,i=index<0?max:one?index:0; // Loop through all the selected options
	for(;i<max;i++){option=options[i]; // IE8-9 doesn't update selected after form reset (#2551)
	if((option.selected||i===index)&&( // Don't return options that are disabled or in a disabled optgroup
	support.optDisabled?!option.disabled:option.getAttribute("disabled")===null)&&(!option.parentNode.disabled||!jQuery.nodeName(option.parentNode,"optgroup"))){ // Get the specific value for the option
	value=jQuery(option).val(); // We don't need an array for one selects
	if(one){return value;} // Multi-Selects return an array
	values.push(value);}}return values;},set:function set(elem,value){var optionSet,option,options=elem.options,values=jQuery.makeArray(value),i=options.length;while(i--){option=options[i];if(option.selected=jQuery.inArray(jQuery.valHooks.option.get(option),values)>-1){optionSet=true;}} // Force browsers to behave consistently when non-matching value is set
	if(!optionSet){elem.selectedIndex=-1;}return values;}}}}); // Radios and checkboxes getter/setter
	jQuery.each(["radio","checkbox"],function(){jQuery.valHooks[this]={set:function set(elem,value){if(jQuery.isArray(value)){return elem.checked=jQuery.inArray(jQuery(elem).val(),value)>-1;}}};if(!support.checkOn){jQuery.valHooks[this].get=function(elem){return elem.getAttribute("value")===null?"on":elem.value;};}}); // Return jQuery for attributes-only inclusion
	var rfocusMorph=/^(?:focusinfocus|focusoutblur)$/;jQuery.extend(jQuery.event,{trigger:function trigger(event,data,elem,onlyHandlers){var i,cur,tmp,bubbleType,ontype,handle,special,eventPath=[elem||document],type=hasOwn.call(event,"type")?event.type:event,namespaces=hasOwn.call(event,"namespace")?event.namespace.split("."):[];cur=tmp=elem=elem||document; // Don't do events on text and comment nodes
	if(elem.nodeType===3||elem.nodeType===8){return;} // focus/blur morphs to focusin/out; ensure we're not firing them right now
	if(rfocusMorph.test(type+jQuery.event.triggered)){return;}if(type.indexOf(".")>-1){ // Namespaced trigger; create a regexp to match event type in handle()
	namespaces=type.split(".");type=namespaces.shift();namespaces.sort();}ontype=type.indexOf(":")<0&&"on"+type; // Caller can pass in a jQuery.Event object, Object, or just an event type string
	event=event[jQuery.expando]?event:new jQuery.Event(type,(typeof event==="undefined"?"undefined":_typeof(event))==="object"&&event); // Trigger bitmask: & 1 for native handlers; & 2 for jQuery (always true)
	event.isTrigger=onlyHandlers?2:3;event.namespace=namespaces.join(".");event.rnamespace=event.namespace?new RegExp("(^|\\.)"+namespaces.join("\\.(?:.*\\.|)")+"(\\.|$)"):null; // Clean up the event in case it is being reused
	event.result=undefined;if(!event.target){event.target=elem;} // Clone any incoming data and prepend the event, creating the handler arg list
	data=data==null?[event]:jQuery.makeArray(data,[event]); // Allow special events to draw outside the lines
	special=jQuery.event.special[type]||{};if(!onlyHandlers&&special.trigger&&special.trigger.apply(elem,data)===false){return;} // Determine event propagation path in advance, per W3C events spec (#9951)
	// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
	if(!onlyHandlers&&!special.noBubble&&!jQuery.isWindow(elem)){bubbleType=special.delegateType||type;if(!rfocusMorph.test(bubbleType+type)){cur=cur.parentNode;}for(;cur;cur=cur.parentNode){eventPath.push(cur);tmp=cur;} // Only add window if we got to document (e.g., not plain obj or detached DOM)
	if(tmp===(elem.ownerDocument||document)){eventPath.push(tmp.defaultView||tmp.parentWindow||window);}} // Fire handlers on the event path
	i=0;while((cur=eventPath[i++])&&!event.isPropagationStopped()){event.type=i>1?bubbleType:special.bindType||type; // jQuery handler
	handle=(dataPriv.get(cur,"events")||{})[event.type]&&dataPriv.get(cur,"handle");if(handle){handle.apply(cur,data);} // Native handler
	handle=ontype&&cur[ontype];if(handle&&handle.apply&&acceptData(cur)){event.result=handle.apply(cur,data);if(event.result===false){event.preventDefault();}}}event.type=type; // If nobody prevented the default action, do it now
	if(!onlyHandlers&&!event.isDefaultPrevented()){if((!special._default||special._default.apply(eventPath.pop(),data)===false)&&acceptData(elem)){ // Call a native DOM method on the target with the same name name as the event.
	// Don't do default actions on window, that's where global variables be (#6170)
	if(ontype&&jQuery.isFunction(elem[type])&&!jQuery.isWindow(elem)){ // Don't re-trigger an onFOO event when we call its FOO() method
	tmp=elem[ontype];if(tmp){elem[ontype]=null;} // Prevent re-triggering of the same event, since we already bubbled it above
	jQuery.event.triggered=type;elem[type]();jQuery.event.triggered=undefined;if(tmp){elem[ontype]=tmp;}}}}return event.result;}, // Piggyback on a donor event to simulate a different one
	simulate:function simulate(type,elem,event){var e=jQuery.extend(new jQuery.Event(),event,{type:type,isSimulated:true // Previously, `originalEvent: {}` was set here, so stopPropagation call
	// would not be triggered on donor event, since in our own
	// jQuery.event.stopPropagation function we had a check for existence of
	// originalEvent.stopPropagation method, so, consequently it would be a noop.
	//
	// But now, this "simulate" function is used only for events
	// for which stopPropagation() is noop, so there is no need for that anymore.
	//
	// For the 1.x branch though, guard for "click" and "submit"
	// events is still used, but was moved to jQuery.event.stopPropagation function
	// because `originalEvent` should point to the original event for the constancy
	// with other events and for more focused logic
	});jQuery.event.trigger(e,null,elem);if(e.isDefaultPrevented()){event.preventDefault();}}});jQuery.fn.extend({trigger:function trigger(type,data){return this.each(function(){jQuery.event.trigger(type,data,this);});},triggerHandler:function triggerHandler(type,data){var elem=this[0];if(elem){return jQuery.event.trigger(type,data,elem,true);}}});jQuery.each(("blur focus focusin focusout load resize scroll unload click dblclick "+"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave "+"change select submit keydown keypress keyup error contextmenu").split(" "),function(i,name){ // Handle event binding
	jQuery.fn[name]=function(data,fn){return arguments.length>0?this.on(name,null,data,fn):this.trigger(name);};});jQuery.fn.extend({hover:function hover(fnOver,fnOut){return this.mouseenter(fnOver).mouseleave(fnOut||fnOver);}});support.focusin="onfocusin" in window; // Support: Firefox
	// Firefox doesn't have focus(in | out) events
	// Related ticket - https://bugzilla.mozilla.org/show_bug.cgi?id=687787
	//
	// Support: Chrome, Safari
	// focus(in | out) events fire after focus & blur events,
	// which is spec violation - http://www.w3.org/TR/DOM-Level-3-Events/#events-focusevent-event-order
	// Related ticket - https://code.google.com/p/chromium/issues/detail?id=449857
	if(!support.focusin){jQuery.each({focus:"focusin",blur:"focusout"},function(orig,fix){ // Attach a single capturing handler on the document while someone wants focusin/focusout
	var handler=function handler(event){jQuery.event.simulate(fix,event.target,jQuery.event.fix(event));};jQuery.event.special[fix]={setup:function setup(){var doc=this.ownerDocument||this,attaches=dataPriv.access(doc,fix);if(!attaches){doc.addEventListener(orig,handler,true);}dataPriv.access(doc,fix,(attaches||0)+1);},teardown:function teardown(){var doc=this.ownerDocument||this,attaches=dataPriv.access(doc,fix)-1;if(!attaches){doc.removeEventListener(orig,handler,true);dataPriv.remove(doc,fix);}else {dataPriv.access(doc,fix,attaches);}}};});}var location=window.location;var nonce=jQuery.now();var rquery=/\?/; // Support: Android 2.3
	// Workaround failure to string-cast null input
	jQuery.parseJSON=function(data){return JSON.parse(data+"");}; // Cross-browser xml parsing
	jQuery.parseXML=function(data){var xml;if(!data||typeof data!=="string"){return null;} // Support: IE9
	try{xml=new window.DOMParser().parseFromString(data,"text/xml");}catch(e){xml=undefined;}if(!xml||xml.getElementsByTagName("parsererror").length){jQuery.error("Invalid XML: "+data);}return xml;};var rhash=/#.*$/,rts=/([?&])_=[^&]*/,rheaders=/^(.*?):[ \t]*([^\r\n]*)$/mg, // #7653, #8125, #8152: local protocol detection
	rlocalProtocol=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,rnoContent=/^(?:GET|HEAD)$/,rprotocol=/^\/\//, /* Prefilters
		 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
		 * 2) These are called:
		 *    - BEFORE asking for a transport
		 *    - AFTER param serialization (s.data is a string if s.processData is true)
		 * 3) key is the dataType
		 * 4) the catchall symbol "*" can be used
		 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
		 */prefilters={}, /* Transports bindings
		 * 1) key is the dataType
		 * 2) the catchall symbol "*" can be used
		 * 3) selection will start with transport dataType and THEN go to "*" if needed
		 */transports={}, // Avoid comment-prolog char sequence (#10098); must appease lint and evade compression
	allTypes="*/".concat("*"), // Anchor tag for parsing the document origin
	originAnchor=document.createElement("a");originAnchor.href=location.href; // Base "constructor" for jQuery.ajaxPrefilter and jQuery.ajaxTransport
	function addToPrefiltersOrTransports(structure){ // dataTypeExpression is optional and defaults to "*"
	return function(dataTypeExpression,func){if(typeof dataTypeExpression!=="string"){func=dataTypeExpression;dataTypeExpression="*";}var dataType,i=0,dataTypes=dataTypeExpression.toLowerCase().match(rnotwhite)||[];if(jQuery.isFunction(func)){ // For each dataType in the dataTypeExpression
	while(dataType=dataTypes[i++]){ // Prepend if requested
	if(dataType[0]==="+"){dataType=dataType.slice(1)||"*";(structure[dataType]=structure[dataType]||[]).unshift(func); // Otherwise append
	}else {(structure[dataType]=structure[dataType]||[]).push(func);}}}};} // Base inspection function for prefilters and transports
	function inspectPrefiltersOrTransports(structure,options,originalOptions,jqXHR){var inspected={},seekingTransport=structure===transports;function inspect(dataType){var selected;inspected[dataType]=true;jQuery.each(structure[dataType]||[],function(_,prefilterOrFactory){var dataTypeOrTransport=prefilterOrFactory(options,originalOptions,jqXHR);if(typeof dataTypeOrTransport==="string"&&!seekingTransport&&!inspected[dataTypeOrTransport]){options.dataTypes.unshift(dataTypeOrTransport);inspect(dataTypeOrTransport);return false;}else if(seekingTransport){return !(selected=dataTypeOrTransport);}});return selected;}return inspect(options.dataTypes[0])||!inspected["*"]&&inspect("*");} // A special extend for ajax options
	// that takes "flat" options (not to be deep extended)
	// Fixes #9887
	function ajaxExtend(target,src){var key,deep,flatOptions=jQuery.ajaxSettings.flatOptions||{};for(key in src){if(src[key]!==undefined){(flatOptions[key]?target:deep||(deep={}))[key]=src[key];}}if(deep){jQuery.extend(true,target,deep);}return target;} /* Handles responses to an ajax request:
	 * - finds the right dataType (mediates between content-type and expected dataType)
	 * - returns the corresponding response
	 */function ajaxHandleResponses(s,jqXHR,responses){var ct,type,finalDataType,firstDataType,contents=s.contents,dataTypes=s.dataTypes; // Remove auto dataType and get content-type in the process
	while(dataTypes[0]==="*"){dataTypes.shift();if(ct===undefined){ct=s.mimeType||jqXHR.getResponseHeader("Content-Type");}} // Check if we're dealing with a known content-type
	if(ct){for(type in contents){if(contents[type]&&contents[type].test(ct)){dataTypes.unshift(type);break;}}} // Check to see if we have a response for the expected dataType
	if(dataTypes[0] in responses){finalDataType=dataTypes[0];}else { // Try convertible dataTypes
	for(type in responses){if(!dataTypes[0]||s.converters[type+" "+dataTypes[0]]){finalDataType=type;break;}if(!firstDataType){firstDataType=type;}} // Or just use first one
	finalDataType=finalDataType||firstDataType;} // If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if(finalDataType){if(finalDataType!==dataTypes[0]){dataTypes.unshift(finalDataType);}return responses[finalDataType];}} /* Chain conversions given the request and the original response
	 * Also sets the responseXXX fields on the jqXHR instance
	 */function ajaxConvert(s,response,jqXHR,isSuccess){var conv2,current,conv,tmp,prev,converters={}, // Work with a copy of dataTypes in case we need to modify it for conversion
	dataTypes=s.dataTypes.slice(); // Create converters map with lowercased keys
	if(dataTypes[1]){for(conv in s.converters){converters[conv.toLowerCase()]=s.converters[conv];}}current=dataTypes.shift(); // Convert to each sequential dataType
	while(current){if(s.responseFields[current]){jqXHR[s.responseFields[current]]=response;} // Apply the dataFilter if provided
	if(!prev&&isSuccess&&s.dataFilter){response=s.dataFilter(response,s.dataType);}prev=current;current=dataTypes.shift();if(current){ // There's only work to do if current dataType is non-auto
	if(current==="*"){current=prev; // Convert response if prev dataType is non-auto and differs from current
	}else if(prev!=="*"&&prev!==current){ // Seek a direct converter
	conv=converters[prev+" "+current]||converters["* "+current]; // If none found, seek a pair
	if(!conv){for(conv2 in converters){ // If conv2 outputs current
	tmp=conv2.split(" ");if(tmp[1]===current){ // If prev can be converted to accepted input
	conv=converters[prev+" "+tmp[0]]||converters["* "+tmp[0]];if(conv){ // Condense equivalence converters
	if(conv===true){conv=converters[conv2]; // Otherwise, insert the intermediate dataType
	}else if(converters[conv2]!==true){current=tmp[0];dataTypes.unshift(tmp[1]);}break;}}}} // Apply converter (if not an equivalence)
	if(conv!==true){ // Unless errors are allowed to bubble, catch and return them
	if(conv&&s.throws){response=conv(response);}else {try{response=conv(response);}catch(e){return {state:"parsererror",error:conv?e:"No conversion from "+prev+" to "+current};}}}}}}return {state:"success",data:response};}jQuery.extend({ // Counter for holding the number of active queries
	active:0, // Last-Modified header cache for next request
	lastModified:{},etag:{},ajaxSettings:{url:location.href,type:"GET",isLocal:rlocalProtocol.test(location.protocol),global:true,processData:true,async:true,contentType:"application/x-www-form-urlencoded; charset=UTF-8", /*
			timeout: 0,
			data: null,
			dataType: null,
			username: null,
			password: null,
			cache: null,
			throws: false,
			traditional: false,
			headers: {},
			*/accepts:{"*":allTypes,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"}, // Data converters
	// Keys separate source (or catchall "*") and destination types with a single space
	converters:{ // Convert anything to text
	"* text":String, // Text to html (true = no transformation)
	"text html":true, // Evaluate text as a json expression
	"text json":jQuery.parseJSON, // Parse text as xml
	"text xml":jQuery.parseXML}, // For options that shouldn't be deep extended:
	// you can add your own custom options here if
	// and when you create one that shouldn't be
	// deep extended (see ajaxExtend)
	flatOptions:{url:true,context:true}}, // Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup:function ajaxSetup(target,settings){return settings? // Building a settings object
	ajaxExtend(ajaxExtend(target,jQuery.ajaxSettings),settings): // Extending ajaxSettings
	ajaxExtend(jQuery.ajaxSettings,target);},ajaxPrefilter:addToPrefiltersOrTransports(prefilters),ajaxTransport:addToPrefiltersOrTransports(transports), // Main method
	ajax:function ajax(url,options){ // If url is an object, simulate pre-1.5 signature
	if((typeof url==="undefined"?"undefined":_typeof(url))==="object"){options=url;url=undefined;} // Force options to be an object
	options=options||{};var transport, // URL without anti-cache param
	cacheURL, // Response headers
	responseHeadersString,responseHeaders, // timeout handle
	timeoutTimer, // Url cleanup var
	urlAnchor, // To know if global events are to be dispatched
	fireGlobals, // Loop variable
	i, // Create the final options object
	s=jQuery.ajaxSetup({},options), // Callbacks context
	callbackContext=s.context||s, // Context for global events is callbackContext if it is a DOM node or jQuery collection
	globalEventContext=s.context&&(callbackContext.nodeType||callbackContext.jquery)?jQuery(callbackContext):jQuery.event, // Deferreds
	deferred=jQuery.Deferred(),completeDeferred=jQuery.Callbacks("once memory"), // Status-dependent callbacks
	_statusCode=s.statusCode||{}, // Headers (they are sent all at once)
	requestHeaders={},requestHeadersNames={}, // The jqXHR state
	state=0, // Default abort message
	strAbort="canceled", // Fake xhr
	jqXHR={readyState:0, // Builds headers hashtable if needed
	getResponseHeader:function getResponseHeader(key){var match;if(state===2){if(!responseHeaders){responseHeaders={};while(match=rheaders.exec(responseHeadersString)){responseHeaders[match[1].toLowerCase()]=match[2];}}match=responseHeaders[key.toLowerCase()];}return match==null?null:match;}, // Raw string
	getAllResponseHeaders:function getAllResponseHeaders(){return state===2?responseHeadersString:null;}, // Caches the header
	setRequestHeader:function setRequestHeader(name,value){var lname=name.toLowerCase();if(!state){name=requestHeadersNames[lname]=requestHeadersNames[lname]||name;requestHeaders[name]=value;}return this;}, // Overrides response content-type header
	overrideMimeType:function overrideMimeType(type){if(!state){s.mimeType=type;}return this;}, // Status-dependent callbacks
	statusCode:function statusCode(map){var code;if(map){if(state<2){for(code in map){ // Lazy-add the new callback in a way that preserves old ones
	_statusCode[code]=[_statusCode[code],map[code]];}}else { // Execute the appropriate callbacks
	jqXHR.always(map[jqXHR.status]);}}return this;}, // Cancel the request
	abort:function abort(statusText){var finalText=statusText||strAbort;if(transport){transport.abort(finalText);}done(0,finalText);return this;}}; // Attach deferreds
	deferred.promise(jqXHR).complete=completeDeferred.add;jqXHR.success=jqXHR.done;jqXHR.error=jqXHR.fail; // Remove hash character (#7531: and string promotion)
	// Add protocol if not provided (prefilters might expect it)
	// Handle falsy url in the settings object (#10093: consistency with old signature)
	// We also use the url parameter if available
	s.url=((url||s.url||location.href)+"").replace(rhash,"").replace(rprotocol,location.protocol+"//"); // Alias method option to type as per ticket #12004
	s.type=options.method||options.type||s.method||s.type; // Extract dataTypes list
	s.dataTypes=jQuery.trim(s.dataType||"*").toLowerCase().match(rnotwhite)||[""]; // A cross-domain request is in order when the origin doesn't match the current origin.
	if(s.crossDomain==null){urlAnchor=document.createElement("a"); // Support: IE8-11+
	// IE throws exception if url is malformed, e.g. http://example.com:80x/
	try{urlAnchor.href=s.url; // Support: IE8-11+
	// Anchor's host property isn't correctly set when s.url is relative
	urlAnchor.href=urlAnchor.href;s.crossDomain=originAnchor.protocol+"//"+originAnchor.host!==urlAnchor.protocol+"//"+urlAnchor.host;}catch(e){ // If there is an error parsing the URL, assume it is crossDomain,
	// it can be rejected by the transport if it is invalid
	s.crossDomain=true;}} // Convert data if not already a string
	if(s.data&&s.processData&&typeof s.data!=="string"){s.data=jQuery.param(s.data,s.traditional);} // Apply prefilters
	inspectPrefiltersOrTransports(prefilters,s,options,jqXHR); // If request was aborted inside a prefilter, stop there
	if(state===2){return jqXHR;} // We can fire global events as of now if asked to
	// Don't fire events if jQuery.event is undefined in an AMD-usage scenario (#15118)
	fireGlobals=jQuery.event&&s.global; // Watch for a new set of requests
	if(fireGlobals&&jQuery.active++===0){jQuery.event.trigger("ajaxStart");} // Uppercase the type
	s.type=s.type.toUpperCase(); // Determine if request has content
	s.hasContent=!rnoContent.test(s.type); // Save the URL in case we're toying with the If-Modified-Since
	// and/or If-None-Match header later on
	cacheURL=s.url; // More options handling for requests with no content
	if(!s.hasContent){ // If data is available, append data to url
	if(s.data){cacheURL=s.url+=(rquery.test(cacheURL)?"&":"?")+s.data; // #9682: remove data so that it's not used in an eventual retry
	delete s.data;} // Add anti-cache in url if needed
	if(s.cache===false){s.url=rts.test(cacheURL)? // If there is already a '_' parameter, set its value
	cacheURL.replace(rts,"$1_="+nonce++): // Otherwise add one to the end
	cacheURL+(rquery.test(cacheURL)?"&":"?")+"_="+nonce++;}} // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
	if(s.ifModified){if(jQuery.lastModified[cacheURL]){jqXHR.setRequestHeader("If-Modified-Since",jQuery.lastModified[cacheURL]);}if(jQuery.etag[cacheURL]){jqXHR.setRequestHeader("If-None-Match",jQuery.etag[cacheURL]);}} // Set the correct header, if data is being sent
	if(s.data&&s.hasContent&&s.contentType!==false||options.contentType){jqXHR.setRequestHeader("Content-Type",s.contentType);} // Set the Accepts header for the server, depending on the dataType
	jqXHR.setRequestHeader("Accept",s.dataTypes[0]&&s.accepts[s.dataTypes[0]]?s.accepts[s.dataTypes[0]]+(s.dataTypes[0]!=="*"?", "+allTypes+"; q=0.01":""):s.accepts["*"]); // Check for headers option
	for(i in s.headers){jqXHR.setRequestHeader(i,s.headers[i]);} // Allow custom headers/mimetypes and early abort
	if(s.beforeSend&&(s.beforeSend.call(callbackContext,jqXHR,s)===false||state===2)){ // Abort if not done already and return
	return jqXHR.abort();} // Aborting is no longer a cancellation
	strAbort="abort"; // Install callbacks on deferreds
	for(i in {success:1,error:1,complete:1}){jqXHR[i](s[i]);} // Get transport
	transport=inspectPrefiltersOrTransports(transports,s,options,jqXHR); // If no transport, we auto-abort
	if(!transport){done(-1,"No Transport");}else {jqXHR.readyState=1; // Send global event
	if(fireGlobals){globalEventContext.trigger("ajaxSend",[jqXHR,s]);} // If request was aborted inside ajaxSend, stop there
	if(state===2){return jqXHR;} // Timeout
	if(s.async&&s.timeout>0){timeoutTimer=window.setTimeout(function(){jqXHR.abort("timeout");},s.timeout);}try{state=1;transport.send(requestHeaders,done);}catch(e){ // Propagate exception as error if not done
	if(state<2){done(-1,e); // Simply rethrow otherwise
	}else {throw e;}}} // Callback for when everything is done
	function done(status,nativeStatusText,responses,headers){var isSuccess,success,error,response,modified,statusText=nativeStatusText; // Called once
	if(state===2){return;} // State is "done" now
	state=2; // Clear timeout if it exists
	if(timeoutTimer){window.clearTimeout(timeoutTimer);} // Dereference transport for early garbage collection
	// (no matter how long the jqXHR object will be used)
	transport=undefined; // Cache response headers
	responseHeadersString=headers||""; // Set readyState
	jqXHR.readyState=status>0?4:0; // Determine if successful
	isSuccess=status>=200&&status<300||status===304; // Get response data
	if(responses){response=ajaxHandleResponses(s,jqXHR,responses);} // Convert no matter what (that way responseXXX fields are always set)
	response=ajaxConvert(s,response,jqXHR,isSuccess); // If successful, handle type chaining
	if(isSuccess){ // Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
	if(s.ifModified){modified=jqXHR.getResponseHeader("Last-Modified");if(modified){jQuery.lastModified[cacheURL]=modified;}modified=jqXHR.getResponseHeader("etag");if(modified){jQuery.etag[cacheURL]=modified;}} // if no content
	if(status===204||s.type==="HEAD"){statusText="nocontent"; // if not modified
	}else if(status===304){statusText="notmodified"; // If we have data, let's convert it
	}else {statusText=response.state;success=response.data;error=response.error;isSuccess=!error;}}else { // Extract error from statusText and normalize for non-aborts
	error=statusText;if(status||!statusText){statusText="error";if(status<0){status=0;}}} // Set data for the fake xhr object
	jqXHR.status=status;jqXHR.statusText=(nativeStatusText||statusText)+""; // Success/Error
	if(isSuccess){deferred.resolveWith(callbackContext,[success,statusText,jqXHR]);}else {deferred.rejectWith(callbackContext,[jqXHR,statusText,error]);} // Status-dependent callbacks
	jqXHR.statusCode(_statusCode);_statusCode=undefined;if(fireGlobals){globalEventContext.trigger(isSuccess?"ajaxSuccess":"ajaxError",[jqXHR,s,isSuccess?success:error]);} // Complete
	completeDeferred.fireWith(callbackContext,[jqXHR,statusText]);if(fireGlobals){globalEventContext.trigger("ajaxComplete",[jqXHR,s]); // Handle the global AJAX counter
	if(! --jQuery.active){jQuery.event.trigger("ajaxStop");}}}return jqXHR;},getJSON:function getJSON(url,data,callback){return jQuery.get(url,data,callback,"json");},getScript:function getScript(url,callback){return jQuery.get(url,undefined,callback,"script");}});jQuery.each(["get","post"],function(i,method){jQuery[method]=function(url,data,callback,type){ // Shift arguments if data argument was omitted
	if(jQuery.isFunction(data)){type=type||callback;callback=data;data=undefined;} // The url can be an options object (which then must have .url)
	return jQuery.ajax(jQuery.extend({url:url,type:method,dataType:type,data:data,success:callback},jQuery.isPlainObject(url)&&url));};});jQuery._evalUrl=function(url){return jQuery.ajax({url:url, // Make this explicit, since user can override this through ajaxSetup (#11264)
	type:"GET",dataType:"script",async:false,global:false,"throws":true});};jQuery.fn.extend({wrapAll:function wrapAll(html){var wrap;if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapAll(html.call(this,i));});}if(this[0]){ // The elements to wrap the target around
	wrap=jQuery(html,this[0].ownerDocument).eq(0).clone(true);if(this[0].parentNode){wrap.insertBefore(this[0]);}wrap.map(function(){var elem=this;while(elem.firstElementChild){elem=elem.firstElementChild;}return elem;}).append(this);}return this;},wrapInner:function wrapInner(html){if(jQuery.isFunction(html)){return this.each(function(i){jQuery(this).wrapInner(html.call(this,i));});}return this.each(function(){var self=jQuery(this),contents=self.contents();if(contents.length){contents.wrapAll(html);}else {self.append(html);}});},wrap:function wrap(html){var isFunction=jQuery.isFunction(html);return this.each(function(i){jQuery(this).wrapAll(isFunction?html.call(this,i):html);});},unwrap:function unwrap(){return this.parent().each(function(){if(!jQuery.nodeName(this,"body")){jQuery(this).replaceWith(this.childNodes);}}).end();}});jQuery.expr.filters.hidden=function(elem){return !jQuery.expr.filters.visible(elem);};jQuery.expr.filters.visible=function(elem){ // Support: Opera <= 12.12
	// Opera reports offsetWidths and offsetHeights less than zero on some elements
	// Use OR instead of AND as the element is not visible if either is true
	// See tickets #10406 and #13132
	return elem.offsetWidth>0||elem.offsetHeight>0||elem.getClientRects().length>0;};var r20=/%20/g,rbracket=/\[\]$/,rCRLF=/\r?\n/g,rsubmitterTypes=/^(?:submit|button|image|reset|file)$/i,rsubmittable=/^(?:input|select|textarea|keygen)/i;function buildParams(prefix,obj,traditional,add){var name;if(jQuery.isArray(obj)){ // Serialize array item.
	jQuery.each(obj,function(i,v){if(traditional||rbracket.test(prefix)){ // Treat each array item as a scalar.
	add(prefix,v);}else { // Item is non-scalar (array or object), encode its numeric index.
	buildParams(prefix+"["+((typeof v==="undefined"?"undefined":_typeof(v))==="object"&&v!=null?i:"")+"]",v,traditional,add);}});}else if(!traditional&&jQuery.type(obj)==="object"){ // Serialize object item.
	for(name in obj){buildParams(prefix+"["+name+"]",obj[name],traditional,add);}}else { // Serialize scalar item.
	add(prefix,obj);}} // Serialize an array of form elements or a set of
	// key/values into a query string
	jQuery.param=function(a,traditional){var prefix,s=[],add=function add(key,value){ // If value is a function, invoke it and return its value
	value=jQuery.isFunction(value)?value():value==null?"":value;s[s.length]=encodeURIComponent(key)+"="+encodeURIComponent(value);}; // Set traditional to true for jQuery <= 1.3.2 behavior.
	if(traditional===undefined){traditional=jQuery.ajaxSettings&&jQuery.ajaxSettings.traditional;} // If an array was passed in, assume that it is an array of form elements.
	if(jQuery.isArray(a)||a.jquery&&!jQuery.isPlainObject(a)){ // Serialize the form elements
	jQuery.each(a,function(){add(this.name,this.value);});}else { // If traditional, encode the "old" way (the way 1.3.2 or older
	// did it), otherwise encode params recursively.
	for(prefix in a){buildParams(prefix,a[prefix],traditional,add);}} // Return the resulting serialization
	return s.join("&").replace(r20,"+");};jQuery.fn.extend({serialize:function serialize(){return jQuery.param(this.serializeArray());},serializeArray:function serializeArray(){return this.map(function(){ // Can add propHook for "elements" to filter or add form elements
	var elements=jQuery.prop(this,"elements");return elements?jQuery.makeArray(elements):this;}).filter(function(){var type=this.type; // Use .is( ":disabled" ) so that fieldset[disabled] works
	return this.name&&!jQuery(this).is(":disabled")&&rsubmittable.test(this.nodeName)&&!rsubmitterTypes.test(type)&&(this.checked||!rcheckableType.test(type));}).map(function(i,elem){var val=jQuery(this).val();return val==null?null:jQuery.isArray(val)?jQuery.map(val,function(val){return {name:elem.name,value:val.replace(rCRLF,"\r\n")};}):{name:elem.name,value:val.replace(rCRLF,"\r\n")};}).get();}});jQuery.ajaxSettings.xhr=function(){try{return new window.XMLHttpRequest();}catch(e){}};var xhrSuccessStatus={ // File protocol always yields status code 0, assume 200
	0:200, // Support: IE9
	// #1450: sometimes IE returns 1223 when it should be 204
	1223:204},xhrSupported=jQuery.ajaxSettings.xhr();support.cors=!!xhrSupported&&"withCredentials" in xhrSupported;support.ajax=xhrSupported=!!xhrSupported;jQuery.ajaxTransport(function(options){var _callback,errorCallback; // Cross domain only allowed if supported through XMLHttpRequest
	if(support.cors||xhrSupported&&!options.crossDomain){return {send:function send(headers,complete){var i,xhr=options.xhr();xhr.open(options.type,options.url,options.async,options.username,options.password); // Apply custom fields if provided
	if(options.xhrFields){for(i in options.xhrFields){xhr[i]=options.xhrFields[i];}} // Override mime type if needed
	if(options.mimeType&&xhr.overrideMimeType){xhr.overrideMimeType(options.mimeType);} // X-Requested-With header
	// For cross-domain requests, seeing as conditions for a preflight are
	// akin to a jigsaw puzzle, we simply never set it to be sure.
	// (it can always be set on a per-request basis or even using ajaxSetup)
	// For same-domain requests, won't change header if already provided.
	if(!options.crossDomain&&!headers["X-Requested-With"]){headers["X-Requested-With"]="XMLHttpRequest";} // Set headers
	for(i in headers){xhr.setRequestHeader(i,headers[i]);} // Callback
	_callback=function callback(type){return function(){if(_callback){_callback=errorCallback=xhr.onload=xhr.onerror=xhr.onabort=xhr.onreadystatechange=null;if(type==="abort"){xhr.abort();}else if(type==="error"){ // Support: IE9
	// On a manual native abort, IE9 throws
	// errors on any property access that is not readyState
	if(typeof xhr.status!=="number"){complete(0,"error");}else {complete( // File: protocol always yields status 0; see #8605, #14207
	xhr.status,xhr.statusText);}}else {complete(xhrSuccessStatus[xhr.status]||xhr.status,xhr.statusText, // Support: IE9 only
	// IE9 has no XHR2 but throws on binary (trac-11426)
	// For XHR2 non-text, let the caller handle it (gh-2498)
	(xhr.responseType||"text")!=="text"||typeof xhr.responseText!=="string"?{binary:xhr.response}:{text:xhr.responseText},xhr.getAllResponseHeaders());}}};}; // Listen to events
	xhr.onload=_callback();errorCallback=xhr.onerror=_callback("error"); // Support: IE9
	// Use onreadystatechange to replace onabort
	// to handle uncaught aborts
	if(xhr.onabort!==undefined){xhr.onabort=errorCallback;}else {xhr.onreadystatechange=function(){ // Check readyState before timeout as it changes
	if(xhr.readyState===4){ // Allow onerror to be called first,
	// but that will not handle a native abort
	// Also, save errorCallback to a variable
	// as xhr.onerror cannot be accessed
	window.setTimeout(function(){if(_callback){errorCallback();}});}};} // Create the abort callback
	_callback=_callback("abort");try{ // Do send the request (this may raise an exception)
	xhr.send(options.hasContent&&options.data||null);}catch(e){ // #14683: Only rethrow if this hasn't been notified as an error yet
	if(_callback){throw e;}}},abort:function abort(){if(_callback){_callback();}}};}}); // Install script dataType
	jQuery.ajaxSetup({accepts:{script:"text/javascript, application/javascript, "+"application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function textScript(text){jQuery.globalEval(text);return text;}}}); // Handle cache's special case and crossDomain
	jQuery.ajaxPrefilter("script",function(s){if(s.cache===undefined){s.cache=false;}if(s.crossDomain){s.type="GET";}}); // Bind script tag hack transport
	jQuery.ajaxTransport("script",function(s){ // This transport only deals with cross domain requests
	if(s.crossDomain){var script,_callback2;return {send:function send(_,complete){script=jQuery("<script>").prop({charset:s.scriptCharset,src:s.url}).on("load error",_callback2=function callback(evt){script.remove();_callback2=null;if(evt){complete(evt.type==="error"?404:200,evt.type);}}); // Use native DOM manipulation to avoid our domManip AJAX trickery
	document.head.appendChild(script[0]);},abort:function abort(){if(_callback2){_callback2();}}};}});var oldCallbacks=[],rjsonp=/(=)\?(?=&|$)|\?\?/; // Default jsonp settings
	jQuery.ajaxSetup({jsonp:"callback",jsonpCallback:function jsonpCallback(){var callback=oldCallbacks.pop()||jQuery.expando+"_"+nonce++;this[callback]=true;return callback;}}); // Detect, normalize options and install callbacks for jsonp requests
	jQuery.ajaxPrefilter("json jsonp",function(s,originalSettings,jqXHR){var callbackName,overwritten,responseContainer,jsonProp=s.jsonp!==false&&(rjsonp.test(s.url)?"url":typeof s.data==="string"&&(s.contentType||"").indexOf("application/x-www-form-urlencoded")===0&&rjsonp.test(s.data)&&"data"); // Handle iff the expected data type is "jsonp" or we have a parameter to set
	if(jsonProp||s.dataTypes[0]==="jsonp"){ // Get callback name, remembering preexisting value associated with it
	callbackName=s.jsonpCallback=jQuery.isFunction(s.jsonpCallback)?s.jsonpCallback():s.jsonpCallback; // Insert callback into url or form data
	if(jsonProp){s[jsonProp]=s[jsonProp].replace(rjsonp,"$1"+callbackName);}else if(s.jsonp!==false){s.url+=(rquery.test(s.url)?"&":"?")+s.jsonp+"="+callbackName;} // Use data converter to retrieve json after script execution
	s.converters["script json"]=function(){if(!responseContainer){jQuery.error(callbackName+" was not called");}return responseContainer[0];}; // Force json dataType
	s.dataTypes[0]="json"; // Install callback
	overwritten=window[callbackName];window[callbackName]=function(){responseContainer=arguments;}; // Clean-up function (fires after converters)
	jqXHR.always(function(){ // If previous value didn't exist - remove it
	if(overwritten===undefined){jQuery(window).removeProp(callbackName); // Otherwise restore preexisting value
	}else {window[callbackName]=overwritten;} // Save back as free
	if(s[callbackName]){ // Make sure that re-using the options doesn't screw things around
	s.jsonpCallback=originalSettings.jsonpCallback; // Save the callback name for future use
	oldCallbacks.push(callbackName);} // Call if it was a function and we have a response
	if(responseContainer&&jQuery.isFunction(overwritten)){overwritten(responseContainer[0]);}responseContainer=overwritten=undefined;}); // Delegate to script
	return "script";}}); // Argument "data" should be string of html
	// context (optional): If specified, the fragment will be created in this context,
	// defaults to document
	// keepScripts (optional): If true, will include scripts passed in the html string
	jQuery.parseHTML=function(data,context,keepScripts){if(!data||typeof data!=="string"){return null;}if(typeof context==="boolean"){keepScripts=context;context=false;}context=context||document;var parsed=rsingleTag.exec(data),scripts=!keepScripts&&[]; // Single tag
	if(parsed){return [context.createElement(parsed[1])];}parsed=buildFragment([data],context,scripts);if(scripts&&scripts.length){jQuery(scripts).remove();}return jQuery.merge([],parsed.childNodes);}; // Keep a copy of the old load method
	var _load=jQuery.fn.load; /**
	 * Load a url into a page
	 */jQuery.fn.load=function(url,params,callback){if(typeof url!=="string"&&_load){return _load.apply(this,arguments);}var selector,type,response,self=this,off=url.indexOf(" ");if(off>-1){selector=jQuery.trim(url.slice(off));url=url.slice(0,off);} // If it's a function
	if(jQuery.isFunction(params)){ // We assume that it's the callback
	callback=params;params=undefined; // Otherwise, build a param string
	}else if(params&&(typeof params==="undefined"?"undefined":_typeof(params))==="object"){type="POST";} // If we have elements to modify, make the request
	if(self.length>0){jQuery.ajax({url:url, // If "type" variable is undefined, then "GET" method will be used.
	// Make value of this field explicit since
	// user can override it through ajaxSetup method
	type:type||"GET",dataType:"html",data:params}).done(function(responseText){ // Save response for use in complete callback
	response=arguments;self.html(selector? // If a selector was specified, locate the right elements in a dummy div
	// Exclude scripts to avoid IE 'Permission Denied' errors
	jQuery("<div>").append(jQuery.parseHTML(responseText)).find(selector): // Otherwise use the full result
	responseText); // If the request succeeds, this function gets "data", "status", "jqXHR"
	// but they are ignored because response was set above.
	// If it fails, this function gets "jqXHR", "status", "error"
	}).always(callback&&function(jqXHR,status){self.each(function(){callback.apply(this,response||[jqXHR.responseText,status,jqXHR]);});});}return this;}; // Attach a bunch of functions for handling common AJAX events
	jQuery.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(i,type){jQuery.fn[type]=function(fn){return this.on(type,fn);};});jQuery.expr.filters.animated=function(elem){return jQuery.grep(jQuery.timers,function(fn){return elem===fn.elem;}).length;}; /**
	 * Gets a window from an element
	 */function getWindow(elem){return jQuery.isWindow(elem)?elem:elem.nodeType===9&&elem.defaultView;}jQuery.offset={setOffset:function setOffset(elem,options,i){var curPosition,curLeft,curCSSTop,curTop,curOffset,curCSSLeft,calculatePosition,position=jQuery.css(elem,"position"),curElem=jQuery(elem),props={}; // Set position first, in-case top/left are set even on static elem
	if(position==="static"){elem.style.position="relative";}curOffset=curElem.offset();curCSSTop=jQuery.css(elem,"top");curCSSLeft=jQuery.css(elem,"left");calculatePosition=(position==="absolute"||position==="fixed")&&(curCSSTop+curCSSLeft).indexOf("auto")>-1; // Need to be able to calculate position if either
	// top or left is auto and position is either absolute or fixed
	if(calculatePosition){curPosition=curElem.position();curTop=curPosition.top;curLeft=curPosition.left;}else {curTop=parseFloat(curCSSTop)||0;curLeft=parseFloat(curCSSLeft)||0;}if(jQuery.isFunction(options)){ // Use jQuery.extend here to allow modification of coordinates argument (gh-1848)
	options=options.call(elem,i,jQuery.extend({},curOffset));}if(options.top!=null){props.top=options.top-curOffset.top+curTop;}if(options.left!=null){props.left=options.left-curOffset.left+curLeft;}if("using" in options){options.using.call(elem,props);}else {curElem.css(props);}}};jQuery.fn.extend({offset:function offset(options){if(arguments.length){return options===undefined?this:this.each(function(i){jQuery.offset.setOffset(this,options,i);});}var docElem,win,elem=this[0],box={top:0,left:0},doc=elem&&elem.ownerDocument;if(!doc){return;}docElem=doc.documentElement; // Make sure it's not a disconnected DOM node
	if(!jQuery.contains(docElem,elem)){return box;}box=elem.getBoundingClientRect();win=getWindow(doc);return {top:box.top+win.pageYOffset-docElem.clientTop,left:box.left+win.pageXOffset-docElem.clientLeft};},position:function position(){if(!this[0]){return;}var offsetParent,offset,elem=this[0],parentOffset={top:0,left:0}; // Fixed elements are offset from window (parentOffset = {top:0, left: 0},
	// because it is its only offset parent
	if(jQuery.css(elem,"position")==="fixed"){ // Assume getBoundingClientRect is there when computed position is fixed
	offset=elem.getBoundingClientRect();}else { // Get *real* offsetParent
	offsetParent=this.offsetParent(); // Get correct offsets
	offset=this.offset();if(!jQuery.nodeName(offsetParent[0],"html")){parentOffset=offsetParent.offset();} // Add offsetParent borders
	parentOffset.top+=jQuery.css(offsetParent[0],"borderTopWidth",true);parentOffset.left+=jQuery.css(offsetParent[0],"borderLeftWidth",true);} // Subtract parent offsets and element margins
	return {top:offset.top-parentOffset.top-jQuery.css(elem,"marginTop",true),left:offset.left-parentOffset.left-jQuery.css(elem,"marginLeft",true)};}, // This method will return documentElement in the following cases:
	// 1) For the element inside the iframe without offsetParent, this method will return
	//    documentElement of the parent window
	// 2) For the hidden or detached element
	// 3) For body or html element, i.e. in case of the html node - it will return itself
	//
	// but those exceptions were never presented as a real life use-cases
	// and might be considered as more preferable results.
	//
	// This logic, however, is not guaranteed and can change at any point in the future
	offsetParent:function offsetParent(){return this.map(function(){var offsetParent=this.offsetParent;while(offsetParent&&jQuery.css(offsetParent,"position")==="static"){offsetParent=offsetParent.offsetParent;}return offsetParent||documentElement;});}}); // Create scrollLeft and scrollTop methods
	jQuery.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(method,prop){var top="pageYOffset"===prop;jQuery.fn[method]=function(val){return access(this,function(elem,method,val){var win=getWindow(elem);if(val===undefined){return win?win[prop]:elem[method];}if(win){win.scrollTo(!top?val:win.pageXOffset,top?val:win.pageYOffset);}else {elem[method]=val;}},method,val,arguments.length);};}); // Support: Safari<7-8+, Chrome<37-44+
	// Add the top/left cssHooks using jQuery.fn.position
	// Webkit bug: https://bugs.webkit.org/show_bug.cgi?id=29084
	// Blink bug: https://code.google.com/p/chromium/issues/detail?id=229280
	// getComputedStyle returns percent when specified for top/left/bottom/right;
	// rather than make the css module depend on the offset module, just check for it here
	jQuery.each(["top","left"],function(i,prop){jQuery.cssHooks[prop]=addGetHookIf(support.pixelPosition,function(elem,computed){if(computed){computed=curCSS(elem,prop); // If curCSS returns percentage, fallback to offset
	return rnumnonpx.test(computed)?jQuery(elem).position()[prop]+"px":computed;}});}); // Create innerHeight, innerWidth, height, width, outerHeight and outerWidth methods
	jQuery.each({Height:"height",Width:"width"},function(name,type){jQuery.each({padding:"inner"+name,content:type,"":"outer"+name},function(defaultExtra,funcName){ // Margin is only for outerHeight, outerWidth
	jQuery.fn[funcName]=function(margin,value){var chainable=arguments.length&&(defaultExtra||typeof margin!=="boolean"),extra=defaultExtra||(margin===true||value===true?"margin":"border");return access(this,function(elem,type,value){var doc;if(jQuery.isWindow(elem)){ // As of 5/8/2012 this will yield incorrect results for Mobile Safari, but there
	// isn't a whole lot we can do. See pull request at this URL for discussion:
	// https://github.com/jquery/jquery/pull/764
	return elem.document.documentElement["client"+name];} // Get document width or height
	if(elem.nodeType===9){doc=elem.documentElement; // Either scroll[Width/Height] or offset[Width/Height] or client[Width/Height],
	// whichever is greatest
	return Math.max(elem.body["scroll"+name],doc["scroll"+name],elem.body["offset"+name],doc["offset"+name],doc["client"+name]);}return value===undefined? // Get width or height on the element, requesting but not forcing parseFloat
	jQuery.css(elem,type,extra): // Set width or height on the element
	jQuery.style(elem,type,value,extra);},type,chainable?margin:undefined,chainable,null);};});});jQuery.fn.extend({bind:function bind(types,data,fn){return this.on(types,null,data,fn);},unbind:function unbind(types,fn){return this.off(types,null,fn);},delegate:function delegate(selector,types,data,fn){return this.on(types,selector,data,fn);},undelegate:function undelegate(selector,types,fn){ // ( namespace ) or ( selector, types [, fn] )
	return arguments.length===1?this.off(selector,"**"):this.off(types,selector||"**",fn);},size:function size(){return this.length;}});jQuery.fn.andSelf=jQuery.fn.addBack; // Register as a named AMD module, since jQuery can be concatenated with other
	// files that may use define, but not via a proper concatenation script that
	// understands anonymous AMD modules. A named AMD is safest and most robust
	// way to register. Lowercase jquery is used because AMD module names are
	// derived from file names, and jQuery is normally delivered in a lowercase
	// file name. Do this after creating the global so that if an AMD module wants
	// to call noConflict to hide this version of jQuery, it will work.
	// Note that for maximum portability, libraries that are not jQuery should
	// declare themselves as anonymous modules, and avoid setting a global if an
	// AMD loader is present. jQuery is a special case. For more information, see
	// https://github.com/jrburke/requirejs/wiki/Updating-existing-libraries#wiki-anon
	if(true){!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function(){return jQuery;}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));}var  // Map over jQuery in case of overwrite
	_jQuery=window.jQuery, // Map over the $ in case of overwrite
	_$=window.$;jQuery.noConflict=function(deep){if(window.$===jQuery){window.$=_$;}if(deep&&window.jQuery===jQuery){window.jQuery=_jQuery;}return jQuery;}; // Expose jQuery and $ identifiers, even in AMD
	// (#7102#comment:10, https://github.com/jquery/jquery/pull/557)
	// and CommonJS for browser emulators (#13566)
		if(!noGlobal){window.jQuery=window.$=jQuery;}return jQuery;});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(122)(module)))

/***/ },
/* 122 */
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
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var jQuery = __webpack_require__(121);

	/*!
	 * jQuery UI Core 1.10.4
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/category/ui-core/
	 */
	(function ($, undefined) {

		var uuid = 0,
		    runiqueId = /^ui-id-\d+$/;

		// $.ui might exist from components with no dependencies, e.g., $.ui.position
		$.ui = $.ui || {};

		$.extend($.ui, {
			version: "1.10.4",

			keyCode: {
				BACKSPACE: 8,
				COMMA: 188,
				DELETE: 46,
				DOWN: 40,
				END: 35,
				ENTER: 13,
				ESCAPE: 27,
				HOME: 36,
				LEFT: 37,
				NUMPAD_ADD: 107,
				NUMPAD_DECIMAL: 110,
				NUMPAD_DIVIDE: 111,
				NUMPAD_ENTER: 108,
				NUMPAD_MULTIPLY: 106,
				NUMPAD_SUBTRACT: 109,
				PAGE_DOWN: 34,
				PAGE_UP: 33,
				PERIOD: 190,
				RIGHT: 39,
				SPACE: 32,
				TAB: 9,
				UP: 38
			}
		});

		// plugins
		$.fn.extend({
			focus: function (orig) {
				return function (delay, fn) {
					return typeof delay === "number" ? this.each(function () {
						var elem = this;
						setTimeout(function () {
							$(elem).focus();
							if (fn) {
								fn.call(elem);
							}
						}, delay);
					}) : orig.apply(this, arguments);
				};
			}($.fn.focus),

			scrollParent: function scrollParent() {
				var scrollParent;
				if ($.ui.ie && /(static|relative)/.test(this.css("position")) || /absolute/.test(this.css("position"))) {
					scrollParent = this.parents().filter(function () {
						return (/(relative|absolute|fixed)/.test($.css(this, "position")) && /(auto|scroll)/.test($.css(this, "overflow") + $.css(this, "overflow-y") + $.css(this, "overflow-x"))
						);
					}).eq(0);
				} else {
					scrollParent = this.parents().filter(function () {
						return (/(auto|scroll)/.test($.css(this, "overflow") + $.css(this, "overflow-y") + $.css(this, "overflow-x"))
						);
					}).eq(0);
				}

				return (/fixed/.test(this.css("position")) || !scrollParent.length ? $(document) : scrollParent
				);
			},

			zIndex: function zIndex(_zIndex) {
				if (_zIndex !== undefined) {
					return this.css("zIndex", _zIndex);
				}

				if (this.length) {
					var elem = $(this[0]),
					    position,
					    value;
					while (elem.length && elem[0] !== document) {
						// Ignore z-index if position is set to a value where z-index is ignored by the browser
						// This makes behavior of this function consistent across browsers
						// WebKit always returns auto if the element is positioned
						position = elem.css("position");
						if (position === "absolute" || position === "relative" || position === "fixed") {
							// IE returns 0 when zIndex is not specified
							// other browsers return a string
							// we ignore the case of nested elements with an explicit value of 0
							// <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
							value = parseInt(elem.css("zIndex"), 10);
							if (!isNaN(value) && value !== 0) {
								return value;
							}
						}
						elem = elem.parent();
					}
				}

				return 0;
			},

			uniqueId: function uniqueId() {
				return this.each(function () {
					if (!this.id) {
						this.id = "ui-id-" + ++uuid;
					}
				});
			},

			removeUniqueId: function removeUniqueId() {
				return this.each(function () {
					if (runiqueId.test(this.id)) {
						$(this).removeAttr("id");
					}
				});
			}
		});

		// selectors
		function _focusable(element, isTabIndexNotNaN) {
			var map,
			    mapName,
			    img,
			    nodeName = element.nodeName.toLowerCase();
			if ("area" === nodeName) {
				map = element.parentNode;
				mapName = map.name;
				if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
					return false;
				}
				img = $("img[usemap=#" + mapName + "]")[0];
				return !!img && visible(img);
			}
			return (/input|select|textarea|button|object/.test(nodeName) ? !element.disabled : "a" === nodeName ? element.href || isTabIndexNotNaN : isTabIndexNotNaN) &&
			// the element and all of its ancestors must be visible
			visible(element);
		}

		function visible(element) {
			return $.expr.filters.visible(element) && !$(element).parents().addBack().filter(function () {
				return $.css(this, "visibility") === "hidden";
			}).length;
		}

		$.extend($.expr[":"], {
			data: $.expr.createPseudo ? $.expr.createPseudo(function (dataName) {
				return function (elem) {
					return !!$.data(elem, dataName);
				};
			}) :
			// support: jQuery <1.8
			function (elem, i, match) {
				return !!$.data(elem, match[3]);
			},

			focusable: function focusable(element) {
				return _focusable(element, !isNaN($.attr(element, "tabindex")));
			},

			tabbable: function tabbable(element) {
				var tabIndex = $.attr(element, "tabindex"),
				    isTabIndexNaN = isNaN(tabIndex);
				return (isTabIndexNaN || tabIndex >= 0) && _focusable(element, !isTabIndexNaN);
			}
		});

		// support: jQuery <1.8
		if (!$("<a>").outerWidth(1).jquery) {
			$.each(["Width", "Height"], function (i, name) {
				var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
				    type = name.toLowerCase(),
				    orig = {
					innerWidth: $.fn.innerWidth,
					innerHeight: $.fn.innerHeight,
					outerWidth: $.fn.outerWidth,
					outerHeight: $.fn.outerHeight
				};

				function reduce(elem, size, border, margin) {
					$.each(side, function () {
						size -= parseFloat($.css(elem, "padding" + this)) || 0;
						if (border) {
							size -= parseFloat($.css(elem, "border" + this + "Width")) || 0;
						}
						if (margin) {
							size -= parseFloat($.css(elem, "margin" + this)) || 0;
						}
					});
					return size;
				}

				$.fn["inner" + name] = function (size) {
					if (size === undefined) {
						return orig["inner" + name].call(this);
					}

					return this.each(function () {
						$(this).css(type, reduce(this, size) + "px");
					});
				};

				$.fn["outer" + name] = function (size, margin) {
					if (typeof size !== "number") {
						return orig["outer" + name].call(this, size);
					}

					return this.each(function () {
						$(this).css(type, reduce(this, size, true, margin) + "px");
					});
				};
			});
		}

		// support: jQuery <1.8
		if (!$.fn.addBack) {
			$.fn.addBack = function (selector) {
				return this.add(selector == null ? this.prevObject : this.prevObject.filter(selector));
			};
		}

		// support: jQuery 1.6.1, 1.6.2 (http://bugs.jquery.com/ticket/9413)
		if ($("<a>").data("a-b", "a").removeData("a-b").data("a-b")) {
			$.fn.removeData = function (removeData) {
				return function (key) {
					if (arguments.length) {
						return removeData.call(this, $.camelCase(key));
					} else {
						return removeData.call(this);
					}
				};
			}($.fn.removeData);
		}

		// deprecated
		$.ui.ie = !!/msie [\w.]+/.exec(navigator.userAgent.toLowerCase());

		$.support.selectstart = "onselectstart" in document.createElement("div");
		$.fn.extend({
			disableSelection: function disableSelection() {
				return this.bind(($.support.selectstart ? "selectstart" : "mousedown") + ".ui-disableSelection", function (event) {
					event.preventDefault();
				});
			},

			enableSelection: function enableSelection() {
				return this.unbind(".ui-disableSelection");
			}
		});

		$.extend($.ui, {
			// $.ui.plugin is deprecated. Use $.widget() extensions instead.
			plugin: {
				add: function add(module, option, set) {
					var i,
					    proto = $.ui[module].prototype;
					for (i in set) {
						proto.plugins[i] = proto.plugins[i] || [];
						proto.plugins[i].push([option, set[i]]);
					}
				},
				call: function call(instance, name, args) {
					var i,
					    set = instance.plugins[name];
					if (!set || !instance.element[0].parentNode || instance.element[0].parentNode.nodeType === 11) {
						return;
					}

					for (i = 0; i < set.length; i++) {
						if (instance.options[set[i][0]]) {
							set[i][1].apply(instance.element, args);
						}
					}
				}
			},

			// only used by resizable
			hasScroll: function hasScroll(el, a) {

				//If overflow is hidden, the element might have extra content, but the user wants to hide it
				if ($(el).css("overflow") === "hidden") {
					return false;
				}

				var scroll = a && a === "left" ? "scrollLeft" : "scrollTop",
				    has = false;

				if (el[scroll] > 0) {
					return true;
				}

				// TODO: determine which cases actually cause this to happen
				// if the element doesn't have the scroll set, see if it's possible to
				// set the scroll
				el[scroll] = 1;
				has = el[scroll] > 0;
				el[scroll] = 0;
				return has;
			}
		});
		})(jQuery);

/***/ },
/* 124 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var jQuery = __webpack_require__(121);
	__webpack_require__(125);

	/*!
	 * jQuery UI Mouse 1.10.4
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/mouse/
	 *
	 * Depends:
	 *	jquery.ui.widget.js
	 */
	(function ($, undefined) {

		var mouseHandled = false;
		$(document).mouseup(function () {
			mouseHandled = false;
		});

		$.widget("ui.mouse", {
			version: "1.10.4",
			options: {
				cancel: "input,textarea,button,select,option",
				distance: 1,
				delay: 0
			},
			_mouseInit: function _mouseInit() {
				var that = this;

				this.element.bind("mousedown." + this.widgetName, function (event) {
					return that._mouseDown(event);
				}).bind("click." + this.widgetName, function (event) {
					if (true === $.data(event.target, that.widgetName + ".preventClickEvent")) {
						$.removeData(event.target, that.widgetName + ".preventClickEvent");
						event.stopImmediatePropagation();
						return false;
					}
				});

				this.started = false;
			},

			// TODO: make sure destroying one instance of mouse doesn't mess with
			// other instances of mouse
			_mouseDestroy: function _mouseDestroy() {
				this.element.unbind("." + this.widgetName);
				if (this._mouseMoveDelegate) {
					$(document).unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate);
				}
			},

			_mouseDown: function _mouseDown(event) {
				// don't let more than one widget handle mouseStart
				if (mouseHandled) {
					return;
				}

				// we may have missed mouseup (out of window)
				this._mouseStarted && this._mouseUp(event);

				this._mouseDownEvent = event;

				var that = this,
				    btnIsLeft = event.which === 1,

				// event.target.nodeName works around a bug in IE 8 with
				// disabled inputs (#7620)
				elIsCancel = typeof this.options.cancel === "string" && event.target.nodeName ? $(event.target).closest(this.options.cancel).length : false;
				if (!btnIsLeft || elIsCancel || !this._mouseCapture(event)) {
					return true;
				}

				this.mouseDelayMet = !this.options.delay;
				if (!this.mouseDelayMet) {
					this._mouseDelayTimer = setTimeout(function () {
						that.mouseDelayMet = true;
					}, this.options.delay);
				}

				if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
					this._mouseStarted = this._mouseStart(event) !== false;
					if (!this._mouseStarted) {
						event.preventDefault();
						return true;
					}
				}

				// Click event may never have fired (Gecko & Opera)
				if (true === $.data(event.target, this.widgetName + ".preventClickEvent")) {
					$.removeData(event.target, this.widgetName + ".preventClickEvent");
				}

				// these delegates are required to keep context
				this._mouseMoveDelegate = function (event) {
					return that._mouseMove(event);
				};
				this._mouseUpDelegate = function (event) {
					return that._mouseUp(event);
				};
				$(document).bind("mousemove." + this.widgetName, this._mouseMoveDelegate).bind("mouseup." + this.widgetName, this._mouseUpDelegate);

				event.preventDefault();

				mouseHandled = true;
				return true;
			},

			_mouseMove: function _mouseMove(event) {
				// IE mouseup check - mouseup happened when mouse was out of window
				if ($.ui.ie && (!document.documentMode || document.documentMode < 9) && !event.button) {
					return this._mouseUp(event);
				}

				if (this._mouseStarted) {
					this._mouseDrag(event);
					return event.preventDefault();
				}

				if (this._mouseDistanceMet(event) && this._mouseDelayMet(event)) {
					this._mouseStarted = this._mouseStart(this._mouseDownEvent, event) !== false;
					this._mouseStarted ? this._mouseDrag(event) : this._mouseUp(event);
				}

				return !this._mouseStarted;
			},

			_mouseUp: function _mouseUp(event) {
				$(document).unbind("mousemove." + this.widgetName, this._mouseMoveDelegate).unbind("mouseup." + this.widgetName, this._mouseUpDelegate);

				if (this._mouseStarted) {
					this._mouseStarted = false;

					if (event.target === this._mouseDownEvent.target) {
						$.data(event.target, this.widgetName + ".preventClickEvent", true);
					}

					this._mouseStop(event);
				}

				return false;
			},

			_mouseDistanceMet: function _mouseDistanceMet(event) {
				return Math.max(Math.abs(this._mouseDownEvent.pageX - event.pageX), Math.abs(this._mouseDownEvent.pageY - event.pageY)) >= this.options.distance;
			},

			_mouseDelayMet: function _mouseDelayMet() /* event */{
				return this.mouseDelayMet;
			},

			// These are placeholder methods, to be overriden by extending plugin
			_mouseStart: function _mouseStart() /* event */{},
			_mouseDrag: function _mouseDrag() /* event */{},
			_mouseStop: function _mouseStop() /* event */{},
			_mouseCapture: function _mouseCapture() /* event */{
				return true;
			}
		});
		})(jQuery);

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var jQuery = __webpack_require__(121);

	/*!
	 * jQuery UI Widget 1.10.4
	 * http://jqueryui.com
	 *
	 * Copyright 2014 jQuery Foundation and other contributors
	 * Released under the MIT license.
	 * http://jquery.org/license
	 *
	 * http://api.jqueryui.com/jQuery.widget/
	 */
	(function ($, undefined) {

		var uuid = 0,
		    slice = Array.prototype.slice,
		    _cleanData = $.cleanData;
		$.cleanData = function (elems) {
			for (var i = 0, elem; (elem = elems[i]) != null; i++) {
				try {
					$(elem).triggerHandler("remove");
					// http://bugs.jquery.com/ticket/8235
				} catch (e) {}
			}
			_cleanData(elems);
		};

		$.widget = function (name, base, prototype) {
			var fullName,
			    existingConstructor,
			    constructor,
			    basePrototype,

			// proxiedPrototype allows the provided prototype to remain unmodified
			// so that it can be used as a mixin for multiple widgets (#8876)
			proxiedPrototype = {},
			    namespace = name.split(".")[0];

			name = name.split(".")[1];
			fullName = namespace + "-" + name;

			if (!prototype) {
				prototype = base;
				base = $.Widget;
			}

			// create selector for plugin
			$.expr[":"][fullName.toLowerCase()] = function (elem) {
				return !!$.data(elem, fullName);
			};

			$[namespace] = $[namespace] || {};
			existingConstructor = $[namespace][name];
			constructor = $[namespace][name] = function (options, element) {
				// allow instantiation without "new" keyword
				if (!this._createWidget) {
					return new constructor(options, element);
				}

				// allow instantiation without initializing for simple inheritance
				// must use "new" keyword (the code above always passes args)
				if (arguments.length) {
					this._createWidget(options, element);
				}
			};
			// extend with the existing constructor to carry over any static properties
			$.extend(constructor, existingConstructor, {
				version: prototype.version,
				// copy the object used to create the prototype in case we need to
				// redefine the widget later
				_proto: $.extend({}, prototype),
				// track widgets that inherit from this widget in case this widget is
				// redefined after a widget inherits from it
				_childConstructors: []
			});

			basePrototype = new base();
			// we need to make the options hash a property directly on the new instance
			// otherwise we'll modify the options hash on the prototype that we're
			// inheriting from
			basePrototype.options = $.widget.extend({}, basePrototype.options);
			$.each(prototype, function (prop, value) {
				if (!$.isFunction(value)) {
					proxiedPrototype[prop] = value;
					return;
				}
				proxiedPrototype[prop] = function () {
					var _super = function _super() {
						return base.prototype[prop].apply(this, arguments);
					},
					    _superApply = function _superApply(args) {
						return base.prototype[prop].apply(this, args);
					};
					return function () {
						var __super = this._super,
						    __superApply = this._superApply,
						    returnValue;

						this._super = _super;
						this._superApply = _superApply;

						returnValue = value.apply(this, arguments);

						this._super = __super;
						this._superApply = __superApply;

						return returnValue;
					};
				}();
			});
			constructor.prototype = $.widget.extend(basePrototype, {
				// TODO: remove support for widgetEventPrefix
				// always use the name + a colon as the prefix, e.g., draggable:start
				// don't prefix for widgets that aren't DOM-based
				widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix || name : name
			}, proxiedPrototype, {
				constructor: constructor,
				namespace: namespace,
				widgetName: name,
				widgetFullName: fullName
			});

			// If this widget is being redefined then we need to find all widgets that
			// are inheriting from it and redefine all of them so that they inherit from
			// the new version of this widget. We're essentially trying to replace one
			// level in the prototype chain.
			if (existingConstructor) {
				$.each(existingConstructor._childConstructors, function (i, child) {
					var childPrototype = child.prototype;

					// redefine the child widget using the same prototype that was
					// originally used, but inherit from the new version of the base
					$.widget(childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto);
				});
				// remove the list of existing child constructors from the old constructor
				// so the old child constructors can be garbage collected
				delete existingConstructor._childConstructors;
			} else {
				base._childConstructors.push(constructor);
			}

			$.widget.bridge(name, constructor);
		};

		$.widget.extend = function (target) {
			var input = slice.call(arguments, 1),
			    inputIndex = 0,
			    inputLength = input.length,
			    key,
			    value;
			for (; inputIndex < inputLength; inputIndex++) {
				for (key in input[inputIndex]) {
					value = input[inputIndex][key];
					if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
						// Clone objects
						if ($.isPlainObject(value)) {
							target[key] = $.isPlainObject(target[key]) ? $.widget.extend({}, target[key], value) :
							// Don't extend strings, arrays, etc. with objects
							$.widget.extend({}, value);
							// Copy everything else by reference
						} else {
								target[key] = value;
							}
					}
				}
			}
			return target;
		};

		$.widget.bridge = function (name, object) {
			var fullName = object.prototype.widgetFullName || name;
			$.fn[name] = function (options) {
				var isMethodCall = typeof options === "string",
				    args = slice.call(arguments, 1),
				    returnValue = this;

				// allow multiple hashes to be passed on init
				options = !isMethodCall && args.length ? $.widget.extend.apply(null, [options].concat(args)) : options;

				if (isMethodCall) {
					this.each(function () {
						var methodValue,
						    instance = $.data(this, fullName);
						if (!instance) {
							return $.error("cannot call methods on " + name + " prior to initialization; " + "attempted to call method '" + options + "'");
						}
						if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
							return $.error("no such method '" + options + "' for " + name + " widget instance");
						}
						methodValue = instance[options].apply(instance, args);
						if (methodValue !== instance && methodValue !== undefined) {
							returnValue = methodValue && methodValue.jquery ? returnValue.pushStack(methodValue.get()) : methodValue;
							return false;
						}
					});
				} else {
					this.each(function () {
						var instance = $.data(this, fullName);
						if (instance) {
							instance.option(options || {})._init();
						} else {
							$.data(this, fullName, new object(options, this));
						}
					});
				}

				return returnValue;
			};
		};

		$.Widget = function () /* options, element */{};
		$.Widget._childConstructors = [];

		$.Widget.prototype = {
			widgetName: "widget",
			widgetEventPrefix: "",
			defaultElement: "<div>",
			options: {
				disabled: false,

				// callbacks
				create: null
			},
			_createWidget: function _createWidget(options, element) {
				element = $(element || this.defaultElement || this)[0];
				this.element = $(element);
				this.uuid = uuid++;
				this.eventNamespace = "." + this.widgetName + this.uuid;
				this.options = $.widget.extend({}, this.options, this._getCreateOptions(), options);

				this.bindings = $();
				this.hoverable = $();
				this.focusable = $();

				if (element !== this) {
					$.data(element, this.widgetFullName, this);
					this._on(true, this.element, {
						remove: function remove(event) {
							if (event.target === element) {
								this.destroy();
							}
						}
					});
					this.document = $(element.style ?
					// element within the document
					element.ownerDocument :
					// element is window or document
					element.document || element);
					this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
				}

				this._create();
				this._trigger("create", null, this._getCreateEventData());
				this._init();
			},
			_getCreateOptions: $.noop,
			_getCreateEventData: $.noop,
			_create: $.noop,
			_init: $.noop,

			destroy: function destroy() {
				this._destroy();
				// we can probably remove the unbind calls in 2.0
				// all event bindings should go through this._on()
				this.element.unbind(this.eventNamespace)
				// 1.9 BC for #7810
				// TODO remove dual storage
				.removeData(this.widgetName).removeData(this.widgetFullName)
				// support: jquery <1.6.3
				// http://bugs.jquery.com/ticket/9413
				.removeData($.camelCase(this.widgetFullName));
				this.widget().unbind(this.eventNamespace).removeAttr("aria-disabled").removeClass(this.widgetFullName + "-disabled " + "ui-state-disabled");

				// clean up events and states
				this.bindings.unbind(this.eventNamespace);
				this.hoverable.removeClass("ui-state-hover");
				this.focusable.removeClass("ui-state-focus");
			},
			_destroy: $.noop,

			widget: function widget() {
				return this.element;
			},

			option: function option(key, value) {
				var options = key,
				    parts,
				    curOption,
				    i;

				if (arguments.length === 0) {
					// don't return a reference to the internal hash
					return $.widget.extend({}, this.options);
				}

				if (typeof key === "string") {
					// handle nested keys, e.g., "foo.bar" => { foo: { bar: ___ } }
					options = {};
					parts = key.split(".");
					key = parts.shift();
					if (parts.length) {
						curOption = options[key] = $.widget.extend({}, this.options[key]);
						for (i = 0; i < parts.length - 1; i++) {
							curOption[parts[i]] = curOption[parts[i]] || {};
							curOption = curOption[parts[i]];
						}
						key = parts.pop();
						if (arguments.length === 1) {
							return curOption[key] === undefined ? null : curOption[key];
						}
						curOption[key] = value;
					} else {
						if (arguments.length === 1) {
							return this.options[key] === undefined ? null : this.options[key];
						}
						options[key] = value;
					}
				}

				this._setOptions(options);

				return this;
			},
			_setOptions: function _setOptions(options) {
				var key;

				for (key in options) {
					this._setOption(key, options[key]);
				}

				return this;
			},
			_setOption: function _setOption(key, value) {
				this.options[key] = value;

				if (key === "disabled") {
					this.widget().toggleClass(this.widgetFullName + "-disabled ui-state-disabled", !!value).attr("aria-disabled", value);
					this.hoverable.removeClass("ui-state-hover");
					this.focusable.removeClass("ui-state-focus");
				}

				return this;
			},

			enable: function enable() {
				return this._setOption("disabled", false);
			},
			disable: function disable() {
				return this._setOption("disabled", true);
			},

			_on: function _on(suppressDisabledCheck, element, handlers) {
				var delegateElement,
				    instance = this;

				// no suppressDisabledCheck flag, shuffle arguments
				if (typeof suppressDisabledCheck !== "boolean") {
					handlers = element;
					element = suppressDisabledCheck;
					suppressDisabledCheck = false;
				}

				// no element argument, shuffle and use this.element
				if (!handlers) {
					handlers = element;
					element = this.element;
					delegateElement = this.widget();
				} else {
					// accept selectors, DOM elements
					element = delegateElement = $(element);
					this.bindings = this.bindings.add(element);
				}

				$.each(handlers, function (event, handler) {
					function handlerProxy() {
						// allow widgets to customize the disabled handling
						// - disabled as an array instead of boolean
						// - disabled class as method for disabling individual parts
						if (!suppressDisabledCheck && (instance.options.disabled === true || $(this).hasClass("ui-state-disabled"))) {
							return;
						}
						return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
					}

					// copy the guid so direct unbinding works
					if (typeof handler !== "string") {
						handlerProxy.guid = handler.guid = handler.guid || handlerProxy.guid || $.guid++;
					}

					var match = event.match(/^(\w+)\s*(.*)$/),
					    eventName = match[1] + instance.eventNamespace,
					    selector = match[2];
					if (selector) {
						delegateElement.delegate(selector, eventName, handlerProxy);
					} else {
						element.bind(eventName, handlerProxy);
					}
				});
			},

			_off: function _off(element, eventName) {
				eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace;
				element.unbind(eventName).undelegate(eventName);
			},

			_delay: function _delay(handler, delay) {
				function handlerProxy() {
					return (typeof handler === "string" ? instance[handler] : handler).apply(instance, arguments);
				}
				var instance = this;
				return setTimeout(handlerProxy, delay || 0);
			},

			_hoverable: function _hoverable(element) {
				this.hoverable = this.hoverable.add(element);
				this._on(element, {
					mouseenter: function mouseenter(event) {
						$(event.currentTarget).addClass("ui-state-hover");
					},
					mouseleave: function mouseleave(event) {
						$(event.currentTarget).removeClass("ui-state-hover");
					}
				});
			},

			_focusable: function _focusable(element) {
				this.focusable = this.focusable.add(element);
				this._on(element, {
					focusin: function focusin(event) {
						$(event.currentTarget).addClass("ui-state-focus");
					},
					focusout: function focusout(event) {
						$(event.currentTarget).removeClass("ui-state-focus");
					}
				});
			},

			_trigger: function _trigger(type, event, data) {
				var prop,
				    orig,
				    callback = this.options[type];

				data = data || {};
				event = $.Event(event);
				event.type = (type === this.widgetEventPrefix ? type : this.widgetEventPrefix + type).toLowerCase();
				// the original event may come from any element
				// so we need to reset the target on the new event
				event.target = this.element[0];

				// copy original event properties over to the new event
				orig = event.originalEvent;
				if (orig) {
					for (prop in orig) {
						if (!(prop in event)) {
							event[prop] = orig[prop];
						}
					}
				}

				this.element.trigger(event, data);
				return !($.isFunction(callback) && callback.apply(this.element[0], [event].concat(data)) === false || event.isDefaultPrevented());
			}
		};

		$.each({ show: "fadeIn", hide: "fadeOut" }, function (method, defaultEffect) {
			$.Widget.prototype["_" + method] = function (element, options, callback) {
				if (typeof options === "string") {
					options = { effect: options };
				}
				var hasOptions,
				    effectName = !options ? method : options === true || typeof options === "number" ? defaultEffect : options.effect || defaultEffect;
				options = options || {};
				if (typeof options === "number") {
					options = { duration: options };
				}
				hasOptions = !$.isEmptyObject(options);
				options.complete = callback;
				if (options.delay) {
					element.delay(options.delay);
				}
				if (hasOptions && $.effects && $.effects.effect[effectName]) {
					element[method](options);
				} else if (effectName !== method && element[effectName]) {
					element[effectName](options.duration, options.easing, callback);
				} else {
					element.queue(function (next) {
						$(this)[method]();
						if (callback) {
							callback.call(element[0]);
						}
						next();
					});
				}
			};
		});
		})(jQuery);

/***/ },
/* 126 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_params = __webpack_require__(10);
	var define_enter_exit_delays = __webpack_require__(127);
	var enter_exit_update = __webpack_require__(128);
	var initialize_resizing = __webpack_require__(80);
	var make_col_cat = __webpack_require__(100);
	var make_row_cat = __webpack_require__(103);
	var make_row_dendro = __webpack_require__(104);
	var make_col_dendro = __webpack_require__(105);
	var ini_sidebar = __webpack_require__(140);
	var enable_sidebar = __webpack_require__(142);
	var ini_doubleclick = __webpack_require__(82);
	var update_reorder_buttons = __webpack_require__(143);

	module.exports = function update_with_new_network(config, old_params, new_network_data) {

	  // make tmp config to make new params
	  var tmp_config = jQuery.extend(true, {}, config);

	  tmp_config.network_data = new_network_data;
	  tmp_config.inst_order = old_params.viz.inst_order;
	  tmp_config.input_domain = old_params.matrix.opacity_scale.domain()[1];

	  update_reorder_buttons(tmp_config, old_params);

	  tmp_config.ini_expand = false;
	  tmp_config.ini_view = null;
	  tmp_config.current_col_cat = old_params.current_col_cat;

	  var params = make_params(tmp_config);
	  var delays = define_enter_exit_delays(old_params, params);

	  enter_exit_update(params, new_network_data, delays);

	  make_row_cat(params);

	  if (params.viz.show_categories.col) {
	    make_col_cat(params);
	  }

	  if (params.viz.show_dendrogram) {
	    make_row_dendro(params);
	    make_col_dendro(params);
	  }

	  initialize_resizing(params);

	  d3.select(params.viz.viz_svg).call(params.zoom_behavior);

	  ini_doubleclick(params);

	  ini_sidebar(params);

	  params.viz.run_trans = true;

	  d3.selectAll(params.root + ' .d3-tip').style('opacity', 0);

	  setTimeout(enable_sidebar, 2500, params);

	  return params;
		};

/***/ },
/* 127 */
/***/ function(module, exports) {

	'use strict';

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

	  // reduce opacity during update
	  d3.select(params.viz.viz_svg).style('opacity', 0.70);

	  function finish_update() {
	    d3.select(params.viz.viz_svg).transition().duration(250).style('opacity', 1.0);
	  }
	  setTimeout(finish_update, delays.enter);

	  return delays;
		};

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resize_after_update = __webpack_require__(129);
	var make_rows = __webpack_require__(54);
	var make_cols = __webpack_require__(69);
	var eeu_existing_row = __webpack_require__(130);
	var exit_components = __webpack_require__(134);
	var enter_grid_lines = __webpack_require__(135);
	var enter_row_groups = __webpack_require__(136);
	var resize_containers = __webpack_require__(139);
	var label_constrain_and_trim = __webpack_require__(79);
	var d3_tip_custom = __webpack_require__(53);

	module.exports = function (params, network_data, delays) {

	  // remove old tooltips
	  d3.selectAll(params.root + ' .d3-tip').style('opacity', 0);

	  // d3-tooltip - for tiles
	  var tip = d3_tip_custom().attr('class', 'd3-tip tile_tip').direction('nw').offset([0, 0]).html(function (d) {
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

	  // TODO check if necessary
	  resize_containers(params);

	  // get row and col names
	  var row_nodes_names = params.network_data.row_nodes_names;

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
	      var tmp_index = _.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
	    });
	  } else {
	    move_rows.attr('transform', function (d) {
	      var tmp_index = _.indexOf(row_nodes_names, d.name);
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
	  resize_after_update(params, row_nodes, col_nodes, links, duration, delays);

	  // enter new elements
	  //////////////////////////
	  enter_row_groups(params, delays, duration, tip);

	  // update existing rows
	  make_rows(params, duration);
	  make_cols(params, duration);

	  enter_grid_lines(params, delays, duration);

	  label_constrain_and_trim(params);
		};

/***/ },
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var calc_clust_height = __webpack_require__(17);
	var get_svg_dim = __webpack_require__(18);
	var calc_clust_width = __webpack_require__(16);
	var reset_zoom = __webpack_require__(83);
	var resize_dendro = __webpack_require__(84);
	var resize_super_labels = __webpack_require__(86);
	var resize_spillover = __webpack_require__(87);
	var resize_row_labels = __webpack_require__(89);
	var resize_row_viz = __webpack_require__(91);
	var resize_col_labels = __webpack_require__(92);
	var resize_col_text = __webpack_require__(93);
	var resize_col_triangle = __webpack_require__(94);
	var resize_col_hlight = __webpack_require__(95);
	var resize_label_bars = __webpack_require__(98);
	var calc_default_fs = __webpack_require__(23);
	var calc_zoom_switching = __webpack_require__(41);
	var show_visible_area = __webpack_require__(36);

	module.exports = function (params, row_nodes, col_nodes, links, duration, delays) {

	  // reset visible area
	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;

	  show_visible_area(params, zoom_info);

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
	  params.viz.border_width = params.viz.x_scale.rangeBand() / 40;

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

	    resize_label_bars(params, svg_group);
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
/* 130 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var exit_existing_row = __webpack_require__(131);
	var enter_existing_row = __webpack_require__(132);
	var update_split_tiles = __webpack_require__(133);
	var mouseover_tile = __webpack_require__(51);
	var mouseout_tile = __webpack_require__(52);

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
	        var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
	        var x_pos = params.viz.x_scale(inst_col_index) + 0.5 * params.viz.border_width;
	        return 'translate(' + x_pos + ',0)';
	      }
	    });
	  } else {
	    update_row_tiles.attr('width', params.viz.rect_width).attr('height', params.viz.rect_height).attr('transform', function (d) {
	      if (_.contains(col_nodes_names, d.col_name)) {
	        var inst_col_index = _.indexOf(col_nodes_names, d.col_name);
	        var x_pos = params.viz.x_scale(inst_col_index) + 0.5 * params.viz.border_width;
	        return 'translate(' + x_pos + ',0)';
	      }
	    });
	  }

	  if (params.matrix.tile_type == 'updn') {
	    update_split_tiles(params, inp_row_data, row_selection, delays, duration, cur_row_tiles, tip);
	  }

	  enter_existing_row(params, delays, duration, cur_row_tiles, tip);
		};

/***/ },
/* 131 */
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
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mouseover_tile = __webpack_require__(51);
	var mouseout_tile = __webpack_require__(52);

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
	    var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	    var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	    return 'translate(' + x_pos + ',' + y_pos + ')';
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
/* 133 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var draw_up_tile = __webpack_require__(49);
	var draw_dn_tile = __webpack_require__(50);
	var mouseover_tile = __webpack_require__(51);
	var mouseout_tile = __webpack_require__(52);

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
	      var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	      var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	      return 'translate(' + x_pos + ',' + y_pos + ')';
	    });
	  } else {
	    update_tiles_up.attr('d', function () {
	      return draw_up_tile(params);
	    }).attr('transform', function (d) {
	      var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	      var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	      return 'translate(' + x_pos + ',' + y_pos + ')';
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
	      var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	      var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	      return 'translate(' + x_pos + ',' + y_pos + ')';
	    });
	  } else {
	    update_tiles_dn.attr('d', function () {
	      return draw_dn_tile(params);
	    }).attr('transform', function (d) {
	      var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	      var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	      return 'translate(' + x_pos + ',' + y_pos + ')';
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
/* 134 */
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
/* 135 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function enter_grid_lines(params, delays, duration) {

	  var row_nodes = params.network_data.row_nodes;
	  var row_nodes_names = params.network_data.row_nodes_names;

	  var col_nodes = params.network_data.col_nodes;
	  var col_nodes_names = params.network_data.col_nodes_names;

	  // Fade in new gridlines
	  ///////////////////////////

	  // append horizontal lines
	  d3.select(params.root + ' .clust_group').selectAll('.horz_lines').data(row_nodes, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'horz_lines').attr('transform', function (d) {
	    var inst_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ') rotate(0)';
	  }).append('line').attr('x1', 0).attr('x2', params.viz.clust.dim.width).style('stroke-width', function () {
	    var inst_width;
	    if (params.viz.zoom_switch > 1) {
	      inst_width = params.viz.border_width / params.viz.zoom_switch;
	    } else {
	      inst_width = params.viz.border_width;
	    }
	    return inst_width + 'px';
	  }).attr('opacity', 0).attr('stroke', 'white').transition().delay(delays.enter).duration(2 * duration).attr('opacity', 1);

	  // append vertical line groups
	  d3.select(params.root + ' .clust_group').selectAll('.vert_lines').data(col_nodes).enter().append('g').attr('class', 'vert_lines').attr('transform', function (d) {
	    var inst_index = _.indexOf(col_nodes_names, d.name);
	    return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	  }).append('line').attr('x1', 0).attr('x2', -params.viz.clust.dim.height).style('stroke-width', function () {
	    var inst_width;
	    if (params.viz.zoom_switch_y > 1) {
	      inst_width = params.viz.border_width / params.viz.zoom_switch_y;
	    } else {
	      inst_width = params.viz.border_width;
	    }
	    return inst_width + 'px';
	  }).style('stroke', 'white').attr('opacity', 0).transition().delay(delays.enter).duration(2 * duration).attr('opacity', 1);
		};

/***/ },
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var enter_new_rows = __webpack_require__(137);

	module.exports = function enter_row_groups(params, delays, duration, tip) {

	  var row_nodes_names = params.network_data.row_nodes_names;

	  // enter new rows
	  var new_row_groups = d3.select(params.root + ' .clust_group').selectAll('.row').data(params.matrix.matrix, function (d) {
	    return d.name;
	  }).enter().append('g').attr('class', 'row').attr('transform', function (d) {
	    var tmp_index = _.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(tmp_index) + ')';
	  });

	  new_row_groups.each(function (d) {
	    enter_new_rows(params, d, delays, duration, tip, this);
	  });
		};

/***/ },
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var enter_split_tiles = __webpack_require__(138);
	var mouseover_tile = __webpack_require__(51);
	var mouseout_tile = __webpack_require__(52);

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
	    var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	    var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	    return 'translate(' + x_pos + ',' + y_pos + ')';
	  });

	  if (params.matrix.tile_type == 'updn') {
	    enter_split_tiles(params, inp_row_data, row_selection, tip, delays, duration, tile);
	  }
		};

/***/ },
/* 138 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var draw_up_tile = __webpack_require__(49);
	var draw_dn_tile = __webpack_require__(50);

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
	    var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	    var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	    return 'translate(' + x_pos + ',' + y_pos + ')';
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
	    var x_pos = params.viz.x_scale(d.pos_x) + 0.5 * params.viz.border_width;
	    var y_pos = 0.5 * params.viz.border_width / params.viz.zoom_switch;
	    return 'translate(' + x_pos + ',' + y_pos + ')';
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
/* 139 */
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
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(120);
	var change_groups = __webpack_require__(141);
	var search = __webpack_require__(77);
	var all_reorder = __webpack_require__(76);
	var ini_cat_reorder = __webpack_require__(75);

	module.exports = function ini_sidebar(params) {

	  // initializes sidebar buttons and sliders
	  // this function is also used by update_network

	  var search_obj = search(params, params.network_data.row_nodes, 'name');

	  $(params.root + ' .gene_search_box').autocomplete({
	    source: search_obj.get_entities
	  });

	  // submit genes button
	  $(params.root + ' .gene_search_box').keyup(function (e) {
	    if (e.keyCode === 13) {
	      var search_gene = $(params.root + ' .gene_search_box').val();
	      search_obj.find_entity(search_gene);
	    }
	  });

	  $(params.root + ' .submit_gene_button').off().click(function () {
	    var gene = $(params.root + ' .gene_search_box').val();
	    search_obj.find_entity(gene);
	  });

	  var reorder_types;
	  if (params.sim_mat) {
	    reorder_types = ['both'];
	  } else {
	    reorder_types = ['row', 'col'];
	  }

	  _.each(reorder_types, function (inst_rc) {

	    // dendrogram
	    $(params.root + ' .slider_' + inst_rc).slider({
	      value: 0.5,
	      min: 0,
	      max: 1,
	      step: 0.1,
	      slide: function slide(event, ui) {
	        $("#amount").val("$" + ui.value);
	        var inst_index = ui.value * 10;
	        if (inst_rc != 'both') {
	          change_groups(params, inst_rc, inst_index);
	        } else {
	          change_groups(params, 'row', inst_index);
	          change_groups(params, 'col', inst_index);
	        }
	      }
	    });

	    // reorder buttons
	    $(params.root + ' .toggle_' + inst_rc + '_order .btn').off().click(function (evt) {

	      var order_id = $(evt.target).attr('name').replace('_row', '').replace('_col', '');

	      d3.selectAll(params.root + ' .toggle_' + inst_rc + '_order .btn').classed('active', false);

	      d3.select(this).classed('active', true);

	      if (inst_rc != 'both') {
	        all_reorder(params, order_id, inst_rc);
	      } else {
	        all_reorder(params, order_id, 'row');
	        all_reorder(params, order_id, 'col');
	      }
	    });
	  });

	  ini_cat_reorder(params);

	  $(params.root + ' .opacity_slider').slider({
	    // value:0.5,
	    min: 0.1,
	    max: 2.0,
	    step: 0.1,
	    slide: function slide(event, ui) {

	      $("#amount").val("$" + ui.value);
	      var inst_index = 2 - ui.value;

	      var scaled_max = params.matrix.abs_max_val * inst_index;

	      params.matrix.opacity_scale.domain([0, scaled_max]);

	      d3.selectAll(params.root + ' .tile').style('fill-opacity', function (d) {
	        // calculate output opacity using the opacity scale
	        var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
	        return output_opacity;
	      });
	    }
	  });
		};

/***/ },
/* 141 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// var build_color_groups = require('./build_color_groups');
	var make_row_dendro_triangles = __webpack_require__(59);
	var make_col_dendro_triangles = __webpack_require__(65);

	/* Changes the groupings (x- and y-axis color bars).
	 */
	module.exports = function (params, inst_rc, inst_index) {

	  if (inst_rc === 'row') {
	    params.group_level.row = inst_index;
	  } else if (inst_rc === 'col') {
	    params.group_level.col = inst_index;
	  }

	  var is_change_group = true;
	  make_row_dendro_triangles(params, is_change_group);
	  make_col_dendro_triangles(params, is_change_group);
		};

/***/ },
/* 142 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(120);
	module.exports = function enable_sidebar(params) {
	  $(params.root + ' .slider').slider('enable');
	  d3.selectAll(params.root + ' .btn').attr('disabled', null);

	  params.viz.run_trans = false;

	  // d3.selectAll(params.root+' .category_section')
	  //   .on('click', category_key_click)
	  //   .select('text')
	  //   .style('opacity',1);
		};

/***/ },
/* 143 */
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
/* 144 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var sim_click = __webpack_require__(112);

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
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var highlight_sidebar_element = __webpack_require__(115);
	var change_groups = __webpack_require__(141);

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
	    change_groups(params, inst_rc, inst_value);
	  }

	  return {
	    run: run,
	    get_duration: get_duration
	  };
		};

/***/ },
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var sim_click = __webpack_require__(112);

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
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var toggle_play_button = __webpack_require__(148);

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
/* 148 */
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
/* 149 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(109);
	var sim_click = __webpack_require__(112);

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
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_play_button = __webpack_require__(151);
	var make_demo_text_containers = __webpack_require__(152);

	module.exports = function ini_demo() {

	  var cgm = this;
	  var params = cgm.params;

	  make_play_button(cgm);

	  var demo_text_size = 30;
	  make_demo_text_containers(params, demo_text_size);
		};

/***/ },
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var position_play_button = __webpack_require__(99);

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
/* 152 */
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
/* 153 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(120);
	var ini_sidebar = __webpack_require__(140);
	var set_up_filters = __webpack_require__(154);
	var set_up_dendro_sliders = __webpack_require__(161);
	var set_up_search = __webpack_require__(162);
	var set_up_reorder = __webpack_require__(163);
	var set_sidebar_ini_view = __webpack_require__(164);
	var make_icons = __webpack_require__(165);
	var make_modals = __webpack_require__(168);
	var set_up_opacity_slider = __webpack_require__(170);

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

	  sidebar.append('div').classed('about_section', true);

	  if (params.sidebar.about != null) {

	    var about_section_width = params.sidebar.text.width - 5;
	    sidebar.select('.about_section').append('h5').classed('sidebar_text', true).style('margin-left', '7px').style('margin-top', '5px').style('margin-bottom', '2px').style('width', about_section_width + 'px').style('text-align', 'justify').text(params.sidebar.about);
	  }

	  sidebar.append('div').classed('icons_section', true).style('text-align', 'center');

	  if (params.sidebar.icons) {
	    make_modals(params);
	    make_icons(params, sidebar);
	  }

	  // // tmp sim mat button
	  // sidebar
	  //   .append('text')
	  //   .text('here')
	  //   .on('click',function(){
	  //     console.log('change to sim_mat')
	  //   })

	  set_up_reorder(params, sidebar);

	  set_up_search(sidebar, params);

	  set_up_opacity_slider(sidebar, params);

	  if (params.viz.show_dendrogram) {
	    set_up_dendro_sliders(sidebar, params);
	  }

	  var possible_filter_names = _.keys(params.viz.possible_filters);

	  if (possible_filter_names.indexOf('enr_score_type') > -1) {
	    possible_filter_names.sort(function (a, b) {
	      return a.toLowerCase().localeCompare(b.toLowerCase());
	    });
	  }

	  _.each(possible_filter_names, function (inst_filter) {
	    set_up_filters(cgm, inst_filter);
	  });

	  ini_sidebar(params);

	  // disable for now
	  // make_cat_keys(params);

	  // when initializing the visualization using a view
	  if (params.ini_view !== null) {

	    set_sidebar_ini_view(params);

	    params.ini_view = null;
	  }

	  return params;
		};

/***/ },
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_slider_filter = __webpack_require__(155);
	var make_button_filter = __webpack_require__(160);

	module.exports = function set_up_filters(cgm, filter_type) {

	  var params = cgm.params;

	  var div_filters = d3.select(params.root + ' .sidebar_wrapper').append('div').classed('div_filters', true).style('padding-left', '15px').style('padding-right', '15px');

	  if (params.viz.possible_filters[filter_type] == 'numerical') {
	    make_slider_filter(cgm, filter_type, div_filters);
	  } else if (params.viz.possible_filters[filter_type] == 'categorical') {
	    make_button_filter(cgm, filter_type, div_filters);
	  }
		};

/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(156);
	var apply_filter_slider = __webpack_require__(157);
	var get_filter_default_state = __webpack_require__(6);
	var get_subset_views = __webpack_require__(13);

	module.exports = function make_slider_filter(cgm, filter_type, div_filters) {

	  var params = cgm.params;

	  var requested_view = {};

	  var possible_filters = _.keys(params.viz.possible_filters);

	  _.each(possible_filters, function (tmp_filter) {
	    if (tmp_filter != filter_type) {
	      var default_state = get_filter_default_state(params.viz.filter_data, tmp_filter);
	      requested_view[tmp_filter] = default_state;
	    }
	  });

	  var filter_title = make_filter_title(params, filter_type);

	  div_filters.append('div').classed('title_' + filter_type, true).classed('sidebar_text', true).classed('slider_description', true).style('margin-top', '5px').style('margin-bottom', '3px').text(filter_title.text + filter_title.state + filter_title.suffix);

	  div_filters.append('div').classed('slider_' + filter_type, true).classed('slider', true).attr('current_state', filter_title.state);

	  var views = params.network_data.views;

	  var available_views = get_subset_views(params, views, requested_view);

	  // sort available views by filter_type value
	  available_views = available_views.sort(function (a, b) {
	    return b[filter_type] - a[filter_type];
	  });

	  var inst_max = available_views.length - 1;

	  $(params.root + ' .slider_' + filter_type).slider({
	    value: 0,
	    min: 0,
	    max: inst_max,
	    step: 1,
	    stop: function stop() {
	      params = apply_filter_slider(cgm, filter_type, available_views);
	    }
	  });
		};

/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_filter_default_state = __webpack_require__(6);

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
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var update_network = __webpack_require__(118);
	var reset_other_filter_sliders = __webpack_require__(158);
	var get_current_orders = __webpack_require__(159);
	var make_requested_view = __webpack_require__(43);

	module.exports = function apply_filter_slider(cgm, filter_type, available_views) {

	  var params = cgm.params;

	  // get value
	  var inst_index = $(params.root + ' .slider_' + filter_type).slider("value");
	  var inst_state = available_views[inst_index][filter_type];

	  reset_other_filter_sliders(params, filter_type, inst_state);

	  params = get_current_orders(params);

	  var requested_view = {};
	  requested_view[filter_type] = inst_state;

	  requested_view = make_requested_view(params, requested_view);

	  if (_.has(available_views[0], 'enr_score_type')) {
	    var enr_state = d3.select(params.root + ' .toggle_enr_score_type').attr('current_state');

	    requested_view.enr_score_type = enr_state;
	  }

	  params = update_network(cgm, requested_view);

	  return params;
		};

/***/ },
/* 158 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(156);

	module.exports = function reset_other_filter_sliders(params, filter_type, inst_state) {

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
	        $(params.root + ' .slider_' + reset_filter).slider("value", 0);

	        d3.select(params.root + ' .title_' + reset_filter).text(tmp_title.text + tmp_title.state);

	        d3.select(params.root + ' .slider_' + reset_filter).attr('current_state', tmp_title.state);
	      }
	    }
	  });

	  var filter_title = make_filter_title(params, filter_type);

	  d3.select(params.root + ' .title_' + filter_type).text(filter_title.text + inst_state + filter_title.suffix);
		};

/***/ },
/* 159 */
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
/* 160 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var update_network = __webpack_require__(118);
	var make_requested_view = __webpack_require__(43);

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

	    requested_view = make_requested_view(params, requested_view);

	    // console.log('\n---------\n requested_view from button filter')
	    // console.log(requested_view)

	    update_network(config, params, requested_view);

	    d3.select(params.root + ' .toggle_enr_score_type').attr('current_state', inst_state);
	  });
		};

/***/ },
/* 161 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function set_up_dendro_sliders(sidebar, params) {

	  var dendro_sliders = sidebar.append('div').classed('dendro_sliders', true).style('padding-left', '15px').style('padding-right', '15px');

	  var dendro_types;
	  if (params.sim_mat) {
	    dendro_types = ['both'];
	  } else {
	    dendro_types = ['row', 'col'];
	  }

	  var dendro_text = {};
	  dendro_text.row = 'Row Group Size';
	  dendro_text.col = 'Column Group Size';
	  dendro_text.both = 'Group Size';

	  _.each(dendro_types, function (inst_rc) {

	    dendro_sliders.append('div').classed('sidebar_text', true).classed('slider_description', true).style('margin-top', '5px').style('margin-bottom', '3px').text(dendro_text[inst_rc]);

	    dendro_sliders.append('div').classed('slider_' + inst_rc, true).classed('slider', true);
	  });
		};

/***/ },
/* 162 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function set_up_search(sidebar, params) {

	  var search_container = sidebar.append('div')
	  // .classed('row',true)
	  .classed('gene_search_container', true).style('padding-left', '15px').style('padding-right', '15px').style('margin-top', '10px');

	  search_container.append('input').classed('form-control', true).classed('gene_search_box', true).classed('sidebar_text', true).attr('type', 'text').attr('placeholder', params.sidebar.row_search.placeholder).style('height', params.sidebar.row_search.box.height + 'px');

	  search_container.append('div').classed('gene_search_button', true).style('margin-top', '5px').attr('data-toggle', 'buttons').append('button').classed('sidebar_text', true).html('Search').attr('type', 'button').classed('btn', true).classed('btn-primary', true).classed('submit_gene_button', true).style('width', '100%').style('font-size', '14px');
		};

/***/ },
/* 163 */
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

	  var reorder_section = sidebar.append('div').style('padding-left', '15px').style('padding-right', '15px').classed('reorder_section', true);

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

	    // // removing categories from reorder buttons
	    // /////////////////////////////////////////////
	    // var cat_rc;
	    // if (inst_rc != 'both'){
	    //   cat_rc = inst_rc;
	    // } else {
	    //   cat_rc = 'row';
	    // }
	    // if ( params.viz.all_cats[cat_rc].length > 0 ){
	    //   all_cats = params.viz.all_cats[cat_rc];
	    //   _.each(all_cats, function(inst_cat){
	    //     var cat_title = get_cat_title(params.viz, inst_cat, cat_rc);
	    //     inst_order_label = inst_cat.replace('-','_')+'_index';
	    //     button_dict[inst_order_label] = cat_title;
	    //   });
	    // }

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

	    reorder_section.append('div').classed('sidebar_text', true).style('clear', 'both').style('margin-top', '10px').style('font-size', '13px').html(rc_dict[inst_rc] + reorder_text);

	    inst_reorder = reorder_section.append('div').classed('btn-group-vertical', true).style('width', '100%').classed('toggle_' + inst_rc + '_order', true).attr('role', 'group');

	    inst_reorder.selectAll('.button').data(possible_orders).enter().append('button').attr('type', 'button').style('font-size', '13px').classed('btn', true).classed('btn-primary', true).classed('sidebar_text', true).classed('active', function (d) {
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
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(156);

	module.exports = function set_sidebar_ini_view(params) {

	  _.each(_.keys(params.ini_view), function (inst_filter) {

	    // initialize filter slider using ini_view
	    var inst_value = params.ini_view[inst_filter];

	    var filter_type = params.viz.possible_filters[inst_filter];

	    if (filter_type === 'numerical') {

	      var possible_values = params.viz.filter_data[inst_filter];

	      if (inst_value != 'all') {
	        inst_value = parseInt(inst_value, 10);
	      }

	      if (params.viz.filter_data[inst_filter].indexOf(inst_value) <= -1) {
	        inst_value = 'all';
	      }

	      var tmp_index = possible_values.indexOf(inst_value);

	      $(params.root + ' .slider_' + inst_filter).slider("value", tmp_index);

	      var filter_title = make_filter_title(params, inst_filter);

	      d3.select(params.root + ' .title_' + inst_filter).text(filter_title.text + inst_value + filter_title.suffix);

	      d3.select(params.root + ' .slider_' + inst_filter).attr('current_state', inst_value);
	    } else {

	      // set up button initialization

	    }
	  });
		};

/***/ },
/* 165 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var save_svg_png = __webpack_require__(166);
	var file_saver = __webpack_require__(167);

	module.exports = function make_icons(params, sidebar) {

	  // <a href="help" target="_blank"  id="help_link">
	  //   <i class="fa fa-question-circle icon_buttons"></i>
	  // </a>

	  var saveSvgAsPng = save_svg_png();
	  var saveAs = file_saver();

	  var row = sidebar.select('.icons_section').style('margin-top', '7px');

	  row.append('div').classed('col-xs-4', true).append('a').attr('href', 'http://amp.pharm.mssm.edu/clustergrammer/help').attr('target', '_blank').append('i').classed('fa', true).classed('fa-question-circle', true).classed('icon_buttons', true).style('font-size', '25px');

	  row.append('div').classed('col-xs-4', true).append('i').classed('fa', true).classed('fa-share-alt', true).classed('icon_buttons', true).style('font-size', '25px').on('click', function () {

	    $(params.root + ' .share_info').modal('toggle');
	    $('.share_url').val(window.location.href);
	  });

	  row.append('div').classed('col-xs-4', true).append('i').classed('fa', true).classed('fa-camera', true).classed('icon_buttons', true).style('font-size', '25px').on('click', function () {

	    $(params.root + ' .picture_info').modal('toggle');
	  });

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
	    saveSvgAsPng(document.getElementById(svg_id), "clustergrammer.png");
	    d3.select(params.root + ' .expand_button').style('opacity', 0.4);
	  });
		};

/***/ },
/* 166 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function save_svg_png() {
	  /* eslint-disable */
	  // (function() {
	  var out$ = typeof exports != 'undefined' && exports || this;

	  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

	  function isExternal(url) {
	    return url && url.lastIndexOf('http', 0) == 0 && url.lastIndexOf(window.location.host) == -1;
	  }

	  function inlineImages(el, callback) {
	    var images = el.querySelectorAll('image');
	    var left = images.length;
	    if (left == 0) {
	      callback();
	    }
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
	        href = href || image.getAttribute('href');
	        img.src = href;
	        img.onload = function () {
	          canvas.width = img.width;
	          canvas.height = img.height;
	          ctx.drawImage(img, 0, 0);
	          image.setAttributeNS("http://www.w3.org/1999/xlink", "href", canvas.toDataURL('image/png'));
	          left--;
	          if (left == 0) {
	            callback();
	          }
	        };
	        img.onerror = function () {
	          console.log("Could not load " + href);
	          left--;
	          if (left == 0) {
	            callback();
	          }
	        };
	      })(images[i]);
	    }
	  }

	  function styles(el, selectorRemap) {
	    var css = "";
	    var sheets = document.styleSheets;
	    for (var i = 0; i < sheets.length; i++) {
	      try {
	        var rules = sheets[i].cssRules;
	      } catch (e) {
	        console.warn("Stylesheet could not be loaded: " + sheets[i].href);
	        continue;
	      }

	      if (rules != null) {
	        for (var j = 0; j < rules.length; j++) {
	          var rule = rules[j];
	          if (typeof rule.style != "undefined") {
	            var match = null;
	            try {
	              match = el.querySelector(rule.selectorText);
	            } catch (err) {
	              console.warn('Invalid CSS selector "' + rule.selectorText + '"', err);
	            }
	            if (match) {
	              var selector = selectorRemap ? selectorRemap(rule.selectorText) : rule.selectorText;
	              css += selector + " { " + rule.style.cssText + " }\n";
	            } else if (rule.cssText.match(/^@font-face/)) {
	              css += rule.cssText + '\n';
	            }
	          }
	        }
	      }
	    }
	    return css;
	  }

	  function getDimension(el, clone, dim) {
	    var v = el.viewBox.baseVal && el.viewBox.baseVal[dim] || clone.getAttribute(dim) !== null && !clone.getAttribute(dim).match(/%$/) && parseInt(clone.getAttribute(dim)) || el.getBoundingClientRect()[dim] || parseInt(clone.style[dim]) || parseInt(window.getComputedStyle(el).getPropertyValue(dim));
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

	  out$.svgAsDataUri = function (el, options, cb) {
	    options = options || {};
	    options.scale = options.scale || 1;
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
	      clone.setAttributeNS(xmlns, "xmlns", "http://www.w3.org/2000/svg");
	      clone.setAttributeNS(xmlns, "xmlns:xlink", "http://www.w3.org/1999/xlink");
	      clone.setAttribute("width", width * options.scale);
	      clone.setAttribute("height", height * options.scale);
	      clone.setAttribute("viewBox", [options.left || 0, options.top || 0, width, height].join(" "));

	      outer.appendChild(clone);

	      var css = styles(el, options.selectorRemap);
	      var s = document.createElement('style');
	      s.setAttribute('type', 'text/css');
	      s.innerHTML = "<![CDATA[\n" + css + "\n]]>";
	      var defs = document.createElement('defs');
	      defs.appendChild(s);
	      clone.insertBefore(defs, clone.firstChild);

	      var svg = doctype + outer.innerHTML;
	      var uri = 'data:image/svg+xml;base64,' + window.btoa(reEncode(svg));
	      if (cb) {
	        cb(uri);
	      }
	    });
	  };

	  out$.svgAsPngUri = function (el, options, cb) {
	    out$.svgAsDataUri(el, options, function (uri) {
	      var image = new Image();
	      image.onload = function () {
	        var canvas = document.createElement('canvas');
	        canvas.width = image.width;
	        canvas.height = image.height;
	        var context = canvas.getContext('2d');
	        if (options && options.backgroundColor) {
	          context.fillStyle = options.backgroundColor;
	          context.fillRect(0, 0, canvas.width, canvas.height);
	        }
	        context.drawImage(image, 0, 0);
	        var a = document.createElement('a'),
	            png;
	        try {
	          png = canvas.toDataURL('image/png');
	        } catch (e) {
	          if (e instanceof SecurityError) {
	            console.error("Rendered SVG images cannot be downloaded in this browser.");
	            return;
	          } else {
	            throw e;
	          }
	        }
	        cb(png);
	      };
	      image.src = uri;
	    });
	  };

	  out$.saveSvgAsPng = function (el, name, options) {
	    options = options || {};
	    out$.svgAsPngUri(el, options, function (uri) {
	      var a = document.createElement('a');
	      a.download = name;
	      a.href = uri;
	      document.body.appendChild(a);
	      a.addEventListener("click", function (e) {
	        a.parentNode.removeChild(a);
	      });
	      a.click();
	    });
	  };
	  // })();

	  return out$.saveSvgAsPng;
		};

/***/ },
/* 167 */
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
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_modal_skeleton = __webpack_require__(169);

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

	  dendro_modal.header.append('h4').classed('modal-title', true);
	  // .html('Group data points');

	  dendro_modal.body.append('div').classed('dendro_text', true).append('input').classed('bootstrap_highlight', true).classed('current_names', true).style('width', '100%');
		};

/***/ },
/* 169 */
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
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(120);
	module.exports = function set_up_opacity_slider(sidebar, params) {

	  var slider_container = sidebar.append('div').classed('opacity_slider_container', true).style('margin-top', '5px').style('padding-left', '15px').style('padding-right', '15px');

	  slider_container.append('div').classed('sidebar_text', true).classed('opacity_slider_text', true).style('margin-bottom', '3px').text('Opacity Slider');

	  slider_container.append('div').classed('opacity_slider', true);

	  $(params.root + ' .opacity_slider').slider({
	    value: 1.0
	  });
		};

/***/ }
/******/ ]);
//# sourceMappingURL=clustergrammer.js.map