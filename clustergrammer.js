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
	var make_viz = __webpack_require__(48);
	var resize_viz = __webpack_require__(86);
	var play_demo = __webpack_require__(111);
	var ini_demo = __webpack_require__(151);
	var update_viz_with_view = __webpack_require__(123);
	var filter_viz_using_nodes = __webpack_require__(154);
	var filter_viz_using_names = __webpack_require__(155);
	var update_cats = __webpack_require__(156);
	var reset_cats = __webpack_require__(157);

	// var d3 = require('d3');
	// var math = require('mathjs');

	// moved d3.slider to src
	d3.slider = __webpack_require__(159);

	var awesomplete = __webpack_require__(161);

	// getting css from src
	__webpack_require__(163);
	__webpack_require__(167);
	__webpack_require__(169);
	__webpack_require__(171);

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

	  var cgm = {};

	  // make visualization parameters using configuration object
	  cgm.params = make_params(config);
	  cgm.config = config;

	  if (cgm.params.use_sidebar) {
	    var make_sidebar = __webpack_require__(173);
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

	  function external_update_view(requested_view) {
	    update_viz_with_view(this, requested_view);
	  }

	  function run_update_cats(cat_data) {
	    update_cats(this, cat_data);
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
	    max_allow_fs: 20,
	    dendro_filter: { 'row': false, 'col': false },
	    row_tip_callback: null,
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
	  }

	  params = calc_viz_params(params);

	  if (params.use_sidebar) {
	    params.sidebar = ini_sidebar_params(params);
	  }

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
	var set_viz_wrapper_size = __webpack_require__(22);
	var get_svg_dim = __webpack_require__(24);
	var calc_label_params = __webpack_require__(25);
	var calc_clust_width = __webpack_require__(26);
	var calc_clust_height = __webpack_require__(27);
	var calc_val_max = __webpack_require__(28);
	var calc_matrix_params = __webpack_require__(29);
	var set_zoom_params = __webpack_require__(32);
	var calc_default_fs = __webpack_require__(47);

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

	module.exports = function set_label_params(params) {

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

	  viz.viz_svg = viz.viz_wrapper + ' .viz_svg';

	  viz.zoom_element = viz.viz_wrapper + ' .viz_svg';

	  viz.uni_duration = 1000;
	  viz.bottom_space = 5;
	  viz.run_trans = false;
	  viz.duration = 1000;
	  if (viz.show_dendrogram) {
	    params.group_level = {};
	  }

	  viz.resize = params.resize;
	  if (utils.has(params, 'size')) {
	    viz.fixed_size = params.size;
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

	  if (_.has(params, 'group_level')) {
	    params.group_level.row = 5;
	    params.group_level.col = 5;
	  }

	  viz.dendro_opacity = 0.35;

	  viz.spillover_col_slant = viz.norm_labels.width.col;

	  var filters = get_available_filters(params.network_data.views);

	  viz.possible_filters = filters.possible_filters;
	  viz.filter_data = filters.filter_data;

	  return viz;
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var process_category_info = __webpack_require__(19);
	var calc_cat_params = __webpack_require__(21);

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

	module.exports = function process_category_info(params, viz) {
	  var preserve_cats = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];


	  var super_string = ': ';
	  var tmp_super;

	  viz.show_categories = {};
	  viz.all_cats = {};
	  viz.cat_names = {};

	  var predefine_colors = false;
	  if (viz.cat_colors === null) {
	    viz.cat_colors = {};
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

	    if (viz.show_categories[inst_rc]) {

	      if (predefine_colors === false) {
	        viz.cat_colors[inst_rc] = {};
	      }

	      viz.cat_names[inst_rc] = {};

	      _.each(viz.all_cats[inst_rc], function (inst_cat) {

	        _.each(params.network_data[inst_rc + '_nodes'], function (inst_node) {

	          if (inst_node[inst_cat].indexOf(super_string) > 0) {
	            tmp_super = inst_node[inst_cat].split(super_string)[0];
	            viz.cat_names[inst_rc][inst_cat] = tmp_super;
	          } else {
	            viz.cat_names[inst_rc][inst_cat] = inst_cat;
	          }
	        });

	        var names_of_cat = _.uniq(utils.pluck(params.network_data[inst_rc + '_nodes'], inst_cat)).sort();

	        if (predefine_colors === false) {

	          viz.cat_colors[inst_rc][inst_cat] = {};

	          _.each(names_of_cat, function (cat_tmp, i) {

	            var inst_color = colors.get_random_color(i + num_colors);

	            viz.cat_colors[inst_rc][inst_cat][cat_tmp] = inst_color;

	            // hack to get 'Not' categories to not be dark colored
	            // also doing this for false
	            if (cat_tmp.indexOf('Not ') >= 0 || cat_tmp.indexOf(': false') > 0) {
	              viz.cat_colors[inst_rc][inst_cat][cat_tmp] = '#eee';
	            }

	            num_colors = num_colors + 1;
	          });
	        }
	      });
	    }

	    if (params.sim_mat) {
	      viz.cat_colors.row = viz.cat_colors.col;
	    }
	  });

	  viz.cat_colors = viz.cat_colors;

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

	module.exports = function calc_cat_params(params, viz) {

	  var separtion_room;

	  // increase the width of the label container based on the label length
	  var label_scale = d3.scale.linear().domain([5, 15]).range([85, 120]).clamp('true');

	  viz.cat_room = {};
	  viz.cat_room.symbol_width = 12;
	  viz.cat_room.separation = 3;

	  viz.cat_colors.opacity = 0.6;
	  viz.cat_colors.active_opacity = 0.9;

	  _.each(['row', 'col'], function (inst_rc) {

	    viz.norm_labels.width[inst_rc] = label_scale(params.labels[inst_rc + '_max_char']) * params[inst_rc + '_label_scale'];

	    viz['num_' + inst_rc + '_nodes'] = params.network_data[inst_rc + '_nodes'].length;

	    // if (_.has(config, 'group_level')){
	    //   config.group_level[inst_rc] = 5;
	    // }

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

	  return viz;
		};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_viz_dimensions = __webpack_require__(23);

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
/* 23 */
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
/* 24 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function get_svg_dim(params) {

	  params.viz.svg_dim = {};
	  params.viz.svg_dim.width = Number(d3.select(params.viz.viz_wrapper).style('width').replace('px', ''));

	  params.viz.svg_dim.height = Number(d3.select(params.viz.viz_wrapper).style('height').replace('px', ''));

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
/* 27 */
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
/* 28 */
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
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ini_matrix_params = __webpack_require__(30);

	module.exports = function calc_matrix_params(params) {

	  params.matrix = ini_matrix_params(params);

	  params.viz.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);

	  params.viz.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

	  _.each(['row', 'col'], function (inst_rc) {

	    var inst_order = params.viz.inst_order[inst_rc];

	    if (inst_order === 'custom') {
	      inst_order = 'clust';
	    }

	    if (inst_rc === 'row') {
	      params.viz.x_scale.domain(params.matrix.orders[inst_order + '_' + inst_rc]);
	    } else {
	      params.viz.y_scale.domain(params.matrix.orders[inst_order + '_' + inst_rc]);
	    }
	  });

	  params.viz.border_width = params.viz.x_scale.rangeBand() / params.viz.border_fraction;

	  return params;
		};

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var initialize_matrix = __webpack_require__(31);

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
/* 31 */
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
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var zoomed = __webpack_require__(33);
	var calc_zoom_switching = __webpack_require__(46);

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
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var apply_zoom = __webpack_require__(34);

	module.exports = function zoomed(params) {

	  var zoom_info = {};
	  zoom_info.zoom_x = d3.event.scale;
	  zoom_info.zoom_y = d3.event.scale;
	  zoom_info.trans_x = d3.event.translate[0] - params.viz.clust.margin.left;
	  zoom_info.trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

	  apply_zoom(params, zoom_info);
		};

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var run_transformation = __webpack_require__(35);
	var zoom_rules_y = __webpack_require__(44);
	var zoom_rules_x = __webpack_require__(45);

	module.exports = function apply_zoom(params, zoom_info) {

	  d3.selectAll('.tile_tip').style('display', 'none');

	  zoom_info = zoom_rules_y(params, zoom_info);

	  zoom_info = zoom_rules_x(params, zoom_info);

	  run_transformation(params, zoom_info);
		};

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var constrain_font_size = __webpack_require__(36);
	var zooming_has_stopped = __webpack_require__(38);
	var show_visible_area = __webpack_require__(41);
	var resize_label_val_bars = __webpack_require__(43);
	var num_visible_labels = __webpack_require__(39);

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
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_real_font_size = __webpack_require__(37);

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
/* 37 */
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
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var num_visible_labels = __webpack_require__(39);
	var trim_text = __webpack_require__(40);
	var constrain_font_size = __webpack_require__(36);

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
/* 39 */
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
/* 40 */
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
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var toggle_element_display = __webpack_require__(42);

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
/* 42 */
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
/* 43 */
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
/* 44 */
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
/* 45 */
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
/* 46 */
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
/* 47 */
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
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var generate_matrix = __webpack_require__(49);
	var make_rows = __webpack_require__(58);
	var make_cols = __webpack_require__(73);
	var generate_super_labels = __webpack_require__(76);
	var spillover = __webpack_require__(77);
	var search = __webpack_require__(82);
	var initialize_resizing = __webpack_require__(85);
	var ini_doubleclick = __webpack_require__(87);
	var make_col_cat = __webpack_require__(105);
	var make_row_cat = __webpack_require__(108);
	var trim_text = __webpack_require__(40);
	var make_row_dendro = __webpack_require__(109);
	var make_col_dendro = __webpack_require__(110);

	module.exports = function make_viz(cgm) {

	  var params = cgm.params;

	  d3.select(params.viz.viz_wrapper + ' svg').remove();

	  var svg_group = d3.select(params.viz.viz_wrapper).append('svg').attr('class', 'viz_svg').attr('id', 'svg_' + params.root.replace('#', '')).attr('width', params.viz.svg_dim.width).attr('height', params.viz.svg_dim.height).attr('is_zoom', 0).attr('stopped_zoom', 1);

	  svg_group.append('rect').attr('class', 'super_background').style('width', params.viz.svg_dim.width).style('height', params.viz.svg_dim.height).style('fill', 'white');

	  generate_matrix(params, svg_group);

	  var delay_text = 0;
	  make_rows(cgm, delay_text);

	  if (params.viz.show_dendrogram) {
	    make_row_dendro(cgm);
	    make_col_dendro(cgm);
	  }

	  make_cols(cgm, delay_text);

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

	  spillover(cgm);

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

	  initialize_resizing(cgm);

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
/* 49 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var draw_gridlines = __webpack_require__(50);
	var add_click_hlight = __webpack_require__(51);
	var make_simple_rows = __webpack_require__(52);
	var d3_tip_custom = __webpack_require__(57);

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
/* 50 */
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
/* 51 */
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
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* eslint-disable */

	var draw_up_tile = __webpack_require__(53);
	var draw_dn_tile = __webpack_require__(54);
	var mouseover_tile = __webpack_require__(55);
	var mouseout_tile = __webpack_require__(56);

	module.exports = function make_simple_rows(params, ini_inp_row_data, tip, row_selection) {

	  var inp_row_data = ini_inp_row_data.row_data;

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
	  }).enter().append('rect').attr('class', 'tile row_tile').attr('width', params.viz.rect_width).attr('height', params.viz.rect_height)
	  // switch the color based on up/dn value
	  .style('fill', function (d) {

	    var inst_fill;
	    if (d.value_orig === 'NaN') {
	      // console.log('found NaN while making tiles');
	      inst_fill = '#000000';
	    } else {
	      inst_fill = d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
	    }

	    return inst_fill;
	  }).on('mouseover', function () {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    mouseover_tile(params, this, tip, args);
	  }).on('mouseout', function () {
	    mouseout_tile(params, this, tip);
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
/* 53 */
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
/* 54 */
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
/* 55 */
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
/* 56 */
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
/* 57 */
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
/* 58 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var add_row_click_hlight = __webpack_require__(59);
	var row_reorder = __webpack_require__(60);
	var col_reorder = __webpack_require__(71);
	var make_row_tooltips = __webpack_require__(72);

	module.exports = function make_rows(cgm, text_delay) {

	  var params = cgm.params;

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

	    // if (params.dendro_filter.col === false){

	    var data_attr = '__data__';
	    var row_name = this[data_attr].name;

	    if (params.sim_mat) {
	      row_reorder(cgm, this, row_name);

	      var col_selection = d3.selectAll(params.root + ' .col_label_text').filter(function (d) {
	        return d.name == row_name;
	      })[0][0];

	      col_reorder(cgm, col_selection, row_name);
	    } else {
	      row_reorder(cgm, this, row_name);
	    }
	    if (params.tile_click_hlight) {
	      add_row_click_hlight(this, d.ini);
	    }
	    // }
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
/* 59 */
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
/* 60 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var reposition_tile_highlight = __webpack_require__(61);
	var toggle_dendro_view = __webpack_require__(62);
	var show_visible_area = __webpack_require__(41);

	module.exports = function row_reorder(cgm, row_selection, inst_row) {

	  var params = cgm.params;
	  params.viz.inst_order.row = 'custom';
	  toggle_dendro_view(cgm, 'col');

	  // d3.selectAll(params.root+' .col_dendro_group').style('opacity',0);

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
/* 61 */
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
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_dendro_triangles = __webpack_require__(63);
	var make_col_dendro_triangles = __webpack_require__(69);

	module.exports = function toggle_dendro_view(cgm, row_col) {
	  var wait_time = arguments.length <= 2 || arguments[2] === undefined ? 1500 : arguments[2];


	  var params = cgm.params;

	  // row and col are reversed
	  if (row_col === 'row') {
	    if (params.viz.inst_order.col === 'clust') {
	      // the last true tells the viz that I'm chaning group size and not to
	      // delay the change in dendro
	      setTimeout(make_row_dendro_triangles, wait_time, cgm, true);
	    }
	  }

	  if (row_col === 'col') {
	    if (params.viz.inst_order.row === 'clust') {
	      setTimeout(make_col_dendro_triangles, wait_time, cgm, true);
	    }
	  }

	  if (params.viz.inst_order.row != 'clust' && params.viz.dendro_filter.col === false) {
	    d3.selectAll(params.root + ' .col_dendro_group').style('opacity', 0).on('mouseover', null).on('mouseout', null);
	  }

	  if (params.viz.inst_order.col != 'clust' && params.viz.dendro_filter.row === false) {
	    d3.selectAll(params.root + ' .row_dendro_group').style('opacity', 0).on('mouseover', null).on('mouseout', null);
	  }
	};

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_row_dendro_triangles = __webpack_require__(64);
	var dendro_group_highlight = __webpack_require__(65);
	var dendro_mouseover = __webpack_require__(67);
	var dendro_mouseout = __webpack_require__(68);

	module.exports = function make_row_dendro_triangles(cgm) {
	  var is_change_group = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


	  var params = cgm.params;

	  var dendro_info = calc_row_dendro_triangles(params);

	  var inst_dendro_opacity;
	  if (dendro_info.length > 1) {
	    inst_dendro_opacity = params.viz.dendro_opacity;
	  } else {
	    inst_dendro_opacity = 0.90;
	  }

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
	      d3.select(this).style('opacity', inst_dendro_opacity);
	    }

	    d3.selectAll(params.root + ' .dendro_shadow').remove();

	    dendro_mouseout(this);
	  }).on('click', function (d) {
	    row_dendro_filter_db(d, this);
	  });

	  var triangle_opacity;
	  if (params.viz.inst_order.col === 'clust') {
	    triangle_opacity = inst_dendro_opacity;
	  } else {
	    triangle_opacity = 0;
	  }

	  if (run_transition) {

	    d3.select(params.root + ' .row_dendro_container').selectAll('path').transition().delay(1000).duration(1000).style('opacity', triangle_opacity);
	  } else {

	    d3.select(params.root + ' .row_dendro_container').selectAll('path').style('opacity', triangle_opacity);
	  }

	  var row_dendro_filter_db = _.debounce(row_dendro_filter, 1500);

	  function row_dendro_filter(d, inst_selection) {

	    var names = {};
	    if (cgm.params.dendro_filter.col === false) {

	      /* filter rows using dendrogram */
	      if (cgm.params.dendro_filter.row === false) {

	        // // disable row ordering and dendro slider
	        // d3.selectAll('.toggle_row_order .btn').attr('disabled', true);
	        // $(params.root+' .slider_row').slider('disable');

	        d3.select(params.root + ' .slider_row').style('opacity', 0.5).style('pointer-events', 'none');

	        names.row = d.all_names;

	        var tmp_names = cgm.params.network_data.row_nodes_names;

	        // keep a backup of the inst_view
	        var inst_row_nodes = cgm.params.network_data.row_nodes;
	        var inst_col_nodes = cgm.params.network_data.col_nodes;

	        cgm.filter_viz_using_names(names);

	        cgm.params.inst_nodes.row_nodes = inst_row_nodes;
	        cgm.params.inst_nodes.col_nodes = inst_col_nodes;

	        d3.selectAll(params.root + ' .dendro_shadow').transition().duration(1000).style('opacity', 0).remove();

	        // keep the names of all the rows
	        cgm.params.dendro_filter.row = tmp_names;

	        d3.select(inst_selection).style('opacity', 1);

	        /* reset filter */
	      } else {

	        names.row = cgm.params.dendro_filter.row;

	        cgm.filter_viz_using_names(names);
	        cgm.params.dendro_filter.row = false;
	      }
	    }
	  }
		};

/***/ },
/* 64 */
/***/ function(module, exports) {

	"use strict";

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
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var dendro_shade_bars = __webpack_require__(66);
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
/* 66 */
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
/* 67 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function dendro_mouseover(inst_selection) {
	  d3.select(inst_selection).classed('hovering', true);
		};

/***/ },
/* 68 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function dendro_mouseout(inst_selection) {
	  d3.select(inst_selection).classed('hovering', false);
		};

/***/ },
/* 69 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_col_dendro_triangles = __webpack_require__(70);
	var dendro_group_highlight = __webpack_require__(65);
	var dendro_mouseover = __webpack_require__(67);
	var dendro_mouseout = __webpack_require__(68);

	module.exports = function make_col_dendro_triangles(cgm) {
	  var is_change_group = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


	  var params = cgm.params;

	  var dendro_info = calc_col_dendro_triangles(params);

	  var inst_dendro_opacity;
	  if (dendro_info.length > 1) {
	    inst_dendro_opacity = params.viz.dendro_opacity;
	  } else {
	    inst_dendro_opacity = 0.90;
	  }

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
	      d3.select(this).style('opacity', inst_dendro_opacity);
	    }
	    d3.selectAll(params.root + ' .dendro_shadow').remove();
	    dendro_mouseout(this);
	  }).on('click', function (d) {
	    col_dendro_filter_db(d, this);
	  });

	  var triangle_opacity;

	  if (params.viz.inst_order.row === 'clust') {
	    triangle_opacity = inst_dendro_opacity;
	  } else {
	    triangle_opacity = 0;
	  }

	  if (run_transition) {

	    d3.select(params.root + ' .col_dendro_container').selectAll('path').transition().delay(1000).duration(1000).style('opacity', triangle_opacity);
	  } else {

	    d3.select(params.root + ' .col_dendro_container').selectAll('path').style('opacity', triangle_opacity);
	  }

	  var col_dendro_filter_db = _.debounce(col_dendro_filter, 700);

	  function col_dendro_filter(d, inst_selection) {

	    var names = {};
	    if (cgm.params.dendro_filter.row === false) {

	      /* filter cols using dendrogram */
	      if (cgm.params.dendro_filter.col === false) {

	        // // disable col ordering and dendro slider
	        // d3.selectAll('.toggle_col_order .btn').attr('disabled', true);

	        // $(params.root+' .slider_col').slider('disable');

	        d3.select(params.root + ' .slider_col').style('opacity', 0.5).style('pointer-events', 'none');

	        names.col = d.all_names;

	        var tmp_names = cgm.params.network_data.col_nodes_names;

	        // keep a backup of the inst_view
	        var inst_row_nodes = cgm.params.network_data.row_nodes;
	        var inst_col_nodes = cgm.params.network_data.col_nodes;

	        cgm.filter_viz_using_names(names);

	        cgm.params.inst_nodes.row_nodes = inst_row_nodes;
	        cgm.params.inst_nodes.col_nodes = inst_col_nodes;

	        d3.selectAll(params.root + ' .dendro_shadow').transition().duration(1000).style('opacity', 0).remove();

	        // keep the names of all the cols
	        cgm.params.dendro_filter.col = tmp_names;

	        d3.select(inst_selection).style('opacity', 1);

	        /* reset filter */
	      } else {

	        names.col = cgm.params.dendro_filter.col;

	        cgm.filter_viz_using_names(names);
	        cgm.params.dendro_filter.col = false;
	      }
	    }
	  }
		};

/***/ },
/* 70 */
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
/* 71 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var reposition_tile_highlight = __webpack_require__(61);
	var toggle_dendro_view = __webpack_require__(62);
	var show_visible_area = __webpack_require__(41);

	module.exports = function col_reorder(cgm, col_selection, inst_term) {

	  var params = cgm.params;

	  params.viz.inst_order.col = 'custom';
	  toggle_dendro_view(cgm, 'col');

	  // d3.selectAll(params.root+' .row_dendro_group').style('opacity',0);

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
/* 72 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d3_tip_custom = __webpack_require__(57);

	module.exports = function make_tooltips(params) {

	  d3.selectAll(params.root + ' .row_tip').remove();

	  if (params.labels.show_label_tooltips) {

	    // d3-tooltip
	    var row_tip = d3_tip_custom().attr('class', 'd3-tip row_tip').direction('e').offset([0, 10]).html(function (d) {
	      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
	      return "<span>" + inst_name + "</span>";
	    });

	    d3.select(params.viz.viz_wrapper).select(params.root + ' .row_container').call(row_tip);

	    d3.select(params.root + ' .row_label_zoom_container').selectAll('g').on('mouseover', function (d) {

	      // do not include params.root selector since tooltips are not in root
	      d3.select(' .row_tip').classed(d.name, true);

	      d3.selectAll('.d3-tip').style('opacity', 0);

	      d3.select(this).select('text').classed('active', true);

	      row_tip.show(d);

	      if (params.row_tip_callback != null) {
	        params.row_tip_callback(d.name);
	      }
	    }).on('mouseout', function mouseout(d) {

	      d3.select(' .row_tip').classed(d.name, false);

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
/* 73 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var add_col_click_hlight = __webpack_require__(74);
	var col_reorder = __webpack_require__(71);
	var row_reorder = __webpack_require__(60);
	var make_col_tooltips = __webpack_require__(75);

	module.exports = function (cgm, text_delay) {

	  var params = cgm.params;
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

	    // if (params.dendro_filter.row === false){

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

	    // }
	  });
		};

/***/ },
/* 74 */
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
/* 75 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var d3_tip_custom = __webpack_require__(57);

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
/* 76 */
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
/* 77 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_title = __webpack_require__(78);
	var ini_cat_reorder = __webpack_require__(79);
	var make_row_cat_super_labels = __webpack_require__(81);

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
	    make_row_cat_super_labels(cgm);
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

	  ini_cat_reorder(cgm);
		};

/***/ },
/* 78 */
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
/* 79 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var all_reorder = __webpack_require__(80);

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
/* 80 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var toggle_dendro_view = __webpack_require__(62);
	var show_visible_area = __webpack_require__(41);

	module.exports = function (cgm, inst_order, tmp_row_col) {

	  var params = cgm.params;

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
	    toggle_dendro_view(cgm, tmp_row_col);
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
/* 81 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_title = __webpack_require__(78);

	module.exports = function make_row_cat_super_labels(cgm) {

	  var params = cgm.params;

	  var viz = params.viz;
	  var extra_x_room = 2.75;

	  if (d3.select('.row_cat_label_container').empty()) {
	    d3.select(cgm.params.viz.viz_svg).append('g').classed('row_cat_label_container', true);
	  }

	  d3.selectAll(params.root + ' .row_cat_label_container text').remove();

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

	  d3.selectAll(params.root + ' .row_cat_label_container text').remove();

	  if (viz.sim_mat === false) {

	    d3.select(params.root + ' .row_cat_label_container').selectAll().data(viz.all_cats.row).enter().append('text').classed('row_cat_super', true).style('font-size', cat_text_size + 'px').style('opacity', cat_super_opacity).style('cursor', 'default').attr('transform', function (d) {
	      var inst_y = extra_y_room * viz.cat_room.symbol_width * parseInt(d.split('-')[1], 10);
	      return 'translate(0,' + inst_y + ')';
	    }).text(function (d) {
	      return get_cat_title(viz, d, 'row');
	    });
	  }
	};

/***/ },
/* 82 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var two_translate_zoom = __webpack_require__(83);

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
/* 83 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var label_constrain_and_trim = __webpack_require__(84);
	var show_visible_area = __webpack_require__(41);

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
/* 84 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var trim_text = __webpack_require__(40);
	var constrain_font_size = __webpack_require__(36);

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
/* 85 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resize_viz = __webpack_require__(86);

	module.exports = function (cgm) {

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
/* 86 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var zoomed = __webpack_require__(33);
	var ini_doubleclick = __webpack_require__(87);
	var reset_zoom = __webpack_require__(88);
	var resize_dendro = __webpack_require__(89);
	var resize_grid_lines = __webpack_require__(90);
	var resize_super_labels = __webpack_require__(91);
	var resize_spillover = __webpack_require__(92);
	var resize_borders = __webpack_require__(93);
	var resize_row_labels = __webpack_require__(94);
	var resize_highlights = __webpack_require__(95);
	var resize_row_viz = __webpack_require__(96);
	var resize_col_labels = __webpack_require__(97);
	var resize_col_text = __webpack_require__(98);
	var resize_col_triangle = __webpack_require__(99);
	var resize_col_hlight = __webpack_require__(100);
	var recalc_params_for_resize = __webpack_require__(101);
	var resize_row_tiles = __webpack_require__(102);
	var resize_label_bars = __webpack_require__(103);
	var label_constrain_and_trim = __webpack_require__(84);
	var make_row_dendro_triangles = __webpack_require__(63);
	var make_col_dendro_triangles = __webpack_require__(69);
	var toggle_dendro_view = __webpack_require__(62);
	var show_visible_area = __webpack_require__(41);
	var calc_viz_dimensions = __webpack_require__(23);
	var position_play_button = __webpack_require__(104);
	var make_row_cat_super_labels = __webpack_require__(81);
	var ini_cat_reorder = __webpack_require__(79);

	module.exports = function (cgm) {

	  var params = cgm.params;

	  var cont_dim = calc_viz_dimensions(params);

	  d3.select(params.root + ' .play_button');
	  // .style('opacity', 0.2);

	  // reset visible area
	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;

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
	    make_row_dendro_triangles(cgm, is_resize);
	    make_col_dendro_triangles(cgm, is_resize);
	    resize_dendro(params, svg_group);

	    toggle_dendro_view(cgm, 'row', 0);
	    toggle_dendro_view(cgm, 'col', 0);
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

	  // reposition matrix
	  d3.select(params.root + ' .clust_container').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.clust.margin.top + ')');

	  show_visible_area(params, zoom_info);

	  make_row_cat_super_labels(cgm);

	  d3.select(params.viz.viz_svg).style('opacity', 1);

	  ini_cat_reorder(cgm);
		};

/***/ },
/* 87 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var two_translate_zoom = __webpack_require__(83);

	module.exports = function (params) {
	  // disable double-click zoom
	  d3.selectAll(params.viz.zoom_element).on('dblclick.zoom', null);

	  d3.select(params.viz.zoom_element).on('dblclick', function () {
	    two_translate_zoom(params, 0, 0, 1);
	  });
	};

/***/ },
/* 88 */
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
/* 89 */
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
/* 90 */
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
/* 91 */
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
/* 92 */
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
/* 93 */
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
/* 94 */
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
/* 95 */
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
/* 96 */
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
/* 97 */
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
/* 98 */
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
/* 99 */
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
/* 100 */
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
/* 101 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_svg_dim = __webpack_require__(24);
	var calc_clust_height = __webpack_require__(27);
	var calc_clust_width = __webpack_require__(26);
	var calc_default_fs = __webpack_require__(47);
	var calc_zoom_switching = __webpack_require__(46);

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
/* 102 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var draw_up_tile = __webpack_require__(53);
	var draw_dn_tile = __webpack_require__(54);

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
/* 103 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var calc_val_max = __webpack_require__(28);

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
/* 104 */
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
/* 105 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cat_tooltip_text = __webpack_require__(106);
	var d3_tip_custom = __webpack_require__(57);
	var reset_cat_opacity = __webpack_require__(107);

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
/* 106 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var get_cat_title = __webpack_require__(78);
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

	        if (cat_name.indexOf('Not ') < 0 && cat_name != 'false') {
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
/* 107 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function reset_cat_opacity(params) {

	  _.each(['row', 'col'], function (inst_rc) {
	    d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').selectAll('rect').style('opacity', params.viz.cat_colors.opacity);
	  });
		};

/***/ },
/* 108 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var cat_tooltip_text = __webpack_require__(106);
	var d3_tip_custom = __webpack_require__(57);
	var reset_cat_opacity = __webpack_require__(107);

	module.exports = function make_row_cat(params) {
	  var updating = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];


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

	  // // working on removing old categories
	  // console.log('trying to')
	  // d3.select(params.root+' .row_cat_container')
	  //   .selectAll('g')
	  //   .data(params.network_data.row_nodes, function(d){return d.name;})
	  //   .exit()
	  //   .each(function(d){
	  //     console.log('here')
	  //   });

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
	          var inst_color = params.viz.cat_colors.row[inst_cat][d[inst_cat]];
	          return inst_color;
	        }).attr('x', function () {
	          var inst_offset = params.viz.cat_room.symbol_width + params.viz.uni_margin / 2;
	          return inst_offset + 'px';
	        }).attr('transform', function () {
	          var cat_room = params.viz.cat_room.symbol_width + params.viz.cat_room.separation;
	          var inst_shift = inst_num * cat_room;
	          return 'translate(' + inst_shift + ',0)';
	        }).on('mouseover', cat_tip.show).on('mouseout', function () {
	          cat_tip.hide(this);
	          reset_cat_opacity(params);
	          d3.select(this).classed('hovering', false);
	        });

	        if (updating) {
	          cat_rect.style('opacity', 0).transition().duration(1000).style('opacity', params.viz.cat_colors.opacity);
	        } else {
	          cat_rect.style('opacity', params.viz.cat_colors.opacity);
	        }
	      });
	    });
	  }
		};

/***/ },
/* 109 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_dendro_triangles = __webpack_require__(63);

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

	  make_row_dendro_triangles(cgm, false);

	  if (params.viz.inst_order.col != 'clust') {
	    d3.selectAll(params.root + ' .row_dendro_group').remove();
	  }
		};

/***/ },
/* 110 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_col_dendro_triangles = __webpack_require__(69);

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

	  make_col_dendro_triangles(cgm, false);

	  if (params.viz.inst_order.row != 'clust') {
	    d3.selectAll(params.root + ' .col_dendro_group').remove();
	  }
		};

/***/ },
/* 111 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* eslint-disable */

	var run_segment = __webpack_require__(112);
	var play_intro = __webpack_require__(113);
	var play_zoom = __webpack_require__(115);
	var play_reset_zoom = __webpack_require__(116);
	var play_reorder_row = __webpack_require__(118);
	var play_reorder_buttons = __webpack_require__(119);
	var play_search = __webpack_require__(121);
	var play_filter = __webpack_require__(122);
	var quick_cluster = __webpack_require__(145);
	var play_groups = __webpack_require__(146);
	var play_categories = __webpack_require__(147);
	var play_conclusion = __webpack_require__(148);
	var toggle_play_button = __webpack_require__(149);
	var play_menu_button = __webpack_require__(150);

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
/* 112 */
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
/* 113 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);

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
/* 114 */
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
/* 115 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var two_translate_zoom = __webpack_require__(83);

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
/* 116 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var two_translate_zoom = __webpack_require__(83);
	var sim_click = __webpack_require__(117);

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
/* 117 */
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
/* 118 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var sim_click = __webpack_require__(117);

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
/* 119 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var highlight_sidebar_element = __webpack_require__(120);

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
/* 120 */
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
/* 121 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var highlight_sidebar_element = __webpack_require__(120);
	var two_translate_zoom = __webpack_require__(83);

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
/* 122 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var highlight_sidebar_element = __webpack_require__(120);
	var update_viz_with_view = __webpack_require__(123);

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
/* 123 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_network_using_view = __webpack_require__(10);
	var disable_sidebar = __webpack_require__(124);
	var update_viz_with_network = __webpack_require__(125);

	module.exports = function update_network_with_view(cgm, requested_view) {

	  disable_sidebar(cgm.params);

	  // make new_network_data by filtering the original network data
	  var new_network_data = make_network_using_view(cgm.config, cgm.params, requested_view);

	  update_viz_with_network(cgm, new_network_data);
		};

/***/ },
/* 124 */
/***/ function(module, exports) {

	'use strict';

	/* eslint-disable */
	module.exports = function disable_sidebar(params) {

	  console.log('improve sidebar disable');
	  // $(params.root+' .slider').slider('disable');

	  d3.selectAll(params.root + ' .btn').attr('disabled', true);

	  d3.select(params.viz.viz_svg).style('opacity', 0.70);
		};

/***/ },
/* 125 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_params = __webpack_require__(9);
	var define_enter_exit_delays = __webpack_require__(126);
	var enter_exit_update = __webpack_require__(127);
	var initialize_resizing = __webpack_require__(85);
	var make_col_cat = __webpack_require__(105);
	var make_row_cat = __webpack_require__(108);
	var make_row_dendro = __webpack_require__(109);
	var make_col_dendro = __webpack_require__(110);
	var ini_sidebar = __webpack_require__(139);
	var enable_sidebar = __webpack_require__(141);
	var ini_doubleclick = __webpack_require__(87);
	var update_reorder_buttons = __webpack_require__(142);
	var make_row_cat_super_labels = __webpack_require__(81);
	var modify_row_node_cats = __webpack_require__(143);

	module.exports = function update_viz_with_network(cgm, new_network_data) {

	  var inst_group_level = cgm.params.group_level;

	  // make tmp config to make new params
	  var tmp_config = jQuery.extend(true, {}, cgm.config);

	  var new_cat_data = null;

	  // bring in 'new' category data
	  if (cgm.params.new_cat_data != null) {
	    modify_row_node_cats(cgm.params.new_cat_data, new_network_data.row_nodes);
	    new_cat_data = cgm.params.new_cat_data;
	  }

	  tmp_config.network_data = new_network_data;
	  tmp_config.inst_order = cgm.params.viz.inst_order;
	  tmp_config.input_domain = cgm.params.matrix.opacity_scale.domain()[1];

	  update_reorder_buttons(tmp_config, cgm.params);

	  tmp_config.ini_expand = false;
	  tmp_config.ini_view = null;
	  tmp_config.current_col_cat = cgm.params.current_col_cat;

	  // // pass on category info to new config
	  // console.log('passing on category info from previous viz')
	  // tmp_config.all_cats = cgm.params.viz.all_cats;
	  // tmp_config.cat_colors.row['cat-1'] = tmp_config.cat_colors.row['cat-0']

	  // always preserve category colors when updating
	  tmp_config.cat_colors = cgm.params.viz.cat_colors;

	  var new_params = make_params(tmp_config);
	  var delays = define_enter_exit_delays(cgm.params, new_params);

	  // pass the newly calcluated params back to teh cgm object
	  cgm.params = new_params;

	  if (new_cat_data != null) {
	    cgm.params.new_cat_data = new_cat_data;
	  }

	  // have persistent group levels while updating
	  cgm.params.group_level = inst_group_level;

	  enter_exit_update(cgm, new_network_data, delays);

	  make_row_cat(cgm.params);
	  make_row_cat_super_labels(cgm);

	  if (cgm.params.viz.show_categories.col) {
	    make_col_cat(cgm.params);
	  }

	  if (cgm.params.viz.show_dendrogram) {
	    make_row_dendro(cgm);
	    make_col_dendro(cgm);
	  }

	  initialize_resizing(cgm);

	  d3.select(cgm.params.viz.viz_svg).call(cgm.params.zoom_behavior);

	  ini_doubleclick(cgm.params);

	  ini_sidebar(cgm);

	  cgm.params.viz.run_trans = true;

	  d3.selectAll(cgm.params.root + ' .d3-tip').style('opacity', 0);

	  setTimeout(enable_sidebar, 2500, cgm.params);
		};

/***/ },
/* 126 */
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
/* 127 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var resize_after_update = __webpack_require__(128);
	var make_rows = __webpack_require__(58);
	var make_cols = __webpack_require__(73);
	var eeu_existing_row = __webpack_require__(129);
	var exit_components = __webpack_require__(133);
	var enter_grid_lines = __webpack_require__(134);
	var enter_row_groups = __webpack_require__(135);
	var resize_containers = __webpack_require__(138);
	var label_constrain_and_trim = __webpack_require__(84);
	var d3_tip_custom = __webpack_require__(57);

	module.exports = function (cgm, network_data, delays) {

	  var params = cgm.params;

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
	  make_rows(cgm, duration);
	  make_cols(cgm, duration);

	  enter_grid_lines(params, delays, duration);

	  setTimeout(label_constrain_and_trim, 2000, params);
		};

/***/ },
/* 128 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var utils = __webpack_require__(2);
	var calc_clust_height = __webpack_require__(27);
	var get_svg_dim = __webpack_require__(24);
	var calc_clust_width = __webpack_require__(26);
	var reset_zoom = __webpack_require__(88);
	var resize_dendro = __webpack_require__(89);
	var resize_super_labels = __webpack_require__(91);
	var resize_spillover = __webpack_require__(92);
	var resize_row_labels = __webpack_require__(94);
	var resize_row_viz = __webpack_require__(96);
	var resize_col_labels = __webpack_require__(97);
	var resize_col_text = __webpack_require__(98);
	var resize_col_triangle = __webpack_require__(99);
	var resize_col_hlight = __webpack_require__(100);
	var resize_label_bars = __webpack_require__(103);
	var calc_default_fs = __webpack_require__(47);
	var calc_zoom_switching = __webpack_require__(46);
	var show_visible_area = __webpack_require__(41);

	module.exports = function (params, row_nodes, col_nodes, links, duration, delays) {

	  // reset visible area
	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;

	  show_visible_area(params, zoom_info);
	  // quick fix for column filtering
	  setTimeout(show_visible_area, 2200, params, zoom_info);

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
/* 129 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var exit_existing_row = __webpack_require__(130);
	var enter_existing_row = __webpack_require__(131);
	var update_split_tiles = __webpack_require__(132);
	var mouseover_tile = __webpack_require__(55);
	var mouseout_tile = __webpack_require__(56);

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
/* 130 */
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
/* 131 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var mouseover_tile = __webpack_require__(55);
	var mouseout_tile = __webpack_require__(56);

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
/* 132 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var draw_up_tile = __webpack_require__(53);
	var draw_dn_tile = __webpack_require__(54);
	var mouseover_tile = __webpack_require__(55);
	var mouseout_tile = __webpack_require__(56);

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
/* 133 */
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
/* 134 */
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
/* 135 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var enter_new_rows = __webpack_require__(136);

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
/* 136 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var enter_split_tiles = __webpack_require__(137);
	var mouseover_tile = __webpack_require__(55);
	var mouseout_tile = __webpack_require__(56);

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
/* 137 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var draw_up_tile = __webpack_require__(53);
	var draw_dn_tile = __webpack_require__(54);

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
/* 138 */
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
/* 139 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/* eslint-disable */

	var change_groups = __webpack_require__(140);
	var search = __webpack_require__(82);
	var all_reorder = __webpack_require__(80);
	var ini_cat_reorder = __webpack_require__(79);

	module.exports = function ini_sidebar(cgm) {

	  var params = cgm.params;

	  // initializes sidebar buttons and sliders

	  var search_obj = search(params, params.network_data.row_nodes, 'name');

	  // var input = document.getElementById("myinput");
	  var input = d3.select(params.root + ' .gene_search_box')[0][0];
	  var awesomplete = new Awesomplete(input, { minChars: 1, maxItems: 15 });

	  awesomplete.list = search_obj.get_entities;

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

	  /* initialize dendro sliders */
	  _.each(reorder_types, function (inst_rc) {

	    var tmp_rc = inst_rc;
	    if (tmp_rc === 'both') {
	      tmp_rc = 'row';
	    }
	    var inst_group = cgm.params.group_level[tmp_rc];
	    var inst_group_value = inst_group / 10;

	    if (d3.select(params.root + ' .slider_' + inst_rc).select('#handle-one').empty()) {

	      var dendro_slider = d3.slider().snap(true).value(inst_group_value).min(0).max(1).step(0.1).on('slide', function (evt, value) {
	        run_on_dendro_slide(evt, value, inst_rc);
	      });

	      d3.select(params.root + ' .slider_' + inst_rc).call(dendro_slider);
	    }

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

	    var slider_fun = d3.slider()
	    // .axis(d3.svg.axis())
	    .snap(true).value(1).min(0.1).max(1.9).step(0.1).on('slide', function (evt, value) {
	      run_on_opacity_slide(evt, value);
	    });

	    d3.select(cgm.params.root + ' .opacity_slider').call(slider_fun);
	  }

	  //////////////////////////////////////////////////////////////////////

	  // $( params.root+' .opacity_slider' ).slider({
	  //   // value:0.5,
	  //   min: 0.1,
	  //   max: 2.0,
	  //   step: 0.1,
	  //   slide: function( event, ui ) {

	  //     $( "#amount" ).val( "$" + ui.value );
	  //     var inst_index = 2 - ui.value;

	  //     var scaled_max = params.matrix.abs_max_val * inst_index;

	  //     params.matrix.opacity_scale.domain([0, scaled_max]);

	  //     d3.selectAll(params.root+' .tile')
	  //       .style('fill-opacity', function(d) {
	  //         // calculate output opacity using the opacity scale
	  //         var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
	  //         return output_opacity;
	  //       });


	  //   }
	  // });

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
/* 140 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	// var build_color_groups = require('./build_color_groups');
	var make_row_dendro_triangles = __webpack_require__(63);
	var make_col_dendro_triangles = __webpack_require__(69);

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
	  make_row_dendro_triangles(cgm, is_change_group);
	  make_col_dendro_triangles(cgm, is_change_group);
		};

/***/ },
/* 141 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function enable_sidebar(params) {

	  /* only enable dendrogram sliders if there has been no dendro_filtering */

	  // $(params.root+' .opacity_slider').slider('enable');

	  // $(params.root+' .slider_N_row_sum').slider('enable');
	  // $(params.root+' .slider_N_row_var').slider('enable');

	  // only enable reordering if params.dendro_filter.row === false

	  if (params.dendro_filter.row === false) {
	    // $(params.root+' .slider_row').slider('enable');
	    d3.select(params.root + ' .slider_row').style('opacity', 1).style('pointer-events', 'all');
	  }

	  d3.selectAll(params.root + ' .toggle_row_order .btn').attr('disabled', null);

	  if (params.dendro_filter.col === false) {
	    // $(params.root+' .slider_col').slider('enable');
	    d3.select(params.root + ' .slider_col').style('opacity', 1).style('pointer-events', 'all');
	  }

	  d3.selectAll(params.root + ' .toggle_col_order .btn').attr('disabled', null);

	  d3.selectAll(params.root + ' .gene_search_button .btn').attr('disabled', null);

	  params.viz.run_trans = false;

	  // d3.selectAll(params.root+' .category_section')
	  //   .on('click', category_key_click)
	  //   .select('text')
	  //   .style('opacity',1);
	};

/***/ },
/* 142 */
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
/* 143 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var remove_node_cats = __webpack_require__(144);

	module.exports = function modify_row_node_cats(cat_data, inst_nodes) {

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

	      inst_full_cat = inst_cat_title + ': ' + inst_category;

	      inst_node['cat-' + String(cat_type_num)] = inst_full_cat;
	      inst_node['cat_' + String(cat_type_num) + '_index'] = inst_index;

	      cat_type_num = cat_type_num + 1;
	    });
	  });
		};

/***/ },
/* 144 */
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
/* 145 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var sim_click = __webpack_require__(117);

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
/* 146 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var highlight_sidebar_element = __webpack_require__(120);
	var change_groups = __webpack_require__(140);

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
/* 147 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var sim_click = __webpack_require__(117);

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
/* 148 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var toggle_play_button = __webpack_require__(149);

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
/* 149 */
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
/* 150 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var demo_text = __webpack_require__(114);
	var sim_click = __webpack_require__(117);

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
/* 151 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_play_button = __webpack_require__(152);
	var make_demo_text_containers = __webpack_require__(153);

	module.exports = function ini_demo() {

	  var cgm = this;
	  var params = cgm.params;

	  make_play_button(cgm);

	  var demo_text_size = 30;
	  make_demo_text_containers(params, demo_text_size);
		};

/***/ },
/* 152 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var position_play_button = __webpack_require__(104);

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
/* 153 */
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
/* 154 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var filter_network_using_new_nodes = __webpack_require__(11);
	var update_viz_with_network = __webpack_require__(125);

	module.exports = function filter_viz_using_nodes(new_nodes) {

	  var new_network_data = filter_network_using_new_nodes(this.config, new_nodes);
	  update_viz_with_network(this, new_network_data);
		};

/***/ },
/* 155 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var filter_network_using_new_nodes = __webpack_require__(11);
	var update_viz_with_network = __webpack_require__(125);

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

	  // new_nodes.col_nodes = params.network_data.col_nodes;

	  var new_network_data = filter_network_using_new_nodes(cgm.config, new_nodes);

	  // takes entire cgm object
	  // last argument tells it to not preserve categoty colors
	  update_viz_with_network(cgm, new_network_data);
		};

/***/ },
/* 156 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_cat = __webpack_require__(108);
	var calc_viz_params = __webpack_require__(15);
	var resize_viz = __webpack_require__(86);
	var modify_row_node_cats = __webpack_require__(143);

	module.exports = function update_cats(cgm, cat_data) {

	  // do not change column category info
	  var col_cat_colors = cgm.params.viz.cat_colors.col;

	  modify_row_node_cats(cat_data, cgm.params.network_data.row_nodes);
	  // modify the current inst copy of nodes
	  modify_row_node_cats(cat_data, cgm.params.inst_nodes.row_nodes);

	  // recalculate the visualization parameters using the updated network_data
	  cgm.params = calc_viz_params(cgm.params, false);

	  make_row_cat(cgm.params, true);
	  resize_viz(cgm);

	  cgm.params.new_cat_data = cat_data;

	  cgm.params.viz.cat_colors.col = col_cat_colors;
		};

/***/ },
/* 157 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_row_cat = __webpack_require__(108);
	var calc_viz_params = __webpack_require__(15);
	var resize_viz = __webpack_require__(86);
	var modify_row_node_cats = __webpack_require__(143);
	var make_default_cat_data = __webpack_require__(158);

	module.exports = function reset_cats() {

	  var tmp_cgm = this;

	  var cat_data = make_default_cat_data(tmp_cgm);

	  // do not change column category info
	  var col_cat_colors = tmp_cgm.params.viz.cat_colors.col;

	  modify_row_node_cats(cat_data, tmp_cgm.params.network_data.row_nodes);
	  // modify the current inst copy of nodes
	  modify_row_node_cats(cat_data, tmp_cgm.params.inst_nodes.row_nodes);

	  // recalculate the visualization parameters using the updated network_data
	  tmp_cgm.params = calc_viz_params(tmp_cgm.params, false);

	  make_row_cat(tmp_cgm.params, true);
	  resize_viz(tmp_cgm);

	  tmp_cgm.params.new_cat_data = cat_data;

	  tmp_cgm.params.viz.cat_colors.col = col_cat_colors;
		};

/***/ },
/* 158 */
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
/* 159 */
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
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(160)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
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
/* 160 */
/***/ function(module, exports) {

	module.exports = d3;

/***/ },
/* 161 */
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
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(162)(module)))

/***/ },
/* 162 */
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
/* 163 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(164);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(166)(content, {});
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
/* 164 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(165)();
	// imports


	// module
	exports.push([module.id, ".d3-slider {\n    position: relative;\n    font-family: Verdana,Arial,sans-serif;\n    font-size: 1.1em;\n    border: 1px solid #aaaaaa;\n    z-index: 2;\n}\n\n.d3-slider-horizontal {\n    height: .8em;\n}  \n\n.d3-slider-range {\n  background:#2980b9;\n  left:0px;\n  right:0px;\n  height: 0.8em;\n  position: absolute;\n}\n\n.d3-slider-range-vertical {\n  background:#2980b9;\n  left:0px;\n  right:0px;\n  position: absolute;\n  top:0;\n}\n\n.d3-slider-vertical {\n    width: .8em;\n    height: 100px;\n}      \n\n.d3-slider-handle {\n    position: absolute;\n    width: 1.2em;\n    height: 1.2em;\n    border: 1px solid #d3d3d3;\n    border-radius: 4px;\n    background: #eee;\n    background: linear-gradient(to bottom, #eee 0%, #ddd 100%);\n    z-index: 3;\n}\n\n.d3-slider-handle:hover {\n    border: 1px solid #999999;\n}\n\n.d3-slider-horizontal .d3-slider-handle {\n    top: -.3em;\n    margin-left: -.6em;\n}\n\n.d3-slider-axis {\n    position: relative;\n    z-index: 1;    \n}\n\n.d3-slider-axis-bottom {\n    top: .8em;\n}\n\n.d3-slider-axis-right {\n    left: .8em;\n}\n\n.d3-slider-axis path {\n    stroke-width: 0;\n    fill: none;\n}\n\n.d3-slider-axis line {\n    fill: none;\n    stroke: #aaa;\n    shape-rendering: crispEdges;\n}\n\n.d3-slider-axis text {\n    font-size: 11px;\n}\n\n.d3-slider-vertical .d3-slider-handle {\n    left: -.25em;\n    margin-left: 0;\n    margin-bottom: -.6em;      \n}", ""]);

	// exports


/***/ },
/* 165 */
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
/* 166 */
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
/* 167 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(168);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(166)(content, {});
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
/* 168 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(165)();
	// imports


	// module
	exports.push([module.id, "[hidden] { display: none; }\n\n.visually-hidden {\n\tposition: absolute;\n\tclip: rect(0, 0, 0, 0);\n}\n\ndiv.awesomplete {\n\tdisplay: inline-block;\n\tposition: relative;\n}\n\ndiv.awesomplete > input {\n\tdisplay: block;\n}\n\ndiv.awesomplete > ul {\n\tposition: absolute;\n\tleft: 0;\n\tz-index: 1;\n\tmin-width: 100%;\n\tbox-sizing: border-box;\n\tlist-style: none;\n\tpadding: 0;\n\tborder-radius: .3em;\n\tmargin: .2em 0 0;\n\tbackground: hsla(0,0%,100%,.9);\n\tbackground: linear-gradient(to bottom right, white, hsla(0,0%,100%,.8));\n\tborder: 1px solid rgba(0,0,0,.3);\n\tbox-shadow: .05em .2em .6em rgba(0,0,0,.2);\n\ttext-shadow: none;\n}\n\ndiv.awesomplete > ul[hidden],\ndiv.awesomplete > ul:empty {\n\tdisplay: none;\n}\n\n@supports (transform: scale(0)) {\n\tdiv.awesomplete > ul {\n\t\ttransition: .3s cubic-bezier(.4,.2,.5,1.4);\n\t\ttransform-origin: 1.43em -.43em;\n\t}\n\t\n\tdiv.awesomplete > ul[hidden],\n\tdiv.awesomplete > ul:empty {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t\tdisplay: block;\n\t\ttransition-timing-function: ease;\n\t}\n}\n\n\t/* Pointer */\n\tdiv.awesomplete > ul:before {\n\t\tcontent: \"\";\n\t\tposition: absolute;\n\t\ttop: -.43em;\n\t\tleft: 1em;\n\t\twidth: 0; height: 0;\n\t\tpadding: .4em;\n\t\tbackground: white;\n\t\tborder: inherit;\n\t\tborder-right: 0;\n\t\tborder-bottom: 0;\n\t\t-webkit-transform: rotate(45deg);\n\t\ttransform: rotate(45deg);\n\t}\n\n\tdiv.awesomplete > ul > li {\n\t\tposition: relative;\n\t\tpadding: .2em .5em;\n\t\tcursor: pointer;\n\t}\n\t\n\tdiv.awesomplete > ul > li:hover {\n\t\tbackground: hsl(200, 40%, 80%);\n\t\tcolor: black;\n\t}\n\t\n\tdiv.awesomplete > ul > li[aria-selected=\"true\"] {\n\t\tbackground: hsl(205, 40%, 40%);\n\t\tcolor: white;\n\t}\n\t\n\t\tdiv.awesomplete mark {\n\t\t\tbackground: hsl(65, 100%, 50%);\n\t\t}\n\t\t\n\t\tdiv.awesomplete li:hover mark {\n\t\t\tbackground: hsl(68, 100%, 41%);\n\t\t}\n\t\t\n\t\tdiv.awesomplete li[aria-selected=\"true\"] mark {\n\t\t\tbackground: hsl(86, 100%, 21%);\n\t\t\tcolor: inherit;\n\t\t}", ""]);

	// exports


/***/ },
/* 169 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(170);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(166)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./bootstrap.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./bootstrap.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 170 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(165)();
	// imports


	// module
	exports.push([module.id, "/*!\n * Bootstrap v3.3.6 (http://getbootstrap.com)\n * Copyright 2011-2015 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n */\n/*! normalize.css v3.0.3 | MIT License | github.com/necolas/normalize.css */\nhtml {\n  font-family: sans-serif;\n  -webkit-text-size-adjust: 100%;\n      -ms-text-size-adjust: 100%;\n}\nbody {\n  margin: 0;\n}\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmain,\nmenu,\nnav,\nsection,\nsummary {\n  display: block;\n}\naudio,\ncanvas,\nprogress,\nvideo {\n  display: inline-block;\n  vertical-align: baseline;\n}\naudio:not([controls]) {\n  display: none;\n  height: 0;\n}\n[hidden],\ntemplate {\n  display: none;\n}\na {\n  background-color: transparent;\n}\na:active,\na:hover {\n  outline: 0;\n}\nabbr[title] {\n  border-bottom: 1px dotted;\n}\nb,\nstrong {\n  font-weight: bold;\n}\ndfn {\n  font-style: italic;\n}\nh1 {\n  margin: .67em 0;\n  font-size: 2em;\n}\nmark {\n  color: #000;\n  background: #ff0;\n}\nsmall {\n  font-size: 80%;\n}\nsub,\nsup {\n  position: relative;\n  font-size: 75%;\n  line-height: 0;\n  vertical-align: baseline;\n}\nsup {\n  top: -.5em;\n}\nsub {\n  bottom: -.25em;\n}\nimg {\n  border: 0;\n}\nsvg:not(:root) {\n  overflow: hidden;\n}\nfigure {\n  margin: 1em 40px;\n}\nhr {\n  height: 0;\n  -webkit-box-sizing: content-box;\n     -moz-box-sizing: content-box;\n          box-sizing: content-box;\n}\npre {\n  overflow: auto;\n}\ncode,\nkbd,\npre,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em;\n}\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  margin: 0;\n  font: inherit;\n  color: inherit;\n}\nbutton {\n  overflow: visible;\n}\nbutton,\nselect {\n  text-transform: none;\n}\nbutton,\nhtml input[type=\"button\"],\ninput[type=\"reset\"],\ninput[type=\"submit\"] {\n  -webkit-appearance: button;\n  cursor: pointer;\n}\nbutton[disabled],\nhtml input[disabled] {\n  cursor: default;\n}\nbutton::-moz-focus-inner,\ninput::-moz-focus-inner {\n  padding: 0;\n  border: 0;\n}\ninput {\n  line-height: normal;\n}\ninput[type=\"checkbox\"],\ninput[type=\"radio\"] {\n  -webkit-box-sizing: border-box;\n     -moz-box-sizing: border-box;\n          box-sizing: border-box;\n  padding: 0;\n}\ninput[type=\"number\"]::-webkit-inner-spin-button,\ninput[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\ninput[type=\"search\"] {\n  -webkit-box-sizing: content-box;\n     -moz-box-sizing: content-box;\n          box-sizing: content-box;\n  -webkit-appearance: textfield;\n}\ninput[type=\"search\"]::-webkit-search-cancel-button,\ninput[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\nfieldset {\n  padding: .35em .625em .75em;\n  margin: 0 2px;\n  border: 1px solid #c0c0c0;\n}\nlegend {\n  padding: 0;\n  border: 0;\n}\ntextarea {\n  overflow: auto;\n}\noptgroup {\n  font-weight: bold;\n}\ntable {\n  border-spacing: 0;\n  border-collapse: collapse;\n}\ntd,\nth {\n  padding: 0;\n}\n/*! Source: https://github.com/h5bp/html5-boilerplate/blob/master/src/css/main.css */\n@media print {\n  *,\n  *:before,\n  *:after {\n    color: #000 !important;\n    text-shadow: none !important;\n    background: transparent !important;\n    -webkit-box-shadow: none !important;\n            box-shadow: none !important;\n  }\n  a,\n  a:visited {\n    text-decoration: underline;\n  }\n  a[href]:after {\n    content: \" (\" attr(href) \")\";\n  }\n  abbr[title]:after {\n    content: \" (\" attr(title) \")\";\n  }\n  a[href^=\"#\"]:after,\n  a[href^=\"javascript:\"]:after {\n    content: \"\";\n  }\n  pre,\n  blockquote {\n    border: 1px solid #999;\n\n    page-break-inside: avoid;\n  }\n  thead {\n    display: table-header-group;\n  }\n  tr,\n  img {\n    page-break-inside: avoid;\n  }\n  img {\n    max-width: 100% !important;\n  }\n  p,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3;\n  }\n  h2,\n  h3 {\n    page-break-after: avoid;\n  }\n  .navbar {\n    display: none;\n  }\n  .btn > .caret,\n  .dropup > .btn > .caret {\n    border-top-color: #000 !important;\n  }\n  .label {\n    border: 1px solid #000;\n  }\n  .table {\n    border-collapse: collapse !important;\n  }\n  .table td,\n  .table th {\n    background-color: #fff !important;\n  }\n  .table-bordered th,\n  .table-bordered td {\n    border: 1px solid #ddd !important;\n  }\n}\n/*@font-face {\n  font-family: 'Glyphicons Halflings';\n\n  src: url('../fonts/glyphicons-halflings-regular.eot');\n  src: url('../fonts/glyphicons-halflings-regular.eot?#iefix') format('embedded-opentype'), url('../fonts/glyphicons-halflings-regular.woff2') format('woff2'), url('../fonts/glyphicons-halflings-regular.woff') format('woff'), url('../fonts/glyphicons-halflings-regular.ttf') format('truetype'), url('../fonts/glyphicons-halflings-regular.svg#glyphicons_halflingsregular') format('svg');\n}*/\n.glyphicon {\n  position: relative;\n  top: 1px;\n  display: inline-block;\n  font-family: 'Glyphicons Halflings';\n  font-style: normal;\n  font-weight: normal;\n  line-height: 1;\n\n  -webkit-font-smoothing: antialiased;\n  -moz-osx-font-smoothing: grayscale;\n}\n.glyphicon-asterisk:before {\n  content: \"*\";\n}\n.glyphicon-plus:before {\n  content: \"+\";\n}\n.glyphicon-euro:before,\n.glyphicon-eur:before {\n  content: \"\\20AC\";\n}\n.glyphicon-minus:before {\n  content: \"\\2212\";\n}\n.glyphicon-cloud:before {\n  content: \"\\2601\";\n}\n.glyphicon-envelope:before {\n  content: \"\\2709\";\n}\n.glyphicon-pencil:before {\n  content: \"\\270F\";\n}\n.glyphicon-glass:before {\n  content: \"\\E001\";\n}\n.glyphicon-music:before {\n  content: \"\\E002\";\n}\n.glyphicon-search:before {\n  content: \"\\E003\";\n}\n.glyphicon-heart:before {\n  content: \"\\E005\";\n}\n.glyphicon-star:before {\n  content: \"\\E006\";\n}\n.glyphicon-star-empty:before {\n  content: \"\\E007\";\n}\n.glyphicon-user:before {\n  content: \"\\E008\";\n}\n.glyphicon-film:before {\n  content: \"\\E009\";\n}\n.glyphicon-th-large:before {\n  content: \"\\E010\";\n}\n.glyphicon-th:before {\n  content: \"\\E011\";\n}\n.glyphicon-th-list:before {\n  content: \"\\E012\";\n}\n.glyphicon-ok:before {\n  content: \"\\E013\";\n}\n.glyphicon-remove:before {\n  content: \"\\E014\";\n}\n.glyphicon-zoom-in:before {\n  content: \"\\E015\";\n}\n.glyphicon-zoom-out:before {\n  content: \"\\E016\";\n}\n.glyphicon-off:before {\n  content: \"\\E017\";\n}\n.glyphicon-signal:before {\n  content: \"\\E018\";\n}\n.glyphicon-cog:before {\n  content: \"\\E019\";\n}\n.glyphicon-trash:before {\n  content: \"\\E020\";\n}\n.glyphicon-home:before {\n  content: \"\\E021\";\n}\n.glyphicon-file:before {\n  content: \"\\E022\";\n}\n.glyphicon-time:before {\n  content: \"\\E023\";\n}\n.glyphicon-road:before {\n  content: \"\\E024\";\n}\n.glyphicon-download-alt:before {\n  content: \"\\E025\";\n}\n.glyphicon-download:before {\n  content: \"\\E026\";\n}\n.glyphicon-upload:before {\n  content: \"\\E027\";\n}\n.glyphicon-inbox:before {\n  content: \"\\E028\";\n}\n.glyphicon-play-circle:before {\n  content: \"\\E029\";\n}\n.glyphicon-repeat:before {\n  content: \"\\E030\";\n}\n.glyphicon-refresh:before {\n  content: \"\\E031\";\n}\n.glyphicon-list-alt:before {\n  content: \"\\E032\";\n}\n.glyphicon-lock:before {\n  content: \"\\E033\";\n}\n.glyphicon-flag:before {\n  content: \"\\E034\";\n}\n.glyphicon-headphones:before {\n  content: \"\\E035\";\n}\n.glyphicon-volume-off:before {\n  content: \"\\E036\";\n}\n.glyphicon-volume-down:before {\n  content: \"\\E037\";\n}\n.glyphicon-volume-up:before {\n  content: \"\\E038\";\n}\n.glyphicon-qrcode:before {\n  content: \"\\E039\";\n}\n.glyphicon-barcode:before {\n  content: \"\\E040\";\n}\n.glyphicon-tag:before {\n  content: \"\\E041\";\n}\n.glyphicon-tags:before {\n  content: \"\\E042\";\n}\n.glyphicon-book:before {\n  content: \"\\E043\";\n}\n.glyphicon-bookmark:before {\n  content: \"\\E044\";\n}\n.glyphicon-print:before {\n  content: \"\\E045\";\n}\n.glyphicon-camera:before {\n  content: \"\\E046\";\n}\n.glyphicon-font:before {\n  content: \"\\E047\";\n}\n.glyphicon-bold:before {\n  content: \"\\E048\";\n}\n.glyphicon-italic:before {\n  content: \"\\E049\";\n}\n.glyphicon-text-height:before {\n  content: \"\\E050\";\n}\n.glyphicon-text-width:before {\n  content: \"\\E051\";\n}\n.glyphicon-align-left:before {\n  content: \"\\E052\";\n}\n.glyphicon-align-center:before {\n  content: \"\\E053\";\n}\n.glyphicon-align-right:before {\n  content: \"\\E054\";\n}\n.glyphicon-align-justify:before {\n  content: \"\\E055\";\n}\n.glyphicon-list:before {\n  content: \"\\E056\";\n}\n.glyphicon-indent-left:before {\n  content: \"\\E057\";\n}\n.glyphicon-indent-right:before {\n  content: \"\\E058\";\n}\n.glyphicon-facetime-video:before {\n  content: \"\\E059\";\n}\n.glyphicon-picture:before {\n  content: \"\\E060\";\n}\n.glyphicon-map-marker:before {\n  content: \"\\E062\";\n}\n.glyphicon-adjust:before {\n  content: \"\\E063\";\n}\n.glyphicon-tint:before {\n  content: \"\\E064\";\n}\n.glyphicon-edit:before {\n  content: \"\\E065\";\n}\n.glyphicon-share:before {\n  content: \"\\E066\";\n}\n.glyphicon-check:before {\n  content: \"\\E067\";\n}\n.glyphicon-move:before {\n  content: \"\\E068\";\n}\n.glyphicon-step-backward:before {\n  content: \"\\E069\";\n}\n.glyphicon-fast-backward:before {\n  content: \"\\E070\";\n}\n.glyphicon-backward:before {\n  content: \"\\E071\";\n}\n.glyphicon-play:before {\n  content: \"\\E072\";\n}\n.glyphicon-pause:before {\n  content: \"\\E073\";\n}\n.glyphicon-stop:before {\n  content: \"\\E074\";\n}\n.glyphicon-forward:before {\n  content: \"\\E075\";\n}\n.glyphicon-fast-forward:before {\n  content: \"\\E076\";\n}\n.glyphicon-step-forward:before {\n  content: \"\\E077\";\n}\n.glyphicon-eject:before {\n  content: \"\\E078\";\n}\n.glyphicon-chevron-left:before {\n  content: \"\\E079\";\n}\n.glyphicon-chevron-right:before {\n  content: \"\\E080\";\n}\n.glyphicon-plus-sign:before {\n  content: \"\\E081\";\n}\n.glyphicon-minus-sign:before {\n  content: \"\\E082\";\n}\n.glyphicon-remove-sign:before {\n  content: \"\\E083\";\n}\n.glyphicon-ok-sign:before {\n  content: \"\\E084\";\n}\n.glyphicon-question-sign:before {\n  content: \"\\E085\";\n}\n.glyphicon-info-sign:before {\n  content: \"\\E086\";\n}\n.glyphicon-screenshot:before {\n  content: \"\\E087\";\n}\n.glyphicon-remove-circle:before {\n  content: \"\\E088\";\n}\n.glyphicon-ok-circle:before {\n  content: \"\\E089\";\n}\n.glyphicon-ban-circle:before {\n  content: \"\\E090\";\n}\n.glyphicon-arrow-left:before {\n  content: \"\\E091\";\n}\n.glyphicon-arrow-right:before {\n  content: \"\\E092\";\n}\n.glyphicon-arrow-up:before {\n  content: \"\\E093\";\n}\n.glyphicon-arrow-down:before {\n  content: \"\\E094\";\n}\n.glyphicon-share-alt:before {\n  content: \"\\E095\";\n}\n.glyphicon-resize-full:before {\n  content: \"\\E096\";\n}\n.glyphicon-resize-small:before {\n  content: \"\\E097\";\n}\n.glyphicon-exclamation-sign:before {\n  content: \"\\E101\";\n}\n.glyphicon-gift:before {\n  content: \"\\E102\";\n}\n.glyphicon-leaf:before {\n  content: \"\\E103\";\n}\n.glyphicon-fire:before {\n  content: \"\\E104\";\n}\n.glyphicon-eye-open:before {\n  content: \"\\E105\";\n}\n.glyphicon-eye-close:before {\n  content: \"\\E106\";\n}\n.glyphicon-warning-sign:before {\n  content: \"\\E107\";\n}\n.glyphicon-plane:before {\n  content: \"\\E108\";\n}\n.glyphicon-calendar:before {\n  content: \"\\E109\";\n}\n.glyphicon-random:before {\n  content: \"\\E110\";\n}\n.glyphicon-comment:before {\n  content: \"\\E111\";\n}\n.glyphicon-magnet:before {\n  content: \"\\E112\";\n}\n.glyphicon-chevron-up:before {\n  content: \"\\E113\";\n}\n.glyphicon-chevron-down:before {\n  content: \"\\E114\";\n}\n.glyphicon-retweet:before {\n  content: \"\\E115\";\n}\n.glyphicon-shopping-cart:before {\n  content: \"\\E116\";\n}\n.glyphicon-folder-close:before {\n  content: \"\\E117\";\n}\n.glyphicon-folder-open:before {\n  content: \"\\E118\";\n}\n.glyphicon-resize-vertical:before {\n  content: \"\\E119\";\n}\n.glyphicon-resize-horizontal:before {\n  content: \"\\E120\";\n}\n.glyphicon-hdd:before {\n  content: \"\\E121\";\n}\n.glyphicon-bullhorn:before {\n  content: \"\\E122\";\n}\n.glyphicon-bell:before {\n  content: \"\\E123\";\n}\n.glyphicon-certificate:before {\n  content: \"\\E124\";\n}\n.glyphicon-thumbs-up:before {\n  content: \"\\E125\";\n}\n.glyphicon-thumbs-down:before {\n  content: \"\\E126\";\n}\n.glyphicon-hand-right:before {\n  content: \"\\E127\";\n}\n.glyphicon-hand-left:before {\n  content: \"\\E128\";\n}\n.glyphicon-hand-up:before {\n  content: \"\\E129\";\n}\n.glyphicon-hand-down:before {\n  content: \"\\E130\";\n}\n.glyphicon-circle-arrow-right:before {\n  content: \"\\E131\";\n}\n.glyphicon-circle-arrow-left:before {\n  content: \"\\E132\";\n}\n.glyphicon-circle-arrow-up:before {\n  content: \"\\E133\";\n}\n.glyphicon-circle-arrow-down:before {\n  content: \"\\E134\";\n}\n.glyphicon-globe:before {\n  content: \"\\E135\";\n}\n.glyphicon-wrench:before {\n  content: \"\\E136\";\n}\n.glyphicon-tasks:before {\n  content: \"\\E137\";\n}\n.glyphicon-filter:before {\n  content: \"\\E138\";\n}\n.glyphicon-briefcase:before {\n  content: \"\\E139\";\n}\n.glyphicon-fullscreen:before {\n  content: \"\\E140\";\n}\n.glyphicon-dashboard:before {\n  content: \"\\E141\";\n}\n.glyphicon-paperclip:before {\n  content: \"\\E142\";\n}\n.glyphicon-heart-empty:before {\n  content: \"\\E143\";\n}\n.glyphicon-link:before {\n  content: \"\\E144\";\n}\n.glyphicon-phone:before {\n  content: \"\\E145\";\n}\n.glyphicon-pushpin:before {\n  content: \"\\E146\";\n}\n.glyphicon-usd:before {\n  content: \"\\E148\";\n}\n.glyphicon-gbp:before {\n  content: \"\\E149\";\n}\n.glyphicon-sort:before {\n  content: \"\\E150\";\n}\n.glyphicon-sort-by-alphabet:before {\n  content: \"\\E151\";\n}\n.glyphicon-sort-by-alphabet-alt:before {\n  content: \"\\E152\";\n}\n.glyphicon-sort-by-order:before {\n  content: \"\\E153\";\n}\n.glyphicon-sort-by-order-alt:before {\n  content: \"\\E154\";\n}\n.glyphicon-sort-by-attributes:before {\n  content: \"\\E155\";\n}\n.glyphicon-sort-by-attributes-alt:before {\n  content: \"\\E156\";\n}\n.glyphicon-unchecked:before {\n  content: \"\\E157\";\n}\n.glyphicon-expand:before {\n  content: \"\\E158\";\n}\n.glyphicon-collapse-down:before {\n  content: \"\\E159\";\n}\n.glyphicon-collapse-up:before {\n  content: \"\\E160\";\n}\n.glyphicon-log-in:before {\n  content: \"\\E161\";\n}\n.glyphicon-flash:before {\n  content: \"\\E162\";\n}\n.glyphicon-log-out:before {\n  content: \"\\E163\";\n}\n.glyphicon-new-window:before {\n  content: \"\\E164\";\n}\n.glyphicon-record:before {\n  content: \"\\E165\";\n}\n.glyphicon-save:before {\n  content: \"\\E166\";\n}\n.glyphicon-open:before {\n  content: \"\\E167\";\n}\n.glyphicon-saved:before {\n  content: \"\\E168\";\n}\n.glyphicon-import:before {\n  content: \"\\E169\";\n}\n.glyphicon-export:before {\n  content: \"\\E170\";\n}\n.glyphicon-send:before {\n  content: \"\\E171\";\n}\n.glyphicon-floppy-disk:before {\n  content: \"\\E172\";\n}\n.glyphicon-floppy-saved:before {\n  content: \"\\E173\";\n}\n.glyphicon-floppy-remove:before {\n  content: \"\\E174\";\n}\n.glyphicon-floppy-save:before {\n  content: \"\\E175\";\n}\n.glyphicon-floppy-open:before {\n  content: \"\\E176\";\n}\n.glyphicon-credit-card:before {\n  content: \"\\E177\";\n}\n.glyphicon-transfer:before {\n  content: \"\\E178\";\n}\n.glyphicon-cutlery:before {\n  content: \"\\E179\";\n}\n.glyphicon-header:before {\n  content: \"\\E180\";\n}\n.glyphicon-compressed:before {\n  content: \"\\E181\";\n}\n.glyphicon-earphone:before {\n  content: \"\\E182\";\n}\n.glyphicon-phone-alt:before {\n  content: \"\\E183\";\n}\n.glyphicon-tower:before {\n  content: \"\\E184\";\n}\n.glyphicon-stats:before {\n  content: \"\\E185\";\n}\n.glyphicon-sd-video:before {\n  content: \"\\E186\";\n}\n.glyphicon-hd-video:before {\n  content: \"\\E187\";\n}\n.glyphicon-subtitles:before {\n  content: \"\\E188\";\n}\n.glyphicon-sound-stereo:before {\n  content: \"\\E189\";\n}\n.glyphicon-sound-dolby:before {\n  content: \"\\E190\";\n}\n.glyphicon-sound-5-1:before {\n  content: \"\\E191\";\n}\n.glyphicon-sound-6-1:before {\n  content: \"\\E192\";\n}\n.glyphicon-sound-7-1:before {\n  content: \"\\E193\";\n}\n.glyphicon-copyright-mark:before {\n  content: \"\\E194\";\n}\n.glyphicon-registration-mark:before {\n  content: \"\\E195\";\n}\n.glyphicon-cloud-download:before {\n  content: \"\\E197\";\n}\n.glyphicon-cloud-upload:before {\n  content: \"\\E198\";\n}\n.glyphicon-tree-conifer:before {\n  content: \"\\E199\";\n}\n.glyphicon-tree-deciduous:before {\n  content: \"\\E200\";\n}\n.glyphicon-cd:before {\n  content: \"\\E201\";\n}\n.glyphicon-save-file:before {\n  content: \"\\E202\";\n}\n.glyphicon-open-file:before {\n  content: \"\\E203\";\n}\n.glyphicon-level-up:before {\n  content: \"\\E204\";\n}\n.glyphicon-copy:before {\n  content: \"\\E205\";\n}\n.glyphicon-paste:before {\n  content: \"\\E206\";\n}\n.glyphicon-alert:before {\n  content: \"\\E209\";\n}\n.glyphicon-equalizer:before {\n  content: \"\\E210\";\n}\n.glyphicon-king:before {\n  content: \"\\E211\";\n}\n.glyphicon-queen:before {\n  content: \"\\E212\";\n}\n.glyphicon-pawn:before {\n  content: \"\\E213\";\n}\n.glyphicon-bishop:before {\n  content: \"\\E214\";\n}\n.glyphicon-knight:before {\n  content: \"\\E215\";\n}\n.glyphicon-baby-formula:before {\n  content: \"\\E216\";\n}\n.glyphicon-tent:before {\n  content: \"\\26FA\";\n}\n.glyphicon-blackboard:before {\n  content: \"\\E218\";\n}\n.glyphicon-bed:before {\n  content: \"\\E219\";\n}\n.glyphicon-apple:before {\n  content: \"\\F8FF\";\n}\n.glyphicon-erase:before {\n  content: \"\\E221\";\n}\n.glyphicon-hourglass:before {\n  content: \"\\231B\";\n}\n.glyphicon-lamp:before {\n  content: \"\\E223\";\n}\n.glyphicon-duplicate:before {\n  content: \"\\E224\";\n}\n.glyphicon-piggy-bank:before {\n  content: \"\\E225\";\n}\n.glyphicon-scissors:before {\n  content: \"\\E226\";\n}\n.glyphicon-bitcoin:before {\n  content: \"\\E227\";\n}\n.glyphicon-btc:before {\n  content: \"\\E227\";\n}\n.glyphicon-xbt:before {\n  content: \"\\E227\";\n}\n.glyphicon-yen:before {\n  content: \"\\A5\";\n}\n.glyphicon-jpy:before {\n  content: \"\\A5\";\n}\n.glyphicon-ruble:before {\n  content: \"\\20BD\";\n}\n.glyphicon-rub:before {\n  content: \"\\20BD\";\n}\n.glyphicon-scale:before {\n  content: \"\\E230\";\n}\n.glyphicon-ice-lolly:before {\n  content: \"\\E231\";\n}\n.glyphicon-ice-lolly-tasted:before {\n  content: \"\\E232\";\n}\n.glyphicon-education:before {\n  content: \"\\E233\";\n}\n.glyphicon-option-horizontal:before {\n  content: \"\\E234\";\n}\n.glyphicon-option-vertical:before {\n  content: \"\\E235\";\n}\n.glyphicon-menu-hamburger:before {\n  content: \"\\E236\";\n}\n.glyphicon-modal-window:before {\n  content: \"\\E237\";\n}\n.glyphicon-oil:before {\n  content: \"\\E238\";\n}\n.glyphicon-grain:before {\n  content: \"\\E239\";\n}\n.glyphicon-sunglasses:before {\n  content: \"\\E240\";\n}\n.glyphicon-text-size:before {\n  content: \"\\E241\";\n}\n.glyphicon-text-color:before {\n  content: \"\\E242\";\n}\n.glyphicon-text-background:before {\n  content: \"\\E243\";\n}\n.glyphicon-object-align-top:before {\n  content: \"\\E244\";\n}\n.glyphicon-object-align-bottom:before {\n  content: \"\\E245\";\n}\n.glyphicon-object-align-horizontal:before {\n  content: \"\\E246\";\n}\n.glyphicon-object-align-left:before {\n  content: \"\\E247\";\n}\n.glyphicon-object-align-vertical:before {\n  content: \"\\E248\";\n}\n.glyphicon-object-align-right:before {\n  content: \"\\E249\";\n}\n.glyphicon-triangle-right:before {\n  content: \"\\E250\";\n}\n.glyphicon-triangle-left:before {\n  content: \"\\E251\";\n}\n.glyphicon-triangle-bottom:before {\n  content: \"\\E252\";\n}\n.glyphicon-triangle-top:before {\n  content: \"\\E253\";\n}\n.glyphicon-console:before {\n  content: \"\\E254\";\n}\n.glyphicon-superscript:before {\n  content: \"\\E255\";\n}\n.glyphicon-subscript:before {\n  content: \"\\E256\";\n}\n.glyphicon-menu-left:before {\n  content: \"\\E257\";\n}\n.glyphicon-menu-right:before {\n  content: \"\\E258\";\n}\n.glyphicon-menu-down:before {\n  content: \"\\E259\";\n}\n.glyphicon-menu-up:before {\n  content: \"\\E260\";\n}\n* {\n  -webkit-box-sizing: border-box;\n     -moz-box-sizing: border-box;\n          box-sizing: border-box;\n}\n*:before,\n*:after {\n  -webkit-box-sizing: border-box;\n     -moz-box-sizing: border-box;\n          box-sizing: border-box;\n}\nhtml {\n  font-size: 10px;\n\n  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);\n}\nbody {\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #333;\n  background-color: #fff;\n}\ninput,\nbutton,\nselect,\ntextarea {\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\na {\n  color: #337ab7;\n  text-decoration: none;\n}\na:hover,\na:focus {\n  color: #23527c;\n  text-decoration: underline;\n}\na:focus {\n  outline: thin dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\nfigure {\n  margin: 0;\n}\nimg {\n  vertical-align: middle;\n}\n.img-responsive,\n.thumbnail > img,\n.thumbnail a > img,\n.carousel-inner > .item > img,\n.carousel-inner > .item > a > img {\n  display: block;\n  max-width: 100%;\n  height: auto;\n}\n.img-rounded {\n  border-radius: 6px;\n}\n.img-thumbnail {\n  display: inline-block;\n  max-width: 100%;\n  height: auto;\n  padding: 4px;\n  line-height: 1.42857143;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  -webkit-transition: all .2s ease-in-out;\n       -o-transition: all .2s ease-in-out;\n          transition: all .2s ease-in-out;\n}\n.img-circle {\n  border-radius: 50%;\n}\nhr {\n  margin-top: 20px;\n  margin-bottom: 20px;\n  border: 0;\n  border-top: 1px solid #eee;\n}\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  border: 0;\n}\n.sr-only-focusable:active,\n.sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  margin: 0;\n  overflow: visible;\n  clip: auto;\n}\n[role=\"button\"] {\n  cursor: pointer;\n}\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\n.h1,\n.h2,\n.h3,\n.h4,\n.h5,\n.h6 {\n  font-family: inherit;\n  font-weight: 500;\n  line-height: 1.1;\n  color: inherit;\n}\nh1 small,\nh2 small,\nh3 small,\nh4 small,\nh5 small,\nh6 small,\n.h1 small,\n.h2 small,\n.h3 small,\n.h4 small,\n.h5 small,\n.h6 small,\nh1 .small,\nh2 .small,\nh3 .small,\nh4 .small,\nh5 .small,\nh6 .small,\n.h1 .small,\n.h2 .small,\n.h3 .small,\n.h4 .small,\n.h5 .small,\n.h6 .small {\n  font-weight: normal;\n  line-height: 1;\n  color: #777;\n}\nh1,\n.h1,\nh2,\n.h2,\nh3,\n.h3 {\n  margin-top: 20px;\n  margin-bottom: 10px;\n}\nh1 small,\n.h1 small,\nh2 small,\n.h2 small,\nh3 small,\n.h3 small,\nh1 .small,\n.h1 .small,\nh2 .small,\n.h2 .small,\nh3 .small,\n.h3 .small {\n  font-size: 65%;\n}\nh4,\n.h4,\nh5,\n.h5,\nh6,\n.h6 {\n  margin-top: 10px;\n  margin-bottom: 10px;\n}\nh4 small,\n.h4 small,\nh5 small,\n.h5 small,\nh6 small,\n.h6 small,\nh4 .small,\n.h4 .small,\nh5 .small,\n.h5 .small,\nh6 .small,\n.h6 .small {\n  font-size: 75%;\n}\nh1,\n.h1 {\n  font-size: 36px;\n}\nh2,\n.h2 {\n  font-size: 30px;\n}\nh3,\n.h3 {\n  font-size: 24px;\n}\nh4,\n.h4 {\n  font-size: 18px;\n}\nh5,\n.h5 {\n  font-size: 14px;\n}\nh6,\n.h6 {\n  font-size: 12px;\n}\np {\n  margin: 0 0 10px;\n}\n.lead {\n  margin-bottom: 20px;\n  font-size: 16px;\n  font-weight: 300;\n  line-height: 1.4;\n}\n@media (min-width: 768px) {\n  .lead {\n    font-size: 21px;\n  }\n}\nsmall,\n.small {\n  font-size: 85%;\n}\nmark,\n.mark {\n  padding: .2em;\n  background-color: #fcf8e3;\n}\n.text-left {\n  text-align: left;\n}\n.text-right {\n  text-align: right;\n}\n.text-center {\n  text-align: center;\n}\n.text-justify {\n  text-align: justify;\n}\n.text-nowrap {\n  white-space: nowrap;\n}\n.text-lowercase {\n  text-transform: lowercase;\n}\n.text-uppercase {\n  text-transform: uppercase;\n}\n.text-capitalize {\n  text-transform: capitalize;\n}\n.text-muted {\n  color: #777;\n}\n.text-primary {\n  color: #337ab7;\n}\na.text-primary:hover,\na.text-primary:focus {\n  color: #286090;\n}\n.text-success {\n  color: #3c763d;\n}\na.text-success:hover,\na.text-success:focus {\n  color: #2b542c;\n}\n.text-info {\n  color: #31708f;\n}\na.text-info:hover,\na.text-info:focus {\n  color: #245269;\n}\n.text-warning {\n  color: #8a6d3b;\n}\na.text-warning:hover,\na.text-warning:focus {\n  color: #66512c;\n}\n.text-danger {\n  color: #a94442;\n}\na.text-danger:hover,\na.text-danger:focus {\n  color: #843534;\n}\n.bg-primary {\n  color: #fff;\n  background-color: #337ab7;\n}\na.bg-primary:hover,\na.bg-primary:focus {\n  background-color: #286090;\n}\n.bg-success {\n  background-color: #dff0d8;\n}\na.bg-success:hover,\na.bg-success:focus {\n  background-color: #c1e2b3;\n}\n.bg-info {\n  background-color: #d9edf7;\n}\na.bg-info:hover,\na.bg-info:focus {\n  background-color: #afd9ee;\n}\n.bg-warning {\n  background-color: #fcf8e3;\n}\na.bg-warning:hover,\na.bg-warning:focus {\n  background-color: #f7ecb5;\n}\n.bg-danger {\n  background-color: #f2dede;\n}\na.bg-danger:hover,\na.bg-danger:focus {\n  background-color: #e4b9b9;\n}\n.page-header {\n  padding-bottom: 9px;\n  margin: 40px 0 20px;\n  border-bottom: 1px solid #eee;\n}\nul,\nol {\n  margin-top: 0;\n  margin-bottom: 10px;\n}\nul ul,\nol ul,\nul ol,\nol ol {\n  margin-bottom: 0;\n}\n.list-unstyled {\n  padding-left: 0;\n  list-style: none;\n}\n.list-inline {\n  padding-left: 0;\n  margin-left: -5px;\n  list-style: none;\n}\n.list-inline > li {\n  display: inline-block;\n  padding-right: 5px;\n  padding-left: 5px;\n}\ndl {\n  margin-top: 0;\n  margin-bottom: 20px;\n}\ndt,\ndd {\n  line-height: 1.42857143;\n}\ndt {\n  font-weight: bold;\n}\ndd {\n  margin-left: 0;\n}\n@media (min-width: 768px) {\n  .dl-horizontal dt {\n    float: left;\n    width: 160px;\n    overflow: hidden;\n    clear: left;\n    text-align: right;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  }\n  .dl-horizontal dd {\n    margin-left: 180px;\n  }\n}\nabbr[title],\nabbr[data-original-title] {\n  cursor: help;\n  border-bottom: 1px dotted #777;\n}\n.initialism {\n  font-size: 90%;\n  text-transform: uppercase;\n}\nblockquote {\n  padding: 10px 20px;\n  margin: 0 0 20px;\n  font-size: 17.5px;\n  border-left: 5px solid #eee;\n}\nblockquote p:last-child,\nblockquote ul:last-child,\nblockquote ol:last-child {\n  margin-bottom: 0;\n}\nblockquote footer,\nblockquote small,\nblockquote .small {\n  display: block;\n  font-size: 80%;\n  line-height: 1.42857143;\n  color: #777;\n}\nblockquote footer:before,\nblockquote small:before,\nblockquote .small:before {\n  content: '\\2014   \\A0';\n}\n.blockquote-reverse,\nblockquote.pull-right {\n  padding-right: 15px;\n  padding-left: 0;\n  text-align: right;\n  border-right: 5px solid #eee;\n  border-left: 0;\n}\n.blockquote-reverse footer:before,\nblockquote.pull-right footer:before,\n.blockquote-reverse small:before,\nblockquote.pull-right small:before,\n.blockquote-reverse .small:before,\nblockquote.pull-right .small:before {\n  content: '';\n}\n.blockquote-reverse footer:after,\nblockquote.pull-right footer:after,\n.blockquote-reverse small:after,\nblockquote.pull-right small:after,\n.blockquote-reverse .small:after,\nblockquote.pull-right .small:after {\n  content: '\\A0   \\2014';\n}\naddress {\n  margin-bottom: 20px;\n  font-style: normal;\n  line-height: 1.42857143;\n}\ncode,\nkbd,\npre,\nsamp {\n  font-family: Menlo, Monaco, Consolas, \"Courier New\", monospace;\n}\ncode {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #c7254e;\n  background-color: #f9f2f4;\n  border-radius: 4px;\n}\nkbd {\n  padding: 2px 4px;\n  font-size: 90%;\n  color: #fff;\n  background-color: #333;\n  border-radius: 3px;\n  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .25);\n          box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .25);\n}\nkbd kbd {\n  padding: 0;\n  font-size: 100%;\n  font-weight: bold;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n}\npre {\n  display: block;\n  padding: 9.5px;\n  margin: 0 0 10px;\n  font-size: 13px;\n  line-height: 1.42857143;\n  color: #333;\n  word-break: break-all;\n  word-wrap: break-word;\n  background-color: #f5f5f5;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n}\npre code {\n  padding: 0;\n  font-size: inherit;\n  color: inherit;\n  white-space: pre-wrap;\n  background-color: transparent;\n  border-radius: 0;\n}\n.pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll;\n}\n.container {\n  padding-right: 15px;\n  padding-left: 15px;\n  margin-right: auto;\n  margin-left: auto;\n}\n@media (min-width: 768px) {\n  .container {\n    width: 750px;\n  }\n}\n@media (min-width: 992px) {\n  .container {\n    width: 970px;\n  }\n}\n@media (min-width: 1200px) {\n  .container {\n    width: 1170px;\n  }\n}\n.container-fluid {\n  padding-right: 15px;\n  padding-left: 15px;\n  margin-right: auto;\n  margin-left: auto;\n}\n.row {\n  margin-right: -15px;\n  margin-left: -15px;\n}\n.col-xs-1, .col-sm-1, .col-md-1, .col-lg-1, .col-xs-2, .col-sm-2, .col-md-2, .col-lg-2, .col-xs-3, .col-sm-3, .col-md-3, .col-lg-3, .col-xs-4, .col-sm-4, .col-md-4, .col-lg-4, .col-xs-5, .col-sm-5, .col-md-5, .col-lg-5, .col-xs-6, .col-sm-6, .col-md-6, .col-lg-6, .col-xs-7, .col-sm-7, .col-md-7, .col-lg-7, .col-xs-8, .col-sm-8, .col-md-8, .col-lg-8, .col-xs-9, .col-sm-9, .col-md-9, .col-lg-9, .col-xs-10, .col-sm-10, .col-md-10, .col-lg-10, .col-xs-11, .col-sm-11, .col-md-11, .col-lg-11, .col-xs-12, .col-sm-12, .col-md-12, .col-lg-12 {\n  position: relative;\n  min-height: 1px;\n  padding-right: 15px;\n  padding-left: 15px;\n}\n.col-xs-1, .col-xs-2, .col-xs-3, .col-xs-4, .col-xs-5, .col-xs-6, .col-xs-7, .col-xs-8, .col-xs-9, .col-xs-10, .col-xs-11, .col-xs-12 {\n  float: left;\n}\n.col-xs-12 {\n  width: 100%;\n}\n.col-xs-11 {\n  width: 91.66666667%;\n}\n.col-xs-10 {\n  width: 83.33333333%;\n}\n.col-xs-9 {\n  width: 75%;\n}\n.col-xs-8 {\n  width: 66.66666667%;\n}\n.col-xs-7 {\n  width: 58.33333333%;\n}\n.col-xs-6 {\n  width: 50%;\n}\n.col-xs-5 {\n  width: 41.66666667%;\n}\n.col-xs-4 {\n  width: 33.33333333%;\n}\n.col-xs-3 {\n  width: 25%;\n}\n.col-xs-2 {\n  width: 16.66666667%;\n}\n.col-xs-1 {\n  width: 8.33333333%;\n}\n.col-xs-pull-12 {\n  right: 100%;\n}\n.col-xs-pull-11 {\n  right: 91.66666667%;\n}\n.col-xs-pull-10 {\n  right: 83.33333333%;\n}\n.col-xs-pull-9 {\n  right: 75%;\n}\n.col-xs-pull-8 {\n  right: 66.66666667%;\n}\n.col-xs-pull-7 {\n  right: 58.33333333%;\n}\n.col-xs-pull-6 {\n  right: 50%;\n}\n.col-xs-pull-5 {\n  right: 41.66666667%;\n}\n.col-xs-pull-4 {\n  right: 33.33333333%;\n}\n.col-xs-pull-3 {\n  right: 25%;\n}\n.col-xs-pull-2 {\n  right: 16.66666667%;\n}\n.col-xs-pull-1 {\n  right: 8.33333333%;\n}\n.col-xs-pull-0 {\n  right: auto;\n}\n.col-xs-push-12 {\n  left: 100%;\n}\n.col-xs-push-11 {\n  left: 91.66666667%;\n}\n.col-xs-push-10 {\n  left: 83.33333333%;\n}\n.col-xs-push-9 {\n  left: 75%;\n}\n.col-xs-push-8 {\n  left: 66.66666667%;\n}\n.col-xs-push-7 {\n  left: 58.33333333%;\n}\n.col-xs-push-6 {\n  left: 50%;\n}\n.col-xs-push-5 {\n  left: 41.66666667%;\n}\n.col-xs-push-4 {\n  left: 33.33333333%;\n}\n.col-xs-push-3 {\n  left: 25%;\n}\n.col-xs-push-2 {\n  left: 16.66666667%;\n}\n.col-xs-push-1 {\n  left: 8.33333333%;\n}\n.col-xs-push-0 {\n  left: auto;\n}\n.col-xs-offset-12 {\n  margin-left: 100%;\n}\n.col-xs-offset-11 {\n  margin-left: 91.66666667%;\n}\n.col-xs-offset-10 {\n  margin-left: 83.33333333%;\n}\n.col-xs-offset-9 {\n  margin-left: 75%;\n}\n.col-xs-offset-8 {\n  margin-left: 66.66666667%;\n}\n.col-xs-offset-7 {\n  margin-left: 58.33333333%;\n}\n.col-xs-offset-6 {\n  margin-left: 50%;\n}\n.col-xs-offset-5 {\n  margin-left: 41.66666667%;\n}\n.col-xs-offset-4 {\n  margin-left: 33.33333333%;\n}\n.col-xs-offset-3 {\n  margin-left: 25%;\n}\n.col-xs-offset-2 {\n  margin-left: 16.66666667%;\n}\n.col-xs-offset-1 {\n  margin-left: 8.33333333%;\n}\n.col-xs-offset-0 {\n  margin-left: 0;\n}\n@media (min-width: 768px) {\n  .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12 {\n    float: left;\n  }\n  .col-sm-12 {\n    width: 100%;\n  }\n  .col-sm-11 {\n    width: 91.66666667%;\n  }\n  .col-sm-10 {\n    width: 83.33333333%;\n  }\n  .col-sm-9 {\n    width: 75%;\n  }\n  .col-sm-8 {\n    width: 66.66666667%;\n  }\n  .col-sm-7 {\n    width: 58.33333333%;\n  }\n  .col-sm-6 {\n    width: 50%;\n  }\n  .col-sm-5 {\n    width: 41.66666667%;\n  }\n  .col-sm-4 {\n    width: 33.33333333%;\n  }\n  .col-sm-3 {\n    width: 25%;\n  }\n  .col-sm-2 {\n    width: 16.66666667%;\n  }\n  .col-sm-1 {\n    width: 8.33333333%;\n  }\n  .col-sm-pull-12 {\n    right: 100%;\n  }\n  .col-sm-pull-11 {\n    right: 91.66666667%;\n  }\n  .col-sm-pull-10 {\n    right: 83.33333333%;\n  }\n  .col-sm-pull-9 {\n    right: 75%;\n  }\n  .col-sm-pull-8 {\n    right: 66.66666667%;\n  }\n  .col-sm-pull-7 {\n    right: 58.33333333%;\n  }\n  .col-sm-pull-6 {\n    right: 50%;\n  }\n  .col-sm-pull-5 {\n    right: 41.66666667%;\n  }\n  .col-sm-pull-4 {\n    right: 33.33333333%;\n  }\n  .col-sm-pull-3 {\n    right: 25%;\n  }\n  .col-sm-pull-2 {\n    right: 16.66666667%;\n  }\n  .col-sm-pull-1 {\n    right: 8.33333333%;\n  }\n  .col-sm-pull-0 {\n    right: auto;\n  }\n  .col-sm-push-12 {\n    left: 100%;\n  }\n  .col-sm-push-11 {\n    left: 91.66666667%;\n  }\n  .col-sm-push-10 {\n    left: 83.33333333%;\n  }\n  .col-sm-push-9 {\n    left: 75%;\n  }\n  .col-sm-push-8 {\n    left: 66.66666667%;\n  }\n  .col-sm-push-7 {\n    left: 58.33333333%;\n  }\n  .col-sm-push-6 {\n    left: 50%;\n  }\n  .col-sm-push-5 {\n    left: 41.66666667%;\n  }\n  .col-sm-push-4 {\n    left: 33.33333333%;\n  }\n  .col-sm-push-3 {\n    left: 25%;\n  }\n  .col-sm-push-2 {\n    left: 16.66666667%;\n  }\n  .col-sm-push-1 {\n    left: 8.33333333%;\n  }\n  .col-sm-push-0 {\n    left: auto;\n  }\n  .col-sm-offset-12 {\n    margin-left: 100%;\n  }\n  .col-sm-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .col-sm-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .col-sm-offset-9 {\n    margin-left: 75%;\n  }\n  .col-sm-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .col-sm-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .col-sm-offset-6 {\n    margin-left: 50%;\n  }\n  .col-sm-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .col-sm-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .col-sm-offset-3 {\n    margin-left: 25%;\n  }\n  .col-sm-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .col-sm-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .col-sm-offset-0 {\n    margin-left: 0;\n  }\n}\n@media (min-width: 992px) {\n  .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12 {\n    float: left;\n  }\n  .col-md-12 {\n    width: 100%;\n  }\n  .col-md-11 {\n    width: 91.66666667%;\n  }\n  .col-md-10 {\n    width: 83.33333333%;\n  }\n  .col-md-9 {\n    width: 75%;\n  }\n  .col-md-8 {\n    width: 66.66666667%;\n  }\n  .col-md-7 {\n    width: 58.33333333%;\n  }\n  .col-md-6 {\n    width: 50%;\n  }\n  .col-md-5 {\n    width: 41.66666667%;\n  }\n  .col-md-4 {\n    width: 33.33333333%;\n  }\n  .col-md-3 {\n    width: 25%;\n  }\n  .col-md-2 {\n    width: 16.66666667%;\n  }\n  .col-md-1 {\n    width: 8.33333333%;\n  }\n  .col-md-pull-12 {\n    right: 100%;\n  }\n  .col-md-pull-11 {\n    right: 91.66666667%;\n  }\n  .col-md-pull-10 {\n    right: 83.33333333%;\n  }\n  .col-md-pull-9 {\n    right: 75%;\n  }\n  .col-md-pull-8 {\n    right: 66.66666667%;\n  }\n  .col-md-pull-7 {\n    right: 58.33333333%;\n  }\n  .col-md-pull-6 {\n    right: 50%;\n  }\n  .col-md-pull-5 {\n    right: 41.66666667%;\n  }\n  .col-md-pull-4 {\n    right: 33.33333333%;\n  }\n  .col-md-pull-3 {\n    right: 25%;\n  }\n  .col-md-pull-2 {\n    right: 16.66666667%;\n  }\n  .col-md-pull-1 {\n    right: 8.33333333%;\n  }\n  .col-md-pull-0 {\n    right: auto;\n  }\n  .col-md-push-12 {\n    left: 100%;\n  }\n  .col-md-push-11 {\n    left: 91.66666667%;\n  }\n  .col-md-push-10 {\n    left: 83.33333333%;\n  }\n  .col-md-push-9 {\n    left: 75%;\n  }\n  .col-md-push-8 {\n    left: 66.66666667%;\n  }\n  .col-md-push-7 {\n    left: 58.33333333%;\n  }\n  .col-md-push-6 {\n    left: 50%;\n  }\n  .col-md-push-5 {\n    left: 41.66666667%;\n  }\n  .col-md-push-4 {\n    left: 33.33333333%;\n  }\n  .col-md-push-3 {\n    left: 25%;\n  }\n  .col-md-push-2 {\n    left: 16.66666667%;\n  }\n  .col-md-push-1 {\n    left: 8.33333333%;\n  }\n  .col-md-push-0 {\n    left: auto;\n  }\n  .col-md-offset-12 {\n    margin-left: 100%;\n  }\n  .col-md-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .col-md-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .col-md-offset-9 {\n    margin-left: 75%;\n  }\n  .col-md-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .col-md-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .col-md-offset-6 {\n    margin-left: 50%;\n  }\n  .col-md-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .col-md-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .col-md-offset-3 {\n    margin-left: 25%;\n  }\n  .col-md-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .col-md-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .col-md-offset-0 {\n    margin-left: 0;\n  }\n}\n@media (min-width: 1200px) {\n  .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12 {\n    float: left;\n  }\n  .col-lg-12 {\n    width: 100%;\n  }\n  .col-lg-11 {\n    width: 91.66666667%;\n  }\n  .col-lg-10 {\n    width: 83.33333333%;\n  }\n  .col-lg-9 {\n    width: 75%;\n  }\n  .col-lg-8 {\n    width: 66.66666667%;\n  }\n  .col-lg-7 {\n    width: 58.33333333%;\n  }\n  .col-lg-6 {\n    width: 50%;\n  }\n  .col-lg-5 {\n    width: 41.66666667%;\n  }\n  .col-lg-4 {\n    width: 33.33333333%;\n  }\n  .col-lg-3 {\n    width: 25%;\n  }\n  .col-lg-2 {\n    width: 16.66666667%;\n  }\n  .col-lg-1 {\n    width: 8.33333333%;\n  }\n  .col-lg-pull-12 {\n    right: 100%;\n  }\n  .col-lg-pull-11 {\n    right: 91.66666667%;\n  }\n  .col-lg-pull-10 {\n    right: 83.33333333%;\n  }\n  .col-lg-pull-9 {\n    right: 75%;\n  }\n  .col-lg-pull-8 {\n    right: 66.66666667%;\n  }\n  .col-lg-pull-7 {\n    right: 58.33333333%;\n  }\n  .col-lg-pull-6 {\n    right: 50%;\n  }\n  .col-lg-pull-5 {\n    right: 41.66666667%;\n  }\n  .col-lg-pull-4 {\n    right: 33.33333333%;\n  }\n  .col-lg-pull-3 {\n    right: 25%;\n  }\n  .col-lg-pull-2 {\n    right: 16.66666667%;\n  }\n  .col-lg-pull-1 {\n    right: 8.33333333%;\n  }\n  .col-lg-pull-0 {\n    right: auto;\n  }\n  .col-lg-push-12 {\n    left: 100%;\n  }\n  .col-lg-push-11 {\n    left: 91.66666667%;\n  }\n  .col-lg-push-10 {\n    left: 83.33333333%;\n  }\n  .col-lg-push-9 {\n    left: 75%;\n  }\n  .col-lg-push-8 {\n    left: 66.66666667%;\n  }\n  .col-lg-push-7 {\n    left: 58.33333333%;\n  }\n  .col-lg-push-6 {\n    left: 50%;\n  }\n  .col-lg-push-5 {\n    left: 41.66666667%;\n  }\n  .col-lg-push-4 {\n    left: 33.33333333%;\n  }\n  .col-lg-push-3 {\n    left: 25%;\n  }\n  .col-lg-push-2 {\n    left: 16.66666667%;\n  }\n  .col-lg-push-1 {\n    left: 8.33333333%;\n  }\n  .col-lg-push-0 {\n    left: auto;\n  }\n  .col-lg-offset-12 {\n    margin-left: 100%;\n  }\n  .col-lg-offset-11 {\n    margin-left: 91.66666667%;\n  }\n  .col-lg-offset-10 {\n    margin-left: 83.33333333%;\n  }\n  .col-lg-offset-9 {\n    margin-left: 75%;\n  }\n  .col-lg-offset-8 {\n    margin-left: 66.66666667%;\n  }\n  .col-lg-offset-7 {\n    margin-left: 58.33333333%;\n  }\n  .col-lg-offset-6 {\n    margin-left: 50%;\n  }\n  .col-lg-offset-5 {\n    margin-left: 41.66666667%;\n  }\n  .col-lg-offset-4 {\n    margin-left: 33.33333333%;\n  }\n  .col-lg-offset-3 {\n    margin-left: 25%;\n  }\n  .col-lg-offset-2 {\n    margin-left: 16.66666667%;\n  }\n  .col-lg-offset-1 {\n    margin-left: 8.33333333%;\n  }\n  .col-lg-offset-0 {\n    margin-left: 0;\n  }\n}\ntable {\n  background-color: transparent;\n}\ncaption {\n  padding-top: 8px;\n  padding-bottom: 8px;\n  color: #777;\n  text-align: left;\n}\nth {\n  text-align: left;\n}\n.table {\n  width: 100%;\n  max-width: 100%;\n  margin-bottom: 20px;\n}\n.table > thead > tr > th,\n.table > tbody > tr > th,\n.table > tfoot > tr > th,\n.table > thead > tr > td,\n.table > tbody > tr > td,\n.table > tfoot > tr > td {\n  padding: 8px;\n  line-height: 1.42857143;\n  vertical-align: top;\n  border-top: 1px solid #ddd;\n}\n.table > thead > tr > th {\n  vertical-align: bottom;\n  border-bottom: 2px solid #ddd;\n}\n.table > caption + thead > tr:first-child > th,\n.table > colgroup + thead > tr:first-child > th,\n.table > thead:first-child > tr:first-child > th,\n.table > caption + thead > tr:first-child > td,\n.table > colgroup + thead > tr:first-child > td,\n.table > thead:first-child > tr:first-child > td {\n  border-top: 0;\n}\n.table > tbody + tbody {\n  border-top: 2px solid #ddd;\n}\n.table .table {\n  background-color: #fff;\n}\n.table-condensed > thead > tr > th,\n.table-condensed > tbody > tr > th,\n.table-condensed > tfoot > tr > th,\n.table-condensed > thead > tr > td,\n.table-condensed > tbody > tr > td,\n.table-condensed > tfoot > tr > td {\n  padding: 5px;\n}\n.table-bordered {\n  border: 1px solid #ddd;\n}\n.table-bordered > thead > tr > th,\n.table-bordered > tbody > tr > th,\n.table-bordered > tfoot > tr > th,\n.table-bordered > thead > tr > td,\n.table-bordered > tbody > tr > td,\n.table-bordered > tfoot > tr > td {\n  border: 1px solid #ddd;\n}\n.table-bordered > thead > tr > th,\n.table-bordered > thead > tr > td {\n  border-bottom-width: 2px;\n}\n.table-striped > tbody > tr:nth-of-type(odd) {\n  background-color: #f9f9f9;\n}\n.table-hover > tbody > tr:hover {\n  background-color: #f5f5f5;\n}\ntable col[class*=\"col-\"] {\n  position: static;\n  display: table-column;\n  float: none;\n}\ntable td[class*=\"col-\"],\ntable th[class*=\"col-\"] {\n  position: static;\n  display: table-cell;\n  float: none;\n}\n.table > thead > tr > td.active,\n.table > tbody > tr > td.active,\n.table > tfoot > tr > td.active,\n.table > thead > tr > th.active,\n.table > tbody > tr > th.active,\n.table > tfoot > tr > th.active,\n.table > thead > tr.active > td,\n.table > tbody > tr.active > td,\n.table > tfoot > tr.active > td,\n.table > thead > tr.active > th,\n.table > tbody > tr.active > th,\n.table > tfoot > tr.active > th {\n  background-color: #f5f5f5;\n}\n.table-hover > tbody > tr > td.active:hover,\n.table-hover > tbody > tr > th.active:hover,\n.table-hover > tbody > tr.active:hover > td,\n.table-hover > tbody > tr:hover > .active,\n.table-hover > tbody > tr.active:hover > th {\n  background-color: #e8e8e8;\n}\n.table > thead > tr > td.success,\n.table > tbody > tr > td.success,\n.table > tfoot > tr > td.success,\n.table > thead > tr > th.success,\n.table > tbody > tr > th.success,\n.table > tfoot > tr > th.success,\n.table > thead > tr.success > td,\n.table > tbody > tr.success > td,\n.table > tfoot > tr.success > td,\n.table > thead > tr.success > th,\n.table > tbody > tr.success > th,\n.table > tfoot > tr.success > th {\n  background-color: #dff0d8;\n}\n.table-hover > tbody > tr > td.success:hover,\n.table-hover > tbody > tr > th.success:hover,\n.table-hover > tbody > tr.success:hover > td,\n.table-hover > tbody > tr:hover > .success,\n.table-hover > tbody > tr.success:hover > th {\n  background-color: #d0e9c6;\n}\n.table > thead > tr > td.info,\n.table > tbody > tr > td.info,\n.table > tfoot > tr > td.info,\n.table > thead > tr > th.info,\n.table > tbody > tr > th.info,\n.table > tfoot > tr > th.info,\n.table > thead > tr.info > td,\n.table > tbody > tr.info > td,\n.table > tfoot > tr.info > td,\n.table > thead > tr.info > th,\n.table > tbody > tr.info > th,\n.table > tfoot > tr.info > th {\n  background-color: #d9edf7;\n}\n.table-hover > tbody > tr > td.info:hover,\n.table-hover > tbody > tr > th.info:hover,\n.table-hover > tbody > tr.info:hover > td,\n.table-hover > tbody > tr:hover > .info,\n.table-hover > tbody > tr.info:hover > th {\n  background-color: #c4e3f3;\n}\n.table > thead > tr > td.warning,\n.table > tbody > tr > td.warning,\n.table > tfoot > tr > td.warning,\n.table > thead > tr > th.warning,\n.table > tbody > tr > th.warning,\n.table > tfoot > tr > th.warning,\n.table > thead > tr.warning > td,\n.table > tbody > tr.warning > td,\n.table > tfoot > tr.warning > td,\n.table > thead > tr.warning > th,\n.table > tbody > tr.warning > th,\n.table > tfoot > tr.warning > th {\n  background-color: #fcf8e3;\n}\n.table-hover > tbody > tr > td.warning:hover,\n.table-hover > tbody > tr > th.warning:hover,\n.table-hover > tbody > tr.warning:hover > td,\n.table-hover > tbody > tr:hover > .warning,\n.table-hover > tbody > tr.warning:hover > th {\n  background-color: #faf2cc;\n}\n.table > thead > tr > td.danger,\n.table > tbody > tr > td.danger,\n.table > tfoot > tr > td.danger,\n.table > thead > tr > th.danger,\n.table > tbody > tr > th.danger,\n.table > tfoot > tr > th.danger,\n.table > thead > tr.danger > td,\n.table > tbody > tr.danger > td,\n.table > tfoot > tr.danger > td,\n.table > thead > tr.danger > th,\n.table > tbody > tr.danger > th,\n.table > tfoot > tr.danger > th {\n  background-color: #f2dede;\n}\n.table-hover > tbody > tr > td.danger:hover,\n.table-hover > tbody > tr > th.danger:hover,\n.table-hover > tbody > tr.danger:hover > td,\n.table-hover > tbody > tr:hover > .danger,\n.table-hover > tbody > tr.danger:hover > th {\n  background-color: #ebcccc;\n}\n.table-responsive {\n  min-height: .01%;\n  overflow-x: auto;\n}\n@media screen and (max-width: 767px) {\n  .table-responsive {\n    width: 100%;\n    margin-bottom: 15px;\n    overflow-y: hidden;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n    border: 1px solid #ddd;\n  }\n  .table-responsive > .table {\n    margin-bottom: 0;\n  }\n  .table-responsive > .table > thead > tr > th,\n  .table-responsive > .table > tbody > tr > th,\n  .table-responsive > .table > tfoot > tr > th,\n  .table-responsive > .table > thead > tr > td,\n  .table-responsive > .table > tbody > tr > td,\n  .table-responsive > .table > tfoot > tr > td {\n    white-space: nowrap;\n  }\n  .table-responsive > .table-bordered {\n    border: 0;\n  }\n  .table-responsive > .table-bordered > thead > tr > th:first-child,\n  .table-responsive > .table-bordered > tbody > tr > th:first-child,\n  .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n  .table-responsive > .table-bordered > thead > tr > td:first-child,\n  .table-responsive > .table-bordered > tbody > tr > td:first-child,\n  .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n    border-left: 0;\n  }\n  .table-responsive > .table-bordered > thead > tr > th:last-child,\n  .table-responsive > .table-bordered > tbody > tr > th:last-child,\n  .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n  .table-responsive > .table-bordered > thead > tr > td:last-child,\n  .table-responsive > .table-bordered > tbody > tr > td:last-child,\n  .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n    border-right: 0;\n  }\n  .table-responsive > .table-bordered > tbody > tr:last-child > th,\n  .table-responsive > .table-bordered > tfoot > tr:last-child > th,\n  .table-responsive > .table-bordered > tbody > tr:last-child > td,\n  .table-responsive > .table-bordered > tfoot > tr:last-child > td {\n    border-bottom: 0;\n  }\n}\nfieldset {\n  min-width: 0;\n  padding: 0;\n  margin: 0;\n  border: 0;\n}\nlegend {\n  display: block;\n  width: 100%;\n  padding: 0;\n  margin-bottom: 20px;\n  font-size: 21px;\n  line-height: inherit;\n  color: #333;\n  border: 0;\n  border-bottom: 1px solid #e5e5e5;\n}\nlabel {\n  display: inline-block;\n  max-width: 100%;\n  margin-bottom: 5px;\n  font-weight: bold;\n}\ninput[type=\"search\"] {\n  -webkit-box-sizing: border-box;\n     -moz-box-sizing: border-box;\n          box-sizing: border-box;\n}\ninput[type=\"radio\"],\ninput[type=\"checkbox\"] {\n  margin: 4px 0 0;\n  margin-top: 1px \\9;\n  line-height: normal;\n}\ninput[type=\"file\"] {\n  display: block;\n}\ninput[type=\"range\"] {\n  display: block;\n  width: 100%;\n}\nselect[multiple],\nselect[size] {\n  height: auto;\n}\ninput[type=\"file\"]:focus,\ninput[type=\"radio\"]:focus,\ninput[type=\"checkbox\"]:focus {\n  outline: thin dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\noutput {\n  display: block;\n  padding-top: 7px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #555;\n}\n.form-control {\n  display: block;\n  width: 100%;\n  height: 34px;\n  padding: 6px 12px;\n  font-size: 14px;\n  line-height: 1.42857143;\n  color: #555;\n  background-color: #fff;\n  background-image: none;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n  -webkit-transition: border-color ease-in-out .15s, -webkit-box-shadow ease-in-out .15s;\n       -o-transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n          transition: border-color ease-in-out .15s, box-shadow ease-in-out .15s;\n}\n.form-control:focus {\n  border-color: #66afe9;\n  outline: 0;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);\n          box-shadow: inset 0 1px 1px rgba(0,0,0,.075), 0 0 8px rgba(102, 175, 233, .6);\n}\n.form-control::-moz-placeholder {\n  color: #999;\n  opacity: 1;\n}\n.form-control:-ms-input-placeholder {\n  color: #999;\n}\n.form-control::-webkit-input-placeholder {\n  color: #999;\n}\n.form-control::-ms-expand {\n  background-color: transparent;\n  border: 0;\n}\n.form-control[disabled],\n.form-control[readonly],\nfieldset[disabled] .form-control {\n  background-color: #eee;\n  opacity: 1;\n}\n.form-control[disabled],\nfieldset[disabled] .form-control {\n  cursor: not-allowed;\n}\ntextarea.form-control {\n  height: auto;\n}\ninput[type=\"search\"] {\n  -webkit-appearance: none;\n}\n@media screen and (-webkit-min-device-pixel-ratio: 0) {\n  input[type=\"date\"].form-control,\n  input[type=\"time\"].form-control,\n  input[type=\"datetime-local\"].form-control,\n  input[type=\"month\"].form-control {\n    line-height: 34px;\n  }\n  input[type=\"date\"].input-sm,\n  input[type=\"time\"].input-sm,\n  input[type=\"datetime-local\"].input-sm,\n  input[type=\"month\"].input-sm,\n  .input-group-sm input[type=\"date\"],\n  .input-group-sm input[type=\"time\"],\n  .input-group-sm input[type=\"datetime-local\"],\n  .input-group-sm input[type=\"month\"] {\n    line-height: 30px;\n  }\n  input[type=\"date\"].input-lg,\n  input[type=\"time\"].input-lg,\n  input[type=\"datetime-local\"].input-lg,\n  input[type=\"month\"].input-lg,\n  .input-group-lg input[type=\"date\"],\n  .input-group-lg input[type=\"time\"],\n  .input-group-lg input[type=\"datetime-local\"],\n  .input-group-lg input[type=\"month\"] {\n    line-height: 46px;\n  }\n}\n.form-group {\n  margin-bottom: 15px;\n}\n.radio,\n.checkbox {\n  position: relative;\n  display: block;\n  margin-top: 10px;\n  margin-bottom: 10px;\n}\n.radio label,\n.checkbox label {\n  min-height: 20px;\n  padding-left: 20px;\n  margin-bottom: 0;\n  font-weight: normal;\n  cursor: pointer;\n}\n.radio input[type=\"radio\"],\n.radio-inline input[type=\"radio\"],\n.checkbox input[type=\"checkbox\"],\n.checkbox-inline input[type=\"checkbox\"] {\n  position: absolute;\n  margin-top: 4px \\9;\n  margin-left: -20px;\n}\n.radio + .radio,\n.checkbox + .checkbox {\n  margin-top: -5px;\n}\n.radio-inline,\n.checkbox-inline {\n  position: relative;\n  display: inline-block;\n  padding-left: 20px;\n  margin-bottom: 0;\n  font-weight: normal;\n  vertical-align: middle;\n  cursor: pointer;\n}\n.radio-inline + .radio-inline,\n.checkbox-inline + .checkbox-inline {\n  margin-top: 0;\n  margin-left: 10px;\n}\ninput[type=\"radio\"][disabled],\ninput[type=\"checkbox\"][disabled],\ninput[type=\"radio\"].disabled,\ninput[type=\"checkbox\"].disabled,\nfieldset[disabled] input[type=\"radio\"],\nfieldset[disabled] input[type=\"checkbox\"] {\n  cursor: not-allowed;\n}\n.radio-inline.disabled,\n.checkbox-inline.disabled,\nfieldset[disabled] .radio-inline,\nfieldset[disabled] .checkbox-inline {\n  cursor: not-allowed;\n}\n.radio.disabled label,\n.checkbox.disabled label,\nfieldset[disabled] .radio label,\nfieldset[disabled] .checkbox label {\n  cursor: not-allowed;\n}\n.form-control-static {\n  min-height: 34px;\n  padding-top: 7px;\n  padding-bottom: 7px;\n  margin-bottom: 0;\n}\n.form-control-static.input-lg,\n.form-control-static.input-sm {\n  padding-right: 0;\n  padding-left: 0;\n}\n.input-sm {\n  height: 30px;\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\nselect.input-sm {\n  height: 30px;\n  line-height: 30px;\n}\ntextarea.input-sm,\nselect[multiple].input-sm {\n  height: auto;\n}\n.form-group-sm .form-control {\n  height: 30px;\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.form-group-sm select.form-control {\n  height: 30px;\n  line-height: 30px;\n}\n.form-group-sm textarea.form-control,\n.form-group-sm select[multiple].form-control {\n  height: auto;\n}\n.form-group-sm .form-control-static {\n  height: 30px;\n  min-height: 32px;\n  padding: 6px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n}\n.input-lg {\n  height: 46px;\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\nselect.input-lg {\n  height: 46px;\n  line-height: 46px;\n}\ntextarea.input-lg,\nselect[multiple].input-lg {\n  height: auto;\n}\n.form-group-lg .form-control {\n  height: 46px;\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\n.form-group-lg select.form-control {\n  height: 46px;\n  line-height: 46px;\n}\n.form-group-lg textarea.form-control,\n.form-group-lg select[multiple].form-control {\n  height: auto;\n}\n.form-group-lg .form-control-static {\n  height: 46px;\n  min-height: 38px;\n  padding: 11px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n}\n.has-feedback {\n  position: relative;\n}\n.has-feedback .form-control {\n  padding-right: 42.5px;\n}\n.form-control-feedback {\n  position: absolute;\n  top: 0;\n  right: 0;\n  z-index: 2;\n  display: block;\n  width: 34px;\n  height: 34px;\n  line-height: 34px;\n  text-align: center;\n  pointer-events: none;\n}\n.input-lg + .form-control-feedback,\n.input-group-lg + .form-control-feedback,\n.form-group-lg .form-control + .form-control-feedback {\n  width: 46px;\n  height: 46px;\n  line-height: 46px;\n}\n.input-sm + .form-control-feedback,\n.input-group-sm + .form-control-feedback,\n.form-group-sm .form-control + .form-control-feedback {\n  width: 30px;\n  height: 30px;\n  line-height: 30px;\n}\n.has-success .help-block,\n.has-success .control-label,\n.has-success .radio,\n.has-success .checkbox,\n.has-success .radio-inline,\n.has-success .checkbox-inline,\n.has-success.radio label,\n.has-success.checkbox label,\n.has-success.radio-inline label,\n.has-success.checkbox-inline label {\n  color: #3c763d;\n}\n.has-success .form-control {\n  border-color: #3c763d;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n}\n.has-success .form-control:focus {\n  border-color: #2b542c;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #67b168;\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #67b168;\n}\n.has-success .input-group-addon {\n  color: #3c763d;\n  background-color: #dff0d8;\n  border-color: #3c763d;\n}\n.has-success .form-control-feedback {\n  color: #3c763d;\n}\n.has-warning .help-block,\n.has-warning .control-label,\n.has-warning .radio,\n.has-warning .checkbox,\n.has-warning .radio-inline,\n.has-warning .checkbox-inline,\n.has-warning.radio label,\n.has-warning.checkbox label,\n.has-warning.radio-inline label,\n.has-warning.checkbox-inline label {\n  color: #8a6d3b;\n}\n.has-warning .form-control {\n  border-color: #8a6d3b;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n}\n.has-warning .form-control:focus {\n  border-color: #66512c;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #c0a16b;\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #c0a16b;\n}\n.has-warning .input-group-addon {\n  color: #8a6d3b;\n  background-color: #fcf8e3;\n  border-color: #8a6d3b;\n}\n.has-warning .form-control-feedback {\n  color: #8a6d3b;\n}\n.has-error .help-block,\n.has-error .control-label,\n.has-error .radio,\n.has-error .checkbox,\n.has-error .radio-inline,\n.has-error .checkbox-inline,\n.has-error.radio label,\n.has-error.checkbox label,\n.has-error.radio-inline label,\n.has-error.checkbox-inline label {\n  color: #a94442;\n}\n.has-error .form-control {\n  border-color: #a94442;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075);\n}\n.has-error .form-control:focus {\n  border-color: #843534;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #ce8483;\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 6px #ce8483;\n}\n.has-error .input-group-addon {\n  color: #a94442;\n  background-color: #f2dede;\n  border-color: #a94442;\n}\n.has-error .form-control-feedback {\n  color: #a94442;\n}\n.has-feedback label ~ .form-control-feedback {\n  top: 25px;\n}\n.has-feedback label.sr-only ~ .form-control-feedback {\n  top: 0;\n}\n.help-block {\n  display: block;\n  margin-top: 5px;\n  margin-bottom: 10px;\n  color: #737373;\n}\n@media (min-width: 768px) {\n  .form-inline .form-group {\n    display: inline-block;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .form-inline .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle;\n  }\n  .form-inline .form-control-static {\n    display: inline-block;\n  }\n  .form-inline .input-group {\n    display: inline-table;\n    vertical-align: middle;\n  }\n  .form-inline .input-group .input-group-addon,\n  .form-inline .input-group .input-group-btn,\n  .form-inline .input-group .form-control {\n    width: auto;\n  }\n  .form-inline .input-group > .form-control {\n    width: 100%;\n  }\n  .form-inline .control-label {\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .form-inline .radio,\n  .form-inline .checkbox {\n    display: inline-block;\n    margin-top: 0;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .form-inline .radio label,\n  .form-inline .checkbox label {\n    padding-left: 0;\n  }\n  .form-inline .radio input[type=\"radio\"],\n  .form-inline .checkbox input[type=\"checkbox\"] {\n    position: relative;\n    margin-left: 0;\n  }\n  .form-inline .has-feedback .form-control-feedback {\n    top: 0;\n  }\n}\n.form-horizontal .radio,\n.form-horizontal .checkbox,\n.form-horizontal .radio-inline,\n.form-horizontal .checkbox-inline {\n  padding-top: 7px;\n  margin-top: 0;\n  margin-bottom: 0;\n}\n.form-horizontal .radio,\n.form-horizontal .checkbox {\n  min-height: 27px;\n}\n.form-horizontal .form-group {\n  margin-right: -15px;\n  margin-left: -15px;\n}\n@media (min-width: 768px) {\n  .form-horizontal .control-label {\n    padding-top: 7px;\n    margin-bottom: 0;\n    text-align: right;\n  }\n}\n.form-horizontal .has-feedback .form-control-feedback {\n  right: 15px;\n}\n@media (min-width: 768px) {\n  .form-horizontal .form-group-lg .control-label {\n    padding-top: 11px;\n    font-size: 18px;\n  }\n}\n@media (min-width: 768px) {\n  .form-horizontal .form-group-sm .control-label {\n    padding-top: 6px;\n    font-size: 12px;\n  }\n}\n.btn {\n  display: inline-block;\n  padding: 6px 12px;\n  margin-bottom: 0;\n  font-size: 14px;\n  font-weight: normal;\n  line-height: 1.42857143;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  -ms-touch-action: manipulation;\n      touch-action: manipulation;\n  cursor: pointer;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  background-image: none;\n  border: 1px solid transparent;\n  border-radius: 4px;\n}\n.btn:focus,\n.btn:active:focus,\n.btn.active:focus,\n.btn.focus,\n.btn:active.focus,\n.btn.active.focus {\n  outline: thin dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n  outline-offset: -2px;\n}\n.btn:hover,\n.btn:focus,\n.btn.focus {\n  color: #333;\n  text-decoration: none;\n}\n.btn:active,\n.btn.active {\n  background-image: none;\n  outline: 0;\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);\n          box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);\n}\n.btn.disabled,\n.btn[disabled],\nfieldset[disabled] .btn {\n  cursor: not-allowed;\n  filter: alpha(opacity=65);\n  -webkit-box-shadow: none;\n          box-shadow: none;\n  opacity: .65;\n}\na.btn.disabled,\nfieldset[disabled] a.btn {\n  pointer-events: none;\n}\n.btn-default {\n  color: #333;\n  background-color: #fff;\n  border-color: #ccc;\n}\n.btn-default:focus,\n.btn-default.focus {\n  color: #333;\n  background-color: #e6e6e6;\n  border-color: #8c8c8c;\n}\n.btn-default:hover {\n  color: #333;\n  background-color: #e6e6e6;\n  border-color: #adadad;\n}\n.btn-default:active,\n.btn-default.active,\n.open > .dropdown-toggle.btn-default {\n  color: #333;\n  background-color: #e6e6e6;\n  border-color: #adadad;\n}\n.btn-default:active:hover,\n.btn-default.active:hover,\n.open > .dropdown-toggle.btn-default:hover,\n.btn-default:active:focus,\n.btn-default.active:focus,\n.open > .dropdown-toggle.btn-default:focus,\n.btn-default:active.focus,\n.btn-default.active.focus,\n.open > .dropdown-toggle.btn-default.focus {\n  color: #333;\n  background-color: #d4d4d4;\n  border-color: #8c8c8c;\n}\n.btn-default:active,\n.btn-default.active,\n.open > .dropdown-toggle.btn-default {\n  background-image: none;\n}\n.btn-default.disabled:hover,\n.btn-default[disabled]:hover,\nfieldset[disabled] .btn-default:hover,\n.btn-default.disabled:focus,\n.btn-default[disabled]:focus,\nfieldset[disabled] .btn-default:focus,\n.btn-default.disabled.focus,\n.btn-default[disabled].focus,\nfieldset[disabled] .btn-default.focus {\n  background-color: #fff;\n  border-color: #ccc;\n}\n.btn-default .badge {\n  color: #fff;\n  background-color: #333;\n}\n.btn-primary {\n  color: #fff;\n  background-color: #337ab7;\n  border-color: #2e6da4;\n}\n.btn-primary:focus,\n.btn-primary.focus {\n  color: #fff;\n  background-color: #286090;\n  border-color: #122b40;\n}\n.btn-primary:hover {\n  color: #fff;\n  background-color: #286090;\n  border-color: #204d74;\n}\n.btn-primary:active,\n.btn-primary.active,\n.open > .dropdown-toggle.btn-primary {\n  color: #fff;\n  background-color: #286090;\n  border-color: #204d74;\n}\n.btn-primary:active:hover,\n.btn-primary.active:hover,\n.open > .dropdown-toggle.btn-primary:hover,\n.btn-primary:active:focus,\n.btn-primary.active:focus,\n.open > .dropdown-toggle.btn-primary:focus,\n.btn-primary:active.focus,\n.btn-primary.active.focus,\n.open > .dropdown-toggle.btn-primary.focus {\n  color: #fff;\n  background-color: #204d74;\n  border-color: #122b40;\n}\n.btn-primary:active,\n.btn-primary.active,\n.open > .dropdown-toggle.btn-primary {\n  background-image: none;\n}\n.btn-primary.disabled:hover,\n.btn-primary[disabled]:hover,\nfieldset[disabled] .btn-primary:hover,\n.btn-primary.disabled:focus,\n.btn-primary[disabled]:focus,\nfieldset[disabled] .btn-primary:focus,\n.btn-primary.disabled.focus,\n.btn-primary[disabled].focus,\nfieldset[disabled] .btn-primary.focus {\n  background-color: #337ab7;\n  border-color: #2e6da4;\n}\n.btn-primary .badge {\n  color: #337ab7;\n  background-color: #fff;\n}\n.btn-success {\n  color: #fff;\n  background-color: #5cb85c;\n  border-color: #4cae4c;\n}\n.btn-success:focus,\n.btn-success.focus {\n  color: #fff;\n  background-color: #449d44;\n  border-color: #255625;\n}\n.btn-success:hover {\n  color: #fff;\n  background-color: #449d44;\n  border-color: #398439;\n}\n.btn-success:active,\n.btn-success.active,\n.open > .dropdown-toggle.btn-success {\n  color: #fff;\n  background-color: #449d44;\n  border-color: #398439;\n}\n.btn-success:active:hover,\n.btn-success.active:hover,\n.open > .dropdown-toggle.btn-success:hover,\n.btn-success:active:focus,\n.btn-success.active:focus,\n.open > .dropdown-toggle.btn-success:focus,\n.btn-success:active.focus,\n.btn-success.active.focus,\n.open > .dropdown-toggle.btn-success.focus {\n  color: #fff;\n  background-color: #398439;\n  border-color: #255625;\n}\n.btn-success:active,\n.btn-success.active,\n.open > .dropdown-toggle.btn-success {\n  background-image: none;\n}\n.btn-success.disabled:hover,\n.btn-success[disabled]:hover,\nfieldset[disabled] .btn-success:hover,\n.btn-success.disabled:focus,\n.btn-success[disabled]:focus,\nfieldset[disabled] .btn-success:focus,\n.btn-success.disabled.focus,\n.btn-success[disabled].focus,\nfieldset[disabled] .btn-success.focus {\n  background-color: #5cb85c;\n  border-color: #4cae4c;\n}\n.btn-success .badge {\n  color: #5cb85c;\n  background-color: #fff;\n}\n.btn-info {\n  color: #fff;\n  background-color: #5bc0de;\n  border-color: #46b8da;\n}\n.btn-info:focus,\n.btn-info.focus {\n  color: #fff;\n  background-color: #31b0d5;\n  border-color: #1b6d85;\n}\n.btn-info:hover {\n  color: #fff;\n  background-color: #31b0d5;\n  border-color: #269abc;\n}\n.btn-info:active,\n.btn-info.active,\n.open > .dropdown-toggle.btn-info {\n  color: #fff;\n  background-color: #31b0d5;\n  border-color: #269abc;\n}\n.btn-info:active:hover,\n.btn-info.active:hover,\n.open > .dropdown-toggle.btn-info:hover,\n.btn-info:active:focus,\n.btn-info.active:focus,\n.open > .dropdown-toggle.btn-info:focus,\n.btn-info:active.focus,\n.btn-info.active.focus,\n.open > .dropdown-toggle.btn-info.focus {\n  color: #fff;\n  background-color: #269abc;\n  border-color: #1b6d85;\n}\n.btn-info:active,\n.btn-info.active,\n.open > .dropdown-toggle.btn-info {\n  background-image: none;\n}\n.btn-info.disabled:hover,\n.btn-info[disabled]:hover,\nfieldset[disabled] .btn-info:hover,\n.btn-info.disabled:focus,\n.btn-info[disabled]:focus,\nfieldset[disabled] .btn-info:focus,\n.btn-info.disabled.focus,\n.btn-info[disabled].focus,\nfieldset[disabled] .btn-info.focus {\n  background-color: #5bc0de;\n  border-color: #46b8da;\n}\n.btn-info .badge {\n  color: #5bc0de;\n  background-color: #fff;\n}\n.btn-warning {\n  color: #fff;\n  background-color: #f0ad4e;\n  border-color: #eea236;\n}\n.btn-warning:focus,\n.btn-warning.focus {\n  color: #fff;\n  background-color: #ec971f;\n  border-color: #985f0d;\n}\n.btn-warning:hover {\n  color: #fff;\n  background-color: #ec971f;\n  border-color: #d58512;\n}\n.btn-warning:active,\n.btn-warning.active,\n.open > .dropdown-toggle.btn-warning {\n  color: #fff;\n  background-color: #ec971f;\n  border-color: #d58512;\n}\n.btn-warning:active:hover,\n.btn-warning.active:hover,\n.open > .dropdown-toggle.btn-warning:hover,\n.btn-warning:active:focus,\n.btn-warning.active:focus,\n.open > .dropdown-toggle.btn-warning:focus,\n.btn-warning:active.focus,\n.btn-warning.active.focus,\n.open > .dropdown-toggle.btn-warning.focus {\n  color: #fff;\n  background-color: #d58512;\n  border-color: #985f0d;\n}\n.btn-warning:active,\n.btn-warning.active,\n.open > .dropdown-toggle.btn-warning {\n  background-image: none;\n}\n.btn-warning.disabled:hover,\n.btn-warning[disabled]:hover,\nfieldset[disabled] .btn-warning:hover,\n.btn-warning.disabled:focus,\n.btn-warning[disabled]:focus,\nfieldset[disabled] .btn-warning:focus,\n.btn-warning.disabled.focus,\n.btn-warning[disabled].focus,\nfieldset[disabled] .btn-warning.focus {\n  background-color: #f0ad4e;\n  border-color: #eea236;\n}\n.btn-warning .badge {\n  color: #f0ad4e;\n  background-color: #fff;\n}\n.btn-danger {\n  color: #fff;\n  background-color: #d9534f;\n  border-color: #d43f3a;\n}\n.btn-danger:focus,\n.btn-danger.focus {\n  color: #fff;\n  background-color: #c9302c;\n  border-color: #761c19;\n}\n.btn-danger:hover {\n  color: #fff;\n  background-color: #c9302c;\n  border-color: #ac2925;\n}\n.btn-danger:active,\n.btn-danger.active,\n.open > .dropdown-toggle.btn-danger {\n  color: #fff;\n  background-color: #c9302c;\n  border-color: #ac2925;\n}\n.btn-danger:active:hover,\n.btn-danger.active:hover,\n.open > .dropdown-toggle.btn-danger:hover,\n.btn-danger:active:focus,\n.btn-danger.active:focus,\n.open > .dropdown-toggle.btn-danger:focus,\n.btn-danger:active.focus,\n.btn-danger.active.focus,\n.open > .dropdown-toggle.btn-danger.focus {\n  color: #fff;\n  background-color: #ac2925;\n  border-color: #761c19;\n}\n.btn-danger:active,\n.btn-danger.active,\n.open > .dropdown-toggle.btn-danger {\n  background-image: none;\n}\n.btn-danger.disabled:hover,\n.btn-danger[disabled]:hover,\nfieldset[disabled] .btn-danger:hover,\n.btn-danger.disabled:focus,\n.btn-danger[disabled]:focus,\nfieldset[disabled] .btn-danger:focus,\n.btn-danger.disabled.focus,\n.btn-danger[disabled].focus,\nfieldset[disabled] .btn-danger.focus {\n  background-color: #d9534f;\n  border-color: #d43f3a;\n}\n.btn-danger .badge {\n  color: #d9534f;\n  background-color: #fff;\n}\n.btn-link {\n  font-weight: normal;\n  color: #337ab7;\n  border-radius: 0;\n}\n.btn-link,\n.btn-link:active,\n.btn-link.active,\n.btn-link[disabled],\nfieldset[disabled] .btn-link {\n  background-color: transparent;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n}\n.btn-link,\n.btn-link:hover,\n.btn-link:focus,\n.btn-link:active {\n  border-color: transparent;\n}\n.btn-link:hover,\n.btn-link:focus {\n  color: #23527c;\n  text-decoration: underline;\n  background-color: transparent;\n}\n.btn-link[disabled]:hover,\nfieldset[disabled] .btn-link:hover,\n.btn-link[disabled]:focus,\nfieldset[disabled] .btn-link:focus {\n  color: #777;\n  text-decoration: none;\n}\n.btn-lg,\n.btn-group-lg > .btn {\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\n.btn-sm,\n.btn-group-sm > .btn {\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.btn-xs,\n.btn-group-xs > .btn {\n  padding: 1px 5px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\n.btn-block {\n  display: block;\n  width: 100%;\n}\n.btn-block + .btn-block {\n  margin-top: 5px;\n}\ninput[type=\"submit\"].btn-block,\ninput[type=\"reset\"].btn-block,\ninput[type=\"button\"].btn-block {\n  width: 100%;\n}\n.fade {\n  opacity: 0;\n  -webkit-transition: opacity .15s linear;\n       -o-transition: opacity .15s linear;\n          transition: opacity .15s linear;\n}\n.fade.in {\n  opacity: 1;\n}\n.collapse {\n  display: none;\n}\n.collapse.in {\n  display: block;\n}\ntr.collapse.in {\n  display: table-row;\n}\ntbody.collapse.in {\n  display: table-row-group;\n}\n.collapsing {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  -webkit-transition-timing-function: ease;\n       -o-transition-timing-function: ease;\n          transition-timing-function: ease;\n  -webkit-transition-duration: .35s;\n       -o-transition-duration: .35s;\n          transition-duration: .35s;\n  -webkit-transition-property: height, visibility;\n       -o-transition-property: height, visibility;\n          transition-property: height, visibility;\n}\n.caret {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 2px;\n  vertical-align: middle;\n  border-top: 4px dashed;\n  border-top: 4px solid \\9;\n  border-right: 4px solid transparent;\n  border-left: 4px solid transparent;\n}\n.dropup,\n.dropdown {\n  position: relative;\n}\n.dropdown-toggle:focus {\n  outline: 0;\n}\n.dropdown-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  float: left;\n  min-width: 160px;\n  padding: 5px 0;\n  margin: 2px 0 0;\n  font-size: 14px;\n  text-align: left;\n  list-style: none;\n  background-color: #fff;\n  -webkit-background-clip: padding-box;\n          background-clip: padding-box;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0, 0, 0, .15);\n  border-radius: 4px;\n  -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, .175);\n          box-shadow: 0 6px 12px rgba(0, 0, 0, .175);\n}\n.dropdown-menu.pull-right {\n  right: 0;\n  left: auto;\n}\n.dropdown-menu .divider {\n  height: 1px;\n  margin: 9px 0;\n  overflow: hidden;\n  background-color: #e5e5e5;\n}\n.dropdown-menu > li > a {\n  display: block;\n  padding: 3px 20px;\n  clear: both;\n  font-weight: normal;\n  line-height: 1.42857143;\n  color: #333;\n  white-space: nowrap;\n}\n.dropdown-menu > li > a:hover,\n.dropdown-menu > li > a:focus {\n  color: #262626;\n  text-decoration: none;\n  background-color: #f5f5f5;\n}\n.dropdown-menu > .active > a,\n.dropdown-menu > .active > a:hover,\n.dropdown-menu > .active > a:focus {\n  color: #fff;\n  text-decoration: none;\n  background-color: #337ab7;\n  outline: 0;\n}\n.dropdown-menu > .disabled > a,\n.dropdown-menu > .disabled > a:hover,\n.dropdown-menu > .disabled > a:focus {\n  color: #777;\n}\n.dropdown-menu > .disabled > a:hover,\n.dropdown-menu > .disabled > a:focus {\n  text-decoration: none;\n  cursor: not-allowed;\n  background-color: transparent;\n  background-image: none;\n  filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);\n}\n.open > .dropdown-menu {\n  display: block;\n}\n.open > a {\n  outline: 0;\n}\n.dropdown-menu-right {\n  right: 0;\n  left: auto;\n}\n.dropdown-menu-left {\n  right: auto;\n  left: 0;\n}\n.dropdown-header {\n  display: block;\n  padding: 3px 20px;\n  font-size: 12px;\n  line-height: 1.42857143;\n  color: #777;\n  white-space: nowrap;\n}\n.dropdown-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 990;\n}\n.pull-right > .dropdown-menu {\n  right: 0;\n  left: auto;\n}\n.dropup .caret,\n.navbar-fixed-bottom .dropdown .caret {\n  content: \"\";\n  border-top: 0;\n  border-bottom: 4px dashed;\n  border-bottom: 4px solid \\9;\n}\n.dropup .dropdown-menu,\n.navbar-fixed-bottom .dropdown .dropdown-menu {\n  top: auto;\n  bottom: 100%;\n  margin-bottom: 2px;\n}\n@media (min-width: 768px) {\n  .navbar-right .dropdown-menu {\n    right: 0;\n    left: auto;\n  }\n  .navbar-right .dropdown-menu-left {\n    right: auto;\n    left: 0;\n  }\n}\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: inline-block;\n  vertical-align: middle;\n}\n.btn-group > .btn,\n.btn-group-vertical > .btn {\n  position: relative;\n  float: left;\n}\n.btn-group > .btn:hover,\n.btn-group-vertical > .btn:hover,\n.btn-group > .btn:focus,\n.btn-group-vertical > .btn:focus,\n.btn-group > .btn:active,\n.btn-group-vertical > .btn:active,\n.btn-group > .btn.active,\n.btn-group-vertical > .btn.active {\n  z-index: 2;\n}\n.btn-group .btn + .btn,\n.btn-group .btn + .btn-group,\n.btn-group .btn-group + .btn,\n.btn-group .btn-group + .btn-group {\n  margin-left: -1px;\n}\n.btn-toolbar {\n  margin-left: -5px;\n}\n.btn-toolbar .btn,\n.btn-toolbar .btn-group,\n.btn-toolbar .input-group {\n  float: left;\n}\n.btn-toolbar > .btn,\n.btn-toolbar > .btn-group,\n.btn-toolbar > .input-group {\n  margin-left: 5px;\n}\n.btn-group > .btn:not(:first-child):not(:last-child):not(.dropdown-toggle) {\n  border-radius: 0;\n}\n.btn-group > .btn:first-child {\n  margin-left: 0;\n}\n.btn-group > .btn:first-child:not(:last-child):not(.dropdown-toggle) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.btn-group > .btn:last-child:not(:first-child),\n.btn-group > .dropdown-toggle:not(:first-child) {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.btn-group > .btn-group {\n  float: left;\n}\n.btn-group > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n.btn-group > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.btn-group > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.btn-group .dropdown-toggle:active,\n.btn-group.open .dropdown-toggle {\n  outline: 0;\n}\n.btn-group > .btn + .dropdown-toggle {\n  padding-right: 8px;\n  padding-left: 8px;\n}\n.btn-group > .btn-lg + .dropdown-toggle {\n  padding-right: 12px;\n  padding-left: 12px;\n}\n.btn-group.open .dropdown-toggle {\n  -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);\n          box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);\n}\n.btn-group.open .dropdown-toggle.btn-link {\n  -webkit-box-shadow: none;\n          box-shadow: none;\n}\n.btn .caret {\n  margin-left: 0;\n}\n.btn-lg .caret {\n  border-width: 5px 5px 0;\n  border-bottom-width: 0;\n}\n.dropup .btn-lg .caret {\n  border-width: 0 5px 5px;\n}\n.btn-group-vertical > .btn,\n.btn-group-vertical > .btn-group,\n.btn-group-vertical > .btn-group > .btn {\n  display: block;\n  float: none;\n  width: 100%;\n  max-width: 100%;\n}\n.btn-group-vertical > .btn-group > .btn {\n  float: none;\n}\n.btn-group-vertical > .btn + .btn,\n.btn-group-vertical > .btn + .btn-group,\n.btn-group-vertical > .btn-group + .btn,\n.btn-group-vertical > .btn-group + .btn-group {\n  margin-top: -1px;\n  margin-left: 0;\n}\n.btn-group-vertical > .btn:not(:first-child):not(:last-child) {\n  border-radius: 0;\n}\n.btn-group-vertical > .btn:first-child:not(:last-child) {\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.btn-group-vertical > .btn:last-child:not(:first-child) {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 4px;\n  border-bottom-left-radius: 4px;\n}\n.btn-group-vertical > .btn-group:not(:first-child):not(:last-child) > .btn {\n  border-radius: 0;\n}\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .btn:last-child,\n.btn-group-vertical > .btn-group:first-child:not(:last-child) > .dropdown-toggle {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.btn-group-vertical > .btn-group:last-child:not(:first-child) > .btn:first-child {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n.btn-group-justified {\n  display: table;\n  width: 100%;\n  table-layout: fixed;\n  border-collapse: separate;\n}\n.btn-group-justified > .btn,\n.btn-group-justified > .btn-group {\n  display: table-cell;\n  float: none;\n  width: 1%;\n}\n.btn-group-justified > .btn-group .btn {\n  width: 100%;\n}\n.btn-group-justified > .btn-group .dropdown-menu {\n  left: auto;\n}\n[data-toggle=\"buttons\"] > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"radio\"],\n[data-toggle=\"buttons\"] > .btn input[type=\"checkbox\"],\n[data-toggle=\"buttons\"] > .btn-group > .btn input[type=\"checkbox\"] {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none;\n}\n.input-group {\n  position: relative;\n  display: table;\n  border-collapse: separate;\n}\n.input-group[class*=\"col-\"] {\n  float: none;\n  padding-right: 0;\n  padding-left: 0;\n}\n.input-group .form-control {\n  position: relative;\n  z-index: 2;\n  float: left;\n  width: 100%;\n  margin-bottom: 0;\n}\n.input-group .form-control:focus {\n  z-index: 3;\n}\n.input-group-lg > .form-control,\n.input-group-lg > .input-group-addon,\n.input-group-lg > .input-group-btn > .btn {\n  height: 46px;\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n  border-radius: 6px;\n}\nselect.input-group-lg > .form-control,\nselect.input-group-lg > .input-group-addon,\nselect.input-group-lg > .input-group-btn > .btn {\n  height: 46px;\n  line-height: 46px;\n}\ntextarea.input-group-lg > .form-control,\ntextarea.input-group-lg > .input-group-addon,\ntextarea.input-group-lg > .input-group-btn > .btn,\nselect[multiple].input-group-lg > .form-control,\nselect[multiple].input-group-lg > .input-group-addon,\nselect[multiple].input-group-lg > .input-group-btn > .btn {\n  height: auto;\n}\n.input-group-sm > .form-control,\n.input-group-sm > .input-group-addon,\n.input-group-sm > .input-group-btn > .btn {\n  height: 30px;\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n  border-radius: 3px;\n}\nselect.input-group-sm > .form-control,\nselect.input-group-sm > .input-group-addon,\nselect.input-group-sm > .input-group-btn > .btn {\n  height: 30px;\n  line-height: 30px;\n}\ntextarea.input-group-sm > .form-control,\ntextarea.input-group-sm > .input-group-addon,\ntextarea.input-group-sm > .input-group-btn > .btn,\nselect[multiple].input-group-sm > .form-control,\nselect[multiple].input-group-sm > .input-group-addon,\nselect[multiple].input-group-sm > .input-group-btn > .btn {\n  height: auto;\n}\n.input-group-addon,\n.input-group-btn,\n.input-group .form-control {\n  display: table-cell;\n}\n.input-group-addon:not(:first-child):not(:last-child),\n.input-group-btn:not(:first-child):not(:last-child),\n.input-group .form-control:not(:first-child):not(:last-child) {\n  border-radius: 0;\n}\n.input-group-addon,\n.input-group-btn {\n  width: 1%;\n  white-space: nowrap;\n  vertical-align: middle;\n}\n.input-group-addon {\n  padding: 6px 12px;\n  font-size: 14px;\n  font-weight: normal;\n  line-height: 1;\n  color: #555;\n  text-align: center;\n  background-color: #eee;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n}\n.input-group-addon.input-sm {\n  padding: 5px 10px;\n  font-size: 12px;\n  border-radius: 3px;\n}\n.input-group-addon.input-lg {\n  padding: 10px 16px;\n  font-size: 18px;\n  border-radius: 6px;\n}\n.input-group-addon input[type=\"radio\"],\n.input-group-addon input[type=\"checkbox\"] {\n  margin-top: 0;\n}\n.input-group .form-control:first-child,\n.input-group-addon:first-child,\n.input-group-btn:first-child > .btn,\n.input-group-btn:first-child > .btn-group > .btn,\n.input-group-btn:first-child > .dropdown-toggle,\n.input-group-btn:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n.input-group-btn:last-child > .btn-group:not(:last-child) > .btn {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.input-group-addon:first-child {\n  border-right: 0;\n}\n.input-group .form-control:last-child,\n.input-group-addon:last-child,\n.input-group-btn:last-child > .btn,\n.input-group-btn:last-child > .btn-group > .btn,\n.input-group-btn:last-child > .dropdown-toggle,\n.input-group-btn:first-child > .btn:not(:first-child),\n.input-group-btn:first-child > .btn-group:not(:first-child) > .btn {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.input-group-addon:last-child {\n  border-left: 0;\n}\n.input-group-btn {\n  position: relative;\n  font-size: 0;\n  white-space: nowrap;\n}\n.input-group-btn > .btn {\n  position: relative;\n}\n.input-group-btn > .btn + .btn {\n  margin-left: -1px;\n}\n.input-group-btn > .btn:hover,\n.input-group-btn > .btn:focus,\n.input-group-btn > .btn:active {\n  z-index: 2;\n}\n.input-group-btn:first-child > .btn,\n.input-group-btn:first-child > .btn-group {\n  margin-right: -1px;\n}\n.input-group-btn:last-child > .btn,\n.input-group-btn:last-child > .btn-group {\n  z-index: 2;\n  margin-left: -1px;\n}\n.nav {\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n.nav > li {\n  position: relative;\n  display: block;\n}\n.nav > li > a {\n  position: relative;\n  display: block;\n  padding: 10px 15px;\n}\n.nav > li > a:hover,\n.nav > li > a:focus {\n  text-decoration: none;\n  background-color: #eee;\n}\n.nav > li.disabled > a {\n  color: #777;\n}\n.nav > li.disabled > a:hover,\n.nav > li.disabled > a:focus {\n  color: #777;\n  text-decoration: none;\n  cursor: not-allowed;\n  background-color: transparent;\n}\n.nav .open > a,\n.nav .open > a:hover,\n.nav .open > a:focus {\n  background-color: #eee;\n  border-color: #337ab7;\n}\n.nav .nav-divider {\n  height: 1px;\n  margin: 9px 0;\n  overflow: hidden;\n  background-color: #e5e5e5;\n}\n.nav > li > a > img {\n  max-width: none;\n}\n.nav-tabs {\n  border-bottom: 1px solid #ddd;\n}\n.nav-tabs > li {\n  float: left;\n  margin-bottom: -1px;\n}\n.nav-tabs > li > a {\n  margin-right: 2px;\n  line-height: 1.42857143;\n  border: 1px solid transparent;\n  border-radius: 4px 4px 0 0;\n}\n.nav-tabs > li > a:hover {\n  border-color: #eee #eee #ddd;\n}\n.nav-tabs > li.active > a,\n.nav-tabs > li.active > a:hover,\n.nav-tabs > li.active > a:focus {\n  color: #555;\n  cursor: default;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-bottom-color: transparent;\n}\n.nav-tabs.nav-justified {\n  width: 100%;\n  border-bottom: 0;\n}\n.nav-tabs.nav-justified > li {\n  float: none;\n}\n.nav-tabs.nav-justified > li > a {\n  margin-bottom: 5px;\n  text-align: center;\n}\n.nav-tabs.nav-justified > .dropdown .dropdown-menu {\n  top: auto;\n  left: auto;\n}\n@media (min-width: 768px) {\n  .nav-tabs.nav-justified > li {\n    display: table-cell;\n    width: 1%;\n  }\n  .nav-tabs.nav-justified > li > a {\n    margin-bottom: 0;\n  }\n}\n.nav-tabs.nav-justified > li > a {\n  margin-right: 0;\n  border-radius: 4px;\n}\n.nav-tabs.nav-justified > .active > a,\n.nav-tabs.nav-justified > .active > a:hover,\n.nav-tabs.nav-justified > .active > a:focus {\n  border: 1px solid #ddd;\n}\n@media (min-width: 768px) {\n  .nav-tabs.nav-justified > li > a {\n    border-bottom: 1px solid #ddd;\n    border-radius: 4px 4px 0 0;\n  }\n  .nav-tabs.nav-justified > .active > a,\n  .nav-tabs.nav-justified > .active > a:hover,\n  .nav-tabs.nav-justified > .active > a:focus {\n    border-bottom-color: #fff;\n  }\n}\n.nav-pills > li {\n  float: left;\n}\n.nav-pills > li > a {\n  border-radius: 4px;\n}\n.nav-pills > li + li {\n  margin-left: 2px;\n}\n.nav-pills > li.active > a,\n.nav-pills > li.active > a:hover,\n.nav-pills > li.active > a:focus {\n  color: #fff;\n  background-color: #337ab7;\n}\n.nav-stacked > li {\n  float: none;\n}\n.nav-stacked > li + li {\n  margin-top: 2px;\n  margin-left: 0;\n}\n.nav-justified {\n  width: 100%;\n}\n.nav-justified > li {\n  float: none;\n}\n.nav-justified > li > a {\n  margin-bottom: 5px;\n  text-align: center;\n}\n.nav-justified > .dropdown .dropdown-menu {\n  top: auto;\n  left: auto;\n}\n@media (min-width: 768px) {\n  .nav-justified > li {\n    display: table-cell;\n    width: 1%;\n  }\n  .nav-justified > li > a {\n    margin-bottom: 0;\n  }\n}\n.nav-tabs-justified {\n  border-bottom: 0;\n}\n.nav-tabs-justified > li > a {\n  margin-right: 0;\n  border-radius: 4px;\n}\n.nav-tabs-justified > .active > a,\n.nav-tabs-justified > .active > a:hover,\n.nav-tabs-justified > .active > a:focus {\n  border: 1px solid #ddd;\n}\n@media (min-width: 768px) {\n  .nav-tabs-justified > li > a {\n    border-bottom: 1px solid #ddd;\n    border-radius: 4px 4px 0 0;\n  }\n  .nav-tabs-justified > .active > a,\n  .nav-tabs-justified > .active > a:hover,\n  .nav-tabs-justified > .active > a:focus {\n    border-bottom-color: #fff;\n  }\n}\n.tab-content > .tab-pane {\n  display: none;\n}\n.tab-content > .active {\n  display: block;\n}\n.nav-tabs .dropdown-menu {\n  margin-top: -1px;\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n.navbar {\n  position: relative;\n  min-height: 50px;\n  margin-bottom: 20px;\n  border: 1px solid transparent;\n}\n@media (min-width: 768px) {\n  .navbar {\n    border-radius: 4px;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-header {\n    float: left;\n  }\n}\n.navbar-collapse {\n  padding-right: 15px;\n  padding-left: 15px;\n  overflow-x: visible;\n  -webkit-overflow-scrolling: touch;\n  border-top: 1px solid transparent;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1);\n          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1);\n}\n.navbar-collapse.in {\n  overflow-y: auto;\n}\n@media (min-width: 768px) {\n  .navbar-collapse {\n    width: auto;\n    border-top: 0;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n  }\n  .navbar-collapse.collapse {\n    display: block !important;\n    height: auto !important;\n    padding-bottom: 0;\n    overflow: visible !important;\n  }\n  .navbar-collapse.in {\n    overflow-y: visible;\n  }\n  .navbar-fixed-top .navbar-collapse,\n  .navbar-static-top .navbar-collapse,\n  .navbar-fixed-bottom .navbar-collapse {\n    padding-right: 0;\n    padding-left: 0;\n  }\n}\n.navbar-fixed-top .navbar-collapse,\n.navbar-fixed-bottom .navbar-collapse {\n  max-height: 340px;\n}\n@media (max-device-width: 480px) and (orientation: landscape) {\n  .navbar-fixed-top .navbar-collapse,\n  .navbar-fixed-bottom .navbar-collapse {\n    max-height: 200px;\n  }\n}\n.container > .navbar-header,\n.container-fluid > .navbar-header,\n.container > .navbar-collapse,\n.container-fluid > .navbar-collapse {\n  margin-right: -15px;\n  margin-left: -15px;\n}\n@media (min-width: 768px) {\n  .container > .navbar-header,\n  .container-fluid > .navbar-header,\n  .container > .navbar-collapse,\n  .container-fluid > .navbar-collapse {\n    margin-right: 0;\n    margin-left: 0;\n  }\n}\n.navbar-static-top {\n  z-index: 1000;\n  border-width: 0 0 1px;\n}\n@media (min-width: 768px) {\n  .navbar-static-top {\n    border-radius: 0;\n  }\n}\n.navbar-fixed-top,\n.navbar-fixed-bottom {\n  position: fixed;\n  right: 0;\n  left: 0;\n  z-index: 1030;\n}\n@media (min-width: 768px) {\n  .navbar-fixed-top,\n  .navbar-fixed-bottom {\n    border-radius: 0;\n  }\n}\n.navbar-fixed-top {\n  top: 0;\n  border-width: 0 0 1px;\n}\n.navbar-fixed-bottom {\n  bottom: 0;\n  margin-bottom: 0;\n  border-width: 1px 0 0;\n}\n.navbar-brand {\n  float: left;\n  height: 50px;\n  padding: 15px 15px;\n  font-size: 18px;\n  line-height: 20px;\n}\n.navbar-brand:hover,\n.navbar-brand:focus {\n  text-decoration: none;\n}\n.navbar-brand > img {\n  display: block;\n}\n@media (min-width: 768px) {\n  .navbar > .container .navbar-brand,\n  .navbar > .container-fluid .navbar-brand {\n    margin-left: -15px;\n  }\n}\n.navbar-toggle {\n  position: relative;\n  float: right;\n  padding: 9px 10px;\n  margin-top: 8px;\n  margin-right: 15px;\n  margin-bottom: 8px;\n  background-color: transparent;\n  background-image: none;\n  border: 1px solid transparent;\n  border-radius: 4px;\n}\n.navbar-toggle:focus {\n  outline: 0;\n}\n.navbar-toggle .icon-bar {\n  display: block;\n  width: 22px;\n  height: 2px;\n  border-radius: 1px;\n}\n.navbar-toggle .icon-bar + .icon-bar {\n  margin-top: 4px;\n}\n@media (min-width: 768px) {\n  .navbar-toggle {\n    display: none;\n  }\n}\n.navbar-nav {\n  margin: 7.5px -15px;\n}\n.navbar-nav > li > a {\n  padding-top: 10px;\n  padding-bottom: 10px;\n  line-height: 20px;\n}\n@media (max-width: 767px) {\n  .navbar-nav .open .dropdown-menu {\n    position: static;\n    float: none;\n    width: auto;\n    margin-top: 0;\n    background-color: transparent;\n    border: 0;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n  }\n  .navbar-nav .open .dropdown-menu > li > a,\n  .navbar-nav .open .dropdown-menu .dropdown-header {\n    padding: 5px 15px 5px 25px;\n  }\n  .navbar-nav .open .dropdown-menu > li > a {\n    line-height: 20px;\n  }\n  .navbar-nav .open .dropdown-menu > li > a:hover,\n  .navbar-nav .open .dropdown-menu > li > a:focus {\n    background-image: none;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-nav {\n    float: left;\n    margin: 0;\n  }\n  .navbar-nav > li {\n    float: left;\n  }\n  .navbar-nav > li > a {\n    padding-top: 15px;\n    padding-bottom: 15px;\n  }\n}\n.navbar-form {\n  padding: 10px 15px;\n  margin-top: 8px;\n  margin-right: -15px;\n  margin-bottom: 8px;\n  margin-left: -15px;\n  border-top: 1px solid transparent;\n  border-bottom: 1px solid transparent;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 1px 0 rgba(255, 255, 255, .1);\n          box-shadow: inset 0 1px 0 rgba(255, 255, 255, .1), 0 1px 0 rgba(255, 255, 255, .1);\n}\n@media (min-width: 768px) {\n  .navbar-form .form-group {\n    display: inline-block;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .navbar-form .form-control {\n    display: inline-block;\n    width: auto;\n    vertical-align: middle;\n  }\n  .navbar-form .form-control-static {\n    display: inline-block;\n  }\n  .navbar-form .input-group {\n    display: inline-table;\n    vertical-align: middle;\n  }\n  .navbar-form .input-group .input-group-addon,\n  .navbar-form .input-group .input-group-btn,\n  .navbar-form .input-group .form-control {\n    width: auto;\n  }\n  .navbar-form .input-group > .form-control {\n    width: 100%;\n  }\n  .navbar-form .control-label {\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .navbar-form .radio,\n  .navbar-form .checkbox {\n    display: inline-block;\n    margin-top: 0;\n    margin-bottom: 0;\n    vertical-align: middle;\n  }\n  .navbar-form .radio label,\n  .navbar-form .checkbox label {\n    padding-left: 0;\n  }\n  .navbar-form .radio input[type=\"radio\"],\n  .navbar-form .checkbox input[type=\"checkbox\"] {\n    position: relative;\n    margin-left: 0;\n  }\n  .navbar-form .has-feedback .form-control-feedback {\n    top: 0;\n  }\n}\n@media (max-width: 767px) {\n  .navbar-form .form-group {\n    margin-bottom: 5px;\n  }\n  .navbar-form .form-group:last-child {\n    margin-bottom: 0;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-form {\n    width: auto;\n    padding-top: 0;\n    padding-bottom: 0;\n    margin-right: 0;\n    margin-left: 0;\n    border: 0;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n  }\n}\n.navbar-nav > li > .dropdown-menu {\n  margin-top: 0;\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n.navbar-fixed-bottom .navbar-nav > li > .dropdown-menu {\n  margin-bottom: 0;\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.navbar-btn {\n  margin-top: 8px;\n  margin-bottom: 8px;\n}\n.navbar-btn.btn-sm {\n  margin-top: 10px;\n  margin-bottom: 10px;\n}\n.navbar-btn.btn-xs {\n  margin-top: 14px;\n  margin-bottom: 14px;\n}\n.navbar-text {\n  margin-top: 15px;\n  margin-bottom: 15px;\n}\n@media (min-width: 768px) {\n  .navbar-text {\n    float: left;\n    margin-right: 15px;\n    margin-left: 15px;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-left {\n    float: left !important;\n  }\n  .navbar-right {\n    float: right !important;\n    margin-right: -15px;\n  }\n  .navbar-right ~ .navbar-right {\n    margin-right: 0;\n  }\n}\n.navbar-default {\n  background-color: #f8f8f8;\n  border-color: #e7e7e7;\n}\n.navbar-default .navbar-brand {\n  color: #777;\n}\n.navbar-default .navbar-brand:hover,\n.navbar-default .navbar-brand:focus {\n  color: #5e5e5e;\n  background-color: transparent;\n}\n.navbar-default .navbar-text {\n  color: #777;\n}\n.navbar-default .navbar-nav > li > a {\n  color: #777;\n}\n.navbar-default .navbar-nav > li > a:hover,\n.navbar-default .navbar-nav > li > a:focus {\n  color: #333;\n  background-color: transparent;\n}\n.navbar-default .navbar-nav > .active > a,\n.navbar-default .navbar-nav > .active > a:hover,\n.navbar-default .navbar-nav > .active > a:focus {\n  color: #555;\n  background-color: #e7e7e7;\n}\n.navbar-default .navbar-nav > .disabled > a,\n.navbar-default .navbar-nav > .disabled > a:hover,\n.navbar-default .navbar-nav > .disabled > a:focus {\n  color: #ccc;\n  background-color: transparent;\n}\n.navbar-default .navbar-toggle {\n  border-color: #ddd;\n}\n.navbar-default .navbar-toggle:hover,\n.navbar-default .navbar-toggle:focus {\n  background-color: #ddd;\n}\n.navbar-default .navbar-toggle .icon-bar {\n  background-color: #888;\n}\n.navbar-default .navbar-collapse,\n.navbar-default .navbar-form {\n  border-color: #e7e7e7;\n}\n.navbar-default .navbar-nav > .open > a,\n.navbar-default .navbar-nav > .open > a:hover,\n.navbar-default .navbar-nav > .open > a:focus {\n  color: #555;\n  background-color: #e7e7e7;\n}\n@media (max-width: 767px) {\n  .navbar-default .navbar-nav .open .dropdown-menu > li > a {\n    color: #777;\n  }\n  .navbar-default .navbar-nav .open .dropdown-menu > li > a:hover,\n  .navbar-default .navbar-nav .open .dropdown-menu > li > a:focus {\n    color: #333;\n    background-color: transparent;\n  }\n  .navbar-default .navbar-nav .open .dropdown-menu > .active > a,\n  .navbar-default .navbar-nav .open .dropdown-menu > .active > a:hover,\n  .navbar-default .navbar-nav .open .dropdown-menu > .active > a:focus {\n    color: #555;\n    background-color: #e7e7e7;\n  }\n  .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a,\n  .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:hover,\n  .navbar-default .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n    color: #ccc;\n    background-color: transparent;\n  }\n}\n.navbar-default .navbar-link {\n  color: #777;\n}\n.navbar-default .navbar-link:hover {\n  color: #333;\n}\n.navbar-default .btn-link {\n  color: #777;\n}\n.navbar-default .btn-link:hover,\n.navbar-default .btn-link:focus {\n  color: #333;\n}\n.navbar-default .btn-link[disabled]:hover,\nfieldset[disabled] .navbar-default .btn-link:hover,\n.navbar-default .btn-link[disabled]:focus,\nfieldset[disabled] .navbar-default .btn-link:focus {\n  color: #ccc;\n}\n.navbar-inverse {\n  background-color: #222;\n  border-color: #080808;\n}\n.navbar-inverse .navbar-brand {\n  color: #9d9d9d;\n}\n.navbar-inverse .navbar-brand:hover,\n.navbar-inverse .navbar-brand:focus {\n  color: #fff;\n  background-color: transparent;\n}\n.navbar-inverse .navbar-text {\n  color: #9d9d9d;\n}\n.navbar-inverse .navbar-nav > li > a {\n  color: #9d9d9d;\n}\n.navbar-inverse .navbar-nav > li > a:hover,\n.navbar-inverse .navbar-nav > li > a:focus {\n  color: #fff;\n  background-color: transparent;\n}\n.navbar-inverse .navbar-nav > .active > a,\n.navbar-inverse .navbar-nav > .active > a:hover,\n.navbar-inverse .navbar-nav > .active > a:focus {\n  color: #fff;\n  background-color: #080808;\n}\n.navbar-inverse .navbar-nav > .disabled > a,\n.navbar-inverse .navbar-nav > .disabled > a:hover,\n.navbar-inverse .navbar-nav > .disabled > a:focus {\n  color: #444;\n  background-color: transparent;\n}\n.navbar-inverse .navbar-toggle {\n  border-color: #333;\n}\n.navbar-inverse .navbar-toggle:hover,\n.navbar-inverse .navbar-toggle:focus {\n  background-color: #333;\n}\n.navbar-inverse .navbar-toggle .icon-bar {\n  background-color: #fff;\n}\n.navbar-inverse .navbar-collapse,\n.navbar-inverse .navbar-form {\n  border-color: #101010;\n}\n.navbar-inverse .navbar-nav > .open > a,\n.navbar-inverse .navbar-nav > .open > a:hover,\n.navbar-inverse .navbar-nav > .open > a:focus {\n  color: #fff;\n  background-color: #080808;\n}\n@media (max-width: 767px) {\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .dropdown-header {\n    border-color: #080808;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu .divider {\n    background-color: #080808;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu > li > a {\n    color: #9d9d9d;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:hover,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > li > a:focus {\n    color: #fff;\n    background-color: transparent;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:hover,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .active > a:focus {\n    color: #fff;\n    background-color: #080808;\n  }\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:hover,\n  .navbar-inverse .navbar-nav .open .dropdown-menu > .disabled > a:focus {\n    color: #444;\n    background-color: transparent;\n  }\n}\n.navbar-inverse .navbar-link {\n  color: #9d9d9d;\n}\n.navbar-inverse .navbar-link:hover {\n  color: #fff;\n}\n.navbar-inverse .btn-link {\n  color: #9d9d9d;\n}\n.navbar-inverse .btn-link:hover,\n.navbar-inverse .btn-link:focus {\n  color: #fff;\n}\n.navbar-inverse .btn-link[disabled]:hover,\nfieldset[disabled] .navbar-inverse .btn-link:hover,\n.navbar-inverse .btn-link[disabled]:focus,\nfieldset[disabled] .navbar-inverse .btn-link:focus {\n  color: #444;\n}\n.breadcrumb {\n  padding: 8px 15px;\n  margin-bottom: 20px;\n  list-style: none;\n  background-color: #f5f5f5;\n  border-radius: 4px;\n}\n.breadcrumb > li {\n  display: inline-block;\n}\n.breadcrumb > li + li:before {\n  padding: 0 5px;\n  color: #ccc;\n  content: \"/\\A0\";\n}\n.breadcrumb > .active {\n  color: #777;\n}\n.pagination {\n  display: inline-block;\n  padding-left: 0;\n  margin: 20px 0;\n  border-radius: 4px;\n}\n.pagination > li {\n  display: inline;\n}\n.pagination > li > a,\n.pagination > li > span {\n  position: relative;\n  float: left;\n  padding: 6px 12px;\n  margin-left: -1px;\n  line-height: 1.42857143;\n  color: #337ab7;\n  text-decoration: none;\n  background-color: #fff;\n  border: 1px solid #ddd;\n}\n.pagination > li:first-child > a,\n.pagination > li:first-child > span {\n  margin-left: 0;\n  border-top-left-radius: 4px;\n  border-bottom-left-radius: 4px;\n}\n.pagination > li:last-child > a,\n.pagination > li:last-child > span {\n  border-top-right-radius: 4px;\n  border-bottom-right-radius: 4px;\n}\n.pagination > li > a:hover,\n.pagination > li > span:hover,\n.pagination > li > a:focus,\n.pagination > li > span:focus {\n  z-index: 2;\n  color: #23527c;\n  background-color: #eee;\n  border-color: #ddd;\n}\n.pagination > .active > a,\n.pagination > .active > span,\n.pagination > .active > a:hover,\n.pagination > .active > span:hover,\n.pagination > .active > a:focus,\n.pagination > .active > span:focus {\n  z-index: 3;\n  color: #fff;\n  cursor: default;\n  background-color: #337ab7;\n  border-color: #337ab7;\n}\n.pagination > .disabled > span,\n.pagination > .disabled > span:hover,\n.pagination > .disabled > span:focus,\n.pagination > .disabled > a,\n.pagination > .disabled > a:hover,\n.pagination > .disabled > a:focus {\n  color: #777;\n  cursor: not-allowed;\n  background-color: #fff;\n  border-color: #ddd;\n}\n.pagination-lg > li > a,\n.pagination-lg > li > span {\n  padding: 10px 16px;\n  font-size: 18px;\n  line-height: 1.3333333;\n}\n.pagination-lg > li:first-child > a,\n.pagination-lg > li:first-child > span {\n  border-top-left-radius: 6px;\n  border-bottom-left-radius: 6px;\n}\n.pagination-lg > li:last-child > a,\n.pagination-lg > li:last-child > span {\n  border-top-right-radius: 6px;\n  border-bottom-right-radius: 6px;\n}\n.pagination-sm > li > a,\n.pagination-sm > li > span {\n  padding: 5px 10px;\n  font-size: 12px;\n  line-height: 1.5;\n}\n.pagination-sm > li:first-child > a,\n.pagination-sm > li:first-child > span {\n  border-top-left-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.pagination-sm > li:last-child > a,\n.pagination-sm > li:last-child > span {\n  border-top-right-radius: 3px;\n  border-bottom-right-radius: 3px;\n}\n.pager {\n  padding-left: 0;\n  margin: 20px 0;\n  text-align: center;\n  list-style: none;\n}\n.pager li {\n  display: inline;\n}\n.pager li > a,\n.pager li > span {\n  display: inline-block;\n  padding: 5px 14px;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 15px;\n}\n.pager li > a:hover,\n.pager li > a:focus {\n  text-decoration: none;\n  background-color: #eee;\n}\n.pager .next > a,\n.pager .next > span {\n  float: right;\n}\n.pager .previous > a,\n.pager .previous > span {\n  float: left;\n}\n.pager .disabled > a,\n.pager .disabled > a:hover,\n.pager .disabled > a:focus,\n.pager .disabled > span {\n  color: #777;\n  cursor: not-allowed;\n  background-color: #fff;\n}\n.label {\n  display: inline;\n  padding: .2em .6em .3em;\n  font-size: 75%;\n  font-weight: bold;\n  line-height: 1;\n  color: #fff;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  border-radius: .25em;\n}\na.label:hover,\na.label:focus {\n  color: #fff;\n  text-decoration: none;\n  cursor: pointer;\n}\n.label:empty {\n  display: none;\n}\n.btn .label {\n  position: relative;\n  top: -1px;\n}\n.label-default {\n  background-color: #777;\n}\n.label-default[href]:hover,\n.label-default[href]:focus {\n  background-color: #5e5e5e;\n}\n.label-primary {\n  background-color: #337ab7;\n}\n.label-primary[href]:hover,\n.label-primary[href]:focus {\n  background-color: #286090;\n}\n.label-success {\n  background-color: #5cb85c;\n}\n.label-success[href]:hover,\n.label-success[href]:focus {\n  background-color: #449d44;\n}\n.label-info {\n  background-color: #5bc0de;\n}\n.label-info[href]:hover,\n.label-info[href]:focus {\n  background-color: #31b0d5;\n}\n.label-warning {\n  background-color: #f0ad4e;\n}\n.label-warning[href]:hover,\n.label-warning[href]:focus {\n  background-color: #ec971f;\n}\n.label-danger {\n  background-color: #d9534f;\n}\n.label-danger[href]:hover,\n.label-danger[href]:focus {\n  background-color: #c9302c;\n}\n.badge {\n  display: inline-block;\n  min-width: 10px;\n  padding: 3px 7px;\n  font-size: 12px;\n  font-weight: bold;\n  line-height: 1;\n  color: #fff;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  background-color: #777;\n  border-radius: 10px;\n}\n.badge:empty {\n  display: none;\n}\n.btn .badge {\n  position: relative;\n  top: -1px;\n}\n.btn-xs .badge,\n.btn-group-xs > .btn .badge {\n  top: 0;\n  padding: 1px 5px;\n}\na.badge:hover,\na.badge:focus {\n  color: #fff;\n  text-decoration: none;\n  cursor: pointer;\n}\n.list-group-item.active > .badge,\n.nav-pills > .active > a > .badge {\n  color: #337ab7;\n  background-color: #fff;\n}\n.list-group-item > .badge {\n  float: right;\n}\n.list-group-item > .badge + .badge {\n  margin-right: 5px;\n}\n.nav-pills > li > a > .badge {\n  margin-left: 3px;\n}\n.jumbotron {\n  padding-top: 30px;\n  padding-bottom: 30px;\n  margin-bottom: 30px;\n  color: inherit;\n  background-color: #eee;\n}\n.jumbotron h1,\n.jumbotron .h1 {\n  color: inherit;\n}\n.jumbotron p {\n  margin-bottom: 15px;\n  font-size: 21px;\n  font-weight: 200;\n}\n.jumbotron > hr {\n  border-top-color: #d5d5d5;\n}\n.container .jumbotron,\n.container-fluid .jumbotron {\n  padding-right: 15px;\n  padding-left: 15px;\n  border-radius: 6px;\n}\n.jumbotron .container {\n  max-width: 100%;\n}\n@media screen and (min-width: 768px) {\n  .jumbotron {\n    padding-top: 48px;\n    padding-bottom: 48px;\n  }\n  .container .jumbotron,\n  .container-fluid .jumbotron {\n    padding-right: 60px;\n    padding-left: 60px;\n  }\n  .jumbotron h1,\n  .jumbotron .h1 {\n    font-size: 63px;\n  }\n}\n.thumbnail {\n  display: block;\n  padding: 4px;\n  margin-bottom: 20px;\n  line-height: 1.42857143;\n  background-color: #fff;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  -webkit-transition: border .2s ease-in-out;\n       -o-transition: border .2s ease-in-out;\n          transition: border .2s ease-in-out;\n}\n.thumbnail > img,\n.thumbnail a > img {\n  margin-right: auto;\n  margin-left: auto;\n}\na.thumbnail:hover,\na.thumbnail:focus,\na.thumbnail.active {\n  border-color: #337ab7;\n}\n.thumbnail .caption {\n  padding: 9px;\n  color: #333;\n}\n.alert {\n  padding: 15px;\n  margin-bottom: 20px;\n  border: 1px solid transparent;\n  border-radius: 4px;\n}\n.alert h4 {\n  margin-top: 0;\n  color: inherit;\n}\n.alert .alert-link {\n  font-weight: bold;\n}\n.alert > p,\n.alert > ul {\n  margin-bottom: 0;\n}\n.alert > p + p {\n  margin-top: 5px;\n}\n.alert-dismissable,\n.alert-dismissible {\n  padding-right: 35px;\n}\n.alert-dismissable .close,\n.alert-dismissible .close {\n  position: relative;\n  top: -2px;\n  right: -21px;\n  color: inherit;\n}\n.alert-success {\n  color: #3c763d;\n  background-color: #dff0d8;\n  border-color: #d6e9c6;\n}\n.alert-success hr {\n  border-top-color: #c9e2b3;\n}\n.alert-success .alert-link {\n  color: #2b542c;\n}\n.alert-info {\n  color: #31708f;\n  background-color: #d9edf7;\n  border-color: #bce8f1;\n}\n.alert-info hr {\n  border-top-color: #a6e1ec;\n}\n.alert-info .alert-link {\n  color: #245269;\n}\n.alert-warning {\n  color: #8a6d3b;\n  background-color: #fcf8e3;\n  border-color: #faebcc;\n}\n.alert-warning hr {\n  border-top-color: #f7e1b5;\n}\n.alert-warning .alert-link {\n  color: #66512c;\n}\n.alert-danger {\n  color: #a94442;\n  background-color: #f2dede;\n  border-color: #ebccd1;\n}\n.alert-danger hr {\n  border-top-color: #e4b9c0;\n}\n.alert-danger .alert-link {\n  color: #843534;\n}\n@-webkit-keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n@-o-keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n@keyframes progress-bar-stripes {\n  from {\n    background-position: 40px 0;\n  }\n  to {\n    background-position: 0 0;\n  }\n}\n.progress {\n  height: 20px;\n  margin-bottom: 20px;\n  overflow: hidden;\n  background-color: #f5f5f5;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, .1);\n          box-shadow: inset 0 1px 2px rgba(0, 0, 0, .1);\n}\n.progress-bar {\n  float: left;\n  width: 0;\n  height: 100%;\n  font-size: 12px;\n  line-height: 20px;\n  color: #fff;\n  text-align: center;\n  background-color: #337ab7;\n  -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);\n          box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);\n  -webkit-transition: width .6s ease;\n       -o-transition: width .6s ease;\n          transition: width .6s ease;\n}\n.progress-striped .progress-bar,\n.progress-bar-striped {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  -webkit-background-size: 40px 40px;\n          background-size: 40px 40px;\n}\n.progress.active .progress-bar,\n.progress-bar.active {\n  -webkit-animation: progress-bar-stripes 2s linear infinite;\n       -o-animation: progress-bar-stripes 2s linear infinite;\n          animation: progress-bar-stripes 2s linear infinite;\n}\n.progress-bar-success {\n  background-color: #5cb85c;\n}\n.progress-striped .progress-bar-success {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n}\n.progress-bar-info {\n  background-color: #5bc0de;\n}\n.progress-striped .progress-bar-info {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n}\n.progress-bar-warning {\n  background-color: #f0ad4e;\n}\n.progress-striped .progress-bar-warning {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n}\n.progress-bar-danger {\n  background-color: #d9534f;\n}\n.progress-striped .progress-bar-danger {\n  background-image: -webkit-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:      -o-linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n  background-image:         linear-gradient(45deg, rgba(255, 255, 255, .15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, .15) 50%, rgba(255, 255, 255, .15) 75%, transparent 75%, transparent);\n}\n.media {\n  margin-top: 15px;\n}\n.media:first-child {\n  margin-top: 0;\n}\n.media,\n.media-body {\n  overflow: hidden;\n  zoom: 1;\n}\n.media-body {\n  width: 10000px;\n}\n.media-object {\n  display: block;\n}\n.media-object.img-thumbnail {\n  max-width: none;\n}\n.media-right,\n.media > .pull-right {\n  padding-left: 10px;\n}\n.media-left,\n.media > .pull-left {\n  padding-right: 10px;\n}\n.media-left,\n.media-right,\n.media-body {\n  display: table-cell;\n  vertical-align: top;\n}\n.media-middle {\n  vertical-align: middle;\n}\n.media-bottom {\n  vertical-align: bottom;\n}\n.media-heading {\n  margin-top: 0;\n  margin-bottom: 5px;\n}\n.media-list {\n  padding-left: 0;\n  list-style: none;\n}\n.list-group {\n  padding-left: 0;\n  margin-bottom: 20px;\n}\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: 10px 15px;\n  margin-bottom: -1px;\n  background-color: #fff;\n  border: 1px solid #ddd;\n}\n.list-group-item:first-child {\n  border-top-left-radius: 4px;\n  border-top-right-radius: 4px;\n}\n.list-group-item:last-child {\n  margin-bottom: 0;\n  border-bottom-right-radius: 4px;\n  border-bottom-left-radius: 4px;\n}\na.list-group-item,\nbutton.list-group-item {\n  color: #555;\n}\na.list-group-item .list-group-item-heading,\nbutton.list-group-item .list-group-item-heading {\n  color: #333;\n}\na.list-group-item:hover,\nbutton.list-group-item:hover,\na.list-group-item:focus,\nbutton.list-group-item:focus {\n  color: #555;\n  text-decoration: none;\n  background-color: #f5f5f5;\n}\nbutton.list-group-item {\n  width: 100%;\n  text-align: left;\n}\n.list-group-item.disabled,\n.list-group-item.disabled:hover,\n.list-group-item.disabled:focus {\n  color: #777;\n  cursor: not-allowed;\n  background-color: #eee;\n}\n.list-group-item.disabled .list-group-item-heading,\n.list-group-item.disabled:hover .list-group-item-heading,\n.list-group-item.disabled:focus .list-group-item-heading {\n  color: inherit;\n}\n.list-group-item.disabled .list-group-item-text,\n.list-group-item.disabled:hover .list-group-item-text,\n.list-group-item.disabled:focus .list-group-item-text {\n  color: #777;\n}\n.list-group-item.active,\n.list-group-item.active:hover,\n.list-group-item.active:focus {\n  z-index: 2;\n  color: #fff;\n  background-color: #337ab7;\n  border-color: #337ab7;\n}\n.list-group-item.active .list-group-item-heading,\n.list-group-item.active:hover .list-group-item-heading,\n.list-group-item.active:focus .list-group-item-heading,\n.list-group-item.active .list-group-item-heading > small,\n.list-group-item.active:hover .list-group-item-heading > small,\n.list-group-item.active:focus .list-group-item-heading > small,\n.list-group-item.active .list-group-item-heading > .small,\n.list-group-item.active:hover .list-group-item-heading > .small,\n.list-group-item.active:focus .list-group-item-heading > .small {\n  color: inherit;\n}\n.list-group-item.active .list-group-item-text,\n.list-group-item.active:hover .list-group-item-text,\n.list-group-item.active:focus .list-group-item-text {\n  color: #c7ddef;\n}\n.list-group-item-success {\n  color: #3c763d;\n  background-color: #dff0d8;\n}\na.list-group-item-success,\nbutton.list-group-item-success {\n  color: #3c763d;\n}\na.list-group-item-success .list-group-item-heading,\nbutton.list-group-item-success .list-group-item-heading {\n  color: inherit;\n}\na.list-group-item-success:hover,\nbutton.list-group-item-success:hover,\na.list-group-item-success:focus,\nbutton.list-group-item-success:focus {\n  color: #3c763d;\n  background-color: #d0e9c6;\n}\na.list-group-item-success.active,\nbutton.list-group-item-success.active,\na.list-group-item-success.active:hover,\nbutton.list-group-item-success.active:hover,\na.list-group-item-success.active:focus,\nbutton.list-group-item-success.active:focus {\n  color: #fff;\n  background-color: #3c763d;\n  border-color: #3c763d;\n}\n.list-group-item-info {\n  color: #31708f;\n  background-color: #d9edf7;\n}\na.list-group-item-info,\nbutton.list-group-item-info {\n  color: #31708f;\n}\na.list-group-item-info .list-group-item-heading,\nbutton.list-group-item-info .list-group-item-heading {\n  color: inherit;\n}\na.list-group-item-info:hover,\nbutton.list-group-item-info:hover,\na.list-group-item-info:focus,\nbutton.list-group-item-info:focus {\n  color: #31708f;\n  background-color: #c4e3f3;\n}\na.list-group-item-info.active,\nbutton.list-group-item-info.active,\na.list-group-item-info.active:hover,\nbutton.list-group-item-info.active:hover,\na.list-group-item-info.active:focus,\nbutton.list-group-item-info.active:focus {\n  color: #fff;\n  background-color: #31708f;\n  border-color: #31708f;\n}\n.list-group-item-warning {\n  color: #8a6d3b;\n  background-color: #fcf8e3;\n}\na.list-group-item-warning,\nbutton.list-group-item-warning {\n  color: #8a6d3b;\n}\na.list-group-item-warning .list-group-item-heading,\nbutton.list-group-item-warning .list-group-item-heading {\n  color: inherit;\n}\na.list-group-item-warning:hover,\nbutton.list-group-item-warning:hover,\na.list-group-item-warning:focus,\nbutton.list-group-item-warning:focus {\n  color: #8a6d3b;\n  background-color: #faf2cc;\n}\na.list-group-item-warning.active,\nbutton.list-group-item-warning.active,\na.list-group-item-warning.active:hover,\nbutton.list-group-item-warning.active:hover,\na.list-group-item-warning.active:focus,\nbutton.list-group-item-warning.active:focus {\n  color: #fff;\n  background-color: #8a6d3b;\n  border-color: #8a6d3b;\n}\n.list-group-item-danger {\n  color: #a94442;\n  background-color: #f2dede;\n}\na.list-group-item-danger,\nbutton.list-group-item-danger {\n  color: #a94442;\n}\na.list-group-item-danger .list-group-item-heading,\nbutton.list-group-item-danger .list-group-item-heading {\n  color: inherit;\n}\na.list-group-item-danger:hover,\nbutton.list-group-item-danger:hover,\na.list-group-item-danger:focus,\nbutton.list-group-item-danger:focus {\n  color: #a94442;\n  background-color: #ebcccc;\n}\na.list-group-item-danger.active,\nbutton.list-group-item-danger.active,\na.list-group-item-danger.active:hover,\nbutton.list-group-item-danger.active:hover,\na.list-group-item-danger.active:focus,\nbutton.list-group-item-danger.active:focus {\n  color: #fff;\n  background-color: #a94442;\n  border-color: #a94442;\n}\n.list-group-item-heading {\n  margin-top: 0;\n  margin-bottom: 5px;\n}\n.list-group-item-text {\n  margin-bottom: 0;\n  line-height: 1.3;\n}\n.panel {\n  margin-bottom: 20px;\n  background-color: #fff;\n  border: 1px solid transparent;\n  border-radius: 4px;\n  -webkit-box-shadow: 0 1px 1px rgba(0, 0, 0, .05);\n          box-shadow: 0 1px 1px rgba(0, 0, 0, .05);\n}\n.panel-body {\n  padding: 15px;\n}\n.panel-heading {\n  padding: 10px 15px;\n  border-bottom: 1px solid transparent;\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.panel-heading > .dropdown .dropdown-toggle {\n  color: inherit;\n}\n.panel-title {\n  margin-top: 0;\n  margin-bottom: 0;\n  font-size: 16px;\n  color: inherit;\n}\n.panel-title > a,\n.panel-title > small,\n.panel-title > .small,\n.panel-title > small > a,\n.panel-title > .small > a {\n  color: inherit;\n}\n.panel-footer {\n  padding: 10px 15px;\n  background-color: #f5f5f5;\n  border-top: 1px solid #ddd;\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.panel > .list-group,\n.panel > .panel-collapse > .list-group {\n  margin-bottom: 0;\n}\n.panel > .list-group .list-group-item,\n.panel > .panel-collapse > .list-group .list-group-item {\n  border-width: 1px 0;\n  border-radius: 0;\n}\n.panel > .list-group:first-child .list-group-item:first-child,\n.panel > .panel-collapse > .list-group:first-child .list-group-item:first-child {\n  border-top: 0;\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.panel > .list-group:last-child .list-group-item:last-child,\n.panel > .panel-collapse > .list-group:last-child .list-group-item:last-child {\n  border-bottom: 0;\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.panel > .panel-heading + .panel-collapse > .list-group .list-group-item:first-child {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n.panel-heading + .list-group .list-group-item:first-child {\n  border-top-width: 0;\n}\n.list-group + .panel-footer {\n  border-top-width: 0;\n}\n.panel > .table,\n.panel > .table-responsive > .table,\n.panel > .panel-collapse > .table {\n  margin-bottom: 0;\n}\n.panel > .table caption,\n.panel > .table-responsive > .table caption,\n.panel > .panel-collapse > .table caption {\n  padding-right: 15px;\n  padding-left: 15px;\n}\n.panel > .table:first-child,\n.panel > .table-responsive:first-child > .table:first-child {\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.panel > .table:first-child > thead:first-child > tr:first-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child {\n  border-top-left-radius: 3px;\n  border-top-right-radius: 3px;\n}\n.panel > .table:first-child > thead:first-child > tr:first-child td:first-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:first-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:first-child,\n.panel > .table:first-child > thead:first-child > tr:first-child th:first-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:first-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child th:first-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:first-child {\n  border-top-left-radius: 3px;\n}\n.panel > .table:first-child > thead:first-child > tr:first-child td:last-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child td:last-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child td:last-child,\n.panel > .table:first-child > thead:first-child > tr:first-child th:last-child,\n.panel > .table-responsive:first-child > .table:first-child > thead:first-child > tr:first-child th:last-child,\n.panel > .table:first-child > tbody:first-child > tr:first-child th:last-child,\n.panel > .table-responsive:first-child > .table:first-child > tbody:first-child > tr:first-child th:last-child {\n  border-top-right-radius: 3px;\n}\n.panel > .table:last-child,\n.panel > .table-responsive:last-child > .table:last-child {\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.panel > .table:last-child > tbody:last-child > tr:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child {\n  border-bottom-right-radius: 3px;\n  border-bottom-left-radius: 3px;\n}\n.panel > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:first-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:first-child,\n.panel > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:first-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child th:first-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:first-child {\n  border-bottom-left-radius: 3px;\n}\n.panel > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child td:last-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child td:last-child,\n.panel > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tbody:last-child > tr:last-child th:last-child,\n.panel > .table:last-child > tfoot:last-child > tr:last-child th:last-child,\n.panel > .table-responsive:last-child > .table:last-child > tfoot:last-child > tr:last-child th:last-child {\n  border-bottom-right-radius: 3px;\n}\n.panel > .panel-body + .table,\n.panel > .panel-body + .table-responsive,\n.panel > .table + .panel-body,\n.panel > .table-responsive + .panel-body {\n  border-top: 1px solid #ddd;\n}\n.panel > .table > tbody:first-child > tr:first-child th,\n.panel > .table > tbody:first-child > tr:first-child td {\n  border-top: 0;\n}\n.panel > .table-bordered,\n.panel > .table-responsive > .table-bordered {\n  border: 0;\n}\n.panel > .table-bordered > thead > tr > th:first-child,\n.panel > .table-responsive > .table-bordered > thead > tr > th:first-child,\n.panel > .table-bordered > tbody > tr > th:first-child,\n.panel > .table-responsive > .table-bordered > tbody > tr > th:first-child,\n.panel > .table-bordered > tfoot > tr > th:first-child,\n.panel > .table-responsive > .table-bordered > tfoot > tr > th:first-child,\n.panel > .table-bordered > thead > tr > td:first-child,\n.panel > .table-responsive > .table-bordered > thead > tr > td:first-child,\n.panel > .table-bordered > tbody > tr > td:first-child,\n.panel > .table-responsive > .table-bordered > tbody > tr > td:first-child,\n.panel > .table-bordered > tfoot > tr > td:first-child,\n.panel > .table-responsive > .table-bordered > tfoot > tr > td:first-child {\n  border-left: 0;\n}\n.panel > .table-bordered > thead > tr > th:last-child,\n.panel > .table-responsive > .table-bordered > thead > tr > th:last-child,\n.panel > .table-bordered > tbody > tr > th:last-child,\n.panel > .table-responsive > .table-bordered > tbody > tr > th:last-child,\n.panel > .table-bordered > tfoot > tr > th:last-child,\n.panel > .table-responsive > .table-bordered > tfoot > tr > th:last-child,\n.panel > .table-bordered > thead > tr > td:last-child,\n.panel > .table-responsive > .table-bordered > thead > tr > td:last-child,\n.panel > .table-bordered > tbody > tr > td:last-child,\n.panel > .table-responsive > .table-bordered > tbody > tr > td:last-child,\n.panel > .table-bordered > tfoot > tr > td:last-child,\n.panel > .table-responsive > .table-bordered > tfoot > tr > td:last-child {\n  border-right: 0;\n}\n.panel > .table-bordered > thead > tr:first-child > td,\n.panel > .table-responsive > .table-bordered > thead > tr:first-child > td,\n.panel > .table-bordered > tbody > tr:first-child > td,\n.panel > .table-responsive > .table-bordered > tbody > tr:first-child > td,\n.panel > .table-bordered > thead > tr:first-child > th,\n.panel > .table-responsive > .table-bordered > thead > tr:first-child > th,\n.panel > .table-bordered > tbody > tr:first-child > th,\n.panel > .table-responsive > .table-bordered > tbody > tr:first-child > th {\n  border-bottom: 0;\n}\n.panel > .table-bordered > tbody > tr:last-child > td,\n.panel > .table-responsive > .table-bordered > tbody > tr:last-child > td,\n.panel > .table-bordered > tfoot > tr:last-child > td,\n.panel > .table-responsive > .table-bordered > tfoot > tr:last-child > td,\n.panel > .table-bordered > tbody > tr:last-child > th,\n.panel > .table-responsive > .table-bordered > tbody > tr:last-child > th,\n.panel > .table-bordered > tfoot > tr:last-child > th,\n.panel > .table-responsive > .table-bordered > tfoot > tr:last-child > th {\n  border-bottom: 0;\n}\n.panel > .table-responsive {\n  margin-bottom: 0;\n  border: 0;\n}\n.panel-group {\n  margin-bottom: 20px;\n}\n.panel-group .panel {\n  margin-bottom: 0;\n  border-radius: 4px;\n}\n.panel-group .panel + .panel {\n  margin-top: 5px;\n}\n.panel-group .panel-heading {\n  border-bottom: 0;\n}\n.panel-group .panel-heading + .panel-collapse > .panel-body,\n.panel-group .panel-heading + .panel-collapse > .list-group {\n  border-top: 1px solid #ddd;\n}\n.panel-group .panel-footer {\n  border-top: 0;\n}\n.panel-group .panel-footer + .panel-collapse .panel-body {\n  border-bottom: 1px solid #ddd;\n}\n.panel-default {\n  border-color: #ddd;\n}\n.panel-default > .panel-heading {\n  color: #333;\n  background-color: #f5f5f5;\n  border-color: #ddd;\n}\n.panel-default > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #ddd;\n}\n.panel-default > .panel-heading .badge {\n  color: #f5f5f5;\n  background-color: #333;\n}\n.panel-default > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #ddd;\n}\n.panel-primary {\n  border-color: #337ab7;\n}\n.panel-primary > .panel-heading {\n  color: #fff;\n  background-color: #337ab7;\n  border-color: #337ab7;\n}\n.panel-primary > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #337ab7;\n}\n.panel-primary > .panel-heading .badge {\n  color: #337ab7;\n  background-color: #fff;\n}\n.panel-primary > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #337ab7;\n}\n.panel-success {\n  border-color: #d6e9c6;\n}\n.panel-success > .panel-heading {\n  color: #3c763d;\n  background-color: #dff0d8;\n  border-color: #d6e9c6;\n}\n.panel-success > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #d6e9c6;\n}\n.panel-success > .panel-heading .badge {\n  color: #dff0d8;\n  background-color: #3c763d;\n}\n.panel-success > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #d6e9c6;\n}\n.panel-info {\n  border-color: #bce8f1;\n}\n.panel-info > .panel-heading {\n  color: #31708f;\n  background-color: #d9edf7;\n  border-color: #bce8f1;\n}\n.panel-info > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #bce8f1;\n}\n.panel-info > .panel-heading .badge {\n  color: #d9edf7;\n  background-color: #31708f;\n}\n.panel-info > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #bce8f1;\n}\n.panel-warning {\n  border-color: #faebcc;\n}\n.panel-warning > .panel-heading {\n  color: #8a6d3b;\n  background-color: #fcf8e3;\n  border-color: #faebcc;\n}\n.panel-warning > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #faebcc;\n}\n.panel-warning > .panel-heading .badge {\n  color: #fcf8e3;\n  background-color: #8a6d3b;\n}\n.panel-warning > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #faebcc;\n}\n.panel-danger {\n  border-color: #ebccd1;\n}\n.panel-danger > .panel-heading {\n  color: #a94442;\n  background-color: #f2dede;\n  border-color: #ebccd1;\n}\n.panel-danger > .panel-heading + .panel-collapse > .panel-body {\n  border-top-color: #ebccd1;\n}\n.panel-danger > .panel-heading .badge {\n  color: #f2dede;\n  background-color: #a94442;\n}\n.panel-danger > .panel-footer + .panel-collapse > .panel-body {\n  border-bottom-color: #ebccd1;\n}\n.embed-responsive {\n  position: relative;\n  display: block;\n  height: 0;\n  padding: 0;\n  overflow: hidden;\n}\n.embed-responsive .embed-responsive-item,\n.embed-responsive iframe,\n.embed-responsive embed,\n.embed-responsive object,\n.embed-responsive video {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n  border: 0;\n}\n.embed-responsive-16by9 {\n  padding-bottom: 56.25%;\n}\n.embed-responsive-4by3 {\n  padding-bottom: 75%;\n}\n.well {\n  min-height: 20px;\n  padding: 19px;\n  margin-bottom: 20px;\n  background-color: #f5f5f5;\n  border: 1px solid #e3e3e3;\n  border-radius: 4px;\n  -webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, .05);\n          box-shadow: inset 0 1px 1px rgba(0, 0, 0, .05);\n}\n.well blockquote {\n  border-color: #ddd;\n  border-color: rgba(0, 0, 0, .15);\n}\n.well-lg {\n  padding: 24px;\n  border-radius: 6px;\n}\n.well-sm {\n  padding: 9px;\n  border-radius: 3px;\n}\n.close {\n  float: right;\n  font-size: 21px;\n  font-weight: bold;\n  line-height: 1;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  filter: alpha(opacity=20);\n  opacity: .2;\n}\n.close:hover,\n.close:focus {\n  color: #000;\n  text-decoration: none;\n  cursor: pointer;\n  filter: alpha(opacity=50);\n  opacity: .5;\n}\nbutton.close {\n  -webkit-appearance: none;\n  padding: 0;\n  cursor: pointer;\n  background: transparent;\n  border: 0;\n}\n.modal-open {\n  overflow: hidden;\n}\n.modal {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1050;\n  display: none;\n  overflow: hidden;\n  -webkit-overflow-scrolling: touch;\n  outline: 0;\n}\n.modal.fade .modal-dialog {\n  -webkit-transition: -webkit-transform .3s ease-out;\n       -o-transition:      -o-transform .3s ease-out;\n          transition:         transform .3s ease-out;\n  -webkit-transform: translate(0, -25%);\n      -ms-transform: translate(0, -25%);\n       -o-transform: translate(0, -25%);\n          transform: translate(0, -25%);\n}\n.modal.in .modal-dialog {\n  -webkit-transform: translate(0, 0);\n      -ms-transform: translate(0, 0);\n       -o-transform: translate(0, 0);\n          transform: translate(0, 0);\n}\n.modal-open .modal {\n  overflow-x: hidden;\n  overflow-y: auto;\n}\n.modal-dialog {\n  position: relative;\n  width: auto;\n  margin: 10px;\n}\n.modal-content {\n  position: relative;\n  background-color: #fff;\n  -webkit-background-clip: padding-box;\n          background-clip: padding-box;\n  border: 1px solid #999;\n  border: 1px solid rgba(0, 0, 0, .2);\n  border-radius: 6px;\n  outline: 0;\n  -webkit-box-shadow: 0 3px 9px rgba(0, 0, 0, .5);\n          box-shadow: 0 3px 9px rgba(0, 0, 0, .5);\n}\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1040;\n  background-color: #000;\n}\n.modal-backdrop.fade {\n  filter: alpha(opacity=0);\n  opacity: 0;\n}\n.modal-backdrop.in {\n  filter: alpha(opacity=50);\n  opacity: .5;\n}\n.modal-header {\n  padding: 15px;\n  border-bottom: 1px solid #e5e5e5;\n}\n.modal-header .close {\n  margin-top: -2px;\n}\n.modal-title {\n  margin: 0;\n  line-height: 1.42857143;\n}\n.modal-body {\n  position: relative;\n  padding: 15px;\n}\n.modal-footer {\n  padding: 15px;\n  text-align: right;\n  border-top: 1px solid #e5e5e5;\n}\n.modal-footer .btn + .btn {\n  margin-bottom: 0;\n  margin-left: 5px;\n}\n.modal-footer .btn-group .btn + .btn {\n  margin-left: -1px;\n}\n.modal-footer .btn-block + .btn-block {\n  margin-left: 0;\n}\n.modal-scrollbar-measure {\n  position: absolute;\n  top: -9999px;\n  width: 50px;\n  height: 50px;\n  overflow: scroll;\n}\n@media (min-width: 768px) {\n  .modal-dialog {\n    width: 600px;\n    margin: 30px auto;\n  }\n  .modal-content {\n    -webkit-box-shadow: 0 5px 15px rgba(0, 0, 0, .5);\n            box-shadow: 0 5px 15px rgba(0, 0, 0, .5);\n  }\n  .modal-sm {\n    width: 300px;\n  }\n}\n@media (min-width: 992px) {\n  .modal-lg {\n    width: 900px;\n  }\n}\n.tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: block;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 12px;\n  font-style: normal;\n  font-weight: normal;\n  line-height: 1.42857143;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  white-space: normal;\n  filter: alpha(opacity=0);\n  opacity: 0;\n\n  line-break: auto;\n}\n.tooltip.in {\n  filter: alpha(opacity=90);\n  opacity: .9;\n}\n.tooltip.top {\n  padding: 5px 0;\n  margin-top: -3px;\n}\n.tooltip.right {\n  padding: 0 5px;\n  margin-left: 3px;\n}\n.tooltip.bottom {\n  padding: 5px 0;\n  margin-top: 3px;\n}\n.tooltip.left {\n  padding: 0 5px;\n  margin-left: -3px;\n}\n.tooltip-inner {\n  max-width: 200px;\n  padding: 3px 8px;\n  color: #fff;\n  text-align: center;\n  background-color: #000;\n  border-radius: 4px;\n}\n.tooltip-arrow {\n  position: absolute;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid;\n}\n.tooltip.top .tooltip-arrow {\n  bottom: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000;\n}\n.tooltip.top-left .tooltip-arrow {\n  right: 5px;\n  bottom: 0;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000;\n}\n.tooltip.top-right .tooltip-arrow {\n  bottom: 0;\n  left: 5px;\n  margin-bottom: -5px;\n  border-width: 5px 5px 0;\n  border-top-color: #000;\n}\n.tooltip.right .tooltip-arrow {\n  top: 50%;\n  left: 0;\n  margin-top: -5px;\n  border-width: 5px 5px 5px 0;\n  border-right-color: #000;\n}\n.tooltip.left .tooltip-arrow {\n  top: 50%;\n  right: 0;\n  margin-top: -5px;\n  border-width: 5px 0 5px 5px;\n  border-left-color: #000;\n}\n.tooltip.bottom .tooltip-arrow {\n  top: 0;\n  left: 50%;\n  margin-left: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000;\n}\n.tooltip.bottom-left .tooltip-arrow {\n  top: 0;\n  right: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000;\n}\n.tooltip.bottom-right .tooltip-arrow {\n  top: 0;\n  left: 5px;\n  margin-top: -5px;\n  border-width: 0 5px 5px;\n  border-bottom-color: #000;\n}\n.popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 1060;\n  display: none;\n  max-width: 276px;\n  padding: 1px;\n  font-family: \"Helvetica Neue\", Helvetica, Arial, sans-serif;\n  font-size: 14px;\n  font-style: normal;\n  font-weight: normal;\n  line-height: 1.42857143;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  word-spacing: normal;\n  word-wrap: normal;\n  white-space: normal;\n  background-color: #fff;\n  -webkit-background-clip: padding-box;\n          background-clip: padding-box;\n  border: 1px solid #ccc;\n  border: 1px solid rgba(0, 0, 0, .2);\n  border-radius: 6px;\n  -webkit-box-shadow: 0 5px 10px rgba(0, 0, 0, .2);\n          box-shadow: 0 5px 10px rgba(0, 0, 0, .2);\n\n  line-break: auto;\n}\n.popover.top {\n  margin-top: -10px;\n}\n.popover.right {\n  margin-left: 10px;\n}\n.popover.bottom {\n  margin-top: 10px;\n}\n.popover.left {\n  margin-left: -10px;\n}\n.popover-title {\n  padding: 8px 14px;\n  margin: 0;\n  font-size: 14px;\n  background-color: #f7f7f7;\n  border-bottom: 1px solid #ebebeb;\n  border-radius: 5px 5px 0 0;\n}\n.popover-content {\n  padding: 9px 14px;\n}\n.popover > .arrow,\n.popover > .arrow:after {\n  position: absolute;\n  display: block;\n  width: 0;\n  height: 0;\n  border-color: transparent;\n  border-style: solid;\n}\n.popover > .arrow {\n  border-width: 11px;\n}\n.popover > .arrow:after {\n  content: \"\";\n  border-width: 10px;\n}\n.popover.top > .arrow {\n  bottom: -11px;\n  left: 50%;\n  margin-left: -11px;\n  border-top-color: #999;\n  border-top-color: rgba(0, 0, 0, .25);\n  border-bottom-width: 0;\n}\n.popover.top > .arrow:after {\n  bottom: 1px;\n  margin-left: -10px;\n  content: \" \";\n  border-top-color: #fff;\n  border-bottom-width: 0;\n}\n.popover.right > .arrow {\n  top: 50%;\n  left: -11px;\n  margin-top: -11px;\n  border-right-color: #999;\n  border-right-color: rgba(0, 0, 0, .25);\n  border-left-width: 0;\n}\n.popover.right > .arrow:after {\n  bottom: -10px;\n  left: 1px;\n  content: \" \";\n  border-right-color: #fff;\n  border-left-width: 0;\n}\n.popover.bottom > .arrow {\n  top: -11px;\n  left: 50%;\n  margin-left: -11px;\n  border-top-width: 0;\n  border-bottom-color: #999;\n  border-bottom-color: rgba(0, 0, 0, .25);\n}\n.popover.bottom > .arrow:after {\n  top: 1px;\n  margin-left: -10px;\n  content: \" \";\n  border-top-width: 0;\n  border-bottom-color: #fff;\n}\n.popover.left > .arrow {\n  top: 50%;\n  right: -11px;\n  margin-top: -11px;\n  border-right-width: 0;\n  border-left-color: #999;\n  border-left-color: rgba(0, 0, 0, .25);\n}\n.popover.left > .arrow:after {\n  right: 1px;\n  bottom: -10px;\n  content: \" \";\n  border-right-width: 0;\n  border-left-color: #fff;\n}\n.carousel {\n  position: relative;\n}\n.carousel-inner {\n  position: relative;\n  width: 100%;\n  overflow: hidden;\n}\n.carousel-inner > .item {\n  position: relative;\n  display: none;\n  -webkit-transition: .6s ease-in-out left;\n       -o-transition: .6s ease-in-out left;\n          transition: .6s ease-in-out left;\n}\n.carousel-inner > .item > img,\n.carousel-inner > .item > a > img {\n  line-height: 1;\n}\n@media all and (transform-3d), (-webkit-transform-3d) {\n  .carousel-inner > .item {\n    -webkit-transition: -webkit-transform .6s ease-in-out;\n         -o-transition:      -o-transform .6s ease-in-out;\n            transition:         transform .6s ease-in-out;\n\n    -webkit-backface-visibility: hidden;\n            backface-visibility: hidden;\n    -webkit-perspective: 1000px;\n            perspective: 1000px;\n  }\n  .carousel-inner > .item.next,\n  .carousel-inner > .item.active.right {\n    left: 0;\n    -webkit-transform: translate3d(100%, 0, 0);\n            transform: translate3d(100%, 0, 0);\n  }\n  .carousel-inner > .item.prev,\n  .carousel-inner > .item.active.left {\n    left: 0;\n    -webkit-transform: translate3d(-100%, 0, 0);\n            transform: translate3d(-100%, 0, 0);\n  }\n  .carousel-inner > .item.next.left,\n  .carousel-inner > .item.prev.right,\n  .carousel-inner > .item.active {\n    left: 0;\n    -webkit-transform: translate3d(0, 0, 0);\n            transform: translate3d(0, 0, 0);\n  }\n}\n.carousel-inner > .active,\n.carousel-inner > .next,\n.carousel-inner > .prev {\n  display: block;\n}\n.carousel-inner > .active {\n  left: 0;\n}\n.carousel-inner > .next,\n.carousel-inner > .prev {\n  position: absolute;\n  top: 0;\n  width: 100%;\n}\n.carousel-inner > .next {\n  left: 100%;\n}\n.carousel-inner > .prev {\n  left: -100%;\n}\n.carousel-inner > .next.left,\n.carousel-inner > .prev.right {\n  left: 0;\n}\n.carousel-inner > .active.left {\n  left: -100%;\n}\n.carousel-inner > .active.right {\n  left: 100%;\n}\n.carousel-control {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  left: 0;\n  width: 15%;\n  font-size: 20px;\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, .6);\n  background-color: rgba(0, 0, 0, 0);\n  filter: alpha(opacity=50);\n  opacity: .5;\n}\n.carousel-control.left {\n  background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, .5) 0%, rgba(0, 0, 0, .0001) 100%);\n  background-image:      -o-linear-gradient(left, rgba(0, 0, 0, .5) 0%, rgba(0, 0, 0, .0001) 100%);\n  background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, .5)), to(rgba(0, 0, 0, .0001)));\n  background-image:         linear-gradient(to right, rgba(0, 0, 0, .5) 0%, rgba(0, 0, 0, .0001) 100%);\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#80000000', endColorstr='#00000000', GradientType=1);\n  background-repeat: repeat-x;\n}\n.carousel-control.right {\n  right: 0;\n  left: auto;\n  background-image: -webkit-linear-gradient(left, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);\n  background-image:      -o-linear-gradient(left, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);\n  background-image: -webkit-gradient(linear, left top, right top, from(rgba(0, 0, 0, .0001)), to(rgba(0, 0, 0, .5)));\n  background-image:         linear-gradient(to right, rgba(0, 0, 0, .0001) 0%, rgba(0, 0, 0, .5) 100%);\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#00000000', endColorstr='#80000000', GradientType=1);\n  background-repeat: repeat-x;\n}\n.carousel-control:hover,\n.carousel-control:focus {\n  color: #fff;\n  text-decoration: none;\n  filter: alpha(opacity=90);\n  outline: 0;\n  opacity: .9;\n}\n.carousel-control .icon-prev,\n.carousel-control .icon-next,\n.carousel-control .glyphicon-chevron-left,\n.carousel-control .glyphicon-chevron-right {\n  position: absolute;\n  top: 50%;\n  z-index: 5;\n  display: inline-block;\n  margin-top: -10px;\n}\n.carousel-control .icon-prev,\n.carousel-control .glyphicon-chevron-left {\n  left: 50%;\n  margin-left: -10px;\n}\n.carousel-control .icon-next,\n.carousel-control .glyphicon-chevron-right {\n  right: 50%;\n  margin-right: -10px;\n}\n.carousel-control .icon-prev,\n.carousel-control .icon-next {\n  width: 20px;\n  height: 20px;\n  font-family: serif;\n  line-height: 1;\n}\n.carousel-control .icon-prev:before {\n  content: '\\2039';\n}\n.carousel-control .icon-next:before {\n  content: '\\203A';\n}\n.carousel-indicators {\n  position: absolute;\n  bottom: 10px;\n  left: 50%;\n  z-index: 15;\n  width: 60%;\n  padding-left: 0;\n  margin-left: -30%;\n  text-align: center;\n  list-style: none;\n}\n.carousel-indicators li {\n  display: inline-block;\n  width: 10px;\n  height: 10px;\n  margin: 1px;\n  text-indent: -999px;\n  cursor: pointer;\n  background-color: #000 \\9;\n  background-color: rgba(0, 0, 0, 0);\n  border: 1px solid #fff;\n  border-radius: 10px;\n}\n.carousel-indicators .active {\n  width: 12px;\n  height: 12px;\n  margin: 0;\n  background-color: #fff;\n}\n.carousel-caption {\n  position: absolute;\n  right: 15%;\n  bottom: 20px;\n  left: 15%;\n  z-index: 10;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  color: #fff;\n  text-align: center;\n  text-shadow: 0 1px 2px rgba(0, 0, 0, .6);\n}\n.carousel-caption .btn {\n  text-shadow: none;\n}\n@media screen and (min-width: 768px) {\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .glyphicon-chevron-right,\n  .carousel-control .icon-prev,\n  .carousel-control .icon-next {\n    width: 30px;\n    height: 30px;\n    margin-top: -10px;\n    font-size: 30px;\n  }\n  .carousel-control .glyphicon-chevron-left,\n  .carousel-control .icon-prev {\n    margin-left: -10px;\n  }\n  .carousel-control .glyphicon-chevron-right,\n  .carousel-control .icon-next {\n    margin-right: -10px;\n  }\n  .carousel-caption {\n    right: 20%;\n    left: 20%;\n    padding-bottom: 30px;\n  }\n  .carousel-indicators {\n    bottom: 20px;\n  }\n}\n.clearfix:before,\n.clearfix:after,\n.dl-horizontal dd:before,\n.dl-horizontal dd:after,\n.container:before,\n.container:after,\n.container-fluid:before,\n.container-fluid:after,\n.row:before,\n.row:after,\n.form-horizontal .form-group:before,\n.form-horizontal .form-group:after,\n.btn-toolbar:before,\n.btn-toolbar:after,\n.btn-group-vertical > .btn-group:before,\n.btn-group-vertical > .btn-group:after,\n.nav:before,\n.nav:after,\n.navbar:before,\n.navbar:after,\n.navbar-header:before,\n.navbar-header:after,\n.navbar-collapse:before,\n.navbar-collapse:after,\n.pager:before,\n.pager:after,\n.panel-body:before,\n.panel-body:after,\n.modal-header:before,\n.modal-header:after,\n.modal-footer:before,\n.modal-footer:after {\n  display: table;\n  content: \" \";\n}\n.clearfix:after,\n.dl-horizontal dd:after,\n.container:after,\n.container-fluid:after,\n.row:after,\n.form-horizontal .form-group:after,\n.btn-toolbar:after,\n.btn-group-vertical > .btn-group:after,\n.nav:after,\n.navbar:after,\n.navbar-header:after,\n.navbar-collapse:after,\n.pager:after,\n.panel-body:after,\n.modal-header:after,\n.modal-footer:after {\n  clear: both;\n}\n.center-block {\n  display: block;\n  margin-right: auto;\n  margin-left: auto;\n}\n.pull-right {\n  float: right !important;\n}\n.pull-left {\n  float: left !important;\n}\n.hide {\n  display: none !important;\n}\n.show {\n  display: block !important;\n}\n.invisible {\n  visibility: hidden;\n}\n.text-hide {\n  font: 0/0 a;\n  color: transparent;\n  text-shadow: none;\n  background-color: transparent;\n  border: 0;\n}\n.hidden {\n  display: none !important;\n}\n.affix {\n  position: fixed;\n}\n@-ms-viewport {\n  width: device-width;\n}\n.visible-xs,\n.visible-sm,\n.visible-md,\n.visible-lg {\n  display: none !important;\n}\n.visible-xs-block,\n.visible-xs-inline,\n.visible-xs-inline-block,\n.visible-sm-block,\n.visible-sm-inline,\n.visible-sm-inline-block,\n.visible-md-block,\n.visible-md-inline,\n.visible-md-inline-block,\n.visible-lg-block,\n.visible-lg-inline,\n.visible-lg-inline-block {\n  display: none !important;\n}\n@media (max-width: 767px) {\n  .visible-xs {\n    display: block !important;\n  }\n  table.visible-xs {\n    display: table !important;\n  }\n  tr.visible-xs {\n    display: table-row !important;\n  }\n  th.visible-xs,\n  td.visible-xs {\n    display: table-cell !important;\n  }\n}\n@media (max-width: 767px) {\n  .visible-xs-block {\n    display: block !important;\n  }\n}\n@media (max-width: 767px) {\n  .visible-xs-inline {\n    display: inline !important;\n  }\n}\n@media (max-width: 767px) {\n  .visible-xs-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm {\n    display: block !important;\n  }\n  table.visible-sm {\n    display: table !important;\n  }\n  tr.visible-sm {\n    display: table-row !important;\n  }\n  th.visible-sm,\n  td.visible-sm {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-block {\n    display: block !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .visible-sm-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md {\n    display: block !important;\n  }\n  table.visible-md {\n    display: table !important;\n  }\n  tr.visible-md {\n    display: table-row !important;\n  }\n  th.visible-md,\n  td.visible-md {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-block {\n    display: block !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .visible-md-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (min-width: 1200px) {\n  .visible-lg {\n    display: block !important;\n  }\n  table.visible-lg {\n    display: table !important;\n  }\n  tr.visible-lg {\n    display: table-row !important;\n  }\n  th.visible-lg,\n  td.visible-lg {\n    display: table-cell !important;\n  }\n}\n@media (min-width: 1200px) {\n  .visible-lg-block {\n    display: block !important;\n  }\n}\n@media (min-width: 1200px) {\n  .visible-lg-inline {\n    display: inline !important;\n  }\n}\n@media (min-width: 1200px) {\n  .visible-lg-inline-block {\n    display: inline-block !important;\n  }\n}\n@media (max-width: 767px) {\n  .hidden-xs {\n    display: none !important;\n  }\n}\n@media (min-width: 768px) and (max-width: 991px) {\n  .hidden-sm {\n    display: none !important;\n  }\n}\n@media (min-width: 992px) and (max-width: 1199px) {\n  .hidden-md {\n    display: none !important;\n  }\n}\n@media (min-width: 1200px) {\n  .hidden-lg {\n    display: none !important;\n  }\n}\n.visible-print {\n  display: none !important;\n}\n@media print {\n  .visible-print {\n    display: block !important;\n  }\n  table.visible-print {\n    display: table !important;\n  }\n  tr.visible-print {\n    display: table-row !important;\n  }\n  th.visible-print,\n  td.visible-print {\n    display: table-cell !important;\n  }\n}\n.visible-print-block {\n  display: none !important;\n}\n@media print {\n  .visible-print-block {\n    display: block !important;\n  }\n}\n.visible-print-inline {\n  display: none !important;\n}\n@media print {\n  .visible-print-inline {\n    display: inline !important;\n  }\n}\n.visible-print-inline-block {\n  display: none !important;\n}\n@media print {\n  .visible-print-inline-block {\n    display: inline-block !important;\n  }\n}\n@media print {\n  .hidden-print {\n    display: none !important;\n  }\n}\n/*# sourceMappingURL=bootstrap.css.map */\n", ""]);

	// exports


/***/ },
/* 171 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(172);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(166)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/css-loader/index.js!./custom.css", function() {
				var newContent = require("!!./../../node_modules/css-loader/index.js!./custom.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 172 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(165)();
	// imports


	// module
	exports.push([module.id, "/* stylize header */\n/*h1 {\n  font-size: 45px;\n  font-weight: 300;\n  margin-top: 10px;\n  margin-bottom: 20px;\n}*/\n\n\n\n/* default svg size for fixed svg option*/\n#svg_div{\n  width:1000px;\n  height:600px;\n}\n\n.viz_medium_text{\n  width:99%;\n  margin-left: 5px;\n  margin-top: 3px;\n  margin-bottom: 3px;\n  color:#333;\n  text-align: justify;\n  font-size: 14px;\n  font-weight: 300;\n  padding-left: 0px;\n}\n\n.viz_large_text{\n  width:99%;\n  margin: 0 auto;\n  margin-top: 6px;\n  margin-bottom: 3px;\n  color:#333;\n  text-align: justify;\n  font-size: 16px;\n  font-weight: 300;\n  padding-left: 0px;\n}\n\n/* need to move d3-tip into stypes */\n.d3-tip {\n  line-height: 1;\n  font-weight: bold;\n  padding: 12px;\n  background: rgba(0, 0, 0, 0.8);\n  color: #fff;\n  border-radius: 2px;\n  max-width: 500px;\n}\n\n/* Style northward tooltips differently */\n.d3-tip.n:after {\n  margin: -1px 0 0 0;\n  top: 100%;\n  left: 0;\n}\n\n.noselect {\n    -webkit-touch-callout: none;\n    -webkit-user-select: none;\n    -khtml-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n}\n\n\n.icon_buttons{\n  color: #337ab7;\n}\n\n/*.share_url{\n  width: 570px;\n}*/\n\n.sidebar_text{\n  font-weight: 300;\n}\n\n.btn{\n  padding-top:2px;\n  padding-bottom:2px;\n}", ""]);

	// exports


/***/ },
/* 173 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var ini_sidebar = __webpack_require__(139);
	var set_up_filters = __webpack_require__(174);
	var set_up_dendro_sliders = __webpack_require__(181);
	var set_up_search = __webpack_require__(182);
	var set_up_reorder = __webpack_require__(183);
	var set_sidebar_ini_view = __webpack_require__(184);
	var make_icons = __webpack_require__(185);
	var make_modals = __webpack_require__(188);
	var set_up_opacity_slider = __webpack_require__(190);

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

	  set_up_reorder(params, sidebar);

	  set_up_search(sidebar, params);

	  set_up_opacity_slider(sidebar);

	  if (params.viz.show_dendrogram) {
	    set_up_dendro_sliders(sidebar, params);
	  }

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
/* 174 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_slider_filter = __webpack_require__(175);
	var make_button_filter = __webpack_require__(180);

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
/* 175 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(176);
	var run_filter_slider = __webpack_require__(177);
	var get_filter_default_state = __webpack_require__(5);
	var get_subset_views = __webpack_require__(12);

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

	  // $( params.root+' .slider_'+filter_type ).slider({
	  //   value:0,
	  //   min: 0,
	  //   max: inst_max,
	  //   step: 1,
	  //   stop: function() {
	  //     run_filter_slider(cgm, filter_type, available_views);
	  //   }
	  // });

	  // Filter Slider
	  //////////////////////////////////////////////////////////////////////
	  var slide_filter_fun = d3.slider()
	  // .snap(true)
	  .value(0).min(0).max(inst_max).step(1).on('slide', function (evt, value) {
	    run_filter_slider_db(cgm, filter_type, available_views, value);
	  }).on('slideend', function (evt, value) {
	    run_filter_slider_db(cgm, filter_type, available_views, value);
	  });

	  // save slider function in order to reset value later
	  cgm.slider_functions[filter_type] = slide_filter_fun;

	  d3.select(cgm.params.root + ' .slider_' + filter_type).call(slide_filter_fun);

	  //////////////////////////////////////////////////////////////////////

	  var run_filter_slider_db = _.debounce(run_filter_slider, 1500);
		};

/***/ },
/* 176 */
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
/* 177 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var update_viz_with_view = __webpack_require__(123);
	var reset_other_filter_sliders = __webpack_require__(178);
	var get_current_orders = __webpack_require__(179);
	var make_requested_view = __webpack_require__(14);

	module.exports = function run_filter_slider(cgm, filter_type, available_views, inst_index) {

	  var params = cgm.params;

	  // get value
	  var inst_state = available_views[inst_index][filter_type];

	  // console.log('fix this')
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
		};

/***/ },
/* 178 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(176);

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

	        // reset other filter slider positions
	        // $(params.root+' .slider_'+reset_filter).slider( "value", 0);

	        // d3.select('.slider_'+reset_filter).select('a').style('left','0%')

	        // console.log('reset_filter '+String(reset_filter))
	        // debugger

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
/* 179 */
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
/* 180 */
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

	    requested_view = make_requested_view(params, requested_view);

	    // console.log('\n---------\n requested_view from button filter')
	    // console.log(requested_view)

	    // update_network(config, params, requested_view);

	    d3.select(params.root + ' .toggle_enr_score_type').attr('current_state', inst_state);
	  });
		};

/***/ },
/* 181 */
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
/* 182 */
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
/* 183 */
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
/* 184 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_filter_title = __webpack_require__(176);

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
/* 185 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var save_svg_png = __webpack_require__(186);
	var file_saver = __webpack_require__(187);

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
/* 186 */
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
/* 187 */
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
/* 188 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var make_modal_skeleton = __webpack_require__(189);

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
/* 189 */
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
/* 190 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function set_up_opacity_slider(sidebar) {

	  var slider_container = sidebar.append('div').classed('opacity_slider_container', true).style('margin-top', '5px').style('padding-left', '15px').style('padding-right', '15px');

	  slider_container.append('div').classed('sidebar_text', true).classed('opacity_slider_text', true).style('margin-bottom', '3px').text('Opacity Slider');

	  slider_container.append('div').classed('slider', true).classed('opacity_slider', true);

	  // $( params.root+' .opacity_slider' ).slider({
	  //   value:1.0
	  // });
		};

/***/ }
/******/ ]);
//# sourceMappingURL=clustergrammer.js.map