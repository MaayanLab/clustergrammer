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
/***/ (function(module, exports, __webpack_require__) {

	var make_config = __webpack_require__(1);
	var make_params = __webpack_require__(10);
	var make_viz = __webpack_require__(89);
	var resize_viz = __webpack_require__(154);
	var play_demo = __webpack_require__(197);
	var ini_demo = __webpack_require__(237);
	var filter_viz_using_nodes = __webpack_require__(240);
	var filter_viz_using_names = __webpack_require__(241);
	var update_cats = __webpack_require__(242);
	var reset_cats = __webpack_require__(243);
	var two_translate_zoom = __webpack_require__(146);
	var update_view = __webpack_require__(245);
	var save_matrix = __webpack_require__(248);
	var brush_crop_matrix = __webpack_require__(252);
	var run_zoom = __webpack_require__(155);
	var d3_tip_custom = __webpack_require__(100);
	var all_reorder = __webpack_require__(145);
	var make_matrix_string = __webpack_require__(250);

	// moved d3.slider to src
	d3.slider = __webpack_require__(254);

	/* eslint-disable */

	var awesomplete = __webpack_require__(256);
	// getting css from src
	__webpack_require__(257);
	__webpack_require__(261);

	/* clustergrammer v1.19.5
	 * Nicolas Fernandez, Ma'ayan Lab, Icahn School of Medicine at Mount Sinai
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
	  cgm.params.zoom_behavior = d3.behavior.zoom().scaleExtent([1, cgm.params.viz.square_zoom * cgm.params.viz.zoom_ratio.x]).on('zoom', function () {
	    run_zoom(cgm);
	  });

	  cgm.params.zoom_behavior.translate([cgm.params.viz.clust.margin.left, cgm.params.viz.clust.margin.top]);

	  if (cgm.params.use_sidebar) {
	    var make_sidebar = __webpack_require__(263);
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

	  function api_reorder(inst_rc, inst_order) {
	    if (inst_order === 'sum') {
	      inst_order = 'rank';
	    }
	    if (inst_order === 'var') {
	      inst_order = 'rankvar';
	    }
	    all_reorder(this, inst_order, inst_rc);
	  }

	  function export_matrix_string() {
	    return make_matrix_string(this.params);
	  }

	  function external_update_view(filter_type, inst_state) {
	    update_view(this, filter_type, inst_state);
	  }

	  // add more API endpoints
	  cgm.update_view = update_view;
	  cgm.resize_viz = external_resize;
	  cgm.play_demo = play_demo;
	  cgm.ini_demo = ini_demo;
	  cgm.filter_viz_using_nodes = filter_viz_using_nodes;
	  cgm.filter_viz_using_names = filter_viz_using_names;
	  cgm.update_cats = run_update_cats;
	  cgm.reset_cats = reset_cats;
	  cgm.zoom = zoom_api;
	  cgm.save_matrix = save_matrix;
	  cgm.brush_crop_matrix = brush_crop_matrix;
	  cgm.d3_tip_custom = expose_d3_tip_custom;
	  cgm.reorder = api_reorder;
	  cgm.export_matrix_string = export_matrix_string;
	  cgm.update_view = external_update_view;

	  return cgm;
	}

	module.exports = Clustergrammer;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var transpose_network = __webpack_require__(4);
	var get_available_filters = __webpack_require__(5);
	var get_filter_default_state = __webpack_require__(6);
	var set_defaults = __webpack_require__(7);
	var check_sim_mat = __webpack_require__(8);
	var check_nodes_for_categories = __webpack_require__(9);
	var underscore = __webpack_require__(3);

	module.exports = function make_config(args) {

	  var defaults = set_defaults();

	  // Mixin defaults with user-defined arguments.
	  var config = utils.extend(defaults, args);

	  config.network_data = args.network_data;

	  var super_string = ': ';

	  // replace undersores with space in row/col names
	  underscore.each(['row', 'col'], function (inst_rc) {

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

	      d.name = String(d.name);

	      d.name = d.name.replace(/_/g, ' ');
	    });
	  });

	  config.network_data.row_nodes_names = utils.pluck(config.network_data.row_nodes, 'name');
	  config.network_data.col_nodes_names = utils.pluck(config.network_data.col_nodes, 'name');

	  config.sim_mat = check_sim_mat(config);

	  var filters = get_available_filters(config.network_data.views);

	  var default_states = {};
	  underscore.each(underscore.keys(filters.possible_filters), function (inst_filter) {
	    var tmp_state = get_filter_default_state(filters.filter_data, inst_filter);

	    default_states[inst_filter] = tmp_state;
	  });

	  // process view
	  if (_.has(config.network_data, 'views')) {
	    config.network_data.views.forEach(function (inst_view) {

	      underscore.each(underscore.keys(filters.possible_filters), function (inst_filter) {
	        if (!_.has(inst_view, inst_filter)) {
	          inst_view[inst_filter] = default_states[inst_filter];
	        }
	      });

	      var inst_nodes = inst_view.nodes;

	      // proc row/col nodes names in views
	      underscore.each(['row', 'col'], function (inst_rc) {

	        var has_cats = check_nodes_for_categories(inst_nodes[inst_rc + '_nodes']);

	        inst_nodes[inst_rc + '_nodes'].forEach(function (d, i) {

	          // add index to row_nodes and col_nodes
	          d[inst_rc + '_index'] = i;

	          if (has_cats) {
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

	  if (_.has(config.network_data, 'mat')) {

	    var links = [];
	    var mat = config.network_data.mat;
	    var inst_link = {};

	    // console.log('found mat')
	    for (var i = 0; i < mat.length; i++) {
	      for (var j = 0; j < mat[0].length; j++) {
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

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	/* Utility functions
	 * ----------------------------------------------------------------------- */
	module.exports = {
	  normal_name: function (d) {
	    var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
	    return inst_name;
	  },
	  is_supported_order: function (order) {
	    return order === 'ini' || order === 'clust' || order === 'rank_var' || order === 'rank' || order === 'class' || order == 'alpha';
	  },

	  /* Returns whether or not an object has a certain property.
	   */
	  has: function (obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  },

	  property: function (key) {
	    return function (obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  },

	  // Convenience version of a common use case of `map`: fetching a property.
	  pluck: function (arr, key) {
	    var self = this;
	    // Double check that we have lodash or underscore available
	    if (window._) {
	      // Underscore provides a pluck function. Use that.
	      if (typeof underscore.pluck === 'function') {
	        return underscore.pluck(arr, key);
	      } else if (typeof underscore.map === 'function') {
	        // Lodash does not have a pluck function.
	        // Use underscore.map with the property function defined above.
	        return underscore.map(arr, self.property(key));
	      }
	    } else if (arr.map && typeof arr.map === 'function') {
	      // If lodash or underscore not available, check to see if the native arr.map is available.
	      // If so, use it with the property function defined above.
	      return arr.map(self.property(key));
	    }
	  },

	  /* Returns true if the object is undefined.
	   */
	  is_undefined: function (obj) {
	    return obj === void 0;
	  },

	  /* Mixes two objects in together, overwriting a target with a source.
	   */
	  extend: function (target, source) {
	    target = target || {};
	    for (var prop in source) {
	      if (typeof source[prop] === 'object') {
	        target[prop] = this.extend(target[prop], source[prop]);
	      } else {
	        target[prop] = source[prop];
	      }
	    }
	    return target;
	  }
		};

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
	//     http://underscorejs.org
	//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	//     Underscore may be freely distributed under the MIT license.

	(function () {

	  // Baseline setup
	  // --------------

	  // Establish the root object, `window` in the browser, or `exports` on the server.
	  var root = this;

	  // Save the previous value of the `_` variable.
	  var previousUnderscore = root._;

	  // Save bytes in the minified (but not gzipped) version:
	  var ArrayProto = Array.prototype,
	      ObjProto = Object.prototype,
	      FuncProto = Function.prototype;

	  // Create quick reference variables for speed access to core prototypes.
	  var push = ArrayProto.push,
	      slice = ArrayProto.slice,
	      toString = ObjProto.toString,
	      hasOwnProperty = ObjProto.hasOwnProperty;

	  // All **ECMAScript 5** native function implementations that we hope to use
	  // are declared here.
	  var nativeIsArray = Array.isArray,
	      nativeKeys = Object.keys,
	      nativeBind = FuncProto.bind,
	      nativeCreate = Object.create;

	  // Naked function reference for surrogate-prototype-swapping.
	  var Ctor = function () {};

	  // Create a safe reference to the Underscore object for use below.
	  var _ = function (obj) {
	    if (obj instanceof _) return obj;
	    if (!(this instanceof _)) return new _(obj);
	    this._wrapped = obj;
	  };

	  // Export the Underscore object for **Node.js**, with
	  // backwards-compatibility for the old `require()` API. If we're in
	  // the browser, add `_` as a global object.
	  if (true) {
	    if (typeof module !== 'undefined' && module.exports) {
	      exports = module.exports = _;
	    }
	    exports._ = _;
	  } else {
	    root._ = _;
	  }

	  // Current version.
	  _.VERSION = '1.8.3';

	  // Internal function that returns an efficient (for current engines) version
	  // of the passed-in callback, to be repeatedly applied in other Underscore
	  // functions.
	  var optimizeCb = function (func, context, argCount) {
	    if (context === void 0) return func;
	    switch (argCount == null ? 3 : argCount) {
	      case 1:
	        return function (value) {
	          return func.call(context, value);
	        };
	      case 2:
	        return function (value, other) {
	          return func.call(context, value, other);
	        };
	      case 3:
	        return function (value, index, collection) {
	          return func.call(context, value, index, collection);
	        };
	      case 4:
	        return function (accumulator, value, index, collection) {
	          return func.call(context, accumulator, value, index, collection);
	        };
	    }
	    return function () {
	      return func.apply(context, arguments);
	    };
	  };

	  // A mostly-internal function to generate callbacks that can be applied
	  // to each element in a collection, returning the desired result — either
	  // identity, an arbitrary callback, a property matcher, or a property accessor.
	  var cb = function (value, context, argCount) {
	    if (value == null) return _.identity;
	    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
	    if (_.isObject(value)) return _.matcher(value);
	    return _.property(value);
	  };
	  _.iteratee = function (value, context) {
	    return cb(value, context, Infinity);
	  };

	  // An internal function for creating assigner functions.
	  var createAssigner = function (keysFunc, undefinedOnly) {
	    return function (obj) {
	      var length = arguments.length;
	      if (length < 2 || obj == null) return obj;
	      for (var index = 1; index < length; index++) {
	        var source = arguments[index],
	            keys = keysFunc(source),
	            l = keys.length;
	        for (var i = 0; i < l; i++) {
	          var key = keys[i];
	          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
	        }
	      }
	      return obj;
	    };
	  };

	  // An internal function for creating a new object that inherits from another.
	  var baseCreate = function (prototype) {
	    if (!_.isObject(prototype)) return {};
	    if (nativeCreate) return nativeCreate(prototype);
	    Ctor.prototype = prototype;
	    var result = new Ctor();
	    Ctor.prototype = null;
	    return result;
	  };

	  var property = function (key) {
	    return function (obj) {
	      return obj == null ? void 0 : obj[key];
	    };
	  };

	  // Helper for collection methods to determine whether a collection
	  // should be iterated as an array or as an object
	  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
	  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
	  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
	  var getLength = property('length');
	  var isArrayLike = function (collection) {
	    var length = getLength(collection);
	    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
	  };

	  // Collection Functions
	  // --------------------

	  // The cornerstone, an `each` implementation, aka `forEach`.
	  // Handles raw objects in addition to array-likes. Treats all
	  // sparse array-likes as if they were dense.
	  _.each = _.forEach = function (obj, iteratee, context) {
	    iteratee = optimizeCb(iteratee, context);
	    var i, length;
	    if (isArrayLike(obj)) {
	      for (i = 0, length = obj.length; i < length; i++) {
	        iteratee(obj[i], i, obj);
	      }
	    } else {
	      var keys = _.keys(obj);
	      for (i = 0, length = keys.length; i < length; i++) {
	        iteratee(obj[keys[i]], keys[i], obj);
	      }
	    }
	    return obj;
	  };

	  // Return the results of applying the iteratee to each element.
	  _.map = _.collect = function (obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length,
	        results = Array(length);
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      results[index] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Create a reducing function iterating left or right.
	  function createReduce(dir) {
	    // Optimized iterator function as using arguments.length
	    // in the main function will deoptimize the, see #1991.
	    function iterator(obj, iteratee, memo, keys, index, length) {
	      for (; index >= 0 && index < length; index += dir) {
	        var currentKey = keys ? keys[index] : index;
	        memo = iteratee(memo, obj[currentKey], currentKey, obj);
	      }
	      return memo;
	    }

	    return function (obj, iteratee, memo, context) {
	      iteratee = optimizeCb(iteratee, context, 4);
	      var keys = !isArrayLike(obj) && _.keys(obj),
	          length = (keys || obj).length,
	          index = dir > 0 ? 0 : length - 1;
	      // Determine the initial value if none is provided.
	      if (arguments.length < 3) {
	        memo = obj[keys ? keys[index] : index];
	        index += dir;
	      }
	      return iterator(obj, iteratee, memo, keys, index, length);
	    };
	  }

	  // **Reduce** builds up a single result from a list of values, aka `inject`,
	  // or `foldl`.
	  _.reduce = _.foldl = _.inject = createReduce(1);

	  // The right-associative version of reduce, also known as `foldr`.
	  _.reduceRight = _.foldr = createReduce(-1);

	  // Return the first value which passes a truth test. Aliased as `detect`.
	  _.find = _.detect = function (obj, predicate, context) {
	    var key;
	    if (isArrayLike(obj)) {
	      key = _.findIndex(obj, predicate, context);
	    } else {
	      key = _.findKey(obj, predicate, context);
	    }
	    if (key !== void 0 && key !== -1) return obj[key];
	  };

	  // Return all the elements that pass a truth test.
	  // Aliased as `select`.
	  _.filter = _.select = function (obj, predicate, context) {
	    var results = [];
	    predicate = cb(predicate, context);
	    _.each(obj, function (value, index, list) {
	      if (predicate(value, index, list)) results.push(value);
	    });
	    return results;
	  };

	  // Return all the elements for which a truth test fails.
	  _.reject = function (obj, predicate, context) {
	    return _.filter(obj, _.negate(cb(predicate)), context);
	  };

	  // Determine whether all of the elements match a truth test.
	  // Aliased as `all`.
	  _.every = _.all = function (obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (!predicate(obj[currentKey], currentKey, obj)) return false;
	    }
	    return true;
	  };

	  // Determine if at least one element in the object matches a truth test.
	  // Aliased as `any`.
	  _.some = _.any = function (obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = !isArrayLike(obj) && _.keys(obj),
	        length = (keys || obj).length;
	    for (var index = 0; index < length; index++) {
	      var currentKey = keys ? keys[index] : index;
	      if (predicate(obj[currentKey], currentKey, obj)) return true;
	    }
	    return false;
	  };

	  // Determine if the array or object contains a given item (using `===`).
	  // Aliased as `includes` and `include`.
	  _.contains = _.includes = _.include = function (obj, item, fromIndex, guard) {
	    if (!isArrayLike(obj)) obj = _.values(obj);
	    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
	    return _.indexOf(obj, item, fromIndex) >= 0;
	  };

	  // Invoke a method (with arguments) on every item in a collection.
	  _.invoke = function (obj, method) {
	    var args = slice.call(arguments, 2);
	    var isFunc = _.isFunction(method);
	    return _.map(obj, function (value) {
	      var func = isFunc ? method : value[method];
	      return func == null ? func : func.apply(value, args);
	    });
	  };

	  // Convenience version of a common use case of `map`: fetching a property.
	  _.pluck = function (obj, key) {
	    return _.map(obj, _.property(key));
	  };

	  // Convenience version of a common use case of `filter`: selecting only objects
	  // containing specific `key:value` pairs.
	  _.where = function (obj, attrs) {
	    return _.filter(obj, _.matcher(attrs));
	  };

	  // Convenience version of a common use case of `find`: getting the first object
	  // containing specific `key:value` pairs.
	  _.findWhere = function (obj, attrs) {
	    return _.find(obj, _.matcher(attrs));
	  };

	  // Return the maximum element (or element-based computation).
	  _.max = function (obj, iteratee, context) {
	    var result = -Infinity,
	        lastComputed = -Infinity,
	        value,
	        computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value > result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function (value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Return the minimum element (or element-based computation).
	  _.min = function (obj, iteratee, context) {
	    var result = Infinity,
	        lastComputed = Infinity,
	        value,
	        computed;
	    if (iteratee == null && obj != null) {
	      obj = isArrayLike(obj) ? obj : _.values(obj);
	      for (var i = 0, length = obj.length; i < length; i++) {
	        value = obj[i];
	        if (value < result) {
	          result = value;
	        }
	      }
	    } else {
	      iteratee = cb(iteratee, context);
	      _.each(obj, function (value, index, list) {
	        computed = iteratee(value, index, list);
	        if (computed < lastComputed || computed === Infinity && result === Infinity) {
	          result = value;
	          lastComputed = computed;
	        }
	      });
	    }
	    return result;
	  };

	  // Shuffle a collection, using the modern version of the
	  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	  _.shuffle = function (obj) {
	    var set = isArrayLike(obj) ? obj : _.values(obj);
	    var length = set.length;
	    var shuffled = Array(length);
	    for (var index = 0, rand; index < length; index++) {
	      rand = _.random(0, index);
	      if (rand !== index) shuffled[index] = shuffled[rand];
	      shuffled[rand] = set[index];
	    }
	    return shuffled;
	  };

	  // Sample **n** random values from a collection.
	  // If **n** is not specified, returns a single random element.
	  // The internal `guard` argument allows it to work with `map`.
	  _.sample = function (obj, n, guard) {
	    if (n == null || guard) {
	      if (!isArrayLike(obj)) obj = _.values(obj);
	      return obj[_.random(obj.length - 1)];
	    }
	    return _.shuffle(obj).slice(0, Math.max(0, n));
	  };

	  // Sort the object's values by a criterion produced by an iteratee.
	  _.sortBy = function (obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    return _.pluck(_.map(obj, function (value, index, list) {
	      return {
	        value: value,
	        index: index,
	        criteria: iteratee(value, index, list)
	      };
	    }).sort(function (left, right) {
	      var a = left.criteria;
	      var b = right.criteria;
	      if (a !== b) {
	        if (a > b || a === void 0) return 1;
	        if (a < b || b === void 0) return -1;
	      }
	      return left.index - right.index;
	    }), 'value');
	  };

	  // An internal function used for aggregate "group by" operations.
	  var group = function (behavior) {
	    return function (obj, iteratee, context) {
	      var result = {};
	      iteratee = cb(iteratee, context);
	      _.each(obj, function (value, index) {
	        var key = iteratee(value, index, obj);
	        behavior(result, value, key);
	      });
	      return result;
	    };
	  };

	  // Groups the object's values by a criterion. Pass either a string attribute
	  // to group by, or a function that returns the criterion.
	  _.groupBy = group(function (result, value, key) {
	    if (_.has(result, key)) result[key].push(value);else result[key] = [value];
	  });

	  // Indexes the object's values by a criterion, similar to `groupBy`, but for
	  // when you know that your index values will be unique.
	  _.indexBy = group(function (result, value, key) {
	    result[key] = value;
	  });

	  // Counts instances of an object that group by a certain criterion. Pass
	  // either a string attribute to count by, or a function that returns the
	  // criterion.
	  _.countBy = group(function (result, value, key) {
	    if (_.has(result, key)) result[key]++;else result[key] = 1;
	  });

	  // Safely create a real, live array from anything iterable.
	  _.toArray = function (obj) {
	    if (!obj) return [];
	    if (_.isArray(obj)) return slice.call(obj);
	    if (isArrayLike(obj)) return _.map(obj, _.identity);
	    return _.values(obj);
	  };

	  // Return the number of elements in an object.
	  _.size = function (obj) {
	    if (obj == null) return 0;
	    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
	  };

	  // Split a collection into two arrays: one whose elements all satisfy the given
	  // predicate, and one whose elements all do not satisfy the predicate.
	  _.partition = function (obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var pass = [],
	        fail = [];
	    _.each(obj, function (value, key, obj) {
	      (predicate(value, key, obj) ? pass : fail).push(value);
	    });
	    return [pass, fail];
	  };

	  // Array Functions
	  // ---------------

	  // Get the first element of an array. Passing **n** will return the first N
	  // values in the array. Aliased as `head` and `take`. The **guard** check
	  // allows it to work with `_.map`.
	  _.first = _.head = _.take = function (array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[0];
	    return _.initial(array, array.length - n);
	  };

	  // Returns everything but the last entry of the array. Especially useful on
	  // the arguments object. Passing **n** will return all the values in
	  // the array, excluding the last N.
	  _.initial = function (array, n, guard) {
	    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
	  };

	  // Get the last element of an array. Passing **n** will return the last N
	  // values in the array.
	  _.last = function (array, n, guard) {
	    if (array == null) return void 0;
	    if (n == null || guard) return array[array.length - 1];
	    return _.rest(array, Math.max(0, array.length - n));
	  };

	  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
	  // Especially useful on the arguments object. Passing an **n** will return
	  // the rest N values in the array.
	  _.rest = _.tail = _.drop = function (array, n, guard) {
	    return slice.call(array, n == null || guard ? 1 : n);
	  };

	  // Trim out all falsy values from an array.
	  _.compact = function (array) {
	    return _.filter(array, _.identity);
	  };

	  // Internal implementation of a recursive `flatten` function.
	  var flatten = function (input, shallow, strict, startIndex) {
	    var output = [],
	        idx = 0;
	    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
	      var value = input[i];
	      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
	        //flatten current level of array or arguments object
	        if (!shallow) value = flatten(value, shallow, strict);
	        var j = 0,
	            len = value.length;
	        output.length += len;
	        while (j < len) {
	          output[idx++] = value[j++];
	        }
	      } else if (!strict) {
	        output[idx++] = value;
	      }
	    }
	    return output;
	  };

	  // Flatten out an array, either recursively (by default), or just one level.
	  _.flatten = function (array, shallow) {
	    return flatten(array, shallow, false);
	  };

	  // Return a version of the array that does not contain the specified value(s).
	  _.without = function (array) {
	    return _.difference(array, slice.call(arguments, 1));
	  };

	  // Produce a duplicate-free version of the array. If the array has already
	  // been sorted, you have the option of using a faster algorithm.
	  // Aliased as `unique`.
	  _.uniq = _.unique = function (array, isSorted, iteratee, context) {
	    if (!_.isBoolean(isSorted)) {
	      context = iteratee;
	      iteratee = isSorted;
	      isSorted = false;
	    }
	    if (iteratee != null) iteratee = cb(iteratee, context);
	    var result = [];
	    var seen = [];
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var value = array[i],
	          computed = iteratee ? iteratee(value, i, array) : value;
	      if (isSorted) {
	        if (!i || seen !== computed) result.push(value);
	        seen = computed;
	      } else if (iteratee) {
	        if (!_.contains(seen, computed)) {
	          seen.push(computed);
	          result.push(value);
	        }
	      } else if (!_.contains(result, value)) {
	        result.push(value);
	      }
	    }
	    return result;
	  };

	  // Produce an array that contains the union: each distinct element from all of
	  // the passed-in arrays.
	  _.union = function () {
	    return _.uniq(flatten(arguments, true, true));
	  };

	  // Produce an array that contains every item shared between all the
	  // passed-in arrays.
	  _.intersection = function (array) {
	    var result = [];
	    var argsLength = arguments.length;
	    for (var i = 0, length = getLength(array); i < length; i++) {
	      var item = array[i];
	      if (_.contains(result, item)) continue;
	      for (var j = 1; j < argsLength; j++) {
	        if (!_.contains(arguments[j], item)) break;
	      }
	      if (j === argsLength) result.push(item);
	    }
	    return result;
	  };

	  // Take the difference between one array and a number of other arrays.
	  // Only the elements present in just the first array will remain.
	  _.difference = function (array) {
	    var rest = flatten(arguments, true, true, 1);
	    return _.filter(array, function (value) {
	      return !_.contains(rest, value);
	    });
	  };

	  // Zip together multiple lists into a single array -- elements that share
	  // an index go together.
	  _.zip = function () {
	    return _.unzip(arguments);
	  };

	  // Complement of _.zip. Unzip accepts an array of arrays and groups
	  // each array's elements on shared indices
	  _.unzip = function (array) {
	    var length = array && _.max(array, getLength).length || 0;
	    var result = Array(length);

	    for (var index = 0; index < length; index++) {
	      result[index] = _.pluck(array, index);
	    }
	    return result;
	  };

	  // Converts lists into objects. Pass either a single array of `[key, value]`
	  // pairs, or two parallel arrays of the same length -- one of keys, and one of
	  // the corresponding values.
	  _.object = function (list, values) {
	    var result = {};
	    for (var i = 0, length = getLength(list); i < length; i++) {
	      if (values) {
	        result[list[i]] = values[i];
	      } else {
	        result[list[i][0]] = list[i][1];
	      }
	    }
	    return result;
	  };

	  // Generator function to create the findIndex and findLastIndex functions
	  function createPredicateIndexFinder(dir) {
	    return function (array, predicate, context) {
	      predicate = cb(predicate, context);
	      var length = getLength(array);
	      var index = dir > 0 ? 0 : length - 1;
	      for (; index >= 0 && index < length; index += dir) {
	        if (predicate(array[index], index, array)) return index;
	      }
	      return -1;
	    };
	  }

	  // Returns the first index on an array-like that passes a predicate test
	  _.findIndex = createPredicateIndexFinder(1);
	  _.findLastIndex = createPredicateIndexFinder(-1);

	  // Use a comparator function to figure out the smallest index at which
	  // an object should be inserted so as to maintain order. Uses binary search.
	  _.sortedIndex = function (array, obj, iteratee, context) {
	    iteratee = cb(iteratee, context, 1);
	    var value = iteratee(obj);
	    var low = 0,
	        high = getLength(array);
	    while (low < high) {
	      var mid = Math.floor((low + high) / 2);
	      if (iteratee(array[mid]) < value) low = mid + 1;else high = mid;
	    }
	    return low;
	  };

	  // Generator function to create the indexOf and lastIndexOf functions
	  function createIndexFinder(dir, predicateFind, sortedIndex) {
	    return function (array, item, idx) {
	      var i = 0,
	          length = getLength(array);
	      if (typeof idx == 'number') {
	        if (dir > 0) {
	          i = idx >= 0 ? idx : Math.max(idx + length, i);
	        } else {
	          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
	        }
	      } else if (sortedIndex && idx && length) {
	        idx = sortedIndex(array, item);
	        return array[idx] === item ? idx : -1;
	      }
	      if (item !== item) {
	        idx = predicateFind(slice.call(array, i, length), _.isNaN);
	        return idx >= 0 ? idx + i : -1;
	      }
	      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
	        if (array[idx] === item) return idx;
	      }
	      return -1;
	    };
	  }

	  // Return the position of the first occurrence of an item in an array,
	  // or -1 if the item is not included in the array.
	  // If the array is large and already in sort order, pass `true`
	  // for **isSorted** to use binary search.
	  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
	  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

	  // Generate an integer Array containing an arithmetic progression. A port of
	  // the native Python `range()` function. See
	  // [the Python documentation](http://docs.python.org/library/functions.html#range).
	  _.range = function (start, stop, step) {
	    if (stop == null) {
	      stop = start || 0;
	      start = 0;
	    }
	    step = step || 1;

	    var length = Math.max(Math.ceil((stop - start) / step), 0);
	    var range = Array(length);

	    for (var idx = 0; idx < length; idx++, start += step) {
	      range[idx] = start;
	    }

	    return range;
	  };

	  // Function (ahem) Functions
	  // ------------------

	  // Determines whether to execute a function as a constructor
	  // or a normal function with the provided arguments
	  var executeBound = function (sourceFunc, boundFunc, context, callingContext, args) {
	    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
	    var self = baseCreate(sourceFunc.prototype);
	    var result = sourceFunc.apply(self, args);
	    if (_.isObject(result)) return result;
	    return self;
	  };

	  // Create a function bound to a given object (assigning `this`, and arguments,
	  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
	  // available.
	  _.bind = function (func, context) {
	    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
	    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
	    var args = slice.call(arguments, 2);
	    var bound = function () {
	      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
	    };
	    return bound;
	  };

	  // Partially apply a function by creating a version that has had some of its
	  // arguments pre-filled, without changing its dynamic `this` context. _ acts
	  // as a placeholder, allowing any combination of arguments to be pre-filled.
	  _.partial = function (func) {
	    var boundArgs = slice.call(arguments, 1);
	    var bound = function () {
	      var position = 0,
	          length = boundArgs.length;
	      var args = Array(length);
	      for (var i = 0; i < length; i++) {
	        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
	      }
	      while (position < arguments.length) args.push(arguments[position++]);
	      return executeBound(func, bound, this, this, args);
	    };
	    return bound;
	  };

	  // Bind a number of an object's methods to that object. Remaining arguments
	  // are the method names to be bound. Useful for ensuring that all callbacks
	  // defined on an object belong to it.
	  _.bindAll = function (obj) {
	    var i,
	        length = arguments.length,
	        key;
	    if (length <= 1) throw new Error('bindAll must be passed function names');
	    for (i = 1; i < length; i++) {
	      key = arguments[i];
	      obj[key] = _.bind(obj[key], obj);
	    }
	    return obj;
	  };

	  // Memoize an expensive function by storing its results.
	  _.memoize = function (func, hasher) {
	    var memoize = function (key) {
	      var cache = memoize.cache;
	      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
	      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
	      return cache[address];
	    };
	    memoize.cache = {};
	    return memoize;
	  };

	  // Delays a function for the given number of milliseconds, and then calls
	  // it with the arguments supplied.
	  _.delay = function (func, wait) {
	    var args = slice.call(arguments, 2);
	    return setTimeout(function () {
	      return func.apply(null, args);
	    }, wait);
	  };

	  // Defers a function, scheduling it to run after the current call stack has
	  // cleared.
	  _.defer = _.partial(_.delay, _, 1);

	  // Returns a function, that, when invoked, will only be triggered at most once
	  // during a given window of time. Normally, the throttled function will run
	  // as much as it can, without ever going more than once per `wait` duration;
	  // but if you'd like to disable the execution on the leading edge, pass
	  // `{leading: false}`. To disable execution on the trailing edge, ditto.
	  _.throttle = function (func, wait, options) {
	    var context, args, result;
	    var timeout = null;
	    var previous = 0;
	    if (!options) options = {};
	    var later = function () {
	      previous = options.leading === false ? 0 : _.now();
	      timeout = null;
	      result = func.apply(context, args);
	      if (!timeout) context = args = null;
	    };
	    return function () {
	      var now = _.now();
	      if (!previous && options.leading === false) previous = now;
	      var remaining = wait - (now - previous);
	      context = this;
	      args = arguments;
	      if (remaining <= 0 || remaining > wait) {
	        if (timeout) {
	          clearTimeout(timeout);
	          timeout = null;
	        }
	        previous = now;
	        result = func.apply(context, args);
	        if (!timeout) context = args = null;
	      } else if (!timeout && options.trailing !== false) {
	        timeout = setTimeout(later, remaining);
	      }
	      return result;
	    };
	  };

	  // Returns a function, that, as long as it continues to be invoked, will not
	  // be triggered. The function will be called after it stops being called for
	  // N milliseconds. If `immediate` is passed, trigger the function on the
	  // leading edge, instead of the trailing.
	  _.debounce = function (func, wait, immediate) {
	    var timeout, args, context, timestamp, result;

	    var later = function () {
	      var last = _.now() - timestamp;

	      if (last < wait && last >= 0) {
	        timeout = setTimeout(later, wait - last);
	      } else {
	        timeout = null;
	        if (!immediate) {
	          result = func.apply(context, args);
	          if (!timeout) context = args = null;
	        }
	      }
	    };

	    return function () {
	      context = this;
	      args = arguments;
	      timestamp = _.now();
	      var callNow = immediate && !timeout;
	      if (!timeout) timeout = setTimeout(later, wait);
	      if (callNow) {
	        result = func.apply(context, args);
	        context = args = null;
	      }

	      return result;
	    };
	  };

	  // Returns the first function passed as an argument to the second,
	  // allowing you to adjust arguments, run code before and after, and
	  // conditionally execute the original function.
	  _.wrap = function (func, wrapper) {
	    return _.partial(wrapper, func);
	  };

	  // Returns a negated version of the passed-in predicate.
	  _.negate = function (predicate) {
	    return function () {
	      return !predicate.apply(this, arguments);
	    };
	  };

	  // Returns a function that is the composition of a list of functions, each
	  // consuming the return value of the function that follows.
	  _.compose = function () {
	    var args = arguments;
	    var start = args.length - 1;
	    return function () {
	      var i = start;
	      var result = args[start].apply(this, arguments);
	      while (i--) result = args[i].call(this, result);
	      return result;
	    };
	  };

	  // Returns a function that will only be executed on and after the Nth call.
	  _.after = function (times, func) {
	    return function () {
	      if (--times < 1) {
	        return func.apply(this, arguments);
	      }
	    };
	  };

	  // Returns a function that will only be executed up to (but not including) the Nth call.
	  _.before = function (times, func) {
	    var memo;
	    return function () {
	      if (--times > 0) {
	        memo = func.apply(this, arguments);
	      }
	      if (times <= 1) func = null;
	      return memo;
	    };
	  };

	  // Returns a function that will be executed at most one time, no matter how
	  // often you call it. Useful for lazy initialization.
	  _.once = _.partial(_.before, 2);

	  // Object Functions
	  // ----------------

	  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
	  var hasEnumBug = !{ toString: null }.propertyIsEnumerable('toString');
	  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString', 'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

	  function collectNonEnumProps(obj, keys) {
	    var nonEnumIdx = nonEnumerableProps.length;
	    var constructor = obj.constructor;
	    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

	    // Constructor is a special case.
	    var prop = 'constructor';
	    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

	    while (nonEnumIdx--) {
	      prop = nonEnumerableProps[nonEnumIdx];
	      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
	        keys.push(prop);
	      }
	    }
	  }

	  // Retrieve the names of an object's own properties.
	  // Delegates to **ECMAScript 5**'s native `Object.keys`
	  _.keys = function (obj) {
	    if (!_.isObject(obj)) return [];
	    if (nativeKeys) return nativeKeys(obj);
	    var keys = [];
	    for (var key in obj) if (_.has(obj, key)) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve all the property names of an object.
	  _.allKeys = function (obj) {
	    if (!_.isObject(obj)) return [];
	    var keys = [];
	    for (var key in obj) keys.push(key);
	    // Ahem, IE < 9.
	    if (hasEnumBug) collectNonEnumProps(obj, keys);
	    return keys;
	  };

	  // Retrieve the values of an object's properties.
	  _.values = function (obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var values = Array(length);
	    for (var i = 0; i < length; i++) {
	      values[i] = obj[keys[i]];
	    }
	    return values;
	  };

	  // Returns the results of applying the iteratee to each element of the object
	  // In contrast to _.map it returns an object
	  _.mapObject = function (obj, iteratee, context) {
	    iteratee = cb(iteratee, context);
	    var keys = _.keys(obj),
	        length = keys.length,
	        results = {},
	        currentKey;
	    for (var index = 0; index < length; index++) {
	      currentKey = keys[index];
	      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
	    }
	    return results;
	  };

	  // Convert an object into a list of `[key, value]` pairs.
	  _.pairs = function (obj) {
	    var keys = _.keys(obj);
	    var length = keys.length;
	    var pairs = Array(length);
	    for (var i = 0; i < length; i++) {
	      pairs[i] = [keys[i], obj[keys[i]]];
	    }
	    return pairs;
	  };

	  // Invert the keys and values of an object. The values must be serializable.
	  _.invert = function (obj) {
	    var result = {};
	    var keys = _.keys(obj);
	    for (var i = 0, length = keys.length; i < length; i++) {
	      result[obj[keys[i]]] = keys[i];
	    }
	    return result;
	  };

	  // Return a sorted list of the function names available on the object.
	  // Aliased as `methods`
	  _.functions = _.methods = function (obj) {
	    var names = [];
	    for (var key in obj) {
	      if (_.isFunction(obj[key])) names.push(key);
	    }
	    return names.sort();
	  };

	  // Extend a given object with all the properties in passed-in object(s).
	  _.extend = createAssigner(_.allKeys);

	  // Assigns a given object with all the own properties in the passed-in object(s)
	  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
	  _.extendOwn = _.assign = createAssigner(_.keys);

	  // Returns the first key on an object that passes a predicate test
	  _.findKey = function (obj, predicate, context) {
	    predicate = cb(predicate, context);
	    var keys = _.keys(obj),
	        key;
	    for (var i = 0, length = keys.length; i < length; i++) {
	      key = keys[i];
	      if (predicate(obj[key], key, obj)) return key;
	    }
	  };

	  // Return a copy of the object only containing the whitelisted properties.
	  _.pick = function (object, oiteratee, context) {
	    var result = {},
	        obj = object,
	        iteratee,
	        keys;
	    if (obj == null) return result;
	    if (_.isFunction(oiteratee)) {
	      keys = _.allKeys(obj);
	      iteratee = optimizeCb(oiteratee, context);
	    } else {
	      keys = flatten(arguments, false, false, 1);
	      iteratee = function (value, key, obj) {
	        return key in obj;
	      };
	      obj = Object(obj);
	    }
	    for (var i = 0, length = keys.length; i < length; i++) {
	      var key = keys[i];
	      var value = obj[key];
	      if (iteratee(value, key, obj)) result[key] = value;
	    }
	    return result;
	  };

	  // Return a copy of the object without the blacklisted properties.
	  _.omit = function (obj, iteratee, context) {
	    if (_.isFunction(iteratee)) {
	      iteratee = _.negate(iteratee);
	    } else {
	      var keys = _.map(flatten(arguments, false, false, 1), String);
	      iteratee = function (value, key) {
	        return !_.contains(keys, key);
	      };
	    }
	    return _.pick(obj, iteratee, context);
	  };

	  // Fill in a given object with default properties.
	  _.defaults = createAssigner(_.allKeys, true);

	  // Creates an object that inherits from the given prototype object.
	  // If additional properties are provided then they will be added to the
	  // created object.
	  _.create = function (prototype, props) {
	    var result = baseCreate(prototype);
	    if (props) _.extendOwn(result, props);
	    return result;
	  };

	  // Create a (shallow-cloned) duplicate of an object.
	  _.clone = function (obj) {
	    if (!_.isObject(obj)) return obj;
	    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
	  };

	  // Invokes interceptor with the obj, and then returns obj.
	  // The primary purpose of this method is to "tap into" a method chain, in
	  // order to perform operations on intermediate results within the chain.
	  _.tap = function (obj, interceptor) {
	    interceptor(obj);
	    return obj;
	  };

	  // Returns whether an object has a given set of `key:value` pairs.
	  _.isMatch = function (object, attrs) {
	    var keys = _.keys(attrs),
	        length = keys.length;
	    if (object == null) return !length;
	    var obj = Object(object);
	    for (var i = 0; i < length; i++) {
	      var key = keys[i];
	      if (attrs[key] !== obj[key] || !(key in obj)) return false;
	    }
	    return true;
	  };

	  // Internal recursive comparison function for `isEqual`.
	  var eq = function (a, b, aStack, bStack) {
	    // Identical objects are equal. `0 === -0`, but they aren't identical.
	    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	    if (a === b) return a !== 0 || 1 / a === 1 / b;
	    // A strict comparison is necessary because `null == undefined`.
	    if (a == null || b == null) return a === b;
	    // Unwrap any wrapped objects.
	    if (a instanceof _) a = a._wrapped;
	    if (b instanceof _) b = b._wrapped;
	    // Compare `[[Class]]` names.
	    var className = toString.call(a);
	    if (className !== toString.call(b)) return false;
	    switch (className) {
	      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
	      case '[object RegExp]':
	      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
	      case '[object String]':
	        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
	        // equivalent to `new String("5")`.
	        return '' + a === '' + b;
	      case '[object Number]':
	        // `NaN`s are equivalent, but non-reflexive.
	        // Object(NaN) is equivalent to NaN
	        if (+a !== +a) return +b !== +b;
	        // An `egal` comparison is performed for other numeric values.
	        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
	      case '[object Date]':
	      case '[object Boolean]':
	        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	        // millisecond representations. Note that invalid dates with millisecond representations
	        // of `NaN` are not equivalent.
	        return +a === +b;
	    }

	    var areArrays = className === '[object Array]';
	    if (!areArrays) {
	      if (typeof a != 'object' || typeof b != 'object') return false;

	      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
	      // from different frames are.
	      var aCtor = a.constructor,
	          bCtor = b.constructor;
	      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor && _.isFunction(bCtor) && bCtor instanceof bCtor) && 'constructor' in a && 'constructor' in b) {
	        return false;
	      }
	    }
	    // Assume equality for cyclic structures. The algorithm for detecting cyclic
	    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

	    // Initializing stack of traversed objects.
	    // It's done here since we only need them for objects and arrays comparison.
	    aStack = aStack || [];
	    bStack = bStack || [];
	    var length = aStack.length;
	    while (length--) {
	      // Linear search. Performance is inversely proportional to the number of
	      // unique nested structures.
	      if (aStack[length] === a) return bStack[length] === b;
	    }

	    // Add the first object to the stack of traversed objects.
	    aStack.push(a);
	    bStack.push(b);

	    // Recursively compare objects and arrays.
	    if (areArrays) {
	      // Compare array lengths to determine if a deep comparison is necessary.
	      length = a.length;
	      if (length !== b.length) return false;
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (length--) {
	        if (!eq(a[length], b[length], aStack, bStack)) return false;
	      }
	    } else {
	      // Deep compare objects.
	      var keys = _.keys(a),
	          key;
	      length = keys.length;
	      // Ensure that both objects contain the same number of properties before comparing deep equality.
	      if (_.keys(b).length !== length) return false;
	      while (length--) {
	        // Deep compare each member
	        key = keys[length];
	        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
	      }
	    }
	    // Remove the first object from the stack of traversed objects.
	    aStack.pop();
	    bStack.pop();
	    return true;
	  };

	  // Perform a deep comparison to check if two objects are equal.
	  _.isEqual = function (a, b) {
	    return eq(a, b);
	  };

	  // Is a given array, string, or object empty?
	  // An "empty" object has no enumerable own-properties.
	  _.isEmpty = function (obj) {
	    if (obj == null) return true;
	    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
	    return _.keys(obj).length === 0;
	  };

	  // Is a given value a DOM element?
	  _.isElement = function (obj) {
	    return !!(obj && obj.nodeType === 1);
	  };

	  // Is a given value an array?
	  // Delegates to ECMA5's native Array.isArray
	  _.isArray = nativeIsArray || function (obj) {
	    return toString.call(obj) === '[object Array]';
	  };

	  // Is a given variable an object?
	  _.isObject = function (obj) {
	    var type = typeof obj;
	    return type === 'function' || type === 'object' && !!obj;
	  };

	  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
	  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function (name) {
	    _['is' + name] = function (obj) {
	      return toString.call(obj) === '[object ' + name + ']';
	    };
	  });

	  // Define a fallback version of the method in browsers (ahem, IE < 9), where
	  // there isn't any inspectable "Arguments" type.
	  if (!_.isArguments(arguments)) {
	    _.isArguments = function (obj) {
	      return _.has(obj, 'callee');
	    };
	  }

	  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
	  // IE 11 (#1621), and in Safari 8 (#1929).
	  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	    _.isFunction = function (obj) {
	      return typeof obj == 'function' || false;
	    };
	  }

	  // Is a given object a finite number?
	  _.isFinite = function (obj) {
	    return isFinite(obj) && !isNaN(parseFloat(obj));
	  };

	  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
	  _.isNaN = function (obj) {
	    return _.isNumber(obj) && obj !== +obj;
	  };

	  // Is a given value a boolean?
	  _.isBoolean = function (obj) {
	    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
	  };

	  // Is a given value equal to null?
	  _.isNull = function (obj) {
	    return obj === null;
	  };

	  // Is a given variable undefined?
	  _.isUndefined = function (obj) {
	    return obj === void 0;
	  };

	  // Shortcut function for checking if an object has a given property directly
	  // on itself (in other words, not on a prototype).
	  _.has = function (obj, key) {
	    return obj != null && hasOwnProperty.call(obj, key);
	  };

	  // Utility Functions
	  // -----------------

	  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
	  // previous owner. Returns a reference to the Underscore object.
	  _.noConflict = function () {
	    root._ = previousUnderscore;
	    return this;
	  };

	  // Keep the identity function around for default iteratees.
	  _.identity = function (value) {
	    return value;
	  };

	  // Predicate-generating functions. Often useful outside of Underscore.
	  _.constant = function (value) {
	    return function () {
	      return value;
	    };
	  };

	  _.noop = function () {};

	  _.property = property;

	  // Generates a function for a given object that returns a given property.
	  _.propertyOf = function (obj) {
	    return obj == null ? function () {} : function (key) {
	      return obj[key];
	    };
	  };

	  // Returns a predicate for checking whether an object has a given set of
	  // `key:value` pairs.
	  _.matcher = _.matches = function (attrs) {
	    attrs = _.extendOwn({}, attrs);
	    return function (obj) {
	      return _.isMatch(obj, attrs);
	    };
	  };

	  // Run a function **n** times.
	  _.times = function (n, iteratee, context) {
	    var accum = Array(Math.max(0, n));
	    iteratee = optimizeCb(iteratee, context, 1);
	    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
	    return accum;
	  };

	  // Return a random integer between min and max (inclusive).
	  _.random = function (min, max) {
	    if (max == null) {
	      max = min;
	      min = 0;
	    }
	    return min + Math.floor(Math.random() * (max - min + 1));
	  };

	  // A (possibly faster) way to get the current timestamp as an integer.
	  _.now = Date.now || function () {
	    return new Date().getTime();
	  };

	  // List of HTML entities for escaping.
	  var escapeMap = {
	    '&': '&amp;',
	    '<': '&lt;',
	    '>': '&gt;',
	    '"': '&quot;',
	    "'": '&#x27;',
	    '`': '&#x60;'
	  };
	  var unescapeMap = _.invert(escapeMap);

	  // Functions for escaping and unescaping strings to/from HTML interpolation.
	  var createEscaper = function (map) {
	    var escaper = function (match) {
	      return map[match];
	    };
	    // Regexes for identifying a key that needs to be escaped
	    var source = '(?:' + _.keys(map).join('|') + ')';
	    var testRegexp = RegExp(source);
	    var replaceRegexp = RegExp(source, 'g');
	    return function (string) {
	      string = string == null ? '' : '' + string;
	      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
	    };
	  };
	  _.escape = createEscaper(escapeMap);
	  _.unescape = createEscaper(unescapeMap);

	  // If the value of the named `property` is a function then invoke it with the
	  // `object` as context; otherwise, return it.
	  _.result = function (object, property, fallback) {
	    var value = object == null ? void 0 : object[property];
	    if (value === void 0) {
	      value = fallback;
	    }
	    return _.isFunction(value) ? value.call(object) : value;
	  };

	  // Generate a unique integer id (unique within the entire client session).
	  // Useful for temporary DOM ids.
	  var idCounter = 0;
	  _.uniqueId = function (prefix) {
	    var id = ++idCounter + '';
	    return prefix ? prefix + id : id;
	  };

	  // By default, Underscore uses ERB-style template delimiters, change the
	  // following template settings to use alternative delimiters.
	  _.templateSettings = {
	    evaluate: /<%([\s\S]+?)%>/g,
	    interpolate: /<%=([\s\S]+?)%>/g,
	    escape: /<%-([\s\S]+?)%>/g
	  };

	  // When customizing `templateSettings`, if you don't want to define an
	  // interpolation, evaluation or escaping regex, we need one that is
	  // guaranteed not to match.
	  var noMatch = /(.)^/;

	  // Certain characters need to be escaped so that they can be put into a
	  // string literal.
	  var escapes = {
	    "'": "'",
	    '\\': '\\',
	    '\r': 'r',
	    '\n': 'n',
	    '\u2028': 'u2028',
	    '\u2029': 'u2029'
	  };

	  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

	  var escapeChar = function (match) {
	    return '\\' + escapes[match];
	  };

	  // JavaScript micro-templating, similar to John Resig's implementation.
	  // Underscore templating handles arbitrary delimiters, preserves whitespace,
	  // and correctly escapes quotes within interpolated code.
	  // NB: `oldSettings` only exists for backwards compatibility.
	  _.template = function (text, settings, oldSettings) {
	    if (!settings && oldSettings) settings = oldSettings;
	    settings = _.defaults({}, settings, _.templateSettings);

	    // Combine delimiters into one regular expression via alternation.
	    var matcher = RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

	    // Compile the template source, escaping string literals appropriately.
	    var index = 0;
	    var source = "__p+='";
	    text.replace(matcher, function (match, escape, interpolate, evaluate, offset) {
	      source += text.slice(index, offset).replace(escaper, escapeChar);
	      index = offset + match.length;

	      if (escape) {
	        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
	      } else if (interpolate) {
	        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
	      } else if (evaluate) {
	        source += "';\n" + evaluate + "\n__p+='";
	      }

	      // Adobe VMs need the match returned to produce the correct offest.
	      return match;
	    });
	    source += "';\n";

	    // If a variable is not specified, place data values in local scope.
	    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

	    source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + 'return __p;\n';

	    try {
	      var render = new Function(settings.variable || 'obj', '_', source);
	    } catch (e) {
	      e.source = source;
	      throw e;
	    }

	    var template = function (data) {
	      return render.call(this, data, _);
	    };

	    // Provide the compiled source as a convenience for precompilation.
	    var argument = settings.variable || 'obj';
	    template.source = 'function(' + argument + '){\n' + source + '}';

	    return template;
	  };

	  // Add a "chain" function. Start chaining a wrapped Underscore object.
	  _.chain = function (obj) {
	    var instance = _(obj);
	    instance._chain = true;
	    return instance;
	  };

	  // OOP
	  // ---------------
	  // If Underscore is called as a function, it returns a wrapped object that
	  // can be used OO-style. This wrapper holds altered versions of all the
	  // underscore functions. Wrapped objects may be chained.

	  // Helper function to continue chaining intermediate results.
	  var result = function (instance, obj) {
	    return instance._chain ? _(obj).chain() : obj;
	  };

	  // Add your own custom functions to the Underscore object.
	  _.mixin = function (obj) {
	    _.each(_.functions(obj), function (name) {
	      var func = _[name] = obj[name];
	      _.prototype[name] = function () {
	        var args = [this._wrapped];
	        push.apply(args, arguments);
	        return result(this, func.apply(_, args));
	      };
	    });
	  };

	  // Add all of the Underscore functions to the wrapper object.
	  _.mixin(_);

	  // Add all mutator Array functions to the wrapper.
	  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function (name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function () {
	      var obj = this._wrapped;
	      method.apply(obj, arguments);
	      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
	      return result(this, obj);
	    };
	  });

	  // Add all accessor Array functions to the wrapper.
	  _.each(['concat', 'join', 'slice'], function (name) {
	    var method = ArrayProto[name];
	    _.prototype[name] = function () {
	      return result(this, method.apply(this._wrapped, arguments));
	    };
	  });

	  // Extracts the result from a wrapped and chained object.
	  _.prototype.value = function () {
	    return this._wrapped;
	  };

	  // Provide unwrapping proxy for some methods used in engine operations
	  // such as arithmetic and JSON stringification.
	  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

	  _.prototype.toString = function () {
	    return '' + this._wrapped;
	  };

	  // AMD registration happens at the end for compatibility with AMD loaders
	  // that may not enforce next-turn semantics on modules. Even though general
	  // practice for AMD registration is to be anonymous, underscore registers
	  // as a named module because, like jQuery, it is a base library that is
	  // popular enough to be bundled in a third party lib, but not be part of
	  // an AMD load request. Those cases could generate an error when an
	  // anonymous define() is called outside of a loader request.
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
	      return _;
	    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  }
	}).call(this);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function get_available_filters(views) {

	  var possible_filters = {};
	  var filter_data = {};

	  underscore.each(views, function (inst_view) {
	    var inst_keys = underscore.keys(inst_view);

	    underscore.each(inst_keys, function (inst_key) {

	      if (inst_key != 'nodes') {

	        if (!_.has(filter_data, inst_key)) {
	          filter_data[inst_key] = [];
	        }

	        filter_data[inst_key].push(inst_view[inst_key]);

	        filter_data[inst_key] = underscore.uniq(filter_data[inst_key]);
	      }
	    });
	  });

	  var tmp_filters = underscore.keys(filter_data);

	  underscore.each(tmp_filters, function (inst_filter) {

	    var options = filter_data[inst_filter];
	    var num_options = options.length;

	    var filter_type = 'categorical';
	    underscore.each(options, function (inst_option) {
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

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	module.exports = function get_filter_default_state(filter_data, filter_type) {

	  var default_state = filter_data[filter_type].sort(function (a, b) {
	    return b - a;
	  })[0];

	  default_state = String(default_state);

	  return default_state;
	};

/***/ }),
/* 7 */
/***/ (function(module, exports) {

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
	    make_tile_tooltip: function (d) {
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
	    cat_update_callback: null,
	    dendro_callback: null,
	    dendro_click_callback: null,
	    new_row_cats: null,
	    make_modals: true,
	    show_viz_border: false
	  };

	  return defaults;
	};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function check_sim_mat(config) {

	  var sim_mat = false;

	  var num_rows = config.network_data.row_nodes_names.length;
	  var num_cols = config.network_data.col_nodes_names.length;

	  if (num_rows == num_cols) {

	    // the sort here was causing errors
	    var rows = config.network_data.row_nodes_names;
	    var cols = config.network_data.col_nodes_names;
	    sim_mat = true;

	    underscore.each(rows, function (inst_row) {
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

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function check_nodes_for_categories(nodes) {

	  var super_string = ': ';
	  var has_cat = true;

	  underscore.each(nodes, function (inst_node) {
	    var inst_name = String(inst_node.name);
	    if (inst_name.indexOf(super_string) < 0) {
	      has_cat = false;
	    }
	  });

	  return has_cat;
		};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	var make_network_using_view = __webpack_require__(11);
	var ini_sidebar_params = __webpack_require__(65);
	var make_requested_view = __webpack_require__(66);
	var get_available_filters = __webpack_require__(5);
	var calc_viz_params = __webpack_require__(67);
	var ini_zoom_info = __webpack_require__(88);

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

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	var filter_network_using_new_nodes = __webpack_require__(12);
	var get_subset_views = __webpack_require__(64);

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

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var core = __webpack_require__(13);
	var underscore = __webpack_require__(3);
	var math = core.create();
	math.import(__webpack_require__(26));
	math.import(__webpack_require__(63));

	module.exports = function filter_network_using_new_nodes(config, new_nodes) {

	  var links = config.network_data.links;

	  // // make new mat from links
	  // var new_mat = config.network_data.mat;

	  // get new names of rows and cols
	  var row_names = utils.pluck(new_nodes.row_nodes, 'name');
	  var col_names = utils.pluck(new_nodes.col_nodes, 'name');

	  var new_mat = math.matrix(math.zeros([new_nodes.row_nodes.length, new_nodes.col_nodes.length]));
	  new_mat = new_mat.toArray();

	  var new_links = underscore.filter(links, function (inst_link) {

	    var inst_row = inst_link.name.split('_')[0];
	    var inst_col = inst_link.name.split('_')[1];

	    var row_index = underscore.indexOf(row_names, inst_row);
	    var col_index = underscore.indexOf(col_names, inst_col);

	    // only keep links that have not been filtered out
	    if (row_index > -1 & col_index > -1) {

	      // redefine source and target
	      inst_link.source = row_index;
	      inst_link.target = col_index;

	      new_mat[row_index][col_index] = inst_link.value;

	      return inst_link;
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

	  // save all links
	  new_network_data.links = new_links;
	  new_network_data.all_links = links;

	  // mat
	  new_network_data.mat = new_mat;

	  // add back all views
	  new_network_data.views = config.network_data.views;

	  // add cat_colors if necessary
	  if (_.has(config.network_data, 'cat_colors')) {
	    new_network_data.cat_colors = config.network_data.cat_colors;
	  }

	  return new_network_data;
	};

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(14);

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

	var isFactory = __webpack_require__(15).isFactory;
	var typedFactory = __webpack_require__(17);
	var emitter = __webpack_require__(21);

	var importFactory = __webpack_require__(23);
	var configFactory = __webpack_require__(25);

	/**
	 * Math.js core. Creates a new, empty math.js instance
	 * @param {Object} [options] Available options:
	 *                            {number} epsilon
	 *                              Minimum relative difference between two
	 *                              compared values, used by all comparison functions.
	 *                            {string} matrix
	 *                              A string 'Matrix' (default) or 'Array'.
	 *                            {string} number
	 *                              A string 'number' (default), 'BigNumber', or 'Fraction'
	 *                            {number} precision
	 *                              The number of significant digits for BigNumbers.
	 *                              Not applicable for Numbers.
	 *                            {boolean} predictable
	 *                              Predictable output type of functions. When true,
	 *                              output type depends only on the input types. When
	 *                              false (default), output type can vary depending
	 *                              on input values. For example `math.sqrt(-4)`
	 *                              returns `complex('2i')` when predictable is false, and
	 *                              returns `NaN` when true.
	 *                            {string} randomSeed
	 *                              Random seed for seeded pseudo random number generator.
	 *                              Set to null to randomly seed.
	 * @returns {Object} Returns a bare-bone math.js instance containing
	 *                   functions:
	 *                   - `import` to add new functions
	 *                   - `config` to change configuration
	 *                   - `on`, `off`, `once`, `emit` for events
	 */
	exports.create = function create(options) {
	  // simple test for ES5 support
	  if (typeof Object.create !== 'function') {
	    throw new Error('ES5 not supported by this JavaScript engine. ' + 'Please load the es5-shim and es5-sham library for compatibility.');
	  }

	  // cached factories and instances
	  var factories = [];
	  var instances = [];

	  // create a namespace for the mathjs instance, and attach emitter functions
	  var math = emitter.mixin({});
	  math.type = {};
	  math.expression = {
	    transform: {},
	    mathWithTransform: {}
	  };

	  // create a new typed instance
	  math.typed = typedFactory.create(math.type);

	  // create configuration options. These are private
	  var _config = {
	    // minimum relative difference between two compared values,
	    // used by all comparison functions
	    epsilon: 1e-12,

	    // type of default matrix output. Choose 'matrix' (default) or 'array'
	    matrix: 'Matrix',

	    // type of default number output. Choose 'number' (default) 'BigNumber', or 'Fraction
	    number: 'number',

	    // number of significant digits in BigNumbers
	    precision: 64,

	    // predictable output type of functions. When true, output type depends only
	    // on the input types. When false (default), output type can vary depending
	    // on input values. For example `math.sqrt(-4)` returns `complex('2i')` when
	    // predictable is false, and returns `NaN` when true.
	    predictable: false,

	    // random seed for seeded pseudo random number generation
	    // null = randomly seed
	    randomSeed: null
	  };

	  /**
	   * Load a function or data type from a factory.
	   * If the function or data type already exists, the existing instance is
	   * returned.
	   * @param {{type: string, name: string, factory: Function}} factory
	   * @returns {*}
	   */
	  function load(factory) {
	    if (!isFactory(factory)) {
	      throw new Error('Factory object with properties `type`, `name`, and `factory` expected');
	    }

	    var index = factories.indexOf(factory);
	    var instance;
	    if (index === -1) {
	      // doesn't yet exist
	      if (factory.math === true) {
	        // pass with math namespace
	        instance = factory.factory(math.type, _config, load, math.typed, math);
	      } else {
	        instance = factory.factory(math.type, _config, load, math.typed);
	      }

	      // append to the cache
	      factories.push(factory);
	      instances.push(instance);
	    } else {
	      // already existing function, return the cached instance
	      instance = instances[index];
	    }

	    return instance;
	  }

	  // load the import and config functions
	  math['import'] = load(importFactory);
	  math['config'] = load(configFactory);
	  math.expression.mathWithTransform['config'] = math['config'];

	  // apply options
	  if (options) {
	    math.config(options);
	  }

	  return math;
	};

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var isBigNumber = __webpack_require__(16);

	/**
	 * Clone an object
	 *
	 *     clone(x)
	 *
	 * Can clone any primitive type, array, and object.
	 * If x has a function clone, this function will be invoked to clone the object.
	 *
	 * @param {*} x
	 * @return {*} clone
	 */
	exports.clone = function clone(x) {
	  var type = typeof x;

	  // immutable primitive types
	  if (type === 'number' || type === 'string' || type === 'boolean' || x === null || x === undefined) {
	    return x;
	  }

	  // use clone function of the object when available
	  if (typeof x.clone === 'function') {
	    return x.clone();
	  }

	  // array
	  if (Array.isArray(x)) {
	    return x.map(function (value) {
	      return clone(value);
	    });
	  }

	  if (x instanceof Number) return new Number(x.valueOf());
	  if (x instanceof String) return new String(x.valueOf());
	  if (x instanceof Boolean) return new Boolean(x.valueOf());
	  if (x instanceof Date) return new Date(x.valueOf());
	  if (isBigNumber(x)) return x; // bignumbers are immutable
	  if (x instanceof RegExp) throw new TypeError('Cannot clone ' + x); // TODO: clone a RegExp

	  // object
	  return exports.map(x, clone);
	};

	/**
	 * Apply map to all properties of an object
	 * @param {Object} object
	 * @param {function} callback
	 * @return {Object} Returns a copy of the object with mapped properties
	 */
	exports.map = function (object, callback) {
	  var clone = {};

	  for (var key in object) {
	    if (exports.hasOwnProperty(object, key)) {
	      clone[key] = callback(object[key]);
	    }
	  }

	  return clone;
	};

	/**
	 * Extend object a with the properties of object b
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Object} a
	 */
	exports.extend = function (a, b) {
	  for (var prop in b) {
	    if (exports.hasOwnProperty(b, prop)) {
	      a[prop] = b[prop];
	    }
	  }
	  return a;
	};

	/**
	 * Deep extend an object a with the properties of object b
	 * @param {Object} a
	 * @param {Object} b
	 * @returns {Object}
	 */
	exports.deepExtend = function deepExtend(a, b) {
	  // TODO: add support for Arrays to deepExtend
	  if (Array.isArray(b)) {
	    throw new TypeError('Arrays are not supported by deepExtend');
	  }

	  for (var prop in b) {
	    if (exports.hasOwnProperty(b, prop)) {
	      if (b[prop] && b[prop].constructor === Object) {
	        if (a[prop] === undefined) {
	          a[prop] = {};
	        }
	        if (a[prop].constructor === Object) {
	          deepExtend(a[prop], b[prop]);
	        } else {
	          a[prop] = b[prop];
	        }
	      } else if (Array.isArray(b[prop])) {
	        throw new TypeError('Arrays are not supported by deepExtend');
	      } else {
	        a[prop] = b[prop];
	      }
	    }
	  }
	  return a;
	};

	/**
	 * Deep test equality of all fields in two pairs of arrays or objects.
	 * @param {Array | Object} a
	 * @param {Array | Object} b
	 * @returns {boolean}
	 */
	exports.deepEqual = function deepEqual(a, b) {
	  var prop, i, len;
	  if (Array.isArray(a)) {
	    if (!Array.isArray(b)) {
	      return false;
	    }

	    if (a.length != b.length) {
	      return false;
	    }

	    for (i = 0, len = a.length; i < len; i++) {
	      if (!exports.deepEqual(a[i], b[i])) {
	        return false;
	      }
	    }
	    return true;
	  } else if (a instanceof Object) {
	    if (Array.isArray(b) || !(b instanceof Object)) {
	      return false;
	    }

	    for (prop in a) {
	      //noinspection JSUnfilteredForInLoop
	      if (!exports.deepEqual(a[prop], b[prop])) {
	        return false;
	      }
	    }
	    for (prop in b) {
	      //noinspection JSUnfilteredForInLoop
	      if (!exports.deepEqual(a[prop], b[prop])) {
	        return false;
	      }
	    }
	    return true;
	  } else {
	    return typeof a === typeof b && a == b;
	  }
	};

	/**
	 * Test whether the current JavaScript engine supports Object.defineProperty
	 * @returns {boolean} returns true if supported
	 */
	exports.canDefineProperty = function () {
	  // test needed for broken IE8 implementation
	  try {
	    if (Object.defineProperty) {
	      Object.defineProperty({}, 'x', { get: function () {} });
	      return true;
	    }
	  } catch (e) {}

	  return false;
	};

	/**
	 * Attach a lazy loading property to a constant.
	 * The given function `fn` is called once when the property is first requested.
	 * On older browsers (<IE8), the function will fall back to direct evaluation
	 * of the properties value.
	 * @param {Object} object   Object where to add the property
	 * @param {string} prop     Property name
	 * @param {Function} fn     Function returning the property value. Called
	 *                          without arguments.
	 */
	exports.lazy = function (object, prop, fn) {
	  if (exports.canDefineProperty()) {
	    var _uninitialized = true;
	    var _value;
	    Object.defineProperty(object, prop, {
	      get: function () {
	        if (_uninitialized) {
	          _value = fn();
	          _uninitialized = false;
	        }
	        return _value;
	      },

	      set: function (value) {
	        _value = value;
	        _uninitialized = false;
	      },

	      configurable: true,
	      enumerable: true
	    });
	  } else {
	    // fall back to immediate evaluation
	    object[prop] = fn();
	  }
	};

	/**
	 * Traverse a path into an object.
	 * When a namespace is missing, it will be created
	 * @param {Object} object
	 * @param {string} path   A dot separated string like 'name.space'
	 * @return {Object} Returns the object at the end of the path
	 */
	exports.traverse = function (object, path) {
	  var obj = object;

	  if (path) {
	    var names = path.split('.');
	    for (var i = 0; i < names.length; i++) {
	      var name = names[i];
	      if (!(name in obj)) {
	        obj[name] = {};
	      }
	      obj = obj[name];
	    }
	  }

	  return obj;
	};

	/**
	 * A safe hasOwnProperty
	 * @param {Object} object
	 * @param {string} property
	 */
	exports.hasOwnProperty = function (object, property) {
	  return object && Object.hasOwnProperty.call(object, property);
	};

	/**
	 * Test whether an object is a factory. a factory has fields:
	 *
	 * - factory: function (type: Object, config: Object, load: function, typed: function [, math: Object])   (required)
	 * - name: string (optional)
	 * - path: string    A dot separated path (optional)
	 * - math: boolean   If true (false by default), the math namespace is passed
	 *                   as fifth argument of the factory function
	 *
	 * @param {*} object
	 * @returns {boolean}
	 */
	exports.isFactory = function (object) {
	  return object && typeof object.factory === 'function';
	};

/***/ }),
/* 16 */
/***/ (function(module, exports) {

	/**
	 * Test whether a value is a BigNumber
	 * @param {*} x
	 * @return {boolean}
	 */
	module.exports = function isBigNumber(x) {
	  return x && x.constructor.prototype.isBigNumber || false;
	};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

	var typedFunction = __webpack_require__(18);
	var digits = __webpack_require__(19).digits;
	var isBigNumber = __webpack_require__(16);
	var isMatrix = __webpack_require__(20);

	// returns a new instance of typed-function
	var createTyped = function () {
	  // initially, return the original instance of typed-function
	  // consecutively, return a new instance from typed.create.
	  createTyped = typedFunction.create;
	  return typedFunction;
	};

	/**
	 * Factory function for creating a new typed instance
	 * @param {Object} type   Object with data types like Complex and BigNumber
	 * @returns {Function}
	 */
	exports.create = function create(type) {
	  // TODO: typed-function must be able to silently ignore signatures with unknown data types

	  // type checks for all known types
	  //
	  // note that:
	  //
	  // - check by duck-typing on a property like `isUnit`, instead of checking instanceof.
	  //   instanceof cannot be used because that would not allow to pass data from
	  //   one instance of math.js to another since each has it's own instance of Unit.
	  // - check the `isUnit` property via the constructor, so there will be no
	  //   matches for "fake" instances like plain objects with a property `isUnit`.
	  //   That is important for security reasons.
	  // - It must not be possible to override the type checks used internally,
	  //   for security reasons, so these functions are not exposed in the expression
	  //   parser.
	  type.isNumber = function (x) {
	    return typeof x === 'number';
	  };
	  type.isComplex = function (x) {
	    return type.Complex && x instanceof type.Complex || false;
	  };
	  type.isBigNumber = isBigNumber;
	  type.isFraction = function (x) {
	    return type.Fraction && x instanceof type.Fraction || false;
	  };
	  type.isUnit = function (x) {
	    return x && x.constructor.prototype.isUnit || false;
	  };
	  type.isString = function (x) {
	    return typeof x === 'string';
	  };
	  type.isArray = Array.isArray;
	  type.isMatrix = isMatrix;
	  type.isDenseMatrix = function (x) {
	    return x && x.isDenseMatrix && x.constructor.prototype.isMatrix || false;
	  };
	  type.isSparseMatrix = function (x) {
	    return x && x.isSparseMatrix && x.constructor.prototype.isMatrix || false;
	  };
	  type.isRange = function (x) {
	    return x && x.constructor.prototype.isRange || false;
	  };
	  type.isIndex = function (x) {
	    return x && x.constructor.prototype.isIndex || false;
	  };
	  type.isBoolean = function (x) {
	    return typeof x === 'boolean';
	  };
	  type.isResultSet = function (x) {
	    return x && x.constructor.prototype.isResultSet || false;
	  };
	  type.isHelp = function (x) {
	    return x && x.constructor.prototype.isHelp || false;
	  };
	  type.isFunction = function (x) {
	    return typeof x === 'function';
	  };
	  type.isDate = function (x) {
	    return x instanceof Date;
	  };
	  type.isRegExp = function (x) {
	    return x instanceof RegExp;
	  };
	  type.isObject = function (x) {
	    return typeof x === 'object';
	  };
	  type.isNull = function (x) {
	    return x === null;
	  };
	  type.isUndefined = function (x) {
	    return x === undefined;
	  };

	  type.isAccessorNode = function (x) {
	    return x && x.isAccessorNode && x.constructor.prototype.isNode || false;
	  };
	  type.isArrayNode = function (x) {
	    return x && x.isArrayNode && x.constructor.prototype.isNode || false;
	  };
	  type.isAssignmentNode = function (x) {
	    return x && x.isAssignmentNode && x.constructor.prototype.isNode || false;
	  };
	  type.isBlockNode = function (x) {
	    return x && x.isBlockNode && x.constructor.prototype.isNode || false;
	  };
	  type.isConditionalNode = function (x) {
	    return x && x.isConditionalNode && x.constructor.prototype.isNode || false;
	  };
	  type.isConstantNode = function (x) {
	    return x && x.isConstantNode && x.constructor.prototype.isNode || false;
	  };
	  type.isFunctionAssignmentNode = function (x) {
	    return x && x.isFunctionAssignmentNode && x.constructor.prototype.isNode || false;
	  };
	  type.isFunctionNode = function (x) {
	    return x && x.isFunctionNode && x.constructor.prototype.isNode || false;
	  };
	  type.isIndexNode = function (x) {
	    return x && x.isIndexNode && x.constructor.prototype.isNode || false;
	  };
	  type.isNode = function (x) {
	    return x && x.isNode && x.constructor.prototype.isNode || false;
	  };
	  type.isObjectNode = function (x) {
	    return x && x.isObjectNode && x.constructor.prototype.isNode || false;
	  };
	  type.isOperatorNode = function (x) {
	    return x && x.isOperatorNode && x.constructor.prototype.isNode || false;
	  };
	  type.isParenthesisNode = function (x) {
	    return x && x.isParenthesisNode && x.constructor.prototype.isNode || false;
	  };
	  type.isRangeNode = function (x) {
	    return x && x.isRangeNode && x.constructor.prototype.isNode || false;
	  };
	  type.isSymbolNode = function (x) {
	    return x && x.isSymbolNode && x.constructor.prototype.isNode || false;
	  };

	  type.isChain = function (x) {
	    return x && x.constructor.prototype.isChain || false;
	  };

	  // get a new instance of typed-function
	  var typed = createTyped();

	  // define all types. The order of the types determines in which order function
	  // arguments are type-checked (so for performance it's important to put the
	  // most used types first).
	  typed.types = [{ name: 'number', test: type.isNumber }, { name: 'Complex', test: type.isComplex }, { name: 'BigNumber', test: type.isBigNumber }, { name: 'Fraction', test: type.isFraction }, { name: 'Unit', test: type.isUnit }, { name: 'string', test: type.isString }, { name: 'Array', test: type.isArray }, { name: 'Matrix', test: type.isMatrix }, { name: 'DenseMatrix', test: type.isDenseMatrix }, { name: 'SparseMatrix', test: type.isSparseMatrix }, { name: 'Range', test: type.isRange }, { name: 'Index', test: type.isIndex }, { name: 'boolean', test: type.isBoolean }, { name: 'ResultSet', test: type.isResultSet }, { name: 'Help', test: type.isHelp }, { name: 'function', test: type.isFunction }, { name: 'Date', test: type.isDate }, { name: 'RegExp', test: type.isRegExp }, { name: 'Object', test: type.isObject }, { name: 'null', test: type.isNull }, { name: 'undefined', test: type.isUndefined }, { name: 'OperatorNode', test: type.isOperatorNode }, { name: 'ConstantNode', test: type.isConstantNode }, { name: 'SymbolNode', test: type.isSymbolNode }, { name: 'ParenthesisNode', test: type.isParenthesisNode }, { name: 'FunctionNode', test: type.isFunctionNode }, { name: 'FunctionAssignmentNode', test: type.isFunctionAssignmentNode }, { name: 'ArrayNode', test: type.isArrayNode }, { name: 'AssignmentNode', test: type.isAssignmentNode }, { name: 'BlockNode', test: type.isBlockNode }, { name: 'ConditionalNode', test: type.isConditionalNode }, { name: 'IndexNode', test: type.isIndexNode }, { name: 'RangeNode', test: type.isRangeNode }, { name: 'Node', test: type.isNode }];

	  // TODO: add conversion from BigNumber to number?
	  typed.conversions = [{
	    from: 'number',
	    to: 'BigNumber',
	    convert: function (x) {
	      // note: conversion from number to BigNumber can fail if x has >15 digits
	      if (digits(x) > 15) {
	        throw new TypeError('Cannot implicitly convert a number with >15 significant digits to BigNumber ' + '(value: ' + x + '). ' + 'Use function bignumber(x) to convert to BigNumber.');
	      }
	      return new type.BigNumber(x);
	    }
	  }, {
	    from: 'number',
	    to: 'Complex',
	    convert: function (x) {
	      return new type.Complex(x, 0);
	    }
	  }, {
	    from: 'number',
	    to: 'string',
	    convert: function (x) {
	      return x + '';
	    }
	  }, {
	    from: 'BigNumber',
	    to: 'Complex',
	    convert: function (x) {
	      return new type.Complex(x.toNumber(), 0);
	    }
	  }, {
	    from: 'Fraction',
	    to: 'BigNumber',
	    convert: function (x) {
	      throw new TypeError('Cannot implicitly convert a Fraction to BigNumber or vice versa. ' + 'Use function bignumber(x) to convert to BigNumber or fraction(x) to convert to Fraction.');
	    }
	  }, {
	    from: 'Fraction',
	    to: 'Complex',
	    convert: function (x) {
	      return new type.Complex(x.valueOf(), 0);
	    }
	  }, {
	    from: 'number',
	    to: 'Fraction',
	    convert: function (x) {
	      var f = new type.Fraction(x);
	      if (f.valueOf() !== x) {
	        throw new TypeError('Cannot implicitly convert a number to a Fraction when there will be a loss of precision ' + '(value: ' + x + '). ' + 'Use function fraction(x) to convert to Fraction.');
	      }
	      return new type.Fraction(x);
	    }
	  }, {
	    // FIXME: add conversion from Fraction to number, for example for `sqrt(fraction(1,3))`
	    //  from: 'Fraction',
	    //  to: 'number',
	    //  convert: function (x) {
	    //    return x.valueOf();
	    //  }
	    //}, {
	    from: 'string',
	    to: 'number',
	    convert: function (x) {
	      var n = Number(x);
	      if (isNaN(n)) {
	        throw new Error('Cannot convert "' + x + '" to a number');
	      }
	      return n;
	    }
	  }, {
	    from: 'string',
	    to: 'BigNumber',
	    convert: function (x) {
	      try {
	        return new type.BigNumber(x);
	      } catch (err) {
	        throw new Error('Cannot convert "' + x + '" to BigNumber');
	      }
	    }
	  }, {
	    from: 'string',
	    to: 'Fraction',
	    convert: function (x) {
	      try {
	        return new type.Fraction(x);
	      } catch (err) {
	        throw new Error('Cannot convert "' + x + '" to Fraction');
	      }
	    }
	  }, {
	    from: 'string',
	    to: 'Complex',
	    convert: function (x) {
	      try {
	        return new type.Complex(x);
	      } catch (err) {
	        throw new Error('Cannot convert "' + x + '" to Complex');
	      }
	    }
	  }, {
	    from: 'boolean',
	    to: 'number',
	    convert: function (x) {
	      return +x;
	    }
	  }, {
	    from: 'boolean',
	    to: 'BigNumber',
	    convert: function (x) {
	      return new type.BigNumber(+x);
	    }
	  }, {
	    from: 'boolean',
	    to: 'Fraction',
	    convert: function (x) {
	      return new type.Fraction(+x);
	    }
	  }, {
	    from: 'boolean',
	    to: 'string',
	    convert: function (x) {
	      return +x;
	    }
	  }, {
	    from: 'null',
	    to: 'number',
	    convert: function () {
	      return 0;
	    }
	  }, {
	    from: 'null',
	    to: 'string',
	    convert: function () {
	      return 'null';
	    }
	  }, {
	    from: 'null',
	    to: 'BigNumber',
	    convert: function () {
	      return new type.BigNumber(0);
	    }
	  }, {
	    from: 'null',
	    to: 'Fraction',
	    convert: function () {
	      return new type.Fraction(0);
	    }
	  }, {
	    from: 'Array',
	    to: 'Matrix',
	    convert: function (array) {
	      // TODO: how to decide on the right type of matrix to create?
	      return new type.DenseMatrix(array);
	    }
	  }, {
	    from: 'Matrix',
	    to: 'Array',
	    convert: function (matrix) {
	      return matrix.valueOf();
	    }
	  }];

	  return typed;
	};

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/**
	 * typed-function
	 *
	 * Type checking for JavaScript functions
	 *
	 * https://github.com/josdejong/typed-function
	 */
	'use strict';

	(function (root, factory) {
	  if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
	    // OldNode. Does not work with strict CommonJS, but
	    // only CommonJS-like environments that support module.exports,
	    // like OldNode.
	    module.exports = factory();
	  } else {
	    // Browser globals (root is window)
	    root.typed = factory();
	  }
	})(this, function () {
	  // factory function to create a new instance of typed-function
	  // TODO: allow passing configuration, types, tests via the factory function
	  function create() {
	    /**
	     * Get a type test function for a specific data type
	     * @param {string} name                   Name of a data type like 'number' or 'string'
	     * @returns {Function(obj: *) : boolean}  Returns a type testing function.
	     *                                        Throws an error for an unknown type.
	     */
	    function getTypeTest(name) {
	      var test;
	      for (var i = 0; i < typed.types.length; i++) {
	        var entry = typed.types[i];
	        if (entry.name === name) {
	          test = entry.test;
	          break;
	        }
	      }

	      if (!test) {
	        var hint;
	        for (i = 0; i < typed.types.length; i++) {
	          entry = typed.types[i];
	          if (entry.name.toLowerCase() == name.toLowerCase()) {
	            hint = entry.name;
	            break;
	          }
	        }

	        throw new Error('Unknown type "' + name + '"' + (hint ? '. Did you mean "' + hint + '"?' : ''));
	      }
	      return test;
	    }

	    /**
	     * Retrieve the function name from a set of functions, and check
	     * whether the name of all functions match (if given)
	     * @param {Array.<function>} fns
	     */
	    function getName(fns) {
	      var name = '';

	      for (var i = 0; i < fns.length; i++) {
	        var fn = fns[i];

	        // merge function name when this is a typed function
	        if (fn.signatures && fn.name != '') {
	          if (name == '') {
	            name = fn.name;
	          } else if (name != fn.name) {
	            var err = new Error('Function names do not match (expected: ' + name + ', actual: ' + fn.name + ')');
	            err.data = {
	              actual: fn.name,
	              expected: name
	            };
	            throw err;
	          }
	        }
	      }

	      return name;
	    }

	    /**
	     * Create an ArgumentsError. Creates messages like:
	     *
	     *   Unexpected type of argument (expected: ..., actual: ..., index: ...)
	     *   Too few arguments (expected: ..., index: ...)
	     *   Too many arguments (expected: ..., actual: ...)
	     *
	     * @param {String} fn         Function name
	     * @param {number} argCount   Number of arguments
	     * @param {Number} index      Current argument index
	     * @param {*} actual          Current argument
	     * @param {string} [expected] An optional, comma separated string with
	     *                            expected types on given index
	     * @extends Error
	     */
	    function createError(fn, argCount, index, actual, expected) {
	      var actualType = getTypeOf(actual);
	      var _expected = expected ? expected.split(',') : null;
	      var _fn = fn || 'unnamed';
	      var anyType = _expected && contains(_expected, 'any');
	      var message;
	      var data = {
	        fn: fn,
	        index: index,
	        actual: actual,
	        expected: _expected
	      };

	      if (_expected) {
	        if (argCount > index && !anyType) {
	          // unexpected type
	          message = 'Unexpected type of argument in function ' + _fn + ' (expected: ' + _expected.join(' or ') + ', actual: ' + actualType + ', index: ' + index + ')';
	        } else {
	          // too few arguments
	          message = 'Too few arguments in function ' + _fn + ' (expected: ' + _expected.join(' or ') + ', index: ' + index + ')';
	        }
	      } else {
	        // too many arguments
	        message = 'Too many arguments in function ' + _fn + ' (expected: ' + index + ', actual: ' + argCount + ')';
	      }

	      var err = new TypeError(message);
	      err.data = data;
	      return err;
	    }

	    /**
	     * Collection with function references (local shortcuts to functions)
	     * @constructor
	     * @param {string} [name='refs']  Optional name for the refs, used to generate
	     *                                JavaScript code
	     */
	    function Refs(name) {
	      this.name = name || 'refs';
	      this.categories = {};
	    }

	    /**
	     * Add a function reference.
	     * @param {Function} fn
	     * @param {string} [category='fn']    A function category, like 'fn' or 'signature'
	     * @returns {string} Returns the function name, for example 'fn0' or 'signature2'
	     */
	    Refs.prototype.add = function (fn, category) {
	      var cat = category || 'fn';
	      if (!this.categories[cat]) this.categories[cat] = [];

	      var index = this.categories[cat].indexOf(fn);
	      if (index == -1) {
	        index = this.categories[cat].length;
	        this.categories[cat].push(fn);
	      }

	      return cat + index;
	    };

	    /**
	     * Create code lines for all function references
	     * @returns {string} Returns the code containing all function references
	     */
	    Refs.prototype.toCode = function () {
	      var code = [];
	      var path = this.name + '.categories';
	      var categories = this.categories;

	      for (var cat in categories) {
	        if (categories.hasOwnProperty(cat)) {
	          var category = categories[cat];

	          for (var i = 0; i < category.length; i++) {
	            code.push('var ' + cat + i + ' = ' + path + '[\'' + cat + '\'][' + i + '];');
	          }
	        }
	      }

	      return code.join('\n');
	    };

	    /**
	     * A function parameter
	     * @param {string | string[] | Param} types    A parameter type like 'string',
	     *                                             'number | boolean'
	     * @param {boolean} [varArgs=false]            Variable arguments if true
	     * @constructor
	     */
	    function Param(types, varArgs) {
	      // parse the types, can be a string with types separated by pipe characters |
	      if (typeof types === 'string') {
	        // parse variable arguments operator (ellipses '...number')
	        var _types = types.trim();
	        var _varArgs = _types.substr(0, 3) === '...';
	        if (_varArgs) {
	          _types = _types.substr(3);
	        }
	        if (_types === '') {
	          this.types = ['any'];
	        } else {
	          this.types = _types.split('|');
	          for (var i = 0; i < this.types.length; i++) {
	            this.types[i] = this.types[i].trim();
	          }
	        }
	      } else if (Array.isArray(types)) {
	        this.types = types;
	      } else if (types instanceof Param) {
	        return types.clone();
	      } else {
	        throw new Error('String or Array expected');
	      }

	      // can hold a type to which to convert when handling this parameter
	      this.conversions = [];
	      // TODO: implement better API for conversions, be able to add conversions via constructor (support a new type Object?)

	      // variable arguments
	      this.varArgs = _varArgs || varArgs || false;

	      // check for any type arguments
	      this.anyType = this.types.indexOf('any') !== -1;
	    }

	    /**
	     * Order Params
	     * any type ('any') will be ordered last, and object as second last (as other
	     * types may be an object as well, like Array).
	     *
	     * @param {Param} a
	     * @param {Param} b
	     * @returns {number} Returns 1 if a > b, -1 if a < b, and else 0.
	     */
	    Param.compare = function (a, b) {
	      // TODO: simplify parameter comparison, it's a mess
	      if (a.anyType) return 1;
	      if (b.anyType) return -1;

	      if (contains(a.types, 'Object')) return 1;
	      if (contains(b.types, 'Object')) return -1;

	      if (a.hasConversions()) {
	        if (b.hasConversions()) {
	          var i, ac, bc;

	          for (i = 0; i < a.conversions.length; i++) {
	            if (a.conversions[i] !== undefined) {
	              ac = a.conversions[i];
	              break;
	            }
	          }

	          for (i = 0; i < b.conversions.length; i++) {
	            if (b.conversions[i] !== undefined) {
	              bc = b.conversions[i];
	              break;
	            }
	          }

	          return typed.conversions.indexOf(ac) - typed.conversions.indexOf(bc);
	        } else {
	          return 1;
	        }
	      } else {
	        if (b.hasConversions()) {
	          return -1;
	        } else {
	          // both params have no conversions
	          var ai, bi;

	          for (i = 0; i < typed.types.length; i++) {
	            if (typed.types[i].name === a.types[0]) {
	              ai = i;
	              break;
	            }
	          }

	          for (i = 0; i < typed.types.length; i++) {
	            if (typed.types[i].name === b.types[0]) {
	              bi = i;
	              break;
	            }
	          }

	          return ai - bi;
	        }
	      }
	    };

	    /**
	     * Test whether this parameters types overlap an other parameters types.
	     * Will not match ['any'] with ['number']
	     * @param {Param} other
	     * @return {boolean} Returns true when there are overlapping types
	     */
	    Param.prototype.overlapping = function (other) {
	      for (var i = 0; i < this.types.length; i++) {
	        if (contains(other.types, this.types[i])) {
	          return true;
	        }
	      }
	      return false;
	    };

	    /**
	     * Test whether this parameters types matches an other parameters types.
	     * When any of the two parameters contains `any`, true is returned
	     * @param {Param} other
	     * @return {boolean} Returns true when there are matching types
	     */
	    Param.prototype.matches = function (other) {
	      return this.anyType || other.anyType || this.overlapping(other);
	    };

	    /**
	     * Create a clone of this param
	     * @returns {Param} Returns a cloned version of this param
	     */
	    Param.prototype.clone = function () {
	      var param = new Param(this.types.slice(), this.varArgs);
	      param.conversions = this.conversions.slice();
	      return param;
	    };

	    /**
	     * Test whether this parameter contains conversions
	     * @returns {boolean} Returns true if the parameter contains one or
	     *                    multiple conversions.
	     */
	    Param.prototype.hasConversions = function () {
	      return this.conversions.length > 0;
	    };

	    /**
	     * Tests whether this parameters contains any of the provided types
	     * @param {Object} types  A Map with types, like {'number': true}
	     * @returns {boolean}     Returns true when the parameter contains any
	     *                        of the provided types
	     */
	    Param.prototype.contains = function (types) {
	      for (var i = 0; i < this.types.length; i++) {
	        if (types[this.types[i]]) {
	          return true;
	        }
	      }
	      return false;
	    };

	    /**
	     * Return a string representation of this params types, like 'string' or
	     * 'number | boolean' or '...number'
	     * @param {boolean} [toConversion]   If true, the returned types string
	     *                                   contains the types where the parameter
	     *                                   will convert to. If false (default)
	     *                                   the "from" types are returned
	     * @returns {string}
	     */
	    Param.prototype.toString = function (toConversion) {
	      var types = [];
	      var keys = {};

	      for (var i = 0; i < this.types.length; i++) {
	        var conversion = this.conversions[i];
	        var type = toConversion && conversion ? conversion.to : this.types[i];
	        if (!(type in keys)) {
	          keys[type] = true;
	          types.push(type);
	        }
	      }

	      return (this.varArgs ? '...' : '') + types.join('|');
	    };

	    /**
	     * A function signature
	     * @param {string | string[] | Param[]} params
	     *                         Array with the type(s) of each parameter,
	     *                         or a comma separated string with types
	     * @param {Function} fn    The actual function
	     * @constructor
	     */
	    function Signature(params, fn) {
	      var _params;
	      if (typeof params === 'string') {
	        _params = params !== '' ? params.split(',') : [];
	      } else if (Array.isArray(params)) {
	        _params = params;
	      } else {
	        throw new Error('string or Array expected');
	      }

	      this.params = new Array(_params.length);
	      this.anyType = false;
	      this.varArgs = false;
	      for (var i = 0; i < _params.length; i++) {
	        var param = new Param(_params[i]);
	        this.params[i] = param;
	        if (param.anyType) {
	          this.anyType = true;
	        }
	        if (i === _params.length - 1) {
	          // the last argument
	          this.varArgs = param.varArgs;
	        } else {
	          // non-last argument
	          if (param.varArgs) {
	            throw new SyntaxError('Unexpected variable arguments operator "..."');
	          }
	        }
	      }

	      this.fn = fn;
	    }

	    /**
	     * Create a clone of this signature
	     * @returns {Signature} Returns a cloned version of this signature
	     */
	    Signature.prototype.clone = function () {
	      return new Signature(this.params.slice(), this.fn);
	    };

	    /**
	     * Expand a signature: split params with union types in separate signatures
	     * For example split a Signature "string | number" into two signatures.
	     * @return {Signature[]} Returns an array with signatures (at least one)
	     */
	    Signature.prototype.expand = function () {
	      var signatures = [];

	      function recurse(signature, path) {
	        if (path.length < signature.params.length) {
	          var i, newParam, conversion;

	          var param = signature.params[path.length];
	          if (param.varArgs) {
	            // a variable argument. do not split the types in the parameter
	            newParam = param.clone();

	            // add conversions to the parameter
	            // recurse for all conversions
	            for (i = 0; i < typed.conversions.length; i++) {
	              conversion = typed.conversions[i];
	              if (!contains(param.types, conversion.from) && contains(param.types, conversion.to)) {
	                var j = newParam.types.length;
	                newParam.types[j] = conversion.from;
	                newParam.conversions[j] = conversion;
	              }
	            }

	            recurse(signature, path.concat(newParam));
	          } else {
	            // split each type in the parameter
	            for (i = 0; i < param.types.length; i++) {
	              recurse(signature, path.concat(new Param(param.types[i])));
	            }

	            // recurse for all conversions
	            for (i = 0; i < typed.conversions.length; i++) {
	              conversion = typed.conversions[i];
	              if (!contains(param.types, conversion.from) && contains(param.types, conversion.to)) {
	                newParam = new Param(conversion.from);
	                newParam.conversions[0] = conversion;
	                recurse(signature, path.concat(newParam));
	              }
	            }
	          }
	        } else {
	          signatures.push(new Signature(path, signature.fn));
	        }
	      }

	      recurse(this, []);

	      return signatures;
	    };

	    /**
	     * Compare two signatures.
	     *
	     * When two params are equal and contain conversions, they will be sorted
	     * by lowest index of the first conversions.
	     *
	     * @param {Signature} a
	     * @param {Signature} b
	     * @returns {number} Returns 1 if a > b, -1 if a < b, and else 0.
	     */
	    Signature.compare = function (a, b) {
	      if (a.params.length > b.params.length) return 1;
	      if (a.params.length < b.params.length) return -1;

	      // count the number of conversions
	      var i;
	      var len = a.params.length; // a and b have equal amount of params
	      var ac = 0;
	      var bc = 0;
	      for (i = 0; i < len; i++) {
	        if (a.params[i].hasConversions()) ac++;
	        if (b.params[i].hasConversions()) bc++;
	      }

	      if (ac > bc) return 1;
	      if (ac < bc) return -1;

	      // compare the order per parameter
	      for (i = 0; i < a.params.length; i++) {
	        var cmp = Param.compare(a.params[i], b.params[i]);
	        if (cmp !== 0) {
	          return cmp;
	        }
	      }

	      return 0;
	    };

	    /**
	     * Test whether any of the signatures parameters has conversions
	     * @return {boolean} Returns true when any of the parameters contains
	     *                   conversions.
	     */
	    Signature.prototype.hasConversions = function () {
	      for (var i = 0; i < this.params.length; i++) {
	        if (this.params[i].hasConversions()) {
	          return true;
	        }
	      }
	      return false;
	    };

	    /**
	     * Test whether this signature should be ignored.
	     * Checks whether any of the parameters contains a type listed in
	     * typed.ignore
	     * @return {boolean} Returns true when the signature should be ignored
	     */
	    Signature.prototype.ignore = function () {
	      // create a map with ignored types
	      var types = {};
	      for (var i = 0; i < typed.ignore.length; i++) {
	        types[typed.ignore[i]] = true;
	      }

	      // test whether any of the parameters contains this type
	      for (i = 0; i < this.params.length; i++) {
	        if (this.params[i].contains(types)) {
	          return true;
	        }
	      }

	      return false;
	    };

	    /**
	     * Test whether the path of this signature matches a given path.
	     * @param {Param[]} params
	     */
	    Signature.prototype.paramsStartWith = function (params) {
	      if (params.length === 0) {
	        return true;
	      }

	      var aLast = last(this.params);
	      var bLast = last(params);

	      for (var i = 0; i < params.length; i++) {
	        var a = this.params[i] || (aLast.varArgs ? aLast : null);
	        var b = params[i] || (bLast.varArgs ? bLast : null);

	        if (!a || !b || !a.matches(b)) {
	          return false;
	        }
	      }

	      return true;
	    };

	    /**
	     * Generate the code to invoke this signature
	     * @param {Refs} refs
	     * @param {string} prefix
	     * @returns {string} Returns code
	     */
	    Signature.prototype.toCode = function (refs, prefix) {
	      var code = [];

	      var args = new Array(this.params.length);
	      for (var i = 0; i < this.params.length; i++) {
	        var param = this.params[i];
	        var conversion = param.conversions[0];
	        if (param.varArgs) {
	          args[i] = 'varArgs';
	        } else if (conversion) {
	          args[i] = refs.add(conversion.convert, 'convert') + '(arg' + i + ')';
	        } else {
	          args[i] = 'arg' + i;
	        }
	      }

	      var ref = this.fn ? refs.add(this.fn, 'signature') : undefined;
	      if (ref) {
	        return prefix + 'return ' + ref + '(' + args.join(', ') + '); // signature: ' + this.params.join(', ');
	      }

	      return code.join('\n');
	    };

	    /**
	     * Return a string representation of the signature
	     * @returns {string}
	     */
	    Signature.prototype.toString = function () {
	      return this.params.join(', ');
	    };

	    /**
	     * A group of signatures with the same parameter on given index
	     * @param {Param[]} path
	     * @param {Signature} [signature]
	     * @param {Node[]} childs
	     * @param {boolean} [fallThrough=false]
	     * @constructor
	     */
	    function Node(path, signature, childs, fallThrough) {
	      this.path = path || [];
	      this.param = path[path.length - 1] || null;
	      this.signature = signature || null;
	      this.childs = childs || [];
	      this.fallThrough = fallThrough || false;
	    }

	    /**
	     * Generate code for this group of signatures
	     * @param {Refs} refs
	     * @param {string} prefix
	     * @returns {string} Returns the code as string
	     */
	    Node.prototype.toCode = function (refs, prefix) {
	      // TODO: split this function in multiple functions, it's too large
	      var code = [];

	      if (this.param) {
	        var index = this.path.length - 1;
	        var conversion = this.param.conversions[0];
	        var comment = '// type: ' + (conversion ? conversion.from + ' (convert to ' + conversion.to + ')' : this.param);

	        // non-root node (path is non-empty)
	        if (this.param.varArgs) {
	          if (this.param.anyType) {
	            // variable arguments with any type
	            code.push(prefix + 'if (arguments.length > ' + index + ') {');
	            code.push(prefix + '  var varArgs = [];');
	            code.push(prefix + '  for (var i = ' + index + '; i < arguments.length; i++) {');
	            code.push(prefix + '    varArgs.push(arguments[i]);');
	            code.push(prefix + '  }');
	            code.push(this.signature.toCode(refs, prefix + '  '));
	            code.push(prefix + '}');
	          } else {
	            // variable arguments with a fixed type
	            var getTests = function (types, arg) {
	              var tests = [];
	              for (var i = 0; i < types.length; i++) {
	                tests[i] = refs.add(getTypeTest(types[i]), 'test') + '(' + arg + ')';
	              }
	              return tests.join(' || ');
	            }.bind(this);

	            var allTypes = this.param.types;
	            var exactTypes = [];
	            for (var i = 0; i < allTypes.length; i++) {
	              if (this.param.conversions[i] === undefined) {
	                exactTypes.push(allTypes[i]);
	              }
	            }

	            code.push(prefix + 'if (' + getTests(allTypes, 'arg' + index) + ') { ' + comment);
	            code.push(prefix + '  var varArgs = [arg' + index + '];');
	            code.push(prefix + '  for (var i = ' + (index + 1) + '; i < arguments.length; i++) {');
	            code.push(prefix + '    if (' + getTests(exactTypes, 'arguments[i]') + ') {');
	            code.push(prefix + '      varArgs.push(arguments[i]);');

	            for (var i = 0; i < allTypes.length; i++) {
	              var conversion_i = this.param.conversions[i];
	              if (conversion_i) {
	                var test = refs.add(getTypeTest(allTypes[i]), 'test');
	                var convert = refs.add(conversion_i.convert, 'convert');
	                code.push(prefix + '    }');
	                code.push(prefix + '    else if (' + test + '(arguments[i])) {');
	                code.push(prefix + '      varArgs.push(' + convert + '(arguments[i]));');
	              }
	            }
	            code.push(prefix + '    } else {');
	            code.push(prefix + '      throw createError(name, arguments.length, i, arguments[i], \'' + exactTypes.join(',') + '\');');
	            code.push(prefix + '    }');
	            code.push(prefix + '  }');
	            code.push(this.signature.toCode(refs, prefix + '  '));
	            code.push(prefix + '}');
	          }
	        } else {
	          if (this.param.anyType) {
	            // any type
	            code.push(prefix + '// type: any');
	            code.push(this._innerCode(refs, prefix));
	          } else {
	            // regular type
	            var type = this.param.types[0];
	            var test = type !== 'any' ? refs.add(getTypeTest(type), 'test') : null;

	            code.push(prefix + 'if (' + test + '(arg' + index + ')) { ' + comment);
	            code.push(this._innerCode(refs, prefix + '  '));
	            code.push(prefix + '}');
	          }
	        }
	      } else {
	        // root node (path is empty)
	        code.push(this._innerCode(refs, prefix));
	      }

	      return code.join('\n');
	    };

	    /**
	     * Generate inner code for this group of signatures.
	     * This is a helper function of Node.prototype.toCode
	     * @param {Refs} refs
	     * @param {string} prefix
	     * @returns {string} Returns the inner code as string
	     * @private
	     */
	    Node.prototype._innerCode = function (refs, prefix) {
	      var code = [];
	      var i;

	      if (this.signature) {
	        code.push(prefix + 'if (arguments.length === ' + this.path.length + ') {');
	        code.push(this.signature.toCode(refs, prefix + '  '));
	        code.push(prefix + '}');
	      }

	      for (i = 0; i < this.childs.length; i++) {
	        code.push(this.childs[i].toCode(refs, prefix));
	      }

	      // TODO: shouldn't the this.param.anyType check be redundant
	      if (!this.fallThrough || this.param && this.param.anyType) {
	        var exceptions = this._exceptions(refs, prefix);
	        if (exceptions) {
	          code.push(exceptions);
	        }
	      }

	      return code.join('\n');
	    };

	    /**
	     * Generate code to throw exceptions
	     * @param {Refs} refs
	     * @param {string} prefix
	     * @returns {string} Returns the inner code as string
	     * @private
	     */
	    Node.prototype._exceptions = function (refs, prefix) {
	      var index = this.path.length;

	      if (this.childs.length === 0) {
	        // TODO: can this condition be simplified? (we have a fall-through here)
	        return [prefix + 'if (arguments.length > ' + index + ') {', prefix + '  throw createError(name, arguments.length, ' + index + ', arguments[' + index + ']);', prefix + '}'].join('\n');
	      } else {
	        var keys = {};
	        var types = [];

	        for (var i = 0; i < this.childs.length; i++) {
	          var node = this.childs[i];
	          if (node.param) {
	            for (var j = 0; j < node.param.types.length; j++) {
	              var type = node.param.types[j];
	              if (!(type in keys) && !node.param.conversions[j]) {
	                keys[type] = true;
	                types.push(type);
	              }
	            }
	          }
	        }

	        return prefix + 'throw createError(name, arguments.length, ' + index + ', arguments[' + index + '], \'' + types.join(',') + '\');';
	      }
	    };

	    /**
	     * Split all raw signatures into an array with expanded Signatures
	     * @param {Object.<string, Function>} rawSignatures
	     * @return {Signature[]} Returns an array with expanded signatures
	     */
	    function parseSignatures(rawSignatures) {
	      // FIXME: need to have deterministic ordering of signatures, do not create via object
	      var signature;
	      var keys = {};
	      var signatures = [];
	      var i;

	      for (var types in rawSignatures) {
	        if (rawSignatures.hasOwnProperty(types)) {
	          var fn = rawSignatures[types];
	          signature = new Signature(types, fn);

	          if (signature.ignore()) {
	            continue;
	          }

	          var expanded = signature.expand();

	          for (i = 0; i < expanded.length; i++) {
	            var signature_i = expanded[i];
	            var key = signature_i.toString();
	            var existing = keys[key];
	            if (!existing) {
	              keys[key] = signature_i;
	            } else {
	              var cmp = Signature.compare(signature_i, existing);
	              if (cmp < 0) {
	                // override if sorted first
	                keys[key] = signature_i;
	              } else if (cmp === 0) {
	                throw new Error('Signature "' + key + '" is defined twice');
	              }
	              // else: just ignore
	            }
	          }
	        }
	      }

	      // convert from map to array
	      for (key in keys) {
	        if (keys.hasOwnProperty(key)) {
	          signatures.push(keys[key]);
	        }
	      }

	      // order the signatures
	      signatures.sort(function (a, b) {
	        return Signature.compare(a, b);
	      });

	      // filter redundant conversions from signatures with varArgs
	      // TODO: simplify this loop or move it to a separate function
	      for (i = 0; i < signatures.length; i++) {
	        signature = signatures[i];

	        if (signature.varArgs) {
	          var index = signature.params.length - 1;
	          var param = signature.params[index];

	          var t = 0;
	          while (t < param.types.length) {
	            if (param.conversions[t]) {
	              var type = param.types[t];

	              for (var j = 0; j < signatures.length; j++) {
	                var other = signatures[j];
	                var p = other.params[index];

	                if (other !== signature && p && contains(p.types, type) && !p.conversions[index]) {
	                  // this (conversion) type already exists, remove it
	                  param.types.splice(t, 1);
	                  param.conversions.splice(t, 1);
	                  t--;
	                  break;
	                }
	              }
	            }
	            t++;
	          }
	        }
	      }

	      return signatures;
	    }

	    /**
	     * Filter all any type signatures
	     * @param {Signature[]} signatures
	     * @return {Signature[]} Returns only any type signatures
	     */
	    function filterAnyTypeSignatures(signatures) {
	      var filtered = [];

	      for (var i = 0; i < signatures.length; i++) {
	        if (signatures[i].anyType) {
	          filtered.push(signatures[i]);
	        }
	      }

	      return filtered;
	    }

	    /**
	     * create a map with normalized signatures as key and the function as value
	     * @param {Signature[]} signatures   An array with split signatures
	     * @return {Object.<string, Function>} Returns a map with normalized
	     *                                     signatures as key, and the function
	     *                                     as value.
	     */
	    function mapSignatures(signatures) {
	      var normalized = {};

	      for (var i = 0; i < signatures.length; i++) {
	        var signature = signatures[i];
	        if (signature.fn && !signature.hasConversions()) {
	          var params = signature.params.join(',');
	          normalized[params] = signature.fn;
	        }
	      }

	      return normalized;
	    }

	    /**
	     * Parse signatures recursively in a node tree.
	     * @param {Signature[]} signatures  Array with expanded signatures
	     * @param {Param[]} path            Traversed path of parameter types
	     * @param {Signature[]} anys
	     * @return {Node}                   Returns a node tree
	     */
	    function parseTree(signatures, path, anys) {
	      var i, signature;
	      var index = path.length;
	      var nodeSignature;

	      var filtered = [];
	      for (i = 0; i < signatures.length; i++) {
	        signature = signatures[i];

	        // filter the first signature with the correct number of params
	        if (signature.params.length === index && !nodeSignature) {
	          nodeSignature = signature;
	        }

	        if (signature.params[index] != undefined) {
	          filtered.push(signature);
	        }
	      }

	      // sort the filtered signatures by param
	      filtered.sort(function (a, b) {
	        return Param.compare(a.params[index], b.params[index]);
	      });

	      // recurse over the signatures
	      var entries = [];
	      for (i = 0; i < filtered.length; i++) {
	        signature = filtered[i];
	        // group signatures with the same param at current index
	        var param = signature.params[index];

	        // TODO: replace the next filter loop
	        var existing = entries.filter(function (entry) {
	          return entry.param.overlapping(param);
	        })[0];

	        //var existing;
	        //for (var j = 0; j < entries.length; j++) {
	        //  if (entries[j].param.overlapping(param)) {
	        //    existing = entries[j];
	        //    break;
	        //  }
	        //}

	        if (existing) {
	          if (existing.param.varArgs) {
	            throw new Error('Conflicting types "' + existing.param + '" and "' + param + '"');
	          }
	          existing.signatures.push(signature);
	        } else {
	          entries.push({
	            param: param,
	            signatures: [signature]
	          });
	        }
	      }

	      // find all any type signature that can still match our current path
	      var matchingAnys = [];
	      for (i = 0; i < anys.length; i++) {
	        if (anys[i].paramsStartWith(path)) {
	          matchingAnys.push(anys[i]);
	        }
	      }

	      // see if there are any type signatures that don't match any of the
	      // signatures that we have in our tree, i.e. we have alternative
	      // matching signature(s) outside of our current tree and we should
	      // fall through to them instead of throwing an exception
	      var fallThrough = false;
	      for (i = 0; i < matchingAnys.length; i++) {
	        if (!contains(signatures, matchingAnys[i])) {
	          fallThrough = true;
	          break;
	        }
	      }

	      // parse the childs
	      var childs = new Array(entries.length);
	      for (i = 0; i < entries.length; i++) {
	        var entry = entries[i];
	        childs[i] = parseTree(entry.signatures, path.concat(entry.param), matchingAnys);
	      }

	      return new Node(path, nodeSignature, childs, fallThrough);
	    }

	    /**
	     * Generate an array like ['arg0', 'arg1', 'arg2']
	     * @param {number} count Number of arguments to generate
	     * @returns {Array} Returns an array with argument names
	     */
	    function getArgs(count) {
	      // create an array with all argument names
	      var args = [];
	      for (var i = 0; i < count; i++) {
	        args[i] = 'arg' + i;
	      }

	      return args;
	    }

	    /**
	     * Compose a function from sub-functions each handling a single type signature.
	     * Signatures:
	     *   typed(signature: string, fn: function)
	     *   typed(name: string, signature: string, fn: function)
	     *   typed(signatures: Object.<string, function>)
	     *   typed(name: string, signatures: Object.<string, function>)
	     *
	     * @param {string | null} name
	     * @param {Object.<string, Function>} signatures
	     * @return {Function} Returns the typed function
	     * @private
	     */
	    function _typed(name, signatures) {
	      var refs = new Refs();

	      // parse signatures, expand them
	      var _signatures = parseSignatures(signatures);
	      if (_signatures.length == 0) {
	        throw new Error('No signatures provided');
	      }

	      // filter all any type signatures
	      var anys = filterAnyTypeSignatures(_signatures);

	      // parse signatures into a node tree
	      var node = parseTree(_signatures, [], anys);

	      //var util = require('util');
	      //console.log('ROOT');
	      //console.log(util.inspect(node, { depth: null }));

	      // generate code for the typed function
	      // safeName is a conservative replacement of characters 
	      // to prevend being able to inject JS code at the place of the function name 
	      // the name is useful for stack trackes therefore we want have it there
	      var code = [];
	      var safeName = (name || '').replace(/[^a-zA-Z0-9_$]/g, '_');
	      var args = getArgs(maxParams(_signatures));
	      code.push('function ' + safeName + '(' + args.join(', ') + ') {');
	      code.push('  "use strict";');
	      code.push('  var name = ' + JSON.stringify(name || '') + ';');
	      code.push(node.toCode(refs, '  ', false));
	      code.push('}');

	      // generate body for the factory function
	      var body = [refs.toCode(), 'return ' + code.join('\n')].join('\n');

	      // evaluate the JavaScript code and attach function references
	      var factory = new Function(refs.name, 'createError', body);
	      var fn = factory(refs, createError);

	      //console.log('FN\n' + fn.toString()); // TODO: cleanup

	      // attach the signatures with sub-functions to the constructed function
	      fn.signatures = mapSignatures(_signatures);

	      return fn;
	    }

	    /**
	     * Calculate the maximum number of parameters in givens signatures
	     * @param {Signature[]} signatures
	     * @returns {number} The maximum number of parameters
	     */
	    function maxParams(signatures) {
	      var max = 0;

	      for (var i = 0; i < signatures.length; i++) {
	        var len = signatures[i].params.length;
	        if (len > max) {
	          max = len;
	        }
	      }

	      return max;
	    }

	    /**
	     * Get the type of a value
	     * @param {*} x
	     * @returns {string} Returns a string with the type of value
	     */
	    function getTypeOf(x) {
	      var obj;

	      for (var i = 0; i < typed.types.length; i++) {
	        var entry = typed.types[i];

	        if (entry.name === 'Object') {
	          // Array and Date are also Object, so test for Object afterwards
	          obj = entry;
	        } else {
	          if (entry.test(x)) return entry.name;
	        }
	      }

	      // at last, test whether an object
	      if (obj && obj.test(x)) return obj.name;

	      return 'unknown';
	    }

	    /**
	     * Test whether an array contains some item
	     * @param {Array} array
	     * @param {*} item
	     * @return {boolean} Returns true if array contains item, false if not.
	     */
	    function contains(array, item) {
	      return array.indexOf(item) !== -1;
	    }

	    /**
	     * Returns the last item in the array
	     * @param {Array} array
	     * @return {*} item
	     */
	    function last(array) {
	      return array[array.length - 1];
	    }

	    // data type tests
	    var types = [{ name: 'number', test: function (x) {
	        return typeof x === 'number';
	      } }, { name: 'string', test: function (x) {
	        return typeof x === 'string';
	      } }, { name: 'boolean', test: function (x) {
	        return typeof x === 'boolean';
	      } }, { name: 'Function', test: function (x) {
	        return typeof x === 'function';
	      } }, { name: 'Array', test: Array.isArray }, { name: 'Date', test: function (x) {
	        return x instanceof Date;
	      } }, { name: 'RegExp', test: function (x) {
	        return x instanceof RegExp;
	      } }, { name: 'Object', test: function (x) {
	        return typeof x === 'object';
	      } }, { name: 'null', test: function (x) {
	        return x === null;
	      } }, { name: 'undefined', test: function (x) {
	        return x === undefined;
	      } }];

	    // configuration
	    var config = {};

	    // type conversions. Order is important
	    var conversions = [];

	    // types to be ignored
	    var ignore = [];

	    // temporary object for holding types and conversions, for constructing
	    // the `typed` function itself
	    // TODO: find a more elegant solution for this
	    var typed = {
	      config: config,
	      types: types,
	      conversions: conversions,
	      ignore: ignore
	    };

	    /**
	     * Construct the typed function itself with various signatures
	     *
	     * Signatures:
	     *
	     *   typed(signatures: Object.<string, function>)
	     *   typed(name: string, signatures: Object.<string, function>)
	     */
	    typed = _typed('typed', {
	      'Object': function (signatures) {
	        var fns = [];
	        for (var signature in signatures) {
	          if (signatures.hasOwnProperty(signature)) {
	            fns.push(signatures[signature]);
	          }
	        }
	        var name = getName(fns);

	        return _typed(name, signatures);
	      },
	      'string, Object': _typed,
	      // TODO: add a signature 'Array.<function>'
	      '...Function': function (fns) {
	        var err;
	        var name = getName(fns);
	        var signatures = {};

	        for (var i = 0; i < fns.length; i++) {
	          var fn = fns[i];

	          // test whether this is a typed-function
	          if (!(typeof fn.signatures === 'object')) {
	            err = new TypeError('Function is no typed-function (index: ' + i + ')');
	            err.data = { index: i };
	            throw err;
	          }

	          // merge the signatures
	          for (var signature in fn.signatures) {
	            if (fn.signatures.hasOwnProperty(signature)) {
	              if (signatures.hasOwnProperty(signature)) {
	                if (fn.signatures[signature] !== signatures[signature]) {
	                  err = new Error('Signature "' + signature + '" is defined twice');
	                  err.data = { signature: signature };
	                  throw err;
	                }
	                // else: both signatures point to the same function, that's fine
	              } else {
	                signatures[signature] = fn.signatures[signature];
	              }
	            }
	          }
	        }

	        return _typed(name, signatures);
	      }
	    });

	    /**
	     * Find a specific signature from a (composed) typed function, for
	     * example:
	     *
	     *   typed.find(fn, ['number', 'string'])
	     *   typed.find(fn, 'number, string')
	     *
	     * Function find only only works for exact matches.
	     *
	     * @param {Function} fn                   A typed-function
	     * @param {string | string[]} signature   Signature to be found, can be
	     *                                        an array or a comma separated string.
	     * @return {Function}                     Returns the matching signature, or
	     *                                        throws an errror when no signature
	     *                                        is found.
	     */
	    function find(fn, signature) {
	      if (!fn.signatures) {
	        throw new TypeError('Function is no typed-function');
	      }

	      // normalize input
	      var arr;
	      if (typeof signature === 'string') {
	        arr = signature.split(',');
	        for (var i = 0; i < arr.length; i++) {
	          arr[i] = arr[i].trim();
	        }
	      } else if (Array.isArray(signature)) {
	        arr = signature;
	      } else {
	        throw new TypeError('String array or a comma separated string expected');
	      }

	      var str = arr.join(',');

	      // find an exact match
	      var match = fn.signatures[str];
	      if (match) {
	        return match;
	      }

	      // TODO: extend find to match non-exact signatures

	      throw new TypeError('Signature not found (signature: ' + (fn.name || 'unnamed') + '(' + arr.join(', ') + '))');
	    }

	    /**
	     * Convert a given value to another data type.
	     * @param {*} value
	     * @param {string} type
	     */
	    function convert(value, type) {
	      var from = getTypeOf(value);

	      // check conversion is needed
	      if (type === from) {
	        return value;
	      }

	      for (var i = 0; i < typed.conversions.length; i++) {
	        var conversion = typed.conversions[i];
	        if (conversion.from === from && conversion.to === type) {
	          return conversion.convert(value);
	        }
	      }

	      throw new Error('Cannot convert from ' + from + ' to ' + type);
	    }

	    // attach types and conversions to the final `typed` function
	    typed.config = config;
	    typed.types = types;
	    typed.conversions = conversions;
	    typed.ignore = ignore;
	    typed.create = create;
	    typed.find = find;
	    typed.convert = convert;

	    // add a type
	    typed.addType = function (type) {
	      if (!type || typeof type.name !== 'string' || typeof type.test !== 'function') {
	        throw new TypeError('Object with properties {name: string, test: function} expected');
	      }

	      typed.types.push(type);
	    };

	    // add a conversion
	    typed.addConversion = function (conversion) {
	      if (!conversion || typeof conversion.from !== 'string' || typeof conversion.to !== 'string' || typeof conversion.convert !== 'function') {
	        throw new TypeError('Object with properties {from: string, to: string, convert: function} expected');
	      }

	      typed.conversions.push(conversion);
	    };

	    return typed;
	  }

	  return create();
	});

/***/ }),
/* 19 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * @typedef {{sign: '+' | '-' | '', coefficients: number[], exponent: number}} SplitValue
	 */

	/**
	 * Test whether value is a number
	 * @param {*} value
	 * @return {boolean} isNumber
	 */

	exports.isNumber = function (value) {
	  return typeof value === 'number';
	};

	/**
	 * Check if a number is integer
	 * @param {number | boolean} value
	 * @return {boolean} isInteger
	 */
	exports.isInteger = function (value) {
	  return isFinite(value) ? value == Math.round(value) : false;
	  // Note: we use ==, not ===, as we can have Booleans as well
	};

	/**
	 * Calculate the sign of a number
	 * @param {number} x
	 * @returns {*}
	 */
	exports.sign = Math.sign || function (x) {
	  if (x > 0) {
	    return 1;
	  } else if (x < 0) {
	    return -1;
	  } else {
	    return 0;
	  }
	};

	/**
	 * Convert a number to a formatted string representation.
	 *
	 * Syntax:
	 *
	 *    format(value)
	 *    format(value, options)
	 *    format(value, precision)
	 *    format(value, fn)
	 *
	 * Where:
	 *
	 *    {number} value   The value to be formatted
	 *    {Object} options An object with formatting options. Available options:
	 *                     {string} notation
	 *                         Number notation. Choose from:
	 *                         'fixed'          Always use regular number notation.
	 *                                          For example '123.40' and '14000000'
	 *                         'exponential'    Always use exponential notation.
	 *                                          For example '1.234e+2' and '1.4e+7'
	 *                         'engineering'    Always use engineering notation.
	 *                                          For example '123.4e+0' and '14.0e+6'
	 *                         'auto' (default) Regular number notation for numbers
	 *                                          having an absolute value between
	 *                                          `lower` and `upper` bounds, and uses
	 *                                          exponential notation elsewhere.
	 *                                          Lower bound is included, upper bound
	 *                                          is excluded.
	 *                                          For example '123.4' and '1.4e7'.
	 *                     {number} precision   A number between 0 and 16 to round
	 *                                          the digits of the number.
	 *                                          In case of notations 'exponential' and
	 *                                          'auto', `precision` defines the total
	 *                                          number of significant digits returned
	 *                                          and is undefined by default.
	 *                                          In case of notation 'fixed',
	 *                                          `precision` defines the number of
	 *                                          significant digits after the decimal
	 *                                          point, and is 0 by default.
	 *                     {Object} exponential An object containing two parameters,
	 *                                          {number} lower and {number} upper,
	 *                                          used by notation 'auto' to determine
	 *                                          when to return exponential notation.
	 *                                          Default values are `lower=1e-3` and
	 *                                          `upper=1e5`.
	 *                                          Only applicable for notation `auto`.
	 *    {Function} fn    A custom formatting function. Can be used to override the
	 *                     built-in notations. Function `fn` is called with `value` as
	 *                     parameter and must return a string. Is useful for example to
	 *                     format all values inside a matrix in a particular way.
	 *
	 * Examples:
	 *
	 *    format(6.4);                                        // '6.4'
	 *    format(1240000);                                    // '1.24e6'
	 *    format(1/3);                                        // '0.3333333333333333'
	 *    format(1/3, 3);                                     // '0.333'
	 *    format(21385, 2);                                   // '21000'
	 *    format(12.071, {notation: 'fixed'});                // '12'
	 *    format(2.3,    {notation: 'fixed', precision: 2});  // '2.30'
	 *    format(52.8,   {notation: 'exponential'});          // '5.28e+1'
	 *    format(12345678, {notation: 'engineering'});        // '12.345678e+6'
	 *
	 * @param {number} value
	 * @param {Object | Function | number} [options]
	 * @return {string} str The formatted value
	 */
	exports.format = function (value, options) {
	  if (typeof options === 'function') {
	    // handle format(value, fn)
	    return options(value);
	  }

	  // handle special cases
	  if (value === Infinity) {
	    return 'Infinity';
	  } else if (value === -Infinity) {
	    return '-Infinity';
	  } else if (isNaN(value)) {
	    return 'NaN';
	  }

	  // default values for options
	  var notation = 'auto';
	  var precision = undefined;

	  if (options) {
	    // determine notation from options
	    if (options.notation) {
	      notation = options.notation;
	    }

	    // determine precision from options
	    if (exports.isNumber(options)) {
	      precision = options;
	    } else if (options.precision) {
	      precision = options.precision;
	    }
	  }

	  // handle the various notations
	  switch (notation) {
	    case 'fixed':
	      return exports.toFixed(value, precision);

	    case 'exponential':
	      return exports.toExponential(value, precision);

	    case 'engineering':
	      return exports.toEngineering(value, precision);

	    case 'auto':
	      return exports.toPrecision(value, precision, options && options.exponential)

	      // remove trailing zeros after the decimal point
	      .replace(/((\.\d*?)(0+))($|e)/, function () {
	        var digits = arguments[2];
	        var e = arguments[4];
	        return digits !== '.' ? digits + e : e;
	      });

	    default:
	      throw new Error('Unknown notation "' + notation + '". ' + 'Choose "auto", "exponential", or "fixed".');
	  }
	};

	/**
	 * Split a number into sign, coefficients, and exponent
	 * @param {number | string} value
	 * @return {SplitValue}
	 *              Returns an object containing sign, coefficients, and exponent
	 */
	exports.splitNumber = function (value) {
	  // parse the input value
	  var match = String(value).toLowerCase().match(/^0*?(-?)(\d+\.?\d*)(e([+-]?\d+))?$/);
	  if (!match) {
	    throw new SyntaxError('Invalid number ' + value);
	  }

	  var sign = match[1];
	  var digits = match[2];
	  var exponent = parseFloat(match[4] || '0');

	  var dot = digits.indexOf('.');
	  exponent += dot !== -1 ? dot - 1 : digits.length - 1;

	  var coefficients = digits.replace('.', '') // remove the dot (must be removed before removing leading zeros)
	  .replace(/^0*/, function (zeros) {
	    // remove leading zeros, add their count to the exponent
	    exponent -= zeros.length;
	    return '';
	  }).replace(/0*$/, '') // remove trailing zeros
	  .split('').map(function (d) {
	    return parseInt(d);
	  });

	  if (coefficients.length === 0) {
	    coefficients.push(0);
	    exponent++;
	  }

	  return {
	    sign: sign,
	    coefficients: coefficients,
	    exponent: exponent
	  };
	};

	/**
	 * Format a number in engineering notation. Like '1.23e+6', '2.3e+0', '3.500e-3'
	 * @param {number | string} value
	 * @param {number} [precision=0]        Optional number of decimals after the
	 *                                      decimal point. Zero by default.
	 */
	exports.toEngineering = function (value, precision) {
	  if (isNaN(value) || !isFinite(value)) {
	    return String(value);
	  }

	  var rounded = exports.roundDigits(exports.splitNumber(value), precision);

	  var e = rounded.exponent;
	  var c = rounded.coefficients;

	  // find nearest lower multiple of 3 for exponent
	  var newExp = e % 3 === 0 ? e : e < 0 ? e - 3 - e % 3 : e - e % 3;

	  // concatenate coefficients with necessary zeros
	  var significandsDiff = e >= 0 ? e : Math.abs(newExp);

	  // add zeros if necessary (for ex: 1e+8)
	  if (c.length - 1 < significandsDiff) c = c.concat(zeros(significandsDiff - (c.length - 1)));

	  // find difference in exponents
	  var expDiff = Math.abs(e - newExp);

	  var decimalIdx = 1;

	  // push decimal index over by expDiff times
	  while (--expDiff >= 0) decimalIdx++;

	  // if all coefficient values are zero after the decimal point, don't add a decimal value.
	  // otherwise concat with the rest of the coefficients
	  var decimals = c.slice(decimalIdx).join('');
	  var decimalVal = decimals.match(/[1-9]/) ? '.' + decimals : '';

	  var str = c.slice(0, decimalIdx).join('') + decimalVal + 'e' + (e >= 0 ? '+' : '') + newExp.toString();
	  return rounded.sign + str;
	};

	/**
	 * Format a number with fixed notation.
	 * @param {number | string} value
	 * @param {number} [precision=0]        Optional number of decimals after the
	 *                                      decimal point. Zero by default.
	 */
	exports.toFixed = function (value, precision) {
	  if (isNaN(value) || !isFinite(value)) {
	    return String(value);
	  }

	  var splitValue = exports.splitNumber(value);
	  var rounded = exports.roundDigits(splitValue, splitValue.exponent + 1 + (precision || 0));
	  var c = rounded.coefficients;
	  var p = rounded.exponent + 1; // exponent may have changed

	  // append zeros if needed
	  var pp = p + (precision || 0);
	  if (c.length < pp) {
	    c = c.concat(zeros(pp - c.length));
	  }

	  // prepend zeros if needed
	  if (p < 0) {
	    c = zeros(-p + 1).concat(c);
	    p = 1;
	  }

	  // insert a dot if needed
	  if (precision) {
	    c.splice(p, 0, p === 0 ? '0.' : '.');
	  }

	  return rounded.sign + c.join('');
	};

	/**
	 * Format a number in exponential notation. Like '1.23e+5', '2.3e+0', '3.500e-3'
	 * @param {number | string} value
	 * @param {number} [precision]  Number of digits in formatted output.
	 *                              If not provided, the maximum available digits
	 *                              is used.
	 */
	exports.toExponential = function (value, precision) {
	  if (isNaN(value) || !isFinite(value)) {
	    return String(value);
	  }

	  // round if needed, else create a clone
	  var split = exports.splitNumber(value);
	  var rounded = precision ? exports.roundDigits(split, precision) : split;
	  var c = rounded.coefficients;
	  var e = rounded.exponent;

	  // append zeros if needed
	  if (c.length < precision) {
	    c = c.concat(zeros(precision - c.length));
	  }

	  // format as `C.CCCe+EEE` or `C.CCCe-EEE`
	  var first = c.shift();
	  return rounded.sign + first + (c.length > 0 ? '.' + c.join('') : '') + 'e' + (e >= 0 ? '+' : '') + e;
	};

	/**
	 * Format a number with a certain precision
	 * @param {number | string} value
	 * @param {number} [precision=undefined] Optional number of digits.
	 * @param {{lower: number | undefined, upper: number | undefined}} [options]
	 *                                       By default:
	 *                                         lower = 1e-3 (excl)
	 *                                         upper = 1e+5 (incl)
	 * @return {string}
	 */
	exports.toPrecision = function (value, precision, options) {
	  if (isNaN(value) || !isFinite(value)) {
	    return String(value);
	  }

	  // determine lower and upper bound for exponential notation.
	  var lower = options && options.lower !== undefined ? options.lower : 1e-3;
	  var upper = options && options.upper !== undefined ? options.upper : 1e+5;

	  var split = exports.splitNumber(value);
	  var abs = Math.abs(Math.pow(10, split.exponent));
	  if (abs < lower || abs >= upper) {
	    // exponential notation
	    return exports.toExponential(value, precision);
	  } else {
	    var rounded = precision ? exports.roundDigits(split, precision) : split;
	    var c = rounded.coefficients;
	    var e = rounded.exponent;

	    // append trailing zeros
	    if (c.length < precision) {
	      c = c.concat(zeros(precision - c.length));
	    }

	    // append trailing zeros
	    // TODO: simplify the next statement
	    c = c.concat(zeros(e - c.length + 1 + (c.length < precision ? precision - c.length : 0)));

	    // prepend zeros
	    c = zeros(-e).concat(c);

	    var dot = e > 0 ? e : 0;
	    if (dot < c.length - 1) {
	      c.splice(dot + 1, 0, '.');
	    }

	    return rounded.sign + c.join('');
	  }
	};

	/**
	 * Round the number of digits of a number *
	 * @param {SplitValue} split       A value split with .splitNumber(value)
	 * @param {number} precision  A positive integer
	 * @return {SplitValue}
	 *              Returns an object containing sign, coefficients, and exponent
	 *              with rounded digits
	 */
	exports.roundDigits = function (split, precision) {
	  // create a clone
	  var rounded = {
	    sign: split.sign,
	    coefficients: split.coefficients,
	    exponent: split.exponent
	  };
	  var c = rounded.coefficients;

	  // prepend zeros if needed
	  while (precision <= 0) {
	    c.unshift(0);
	    rounded.exponent++;
	    precision++;
	  }

	  if (c.length > precision) {
	    var removed = c.splice(precision, c.length - precision);

	    if (removed[0] >= 5) {
	      var i = precision - 1;
	      c[i]++;
	      while (c[i] === 10) {
	        c.pop();
	        if (i === 0) {
	          c.unshift(0);
	          rounded.exponent++;
	          i++;
	        }
	        i--;
	        c[i]++;
	      }
	    }
	  }

	  return rounded;
	};

	/**
	 * Create an array filled with zeros.
	 * @param {number} length
	 * @return {Array}
	 */
	function zeros(length) {
	  var arr = [];
	  for (var i = 0; i < length; i++) {
	    arr.push(0);
	  }
	  return arr;
	}

	/**
	 * Count the number of significant digits of a number.
	 *
	 * For example:
	 *   2.34 returns 3
	 *   0.0034 returns 2
	 *   120.5e+30 returns 4
	 *
	 * @param {number} value
	 * @return {number} digits   Number of significant digits
	 */
	exports.digits = function (value) {
	  return value.toExponential().replace(/e.*$/, '') // remove exponential notation
	  .replace(/^0\.?0*|\./, '') // remove decimal point and leading zeros
	  .length;
	};

	/**
	 * Minimum number added to one that makes the result different than one
	 */
	exports.DBL_EPSILON = Number.EPSILON || 2.2204460492503130808472633361816E-16;

	/**
	 * Compares two floating point numbers.
	 * @param {number} x          First value to compare
	 * @param {number} y          Second value to compare
	 * @param {number} [epsilon]  The maximum relative difference between x and y
	 *                            If epsilon is undefined or null, the function will
	 *                            test whether x and y are exactly equal.
	 * @return {boolean} whether the two numbers are nearly equal
	*/
	exports.nearlyEqual = function (x, y, epsilon) {
	  // if epsilon is null or undefined, test whether x and y are exactly equal
	  if (epsilon == null) {
	    return x == y;
	  }

	  // use "==" operator, handles infinities
	  if (x == y) {
	    return true;
	  }

	  // NaN
	  if (isNaN(x) || isNaN(y)) {
	    return false;
	  }

	  // at this point x and y should be finite
	  if (isFinite(x) && isFinite(y)) {
	    // check numbers are very close, needed when comparing numbers near zero
	    var diff = Math.abs(x - y);
	    if (diff < exports.DBL_EPSILON) {
	      return true;
	    } else {
	      // use relative error
	      return diff <= Math.max(Math.abs(x), Math.abs(y)) * epsilon;
	    }
	  }

	  // Infinite and Number or negative Infinite and positive Infinite cases
	  return false;
	};

/***/ }),
/* 20 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Test whether a value is a Matrix
	 * @param {*} x
	 * @returns {boolean} returns true with input is a Matrix
	 *                    (like a DenseMatrix or SparseMatrix)
	 */

	module.exports = function isMatrix(x) {
	  return x && x.constructor.prototype.isMatrix || false;
	};

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	var Emitter = __webpack_require__(22);

	/**
	 * Extend given object with emitter functions `on`, `off`, `once`, `emit`
	 * @param {Object} obj
	 * @return {Object} obj
	 */
	exports.mixin = function (obj) {
	  // create event emitter
	  var emitter = new Emitter();

	  // bind methods to obj (we don't want to expose the emitter.e Array...)
	  obj.on = emitter.on.bind(emitter);
	  obj.off = emitter.off.bind(emitter);
	  obj.once = emitter.once.bind(emitter);
	  obj.emit = emitter.emit.bind(emitter);

	  return obj;
	};

/***/ }),
/* 22 */
/***/ (function(module, exports) {

	function E() {
	  // Keep this empty so it's easier to inherit from
	  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
	}

	E.prototype = {
	  on: function (name, callback, ctx) {
	    var e = this.e || (this.e = {});

	    (e[name] || (e[name] = [])).push({
	      fn: callback,
	      ctx: ctx
	    });

	    return this;
	  },

	  once: function (name, callback, ctx) {
	    var self = this;
	    function listener() {
	      self.off(name, listener);
	      callback.apply(ctx, arguments);
	    };

	    listener._ = callback;
	    return this.on(name, listener, ctx);
	  },

	  emit: function (name) {
	    var data = [].slice.call(arguments, 1);
	    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
	    var i = 0;
	    var len = evtArr.length;

	    for (i; i < len; i++) {
	      evtArr[i].fn.apply(evtArr[i].ctx, data);
	    }

	    return this;
	  },

	  off: function (name, callback) {
	    var e = this.e || (this.e = {});
	    var evts = e[name];
	    var liveEvents = [];

	    if (evts && callback) {
	      for (var i = 0, len = evts.length; i < len; i++) {
	        if (evts[i].fn !== callback && evts[i].fn._ !== callback) liveEvents.push(evts[i]);
	      }
	    }

	    // Remove event from queue to prevent memory leak
	    // Suggested by https://github.com/lazd
	    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

	    liveEvents.length ? e[name] = liveEvents : delete e[name];

	    return this;
	  }
	};

		module.exports = E;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var lazy = __webpack_require__(15).lazy;
	var isFactory = __webpack_require__(15).isFactory;
	var traverse = __webpack_require__(15).traverse;
	var ArgumentsError = __webpack_require__(24);

	function factory(type, config, load, typed, math) {
	  /**
	   * Import functions from an object or a module
	   *
	   * Syntax:
	   *
	   *    math.import(object)
	   *    math.import(object, options)
	   *
	   * Where:
	   *
	   * - `object: Object`
	   *   An object with functions to be imported.
	   * - `options: Object` An object with import options. Available options:
	   *   - `override: boolean`
	   *     If true, existing functions will be overwritten. False by default.
	   *   - `silent: boolean`
	   *     If true, the function will not throw errors on duplicates or invalid
	   *     types. False by default.
	   *   - `wrap: boolean`
	   *     If true, the functions will be wrapped in a wrapper function
	   *     which converts data types like Matrix to primitive data types like Array.
	   *     The wrapper is needed when extending math.js with libraries which do not
	   *     support these data type. False by default.
	   *
	   * Examples:
	   *
	   *    // define new functions and variables
	   *    math.import({
	   *      myvalue: 42,
	   *      hello: function (name) {
	   *        return 'hello, ' + name + '!';
	   *      }
	   *    });
	   *
	   *    // use the imported function and variable
	   *    math.myvalue * 2;               // 84
	   *    math.hello('user');             // 'hello, user!'
	   *
	   *    // import the npm module 'numbers'
	   *    // (must be installed first with `npm install numbers`)
	   *    math.import(require('numbers'), {wrap: true});
	   *
	   *    math.fibonacci(7); // returns 13
	   *
	   * @param {Object | Array} object   Object with functions to be imported.
	   * @param {Object} [options]        Import options.
	   */
	  function math_import(object, options) {
	    var num = arguments.length;
	    if (num !== 1 && num !== 2) {
	      throw new ArgumentsError('import', num, 1, 2);
	    }

	    if (!options) {
	      options = {};
	    }

	    if (isFactory(object)) {
	      _importFactory(object, options);
	    }
	    // TODO: allow a typed-function with name too
	    else if (Array.isArray(object)) {
	        object.forEach(function (entry) {
	          math_import(entry, options);
	        });
	      } else if (typeof object === 'object') {
	        // a map with functions
	        for (var name in object) {
	          if (object.hasOwnProperty(name)) {
	            var value = object[name];
	            if (isSupportedType(value)) {
	              _import(name, value, options);
	            } else if (isFactory(object)) {
	              _importFactory(object, options);
	            } else {
	              math_import(value, options);
	            }
	          }
	        }
	      } else {
	        if (!options.silent) {
	          throw new TypeError('Factory, Object, or Array expected');
	        }
	      }
	  }

	  /**
	   * Add a property to the math namespace and create a chain proxy for it.
	   * @param {string} name
	   * @param {*} value
	   * @param {Object} options  See import for a description of the options
	   * @private
	   */
	  function _import(name, value, options) {
	    // TODO: refactor this function, it's to complicated and contains duplicate code
	    if (options.wrap && typeof value === 'function') {
	      // create a wrapper around the function
	      value = _wrap(value);
	    }

	    if (isTypedFunction(math[name]) && isTypedFunction(value)) {
	      if (options.override) {
	        // give the typed function the right name
	        value = typed(name, value.signatures);
	      } else {
	        // merge the existing and typed function
	        value = typed(math[name], value);
	      }

	      math[name] = value;
	      _importTransform(name, value);
	      math.emit('import', name, function resolver() {
	        return value;
	      });
	      return;
	    }

	    if (math[name] === undefined || options.override) {
	      math[name] = value;
	      _importTransform(name, value);
	      math.emit('import', name, function resolver() {
	        return value;
	      });
	      return;
	    }

	    if (!options.silent) {
	      throw new Error('Cannot import "' + name + '": already exists');
	    }
	  }

	  function _importTransform(name, value) {
	    if (value && typeof value.transform === 'function') {
	      math.expression.transform[name] = value.transform;
	      if (allowedInExpressions(name)) {
	        math.expression.mathWithTransform[name] = value.transform;
	      }
	    } else {
	      // remove existing transform
	      delete math.expression.transform[name];
	      if (allowedInExpressions(name)) {
	        math.expression.mathWithTransform[name] = value;
	      }
	    }
	  }

	  /**
	   * Create a wrapper a round an function which converts the arguments
	   * to their primitive values (like convert a Matrix to Array)
	   * @param {Function} fn
	   * @return {Function} Returns the wrapped function
	   * @private
	   */
	  function _wrap(fn) {
	    var wrapper = function wrapper() {
	      var args = [];
	      for (var i = 0, len = arguments.length; i < len; i++) {
	        var arg = arguments[i];
	        args[i] = arg && arg.valueOf();
	      }
	      return fn.apply(math, args);
	    };

	    if (fn.transform) {
	      wrapper.transform = fn.transform;
	    }

	    return wrapper;
	  }

	  /**
	   * Import an instance of a factory into math.js
	   * @param {{factory: Function, name: string, path: string, math: boolean}} factory
	   * @param {Object} options  See import for a description of the options
	   * @private
	   */
	  function _importFactory(factory, options) {
	    if (typeof factory.name === 'string') {
	      var name = factory.name;
	      var existingTransform = name in math.expression.transform;
	      var namespace = factory.path ? traverse(math, factory.path) : math;
	      var existing = namespace.hasOwnProperty(name) ? namespace[name] : undefined;

	      var resolver = function () {
	        var instance = load(factory);
	        if (instance && typeof instance.transform === 'function') {
	          throw new Error('Transforms cannot be attached to factory functions. ' + 'Please create a separate function for it with exports.path="expression.transform"');
	        }

	        if (isTypedFunction(existing) && isTypedFunction(instance)) {
	          if (options.override) {
	            // replace the existing typed function (nothing to do)
	          } else {
	            // merge the existing and new typed function
	            instance = typed(existing, instance);
	          }

	          return instance;
	        }

	        if (existing === undefined || options.override) {
	          return instance;
	        }

	        if (!options.silent) {
	          throw new Error('Cannot import "' + name + '": already exists');
	        }
	      };

	      if (factory.lazy !== false) {
	        lazy(namespace, name, resolver);

	        if (!existingTransform) {
	          if (factory.path === 'expression.transform' || factoryAllowedInExpressions(factory)) {
	            lazy(math.expression.mathWithTransform, name, resolver);
	          }
	        }
	      } else {
	        namespace[name] = resolver();

	        if (!existingTransform) {
	          if (factory.path === 'expression.transform' || factoryAllowedInExpressions(factory)) {
	            math.expression.mathWithTransform[name] = resolver();
	          }
	        }
	      }

	      math.emit('import', name, resolver, factory.path);
	    } else {
	      // unnamed factory.
	      // no lazy loading
	      load(factory);
	    }
	  }

	  /**
	   * Check whether given object is a type which can be imported
	   * @param {Function | number | string | boolean | null | Unit | Complex} object
	   * @return {boolean}
	   * @private
	   */
	  function isSupportedType(object) {
	    return typeof object === 'function' || typeof object === 'number' || typeof object === 'string' || typeof object === 'boolean' || object === null || object && type.isUnit(object) || object && type.isComplex(object) || object && type.isBigNumber(object) || object && type.isFraction(object) || object && type.isMatrix(object) || object && Array.isArray(object);
	  }

	  /**
	   * Test whether a given thing is a typed-function
	   * @param {*} fn
	   * @return {boolean} Returns true when `fn` is a typed-function
	   */
	  function isTypedFunction(fn) {
	    return typeof fn === 'function' && typeof fn.signatures === 'object';
	  }

	  function allowedInExpressions(name) {
	    return !unsafe.hasOwnProperty(name);
	  }

	  function factoryAllowedInExpressions(factory) {
	    return factory.path === undefined && !unsafe.hasOwnProperty(factory.name);
	  }

	  // namespaces and functions not available in the parser for safety reasons
	  var unsafe = {
	    'expression': true,
	    'type': true,
	    'docs': true,
	    'error': true,
	    'json': true,
	    'chain': true // chain method not supported. Note that there is a unit chain too.
	  };

	  return math_import;
	}

	exports.math = true; // request access to the math namespace as 5th argument of the factory function
	exports.name = 'import';
	exports.factory = factory;
	exports.lazy = true;

/***/ }),
/* 24 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Create a syntax error with the message:
	 *     'Wrong number of arguments in function <fn> (<count> provided, <min>-<max> expected)'
	 * @param {string} fn     Function name
	 * @param {number} count  Actual argument count
	 * @param {number} min    Minimum required argument count
	 * @param {number} [max]  Maximum required argument count
	 * @extends Error
	 */

	function ArgumentsError(fn, count, min, max) {
	  if (!(this instanceof ArgumentsError)) {
	    throw new SyntaxError('Constructor must be called with the new operator');
	  }

	  this.fn = fn;
	  this.count = count;
	  this.min = min;
	  this.max = max;

	  this.message = 'Wrong number of arguments in function ' + fn + ' (' + count + ' provided, ' + min + (max != undefined ? '-' + max : '') + ' expected)';

	  this.stack = new Error().stack;
	}

	ArgumentsError.prototype = new Error();
	ArgumentsError.prototype.constructor = Error;
	ArgumentsError.prototype.name = 'ArgumentsError';
	ArgumentsError.prototype.isArgumentsError = true;

	module.exports = ArgumentsError;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var object = __webpack_require__(15);

	function factory(type, config, load, typed, math) {
	  var MATRIX = ['Matrix', 'Array']; // valid values for option matrix
	  var NUMBER = ['number', 'BigNumber', 'Fraction']; // valid values for option number

	  /**
	   * Set configuration options for math.js, and get current options.
	   * Will emit a 'config' event, with arguments (curr, prev, changes).
	   *
	   * Syntax:
	   *
	   *     math.config(config: Object): Object
	   *
	   * Examples:
	   *
	   *     math.config().number;                // outputs 'number'
	   *     math.eval('0.4');                    // outputs number 0.4
	   *     math.config({number: 'Fraction'});
	   *     math.eval('0.4');                    // outputs Fraction 2/5
	   *
	   * @param {Object} [options] Available options:
	   *                            {number} epsilon
	   *                              Minimum relative difference between two
	   *                              compared values, used by all comparison functions.
	   *                            {string} matrix
	   *                              A string 'Matrix' (default) or 'Array'.
	   *                            {string} number
	   *                              A string 'number' (default), 'BigNumber', or 'Fraction'
	   *                            {number} precision
	   *                              The number of significant digits for BigNumbers.
	   *                              Not applicable for Numbers.
	   *                            {string} parenthesis
	   *                              How to display parentheses in LaTeX and string
	   *                              output.
	   *                            {string} randomSeed
	   *                              Random seed for seeded pseudo random number generator.
	   *                              Set to null to randomly seed.
	   * @return {Object} Returns the current configuration
	   */
	  function _config(options) {
	    if (options) {
	      var prev = object.map(config, object.clone);

	      // validate some of the options
	      validateOption(options, 'matrix', MATRIX);
	      validateOption(options, 'number', NUMBER);

	      // merge options
	      object.deepExtend(config, options);

	      var curr = object.map(config, object.clone);

	      var changes = object.map(options, object.clone);

	      // emit 'config' event
	      math.emit('config', curr, prev, changes);

	      return curr;
	    } else {
	      return object.map(config, object.clone);
	    }
	  }

	  // attach the valid options to the function so they can be extended
	  _config.MATRIX = MATRIX;
	  _config.NUMBER = NUMBER;

	  return _config;
	}

	/**
	 * Test whether an Array contains a specific item.
	 * @param {Array.<string>} array
	 * @param {string} item
	 * @return {boolean}
	 */
	function contains(array, item) {
	  return array.indexOf(item) !== -1;
	}

	/**
	 * Find a string in an array. Case insensitive search
	 * @param {Array.<string>} array
	 * @param {string} item
	 * @return {number} Returns the index when found. Returns -1 when not found
	 */
	function findIndex(array, item) {
	  return array.map(function (i) {
	    return i.toLowerCase();
	  }).indexOf(item.toLowerCase());
	}

	/**
	 * Validate an option
	 * @param {Object} options         Object with options
	 * @param {string} name            Name of the option to validate
	 * @param {Array.<string>} values  Array with valid values for this option
	 */
	function validateOption(options, name, values) {
	  if (options[name] !== undefined && !contains(values, options[name])) {
	    var index = findIndex(values, options[name]);
	    if (index !== -1) {
	      // right value, wrong casing
	      // TODO: lower case values are deprecated since v3, remove this warning some day.
	      console.warn('Warning: Wrong casing for configuration option "' + name + '", should be "' + values[index] + '" instead of "' + options[name] + '".');

	      options[name] = values[index]; // change the option to the right casing
	    } else {
	      // unknown value
	      console.warn('Warning: Unknown value "' + options[name] + '" for configuration option "' + name + '". Available options: ' + values.map(JSON.stringify).join(', ') + '.');
	    }
	  }
	}

	exports.name = 'config';
	exports.math = true; // request the math namespace as fifth argument
	exports.factory = factory;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = [
	// types
	__webpack_require__(27), __webpack_require__(37), __webpack_require__(39), __webpack_require__(42), __webpack_require__(52), __webpack_require__(58), __webpack_require__(59), __webpack_require__(60),

	// construction functions
	__webpack_require__(61), __webpack_require__(44), __webpack_require__(62)];

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(28);

	var string = util.string;

	var isString = string.isString;

	function factory(type, config, load, typed) {
	  /**
	   * @constructor Matrix
	   *
	   * A Matrix is a wrapper around an Array. A matrix can hold a multi dimensional
	   * array. A matrix can be constructed as:
	   *     var matrix = math.matrix(data)
	   *
	   * Matrix contains the functions to resize, get and set values, get the size,
	   * clone the matrix and to convert the matrix to a vector, array, or scalar.
	   * Furthermore, one can iterate over the matrix using map and forEach.
	   * The internal Array of the Matrix can be accessed using the function valueOf.
	   *
	   * Example usage:
	   *     var matrix = math.matrix([[1, 2], [3, 4]]);
	   *     matix.size();              // [2, 2]
	   *     matrix.resize([3, 2], 5);
	   *     matrix.valueOf();          // [[1, 2], [3, 4], [5, 5]]
	   *     matrix.subset([1,2])       // 3 (indexes are zero-based)
	   *
	   */
	  function Matrix() {
	    if (!(this instanceof Matrix)) {
	      throw new SyntaxError('Constructor must be called with the new operator');
	    }
	  }

	  /**
	   * Attach type information
	   */
	  Matrix.prototype.type = 'Matrix';
	  Matrix.prototype.isMatrix = true;

	  /**
	   * Get the Matrix storage constructor for the given format.
	   *
	   * @param {string} format       The Matrix storage format.
	   *
	   * @return {Function}           The Matrix storage constructor.
	   */
	  Matrix.storage = function (format) {
	    // check storage format is a string
	    if (!isString(format)) {
	      throw new TypeError('format must be a string value');
	    }

	    // get storage format constructor
	    var constructor = Matrix._storage[format];
	    if (!constructor) {
	      throw new SyntaxError('Unsupported matrix storage format: ' + format);
	    }

	    // return storage constructor
	    return constructor;
	  };

	  // a map with all constructors for all storage types
	  Matrix._storage = {};

	  /**
	   * Get the storage format used by the matrix.
	   *
	   * Usage:
	   *     var format = matrix.storage()                   // retrieve storage format
	   *
	   * @return {string}           The storage format.
	   */
	  Matrix.prototype.storage = function () {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke storage on a Matrix interface');
	  };

	  /**
	   * Get the datatype of the data stored in the matrix.
	   *
	   * Usage:
	   *     var format = matrix.datatype()                   // retrieve matrix datatype
	   *
	   * @return {string}           The datatype.
	   */
	  Matrix.prototype.datatype = function () {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke datatype on a Matrix interface');
	  };

	  /**
	   * Create a new Matrix With the type of the current matrix instance
	   * @param {Array | Object} data
	   * @param {string} [datatype]
	   */
	  Matrix.prototype.create = function (data, datatype) {
	    throw new Error('Cannot invoke create on a Matrix interface');
	  };

	  /**
	   * Get a subset of the matrix, or replace a subset of the matrix.
	   *
	   * Usage:
	   *     var subset = matrix.subset(index)               // retrieve subset
	   *     var value = matrix.subset(index, replacement)   // replace subset
	   *
	   * @param {Index} index
	   * @param {Array | Matrix | *} [replacement]
	   * @param {*} [defaultValue=0]      Default value, filled in on new entries when
	   *                                  the matrix is resized. If not provided,
	   *                                  new matrix elements will be filled with zeros.
	   */
	  Matrix.prototype.subset = function (index, replacement, defaultValue) {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke subset on a Matrix interface');
	  };

	  /**
	   * Get a single element from the matrix.
	   * @param {number[]} index   Zero-based index
	   * @return {*} value
	   */
	  Matrix.prototype.get = function (index) {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke get on a Matrix interface');
	  };

	  /**
	   * Replace a single element in the matrix.
	   * @param {number[]} index   Zero-based index
	   * @param {*} value
	   * @param {*} [defaultValue]        Default value, filled in on new entries when
	   *                                  the matrix is resized. If not provided,
	   *                                  new matrix elements will be left undefined.
	   * @return {Matrix} self
	   */
	  Matrix.prototype.set = function (index, value, defaultValue) {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke set on a Matrix interface');
	  };

	  /**
	   * Resize the matrix to the given size. Returns a copy of the matrix when 
	   * `copy=true`, otherwise return the matrix itself (resize in place).
	   *
	   * @param {number[]} size           The new size the matrix should have.
	   * @param {*} [defaultValue=0]      Default value, filled in on new entries.
	   *                                  If not provided, the matrix elements will
	   *                                  be filled with zeros.
	   * @param {boolean} [copy]          Return a resized copy of the matrix
	   *
	   * @return {Matrix}                 The resized matrix
	   */
	  Matrix.prototype.resize = function (size, defaultValue) {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke resize on a Matrix interface');
	  };

	  /**
	   * Reshape the matrix to the given size. Returns a copy of the matrix when
	   * `copy=true`, otherwise return the matrix itself (reshape in place).
	   *
	   * @param {number[]} size           The new size the matrix should have.
	   * @param {boolean} [copy]          Return a reshaped copy of the matrix
	   *
	   * @return {Matrix}                 The reshaped matrix
	   */
	  Matrix.prototype.reshape = function (size, defaultValue) {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke reshape on a Matrix interface');
	  };

	  /**
	   * Create a clone of the matrix
	   * @return {Matrix} clone
	   */
	  Matrix.prototype.clone = function () {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke clone on a Matrix interface');
	  };

	  /**
	   * Retrieve the size of the matrix.
	   * @returns {number[]} size
	   */
	  Matrix.prototype.size = function () {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke size on a Matrix interface');
	  };

	  /**
	   * Create a new matrix with the results of the callback function executed on
	   * each entry of the matrix.
	   * @param {Function} callback   The callback function is invoked with three
	   *                              parameters: the value of the element, the index
	   *                              of the element, and the Matrix being traversed.
	   * @param {boolean} [skipZeros] Invoke callback function for non-zero values only.
	   *
	   * @return {Matrix} matrix
	   */
	  Matrix.prototype.map = function (callback, skipZeros) {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke map on a Matrix interface');
	  };

	  /**
	   * Execute a callback function on each entry of the matrix.
	   * @param {Function} callback   The callback function is invoked with three
	   *                              parameters: the value of the element, the index
	   *                              of the element, and the Matrix being traversed.
	   */
	  Matrix.prototype.forEach = function (callback) {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke forEach on a Matrix interface');
	  };

	  /**
	   * Create an Array with a copy of the data of the Matrix
	   * @returns {Array} array
	   */
	  Matrix.prototype.toArray = function () {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke toArray on a Matrix interface');
	  };

	  /**
	   * Get the primitive value of the Matrix: a multidimensional array
	   * @returns {Array} array
	   */
	  Matrix.prototype.valueOf = function () {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke valueOf on a Matrix interface');
	  };

	  /**
	   * Get a string representation of the matrix, with optional formatting options.
	   * @param {Object | number | Function} [options]  Formatting options. See
	   *                                                lib/utils/number:format for a
	   *                                                description of the available
	   *                                                options.
	   * @returns {string} str
	   */
	  Matrix.prototype.format = function (options) {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke format on a Matrix interface');
	  };

	  /**
	   * Get a string representation of the matrix
	   * @returns {string} str
	   */
	  Matrix.prototype.toString = function () {
	    // must be implemented by each of the Matrix implementations
	    throw new Error('Cannot invoke toString on a Matrix interface');
	  };

	  // exports
	  return Matrix;
	}

	exports.name = 'Matrix';
	exports.path = 'type';
	exports.factory = factory;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	exports.array = __webpack_require__(29);
	exports['boolean'] = __webpack_require__(35);
	exports['function'] = __webpack_require__(36);
	exports.number = __webpack_require__(19);
	exports.object = __webpack_require__(15);
	exports.string = __webpack_require__(30);
	exports.types = __webpack_require__(32);
	exports.emitter = __webpack_require__(21);

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var number = __webpack_require__(19);
	var string = __webpack_require__(30);
	var object = __webpack_require__(15);
	var types = __webpack_require__(32);

	var DimensionError = __webpack_require__(33);
	var IndexError = __webpack_require__(34);

	/**
	 * Calculate the size of a multi dimensional array.
	 * This function checks the size of the first entry, it does not validate
	 * whether all dimensions match. (use function `validate` for that)
	 * @param {Array} x
	 * @Return {Number[]} size
	 */
	exports.size = function (x) {
	  var s = [];

	  while (Array.isArray(x)) {
	    s.push(x.length);
	    x = x[0];
	  }

	  return s;
	};

	/**
	 * Recursively validate whether each element in a multi dimensional array
	 * has a size corresponding to the provided size array.
	 * @param {Array} array    Array to be validated
	 * @param {number[]} size  Array with the size of each dimension
	 * @param {number} dim   Current dimension
	 * @throws DimensionError
	 * @private
	 */
	function _validate(array, size, dim) {
	  var i;
	  var len = array.length;

	  if (len != size[dim]) {
	    throw new DimensionError(len, size[dim]);
	  }

	  if (dim < size.length - 1) {
	    // recursively validate each child array
	    var dimNext = dim + 1;
	    for (i = 0; i < len; i++) {
	      var child = array[i];
	      if (!Array.isArray(child)) {
	        throw new DimensionError(size.length - 1, size.length, '<');
	      }
	      _validate(array[i], size, dimNext);
	    }
	  } else {
	    // last dimension. none of the childs may be an array
	    for (i = 0; i < len; i++) {
	      if (Array.isArray(array[i])) {
	        throw new DimensionError(size.length + 1, size.length, '>');
	      }
	    }
	  }
	}

	/**
	 * Validate whether each element in a multi dimensional array has
	 * a size corresponding to the provided size array.
	 * @param {Array} array    Array to be validated
	 * @param {number[]} size  Array with the size of each dimension
	 * @throws DimensionError
	 */
	exports.validate = function (array, size) {
	  var isScalar = size.length == 0;
	  if (isScalar) {
	    // scalar
	    if (Array.isArray(array)) {
	      throw new DimensionError(array.length, 0);
	    }
	  } else {
	    // array
	    _validate(array, size, 0);
	  }
	};

	/**
	 * Test whether index is an integer number with index >= 0 and index < length
	 * when length is provided
	 * @param {number} index    Zero-based index
	 * @param {number} [length] Length of the array
	 */
	exports.validateIndex = function (index, length) {
	  if (!number.isNumber(index) || !number.isInteger(index)) {
	    throw new TypeError('Index must be an integer (value: ' + index + ')');
	  }
	  if (index < 0 || typeof length === 'number' && index >= length) {
	    throw new IndexError(index, length);
	  }
	};

	// a constant used to specify an undefined defaultValue
	exports.UNINITIALIZED = {};

	/**
	 * Resize a multi dimensional array. The resized array is returned.
	 * @param {Array} array         Array to be resized
	 * @param {Array.<number>} size Array with the size of each dimension
	 * @param {*} [defaultValue=0]  Value to be filled in in new entries,
	 *                              zero by default. To leave new entries undefined,
	 *                              specify array.UNINITIALIZED as defaultValue
	 * @return {Array} array         The resized array
	 */
	exports.resize = function (array, size, defaultValue) {
	  // TODO: add support for scalars, having size=[] ?

	  // check the type of the arguments
	  if (!Array.isArray(array) || !Array.isArray(size)) {
	    throw new TypeError('Array expected');
	  }
	  if (size.length === 0) {
	    throw new Error('Resizing to scalar is not supported');
	  }

	  // check whether size contains positive integers
	  size.forEach(function (value) {
	    if (!number.isNumber(value) || !number.isInteger(value) || value < 0) {
	      throw new TypeError('Invalid size, must contain positive integers ' + '(size: ' + string.format(size) + ')');
	    }
	  });

	  // recursively resize the array
	  var _defaultValue = defaultValue !== undefined ? defaultValue : 0;
	  _resize(array, size, 0, _defaultValue);

	  return array;
	};

	/**
	 * Recursively resize a multi dimensional array
	 * @param {Array} array         Array to be resized
	 * @param {number[]} size       Array with the size of each dimension
	 * @param {number} dim          Current dimension
	 * @param {*} [defaultValue]    Value to be filled in in new entries,
	 *                              undefined by default.
	 * @private
	 */
	function _resize(array, size, dim, defaultValue) {
	  var i;
	  var elem;
	  var oldLen = array.length;
	  var newLen = size[dim];
	  var minLen = Math.min(oldLen, newLen);

	  // apply new length
	  array.length = newLen;

	  if (dim < size.length - 1) {
	    // non-last dimension
	    var dimNext = dim + 1;

	    // resize existing child arrays
	    for (i = 0; i < minLen; i++) {
	      // resize child array
	      elem = array[i];
	      if (!Array.isArray(elem)) {
	        elem = [elem]; // add a dimension
	        array[i] = elem;
	      }
	      _resize(elem, size, dimNext, defaultValue);
	    }

	    // create new child arrays
	    for (i = minLen; i < newLen; i++) {
	      // get child array
	      elem = [];
	      array[i] = elem;

	      // resize new child array
	      _resize(elem, size, dimNext, defaultValue);
	    }
	  } else {
	    // last dimension

	    // remove dimensions of existing values
	    for (i = 0; i < minLen; i++) {
	      while (Array.isArray(array[i])) {
	        array[i] = array[i][0];
	      }
	    }

	    if (defaultValue !== exports.UNINITIALIZED) {
	      // fill new elements with the default value
	      for (i = minLen; i < newLen; i++) {
	        array[i] = defaultValue;
	      }
	    }
	  }
	}

	/**
	 * Re-shape a multi dimensional array to fit the specified dimensions
	 * @param {Array} array           Array to be reshaped
	 * @param {Array.<number>} sizes  List of sizes for each dimension
	 * @returns {Array}               Array whose data has been formatted to fit the
	 *                                specified dimensions
	 *
	 * @throws {DimensionError}       If the product of the new dimension sizes does
	 *                                not equal that of the old ones
	 */
	exports.reshape = function (array, sizes) {
	  var flatArray = exports.flatten(array);
	  var newArray;

	  var product = function (arr) {
	    return arr.reduce(function (prev, curr) {
	      return prev * curr;
	    });
	  };

	  if (!Array.isArray(array) || !Array.isArray(sizes)) {
	    throw new TypeError('Array expected');
	  }

	  if (sizes.length === 0) {
	    throw new DimensionError(0, product(exports.size(array)), '!=');
	  }

	  try {
	    newArray = _reshape(flatArray, sizes);
	  } catch (e) {
	    if (e instanceof DimensionError) {
	      throw new DimensionError(product(sizes), product(exports.size(array)), '!=');
	    }
	    throw e;
	  }

	  if (flatArray.length > 0) {
	    throw new DimensionError(product(sizes), product(exports.size(array)), '!=');
	  }

	  return newArray;
	};

	/**
	 * Recursively re-shape a multi dimensional array to fit the specified dimensions
	 * @param {Array} array           Array to be reshaped
	 * @param {Array.<number>} sizes  List of sizes for each dimension
	 * @returns {Array}               Array whose data has been formatted to fit the
	 *                                specified dimensions
	 *
	 * @throws {DimensionError}       If the product of the new dimension sizes does
	 *                                not equal that of the old ones
	 */
	function _reshape(array, sizes) {
	  var accumulator = [];
	  var i;

	  if (sizes.length === 0) {
	    if (array.length === 0) {
	      throw new DimensionError(null, null, '!=');
	    }
	    return array.shift();
	  }
	  for (i = 0; i < sizes[0]; i += 1) {
	    accumulator.push(_reshape(array, sizes.slice(1)));
	  }
	  return accumulator;
	}

	/**
	 * Squeeze a multi dimensional array
	 * @param {Array} array
	 * @param {Array} [size]
	 * @returns {Array} returns the array itself
	 */
	exports.squeeze = function (array, size) {
	  var s = size || exports.size(array);

	  // squeeze outer dimensions
	  while (Array.isArray(array) && array.length === 1) {
	    array = array[0];
	    s.shift();
	  }

	  // find the first dimension to be squeezed
	  var dims = s.length;
	  while (s[dims - 1] === 1) {
	    dims--;
	  }

	  // squeeze inner dimensions
	  if (dims < s.length) {
	    array = _squeeze(array, dims, 0);
	    s.length = dims;
	  }

	  return array;
	};

	/**
	 * Recursively squeeze a multi dimensional array
	 * @param {Array} array
	 * @param {number} dims Required number of dimensions
	 * @param {number} dim  Current dimension
	 * @returns {Array | *} Returns the squeezed array
	 * @private
	 */
	function _squeeze(array, dims, dim) {
	  var i, ii;

	  if (dim < dims) {
	    var next = dim + 1;
	    for (i = 0, ii = array.length; i < ii; i++) {
	      array[i] = _squeeze(array[i], dims, next);
	    }
	  } else {
	    while (Array.isArray(array)) {
	      array = array[0];
	    }
	  }

	  return array;
	}

	/**
	 * Unsqueeze a multi dimensional array: add dimensions when missing
	 * 
	 * Paramter `size` will be mutated to match the new, unqueezed matrix size.
	 * 
	 * @param {Array} array
	 * @param {number} dims     Desired number of dimensions of the array
	 * @param {number} [outer]  Number of outer dimensions to be added
	 * @param {Array} [size]    Current size of array.
	 * @returns {Array} returns the array itself
	 * @private
	 */
	exports.unsqueeze = function (array, dims, outer, size) {
	  var s = size || exports.size(array);

	  // unsqueeze outer dimensions
	  if (outer) {
	    for (var i = 0; i < outer; i++) {
	      array = [array];
	      s.unshift(1);
	    }
	  }

	  // unsqueeze inner dimensions
	  array = _unsqueeze(array, dims, 0);
	  while (s.length < dims) {
	    s.push(1);
	  }

	  return array;
	};

	/**
	 * Recursively unsqueeze a multi dimensional array
	 * @param {Array} array
	 * @param {number} dims Required number of dimensions
	 * @param {number} dim  Current dimension
	 * @returns {Array | *} Returns the squeezed array
	 * @private
	 */
	function _unsqueeze(array, dims, dim) {
	  var i, ii;

	  if (Array.isArray(array)) {
	    var next = dim + 1;
	    for (i = 0, ii = array.length; i < ii; i++) {
	      array[i] = _unsqueeze(array[i], dims, next);
	    }
	  } else {
	    for (var d = dim; d < dims; d++) {
	      array = [array];
	    }
	  }

	  return array;
	}
	/**
	 * Flatten a multi dimensional array, put all elements in a one dimensional
	 * array
	 * @param {Array} array   A multi dimensional array
	 * @return {Array}        The flattened array (1 dimensional)
	 */
	exports.flatten = function (array) {
	  if (!Array.isArray(array)) {
	    //if not an array, return as is
	    return array;
	  }
	  var flat = [];

	  array.forEach(function callback(value) {
	    if (Array.isArray(value)) {
	      value.forEach(callback); //traverse through sub-arrays recursively
	    } else {
	      flat.push(value);
	    }
	  });

	  return flat;
	};

	/**
	 * A safe map
	 * @param {Array} array
	 * @param {function} callback
	 */
	exports.map = function (array, callback) {
	  return Array.prototype.map.call(array, callback);
	};

	/**
	 * A safe forEach
	 * @param {Array} array
	 * @param {function} callback
	 */
	exports.forEach = function (array, callback) {
	  Array.prototype.forEach.call(array, callback);
	};

	/**
	 * A safe filter
	 * @param {Array} array
	 * @param {function} callback
	 */
	exports.filter = function (array, callback) {
	  if (exports.size(array).length !== 1) {
	    throw new Error('Only one dimensional matrices supported');
	  }

	  return Array.prototype.filter.call(array, callback);
	};

	/**
	 * Filter values in a callback given a regular expression
	 * @param {Array} array
	 * @param {RegExp} regexp
	 * @return {Array} Returns the filtered array
	 * @private
	 */
	exports.filterRegExp = function (array, regexp) {
	  if (exports.size(array).length !== 1) {
	    throw new Error('Only one dimensional matrices supported');
	  }

	  return Array.prototype.filter.call(array, function (entry) {
	    return regexp.test(entry);
	  });
	};

	/**
	 * A safe join
	 * @param {Array} array
	 * @param {string} separator
	 */
	exports.join = function (array, separator) {
	  return Array.prototype.join.call(array, separator);
	};

	/**
	 * Assign a numeric identifier to every element of a sorted array
	 * @param {Array}	a  An array
	 * @return {Array}	An array of objects containing the original value and its identifier
	 */
	exports.identify = function (a) {
	  if (!Array.isArray(a)) {
	    throw new TypeError('Array input expected');
	  }

	  if (a.length === 0) {
	    return a;
	  }

	  var b = [];
	  var count = 0;
	  b[0] = { value: a[0], identifier: 0 };
	  for (var i = 1; i < a.length; i++) {
	    if (a[i] === a[i - 1]) {
	      count++;
	    } else {
	      count = 0;
	    }
	    b.push({ value: a[i], identifier: count });
	  }
	  return b;
	};

	/**
	 * Remove the numeric identifier from the elements
	 * @param	a  An array
	 * @return	An array of values without identifiers
	 */
	exports.generalize = function (a) {
	  if (!Array.isArray(a)) {
	    throw new TypeError('Array input expected');
	  }

	  if (a.length === 0) {
	    return a;
	  }

	  var b = [];
	  for (var i = 0; i < a.length; i++) {
	    b.push(a[i].value);
	  }
	  return b;
	};

	/**
	 * Test whether an object is an array
	 * @param {*} value
	 * @return {boolean} isArray
	 */
		exports.isArray = Array.isArray;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var formatNumber = __webpack_require__(19).format;
	var formatBigNumber = __webpack_require__(31).format;
	var isBigNumber = __webpack_require__(16);

	/**
	 * Test whether value is a string
	 * @param {*} value
	 * @return {boolean} isString
	 */
	exports.isString = function (value) {
	  return typeof value === 'string';
	};

	/**
	 * Check if a text ends with a certain string.
	 * @param {string} text
	 * @param {string} search
	 */
	exports.endsWith = function (text, search) {
	  var start = text.length - search.length;
	  var end = text.length;
	  return text.substring(start, end) === search;
	};

	/**
	 * Format a value of any type into a string.
	 *
	 * Usage:
	 *     math.format(value)
	 *     math.format(value, precision)
	 *
	 * When value is a function:
	 *
	 * - When the function has a property `syntax`, it returns this
	 *   syntax description.
	 * - In other cases, a string `'function'` is returned.
	 *
	 * When `value` is an Object:
	 *
	 * - When the object contains a property `format` being a function, this
	 *   function is invoked as `value.format(options)` and the result is returned.
	 * - When the object has its own `toString` method, this method is invoked
	 *   and the result is returned.
	 * - In other cases the function will loop over all object properties and
	 *   return JSON object notation like '{"a": 2, "b": 3}'.
	 *
	 * Example usage:
	 *     math.format(2/7);                // '0.2857142857142857'
	 *     math.format(math.pi, 3);         // '3.14'
	 *     math.format(new Complex(2, 3));  // '2 + 3i'
	 *     math.format('hello');            // '"hello"'
	 *
	 * @param {*} value             Value to be stringified
	 * @param {Object | number | Function} [options]  Formatting options. See
	 *                                                lib/utils/number:format for a
	 *                                                description of the available
	 *                                                options.
	 * @return {string} str
	 */
	exports.format = function (value, options) {
	  if (typeof value === 'number') {
	    return formatNumber(value, options);
	  }

	  if (isBigNumber(value)) {
	    return formatBigNumber(value, options);
	  }

	  // note: we use unsafe duck-typing here to check for Fractions, this is
	  // ok here since we're only invoking toString or concatenating its values
	  if (looksLikeFraction(value)) {
	    if (!options || options.fraction !== 'decimal') {
	      // output as ratio, like '1/3'
	      return value.s * value.n + '/' + value.d;
	    } else {
	      // output as decimal, like '0.(3)'
	      return value.toString();
	    }
	  }

	  if (Array.isArray(value)) {
	    return formatArray(value, options);
	  }

	  if (exports.isString(value)) {
	    return '"' + value + '"';
	  }

	  if (typeof value === 'function') {
	    return value.syntax ? String(value.syntax) : 'function';
	  }

	  if (value && typeof value === 'object') {
	    if (typeof value.format === 'function') {
	      return value.format(options);
	    } else if (value && value.toString() !== {}.toString()) {
	      // this object has a non-native toString method, use that one
	      return value.toString();
	    } else {
	      var entries = [];

	      for (var key in value) {
	        if (value.hasOwnProperty(key)) {
	          entries.push('"' + key + '": ' + exports.format(value[key], options));
	        }
	      }

	      return '{' + entries.join(', ') + '}';
	    }
	  }

	  return String(value);
	};

	/**
	 * Stringify a value into a string enclosed in double quotes.
	 * Unescaped double quotes and backslashes inside the value are escaped.
	 * @param {*} value
	 * @return {string}
	 */
	exports.stringify = function (value) {
	  var text = String(value);
	  var escaped = '';
	  var i = 0;
	  while (i < text.length) {
	    var c = text.charAt(i);

	    if (c === '\\') {
	      escaped += c;
	      i++;

	      c = text.charAt(i);
	      if (c === '' || '"\\/bfnrtu'.indexOf(c) === -1) {
	        escaped += '\\'; // no valid escape character -> escape it
	      }
	      escaped += c;
	    } else if (c === '"') {
	      escaped += '\\"';
	    } else {
	      escaped += c;
	    }
	    i++;
	  }

	  return '"' + escaped + '"';
	};

	/**
	 * Escape special HTML characters
	 * @param {*} value
	 * @return {string}
	 */
	exports.escape = function (value) {
	  var text = String(value);
	  text = text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

	  return text;
	};

	/**
	 * Recursively format an n-dimensional matrix
	 * Example output: "[[1, 2], [3, 4]]"
	 * @param {Array} array
	 * @param {Object | number | Function} [options]  Formatting options. See
	 *                                                lib/utils/number:format for a
	 *                                                description of the available
	 *                                                options.
	 * @returns {string} str
	 */
	function formatArray(array, options) {
	  if (Array.isArray(array)) {
	    var str = '[';
	    var len = array.length;
	    for (var i = 0; i < len; i++) {
	      if (i != 0) {
	        str += ', ';
	      }
	      str += formatArray(array[i], options);
	    }
	    str += ']';
	    return str;
	  } else {
	    return exports.format(array, options);
	  }
	}

	/**
	 * Check whether a value looks like a Fraction (unsafe duck-type check)
	 * @param {*} value
	 * @return {boolean}
	 */
	function looksLikeFraction(value) {
	  return value && typeof value === 'object' && typeof value.s === 'number' && typeof value.n === 'number' && typeof value.d === 'number' || false;
		}

/***/ }),
/* 31 */
/***/ (function(module, exports) {

	/**
	 * Convert a BigNumber to a formatted string representation.
	 *
	 * Syntax:
	 *
	 *    format(value)
	 *    format(value, options)
	 *    format(value, precision)
	 *    format(value, fn)
	 *
	 * Where:
	 *
	 *    {number} value   The value to be formatted
	 *    {Object} options An object with formatting options. Available options:
	 *                     {string} notation
	 *                         Number notation. Choose from:
	 *                         'fixed'          Always use regular number notation.
	 *                                          For example '123.40' and '14000000'
	 *                         'exponential'    Always use exponential notation.
	 *                                          For example '1.234e+2' and '1.4e+7'
	 *                         'auto' (default) Regular number notation for numbers
	 *                                          having an absolute value between
	 *                                          `lower` and `upper` bounds, and uses
	 *                                          exponential notation elsewhere.
	 *                                          Lower bound is included, upper bound
	 *                                          is excluded.
	 *                                          For example '123.4' and '1.4e7'.
	 *                     {number} precision   A number between 0 and 16 to round
	 *                                          the digits of the number.
	 *                                          In case of notations 'exponential' and
	 *                                          'auto', `precision` defines the total
	 *                                          number of significant digits returned
	 *                                          and is undefined by default.
	 *                                          In case of notation 'fixed',
	 *                                          `precision` defines the number of
	 *                                          significant digits after the decimal
	 *                                          point, and is 0 by default.
	 *                     {Object} exponential An object containing two parameters,
	 *                                          {number} lower and {number} upper,
	 *                                          used by notation 'auto' to determine
	 *                                          when to return exponential notation.
	 *                                          Default values are `lower=1e-3` and
	 *                                          `upper=1e5`.
	 *                                          Only applicable for notation `auto`.
	 *    {Function} fn    A custom formatting function. Can be used to override the
	 *                     built-in notations. Function `fn` is called with `value` as
	 *                     parameter and must return a string. Is useful for example to
	 *                     format all values inside a matrix in a particular way.
	 *
	 * Examples:
	 *
	 *    format(6.4);                                        // '6.4'
	 *    format(1240000);                                    // '1.24e6'
	 *    format(1/3);                                        // '0.3333333333333333'
	 *    format(1/3, 3);                                     // '0.333'
	 *    format(21385, 2);                                   // '21000'
	 *    format(12.071, {notation: 'fixed'});                // '12'
	 *    format(2.3,    {notation: 'fixed', precision: 2});  // '2.30'
	 *    format(52.8,   {notation: 'exponential'});          // '5.28e+1'
	 *
	 * @param {BigNumber} value
	 * @param {Object | Function | number} [options]
	 * @return {string} str The formatted value
	 */
	exports.format = function (value, options) {
	  if (typeof options === 'function') {
	    // handle format(value, fn)
	    return options(value);
	  }

	  // handle special cases
	  if (!value.isFinite()) {
	    return value.isNaN() ? 'NaN' : value.gt(0) ? 'Infinity' : '-Infinity';
	  }

	  // default values for options
	  var notation = 'auto';
	  var precision = undefined;

	  if (options !== undefined) {
	    // determine notation from options
	    if (options.notation) {
	      notation = options.notation;
	    }

	    // determine precision from options
	    if (typeof options === 'number') {
	      precision = options;
	    } else if (options.precision) {
	      precision = options.precision;
	    }
	  }

	  // handle the various notations
	  switch (notation) {
	    case 'fixed':
	      return exports.toFixed(value, precision);

	    case 'exponential':
	      return exports.toExponential(value, precision);

	    case 'auto':
	      // determine lower and upper bound for exponential notation.
	      // TODO: implement support for upper and lower to be BigNumbers themselves
	      var lower = 1e-3;
	      var upper = 1e5;
	      if (options && options.exponential) {
	        if (options.exponential.lower !== undefined) {
	          lower = options.exponential.lower;
	        }
	        if (options.exponential.upper !== undefined) {
	          upper = options.exponential.upper;
	        }
	      }

	      // adjust the configuration of the BigNumber constructor (yeah, this is quite tricky...)
	      var oldConfig = {
	        toExpNeg: value.constructor.toExpNeg,
	        toExpPos: value.constructor.toExpPos
	      };

	      value.constructor.config({
	        toExpNeg: Math.round(Math.log(lower) / Math.LN10),
	        toExpPos: Math.round(Math.log(upper) / Math.LN10)
	      });

	      // handle special case zero
	      if (value.isZero()) return '0';

	      // determine whether or not to output exponential notation
	      var str;
	      var abs = value.abs();
	      if (abs.gte(lower) && abs.lt(upper)) {
	        // normal number notation
	        str = value.toSignificantDigits(precision).toFixed();
	      } else {
	        // exponential notation
	        str = exports.toExponential(value, precision);
	      }

	      // remove trailing zeros after the decimal point
	      return str.replace(/((\.\d*?)(0+))($|e)/, function () {
	        var digits = arguments[2];
	        var e = arguments[4];
	        return digits !== '.' ? digits + e : e;
	      });

	    default:
	      throw new Error('Unknown notation "' + notation + '". ' + 'Choose "auto", "exponential", or "fixed".');
	  }
	};

	/**
	 * Format a number in exponential notation. Like '1.23e+5', '2.3e+0', '3.500e-3'
	 * @param {BigNumber} value
	 * @param {number} [precision]  Number of digits in formatted output.
	 *                              If not provided, the maximum available digits
	 *                              is used.
	 * @returns {string} str
	 */
	exports.toExponential = function (value, precision) {
	  if (precision !== undefined) {
	    return value.toExponential(precision - 1); // Note the offset of one
	  } else {
	    return value.toExponential();
	  }
	};

	/**
	 * Format a number with fixed notation.
	 * @param {BigNumber} value
	 * @param {number} [precision=0]        Optional number of decimals after the
	 *                                      decimal point. Zero by default.
	 */
	exports.toFixed = function (value, precision) {
	  return value.toFixed(precision || 0);
	  // Note: the (precision || 0) is needed as the toFixed of BigNumber has an
	  // undefined default precision instead of 0.
	};

/***/ }),
/* 32 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Determine the type of a variable
	 *
	 *     type(x)
	 *
	 * The following types are recognized:
	 *
	 *     'undefined'
	 *     'null'
	 *     'boolean'
	 *     'number'
	 *     'string'
	 *     'Array'
	 *     'Function'
	 *     'Date'
	 *     'RegExp'
	 *     'Object'
	 *
	 * @param {*} x
	 * @return {string} Returns the name of the type. Primitive types are lower case,
	 *                  non-primitive types are upper-camel-case.
	 *                  For example 'number', 'string', 'Array', 'Date'.
	 */

	exports.type = function (x) {
	  var type = typeof x;

	  if (type === 'object') {
	    if (x === null) return 'null';
	    if (Array.isArray(x)) return 'Array';
	    if (x instanceof Date) return 'Date';
	    if (x instanceof RegExp) return 'RegExp';
	    if (x instanceof Boolean) return 'boolean';
	    if (x instanceof Number) return 'number';
	    if (x instanceof String) return 'string';

	    return 'Object';
	  }

	  if (type === 'function') return 'Function';

	  return type;
	};

/***/ }),
/* 33 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Create a range error with the message:
	 *     'Dimension mismatch (<actual size> != <expected size>)'
	 * @param {number | number[]} actual        The actual size
	 * @param {number | number[]} expected      The expected size
	 * @param {string} [relation='!=']          Optional relation between actual
	 *                                          and expected size: '!=', '<', etc.
	 * @extends RangeError
	 */

	function DimensionError(actual, expected, relation) {
	  if (!(this instanceof DimensionError)) {
	    throw new SyntaxError('Constructor must be called with the new operator');
	  }

	  this.actual = actual;
	  this.expected = expected;
	  this.relation = relation;

	  this.message = 'Dimension mismatch (' + (Array.isArray(actual) ? '[' + actual.join(', ') + ']' : actual) + ' ' + (this.relation || '!=') + ' ' + (Array.isArray(expected) ? '[' + expected.join(', ') + ']' : expected) + ')';

	  this.stack = new Error().stack;
	}

	DimensionError.prototype = new RangeError();
	DimensionError.prototype.constructor = RangeError;
	DimensionError.prototype.name = 'DimensionError';
	DimensionError.prototype.isDimensionError = true;

	module.exports = DimensionError;

/***/ }),
/* 34 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Create a range error with the message:
	 *     'Index out of range (index < min)'
	 *     'Index out of range (index < max)'
	 *
	 * @param {number} index     The actual index
	 * @param {number} [min=0]   Minimum index (included)
	 * @param {number} [max]     Maximum index (excluded)
	 * @extends RangeError
	 */

	function IndexError(index, min, max) {
	  if (!(this instanceof IndexError)) {
	    throw new SyntaxError('Constructor must be called with the new operator');
	  }

	  this.index = index;
	  if (arguments.length < 3) {
	    this.min = 0;
	    this.max = min;
	  } else {
	    this.min = min;
	    this.max = max;
	  }

	  if (this.min !== undefined && this.index < this.min) {
	    this.message = 'Index out of range (' + this.index + ' < ' + this.min + ')';
	  } else if (this.max !== undefined && this.index >= this.max) {
	    this.message = 'Index out of range (' + this.index + ' > ' + (this.max - 1) + ')';
	  } else {
	    this.message = 'Index out of range (' + this.index + ')';
	  }

	  this.stack = new Error().stack;
	}

	IndexError.prototype = new RangeError();
	IndexError.prototype.constructor = RangeError;
	IndexError.prototype.name = 'IndexError';
	IndexError.prototype.isIndexError = true;

	module.exports = IndexError;

/***/ }),
/* 35 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Test whether value is a boolean
	 * @param {*} value
	 * @return {boolean} isBoolean
	 */

	exports.isBoolean = function (value) {
	  return typeof value == 'boolean';
	};

/***/ }),
/* 36 */
/***/ (function(module, exports) {

	// function utils

	/**
	 * Memoize a given function by caching the computed result.
	 * The cache of a memoized function can be cleared by deleting the `cache`
	 * property of the function.
	 *
	 * @param {function} fn                     The function to be memoized.
	 *                                          Must be a pure function.
	 * @param {function(args: Array)} [hasher]  A custom hash builder.
	 *                                          Is JSON.stringify by default.
	 * @return {function}                       Returns the memoized function
	 */
	exports.memoize = function (fn, hasher) {
	  return function memoize() {
	    if (typeof memoize.cache !== 'object') {
	      memoize.cache = {};
	    }

	    var args = [];
	    for (var i = 0; i < arguments.length; i++) {
	      args[i] = arguments[i];
	    }

	    var hash = hasher ? hasher(args) : JSON.stringify(args);
	    if (!(hash in memoize.cache)) {
	      return memoize.cache[hash] = fn.apply(fn, args);
	    }
	    return memoize.cache[hash];
	  };
	};

	/**
	 * Find the maximum number of arguments expected by a typed function.
	 * @param {function} fn   A typed function
	 * @return {number} Returns the maximum number of expected arguments.
	 *                  Returns -1 when no signatures where found on the function.
	 */
	exports.maxArgumentCount = function (fn) {
	  return Object.keys(fn.signatures || {}).reduce(function (args, signature) {
	    var count = (signature.match(/,/g) || []).length + 1;
	    return Math.max(args, count);
	  }, -1);
	};

	/**
	 * Call a typed function with the
	 * @param {function} fn   A function or typed function
	 * @return {number} Returns the maximum number of expected arguments.
	 *                  Returns -1 when no signatures where found on the function.
	 */
	exports.callWithRightArgumentCount = function (fn, args, argCount) {
	  return Object.keys(fn.signatures || {}).reduce(function (args, signature) {
	    var count = (signature.match(/,/g) || []).length + 1;
	    return Math.max(args, count);
	  }, -1);
	};

/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(28);
	var DimensionError = __webpack_require__(33);
	var getSafeProperty = __webpack_require__(38).getSafeProperty;
	var setSafeProperty = __webpack_require__(38).setSafeProperty;

	var string = util.string;
	var array = util.array;
	var object = util.object;
	var number = util.number;

	var isArray = Array.isArray;
	var isNumber = number.isNumber;
	var isInteger = number.isInteger;
	var isString = string.isString;

	var validateIndex = array.validateIndex;

	function factory(type, config, load, typed) {
	  var Matrix = load(__webpack_require__(27)); // force loading Matrix (do not use via type.Matrix)

	  /**
	   * Dense Matrix implementation. A regular, dense matrix, supporting multi-dimensional matrices. This is the default matrix type.
	   * @class DenseMatrix
	   */
	  function DenseMatrix(data, datatype) {
	    if (!(this instanceof DenseMatrix)) throw new SyntaxError('Constructor must be called with the new operator');
	    if (datatype && !isString(datatype)) throw new Error('Invalid datatype: ' + datatype);

	    if (type.isMatrix(data)) {
	      // check data is a DenseMatrix
	      if (data.type === 'DenseMatrix') {
	        // clone data & size
	        this._data = object.clone(data._data);
	        this._size = object.clone(data._size);
	        this._datatype = datatype || data._datatype;
	      } else {
	        // build data from existing matrix
	        this._data = data.toArray();
	        this._size = data.size();
	        this._datatype = datatype || data._datatype;
	      }
	    } else if (data && isArray(data.data) && isArray(data.size)) {
	      // initialize fields from JSON representation
	      this._data = data.data;
	      this._size = data.size;
	      this._datatype = datatype || data.datatype;
	    } else if (isArray(data)) {
	      // replace nested Matrices with Arrays
	      this._data = preprocess(data);
	      // get the dimensions of the array
	      this._size = array.size(this._data);
	      // verify the dimensions of the array, TODO: compute size while processing array
	      array.validate(this._data, this._size);
	      // data type unknown
	      this._datatype = datatype;
	    } else if (data) {
	      // unsupported type
	      throw new TypeError('Unsupported type of data (' + util.types.type(data) + ')');
	    } else {
	      // nothing provided
	      this._data = [];
	      this._size = [0];
	      this._datatype = datatype;
	    }
	  }

	  DenseMatrix.prototype = new Matrix();

	  /**
	   * Attach type information
	   */
	  DenseMatrix.prototype.type = 'DenseMatrix';
	  DenseMatrix.prototype.isDenseMatrix = true;

	  /**
	   * Get the storage format used by the matrix.
	   *
	   * Usage:
	   *     var format = matrix.storage()                   // retrieve storage format
	   *
	   * @memberof DenseMatrix
	   * @return {string}           The storage format.
	   */
	  DenseMatrix.prototype.storage = function () {
	    return 'dense';
	  };

	  /**
	   * Get the datatype of the data stored in the matrix.
	   *
	   * Usage:
	   *     var format = matrix.datatype()                   // retrieve matrix datatype
	   *
	   * @memberof DenseMatrix
	   * @return {string}           The datatype.
	   */
	  DenseMatrix.prototype.datatype = function () {
	    return this._datatype;
	  };

	  /**
	   * Create a new DenseMatrix
	   * @memberof DenseMatrix
	   * @param {Array} data
	   * @param {string} [datatype]
	   */
	  DenseMatrix.prototype.create = function (data, datatype) {
	    return new DenseMatrix(data, datatype);
	  };

	  /**
	   * Get a subset of the matrix, or replace a subset of the matrix.
	   *
	   * Usage:
	   *     var subset = matrix.subset(index)               // retrieve subset
	   *     var value = matrix.subset(index, replacement)   // replace subset
	   *
	   * @memberof DenseMatrix
	   * @param {Index} index
	   * @param {Array | DenseMatrix | *} [replacement]
	   * @param {*} [defaultValue=0]      Default value, filled in on new entries when
	   *                                  the matrix is resized. If not provided,
	   *                                  new matrix elements will be filled with zeros.
	   */
	  DenseMatrix.prototype.subset = function (index, replacement, defaultValue) {
	    switch (arguments.length) {
	      case 1:
	        return _get(this, index);

	      // intentional fall through
	      case 2:
	      case 3:
	        return _set(this, index, replacement, defaultValue);

	      default:
	        throw new SyntaxError('Wrong number of arguments');
	    }
	  };

	  /**
	   * Get a single element from the matrix.
	   * @memberof DenseMatrix
	   * @param {number[]} index   Zero-based index
	   * @return {*} value
	   */
	  DenseMatrix.prototype.get = function (index) {
	    if (!isArray(index)) throw new TypeError('Array expected');
	    if (index.length != this._size.length) throw new DimensionError(index.length, this._size.length);

	    // check index
	    for (var x = 0; x < index.length; x++) validateIndex(index[x], this._size[x]);

	    var data = this._data;
	    for (var i = 0, ii = index.length; i < ii; i++) {
	      var index_i = index[i];
	      validateIndex(index_i, data.length);
	      data = data[index_i];
	    }

	    return data;
	  };

	  /**
	   * Replace a single element in the matrix.
	   * @memberof DenseMatrix
	   * @param {number[]} index   Zero-based index
	   * @param {*} value
	   * @param {*} [defaultValue]        Default value, filled in on new entries when
	   *                                  the matrix is resized. If not provided,
	   *                                  new matrix elements will be left undefined.
	   * @return {DenseMatrix} self
	   */
	  DenseMatrix.prototype.set = function (index, value, defaultValue) {
	    if (!isArray(index)) throw new TypeError('Array expected');
	    if (index.length < this._size.length) throw new DimensionError(index.length, this._size.length, '<');

	    var i, ii, index_i;

	    // enlarge matrix when needed
	    var size = index.map(function (i) {
	      return i + 1;
	    });
	    _fit(this, size, defaultValue);

	    // traverse over the dimensions
	    var data = this._data;
	    for (i = 0, ii = index.length - 1; i < ii; i++) {
	      index_i = index[i];
	      validateIndex(index_i, data.length);
	      data = data[index_i];
	    }

	    // set new value
	    index_i = index[index.length - 1];
	    validateIndex(index_i, data.length);
	    data[index_i] = value;

	    return this;
	  };

	  /**
	   * Get a submatrix of this matrix
	   * @memberof DenseMatrix
	   * @param {DenseMatrix} matrix
	   * @param {Index} index   Zero-based index
	   * @private
	   */
	  function _get(matrix, index) {
	    if (!type.isIndex(index)) {
	      throw new TypeError('Invalid index');
	    }

	    var isScalar = index.isScalar();
	    if (isScalar) {
	      // return a scalar
	      return matrix.get(index.min());
	    } else {
	      // validate dimensions
	      var size = index.size();
	      if (size.length != matrix._size.length) {
	        throw new DimensionError(size.length, matrix._size.length);
	      }

	      // validate if any of the ranges in the index is out of range
	      var min = index.min();
	      var max = index.max();
	      for (var i = 0, ii = matrix._size.length; i < ii; i++) {
	        validateIndex(min[i], matrix._size[i]);
	        validateIndex(max[i], matrix._size[i]);
	      }

	      // retrieve submatrix
	      // TODO: more efficient when creating an empty matrix and setting _data and _size manually
	      return new DenseMatrix(_getSubmatrix(matrix._data, index, size.length, 0), matrix._datatype);
	    }
	  }

	  /**
	   * Recursively get a submatrix of a multi dimensional matrix.
	   * Index is not checked for correct number or length of dimensions.
	   * @memberof DenseMatrix
	   * @param {Array} data
	   * @param {Index} index
	   * @param {number} dims   Total number of dimensions
	   * @param {number} dim    Current dimension
	   * @return {Array} submatrix
	   * @private
	   */
	  function _getSubmatrix(data, index, dims, dim) {
	    var last = dim === dims - 1;
	    var range = index.dimension(dim);

	    if (last) {
	      return range.map(function (i) {
	        validateIndex(i, data.length);
	        return data[i];
	      }).valueOf();
	    } else {
	      return range.map(function (i) {
	        validateIndex(i, data.length);
	        var child = data[i];
	        return _getSubmatrix(child, index, dims, dim + 1);
	      }).valueOf();
	    }
	  }

	  /**
	   * Replace a submatrix in this matrix
	   * Indexes are zero-based.
	   * @memberof DenseMatrix
	   * @param {DenseMatrix} matrix
	   * @param {Index} index
	   * @param {DenseMatrix | Array | *} submatrix
	   * @param {*} defaultValue          Default value, filled in on new entries when
	   *                                  the matrix is resized.
	   * @return {DenseMatrix} matrix
	   * @private
	   */
	  function _set(matrix, index, submatrix, defaultValue) {
	    if (!index || index.isIndex !== true) {
	      throw new TypeError('Invalid index');
	    }

	    // get index size and check whether the index contains a single value
	    var iSize = index.size(),
	        isScalar = index.isScalar();

	    // calculate the size of the submatrix, and convert it into an Array if needed
	    var sSize;
	    if (type.isMatrix(submatrix)) {
	      sSize = submatrix.size();
	      submatrix = submatrix.valueOf();
	    } else {
	      sSize = array.size(submatrix);
	    }

	    if (isScalar) {
	      // set a scalar

	      // check whether submatrix is a scalar
	      if (sSize.length !== 0) {
	        throw new TypeError('Scalar expected');
	      }

	      matrix.set(index.min(), submatrix, defaultValue);
	    } else {
	      // set a submatrix

	      // validate dimensions
	      if (iSize.length < matrix._size.length) {
	        throw new DimensionError(iSize.length, matrix._size.length, '<');
	      }

	      if (sSize.length < iSize.length) {
	        // calculate number of missing outer dimensions
	        var i = 0;
	        var outer = 0;
	        while (iSize[i] === 1 && sSize[i] === 1) {
	          i++;
	        }
	        while (iSize[i] === 1) {
	          outer++;
	          i++;
	        }

	        // unsqueeze both outer and inner dimensions
	        submatrix = array.unsqueeze(submatrix, iSize.length, outer, sSize);
	      }

	      // check whether the size of the submatrix matches the index size
	      if (!object.deepEqual(iSize, sSize)) {
	        throw new DimensionError(iSize, sSize, '>');
	      }

	      // enlarge matrix when needed
	      var size = index.max().map(function (i) {
	        return i + 1;
	      });
	      _fit(matrix, size, defaultValue);

	      // insert the sub matrix
	      var dims = iSize.length,
	          dim = 0;
	      _setSubmatrix(matrix._data, index, submatrix, dims, dim);
	    }

	    return matrix;
	  }

	  /**
	   * Replace a submatrix of a multi dimensional matrix.
	   * @memberof DenseMatrix
	   * @param {Array} data
	   * @param {Index} index
	   * @param {Array} submatrix
	   * @param {number} dims   Total number of dimensions
	   * @param {number} dim
	   * @private
	   */
	  function _setSubmatrix(data, index, submatrix, dims, dim) {
	    var last = dim === dims - 1,
	        range = index.dimension(dim);

	    if (last) {
	      range.forEach(function (dataIndex, subIndex) {
	        validateIndex(dataIndex);
	        data[dataIndex] = submatrix[subIndex[0]];
	      });
	    } else {
	      range.forEach(function (dataIndex, subIndex) {
	        validateIndex(dataIndex);
	        _setSubmatrix(data[dataIndex], index, submatrix[subIndex[0]], dims, dim + 1);
	      });
	    }
	  }

	  /**
	   * Resize the matrix to the given size. Returns a copy of the matrix when
	   * `copy=true`, otherwise return the matrix itself (resize in place).
	   *
	   * @memberof DenseMatrix
	   * @param {number[]} size           The new size the matrix should have.
	   * @param {*} [defaultValue=0]      Default value, filled in on new entries.
	   *                                  If not provided, the matrix elements will
	   *                                  be filled with zeros.
	   * @param {boolean} [copy]          Return a resized copy of the matrix
	   *
	   * @return {Matrix}                 The resized matrix
	   */
	  DenseMatrix.prototype.resize = function (size, defaultValue, copy) {
	    // validate arguments
	    if (!isArray(size)) throw new TypeError('Array expected');

	    // matrix to resize
	    var m = copy ? this.clone() : this;
	    // resize matrix
	    return _resize(m, size, defaultValue);
	  };

	  var _resize = function (matrix, size, defaultValue) {
	    // check size
	    if (size.length === 0) {
	      // first value in matrix
	      var v = matrix._data;
	      // go deep
	      while (isArray(v)) {
	        v = v[0];
	      }
	      return v;
	    }
	    // resize matrix
	    matrix._size = size.slice(0); // copy the array
	    matrix._data = array.resize(matrix._data, matrix._size, defaultValue);
	    // return matrix
	    return matrix;
	  };

	  /**
	   * Reshape the matrix to the given size. Returns a copy of the matrix when
	   * `copy=true`, otherwise return the matrix itself (reshape in place).
	   *
	   * NOTE: This might be better suited to copy by default, instead of modifying
	   *       in place. For now, it operates in place to remain consistent with
	   *       resize().
	   *
	   * @memberof DenseMatrix
	   * @param {number[]} size           The new size the matrix should have.
	   * @param {boolean} [copy]          Return a reshaped copy of the matrix
	   *
	   * @return {Matrix}                 The reshaped matrix
	   */
	  DenseMatrix.prototype.reshape = function (size, copy) {
	    var m = copy ? this.clone() : this;

	    m._data = array.reshape(m._data, size);
	    m._size = size.slice(0);
	    return m;
	  };

	  /**
	   * Enlarge the matrix when it is smaller than given size.
	   * If the matrix is larger or equal sized, nothing is done.
	   * @memberof DenseMatrix
	   * @param {DenseMatrix} matrix           The matrix to be resized
	   * @param {number[]} size
	   * @param {*} defaultValue          Default value, filled in on new entries.
	   * @private
	   */
	  function _fit(matrix, size, defaultValue) {
	    var newSize = matrix._size.slice(0),
	        // copy the array
	    changed = false;

	    // add dimensions when needed
	    while (newSize.length < size.length) {
	      newSize.push(0);
	      changed = true;
	    }

	    // enlarge size when needed
	    for (var i = 0, ii = size.length; i < ii; i++) {
	      if (size[i] > newSize[i]) {
	        newSize[i] = size[i];
	        changed = true;
	      }
	    }

	    if (changed) {
	      // resize only when size is changed
	      _resize(matrix, newSize, defaultValue);
	    }
	  }

	  /**
	   * Create a clone of the matrix
	   * @memberof DenseMatrix
	   * @return {DenseMatrix} clone
	   */
	  DenseMatrix.prototype.clone = function () {
	    var m = new DenseMatrix({
	      data: object.clone(this._data),
	      size: object.clone(this._size),
	      datatype: this._datatype
	    });
	    return m;
	  };

	  /**
	   * Retrieve the size of the matrix.
	   * @memberof DenseMatrix
	   * @returns {number[]} size
	   */
	  DenseMatrix.prototype.size = function () {
	    return this._size.slice(0); // return a clone of _size
	  };

	  /**
	   * Create a new matrix with the results of the callback function executed on
	   * each entry of the matrix.
	   * @memberof DenseMatrix
	   * @param {Function} callback   The callback function is invoked with three
	   *                              parameters: the value of the element, the index
	   *                              of the element, and the Matrix being traversed.
	   *
	   * @return {DenseMatrix} matrix
	   */
	  DenseMatrix.prototype.map = function (callback) {
	    // matrix instance
	    var me = this;
	    var recurse = function (value, index) {
	      if (isArray(value)) {
	        return value.map(function (child, i) {
	          return recurse(child, index.concat(i));
	        });
	      } else {
	        return callback(value, index, me);
	      }
	    };
	    // return dense format
	    return new DenseMatrix({
	      data: recurse(this._data, []),
	      size: object.clone(this._size),
	      datatype: this._datatype
	    });
	  };

	  /**
	   * Execute a callback function on each entry of the matrix.
	   * @memberof DenseMatrix
	   * @param {Function} callback   The callback function is invoked with three
	   *                              parameters: the value of the element, the index
	   *                              of the element, and the Matrix being traversed.
	   */
	  DenseMatrix.prototype.forEach = function (callback) {
	    // matrix instance
	    var me = this;
	    var recurse = function (value, index) {
	      if (isArray(value)) {
	        value.forEach(function (child, i) {
	          recurse(child, index.concat(i));
	        });
	      } else {
	        callback(value, index, me);
	      }
	    };
	    recurse(this._data, []);
	  };

	  /**
	   * Create an Array with a copy of the data of the DenseMatrix
	   * @memberof DenseMatrix
	   * @returns {Array} array
	   */
	  DenseMatrix.prototype.toArray = function () {
	    return object.clone(this._data);
	  };

	  /**
	   * Get the primitive value of the DenseMatrix: a multidimensional array
	   * @memberof DenseMatrix
	   * @returns {Array} array
	   */
	  DenseMatrix.prototype.valueOf = function () {
	    return this._data;
	  };

	  /**
	   * Get a string representation of the matrix, with optional formatting options.
	   * @memberof DenseMatrix
	   * @param {Object | number | Function} [options]  Formatting options. See
	   *                                                lib/utils/number:format for a
	   *                                                description of the available
	   *                                                options.
	   * @returns {string} str
	   */
	  DenseMatrix.prototype.format = function (options) {
	    return string.format(this._data, options);
	  };

	  /**
	   * Get a string representation of the matrix
	   * @memberof DenseMatrix
	   * @returns {string} str
	   */
	  DenseMatrix.prototype.toString = function () {
	    return string.format(this._data);
	  };

	  /**
	   * Get a JSON representation of the matrix
	   * @memberof DenseMatrix
	   * @returns {Object}
	   */
	  DenseMatrix.prototype.toJSON = function () {
	    return {
	      mathjs: 'DenseMatrix',
	      data: this._data,
	      size: this._size,
	      datatype: this._datatype
	    };
	  };

	  /**
	   * Get the kth Matrix diagonal.
	   *
	   * @memberof DenseMatrix
	   * @param {number | BigNumber} [k=0]     The kth diagonal where the vector will retrieved.
	   *
	   * @returns {Array}                      The array vector with the diagonal values.
	   */
	  DenseMatrix.prototype.diagonal = function (k) {
	    // validate k if any
	    if (k) {
	      // convert BigNumber to a number
	      if (type.isBigNumber(k)) k = k.toNumber();
	      // is must be an integer
	      if (!isNumber(k) || !isInteger(k)) {
	        throw new TypeError('The parameter k must be an integer number');
	      }
	    } else {
	      // default value
	      k = 0;
	    }

	    var kSuper = k > 0 ? k : 0;
	    var kSub = k < 0 ? -k : 0;

	    // rows & columns
	    var rows = this._size[0];
	    var columns = this._size[1];

	    // number diagonal values
	    var n = Math.min(rows - kSub, columns - kSuper);

	    // x is a matrix get diagonal from matrix
	    var data = [];

	    // loop rows
	    for (var i = 0; i < n; i++) {
	      data[i] = this._data[i + kSub][i + kSuper];
	    }

	    // create DenseMatrix
	    return new DenseMatrix({
	      data: data,
	      size: [n],
	      datatype: this._datatype
	    });
	  };

	  /**
	   * Create a diagonal matrix.
	   *
	   * @memberof DenseMatrix
	   * @param {Array} size                   The matrix size.
	   * @param {number | Array} value          The values for the diagonal.
	   * @param {number | BigNumber} [k=0]     The kth diagonal where the vector will be filled in.
	   * @param {number} [defaultValue]        The default value for non-diagonal
	   *
	   * @returns {DenseMatrix}
	   */
	  DenseMatrix.diagonal = function (size, value, k, defaultValue, datatype) {
	    if (!isArray(size)) throw new TypeError('Array expected, size parameter');
	    if (size.length !== 2) throw new Error('Only two dimensions matrix are supported');

	    // map size & validate
	    size = size.map(function (s) {
	      // check it is a big number
	      if (type.isBigNumber(s)) {
	        // convert it
	        s = s.toNumber();
	      }
	      // validate arguments
	      if (!isNumber(s) || !isInteger(s) || s < 1) {
	        throw new Error('Size values must be positive integers');
	      }
	      return s;
	    });

	    // validate k if any
	    if (k) {
	      // convert BigNumber to a number
	      if (type.isBigNumber(k)) k = k.toNumber();
	      // is must be an integer
	      if (!isNumber(k) || !isInteger(k)) {
	        throw new TypeError('The parameter k must be an integer number');
	      }
	    } else {
	      // default value
	      k = 0;
	    }

	    if (defaultValue && isString(datatype)) {
	      // convert defaultValue to the same datatype
	      defaultValue = typed.convert(defaultValue, datatype);
	    }

	    var kSuper = k > 0 ? k : 0;
	    var kSub = k < 0 ? -k : 0;

	    // rows and columns
	    var rows = size[0];
	    var columns = size[1];

	    // number of non-zero items
	    var n = Math.min(rows - kSub, columns - kSuper);

	    // value extraction function
	    var _value;

	    // check value
	    if (isArray(value)) {
	      // validate array
	      if (value.length !== n) {
	        // number of values in array must be n
	        throw new Error('Invalid value array length');
	      }
	      // define function
	      _value = function (i) {
	        // return value @ i
	        return value[i];
	      };
	    } else if (type.isMatrix(value)) {
	      // matrix size
	      var ms = value.size();
	      // validate matrix
	      if (ms.length !== 1 || ms[0] !== n) {
	        // number of values in array must be n
	        throw new Error('Invalid matrix length');
	      }
	      // define function
	      _value = function (i) {
	        // return value @ i
	        return value.get([i]);
	      };
	    } else {
	      // define function
	      _value = function () {
	        // return value
	        return value;
	      };
	    }

	    // discover default value if needed
	    if (!defaultValue) {
	      // check first value in array
	      defaultValue = type.isBigNumber(_value(0)) ? new type.BigNumber(0) : 0;
	    }

	    // empty array
	    var data = [];

	    // check we need to resize array
	    if (size.length > 0) {
	      // resize array
	      data = array.resize(data, size, defaultValue);
	      // fill diagonal
	      for (var d = 0; d < n; d++) {
	        data[d + kSub][d + kSuper] = _value(d);
	      }
	    }

	    // create DenseMatrix
	    return new DenseMatrix({
	      data: data,
	      size: [rows, columns]
	    });
	  };

	  /**
	   * Generate a matrix from a JSON object
	   * @memberof DenseMatrix
	   * @param {Object} json  An object structured like
	   *                       `{"mathjs": "DenseMatrix", data: [], size: []}`,
	   *                       where mathjs is optional
	   * @returns {DenseMatrix}
	   */
	  DenseMatrix.fromJSON = function (json) {
	    return new DenseMatrix(json);
	  };

	  /**
	   * Swap rows i and j in Matrix.
	   *
	   * @memberof DenseMatrix
	   * @param {number} i       Matrix row index 1
	   * @param {number} j       Matrix row index 2
	   *
	   * @return {Matrix}        The matrix reference
	   */
	  DenseMatrix.prototype.swapRows = function (i, j) {
	    // check index
	    if (!isNumber(i) || !isInteger(i) || !isNumber(j) || !isInteger(j)) {
	      throw new Error('Row index must be positive integers');
	    }
	    // check dimensions
	    if (this._size.length !== 2) {
	      throw new Error('Only two dimensional matrix is supported');
	    }
	    // validate index
	    validateIndex(i, this._size[0]);
	    validateIndex(j, this._size[0]);

	    // swap rows
	    DenseMatrix._swapRows(i, j, this._data);
	    // return current instance
	    return this;
	  };

	  /**
	   * Swap rows i and j in Dense Matrix data structure.
	   *
	   * @param {number} i       Matrix row index 1
	   * @param {number} j       Matrix row index 2
	   */
	  DenseMatrix._swapRows = function (i, j, data) {
	    // swap values i <-> j
	    var vi = data[i];
	    data[i] = data[j];
	    data[j] = vi;
	  };

	  /**
	   * Preprocess data, which can be an Array or DenseMatrix with nested Arrays and
	   * Matrices. Replaces all nested Matrices with Arrays
	   * @memberof DenseMatrix
	   * @param {Array} data
	   * @return {Array} data
	   */
	  function preprocess(data) {
	    for (var i = 0, ii = data.length; i < ii; i++) {
	      var elem = data[i];
	      if (isArray(elem)) {
	        data[i] = preprocess(elem);
	      } else if (elem && elem.isMatrix === true) {
	        data[i] = preprocess(elem.valueOf());
	      }
	    }

	    return data;
	  }

	  // register this type in the base class Matrix
	  type.Matrix._storage.dense = DenseMatrix;
	  type.Matrix._storage['default'] = DenseMatrix;

	  // exports
	  return DenseMatrix;
	}

	exports.name = 'DenseMatrix';
	exports.path = 'type';
	exports.factory = factory;
	exports.lazy = false; // no lazy loading, as we alter type.Matrix._storage

/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var hasOwnProperty = __webpack_require__(15).hasOwnProperty;

	/**
	 * Get a property of a plain object
	 * Throws an error in case the object is not a plain object or the
	 * property is not defined on the object itself
	 * @param {Object} object
	 * @param {string} prop
	 * @return {*} Returns the property value when safe
	 */
	function getSafeProperty(object, prop) {
	  // only allow getting safe properties of a plain object
	  if (isPlainObject(object) && isSafeProperty(object, prop)) {
	    return object[prop];
	  }

	  if (typeof object[prop] === 'function' && isSafeMethod(object, prop)) {
	    throw new Error('Cannot access method "' + prop + '" as a property');
	  }

	  throw new Error('No access to property "' + prop + '"');
	}

	/**
	 * Set a property on a plain object.
	 * Throws an error in case the object is not a plain object or the
	 * property would override an inherited property like .constructor or .toString
	 * @param {Object} object
	 * @param {string} prop
	 * @param {*} value
	 * @return {*} Returns the value
	 */
	// TODO: merge this function into access.js?
	function setSafeProperty(object, prop, value) {
	  // only allow setting safe properties of a plain object
	  if (isPlainObject(object) && isSafeProperty(object, prop)) {
	    return object[prop] = value;
	  }

	  throw new Error('No access to property "' + prop + '"');
	}

	/**
	 * Test whether a property is safe to use for an object.
	 * For example .toString and .constructor are not safe
	 * @param {string} prop
	 * @return {boolean} Returns true when safe
	 */
	function isSafeProperty(object, prop) {
	  if (!object || typeof object !== 'object') {
	    return false;
	  }
	  // SAFE: whitelisted
	  // e.g length
	  if (hasOwnProperty(safeNativeProperties, prop)) {
	    return true;
	  }
	  // UNSAFE: inherited from Object prototype
	  // e.g constructor
	  if (prop in Object.prototype) {
	    // 'in' is used instead of hasOwnProperty for nodejs v0.10
	    // which is inconsistent on root prototypes. It is safe
	    // here because Object.prototype is a root object
	    return false;
	  }
	  // UNSAFE: inherited from Function prototype
	  // e.g call, apply
	  if (prop in Function.prototype) {
	    // 'in' is used instead of hasOwnProperty for nodejs v0.10
	    // which is inconsistent on root prototypes. It is safe
	    // here because Function.prototype is a root object
	    return false;
	  }
	  return true;
	}

	/**
	 * Validate whether a method is safe.
	 * Throws an error when that's not the case.
	 * @param {Object} object
	 * @param {string} method
	 */
	// TODO: merge this function into assign.js?
	function validateSafeMethod(object, method) {
	  if (!isSafeMethod(object, method)) {
	    throw new Error('No access to method "' + method + '"');
	  }
	}

	/**
	 * Check whether a method is safe.
	 * Throws an error when that's not the case (for example for `constructor`).
	 * @param {Object} object
	 * @param {string} method
	 * @return {boolean} Returns true when safe, false otherwise
	 */
	function isSafeMethod(object, method) {
	  if (!object || typeof object[method] !== 'function') {
	    return false;
	  }
	  // UNSAFE: ghosted
	  // e.g overridden toString
	  // Note that IE10 doesn't support __proto__ and we can't do this check there.
	  if (hasOwnProperty(object, method) && object.__proto__ && method in object.__proto__) {
	    return false;
	  }
	  // SAFE: whitelisted
	  // e.g toString
	  if (hasOwnProperty(safeNativeMethods, method)) {
	    return true;
	  }
	  // UNSAFE: inherited from Object prototype
	  // e.g constructor
	  if (method in Object.prototype) {
	    // 'in' is used instead of hasOwnProperty for nodejs v0.10
	    // which is inconsistent on root prototypes. It is safe
	    // here because Object.prototype is a root object
	    return false;
	  }
	  // UNSAFE: inherited from Function prototype
	  // e.g call, apply
	  if (method in Function.prototype) {
	    // 'in' is used instead of hasOwnProperty for nodejs v0.10
	    // which is inconsistent on root prototypes. It is safe
	    // here because Function.prototype is a root object
	    return false;
	  }
	  return true;
	}

	function isPlainObject(object) {
	  return typeof object === 'object' && object && object.constructor === Object;
	}

	var safeNativeProperties = {
	  length: true,
	  name: true
	};

	var safeNativeMethods = {
	  toString: true,
	  valueOf: true,
	  toLocaleString: true
	};

	exports.getSafeProperty = getSafeProperty;
	exports.setSafeProperty = setSafeProperty;
	exports.isSafeProperty = isSafeProperty;
	exports.validateSafeMethod = validateSafeMethod;
	exports.isSafeMethod = isSafeMethod;
	exports.isPlainObject = isPlainObject;

/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(28);
	var DimensionError = __webpack_require__(33);

	var array = util.array;
	var object = util.object;
	var string = util.string;
	var number = util.number;

	var isArray = Array.isArray;
	var isNumber = number.isNumber;
	var isInteger = number.isInteger;
	var isString = string.isString;

	var validateIndex = array.validateIndex;

	function factory(type, config, load, typed) {
	  var Matrix = load(__webpack_require__(27)); // force loading Matrix (do not use via type.Matrix)
	  var equalScalar = load(__webpack_require__(40));

	  /**
	   * Sparse Matrix implementation. This type implements a Compressed Column Storage format
	   * for sparse matrices.
	   * @class SparseMatrix
	   */
	  function SparseMatrix(data, datatype) {
	    if (!(this instanceof SparseMatrix)) throw new SyntaxError('Constructor must be called with the new operator');
	    if (datatype && !isString(datatype)) throw new Error('Invalid datatype: ' + datatype);

	    if (type.isMatrix(data)) {
	      // create from matrix
	      _createFromMatrix(this, data, datatype);
	    } else if (data && isArray(data.index) && isArray(data.ptr) && isArray(data.size)) {
	      // initialize fields
	      this._values = data.values;
	      this._index = data.index;
	      this._ptr = data.ptr;
	      this._size = data.size;
	      this._datatype = datatype || data.datatype;
	    } else if (isArray(data)) {
	      // create from array
	      _createFromArray(this, data, datatype);
	    } else if (data) {
	      // unsupported type
	      throw new TypeError('Unsupported type of data (' + util.types.type(data) + ')');
	    } else {
	      // nothing provided
	      this._values = [];
	      this._index = [];
	      this._ptr = [0];
	      this._size = [0, 0];
	      this._datatype = datatype;
	    }
	  }

	  var _createFromMatrix = function (matrix, source, datatype) {
	    // check matrix type
	    if (source.type === 'SparseMatrix') {
	      // clone arrays
	      matrix._values = source._values ? object.clone(source._values) : undefined;
	      matrix._index = object.clone(source._index);
	      matrix._ptr = object.clone(source._ptr);
	      matrix._size = object.clone(source._size);
	      matrix._datatype = datatype || source._datatype;
	    } else {
	      // build from matrix data
	      _createFromArray(matrix, source.valueOf(), datatype || source._datatype);
	    }
	  };

	  var _createFromArray = function (matrix, data, datatype) {
	    // initialize fields
	    matrix._values = [];
	    matrix._index = [];
	    matrix._ptr = [];
	    matrix._datatype = datatype;
	    // discover rows & columns, do not use math.size() to avoid looping array twice
	    var rows = data.length;
	    var columns = 0;

	    // equal signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;

	    if (isString(datatype)) {
	      // find signature that matches (datatype, datatype)
	      eq = typed.find(equalScalar, [datatype, datatype]) || equalScalar;
	      // convert 0 to the same datatype
	      zero = typed.convert(0, datatype);
	    }

	    // check we have rows (empty array)
	    if (rows > 0) {
	      // column index
	      var j = 0;
	      do {
	        // store pointer to values index
	        matrix._ptr.push(matrix._index.length);
	        // loop rows
	        for (var i = 0; i < rows; i++) {
	          // current row
	          var row = data[i];
	          // check row is an array
	          if (isArray(row)) {
	            // update columns if needed (only on first column)
	            if (j === 0 && columns < row.length) columns = row.length;
	            // check row has column
	            if (j < row.length) {
	              // value
	              var v = row[j];
	              // check value != 0
	              if (!eq(v, zero)) {
	                // store value
	                matrix._values.push(v);
	                // index
	                matrix._index.push(i);
	              }
	            }
	          } else {
	            // update columns if needed (only on first column)
	            if (j === 0 && columns < 1) columns = 1;
	            // check value != 0 (row is a scalar)
	            if (!eq(row, zero)) {
	              // store value
	              matrix._values.push(row);
	              // index
	              matrix._index.push(i);
	            }
	          }
	        }
	        // increment index
	        j++;
	      } while (j < columns);
	    }
	    // store number of values in ptr
	    matrix._ptr.push(matrix._index.length);
	    // size
	    matrix._size = [rows, columns];
	  };

	  SparseMatrix.prototype = new Matrix();

	  /**
	   * Attach type information
	   */
	  SparseMatrix.prototype.type = 'SparseMatrix';
	  SparseMatrix.prototype.isSparseMatrix = true;

	  /**
	   * Get the storage format used by the matrix.
	   *
	   * Usage:
	   *     var format = matrix.storage()                   // retrieve storage format
	   *
	   * @memberof SparseMatrix
	   * @return {string}           The storage format.
	   */
	  SparseMatrix.prototype.storage = function () {
	    return 'sparse';
	  };

	  /**
	   * Get the datatype of the data stored in the matrix.
	   *
	   * Usage:
	   *     var format = matrix.datatype()                   // retrieve matrix datatype
	   *
	   * @memberof SparseMatrix
	   * @return {string}           The datatype.
	   */
	  SparseMatrix.prototype.datatype = function () {
	    return this._datatype;
	  };

	  /**
	   * Create a new SparseMatrix
	   * @memberof SparseMatrix
	   * @param {Array} data
	   * @param {string} [datatype]
	   */
	  SparseMatrix.prototype.create = function (data, datatype) {
	    return new SparseMatrix(data, datatype);
	  };

	  /**
	   * Get the matrix density.
	   *
	   * Usage:
	   *     var density = matrix.density()                   // retrieve matrix density
	   *
	   * @memberof SparseMatrix
	   * @return {number}           The matrix density.
	   */
	  SparseMatrix.prototype.density = function () {
	    // rows & columns
	    var rows = this._size[0];
	    var columns = this._size[1];
	    // calculate density
	    return rows !== 0 && columns !== 0 ? this._index.length / (rows * columns) : 0;
	  };

	  /**
	   * Get a subset of the matrix, or replace a subset of the matrix.
	   *
	   * Usage:
	   *     var subset = matrix.subset(index)               // retrieve subset
	   *     var value = matrix.subset(index, replacement)   // replace subset
	   *
	   * @memberof SparseMatrix
	   * @param {Index} index
	   * @param {Array | Maytrix | *} [replacement]
	   * @param {*} [defaultValue=0]      Default value, filled in on new entries when
	   *                                  the matrix is resized. If not provided,
	   *                                  new matrix elements will be filled with zeros.
	   */
	  SparseMatrix.prototype.subset = function (index, replacement, defaultValue) {
	    // check it is a pattern matrix
	    if (!this._values) throw new Error('Cannot invoke subset on a Pattern only matrix');

	    // check arguments
	    switch (arguments.length) {
	      case 1:
	        return _getsubset(this, index);

	      // intentional fall through
	      case 2:
	      case 3:
	        return _setsubset(this, index, replacement, defaultValue);

	      default:
	        throw new SyntaxError('Wrong number of arguments');
	    }
	  };

	  var _getsubset = function (matrix, idx) {
	    // check idx
	    if (!type.isIndex(idx)) {
	      throw new TypeError('Invalid index');
	    }

	    var isScalar = idx.isScalar();
	    if (isScalar) {
	      // return a scalar
	      return matrix.get(idx.min());
	    }
	    // validate dimensions
	    var size = idx.size();
	    if (size.length != matrix._size.length) {
	      throw new DimensionError(size.length, matrix._size.length);
	    }

	    // vars
	    var i, ii, k, kk;

	    // validate if any of the ranges in the index is out of range
	    var min = idx.min();
	    var max = idx.max();
	    for (i = 0, ii = matrix._size.length; i < ii; i++) {
	      validateIndex(min[i], matrix._size[i]);
	      validateIndex(max[i], matrix._size[i]);
	    }

	    // matrix arrays
	    var mvalues = matrix._values;
	    var mindex = matrix._index;
	    var mptr = matrix._ptr;

	    // rows & columns dimensions for result matrix
	    var rows = idx.dimension(0);
	    var columns = idx.dimension(1);

	    // workspace & permutation vector
	    var w = [];
	    var pv = [];

	    // loop rows in resulting matrix
	    rows.forEach(function (i, r) {
	      // update permutation vector
	      pv[i] = r[0];
	      // mark i in workspace
	      w[i] = true;
	    });

	    // result matrix arrays
	    var values = mvalues ? [] : undefined;
	    var index = [];
	    var ptr = [];

	    // loop columns in result matrix
	    columns.forEach(function (j) {
	      // update ptr
	      ptr.push(index.length);
	      // loop values in column j
	      for (k = mptr[j], kk = mptr[j + 1]; k < kk; k++) {
	        // row
	        i = mindex[k];
	        // check row is in result matrix
	        if (w[i] === true) {
	          // push index
	          index.push(pv[i]);
	          // check we need to process values
	          if (values) values.push(mvalues[k]);
	        }
	      }
	    });
	    // update ptr
	    ptr.push(index.length);

	    // return matrix
	    return new SparseMatrix({
	      values: values,
	      index: index,
	      ptr: ptr,
	      size: size,
	      datatype: matrix._datatype
	    });
	  };

	  var _setsubset = function (matrix, index, submatrix, defaultValue) {
	    // check index
	    if (!index || index.isIndex !== true) {
	      throw new TypeError('Invalid index');
	    }

	    // get index size and check whether the index contains a single value
	    var iSize = index.size(),
	        isScalar = index.isScalar();

	    // calculate the size of the submatrix, and convert it into an Array if needed
	    var sSize;
	    if (type.isMatrix(submatrix)) {
	      // submatrix size
	      sSize = submatrix.size();
	      // use array representation
	      submatrix = submatrix.toArray();
	    } else {
	      // get submatrix size (array, scalar)
	      sSize = array.size(submatrix);
	    }

	    // check index is a scalar
	    if (isScalar) {
	      // verify submatrix is a scalar
	      if (sSize.length !== 0) {
	        throw new TypeError('Scalar expected');
	      }
	      // set value
	      matrix.set(index.min(), submatrix, defaultValue);
	    } else {
	      // validate dimensions, index size must be one or two dimensions
	      if (iSize.length !== 1 && iSize.length !== 2) {
	        throw new DimensionError(iSize.length, matrix._size.length, '<');
	      }

	      // check submatrix and index have the same dimensions
	      if (sSize.length < iSize.length) {
	        // calculate number of missing outer dimensions
	        var i = 0;
	        var outer = 0;
	        while (iSize[i] === 1 && sSize[i] === 1) {
	          i++;
	        }
	        while (iSize[i] === 1) {
	          outer++;
	          i++;
	        }
	        // unsqueeze both outer and inner dimensions
	        submatrix = array.unsqueeze(submatrix, iSize.length, outer, sSize);
	      }

	      // check whether the size of the submatrix matches the index size
	      if (!object.deepEqual(iSize, sSize)) {
	        throw new DimensionError(iSize, sSize, '>');
	      }

	      // offsets
	      var x0 = index.min()[0];
	      var y0 = index.min()[1];

	      // submatrix rows and columns
	      var m = sSize[0];
	      var n = sSize[1];

	      // loop submatrix
	      for (var x = 0; x < m; x++) {
	        // loop columns
	        for (var y = 0; y < n; y++) {
	          // value at i, j
	          var v = submatrix[x][y];
	          // invoke set (zero value will remove entry from matrix)
	          matrix.set([x + x0, y + y0], v, defaultValue);
	        }
	      }
	    }
	    return matrix;
	  };

	  /**
	   * Get a single element from the matrix.
	   * @memberof SparseMatrix
	   * @param {number[]} index   Zero-based index
	   * @return {*} value
	   */
	  SparseMatrix.prototype.get = function (index) {
	    if (!isArray(index)) throw new TypeError('Array expected');
	    if (index.length != this._size.length) throw new DimensionError(index.length, this._size.length);

	    // check it is a pattern matrix
	    if (!this._values) throw new Error('Cannot invoke get on a Pattern only matrix');

	    // row and column
	    var i = index[0];
	    var j = index[1];

	    // check i, j are valid
	    validateIndex(i, this._size[0]);
	    validateIndex(j, this._size[1]);

	    // find value index
	    var k = _getValueIndex(i, this._ptr[j], this._ptr[j + 1], this._index);
	    // check k is prior to next column k and it is in the correct row
	    if (k < this._ptr[j + 1] && this._index[k] === i) return this._values[k];

	    return 0;
	  };

	  /**
	   * Replace a single element in the matrix.
	   * @memberof SparseMatrix
	   * @param {number[]} index   Zero-based index
	   * @param {*} value
	   * @param {*} [defaultValue]        Default value, filled in on new entries when
	   *                                  the matrix is resized. If not provided,
	   *                                  new matrix elements will be set to zero.
	   * @return {SparseMatrix} self
	   */
	  SparseMatrix.prototype.set = function (index, v, defaultValue) {
	    if (!isArray(index)) throw new TypeError('Array expected');
	    if (index.length != this._size.length) throw new DimensionError(index.length, this._size.length);

	    // check it is a pattern matrix
	    if (!this._values) throw new Error('Cannot invoke set on a Pattern only matrix');

	    // row and column
	    var i = index[0];
	    var j = index[1];

	    // rows & columns
	    var rows = this._size[0];
	    var columns = this._size[1];

	    // equal signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;

	    if (isString(this._datatype)) {
	      // find signature that matches (datatype, datatype)
	      eq = typed.find(equalScalar, [this._datatype, this._datatype]) || equalScalar;
	      // convert 0 to the same datatype
	      zero = typed.convert(0, this._datatype);
	    }

	    // check we need to resize matrix
	    if (i > rows - 1 || j > columns - 1) {
	      // resize matrix
	      _resize(this, Math.max(i + 1, rows), Math.max(j + 1, columns), defaultValue);
	      // update rows & columns
	      rows = this._size[0];
	      columns = this._size[1];
	    }

	    // check i, j are valid
	    validateIndex(i, rows);
	    validateIndex(j, columns);

	    // find value index
	    var k = _getValueIndex(i, this._ptr[j], this._ptr[j + 1], this._index);
	    // check k is prior to next column k and it is in the correct row
	    if (k < this._ptr[j + 1] && this._index[k] === i) {
	      // check value != 0
	      if (!eq(v, zero)) {
	        // update value
	        this._values[k] = v;
	      } else {
	        // remove value from matrix
	        _remove(k, j, this._values, this._index, this._ptr);
	      }
	    } else {
	      // insert value @ (i, j)
	      _insert(k, i, j, v, this._values, this._index, this._ptr);
	    }

	    return this;
	  };

	  var _getValueIndex = function (i, top, bottom, index) {
	    // check row is on the bottom side
	    if (bottom - top === 0) return bottom;
	    // loop rows [top, bottom[
	    for (var r = top; r < bottom; r++) {
	      // check we found value index
	      if (index[r] === i) return r;
	    }
	    // we did not find row
	    return top;
	  };

	  var _remove = function (k, j, values, index, ptr) {
	    // remove value @ k
	    values.splice(k, 1);
	    index.splice(k, 1);
	    // update pointers
	    for (var x = j + 1; x < ptr.length; x++) ptr[x]--;
	  };

	  var _insert = function (k, i, j, v, values, index, ptr) {
	    // insert value
	    values.splice(k, 0, v);
	    // update row for k
	    index.splice(k, 0, i);
	    // update column pointers
	    for (var x = j + 1; x < ptr.length; x++) ptr[x]++;
	  };

	  /**
	   * Resize the matrix to the given size. Returns a copy of the matrix when 
	   * `copy=true`, otherwise return the matrix itself (resize in place).
	   *
	   * @memberof SparseMatrix
	   * @param {number[]} size           The new size the matrix should have.
	   * @param {*} [defaultValue=0]      Default value, filled in on new entries.
	   *                                  If not provided, the matrix elements will
	   *                                  be filled with zeros.
	   * @param {boolean} [copy]          Return a resized copy of the matrix
	   *
	   * @return {Matrix}                 The resized matrix
	   */
	  SparseMatrix.prototype.resize = function (size, defaultValue, copy) {
	    // validate arguments
	    if (!isArray(size)) throw new TypeError('Array expected');
	    if (size.length !== 2) throw new Error('Only two dimensions matrix are supported');

	    // check sizes
	    size.forEach(function (value) {
	      if (!number.isNumber(value) || !number.isInteger(value) || value < 0) {
	        throw new TypeError('Invalid size, must contain positive integers ' + '(size: ' + string.format(size) + ')');
	      }
	    });

	    // matrix to resize
	    var m = copy ? this.clone() : this;
	    // resize matrix
	    return _resize(m, size[0], size[1], defaultValue);
	  };

	  var _resize = function (matrix, rows, columns, defaultValue) {
	    // value to insert at the time of growing matrix
	    var value = defaultValue || 0;

	    // equal signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;

	    if (isString(matrix._datatype)) {
	      // find signature that matches (datatype, datatype)
	      eq = typed.find(equalScalar, [matrix._datatype, matrix._datatype]) || equalScalar;
	      // convert 0 to the same datatype
	      zero = typed.convert(0, matrix._datatype);
	      // convert value to the same datatype
	      value = typed.convert(value, matrix._datatype);
	    }

	    // should we insert the value?
	    var ins = !eq(value, zero);

	    // old columns and rows
	    var r = matrix._size[0];
	    var c = matrix._size[1];

	    var i, j, k;

	    // check we need to increase columns
	    if (columns > c) {
	      // loop new columns
	      for (j = c; j < columns; j++) {
	        // update matrix._ptr for current column
	        matrix._ptr[j] = matrix._values.length;
	        // check we need to insert matrix._values
	        if (ins) {
	          // loop rows
	          for (i = 0; i < r; i++) {
	            // add new matrix._values
	            matrix._values.push(value);
	            // update matrix._index
	            matrix._index.push(i);
	          }
	        }
	      }
	      // store number of matrix._values in matrix._ptr
	      matrix._ptr[columns] = matrix._values.length;
	    } else if (columns < c) {
	      // truncate matrix._ptr
	      matrix._ptr.splice(columns + 1, c - columns);
	      // truncate matrix._values and matrix._index
	      matrix._values.splice(matrix._ptr[columns], matrix._values.length);
	      matrix._index.splice(matrix._ptr[columns], matrix._index.length);
	    }
	    // update columns
	    c = columns;

	    // check we need to increase rows
	    if (rows > r) {
	      // check we have to insert values
	      if (ins) {
	        // inserts
	        var n = 0;
	        // loop columns
	        for (j = 0; j < c; j++) {
	          // update matrix._ptr for current column
	          matrix._ptr[j] = matrix._ptr[j] + n;
	          // where to insert matrix._values
	          k = matrix._ptr[j + 1] + n;
	          // pointer
	          var p = 0;
	          // loop new rows, initialize pointer
	          for (i = r; i < rows; i++, p++) {
	            // add value
	            matrix._values.splice(k + p, 0, value);
	            // update matrix._index
	            matrix._index.splice(k + p, 0, i);
	            // increment inserts
	            n++;
	          }
	        }
	        // store number of matrix._values in matrix._ptr
	        matrix._ptr[c] = matrix._values.length;
	      }
	    } else if (rows < r) {
	      // deletes
	      var d = 0;
	      // loop columns
	      for (j = 0; j < c; j++) {
	        // update matrix._ptr for current column
	        matrix._ptr[j] = matrix._ptr[j] - d;
	        // where matrix._values start for next column
	        var k0 = matrix._ptr[j];
	        var k1 = matrix._ptr[j + 1] - d;
	        // loop matrix._index
	        for (k = k0; k < k1; k++) {
	          // row
	          i = matrix._index[k];
	          // check we need to delete value and matrix._index
	          if (i > rows - 1) {
	            // remove value
	            matrix._values.splice(k, 1);
	            // remove item from matrix._index
	            matrix._index.splice(k, 1);
	            // increase deletes
	            d++;
	          }
	        }
	      }
	      // update matrix._ptr for current column
	      matrix._ptr[j] = matrix._values.length;
	    }
	    // update matrix._size
	    matrix._size[0] = rows;
	    matrix._size[1] = columns;
	    // return matrix
	    return matrix;
	  };

	  /**
	   * Reshape the matrix to the given size. Returns a copy of the matrix when
	   * `copy=true`, otherwise return the matrix itself (reshape in place).
	   *
	   * NOTE: This might be better suited to copy by default, instead of modifying
	   *       in place. For now, it operates in place to remain consistent with
	   *       resize().
	   *
	   * @memberof SparseMatrix
	   * @param {number[]} size           The new size the matrix should have.
	   * @param {boolean} [copy]          Return a reshaped copy of the matrix
	   *
	   * @return {Matrix}                 The reshaped matrix
	   */
	  SparseMatrix.prototype.reshape = function (size, copy) {

	    // validate arguments
	    if (!isArray(size)) throw new TypeError('Array expected');
	    if (size.length !== 2) throw new Error('Sparse matrices can only be reshaped in two dimensions');

	    // check sizes
	    size.forEach(function (value) {
	      if (!number.isNumber(value) || !number.isInteger(value) || value < 0) {
	        throw new TypeError('Invalid size, must contain positive integers ' + '(size: ' + string.format(size) + ')');
	      }
	    });

	    // m * n must not change
	    if (this._size[0] * this._size[1] !== size[0] * size[1]) {
	      throw new Error('Reshaping sparse matrix will result in the wrong number of elements');
	    }

	    // matrix to reshape
	    var m = copy ? this.clone() : this;

	    // return unchanged if the same shape
	    if (this._size[0] === size[0] && this._size[1] === size[1]) {
	      return m;
	    }

	    // Convert to COO format (generate a column index)
	    var colIndex = [];
	    for (var i = 0; i < m._ptr.length; i++) {
	      for (var j = 0; j < m._ptr[i + 1] - m._ptr[i]; j++) {
	        colIndex.push(i);
	      }
	    }

	    // Clone the values array
	    var values = m._values.slice();

	    // Clone the row index array
	    var rowIndex = m._index.slice();

	    // Transform the (row, column) indices
	    for (var i = 0; i < m._index.length; i++) {
	      var r1 = rowIndex[i];
	      var c1 = colIndex[i];
	      var flat = r1 * m._size[1] + c1;
	      colIndex[i] = flat % size[1];
	      rowIndex[i] = Math.floor(flat / size[1]);
	    }

	    // Now reshaping is supposed to preserve the row-major order, BUT these sparse matrices are stored
	    // in column-major order, so we have to reorder the value array now. One option is to use a multisort,
	    // sorting several arrays based on some other array.

	    // OR, we could easily just:

	    // 1. Remove all values from the matrix
	    m._values.length = 0;
	    m._index.length = 0;
	    m._ptr.length = size[1] + 1;
	    m._size = size.slice();
	    for (var i = 0; i < m._ptr.length; i++) {
	      m._ptr[i] = 0;
	    }

	    // 2. Re-insert all elements in the proper order (simplified code from SparseMatrix.prototype.set)
	    // This step is probably the most time-consuming
	    for (var h = 0; h < values.length; h++) {
	      var i = rowIndex[h];
	      var j = colIndex[h];
	      var v = values[h];
	      var k = _getValueIndex(i, m._ptr[j], m._ptr[j + 1], m._index);
	      _insert(k, i, j, v, m._values, m._index, m._ptr);
	    }

	    // The value indices are inserted out of order, but apparently that's... still OK?

	    return m;
	  };

	  /**
	   * Create a clone of the matrix
	   * @memberof SparseMatrix
	   * @return {SparseMatrix} clone
	   */
	  SparseMatrix.prototype.clone = function () {
	    var m = new SparseMatrix({
	      values: this._values ? object.clone(this._values) : undefined,
	      index: object.clone(this._index),
	      ptr: object.clone(this._ptr),
	      size: object.clone(this._size),
	      datatype: this._datatype
	    });
	    return m;
	  };

	  /**
	   * Retrieve the size of the matrix.
	   * @memberof SparseMatrix
	   * @returns {number[]} size
	   */
	  SparseMatrix.prototype.size = function () {
	    return this._size.slice(0); // copy the Array
	  };

	  /**
	   * Create a new matrix with the results of the callback function executed on
	   * each entry of the matrix.
	   * @memberof SparseMatrix
	   * @param {Function} callback   The callback function is invoked with three
	   *                              parameters: the value of the element, the index
	   *                              of the element, and the Matrix being traversed.
	   * @param {boolean} [skipZeros] Invoke callback function for non-zero values only.
	   *
	   * @return {SparseMatrix} matrix
	   */
	  SparseMatrix.prototype.map = function (callback, skipZeros) {
	    // check it is a pattern matrix
	    if (!this._values) throw new Error('Cannot invoke map on a Pattern only matrix');
	    // matrix instance
	    var me = this;
	    // rows and columns
	    var rows = this._size[0];
	    var columns = this._size[1];
	    // invoke callback
	    var invoke = function (v, i, j) {
	      // invoke callback
	      return callback(v, [i, j], me);
	    };
	    // invoke _map
	    return _map(this, 0, rows - 1, 0, columns - 1, invoke, skipZeros);
	  };

	  /**
	   * Create a new matrix with the results of the callback function executed on the interval
	   * [minRow..maxRow, minColumn..maxColumn].
	   */
	  var _map = function (matrix, minRow, maxRow, minColumn, maxColumn, callback, skipZeros) {
	    // result arrays
	    var values = [];
	    var index = [];
	    var ptr = [];

	    // equal signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;

	    if (isString(matrix._datatype)) {
	      // find signature that matches (datatype, datatype)
	      eq = typed.find(equalScalar, [matrix._datatype, matrix._datatype]) || equalScalar;
	      // convert 0 to the same datatype
	      zero = typed.convert(0, matrix._datatype);
	    }

	    // invoke callback
	    var invoke = function (v, x, y) {
	      // invoke callback
	      v = callback(v, x, y);
	      // check value != 0
	      if (!eq(v, zero)) {
	        // store value
	        values.push(v);
	        // index
	        index.push(x);
	      }
	    };
	    // loop columns
	    for (var j = minColumn; j <= maxColumn; j++) {
	      // store pointer to values index
	      ptr.push(values.length);
	      // k0 <= k < k1 where k0 = _ptr[j] && k1 = _ptr[j+1]
	      var k0 = matrix._ptr[j];
	      var k1 = matrix._ptr[j + 1];
	      // row pointer
	      var p = minRow;
	      // loop k within [k0, k1[
	      for (var k = k0; k < k1; k++) {
	        // row index
	        var i = matrix._index[k];
	        // check i is in range
	        if (i >= minRow && i <= maxRow) {
	          // zero values
	          if (!skipZeros) {
	            for (var x = p; x < i; x++) invoke(0, x - minRow, j - minColumn);
	          }
	          // value @ k
	          invoke(matrix._values[k], i - minRow, j - minColumn);
	        }
	        // update pointer
	        p = i + 1;
	      }
	      // zero values
	      if (!skipZeros) {
	        for (var y = p; y <= maxRow; y++) invoke(0, y - minRow, j - minColumn);
	      }
	    }
	    // store number of values in ptr
	    ptr.push(values.length);
	    // return sparse matrix
	    return new SparseMatrix({
	      values: values,
	      index: index,
	      ptr: ptr,
	      size: [maxRow - minRow + 1, maxColumn - minColumn + 1]
	    });
	  };

	  /**
	   * Execute a callback function on each entry of the matrix.
	   * @memberof SparseMatrix
	   * @param {Function} callback   The callback function is invoked with three
	   *                              parameters: the value of the element, the index
	   *                              of the element, and the Matrix being traversed.
	   * @param {boolean} [skipZeros] Invoke callback function for non-zero values only.
	   */
	  SparseMatrix.prototype.forEach = function (callback, skipZeros) {
	    // check it is a pattern matrix
	    if (!this._values) throw new Error('Cannot invoke forEach on a Pattern only matrix');
	    // matrix instance
	    var me = this;
	    // rows and columns
	    var rows = this._size[0];
	    var columns = this._size[1];
	    // loop columns
	    for (var j = 0; j < columns; j++) {
	      // k0 <= k < k1 where k0 = _ptr[j] && k1 = _ptr[j+1]
	      var k0 = this._ptr[j];
	      var k1 = this._ptr[j + 1];
	      // column pointer
	      var p = 0;
	      // loop k within [k0, k1[
	      for (var k = k0; k < k1; k++) {
	        // row index
	        var i = this._index[k];
	        // check we need to process zeros
	        if (!skipZeros) {
	          // zero values
	          for (var x = p; x < i; x++) callback(0, [x, j], me);
	        }
	        // value @ k
	        callback(this._values[k], [i, j], me);
	        // update pointer
	        p = i + 1;
	      }
	      // check we need to process zeros
	      if (!skipZeros) {
	        // zero values
	        for (var y = p; y < rows; y++) callback(0, [y, j], me);
	      }
	    }
	  };

	  /**
	   * Create an Array with a copy of the data of the SparseMatrix
	   * @memberof SparseMatrix
	   * @returns {Array} array
	   */
	  SparseMatrix.prototype.toArray = function () {
	    return _toArray(this._values, this._index, this._ptr, this._size, true);
	  };

	  /**
	   * Get the primitive value of the SparseMatrix: a two dimensions array
	   * @memberof SparseMatrix
	   * @returns {Array} array
	   */
	  SparseMatrix.prototype.valueOf = function () {
	    return _toArray(this._values, this._index, this._ptr, this._size, false);
	  };

	  var _toArray = function (values, index, ptr, size, copy) {
	    // rows and columns
	    var rows = size[0];
	    var columns = size[1];
	    // result
	    var a = [];
	    // vars
	    var i, j;
	    // initialize array
	    for (i = 0; i < rows; i++) {
	      a[i] = [];
	      for (j = 0; j < columns; j++) a[i][j] = 0;
	    }

	    // loop columns
	    for (j = 0; j < columns; j++) {
	      // k0 <= k < k1 where k0 = _ptr[j] && k1 = _ptr[j+1]
	      var k0 = ptr[j];
	      var k1 = ptr[j + 1];
	      // loop k within [k0, k1[
	      for (var k = k0; k < k1; k++) {
	        // row index
	        i = index[k];
	        // set value (use one for pattern matrix)
	        a[i][j] = values ? copy ? object.clone(values[k]) : values[k] : 1;
	      }
	    }
	    return a;
	  };

	  /**
	   * Get a string representation of the matrix, with optional formatting options.
	   * @memberof SparseMatrix
	   * @param {Object | number | Function} [options]  Formatting options. See
	   *                                                lib/utils/number:format for a
	   *                                                description of the available
	   *                                                options.
	   * @returns {string} str
	   */
	  SparseMatrix.prototype.format = function (options) {
	    // rows and columns
	    var rows = this._size[0];
	    var columns = this._size[1];
	    // density
	    var density = this.density();
	    // rows & columns
	    var str = 'Sparse Matrix [' + string.format(rows, options) + ' x ' + string.format(columns, options) + '] density: ' + string.format(density, options) + '\n';
	    // loop columns
	    for (var j = 0; j < columns; j++) {
	      // k0 <= k < k1 where k0 = _ptr[j] && k1 = _ptr[j+1]
	      var k0 = this._ptr[j];
	      var k1 = this._ptr[j + 1];
	      // loop k within [k0, k1[
	      for (var k = k0; k < k1; k++) {
	        // row index
	        var i = this._index[k];
	        // append value
	        str += '\n    (' + string.format(i, options) + ', ' + string.format(j, options) + ') ==> ' + (this._values ? string.format(this._values[k], options) : 'X');
	      }
	    }
	    return str;
	  };

	  /**
	   * Get a string representation of the matrix
	   * @memberof SparseMatrix
	   * @returns {string} str
	   */
	  SparseMatrix.prototype.toString = function () {
	    return string.format(this.toArray());
	  };

	  /**
	   * Get a JSON representation of the matrix
	   * @memberof SparseMatrix
	   * @returns {Object}
	   */
	  SparseMatrix.prototype.toJSON = function () {
	    return {
	      mathjs: 'SparseMatrix',
	      values: this._values,
	      index: this._index,
	      ptr: this._ptr,
	      size: this._size,
	      datatype: this._datatype
	    };
	  };

	  /**
	   * Get the kth Matrix diagonal.
	   *
	   * @memberof SparseMatrix
	   * @param {number | BigNumber} [k=0]     The kth diagonal where the vector will retrieved.
	   *
	   * @returns {Matrix}                     The matrix vector with the diagonal values.
	   */
	  SparseMatrix.prototype.diagonal = function (k) {
	    // validate k if any
	    if (k) {
	      // convert BigNumber to a number
	      if (type.isBigNumber(k)) k = k.toNumber();
	      // is must be an integer
	      if (!isNumber(k) || !isInteger(k)) {
	        throw new TypeError('The parameter k must be an integer number');
	      }
	    } else {
	      // default value
	      k = 0;
	    }

	    var kSuper = k > 0 ? k : 0;
	    var kSub = k < 0 ? -k : 0;

	    // rows & columns
	    var rows = this._size[0];
	    var columns = this._size[1];

	    // number diagonal values
	    var n = Math.min(rows - kSub, columns - kSuper);

	    // diagonal arrays
	    var values = [];
	    var index = [];
	    var ptr = [];
	    // initial ptr value
	    ptr[0] = 0;
	    // loop columns
	    for (var j = kSuper; j < columns && values.length < n; j++) {
	      // k0 <= k < k1 where k0 = _ptr[j] && k1 = _ptr[j+1]
	      var k0 = this._ptr[j];
	      var k1 = this._ptr[j + 1];
	      // loop x within [k0, k1[
	      for (var x = k0; x < k1; x++) {
	        // row index
	        var i = this._index[x];
	        // check row
	        if (i === j - kSuper + kSub) {
	          // value on this column
	          values.push(this._values[x]);
	          // store row
	          index[values.length - 1] = i - kSub;
	          // exit loop
	          break;
	        }
	      }
	    }
	    // close ptr
	    ptr.push(values.length);
	    // return matrix
	    return new SparseMatrix({
	      values: values,
	      index: index,
	      ptr: ptr,
	      size: [n, 1]
	    });
	  };

	  /**
	   * Generate a matrix from a JSON object
	   * @memberof SparseMatrix
	   * @param {Object} json  An object structured like
	   *                       `{"mathjs": "SparseMatrix", "values": [], "index": [], "ptr": [], "size": []}`,
	   *                       where mathjs is optional
	   * @returns {SparseMatrix}
	   */
	  SparseMatrix.fromJSON = function (json) {
	    return new SparseMatrix(json);
	  };

	  /**
	   * Create a diagonal matrix.
	   *
	   * @memberof SparseMatrix
	   * @param {Array} size                       The matrix size.
	   * @param {number | Array | Matrix } value   The values for the diagonal.
	   * @param {number | BigNumber} [k=0]         The kth diagonal where the vector will be filled in.
	   * @param {string} [datatype]                The Matrix datatype, values must be of this datatype.
	   *
	   * @returns {SparseMatrix}
	   */
	  SparseMatrix.diagonal = function (size, value, k, defaultValue, datatype) {
	    if (!isArray(size)) throw new TypeError('Array expected, size parameter');
	    if (size.length !== 2) throw new Error('Only two dimensions matrix are supported');

	    // map size & validate
	    size = size.map(function (s) {
	      // check it is a big number
	      if (type.isBigNumber(s)) {
	        // convert it
	        s = s.toNumber();
	      }
	      // validate arguments
	      if (!isNumber(s) || !isInteger(s) || s < 1) {
	        throw new Error('Size values must be positive integers');
	      }
	      return s;
	    });

	    // validate k if any
	    if (k) {
	      // convert BigNumber to a number
	      if (type.isBigNumber(k)) k = k.toNumber();
	      // is must be an integer
	      if (!isNumber(k) || !isInteger(k)) {
	        throw new TypeError('The parameter k must be an integer number');
	      }
	    } else {
	      // default value
	      k = 0;
	    }

	    // equal signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;

	    if (isString(datatype)) {
	      // find signature that matches (datatype, datatype)
	      eq = typed.find(equalScalar, [datatype, datatype]) || equalScalar;
	      // convert 0 to the same datatype
	      zero = typed.convert(0, datatype);
	    }

	    var kSuper = k > 0 ? k : 0;
	    var kSub = k < 0 ? -k : 0;

	    // rows and columns
	    var rows = size[0];
	    var columns = size[1];

	    // number of non-zero items
	    var n = Math.min(rows - kSub, columns - kSuper);

	    // value extraction function
	    var _value;

	    // check value
	    if (isArray(value)) {
	      // validate array
	      if (value.length !== n) {
	        // number of values in array must be n
	        throw new Error('Invalid value array length');
	      }
	      // define function
	      _value = function (i) {
	        // return value @ i
	        return value[i];
	      };
	    } else if (type.isMatrix(value)) {
	      // matrix size
	      var ms = value.size();
	      // validate matrix
	      if (ms.length !== 1 || ms[0] !== n) {
	        // number of values in array must be n
	        throw new Error('Invalid matrix length');
	      }
	      // define function
	      _value = function (i) {
	        // return value @ i
	        return value.get([i]);
	      };
	    } else {
	      // define function
	      _value = function () {
	        // return value
	        return value;
	      };
	    }

	    // create arrays
	    var values = [];
	    var index = [];
	    var ptr = [];

	    // loop items
	    for (var j = 0; j < columns; j++) {
	      // number of rows with value
	      ptr.push(values.length);
	      // diagonal index
	      var i = j - kSuper;
	      // check we need to set diagonal value
	      if (i >= 0 && i < n) {
	        // get value @ i
	        var v = _value(i);
	        // check for zero
	        if (!eq(v, zero)) {
	          // column
	          index.push(i + kSub);
	          // add value
	          values.push(v);
	        }
	      }
	    }
	    // last value should be number of values
	    ptr.push(values.length);
	    // create SparseMatrix
	    return new SparseMatrix({
	      values: values,
	      index: index,
	      ptr: ptr,
	      size: [rows, columns]
	    });
	  };

	  /**
	   * Swap rows i and j in Matrix.
	   *
	   * @memberof SparseMatrix
	   * @param {number} i       Matrix row index 1
	   * @param {number} j       Matrix row index 2
	   *
	   * @return {Matrix}        The matrix reference
	   */
	  SparseMatrix.prototype.swapRows = function (i, j) {
	    // check index
	    if (!isNumber(i) || !isInteger(i) || !isNumber(j) || !isInteger(j)) {
	      throw new Error('Row index must be positive integers');
	    }
	    // check dimensions
	    if (this._size.length !== 2) {
	      throw new Error('Only two dimensional matrix is supported');
	    }
	    // validate index
	    validateIndex(i, this._size[0]);
	    validateIndex(j, this._size[0]);

	    // swap rows
	    SparseMatrix._swapRows(i, j, this._size[1], this._values, this._index, this._ptr);
	    // return current instance
	    return this;
	  };

	  /**
	   * Loop rows with data in column j.
	   *
	   * @param {number} j            Column
	   * @param {Array} values        Matrix values
	   * @param {Array} index         Matrix row indeces
	   * @param {Array} ptr           Matrix column pointers
	   * @param {Function} callback   Callback function invoked for every row in column j
	   */
	  SparseMatrix._forEachRow = function (j, values, index, ptr, callback) {
	    // indeces for column j
	    var k0 = ptr[j];
	    var k1 = ptr[j + 1];
	    // loop
	    for (var k = k0; k < k1; k++) {
	      // invoke callback
	      callback(index[k], values[k]);
	    }
	  };

	  /**
	   * Swap rows x and y in Sparse Matrix data structures.
	   *
	   * @param {number} x         Matrix row index 1
	   * @param {number} y         Matrix row index 2
	   * @param {number} columns   Number of columns in matrix
	   * @param {Array} values     Matrix values
	   * @param {Array} index      Matrix row indeces
	   * @param {Array} ptr        Matrix column pointers
	   */
	  SparseMatrix._swapRows = function (x, y, columns, values, index, ptr) {
	    // loop columns
	    for (var j = 0; j < columns; j++) {
	      // k0 <= k < k1 where k0 = _ptr[j] && k1 = _ptr[j+1]
	      var k0 = ptr[j];
	      var k1 = ptr[j + 1];
	      // find value index @ x
	      var kx = _getValueIndex(x, k0, k1, index);
	      // find value index @ x
	      var ky = _getValueIndex(y, k0, k1, index);
	      // check both rows exist in matrix
	      if (kx < k1 && ky < k1 && index[kx] === x && index[ky] === y) {
	        // swap values (check for pattern matrix)
	        if (values) {
	          var v = values[kx];
	          values[kx] = values[ky];
	          values[ky] = v;
	        }
	        // next column
	        continue;
	      }
	      // check x row exist & no y row
	      if (kx < k1 && index[kx] === x && (ky >= k1 || index[ky] !== y)) {
	        // value @ x (check for pattern matrix)
	        var vx = values ? values[kx] : undefined;
	        // insert value @ y
	        index.splice(ky, 0, y);
	        if (values) values.splice(ky, 0, vx);
	        // remove value @ x (adjust array index if needed)
	        index.splice(ky <= kx ? kx + 1 : kx, 1);
	        if (values) values.splice(ky <= kx ? kx + 1 : kx, 1);
	        // next column
	        continue;
	      }
	      // check y row exist & no x row
	      if (ky < k1 && index[ky] === y && (kx >= k1 || index[kx] !== x)) {
	        // value @ y (check for pattern matrix)
	        var vy = values ? values[ky] : undefined;
	        // insert value @ x
	        index.splice(kx, 0, x);
	        if (values) values.splice(kx, 0, vy);
	        // remove value @ y (adjust array index if needed)
	        index.splice(kx <= ky ? ky + 1 : ky, 1);
	        if (values) values.splice(kx <= ky ? ky + 1 : ky, 1);
	      }
	    }
	  };

	  // register this type in the base class Matrix
	  type.Matrix._storage.sparse = SparseMatrix;

	  return SparseMatrix;
	}

	exports.name = 'SparseMatrix';
	exports.path = 'type';
	exports.factory = factory;
	exports.lazy = false; // no lazy loading, as we alter type.Matrix._storage

/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var nearlyEqual = __webpack_require__(19).nearlyEqual;
	var bigNearlyEqual = __webpack_require__(41);

	function factory(type, config, load, typed) {

	  /**
	   * Test whether two values are equal.
	   *
	   * @param  {number | BigNumber | Fraction | boolean | Complex | Unit} x   First value to compare
	   * @param  {number | BigNumber | Fraction | boolean | Complex} y          Second value to compare
	   * @return {boolean}                                                  Returns true when the compared values are equal, else returns false
	   * @private
	   */
	  var equalScalar = typed('equalScalar', {

	    'boolean, boolean': function (x, y) {
	      return x === y;
	    },

	    'number, number': function (x, y) {
	      return x === y || nearlyEqual(x, y, config.epsilon);
	    },

	    'BigNumber, BigNumber': function (x, y) {
	      return x.eq(y) || bigNearlyEqual(x, y, config.epsilon);
	    },

	    'Fraction, Fraction': function (x, y) {
	      return x.equals(y);
	    },

	    'Complex, Complex': function (x, y) {
	      return x.equals(y);
	    },

	    'Unit, Unit': function (x, y) {
	      if (!x.equalBase(y)) {
	        throw new Error('Cannot compare units with different base');
	      }
	      return equalScalar(x.value, y.value);
	    },

	    'string, string': function (x, y) {
	      return x === y;
	    }
	  });

	  return equalScalar;
	}

	exports.factory = factory;

/***/ }),
/* 41 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Compares two BigNumbers.
	 * @param {BigNumber} x       First value to compare
	 * @param {BigNumber} y       Second value to compare
	 * @param {number} [epsilon]  The maximum relative difference between x and y
	 *                            If epsilon is undefined or null, the function will
	 *                            test whether x and y are exactly equal.
	 * @return {boolean} whether the two numbers are nearly equal
	 */

	module.exports = function nearlyEqual(x, y, epsilon) {
	  // if epsilon is null or undefined, test whether x and y are exactly equal
	  if (epsilon == null) {
	    return x.eq(y);
	  }

	  // use "==" operator, handles infinities
	  if (x.eq(y)) {
	    return true;
	  }

	  // NaN
	  if (x.isNaN() || y.isNaN()) {
	    return false;
	  }

	  // at this point x and y should be finite
	  if (x.isFinite() && y.isFinite()) {
	    // check numbers are very close, needed when comparing numbers near zero
	    var diff = x.minus(y).abs();
	    if (diff.isZero()) {
	      return true;
	    } else {
	      // use relative error
	      var max = x.constructor.max(x.abs(), y.abs());
	      return diff.lte(max.times(epsilon));
	    }
	  }

	  // Infinite and Number or negative Infinite and positive Infinite cases
	  return false;
	};

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	function factory(type, config, load) {

	  var add = load(__webpack_require__(43));
	  var equalScalar = load(__webpack_require__(40));

	  /**
	   * An ordered Sparse Accumulator is a representation for a sparse vector that includes a dense array 
	   * of the vector elements and an ordered list of non-zero elements.
	   */
	  function Spa() {
	    if (!(this instanceof Spa)) throw new SyntaxError('Constructor must be called with the new operator');

	    // allocate vector, TODO use typed arrays
	    this._values = [];
	    this._heap = new type.FibonacciHeap();
	  }

	  /**
	   * Attach type information
	   */
	  Spa.prototype.type = 'Spa';
	  Spa.prototype.isSpa = true;

	  /**
	   * Set the value for index i.
	   *
	   * @param {number} i                       The index
	   * @param {number | BigNumber | Complex}   The value at index i
	   */
	  Spa.prototype.set = function (i, v) {
	    // check we have a value @ i
	    if (!this._values[i]) {
	      // insert in heap
	      var node = this._heap.insert(i, v);
	      // set the value @ i
	      this._values[i] = node;
	    } else {
	      // update the value @ i
	      this._values[i].value = v;
	    }
	  };

	  Spa.prototype.get = function (i) {
	    var node = this._values[i];
	    if (node) return node.value;
	    return 0;
	  };

	  Spa.prototype.accumulate = function (i, v) {
	    // node @ i
	    var node = this._values[i];
	    if (!node) {
	      // insert in heap
	      node = this._heap.insert(i, v);
	      // initialize value
	      this._values[i] = node;
	    } else {
	      // accumulate value
	      node.value = add(node.value, v);
	    }
	  };

	  Spa.prototype.forEach = function (from, to, callback) {
	    // references
	    var heap = this._heap;
	    var values = this._values;
	    // nodes
	    var nodes = [];
	    // node with minimum key, save it
	    var node = heap.extractMinimum();
	    if (node) nodes.push(node);
	    // extract nodes from heap (ordered)
	    while (node && node.key <= to) {
	      // check it is in range
	      if (node.key >= from) {
	        // check value is not zero
	        if (!equalScalar(node.value, 0)) {
	          // invoke callback
	          callback(node.key, node.value, this);
	        }
	      }
	      // extract next node, save it
	      node = heap.extractMinimum();
	      if (node) nodes.push(node);
	    }
	    // reinsert all nodes in heap
	    for (var i = 0; i < nodes.length; i++) {
	      // current node
	      var n = nodes[i];
	      // insert node in heap
	      node = heap.insert(n.key, n.value);
	      // update values
	      values[node.key] = node;
	    }
	  };

	  Spa.prototype.swap = function (i, j) {
	    // node @ i and j
	    var nodei = this._values[i];
	    var nodej = this._values[j];
	    // check we need to insert indeces
	    if (!nodei && nodej) {
	      // insert in heap
	      nodei = this._heap.insert(i, nodej.value);
	      // remove from heap
	      this._heap.remove(nodej);
	      // set values
	      this._values[i] = nodei;
	      this._values[j] = undefined;
	    } else if (nodei && !nodej) {
	      // insert in heap
	      nodej = this._heap.insert(j, nodei.value);
	      // remove from heap
	      this._heap.remove(nodei);
	      // set values
	      this._values[j] = nodej;
	      this._values[i] = undefined;
	    } else if (nodei && nodej) {
	      // swap values
	      var v = nodei.value;
	      nodei.value = nodej.value;
	      nodej.value = v;
	    }
	  };

	  return Spa;
	}

	exports.name = 'Spa';
	exports.path = 'type';
	exports.factory = factory;

/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var extend = __webpack_require__(15).extend;

	function factory(type, config, load, typed) {

	  var matrix = load(__webpack_require__(44));
	  var addScalar = load(__webpack_require__(45));
	  var latex = __webpack_require__(46);

	  var algorithm01 = load(__webpack_require__(47));
	  var algorithm04 = load(__webpack_require__(48));
	  var algorithm10 = load(__webpack_require__(49));
	  var algorithm13 = load(__webpack_require__(50));
	  var algorithm14 = load(__webpack_require__(51));

	  /**
	   * Add two or more values, `x + y`.
	   * For matrices, the function is evaluated element wise.
	   *
	   * Syntax:
	   *
	   *    math.add(x, y)
	   *    math.add(x, y, z, ...)
	   *
	   * Examples:
	   *
	   *    math.add(2, 3);               // returns number 5
	   *    math.add(2, 3, 4);            // returns number 9
	   *
	   *    var a = math.complex(2, 3);
	   *    var b = math.complex(-4, 1);
	   *    math.add(a, b);               // returns Complex -2 + 4i
	   *
	   *    math.add([1, 2, 3], 4);       // returns Array [5, 6, 7]
	   *
	   *    var c = math.unit('5 cm');
	   *    var d = math.unit('2.1 mm');
	   *    math.add(c, d);               // returns Unit 52.1 mm
	   *
	   *    math.add("2.3", "4");         // returns number 6.3
	   *
	   * See also:
	   *
	   *    subtract, sum
	   *
	   * @param  {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} x First value to add
	   * @param  {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} y Second value to add
	   * @return {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} Sum of `x` and `y`
	   */
	  var add = typed('add', extend({
	    // we extend the signatures of addScalar with signatures dealing with matrices

	    'Matrix, Matrix': function (x, y) {
	      // result
	      var c;

	      // process matrix storage
	      switch (x.storage()) {
	        case 'sparse':
	          switch (y.storage()) {
	            case 'sparse':
	              // sparse + sparse
	              c = algorithm04(x, y, addScalar);
	              break;
	            default:
	              // sparse + dense
	              c = algorithm01(y, x, addScalar, true);
	              break;
	          }
	          break;
	        default:
	          switch (y.storage()) {
	            case 'sparse':
	              // dense + sparse
	              c = algorithm01(x, y, addScalar, false);
	              break;
	            default:
	              // dense + dense
	              c = algorithm13(x, y, addScalar);
	              break;
	          }
	          break;
	      }
	      return c;
	    },

	    'Array, Array': function (x, y) {
	      // use matrix implementation
	      return add(matrix(x), matrix(y)).valueOf();
	    },

	    'Array, Matrix': function (x, y) {
	      // use matrix implementation
	      return add(matrix(x), y);
	    },

	    'Matrix, Array': function (x, y) {
	      // use matrix implementation
	      return add(x, matrix(y));
	    },

	    'Matrix, any': function (x, y) {
	      // result
	      var c;
	      // check storage format
	      switch (x.storage()) {
	        case 'sparse':
	          c = algorithm10(x, y, addScalar, false);
	          break;
	        default:
	          c = algorithm14(x, y, addScalar, false);
	          break;
	      }
	      return c;
	    },

	    'any, Matrix': function (x, y) {
	      // result
	      var c;
	      // check storage format
	      switch (y.storage()) {
	        case 'sparse':
	          c = algorithm10(y, x, addScalar, true);
	          break;
	        default:
	          c = algorithm14(y, x, addScalar, true);
	          break;
	      }
	      return c;
	    },

	    'Array, any': function (x, y) {
	      // use matrix implementation
	      return algorithm14(matrix(x), y, addScalar, false).valueOf();
	    },

	    'any, Array': function (x, y) {
	      // use matrix implementation
	      return algorithm14(matrix(y), x, addScalar, true).valueOf();
	    },

	    'any, any': addScalar,

	    'Array | Matrix | any, Array | Matrix | any, ...any': function (x, y, rest) {
	      var result = add(x, y);

	      for (var i = 0; i < rest.length; i++) {
	        result = add(result, rest[i]);
	      }

	      return result;
	    }
	  }, addScalar.signatures));

	  add.toTex = {
	    2: '\\left(${args[0]}' + latex.operators['add'] + '${args[1]}\\right)'
	  };

	  return add;
	}

	exports.name = 'add';
	exports.factory = factory;

/***/ }),
/* 44 */
/***/ (function(module, exports) {

	'use strict';

	function factory(type, config, load, typed) {
	  /**
	   * Create a Matrix. The function creates a new `math.type.Matrix` object from
	   * an `Array`. A Matrix has utility functions to manipulate the data in the
	   * matrix, like getting the size and getting or setting values in the matrix.
	   * Supported storage formats are 'dense' and 'sparse'.
	   *
	   * Syntax:
	   *
	   *    math.matrix()                         // creates an empty matrix using default storage format (dense).
	   *    math.matrix(data)                     // creates a matrix with initial data using default storage format (dense).
	   *    math.matrix('dense')                  // creates an empty matrix using the given storage format.
	   *    math.matrix(data, 'dense')            // creates a matrix with initial data using the given storage format.
	   *    math.matrix(data, 'sparse')           // creates a sparse matrix with initial data.
	   *    math.matrix(data, 'sparse', 'number') // creates a sparse matrix with initial data, number data type.
	   *
	   * Examples:
	   *
	   *    var m = math.matrix([[1, 2], [3, 4]]);
	   *    m.size();                        // Array [2, 2]
	   *    m.resize([3, 2], 5);
	   *    m.valueOf();                     // Array [[1, 2], [3, 4], [5, 5]]
	   *    m.get([1, 0])                    // number 3
	   *
	   * See also:
	   *
	   *    bignumber, boolean, complex, index, number, string, unit, sparse
	   *
	   * @param {Array | Matrix} [data]    A multi dimensional array
	   * @param {string} [format]          The Matrix storage format
	   *
	   * @return {Matrix} The created matrix
	   */
	  var matrix = typed('matrix', {
	    '': function () {
	      return _create([]);
	    },

	    'string': function (format) {
	      return _create([], format);
	    },

	    'string, string': function (format, datatype) {
	      return _create([], format, datatype);
	    },

	    'Array': function (data) {
	      return _create(data);
	    },

	    'Matrix': function (data) {
	      return _create(data, data.storage());
	    },

	    'Array | Matrix, string': _create,

	    'Array | Matrix, string, string': _create
	  });

	  matrix.toTex = {
	    0: '\\begin{bmatrix}\\end{bmatrix}',
	    1: '\\left(${args[0]}\\right)',
	    2: '\\left(${args[0]}\\right)'
	  };

	  return matrix;

	  /**
	   * Create a new Matrix with given storage format
	   * @param {Array} data
	   * @param {string} [format]
	   * @param {string} [datatype]
	   * @returns {Matrix} Returns a new Matrix
	   * @private
	   */
	  function _create(data, format, datatype) {
	    // get storage format constructor
	    var M = type.Matrix.storage(format || 'default');

	    // create instance
	    return new M(data, datatype);
	  }
	}

	exports.name = 'matrix';
	exports.factory = factory;

/***/ }),
/* 45 */
/***/ (function(module, exports) {

	'use strict';

	function factory(type, config, load, typed) {

	  /**
	   * Add two scalar values, `x + y`.
	   * This function is meant for internal use: it is used by the public function
	   * `add`
	   *
	   * This function does not support collections (Array or Matrix), and does
	   * not validate the number of of inputs.
	   *
	   * @param  {number | BigNumber | Fraction | Complex | Unit} x   First value to add
	   * @param  {number | BigNumber | Fraction | Complex} y          Second value to add
	   * @return {number | BigNumber | Fraction | Complex | Unit}                      Sum of `x` and `y`
	   * @private
	   */
	  var add = typed('add', {

	    'number, number': function (x, y) {
	      return x + y;
	    },

	    'Complex, Complex': function (x, y) {
	      return x.add(y);
	    },

	    'BigNumber, BigNumber': function (x, y) {
	      return x.plus(y);
	    },

	    'Fraction, Fraction': function (x, y) {
	      return x.add(y);
	    },

	    'Unit, Unit': function (x, y) {
	      if (x.value == null) throw new Error('Parameter x contains a unit with undefined value');
	      if (y.value == null) throw new Error('Parameter y contains a unit with undefined value');
	      if (!x.equalBase(y)) throw new Error('Units do not match');

	      var res = x.clone();
	      res.value = add(res.value, y.value);
	      res.fixPrefix = false;
	      return res;
	    }
	  });

	  return add;
	}

	exports.factory = factory;

/***/ }),
/* 46 */
/***/ (function(module, exports) {

	'use strict';

	exports.symbols = {
	  // GREEK LETTERS
	  Alpha: 'A', alpha: '\\alpha',
	  Beta: 'B', beta: '\\beta',
	  Gamma: '\\Gamma', gamma: '\\gamma',
	  Delta: '\\Delta', delta: '\\delta',
	  Epsilon: 'E', epsilon: '\\epsilon', varepsilon: '\\varepsilon',
	  Zeta: 'Z', zeta: '\\zeta',
	  Eta: 'H', eta: '\\eta',
	  Theta: '\\Theta', theta: '\\theta', vartheta: '\\vartheta',
	  Iota: 'I', iota: '\\iota',
	  Kappa: 'K', kappa: '\\kappa', varkappa: '\\varkappa',
	  Lambda: '\\Lambda', lambda: '\\lambda',
	  Mu: 'M', mu: '\\mu',
	  Nu: 'N', nu: '\\nu',
	  Xi: '\\Xi', xi: '\\xi',
	  Omicron: 'O', omicron: 'o',
	  Pi: '\\Pi', pi: '\\pi', varpi: '\\varpi',
	  Rho: 'P', rho: '\\rho', varrho: '\\varrho',
	  Sigma: '\\Sigma', sigma: '\\sigma', varsigma: '\\varsigma',
	  Tau: 'T', tau: '\\tau',
	  Upsilon: '\\Upsilon', upsilon: '\\upsilon',
	  Phi: '\\Phi', phi: '\\phi', varphi: '\\varphi',
	  Chi: 'X', chi: '\\chi',
	  Psi: '\\Psi', psi: '\\psi',
	  Omega: '\\Omega', omega: '\\omega',
	  //logic
	  'true': '\\mathrm{True}',
	  'false': '\\mathrm{False}',
	  //other
	  i: 'i', //TODO use \i ??
	  inf: '\\infty',
	  Inf: '\\infty',
	  infinity: '\\infty',
	  Infinity: '\\infty',
	  oo: '\\infty',
	  lim: '\\lim',
	  'undefined': '\\mathbf{?}'
	};

	exports.operators = {
	  'transpose': '^\\top',
	  'factorial': '!',
	  'pow': '^',
	  'dotPow': '.^\\wedge', //TODO find ideal solution
	  'unaryPlus': '+',
	  'unaryMinus': '-',
	  'bitNot': '~', //TODO find ideal solution
	  'not': '\\neg',
	  'multiply': '\\cdot',
	  'divide': '\\frac', //TODO how to handle that properly?
	  'dotMultiply': '.\\cdot', //TODO find ideal solution
	  'dotDivide': '.:', //TODO find ideal solution
	  'mod': '\\mod',
	  'add': '+',
	  'subtract': '-',
	  'to': '\\rightarrow',
	  'leftShift': '<<',
	  'rightArithShift': '>>',
	  'rightLogShift': '>>>',
	  'equal': '=',
	  'unequal': '\\neq',
	  'smaller': '<',
	  'larger': '>',
	  'smallerEq': '\\leq',
	  'largerEq': '\\geq',
	  'bitAnd': '\\&',
	  'bitXor': '\\underline{|}',
	  'bitOr': '|',
	  'and': '\\wedge',
	  'xor': '\\veebar',
	  'or': '\\vee'
	};

	exports.defaultTemplate = '\\mathrm{${name}}\\left(${args}\\right)';

	var units = {
	  deg: '^\\circ'
	};

	//@param {string} name
	//@param {boolean} isUnit
	exports.toSymbol = function (name, isUnit) {
	  isUnit = typeof isUnit === 'undefined' ? false : isUnit;
	  if (isUnit) {
	    if (units.hasOwnProperty(name)) {
	      return units[name];
	    }
	    return '\\mathrm{' + name + '}';
	  }

	  if (exports.symbols.hasOwnProperty(name)) {
	    return exports.symbols[name];
	  } else if (name.indexOf('_') !== -1) {
	    //symbol with index (eg. alpha_1)
	    var index = name.indexOf('_');
	    return exports.toSymbol(name.substring(0, index)) + '_{' + exports.toSymbol(name.substring(index + 1)) + '}';
	  }
	  return name;
	};

/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var DimensionError = __webpack_require__(33);

	function factory(type, config, load, typed) {

	  var DenseMatrix = type.DenseMatrix;

	  /**
	   * Iterates over SparseMatrix nonzero items and invokes the callback function f(Dij, Sij). 
	   * Callback function invoked NNZ times (number of nonzero items in SparseMatrix).
	   *
	   *
	   *          ┌  f(Dij, Sij)  ; S(i,j) !== 0
	   * C(i,j) = ┤
	   *          └  Dij          ; otherwise
	   *
	   *
	   * @param {Matrix}   denseMatrix       The DenseMatrix instance (D)
	   * @param {Matrix}   sparseMatrix      The SparseMatrix instance (S)
	   * @param {Function} callback          The f(Dij,Sij) operation to invoke, where Dij = DenseMatrix(i,j) and Sij = SparseMatrix(i,j)
	   * @param {boolean}  inverse           A true value indicates callback should be invoked f(Sij,Dij)
	   *
	   * @return {Matrix}                    DenseMatrix (C)
	   *
	   * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97477571
	   */
	  var algorithm01 = function (denseMatrix, sparseMatrix, callback, inverse) {
	    // dense matrix arrays
	    var adata = denseMatrix._data;
	    var asize = denseMatrix._size;
	    var adt = denseMatrix._datatype;
	    // sparse matrix arrays
	    var bvalues = sparseMatrix._values;
	    var bindex = sparseMatrix._index;
	    var bptr = sparseMatrix._ptr;
	    var bsize = sparseMatrix._size;
	    var bdt = sparseMatrix._datatype;

	    // validate dimensions
	    if (asize.length !== bsize.length) throw new DimensionError(asize.length, bsize.length);

	    // check rows & columns
	    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) throw new RangeError('Dimension mismatch. Matrix A (' + asize + ') must match Matrix B (' + bsize + ')');

	    // sparse matrix cannot be a Pattern matrix
	    if (!bvalues) throw new Error('Cannot perform operation on Dense Matrix and Pattern Sparse Matrix');

	    // rows & columns
	    var rows = asize[0];
	    var columns = asize[1];

	    // process data types
	    var dt = typeof adt === 'string' && adt === bdt ? adt : undefined;
	    // callback function
	    var cf = dt ? typed.find(callback, [dt, dt]) : callback;

	    // vars
	    var i, j;

	    // result (DenseMatrix)
	    var cdata = [];
	    // initialize c
	    for (i = 0; i < rows; i++) cdata[i] = [];

	    // workspace
	    var x = [];
	    // marks indicating we have a value in x for a given column
	    var w = [];

	    // loop columns in b
	    for (j = 0; j < columns; j++) {
	      // column mark
	      var mark = j + 1;
	      // values in column j
	      for (var k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
	        // row
	        i = bindex[k];
	        // update workspace
	        x[i] = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k]);
	        // mark i as updated
	        w[i] = mark;
	      }
	      // loop rows
	      for (i = 0; i < rows; i++) {
	        // check row is in workspace
	        if (w[i] === mark) {
	          // c[i][j] was already calculated
	          cdata[i][j] = x[i];
	        } else {
	          // item does not exist in S
	          cdata[i][j] = adata[i][j];
	        }
	      }
	    }

	    // return dense matrix
	    return new DenseMatrix({
	      data: cdata,
	      size: [rows, columns],
	      datatype: dt
	    });
	  };

	  return algorithm01;
	}

	exports.name = 'algorithm01';
	exports.factory = factory;

/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var DimensionError = __webpack_require__(33);

	function factory(type, config, load, typed) {

	  var equalScalar = load(__webpack_require__(40));

	  var SparseMatrix = type.SparseMatrix;

	  /**
	   * Iterates over SparseMatrix A and SparseMatrix B nonzero items and invokes the callback function f(Aij, Bij). 
	   * Callback function invoked MAX(NNZA, NNZB) times
	   *
	   *
	   *          ┌  f(Aij, Bij)  ; A(i,j) !== 0 && B(i,j) !== 0
	   * C(i,j) = ┤  A(i,j)       ; A(i,j) !== 0
	   *          └  B(i,j)       ; B(i,j) !== 0
	   *
	   *
	   * @param {Matrix}   a                 The SparseMatrix instance (A)
	   * @param {Matrix}   b                 The SparseMatrix instance (B)
	   * @param {Function} callback          The f(Aij,Bij) operation to invoke
	   *
	   * @return {Matrix}                    SparseMatrix (C)
	   *
	   * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97620294
	   */
	  var algorithm04 = function (a, b, callback) {
	    // sparse matrix arrays
	    var avalues = a._values;
	    var aindex = a._index;
	    var aptr = a._ptr;
	    var asize = a._size;
	    var adt = a._datatype;
	    // sparse matrix arrays
	    var bvalues = b._values;
	    var bindex = b._index;
	    var bptr = b._ptr;
	    var bsize = b._size;
	    var bdt = b._datatype;

	    // validate dimensions
	    if (asize.length !== bsize.length) throw new DimensionError(asize.length, bsize.length);

	    // check rows & columns
	    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) throw new RangeError('Dimension mismatch. Matrix A (' + asize + ') must match Matrix B (' + bsize + ')');

	    // rows & columns
	    var rows = asize[0];
	    var columns = asize[1];

	    // datatype
	    var dt;
	    // equal signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;
	    // callback signature to use
	    var cf = callback;

	    // process data types
	    if (typeof adt === 'string' && adt === bdt) {
	      // datatype
	      dt = adt;
	      // find signature that matches (dt, dt)
	      eq = typed.find(equalScalar, [dt, dt]);
	      // convert 0 to the same datatype
	      zero = typed.convert(0, dt);
	      // callback
	      cf = typed.find(callback, [dt, dt]);
	    }

	    // result arrays
	    var cvalues = avalues && bvalues ? [] : undefined;
	    var cindex = [];
	    var cptr = [];
	    // matrix
	    var c = new SparseMatrix({
	      values: cvalues,
	      index: cindex,
	      ptr: cptr,
	      size: [rows, columns],
	      datatype: dt
	    });

	    // workspace
	    var xa = avalues && bvalues ? [] : undefined;
	    var xb = avalues && bvalues ? [] : undefined;
	    // marks indicating we have a value in x for a given column
	    var wa = [];
	    var wb = [];

	    // vars 
	    var i, j, k, k0, k1;

	    // loop columns
	    for (j = 0; j < columns; j++) {
	      // update cptr
	      cptr[j] = cindex.length;
	      // columns mark
	      var mark = j + 1;
	      // loop A(:,j)
	      for (k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
	        // row
	        i = aindex[k];
	        // update c
	        cindex.push(i);
	        // update workspace
	        wa[i] = mark;
	        // check we need to process values
	        if (xa) xa[i] = avalues[k];
	      }
	      // loop B(:,j)
	      for (k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
	        // row
	        i = bindex[k];
	        // check row exists in A
	        if (wa[i] === mark) {
	          // update record in xa @ i
	          if (xa) {
	            // invoke callback
	            var v = cf(xa[i], bvalues[k]);
	            // check for zero
	            if (!eq(v, zero)) {
	              // update workspace
	              xa[i] = v;
	            } else {
	              // remove mark (index will be removed later)
	              wa[i] = null;
	            }
	          }
	        } else {
	          // update c
	          cindex.push(i);
	          // update workspace
	          wb[i] = mark;
	          // check we need to process values
	          if (xb) xb[i] = bvalues[k];
	        }
	      }
	      // check we need to process values (non pattern matrix)
	      if (xa && xb) {
	        // initialize first index in j
	        k = cptr[j];
	        // loop index in j
	        while (k < cindex.length) {
	          // row
	          i = cindex[k];
	          // check workspace has value @ i
	          if (wa[i] === mark) {
	            // push value (Aij != 0 || (Aij != 0 && Bij != 0))
	            cvalues[k] = xa[i];
	            // increment pointer
	            k++;
	          } else if (wb[i] === mark) {
	            // push value (bij != 0)
	            cvalues[k] = xb[i];
	            // increment pointer
	            k++;
	          } else {
	            // remove index @ k
	            cindex.splice(k, 1);
	          }
	        }
	      }
	    }
	    // update cptr
	    cptr[columns] = cindex.length;

	    // return sparse matrix
	    return c;
	  };

	  return algorithm04;
	}

	exports.name = 'algorithm04';
	exports.factory = factory;

/***/ }),
/* 49 */
/***/ (function(module, exports) {

	'use strict';

	function factory(type, config, load, typed) {

	  var DenseMatrix = type.DenseMatrix;

	  /**
	   * Iterates over SparseMatrix S nonzero items and invokes the callback function f(Sij, b). 
	   * Callback function invoked NZ times (number of nonzero items in S).
	   *
	   *
	   *          ┌  f(Sij, b)  ; S(i,j) !== 0
	   * C(i,j) = ┤  
	   *          └  b          ; otherwise
	   *
	   *
	   * @param {Matrix}   s                 The SparseMatrix instance (S)
	   * @param {Scalar}   b                 The Scalar value
	   * @param {Function} callback          The f(Aij,b) operation to invoke
	   * @param {boolean}  inverse           A true value indicates callback should be invoked f(b,Sij)
	   *
	   * @return {Matrix}                    DenseMatrix (C)
	   *
	   * https://github.com/josdejong/mathjs/pull/346#issuecomment-97626813
	   */
	  var algorithm10 = function (s, b, callback, inverse) {
	    // sparse matrix arrays
	    var avalues = s._values;
	    var aindex = s._index;
	    var aptr = s._ptr;
	    var asize = s._size;
	    var adt = s._datatype;

	    // sparse matrix cannot be a Pattern matrix
	    if (!avalues) throw new Error('Cannot perform operation on Pattern Sparse Matrix and Scalar value');

	    // rows & columns
	    var rows = asize[0];
	    var columns = asize[1];

	    // datatype
	    var dt;
	    // callback signature to use
	    var cf = callback;

	    // process data types
	    if (typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // convert b to the same datatype
	      b = typed.convert(b, dt);
	      // callback
	      cf = typed.find(callback, [dt, dt]);
	    }

	    // result arrays
	    var cdata = [];
	    // matrix
	    var c = new DenseMatrix({
	      data: cdata,
	      size: [rows, columns],
	      datatype: dt
	    });

	    // workspaces
	    var x = [];
	    // marks indicating we have a value in x for a given column
	    var w = [];

	    // loop columns
	    for (var j = 0; j < columns; j++) {
	      // columns mark
	      var mark = j + 1;
	      // values in j
	      for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
	        // row
	        var r = aindex[k];
	        // update workspace
	        x[r] = avalues[k];
	        w[r] = mark;
	      }
	      // loop rows
	      for (var i = 0; i < rows; i++) {
	        // initialize C on first column
	        if (j === 0) {
	          // create row array
	          cdata[i] = [];
	        }
	        // check sparse matrix has a value @ i,j
	        if (w[i] === mark) {
	          // invoke callback, update C
	          cdata[i][j] = inverse ? cf(b, x[i]) : cf(x[i], b);
	        } else {
	          // dense matrix value @ i, j
	          cdata[i][j] = b;
	        }
	      }
	    }

	    // return sparse matrix
	    return c;
	  };

	  return algorithm10;
	}

	exports.name = 'algorithm10';
	exports.factory = factory;

/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(28);
	var DimensionError = __webpack_require__(33);

	var string = util.string,
	    isString = string.isString;

	function factory(type, config, load, typed) {

	  var DenseMatrix = type.DenseMatrix;

	  /**
	   * Iterates over DenseMatrix items and invokes the callback function f(Aij..z, Bij..z). 
	   * Callback function invoked MxN times.
	   *
	   * C(i,j,...z) = f(Aij..z, Bij..z)
	   *
	   * @param {Matrix}   a                 The DenseMatrix instance (A)
	   * @param {Matrix}   b                 The DenseMatrix instance (B)
	   * @param {Function} callback          The f(Aij..z,Bij..z) operation to invoke
	   *
	   * @return {Matrix}                    DenseMatrix (C)
	   *
	   * https://github.com/josdejong/mathjs/pull/346#issuecomment-97658658
	   */
	  var algorithm13 = function (a, b, callback) {
	    // a arrays
	    var adata = a._data;
	    var asize = a._size;
	    var adt = a._datatype;
	    // b arrays
	    var bdata = b._data;
	    var bsize = b._size;
	    var bdt = b._datatype;
	    // c arrays
	    var csize = [];

	    // validate dimensions
	    if (asize.length !== bsize.length) throw new DimensionError(asize.length, bsize.length);

	    // validate each one of the dimension sizes
	    for (var s = 0; s < asize.length; s++) {
	      // must match
	      if (asize[s] !== bsize[s]) throw new RangeError('Dimension mismatch. Matrix A (' + asize + ') must match Matrix B (' + bsize + ')');
	      // update dimension in c
	      csize[s] = asize[s];
	    }

	    // datatype
	    var dt;
	    // callback signature to use
	    var cf = callback;

	    // process data types
	    if (typeof adt === 'string' && adt === bdt) {
	      // datatype
	      dt = adt;
	      // convert b to the same datatype
	      b = typed.convert(b, dt);
	      // callback
	      cf = typed.find(callback, [dt, dt]);
	    }

	    // populate cdata, iterate through dimensions
	    var cdata = csize.length > 0 ? _iterate(cf, 0, csize, csize[0], adata, bdata) : [];

	    // c matrix
	    return new DenseMatrix({
	      data: cdata,
	      size: csize,
	      datatype: dt
	    });
	  };

	  // recursive function
	  var _iterate = function (f, level, s, n, av, bv) {
	    // initialize array for this level
	    var cv = [];
	    // check we reach the last level
	    if (level === s.length - 1) {
	      // loop arrays in last level
	      for (var i = 0; i < n; i++) {
	        // invoke callback and store value
	        cv[i] = f(av[i], bv[i]);
	      }
	    } else {
	      // iterate current level
	      for (var j = 0; j < n; j++) {
	        // iterate next level
	        cv[j] = _iterate(f, level + 1, s, s[level + 1], av[j], bv[j]);
	      }
	    }
	    return cv;
	  };

	  return algorithm13;
	}

	exports.name = 'algorithm13';
	exports.factory = factory;

/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var clone = __webpack_require__(15).clone;

	function factory(type, config, load, typed) {

	  var DenseMatrix = type.DenseMatrix;

	  /**
	   * Iterates over DenseMatrix items and invokes the callback function f(Aij..z, b). 
	   * Callback function invoked MxN times.
	   *
	   * C(i,j,...z) = f(Aij..z, b)
	   *
	   * @param {Matrix}   a                 The DenseMatrix instance (A)
	   * @param {Scalar}   b                 The Scalar value
	   * @param {Function} callback          The f(Aij..z,b) operation to invoke
	   * @param {boolean}  inverse           A true value indicates callback should be invoked f(b,Aij..z)
	   *
	   * @return {Matrix}                    DenseMatrix (C)
	   *
	   * https://github.com/josdejong/mathjs/pull/346#issuecomment-97659042
	   */
	  var algorithm14 = function (a, b, callback, inverse) {
	    // a arrays
	    var adata = a._data;
	    var asize = a._size;
	    var adt = a._datatype;

	    // datatype
	    var dt;
	    // callback signature to use
	    var cf = callback;

	    // process data types
	    if (typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // convert b to the same datatype
	      b = typed.convert(b, dt);
	      // callback
	      cf = typed.find(callback, [dt, dt]);
	    }

	    // populate cdata, iterate through dimensions
	    var cdata = asize.length > 0 ? _iterate(cf, 0, asize, asize[0], adata, b, inverse) : [];

	    // c matrix
	    return new DenseMatrix({
	      data: cdata,
	      size: clone(asize),
	      datatype: dt
	    });
	  };

	  // recursive function
	  var _iterate = function (f, level, s, n, av, bv, inverse) {
	    // initialize array for this level
	    var cv = [];
	    // check we reach the last level
	    if (level === s.length - 1) {
	      // loop arrays in last level
	      for (var i = 0; i < n; i++) {
	        // invoke callback and store value
	        cv[i] = inverse ? f(bv, av[i]) : f(av[i], bv);
	      }
	    } else {
	      // iterate current level
	      for (var j = 0; j < n; j++) {
	        // iterate next level
	        cv[j] = _iterate(f, level + 1, s, s[level + 1], av[j], bv, inverse);
	      }
	    }
	    return cv;
	  };

	  return algorithm14;
	}

	exports.name = 'algorithm14';
	exports.factory = factory;

/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	function factory(type, config, load, typed) {

	  var smaller = load(__webpack_require__(53));
	  var larger = load(__webpack_require__(57));

	  var oneOverLogPhi = 1.0 / Math.log((1.0 + Math.sqrt(5.0)) / 2.0);

	  /**
	   * Fibonacci Heap implementation, used interally for Matrix math.
	   * @class FibonacciHeap
	   * @constructor FibonacciHeap
	   */
	  function FibonacciHeap() {
	    if (!(this instanceof FibonacciHeap)) throw new SyntaxError('Constructor must be called with the new operator');

	    // initialize fields
	    this._minimum = null;
	    this._size = 0;
	  }

	  /**
	   * Attach type information
	   */
	  FibonacciHeap.prototype.type = 'FibonacciHeap';
	  FibonacciHeap.prototype.isFibonacciHeap = true;

	  /**
	   * Inserts a new data element into the heap. No heap consolidation is
	   * performed at this time, the new node is simply inserted into the root
	   * list of this heap. Running time: O(1) actual.
	   * @memberof FibonacciHeap
	   */
	  FibonacciHeap.prototype.insert = function (key, value) {
	    // create node
	    var node = {
	      key: key,
	      value: value,
	      degree: 0
	    };
	    // check we have a node in the minimum
	    if (this._minimum) {
	      // minimum node
	      var minimum = this._minimum;
	      // update left & right of node
	      node.left = minimum;
	      node.right = minimum.right;
	      minimum.right = node;
	      node.right.left = node;
	      // update minimum node in heap if needed
	      if (smaller(key, minimum.key)) {
	        // node has a smaller key, use it as minimum
	        this._minimum = node;
	      }
	    } else {
	      // set left & right
	      node.left = node;
	      node.right = node;
	      // this is the first node
	      this._minimum = node;
	    }
	    // increment number of nodes in heap
	    this._size++;
	    // return node
	    return node;
	  };

	  /**
	   * Returns the number of nodes in heap. Running time: O(1) actual.
	   * @memberof FibonacciHeap
	   */
	  FibonacciHeap.prototype.size = function () {
	    return this._size;
	  };

	  /**
	   * Removes all elements from this heap.
	   * @memberof FibonacciHeap
	   */
	  FibonacciHeap.prototype.clear = function () {
	    this._minimum = null;
	    this._size = 0;
	  };

	  /**
	   * Returns true if the heap is empty, otherwise false.
	   * @memberof FibonacciHeap
	   */
	  FibonacciHeap.prototype.isEmpty = function () {
	    return this._size === 0;
	  };

	  /**
	   * Extracts the node with minimum key from heap. Amortized running 
	   * time: O(log n).
	   * @memberof FibonacciHeap
	   */
	  FibonacciHeap.prototype.extractMinimum = function () {
	    // node to remove
	    var node = this._minimum;
	    // check we have a minimum
	    if (node === null) return node;
	    // current minimum
	    var minimum = this._minimum;
	    // get number of children
	    var numberOfChildren = node.degree;
	    // pointer to the first child
	    var x = node.child;
	    // for each child of node do...
	    while (numberOfChildren > 0) {
	      // store node in right side
	      var tempRight = x.right;
	      // remove x from child list
	      x.left.right = x.right;
	      x.right.left = x.left;
	      // add x to root list of heap
	      x.left = minimum;
	      x.right = minimum.right;
	      minimum.right = x;
	      x.right.left = x;
	      // set Parent[x] to null
	      x.parent = null;
	      x = tempRight;
	      numberOfChildren--;
	    }
	    // remove node from root list of heap
	    node.left.right = node.right;
	    node.right.left = node.left;
	    // update minimum
	    if (node == node.right) {
	      // empty
	      minimum = null;
	    } else {
	      // update minimum
	      minimum = node.right;
	      // we need to update the pointer to the root with minimum key
	      minimum = _findMinimumNode(minimum, this._size);
	    }
	    // decrement size of heap
	    this._size--;
	    // update minimum
	    this._minimum = minimum;
	    // return node
	    return node;
	  };

	  /**
	   * Removes a node from the heap given the reference to the node. The trees
	   * in the heap will be consolidated, if necessary. This operation may fail
	   * to remove the correct element if there are nodes with key value -Infinity.
	   * Running time: O(log n) amortized.
	   * @memberof FibonacciHeap
	   */
	  FibonacciHeap.prototype.remove = function (node) {
	    // decrease key value
	    this._minimum = _decreaseKey(this._minimum, node, -1);
	    // remove the smallest
	    this.extractMinimum();
	  };

	  /**
	   * Decreases the key value for a heap node, given the new value to take on.
	   * The structure of the heap may be changed and will not be consolidated. 
	   * Running time: O(1) amortized.
	   * @memberof FibonacciHeap
	   */
	  var _decreaseKey = function (minimum, node, key) {
	    // set node key
	    node.key = key;
	    // get parent node
	    var parent = node.parent;
	    if (parent && smaller(node.key, parent.key)) {
	      // remove node from parent
	      _cut(minimum, node, parent);
	      // remove all nodes from parent to the root parent
	      _cascadingCut(minimum, parent);
	    }
	    // update minimum node if needed
	    if (smaller(node.key, minimum.key)) minimum = node;
	    // return minimum
	    return minimum;
	  };

	  /**
	   * The reverse of the link operation: removes node from the child list of parent.
	   * This method assumes that min is non-null. Running time: O(1).
	   * @memberof FibonacciHeap
	   */
	  var _cut = function (minimum, node, parent) {
	    // remove node from parent children and decrement Degree[parent]
	    node.left.right = node.right;
	    node.right.left = node.left;
	    parent.degree--;
	    // reset y.child if necessary
	    if (parent.child == node) parent.child = node.right;
	    // remove child if degree is 0
	    if (parent.degree === 0) parent.child = null;
	    // add node to root list of heap
	    node.left = minimum;
	    node.right = minimum.right;
	    minimum.right = node;
	    node.right.left = node;
	    // set parent[node] to null
	    node.parent = null;
	    // set mark[node] to false
	    node.mark = false;
	  };

	  /**
	   * Performs a cascading cut operation. This cuts node from its parent and then
	   * does the same for its parent, and so on up the tree.
	   * Running time: O(log n); O(1) excluding the recursion.
	   * @memberof FibonacciHeap
	   */
	  var _cascadingCut = function (minimum, node) {
	    // store parent node
	    var parent = node.parent;
	    // if there's a parent...
	    if (!parent) return;
	    // if node is unmarked, set it marked
	    if (!node.mark) {
	      node.mark = true;
	    } else {
	      // it's marked, cut it from parent
	      _cut(minimum, node, parent);
	      // cut its parent as well
	      _cascadingCut(parent);
	    }
	  };

	  /**
	   * Make the first node a child of the second one. Running time: O(1) actual.
	   * @memberof FibonacciHeap
	   */
	  var _linkNodes = function (node, parent) {
	    // remove node from root list of heap
	    node.left.right = node.right;
	    node.right.left = node.left;
	    // make node a Child of parent
	    node.parent = parent;
	    if (!parent.child) {
	      parent.child = node;
	      node.right = node;
	      node.left = node;
	    } else {
	      node.left = parent.child;
	      node.right = parent.child.right;
	      parent.child.right = node;
	      node.right.left = node;
	    }
	    // increase degree[parent]
	    parent.degree++;
	    // set mark[node] false
	    node.mark = false;
	  };

	  var _findMinimumNode = function (minimum, size) {
	    // to find trees of the same degree efficiently we use an array of length O(log n) in which we keep a pointer to one root of each degree
	    var arraySize = Math.floor(Math.log(size) * oneOverLogPhi) + 1;
	    // create list with initial capacity
	    var array = new Array(arraySize);
	    // find the number of root nodes.
	    var numRoots = 0;
	    var x = minimum;
	    if (x) {
	      numRoots++;
	      x = x.right;
	      while (x !== minimum) {
	        numRoots++;
	        x = x.right;
	      }
	    }
	    // vars
	    var y;
	    // For each node in root list do...
	    while (numRoots > 0) {
	      // access this node's degree..
	      var d = x.degree;
	      // get next node
	      var next = x.right;
	      // check if there is a node already in array with the same degree
	      while (true) {
	        // get node with the same degree is any
	        y = array[d];
	        if (!y) break;
	        // make one node with the same degree a child of the other, do this based on the key value.
	        if (larger(x.key, y.key)) {
	          var temp = y;
	          y = x;
	          x = temp;
	        }
	        // make y a child of x
	        _linkNodes(y, x);
	        // we have handled this degree, go to next one.
	        array[d] = null;
	        d++;
	      }
	      // save this node for later when we might encounter another of the same degree.
	      array[d] = x;
	      // move forward through list.
	      x = next;
	      numRoots--;
	    }
	    // Set min to null (effectively losing the root list) and reconstruct the root list from the array entries in array[].
	    minimum = null;
	    // loop nodes in array
	    for (var i = 0; i < arraySize; i++) {
	      // get current node
	      y = array[i];
	      if (!y) continue;
	      // check if we have a linked list
	      if (minimum) {
	        // First remove node from root list.
	        y.left.right = y.right;
	        y.right.left = y.left;
	        // now add to root list, again.
	        y.left = minimum;
	        y.right = minimum.right;
	        minimum.right = y;
	        y.right.left = y;
	        // check if this is a new min.
	        if (smaller(y.key, minimum.key)) minimum = y;
	      } else minimum = y;
	    }
	    return minimum;
	  };

	  return FibonacciHeap;
	}

	exports.name = 'FibonacciHeap';
	exports.path = 'type';
	exports.factory = factory;

/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var nearlyEqual = __webpack_require__(19).nearlyEqual;
	var bigNearlyEqual = __webpack_require__(41);

	function factory(type, config, load, typed) {

	  var matrix = load(__webpack_require__(44));

	  var algorithm03 = load(__webpack_require__(54));
	  var algorithm07 = load(__webpack_require__(55));
	  var algorithm12 = load(__webpack_require__(56));
	  var algorithm13 = load(__webpack_require__(50));
	  var algorithm14 = load(__webpack_require__(51));

	  var latex = __webpack_require__(46);

	  /**
	   * Test whether value x is smaller than y.
	   *
	   * The function returns true when x is smaller than y and the relative
	   * difference between x and y is smaller than the configured epsilon. The
	   * function cannot be used to compare values smaller than approximately 2.22e-16.
	   *
	   * For matrices, the function is evaluated element wise.
	   *
	   * Syntax:
	   *
	   *    math.smaller(x, y)
	   *
	   * Examples:
	   *
	   *    math.smaller(2, 3);            // returns true
	   *    math.smaller(5, 2 * 2);        // returns false
	   *
	   *    var a = math.unit('5 cm');
	   *    var b = math.unit('2 inch');
	   *    math.smaller(a, b);            // returns true
	   *
	   * See also:
	   *
	   *    equal, unequal, smallerEq, smaller, smallerEq, compare
	   *
	   * @param  {number | BigNumber | Fraction | boolean | Unit | string | Array | Matrix} x First value to compare
	   * @param  {number | BigNumber | Fraction | boolean | Unit | string | Array | Matrix} y Second value to compare
	   * @return {boolean | Array | Matrix} Returns true when the x is smaller than y, else returns false
	   */
	  var smaller = typed('smaller', {

	    'boolean, boolean': function (x, y) {
	      return x < y;
	    },

	    'number, number': function (x, y) {
	      return x < y && !nearlyEqual(x, y, config.epsilon);
	    },

	    'BigNumber, BigNumber': function (x, y) {
	      return x.lt(y) && !bigNearlyEqual(x, y, config.epsilon);
	    },

	    'Fraction, Fraction': function (x, y) {
	      return x.compare(y) === -1;
	    },

	    'Complex, Complex': function (x, y) {
	      throw new TypeError('No ordering relation is defined for complex numbers');
	    },

	    'Unit, Unit': function (x, y) {
	      if (!x.equalBase(y)) {
	        throw new Error('Cannot compare units with different base');
	      }
	      return smaller(x.value, y.value);
	    },

	    'string, string': function (x, y) {
	      return x < y;
	    },

	    'Matrix, Matrix': function (x, y) {
	      // result
	      var c;

	      // process matrix storage
	      switch (x.storage()) {
	        case 'sparse':
	          switch (y.storage()) {
	            case 'sparse':
	              // sparse + sparse
	              c = algorithm07(x, y, smaller);
	              break;
	            default:
	              // sparse + dense
	              c = algorithm03(y, x, smaller, true);
	              break;
	          }
	          break;
	        default:
	          switch (y.storage()) {
	            case 'sparse':
	              // dense + sparse
	              c = algorithm03(x, y, smaller, false);
	              break;
	            default:
	              // dense + dense
	              c = algorithm13(x, y, smaller);
	              break;
	          }
	          break;
	      }
	      return c;
	    },

	    'Array, Array': function (x, y) {
	      // use matrix implementation
	      return smaller(matrix(x), matrix(y)).valueOf();
	    },

	    'Array, Matrix': function (x, y) {
	      // use matrix implementation
	      return smaller(matrix(x), y);
	    },

	    'Matrix, Array': function (x, y) {
	      // use matrix implementation
	      return smaller(x, matrix(y));
	    },

	    'Matrix, any': function (x, y) {
	      // result
	      var c;
	      // check storage format
	      switch (x.storage()) {
	        case 'sparse':
	          c = algorithm12(x, y, smaller, false);
	          break;
	        default:
	          c = algorithm14(x, y, smaller, false);
	          break;
	      }
	      return c;
	    },

	    'any, Matrix': function (x, y) {
	      // result
	      var c;
	      // check storage format
	      switch (y.storage()) {
	        case 'sparse':
	          c = algorithm12(y, x, smaller, true);
	          break;
	        default:
	          c = algorithm14(y, x, smaller, true);
	          break;
	      }
	      return c;
	    },

	    'Array, any': function (x, y) {
	      // use matrix implementation
	      return algorithm14(matrix(x), y, smaller, false).valueOf();
	    },

	    'any, Array': function (x, y) {
	      // use matrix implementation
	      return algorithm14(matrix(y), x, smaller, true).valueOf();
	    }
	  });

	  smaller.toTex = {
	    2: '\\left(${args[0]}' + latex.operators['smaller'] + '${args[1]}\\right)'
	  };

	  return smaller;
	}

	exports.name = 'smaller';
	exports.factory = factory;

/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var DimensionError = __webpack_require__(33);

	function factory(type, config, load, typed) {

	  var DenseMatrix = type.DenseMatrix;

	  /**
	   * Iterates over SparseMatrix items and invokes the callback function f(Dij, Sij).
	   * Callback function invoked M*N times.
	   *
	   *
	   *          ┌  f(Dij, Sij)  ; S(i,j) !== 0
	   * C(i,j) = ┤
	   *          └  f(Dij, 0)    ; otherwise
	   *
	   *
	   * @param {Matrix}   denseMatrix       The DenseMatrix instance (D)
	   * @param {Matrix}   sparseMatrix      The SparseMatrix instance (C)
	   * @param {Function} callback          The f(Dij,Sij) operation to invoke, where Dij = DenseMatrix(i,j) and Sij = SparseMatrix(i,j)
	   * @param {boolean}  inverse           A true value indicates callback should be invoked f(Sij,Dij)
	   *
	   * @return {Matrix}                    DenseMatrix (C)
	   *
	   * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97477571
	   */
	  var algorithm03 = function (denseMatrix, sparseMatrix, callback, inverse) {
	    // dense matrix arrays
	    var adata = denseMatrix._data;
	    var asize = denseMatrix._size;
	    var adt = denseMatrix._datatype;
	    // sparse matrix arrays
	    var bvalues = sparseMatrix._values;
	    var bindex = sparseMatrix._index;
	    var bptr = sparseMatrix._ptr;
	    var bsize = sparseMatrix._size;
	    var bdt = sparseMatrix._datatype;

	    // validate dimensions
	    if (asize.length !== bsize.length) throw new DimensionError(asize.length, bsize.length);

	    // check rows & columns
	    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) throw new RangeError('Dimension mismatch. Matrix A (' + asize + ') must match Matrix B (' + bsize + ')');

	    // sparse matrix cannot be a Pattern matrix
	    if (!bvalues) throw new Error('Cannot perform operation on Dense Matrix and Pattern Sparse Matrix');

	    // rows & columns
	    var rows = asize[0];
	    var columns = asize[1];

	    // datatype
	    var dt;
	    // zero value
	    var zero = 0;
	    // callback signature to use
	    var cf = callback;

	    // process data types
	    if (typeof adt === 'string' && adt === bdt) {
	      // datatype
	      dt = adt;
	      // convert 0 to the same datatype
	      zero = typed.convert(0, dt);
	      // callback
	      cf = typed.find(callback, [dt, dt]);
	    }

	    // result (DenseMatrix)
	    var cdata = [];

	    // initialize dense matrix
	    for (var z = 0; z < rows; z++) {
	      // initialize row
	      cdata[z] = [];
	    }

	    // workspace
	    var x = [];
	    // marks indicating we have a value in x for a given column
	    var w = [];

	    // loop columns in b
	    for (var j = 0; j < columns; j++) {
	      // column mark
	      var mark = j + 1;
	      // values in column j
	      for (var k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
	        // row
	        var i = bindex[k];
	        // update workspace
	        x[i] = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k]);
	        w[i] = mark;
	      }
	      // process workspace
	      for (var y = 0; y < rows; y++) {
	        // check we have a calculated value for current row
	        if (w[y] === mark) {
	          // use calculated value
	          cdata[y][j] = x[y];
	        } else {
	          // calculate value
	          cdata[y][j] = inverse ? cf(zero, adata[y][j]) : cf(adata[y][j], zero);
	        }
	      }
	    }

	    // return dense matrix
	    return new DenseMatrix({
	      data: cdata,
	      size: [rows, columns],
	      datatype: dt
	    });
	  };

	  return algorithm03;
	}

	exports.name = 'algorithm03';
	exports.factory = factory;

/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var DimensionError = __webpack_require__(33);

	function factory(type, config, load, typed) {

	  var DenseMatrix = type.DenseMatrix;

	  /**
	   * Iterates over SparseMatrix A and SparseMatrix B items (zero and nonzero) and invokes the callback function f(Aij, Bij). 
	   * Callback function invoked MxN times.
	   *
	   * C(i,j) = f(Aij, Bij)
	   *
	   * @param {Matrix}   a                 The SparseMatrix instance (A)
	   * @param {Matrix}   b                 The SparseMatrix instance (B)
	   * @param {Function} callback          The f(Aij,Bij) operation to invoke
	   *
	   * @return {Matrix}                    DenseMatrix (C)
	   *
	   * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97620294
	   */
	  var algorithm07 = function (a, b, callback) {
	    // sparse matrix arrays
	    var asize = a._size;
	    var adt = a._datatype;
	    // sparse matrix arrays
	    var bsize = b._size;
	    var bdt = b._datatype;

	    // validate dimensions
	    if (asize.length !== bsize.length) throw new DimensionError(asize.length, bsize.length);

	    // check rows & columns
	    if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) throw new RangeError('Dimension mismatch. Matrix A (' + asize + ') must match Matrix B (' + bsize + ')');

	    // rows & columns
	    var rows = asize[0];
	    var columns = asize[1];

	    // datatype
	    var dt;
	    // zero value
	    var zero = 0;
	    // callback signature to use
	    var cf = callback;

	    // process data types
	    if (typeof adt === 'string' && adt === bdt) {
	      // datatype
	      dt = adt;
	      // convert 0 to the same datatype
	      zero = typed.convert(0, dt);
	      // callback
	      cf = typed.find(callback, [dt, dt]);
	    }

	    // vars
	    var i, j;

	    // result arrays
	    var cdata = [];
	    // initialize c
	    for (i = 0; i < rows; i++) cdata[i] = [];

	    // matrix
	    var c = new DenseMatrix({
	      data: cdata,
	      size: [rows, columns],
	      datatype: dt
	    });

	    // workspaces
	    var xa = [];
	    var xb = [];
	    // marks indicating we have a value in x for a given column
	    var wa = [];
	    var wb = [];

	    // loop columns
	    for (j = 0; j < columns; j++) {
	      // columns mark
	      var mark = j + 1;
	      // scatter the values of A(:,j) into workspace
	      _scatter(a, j, wa, xa, mark);
	      // scatter the values of B(:,j) into workspace
	      _scatter(b, j, wb, xb, mark);
	      // loop rows
	      for (i = 0; i < rows; i++) {
	        // matrix values @ i,j
	        var va = wa[i] === mark ? xa[i] : zero;
	        var vb = wb[i] === mark ? xb[i] : zero;
	        // invoke callback
	        cdata[i][j] = cf(va, vb);
	      }
	    }

	    // return sparse matrix
	    return c;
	  };

	  var _scatter = function (m, j, w, x, mark) {
	    // a arrays
	    var values = m._values;
	    var index = m._index;
	    var ptr = m._ptr;
	    // loop values in column j
	    for (var k = ptr[j], k1 = ptr[j + 1]; k < k1; k++) {
	      // row
	      var i = index[k];
	      // update workspace
	      w[i] = mark;
	      x[i] = values[k];
	    }
	  };

	  return algorithm07;
	}

	exports.name = 'algorithm07';
	exports.factory = factory;

/***/ }),
/* 56 */
/***/ (function(module, exports) {

	'use strict';

	function factory(type, config, load, typed) {

	  var DenseMatrix = type.DenseMatrix;

	  /**
	   * Iterates over SparseMatrix S nonzero items and invokes the callback function f(Sij, b). 
	   * Callback function invoked MxN times.
	   *
	   *
	   *          ┌  f(Sij, b)  ; S(i,j) !== 0
	   * C(i,j) = ┤  
	   *          └  f(0, b)    ; otherwise
	   *
	   *
	   * @param {Matrix}   s                 The SparseMatrix instance (S)
	   * @param {Scalar}   b                 The Scalar value
	   * @param {Function} callback          The f(Aij,b) operation to invoke
	   * @param {boolean}  inverse           A true value indicates callback should be invoked f(b,Sij)
	   *
	   * @return {Matrix}                    DenseMatrix (C)
	   *
	   * https://github.com/josdejong/mathjs/pull/346#issuecomment-97626813
	   */
	  var algorithm12 = function (s, b, callback, inverse) {
	    // sparse matrix arrays
	    var avalues = s._values;
	    var aindex = s._index;
	    var aptr = s._ptr;
	    var asize = s._size;
	    var adt = s._datatype;

	    // sparse matrix cannot be a Pattern matrix
	    if (!avalues) throw new Error('Cannot perform operation on Pattern Sparse Matrix and Scalar value');

	    // rows & columns
	    var rows = asize[0];
	    var columns = asize[1];

	    // datatype
	    var dt;
	    // callback signature to use
	    var cf = callback;

	    // process data types
	    if (typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // convert b to the same datatype
	      b = typed.convert(b, dt);
	      // callback
	      cf = typed.find(callback, [dt, dt]);
	    }

	    // result arrays
	    var cdata = [];
	    // matrix
	    var c = new DenseMatrix({
	      data: cdata,
	      size: [rows, columns],
	      datatype: dt
	    });

	    // workspaces
	    var x = [];
	    // marks indicating we have a value in x for a given column
	    var w = [];

	    // loop columns
	    for (var j = 0; j < columns; j++) {
	      // columns mark
	      var mark = j + 1;
	      // values in j
	      for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
	        // row
	        var r = aindex[k];
	        // update workspace
	        x[r] = avalues[k];
	        w[r] = mark;
	      }
	      // loop rows
	      for (var i = 0; i < rows; i++) {
	        // initialize C on first column
	        if (j === 0) {
	          // create row array
	          cdata[i] = [];
	        }
	        // check sparse matrix has a value @ i,j
	        if (w[i] === mark) {
	          // invoke callback, update C
	          cdata[i][j] = inverse ? cf(b, x[i]) : cf(x[i], b);
	        } else {
	          // dense matrix value @ i, j
	          cdata[i][j] = inverse ? cf(b, 0) : cf(0, b);
	        }
	      }
	    }

	    // return sparse matrix
	    return c;
	  };

	  return algorithm12;
	}

	exports.name = 'algorithm12';
	exports.factory = factory;

/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var nearlyEqual = __webpack_require__(19).nearlyEqual;
	var bigNearlyEqual = __webpack_require__(41);

	function factory(type, config, load, typed) {

	  var matrix = load(__webpack_require__(44));

	  var algorithm03 = load(__webpack_require__(54));
	  var algorithm07 = load(__webpack_require__(55));
	  var algorithm12 = load(__webpack_require__(56));
	  var algorithm13 = load(__webpack_require__(50));
	  var algorithm14 = load(__webpack_require__(51));

	  var latex = __webpack_require__(46);

	  /**
	   * Test whether value x is larger than y.
	   *
	   * The function returns true when x is larger than y and the relative
	   * difference between x and y is larger than the configured epsilon. The
	   * function cannot be used to compare values smaller than approximately 2.22e-16.
	   *
	   * For matrices, the function is evaluated element wise.
	   *
	   * Syntax:
	   *
	   *    math.larger(x, y)
	   *
	   * Examples:
	   *
	   *    math.larger(2, 3);             // returns false
	   *    math.larger(5, 2 + 2);         // returns true
	   *
	   *    var a = math.unit('5 cm');
	   *    var b = math.unit('2 inch');
	   *    math.larger(a, b);             // returns false
	   *
	   * See also:
	   *
	   *    equal, unequal, smaller, smallerEq, largerEq, compare
	   *
	   * @param  {number | BigNumber | Fraction | boolean | Unit | string | Array | Matrix} x First value to compare
	   * @param  {number | BigNumber | Fraction | boolean | Unit | string | Array | Matrix} y Second value to compare
	   * @return {boolean | Array | Matrix} Returns true when the x is larger than y, else returns false
	   */
	  var larger = typed('larger', {

	    'boolean, boolean': function (x, y) {
	      return x > y;
	    },

	    'number, number': function (x, y) {
	      return x > y && !nearlyEqual(x, y, config.epsilon);
	    },

	    'BigNumber, BigNumber': function (x, y) {
	      return x.gt(y) && !bigNearlyEqual(x, y, config.epsilon);
	    },

	    'Fraction, Fraction': function (x, y) {
	      return x.compare(y) === 1;
	    },

	    'Complex, Complex': function () {
	      throw new TypeError('No ordering relation is defined for complex numbers');
	    },

	    'Unit, Unit': function (x, y) {
	      if (!x.equalBase(y)) {
	        throw new Error('Cannot compare units with different base');
	      }
	      return larger(x.value, y.value);
	    },

	    'string, string': function (x, y) {
	      return x > y;
	    },

	    'Matrix, Matrix': function (x, y) {
	      // result
	      var c;

	      // process matrix storage
	      switch (x.storage()) {
	        case 'sparse':
	          switch (y.storage()) {
	            case 'sparse':
	              // sparse + sparse
	              c = algorithm07(x, y, larger);
	              break;
	            default:
	              // sparse + dense
	              c = algorithm03(y, x, larger, true);
	              break;
	          }
	          break;
	        default:
	          switch (y.storage()) {
	            case 'sparse':
	              // dense + sparse
	              c = algorithm03(x, y, larger, false);
	              break;
	            default:
	              // dense + dense
	              c = algorithm13(x, y, larger);
	              break;
	          }
	          break;
	      }
	      return c;
	    },

	    'Array, Array': function (x, y) {
	      // use matrix implementation
	      return larger(matrix(x), matrix(y)).valueOf();
	    },

	    'Array, Matrix': function (x, y) {
	      // use matrix implementation
	      return larger(matrix(x), y);
	    },

	    'Matrix, Array': function (x, y) {
	      // use matrix implementation
	      return larger(x, matrix(y));
	    },

	    'Matrix, any': function (x, y) {
	      // result
	      var c;
	      // check storage format
	      switch (x.storage()) {
	        case 'sparse':
	          c = algorithm12(x, y, larger, false);
	          break;
	        default:
	          c = algorithm14(x, y, larger, false);
	          break;
	      }
	      return c;
	    },

	    'any, Matrix': function (x, y) {
	      // result
	      var c;
	      // check storage format
	      switch (y.storage()) {
	        case 'sparse':
	          c = algorithm12(y, x, larger, true);
	          break;
	        default:
	          c = algorithm14(y, x, larger, true);
	          break;
	      }
	      return c;
	    },

	    'Array, any': function (x, y) {
	      // use matrix implementation
	      return algorithm14(matrix(x), y, larger, false).valueOf();
	    },

	    'any, Array': function (x, y) {
	      // use matrix implementation
	      return algorithm14(matrix(y), x, larger, true).valueOf();
	    }
	  });

	  larger.toTex = {
	    2: '\\left(${args[0]}' + latex.operators['larger'] + '${args[1]}\\right)'
	  };

	  return larger;
	}

	exports.name = 'larger';
	exports.factory = factory;

/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var util = __webpack_require__(28);

	var string = util.string;
	var object = util.object;

	var isArray = Array.isArray;
	var isString = string.isString;

	function factory(type, config, load) {

	  var DenseMatrix = load(__webpack_require__(37));

	  var smaller = load(__webpack_require__(53));

	  function ImmutableDenseMatrix(data, datatype) {
	    if (!(this instanceof ImmutableDenseMatrix)) throw new SyntaxError('Constructor must be called with the new operator');
	    if (datatype && !isString(datatype)) throw new Error('Invalid datatype: ' + datatype);

	    if (type.isMatrix(data) || isArray(data)) {
	      // use DenseMatrix implementation
	      var matrix = new DenseMatrix(data, datatype);
	      // internal structures
	      this._data = matrix._data;
	      this._size = matrix._size;
	      this._datatype = matrix._datatype;
	      this._min = null;
	      this._max = null;
	    } else if (data && isArray(data.data) && isArray(data.size)) {
	      // initialize fields from JSON representation
	      this._data = data.data;
	      this._size = data.size;
	      this._datatype = data.datatype;
	      this._min = typeof data.min !== 'undefined' ? data.min : null;
	      this._max = typeof data.max !== 'undefined' ? data.max : null;
	    } else if (data) {
	      // unsupported type
	      throw new TypeError('Unsupported type of data (' + util.types.type(data) + ')');
	    } else {
	      // nothing provided
	      this._data = [];
	      this._size = [0];
	      this._datatype = datatype;
	      this._min = null;
	      this._max = null;
	    }
	  }

	  ImmutableDenseMatrix.prototype = new DenseMatrix();

	  /**
	   * Attach type information
	   */
	  ImmutableDenseMatrix.prototype.type = 'ImmutableDenseMatrix';
	  ImmutableDenseMatrix.prototype.isImmutableDenseMatrix = true;

	  /**
	   * Get a subset of the matrix, or replace a subset of the matrix.
	   *
	   * Usage:
	   *     var subset = matrix.subset(index)               // retrieve subset
	   *     var value = matrix.subset(index, replacement)   // replace subset
	   *
	   * @param {Index} index
	   * @param {Array | ImmutableDenseMatrix | *} [replacement]
	   * @param {*} [defaultValue=0]      Default value, filled in on new entries when
	   *                                  the matrix is resized. If not provided,
	   *                                  new matrix elements will be filled with zeros.
	   */
	  ImmutableDenseMatrix.prototype.subset = function (index) {
	    switch (arguments.length) {
	      case 1:
	        // use base implementation
	        var m = DenseMatrix.prototype.subset.call(this, index);
	        // check result is a matrix
	        if (type.isMatrix(m)) {
	          // return immutable matrix
	          return new ImmutableDenseMatrix({
	            data: m._data,
	            size: m._size,
	            datatype: m._datatype
	          });
	        }
	        return m;

	      // intentional fall through
	      case 2:
	      case 3:
	        throw new Error('Cannot invoke set subset on an Immutable Matrix instance');

	      default:
	        throw new SyntaxError('Wrong number of arguments');
	    }
	  };

	  /**
	   * Replace a single element in the matrix.
	   * @param {Number[]} index   Zero-based index
	   * @param {*} value
	   * @param {*} [defaultValue]        Default value, filled in on new entries when
	   *                                  the matrix is resized. If not provided,
	   *                                  new matrix elements will be left undefined.
	   * @return {ImmutableDenseMatrix} self
	   */
	  ImmutableDenseMatrix.prototype.set = function () {
	    throw new Error('Cannot invoke set on an Immutable Matrix instance');
	  };

	  /**
	   * Resize the matrix to the given size. Returns a copy of the matrix when
	   * `copy=true`, otherwise return the matrix itself (resize in place).
	   *
	   * @param {Number[]} size           The new size the matrix should have.
	   * @param {*} [defaultValue=0]      Default value, filled in on new entries.
	   *                                  If not provided, the matrix elements will
	   *                                  be filled with zeros.
	   * @param {boolean} [copy]          Return a resized copy of the matrix
	   *
	   * @return {Matrix}                 The resized matrix
	   */
	  ImmutableDenseMatrix.prototype.resize = function () {
	    throw new Error('Cannot invoke resize on an Immutable Matrix instance');
	  };

	  /**
	   * Disallows reshaping in favor of immutability.
	   *
	   * @throws {Error} Operation not allowed
	   */
	  ImmutableDenseMatrix.prototype.reshape = function () {
	    throw new Error('Cannot invoke reshape on an Immutable Matrix instance');
	  };

	  /**
	   * Create a clone of the matrix
	   * @return {ImmutableDenseMatrix} clone
	   */
	  ImmutableDenseMatrix.prototype.clone = function () {
	    var m = new ImmutableDenseMatrix({
	      data: object.clone(this._data),
	      size: object.clone(this._size),
	      datatype: this._datatype
	    });
	    return m;
	  };

	  /**
	   * Get a JSON representation of the matrix
	   * @returns {Object}
	   */
	  ImmutableDenseMatrix.prototype.toJSON = function () {
	    return {
	      mathjs: 'ImmutableDenseMatrix',
	      data: this._data,
	      size: this._size,
	      datatype: this._datatype
	    };
	  };

	  /**
	   * Generate a matrix from a JSON object
	   * @param {Object} json  An object structured like
	   *                       `{"mathjs": "ImmutableDenseMatrix", data: [], size: []}`,
	   *                       where mathjs is optional
	   * @returns {ImmutableDenseMatrix}
	   */
	  ImmutableDenseMatrix.fromJSON = function (json) {
	    return new ImmutableDenseMatrix(json);
	  };

	  /**
	   * Swap rows i and j in Matrix.
	   *
	   * @param {Number} i       Matrix row index 1
	   * @param {Number} j       Matrix row index 2
	   *
	   * @return {Matrix}        The matrix reference
	   */
	  ImmutableDenseMatrix.prototype.swapRows = function () {
	    throw new Error('Cannot invoke swapRows on an Immutable Matrix instance');
	  };

	  /**
	   * Calculate the minimum value in the set
	   * @return {Number | undefined} min
	   */
	  ImmutableDenseMatrix.prototype.min = function () {
	    // check min has been calculated before
	    if (this._min === null) {
	      // minimum
	      var m = null;
	      // compute min
	      this.forEach(function (v) {
	        if (m === null || smaller(v, m)) m = v;
	      });
	      this._min = m !== null ? m : undefined;
	    }
	    return this._min;
	  };

	  /**
	   * Calculate the maximum value in the set
	   * @return {Number | undefined} max
	   */
	  ImmutableDenseMatrix.prototype.max = function () {
	    // check max has been calculated before
	    if (this._max === null) {
	      // maximum
	      var m = null;
	      // compute max
	      this.forEach(function (v) {
	        if (m === null || smaller(m, v)) m = v;
	      });
	      this._max = m !== null ? m : undefined;
	    }
	    return this._max;
	  };

	  // exports
	  return ImmutableDenseMatrix;
	}

	exports.name = 'ImmutableDenseMatrix';
	exports.path = 'type';
	exports.factory = factory;

/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var clone = __webpack_require__(15).clone;
	var isInteger = __webpack_require__(19).isInteger;

	function factory(type) {

	  /**
	   * Create an index. An Index can store ranges and sets for multiple dimensions.
	   * Matrix.get, Matrix.set, and math.subset accept an Index as input.
	   *
	   * Usage:
	   *     var index = new Index(range1, range2, matrix1, array1, ...);
	   *
	   * Where each parameter can be any of:
	   *     A number
	   *     A string (containing a name of an object property)
	   *     An instance of Range
	   *     An Array with the Set values
	   *     A Matrix with the Set values
	   *
	   * The parameters start, end, and step must be integer numbers.
	   *
	   * @class Index
	   * @Constructor Index
	   * @param {...*} ranges
	   */
	  function Index(ranges) {
	    if (!(this instanceof Index)) {
	      throw new SyntaxError('Constructor must be called with the new operator');
	    }

	    this._dimensions = [];
	    this._isScalar = true;

	    for (var i = 0, ii = arguments.length; i < ii; i++) {
	      var arg = arguments[i];

	      if (type.isRange(arg)) {
	        this._dimensions.push(arg);
	        this._isScalar = false;
	      } else if (Array.isArray(arg) || type.isMatrix(arg)) {
	        // create matrix
	        var m = _createImmutableMatrix(arg.valueOf());
	        this._dimensions.push(m);
	        // size
	        var size = m.size();
	        // scalar
	        if (size.length !== 1 || size[0] !== 1) {
	          this._isScalar = false;
	        }
	      } else if (typeof arg === 'number') {
	        this._dimensions.push(_createImmutableMatrix([arg]));
	      } else if (typeof arg === 'string') {
	        // object property (arguments.count should be 1)
	        this._dimensions.push(arg);
	      }
	      // TODO: implement support for wildcard '*'
	      else {
	          throw new TypeError('Dimension must be an Array, Matrix, number, string, or Range');
	        }
	    }
	  }

	  /**
	   * Attach type information
	   */
	  Index.prototype.type = 'Index';
	  Index.prototype.isIndex = true;

	  function _createImmutableMatrix(arg) {
	    // loop array elements
	    for (var i = 0, l = arg.length; i < l; i++) {
	      if (typeof arg[i] !== 'number' || !isInteger(arg[i])) {
	        throw new TypeError('Index parameters must be positive integer numbers');
	      }
	    }
	    // create matrix
	    return new type.ImmutableDenseMatrix(arg);
	  }

	  /**
	   * Create a clone of the index
	   * @memberof Index
	   * @return {Index} clone
	   */
	  Index.prototype.clone = function () {
	    var index = new Index();
	    index._dimensions = clone(this._dimensions);
	    index._isScalar = this._isScalar;
	    return index;
	  };

	  /**
	   * Create an index from an array with ranges/numbers
	   * @memberof Index
	   * @param {Array.<Array | number>} ranges
	   * @return {Index} index
	   * @private
	   */
	  Index.create = function (ranges) {
	    var index = new Index();
	    Index.apply(index, ranges);
	    return index;
	  };

	  /**
	   * Retrieve the size of the index, the number of elements for each dimension.
	   * @memberof Index
	   * @returns {number[]} size
	   */
	  Index.prototype.size = function () {
	    var size = [];

	    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
	      var d = this._dimensions[i];
	      size[i] = typeof d === 'string' ? 1 : d.size()[0];
	    }

	    return size;
	  };

	  /**
	   * Get the maximum value for each of the indexes ranges.
	   * @memberof Index
	   * @returns {number[]} max
	   */
	  Index.prototype.max = function () {
	    var values = [];

	    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
	      var range = this._dimensions[i];
	      values[i] = typeof range === 'string' ? range : range.max();
	    }

	    return values;
	  };

	  /**
	   * Get the minimum value for each of the indexes ranges.
	   * @memberof Index
	   * @returns {number[]} min
	   */
	  Index.prototype.min = function () {
	    var values = [];

	    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
	      var range = this._dimensions[i];
	      values[i] = typeof range === 'string' ? range : range.min();
	    }

	    return values;
	  };

	  /**
	   * Loop over each of the ranges of the index
	   * @memberof Index
	   * @param {Function} callback   Called for each range with a Range as first
	   *                              argument, the dimension as second, and the
	   *                              index object as third.
	   */
	  Index.prototype.forEach = function (callback) {
	    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
	      callback(this._dimensions[i], i, this);
	    }
	  };

	  /**
	   * Retrieve the dimension for the given index
	   * @memberof Index
	   * @param {Number} dim                  Number of the dimension
	   * @returns {Range | null} range
	   */
	  Index.prototype.dimension = function (dim) {
	    return this._dimensions[dim] || null;
	  };

	  /**
	   * Test whether this index contains an object property
	   * @returns {boolean} Returns true if the index is an object property
	   */
	  Index.prototype.isObjectProperty = function () {
	    return this._dimensions.length === 1 && typeof this._dimensions[0] === 'string';
	  };

	  /**
	   * Returns the object property name when the Index holds a single object property,
	   * else returns null
	   * @returns {string | null}
	   */
	  Index.prototype.getObjectProperty = function () {
	    return this.isObjectProperty() ? this._dimensions[0] : null;
	  };

	  /**
	   * Test whether this index contains only a single value.
	   *
	   * This is the case when the index is created with only scalar values as ranges,
	   * not for ranges resolving into a single value.
	   * @memberof Index
	   * @return {boolean} isScalar
	   */
	  Index.prototype.isScalar = function () {
	    return this._isScalar;
	  };

	  /**
	   * Expand the Index into an array.
	   * For example new Index([0,3], [2,7]) returns [[0,1,2], [2,3,4,5,6]]
	   * @memberof Index
	   * @returns {Array} array
	   */
	  Index.prototype.toArray = function () {
	    var array = [];
	    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
	      var dimension = this._dimensions[i];
	      array.push(typeof dimension === 'string' ? dimension : dimension.toArray());
	    }
	    return array;
	  };

	  /**
	   * Get the primitive value of the Index, a two dimensional array.
	   * Equivalent to Index.toArray().
	   * @memberof Index
	   * @returns {Array} array
	   */
	  Index.prototype.valueOf = Index.prototype.toArray;

	  /**
	   * Get the string representation of the index, for example '[2:6]' or '[0:2:10, 4:7, [1,2,3]]'
	   * @memberof Index
	   * @returns {String} str
	   */
	  Index.prototype.toString = function () {
	    var strings = [];

	    for (var i = 0, ii = this._dimensions.length; i < ii; i++) {
	      var dimension = this._dimensions[i];
	      if (typeof dimension === 'string') {
	        strings.push(JSON.stringify(dimension));
	      } else {
	        strings.push(dimension.toString());
	      }
	    }

	    return '[' + strings.join(', ') + ']';
	  };

	  /**
	   * Get a JSON representation of the Index
	   * @memberof Index
	   * @returns {Object} Returns a JSON object structured as:
	   *                   `{"mathjs": "Index", "ranges": [{"mathjs": "Range", start: 0, end: 10, step:1}, ...]}`
	   */
	  Index.prototype.toJSON = function () {
	    return {
	      mathjs: 'Index',
	      dimensions: this._dimensions
	    };
	  };

	  /**
	   * Instantiate an Index from a JSON object
	   * @memberof Index
	   * @param {Object} json A JSON object structured as:
	   *                     `{"mathjs": "Index", "dimensions": [{"mathjs": "Range", start: 0, end: 10, step:1}, ...]}`
	   * @return {Index}
	   */
	  Index.fromJSON = function (json) {
	    return Index.create(json.dimensions);
	  };

	  return Index;
	}

	exports.name = 'Index';
	exports.path = 'type';
	exports.factory = factory;

/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var number = __webpack_require__(19);

	function factory(type, config, load, typed) {
	  /**
	   * Create a range. A range has a start, step, and end, and contains functions
	   * to iterate over the range.
	   *
	   * A range can be constructed as:
	   *     var range = new Range(start, end);
	   *     var range = new Range(start, end, step);
	   *
	   * To get the result of the range:
	   *     range.forEach(function (x) {
	   *         console.log(x);
	   *     });
	   *     range.map(function (x) {
	   *         return math.sin(x);
	   *     });
	   *     range.toArray();
	   *
	   * Example usage:
	   *     var c = new Range(2, 6);         // 2:1:5
	   *     c.toArray();                     // [2, 3, 4, 5]
	   *     var d = new Range(2, -3, -1);    // 2:-1:-2
	   *     d.toArray();                     // [2, 1, 0, -1, -2]
	   *
	   * @class Range
	   * @constructor Range
	   * @param {number} start  included lower bound
	   * @param {number} end    excluded upper bound
	   * @param {number} [step] step size, default value is 1
	   */
	  function Range(start, end, step) {
	    if (!(this instanceof Range)) {
	      throw new SyntaxError('Constructor must be called with the new operator');
	    }

	    if (start != null) {
	      if (type.isBigNumber(start)) start = start.toNumber();else if (typeof start !== 'number') throw new TypeError('Parameter start must be a number');
	    }
	    if (end != null) {
	      if (type.isBigNumber(end)) end = end.toNumber();else if (typeof end !== 'number') throw new TypeError('Parameter end must be a number');
	    }
	    if (step != null) {
	      if (type.isBigNumber(step)) step = step.toNumber();else if (typeof step !== 'number') throw new TypeError('Parameter step must be a number');
	    }

	    this.start = start != null ? parseFloat(start) : 0;
	    this.end = end != null ? parseFloat(end) : 0;
	    this.step = step != null ? parseFloat(step) : 1;
	  }

	  /**
	   * Attach type information
	   */
	  Range.prototype.type = 'Range';
	  Range.prototype.isRange = true;

	  /**
	   * Parse a string into a range,
	   * The string contains the start, optional step, and end, separated by a colon.
	   * If the string does not contain a valid range, null is returned.
	   * For example str='0:2:11'.
	   * @memberof Range
	   * @param {string} str
	   * @return {Range | null} range
	   */
	  Range.parse = function (str) {
	    if (typeof str !== 'string') {
	      return null;
	    }

	    var args = str.split(':');
	    var nums = args.map(function (arg) {
	      return parseFloat(arg);
	    });

	    var invalid = nums.some(function (num) {
	      return isNaN(num);
	    });
	    if (invalid) {
	      return null;
	    }

	    switch (nums.length) {
	      case 2:
	        return new Range(nums[0], nums[1]);
	      case 3:
	        return new Range(nums[0], nums[2], nums[1]);
	      default:
	        return null;
	    }
	  };

	  /**
	   * Create a clone of the range
	   * @return {Range} clone
	   */
	  Range.prototype.clone = function () {
	    return new Range(this.start, this.end, this.step);
	  };

	  /**
	   * Retrieve the size of the range.
	   * Returns an array containing one number, the number of elements in the range.
	   * @memberof Range
	   * @returns {number[]} size
	   */
	  Range.prototype.size = function () {
	    var len = 0,
	        start = this.start,
	        step = this.step,
	        end = this.end,
	        diff = end - start;

	    if (number.sign(step) == number.sign(diff)) {
	      len = Math.ceil(diff / step);
	    } else if (diff == 0) {
	      len = 0;
	    }

	    if (isNaN(len)) {
	      len = 0;
	    }
	    return [len];
	  };

	  /**
	   * Calculate the minimum value in the range
	   * @memberof Range
	   * @return {number | undefined} min
	   */
	  Range.prototype.min = function () {
	    var size = this.size()[0];

	    if (size > 0) {
	      if (this.step > 0) {
	        // positive step
	        return this.start;
	      } else {
	        // negative step
	        return this.start + (size - 1) * this.step;
	      }
	    } else {
	      return undefined;
	    }
	  };

	  /**
	   * Calculate the maximum value in the range
	   * @memberof Range
	   * @return {number | undefined} max
	   */
	  Range.prototype.max = function () {
	    var size = this.size()[0];

	    if (size > 0) {
	      if (this.step > 0) {
	        // positive step
	        return this.start + (size - 1) * this.step;
	      } else {
	        // negative step
	        return this.start;
	      }
	    } else {
	      return undefined;
	    }
	  };

	  /**
	   * Execute a callback function for each value in the range.
	   * @memberof Range
	   * @param {function} callback   The callback method is invoked with three
	   *                              parameters: the value of the element, the index
	   *                              of the element, and the Range being traversed.
	   */
	  Range.prototype.forEach = function (callback) {
	    var x = this.start;
	    var step = this.step;
	    var end = this.end;
	    var i = 0;

	    if (step > 0) {
	      while (x < end) {
	        callback(x, [i], this);
	        x += step;
	        i++;
	      }
	    } else if (step < 0) {
	      while (x > end) {
	        callback(x, [i], this);
	        x += step;
	        i++;
	      }
	    }
	  };

	  /**
	   * Execute a callback function for each value in the Range, and return the
	   * results as an array
	   * @memberof Range
	   * @param {function} callback   The callback method is invoked with three
	   *                              parameters: the value of the element, the index
	   *                              of the element, and the Matrix being traversed.
	   * @returns {Array} array
	   */
	  Range.prototype.map = function (callback) {
	    var array = [];
	    this.forEach(function (value, index, obj) {
	      array[index[0]] = callback(value, index, obj);
	    });
	    return array;
	  };

	  /**
	   * Create an Array with a copy of the Ranges data
	   * @memberof Range
	   * @returns {Array} array
	   */
	  Range.prototype.toArray = function () {
	    var array = [];
	    this.forEach(function (value, index) {
	      array[index[0]] = value;
	    });
	    return array;
	  };

	  /**
	   * Get the primitive value of the Range, a one dimensional array
	   * @memberof Range
	   * @returns {Array} array
	   */
	  Range.prototype.valueOf = function () {
	    // TODO: implement a caching mechanism for range.valueOf()
	    return this.toArray();
	  };

	  /**
	   * Get a string representation of the range, with optional formatting options.
	   * Output is formatted as 'start:step:end', for example '2:6' or '0:0.2:11'
	   * @memberof Range
	   * @param {Object | number | function} [options]  Formatting options. See
	   *                                                lib/utils/number:format for a
	   *                                                description of the available
	   *                                                options.
	   * @returns {string} str
	   */
	  Range.prototype.format = function (options) {
	    var str = number.format(this.start, options);

	    if (this.step != 1) {
	      str += ':' + number.format(this.step, options);
	    }
	    str += ':' + number.format(this.end, options);
	    return str;
	  };

	  /**
	   * Get a string representation of the range.
	   * @memberof Range
	   * @returns {string}
	   */
	  Range.prototype.toString = function () {
	    return this.format();
	  };

	  /**
	   * Get a JSON representation of the range
	   * @memberof Range
	   * @returns {Object} Returns a JSON object structured as:
	   *                   `{"mathjs": "Range", "start": 2, "end": 4, "step": 1}`
	   */
	  Range.prototype.toJSON = function () {
	    return {
	      mathjs: 'Range',
	      start: this.start,
	      end: this.end,
	      step: this.step
	    };
	  };

	  /**
	   * Instantiate a Range from a JSON object
	   * @memberof Range
	   * @param {Object} json A JSON object structured as:
	   *                      `{"mathjs": "Range", "start": 2, "end": 4, "step": 1}`
	   * @return {Range}
	   */
	  Range.fromJSON = function (json) {
	    return new Range(json.start, json.end, json.step);
	  };

	  return Range;
	}

	exports.name = 'Range';
	exports.path = 'type';
	exports.factory = factory;

/***/ }),
/* 61 */
/***/ (function(module, exports) {

	'use strict';

	function factory(type, config, load, typed) {
	  /**
	   * Create an index. An Index can store ranges having start, step, and end
	   * for multiple dimensions.
	   * Matrix.get, Matrix.set, and math.subset accept an Index as input.
	   *
	   * Syntax:
	   *
	   *     math.index(range1, range2, ...)
	   *
	   * Where each range can be any of:
	   *
	   * - A number
	   * - A string for getting/setting an object property
	   * - An instance of `Range`
	   * - A one-dimensional Array or a Matrix with numbers
	   *
	   * Indexes must be zero-based, integer numbers.
	   *
	   * Examples:
	   *
	   *    var math = math.js
	   *
	   *    var b = [1, 2, 3, 4, 5];
	   *    math.subset(b, math.index([1, 2, 3]));     // returns [2, 3, 4]
	   *
	   *    var a = math.matrix([[1, 2], [3, 4]]);
	   *    a.subset(math.index(0, 1));             // returns 2
	   *
	   * See also:
	   *
	   *    bignumber, boolean, complex, matrix, number, string, unit
	   *
	   * @param {...*} ranges   Zero or more ranges or numbers.
	   * @return {Index}        Returns the created index
	   */
	  return typed('index', {
	    '...number | string | BigNumber | Range | Array | Matrix': function (args) {
	      var ranges = args.map(function (arg) {
	        if (type.isBigNumber(arg)) {
	          return arg.toNumber(); // convert BigNumber to Number
	        } else if (Array.isArray(arg) || type.isMatrix(arg)) {
	          return arg.map(function (elem) {
	            // convert BigNumber to Number
	            return type.isBigNumber(elem) ? elem.toNumber() : elem;
	          });
	        } else {
	          return arg;
	        }
	      });

	      var res = new type.Index();
	      type.Index.apply(res, ranges);
	      return res;
	    }
	  });
	}

	exports.name = 'index';
	exports.factory = factory;

/***/ }),
/* 62 */
/***/ (function(module, exports) {

	'use strict';

	function factory(type, config, load, typed) {

	  var SparseMatrix = type.SparseMatrix;

	  /**
	   * Create a Sparse Matrix. The function creates a new `math.type.Matrix` object from
	   * an `Array`. A Matrix has utility functions to manipulate the data in the
	   * matrix, like getting the size and getting or setting values in the matrix.
	   *
	   * Syntax:
	   *
	   *    math.sparse()               // creates an empty sparse matrix.
	   *    math.sparse(data)           // creates a sparse matrix with initial data.
	   *    math.sparse(data, 'number') // creates a sparse matrix with initial data, number datatype.
	   *
	   * Examples:
	   *
	   *    var m = math.sparse([[1, 2], [3, 4]]);
	   *    m.size();                        // Array [2, 2]
	   *    m.resize([3, 2], 5);
	   *    m.valueOf();                     // Array [[1, 2], [3, 4], [5, 5]]
	   *    m.get([1, 0])                    // number 3
	   *
	   * See also:
	   *
	   *    bignumber, boolean, complex, index, number, string, unit, matrix
	   *
	   * @param {Array | Matrix} [data]    A two dimensional array
	   *
	   * @return {Matrix} The created matrix
	   */
	  var sparse = typed('sparse', {
	    '': function () {
	      return new SparseMatrix([]);
	    },

	    'string': function (datatype) {
	      return new SparseMatrix([], datatype);
	    },

	    'Array | Matrix': function (data) {
	      return new SparseMatrix(data);
	    },

	    'Array | Matrix, string': function (data, datatype) {
	      return new SparseMatrix(data, datatype);
	    }
	  });

	  sparse.toTex = {
	    0: '\\begin{bsparse}\\end{bsparse}',
	    1: '\\left(${args[0]}\\right)'
	  };

	  return sparse;
	}

	exports.name = 'sparse';
	exports.factory = factory;

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var isInteger = __webpack_require__(19).isInteger;
	var resize = __webpack_require__(29).resize;

	function factory(type, config, load, typed) {
	  var matrix = load(__webpack_require__(44));

	  /**
	   * Create a matrix filled with zeros. The created matrix can have one or
	   * multiple dimensions.
	   *
	   * Syntax:
	   *
	   *    math.zeros(m)
	   *    math.zeros(m, format)
	   *    math.zeros(m, n)
	   *    math.zeros(m, n, format)
	   *    math.zeros([m, n])
	   *    math.zeros([m, n], format)
	   *
	   * Examples:
	   *
	   *    math.zeros(3);                  // returns [0, 0, 0]
	   *    math.zeros(3, 2);               // returns [[0, 0], [0, 0], [0, 0]]
	   *    math.zeros(3, 'dense');         // returns [0, 0, 0]
	   *
	   *    var A = [[1, 2, 3], [4, 5, 6]];
	   *    math.zeros(math.size(A));       // returns [[0, 0, 0], [0, 0, 0]]
	   *
	   * See also:
	   *
	   *    ones, eye, size, range
	   *
	   * @param {...number | Array} size    The size of each dimension of the matrix
	   * @param {string} [format]           The Matrix storage format
	   *
	   * @return {Array | Matrix}           A matrix filled with zeros
	   */
	  var zeros = typed('zeros', {
	    '': function () {
	      return config.matrix === 'Array' ? _zeros([]) : _zeros([], 'default');
	    },

	    // math.zeros(m, n, p, ..., format)
	    // TODO: more accurate signature '...number | BigNumber, string' as soon as typed-function supports this
	    '...number | BigNumber | string': function (size) {
	      var last = size[size.length - 1];
	      if (typeof last === 'string') {
	        var format = size.pop();
	        return _zeros(size, format);
	      } else if (config.matrix === 'Array') {
	        return _zeros(size);
	      } else {
	        return _zeros(size, 'default');
	      }
	    },

	    'Array': _zeros,

	    'Matrix': function (size) {
	      var format = size.storage();
	      return _zeros(size.valueOf(), format);
	    },

	    'Array | Matrix, string': function (size, format) {
	      return _zeros(size.valueOf(), format);
	    }
	  });

	  zeros.toTex = undefined; // use default template

	  return zeros;

	  /**
	   * Create an Array or Matrix with zeros
	   * @param {Array} size
	   * @param {string} [format='default']
	   * @return {Array | Matrix}
	   * @private
	   */
	  function _zeros(size, format) {
	    var hasBigNumbers = _normalize(size);
	    var defaultValue = hasBigNumbers ? new type.BigNumber(0) : 0;
	    _validate(size);

	    if (format) {
	      // return a matrix
	      var m = matrix(format);
	      if (size.length > 0) {
	        return m.resize(size, defaultValue);
	      }
	      return m;
	    } else {
	      // return an Array
	      var arr = [];
	      if (size.length > 0) {
	        return resize(arr, size, defaultValue);
	      }
	      return arr;
	    }
	  }

	  // replace BigNumbers with numbers, returns true if size contained BigNumbers
	  function _normalize(size) {
	    var hasBigNumbers = false;
	    size.forEach(function (value, index, arr) {
	      if (type.isBigNumber(value)) {
	        hasBigNumbers = true;
	        arr[index] = value.toNumber();
	      }
	    });
	    return hasBigNumbers;
	  }

	  // validate arguments
	  function _validate(size) {
	    size.forEach(function (value) {
	      if (typeof value !== 'number' || !isInteger(value) || value < 0) {
	        throw new Error('Parameters in function zeros must be positive integers');
	      }
	    });
	  }
	}

	// TODO: zeros contains almost the same code as ones. Reuse this?

	exports.name = 'zeros';
	exports.factory = factory;

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var get_filter_default_state = __webpack_require__(6);
	var underscore = __webpack_require__(3);

	module.exports = function get_subset_views(params, views, requested_view) {

	  var inst_value;
	  var found_filter;

	  var request_filters = underscore.keys(requested_view);

	  // find a view that matches all of the requested view/filter-attributes
	  underscore.each(request_filters, function (inst_filter) {

	    inst_value = requested_view[inst_filter];

	    // if the value is a number, then convert it to an integer
	    if (/[^a-z_]/i.test(inst_value)) {
	      inst_value = parseInt(inst_value, 10);
	    }

	    // only run filtering if any of the views has the filter
	    found_filter = false;
	    underscore.each(views, function (tmp_view) {
	      if (utils.has(tmp_view, inst_filter)) {
	        found_filter = true;
	      }
	    });

	    if (found_filter) {
	      views = underscore.filter(views, function (d) {
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
	  underscore.each(views, function (inst_view) {

	    check_default = true;

	    // check each filter in a view to see if it is in the default state
	    underscore.each(underscore.keys(params.viz.possible_filters), function (inst_filter) {

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

/***/ }),
/* 65 */
/***/ (function(module, exports) {

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

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function make_view_request(params, requested_view) {

	  // this will add all necessary information to a view request
	  // it will grab necessary view information from the sliders

	  // only one component will be changed at a time
	  var changed_component = underscore.keys(requested_view)[0];

	  // add additional filter information from othe possible filters
	  underscore.each(underscore.keys(params.viz.possible_filters), function (inst_filter) {

	    if (inst_filter != changed_component) {

	      if (!d3.select(params.root + ' .slider_' + inst_filter).empty()) {

	        var inst_state = d3.select(params.root + ' .slider_' + inst_filter).attr('current_state');

	        requested_view[inst_filter] = inst_state;
	      }
	    }
	  });

	  return requested_view;
		};

/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	var ini_label_params = __webpack_require__(68);
	var set_viz_wrapper_size = __webpack_require__(69);
	var get_svg_dim = __webpack_require__(71);
	var calc_label_params = __webpack_require__(72);
	var calc_clust_width = __webpack_require__(73);
	var calc_clust_height = __webpack_require__(74);
	var calc_val_max = __webpack_require__(75);
	var calc_matrix_params = __webpack_require__(76);
	var set_zoom_params = __webpack_require__(81);
	var calc_default_fs = __webpack_require__(83);
	var utils = __webpack_require__(2);
	var get_available_filters = __webpack_require__(5);
	var make_cat_params = __webpack_require__(84);

	module.exports = function calc_viz_params(params, predefined_cat_colors = true) {

	  params.labels = ini_label_params(params);
	  params.viz = ini_viz_params(params, predefined_cat_colors);

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

	  function ini_viz_params(params, predefined_cat_colors = true) {

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

	    viz.cat_bar_width = 180;
	    viz.cat_bar_height = 20;

	    viz.tree_menu_width = 400;
	    viz.tree_menu_height = 237;
	    viz.tree_menu_x_offset = 20;

	    viz.filter_menu_width = 500;
	    viz.filter_menu_height = 237;
	    viz.filter_menu_x_offset = 20;

	    viz.update_button_width = 100;

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

	    // console.log('ini_viz_params -> make_cat_params')
	    // console.log('predefined_cat_colors outside function ' + String(predefined_cat_colors))

	    viz = make_cat_params(params, viz, predefined_cat_colors);

	    // // always make group level dict
	    // params.group_level = {};

	    if (_.has(params, 'group_level') == false) {
	      if (viz.show_dendrogram) {
	        params.group_level = {};
	      }

	      // preventing error when un-clustered, above statement
	      // preserves dendro state while updating
	      if (_.has(params, 'group_level') == false) {
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
	  }

	  return params;
	};

/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

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

	  labels.row_max_char = underscore.max(params.network_data.row_nodes, function (inst) {
	    return inst.name.length;
	  }).name.length;

	  labels.col_max_char = underscore.max(params.network_data.col_nodes, function (inst) {
	    return inst.name.length;
	  }).name.length;

	  labels.max_allow_fs = params.max_allow_fs;

	  return labels;
	};

/***/ }),
/* 69 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_viz_dimensions = __webpack_require__(70);

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

/***/ }),
/* 70 */
/***/ (function(module, exports) {

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

/***/ }),
/* 71 */
/***/ (function(module, exports) {

	module.exports = function get_svg_dim(params) {

	  params.viz.svg_dim = {};
	  params.viz.svg_dim.width = Number(d3.select(params.viz.viz_wrapper).style('width').replace('px', ''));

	  params.viz.svg_dim.height = Number(d3.select(params.viz.viz_wrapper).style('height').replace('px', ''));

	  return params;
	};

/***/ }),
/* 72 */
/***/ (function(module, exports) {

	module.exports = function calc_label_params(viz) {

	  viz.norm_labels.margin = {};

	  viz.norm_labels.margin.left = viz.super_labels.margin.left + viz.super_labels.dim.width;

	  viz.norm_labels.margin.top = viz.super_labels.margin.top + viz.super_labels.dim.width;

	  viz.label_background = {};

	  viz.label_background.row = viz.norm_labels.width.row + viz.cat_room.row + viz.uni_margin;

	  viz.label_background.col = viz.norm_labels.width.col + viz.cat_room.col + viz.uni_margin;

	  return viz;
	};

/***/ }),
/* 73 */
/***/ (function(module, exports) {

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

/***/ }),
/* 74 */
/***/ (function(module, exports) {

	module.exports = function calc_clust_height(viz) {

	  // the clustergram/matrix height is the svg width minus: 
	  // the margin of the clustergram on the top 
	  // the dendrogram 
	  // the bottom_space 
	  var ini_clust_height = viz.svg_dim.height - viz.clust.margin.top - viz.dendro_room.col - viz.bottom_space;

	  viz.clust.dim.height = ini_clust_height;

	  return viz;
	};

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function calc_val_max(params) {

	  var val_max = Math.abs(underscore.max(params.network_data.col_nodes, function (d) {
	    return Math.abs(d.value);
	  }).value);

	  params.labels.bar_scale_col = d3.scale.linear().domain([0, val_max]).range([0, 0.75 * params.viz.norm_labels.width.col]);

	  val_max = Math.abs(underscore.max(params.network_data.row_nodes, function (d) {
	    return Math.abs(d.value);
	  }).value);

	  params.labels.bar_scale_row = d3.scale.linear().domain([0, val_max]).range([0, params.viz.norm_labels.width.row]);

	  return params;
	};

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	var ini_matrix_params = __webpack_require__(77);
	var calc_downsampled_levels = __webpack_require__(79);
	var underscore = __webpack_require__(3);

	module.exports = function calc_matrix_params(params) {

	  params.matrix = ini_matrix_params(params);

	  // X and Y scales: set domains and ranges
	  //////////////////////////////////////////////
	  params.viz.x_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.width]);

	  params.viz.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);

	  var inst_order;

	  underscore.each(['row', 'col'], function (inst_rc) {

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

/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var initialize_matrix = __webpack_require__(78);
	var underscore = __webpack_require__(3);

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

	  underscore.each(['row', 'col'], function (inst_rc) {

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

	    var alpha_index = underscore.map(tmp, function (d) {
	      return network_data[other_rc + '_nodes_names'].indexOf(d);
	    });

	    matrix.orders['alpha_' + inst_rc] = alpha_index;

	    var possible_orders = ['clust', 'rank'];

	    if (_.has(inst_nodes[0], 'rankvar')) {
	      possible_orders.push('rankvar');
	    }

	    if (params.viz.all_cats[other_rc].length > 0) {
	      underscore.each(params.viz.all_cats[other_rc], function (inst_cat) {
	        // the index of the category has replaced - with _
	        inst_cat = inst_cat.replace('-', '_');
	        possible_orders.push(inst_cat + '_index');
	      });
	    }

	    underscore.each(possible_orders, function (inst_order) {

	      var tmp_order_index = d3.range(num_nodes).sort(function (a, b) {
	        return inst_nodes[b][inst_order] - inst_nodes[a][inst_order];
	      });

	      matrix.orders[inst_order + '_' + inst_rc] = tmp_order_index;
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

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_downsampled_matrix = __webpack_require__(80);

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

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

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

	  underscore.each(mat, function (inst_row) {

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
	  underscore.each(ds_mat, function (tmp_ds) {

	    var tmp_row_data = tmp_ds.row_data;

	    var num_names = tmp_ds.all_names.length;

	    underscore.each(tmp_row_data, function (tmp_obj) {
	      tmp_obj.value = tmp_obj.value / num_names * opacity_factor;
	    });
	  });

	  // all names were found
	  var all_names = [];

	  underscore.each(ds_mat, function (inst_row) {
	    all_names = all_names.concat(inst_row.all_names);
	  });

	  return ds_mat;
		};

/***/ }),
/* 81 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_zoom_switching = __webpack_require__(82);

	module.exports = function set_zoom_params(params) {

	  params.viz.zoom_scale_font = {};
	  params.viz.zoom_scale_font.row = 1;
	  params.viz.zoom_scale_font.col = 1;

	  var max_zoom_limit = 0.75;
	  var half_col_height = params.viz.x_scale.rangeBand() / 2;
	  params.viz.square_zoom = params.viz.norm_labels.width.col / half_col_height * max_zoom_limit;

	  params.viz = calc_zoom_switching(params.viz);

	  return params;
	};

/***/ }),
/* 82 */
/***/ (function(module, exports) {

	module.exports = function calc_zoom_switching(viz) {

	  var width_by_col = viz.clust.dim.width / viz.num_col_nodes;
	  var height_by_row = viz.clust.dim.height / viz.num_row_nodes;

	  viz.zoom_ratio = {};
	  viz.zoom_ratio.x = width_by_col / height_by_row;
	  viz.zoom_ratio.y = 1;

	  if (viz.zoom_ratio.x < 1) {
	    viz.zoom_ratio.y = 1 / viz.zoom_ratio.x;
	    viz.zoom_ratio.x = 1;
	  }

	  return viz;
	};

/***/ }),
/* 83 */
/***/ (function(module, exports) {

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

/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_cat_params = __webpack_require__(85);
	var utils = __webpack_require__(2);
	var colors = __webpack_require__(86);
	var check_if_value_cats = __webpack_require__(87);
	var underscore = __webpack_require__(3);

	module.exports = function make_cat_params(params, viz, predefined_cat_colors = true) {

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

	  viz.cat_colors = {};
	  viz.cat_colors.value_opacity = ini_val_opacity;

	  var num_colors = 0;
	  underscore.each(['row', 'col'], function (inst_rc) {

	    viz.show_categories[inst_rc] = false;

	    viz.all_cats[inst_rc] = [];
	    var tmp_keys = underscore.keys(params.network_data[inst_rc + '_nodes'][0]);

	    tmp_keys = tmp_keys.sort();

	    underscore.each(tmp_keys, function (d) {
	      if (d.indexOf('cat-') >= 0) {
	        viz.show_categories[inst_rc] = true;
	        viz.all_cats[inst_rc].push(d);
	      }
	    });

	    viz.cat_info[inst_rc] = null;

	    if (viz.show_categories[inst_rc]) {

	      viz.cat_colors[inst_rc] = {};
	      viz.cat_info[inst_rc] = {};
	      viz.cat_names[inst_rc] = {};

	      underscore.each(viz.all_cats[inst_rc], function (cat_title) {

	        var inst_node = params.network_data[inst_rc + '_nodes'][0];

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

	        var cat_instances_titles = utils.pluck(params.network_data[inst_rc + '_nodes'], cat_title);
	        var cat_instances = [];

	        underscore.each(cat_instances_titles, function (inst_cat) {

	          var new_cat;
	          if (inst_cat.indexOf(': ') > 0) {
	            new_cat = inst_cat.split(': ')[1];
	          } else {
	            new_cat = inst_cat;
	          }

	          cat_instances.push(new_cat);
	        });

	        var cat_states = underscore.uniq(cat_instances_titles).sort();

	        // check whether all the categories are of value type
	        inst_info = check_if_value_cats(cat_states);

	        // add histogram to inst_info
	        if (inst_info.type === 'cat_strings') {
	          // remove titles from categories in hist
	          var cat_hist = underscore.countBy(cat_instances);
	          inst_info.cat_hist = cat_hist;
	        } else {
	          inst_info.cat_hist = null;
	        }

	        // pass info_info object
	        viz.cat_info[inst_rc][cat_title] = inst_info;

	        viz.cat_colors[inst_rc][cat_title] = {};

	        underscore.each(cat_states, function (cat_tmp, inst_index) {

	          inst_color = colors.get_random_color(inst_index + num_colors);

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
	      });
	    }

	    if (_.has(params.network_data, 'cat_colors') && predefined_cat_colors === true) {
	      viz.cat_colors[inst_rc] = params.network_data.cat_colors[inst_rc];
	    }

	    if (params.sim_mat) {
	      // sending row color info to columns since row color info can be updated
	      viz.cat_colors.col = viz.cat_colors.row;
	    }
	  });

	  viz.cat_colors = viz.cat_colors;

	  viz.cat_colors.opacity = 0.6;
	  viz.cat_colors.active_opacity = 0.9;

	  viz = calc_cat_params(params, viz);

	  return viz;
		};

/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function calc_cat_params(params, viz) {

	  var separtion_room;

	  // increase the width of the label container based on the label length
	  var label_scale = d3.scale.linear().domain([5, 15]).range([85, 120]).clamp('true');

	  viz.cat_room = {};
	  viz.cat_room.symbol_width = 12;
	  viz.cat_room.separation = 3;

	  underscore.each(['row', 'col'], function (inst_rc) {

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

/***/ }),
/* 86 */
/***/ (function(module, exports) {

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

/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

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

	    underscore.each(cat_states, function (inst_cat) {

	      if (has_title) {
	        inst_cat = inst_cat.split(super_string)[1];
	      }

	      // checking whether inst_cat is 'not a number'
	      if (isNaN(inst_cat) === true) {
	        cat_types = 'cat_strings';
	      } else {
	        inst_cat = parseFloat(inst_cat);
	        all_values.push(inst_cat);
	      }
	    });
	  }

	  if (cat_types === 'cat_values') {

	    // get absolute value
	    var max_value = underscore.max(all_values, function (d) {
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

/***/ }),
/* 88 */
/***/ (function(module, exports) {

	module.exports = function ini_zoom_info() {

	  var zoom_info = {};
	  zoom_info.zoom_x = 1;
	  zoom_info.zoom_y = 1;
	  zoom_info.trans_x = 0;
	  zoom_info.trans_y = 0;

	  return zoom_info;
		};

/***/ }),
/* 89 */
/***/ (function(module, exports, __webpack_require__) {

	var generate_matrix = __webpack_require__(90);
	var make_row_label_container = __webpack_require__(101);
	var make_col_label_container = __webpack_require__(133);
	var generate_super_labels = __webpack_require__(141);
	var spillover = __webpack_require__(142);
	var initialize_resizing = __webpack_require__(153);
	var ini_doubleclick = __webpack_require__(163);
	var make_col_cat = __webpack_require__(185);
	var make_row_cat = __webpack_require__(190);
	var trim_text = __webpack_require__(148);
	var make_row_dendro = __webpack_require__(191);
	var make_col_dendro = __webpack_require__(192);
	var build_dendro_sliders = __webpack_require__(193);
	// var build_tree_icon = require('./menus/build_tree_icon');
	// var build_filter_icon = require('./menus/build_filter_icon');
	var make_row_dendro_spillover = __webpack_require__(196);
	var underscore = __webpack_require__(3);

	module.exports = function make_viz(cgm) {

	  var params = cgm.params;

	  d3.select(params.viz.viz_wrapper + ' svg').remove();

	  var svg_group = d3.select(params.viz.viz_wrapper).append('svg').attr('class', 'viz_svg').attr('id', 'svg_' + params.root.replace('#', '')).attr('width', params.viz.svg_dim.width).attr('height', params.viz.svg_dim.height).attr('is_zoom', 0).attr('stopped_zoom', 1);

	  svg_group.append('rect').attr('class', 'super_background').style('width', params.viz.svg_dim.width).style('height', params.viz.svg_dim.height).style('fill', 'white');

	  generate_matrix(params, svg_group);

	  make_row_label_container(cgm);

	  if (params.viz.show_dendrogram) {
	    make_row_dendro(cgm);
	    make_col_dendro(cgm);
	    make_row_dendro_spillover(cgm);
	  }

	  make_col_label_container(cgm);

	  // initial trim text
	  if (params.viz.ds_level === -1) {
	    underscore.each(['row', 'col'], function (inst_rc) {

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

	  // // disable recluster and filter icons
	  // //////////////////

	  // // sliders should go above super labels
	  // build_tree_icon(cgm);

	  // build_filter_icon(cgm);

	  build_dendro_sliders(cgm);

	  function border_colors() {
	    var inst_color = params.viz.super_border_color;
	    if (params.viz.is_expand || params.show_viz_border == false) {
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

/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var draw_gridlines = __webpack_require__(91);
	var add_click_hlight = __webpack_require__(92);
	var make_matrix_rows = __webpack_require__(93);

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
	    get_clust_group: function () {
	      return clust_group;
	    },
	    get_matrix: function () {
	      return matrix;
	    },
	    get_nodes: function (type) {
	      if (type === 'row') {
	        return network_data.row_nodes;
	      }
	      return network_data.col_nodes;
	    }
	  };
		};

/***/ }),
/* 91 */
/***/ (function(module, exports) {

	// var grid_lines_viz = require('./grid_lines_viz');
	// var toggle_grid_lines = require('./toggle_grid_lines');

	/* eslint-disable */
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

/***/ }),
/* 92 */
/***/ (function(module, exports) {

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
	      var hlight_height = rel_width_hlight * params.viz.border_width.y;

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

/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	var make_simple_rows = __webpack_require__(94);
	var d3_tip_custom = __webpack_require__(100);
	var underscore = __webpack_require__(3);

	// current matrix can change with downsampling
	module.exports = function make_matrix_rows(params, current_matrix, row_names = 'all', ds_level = -1) {

	  // defaults
	  var y_scale = params.viz.y_scale;
	  var make_tip = true;
	  var row_class = 'row';

	  if (ds_level >= 0) {
	    y_scale = params.viz.ds[ds_level].y_scale;

	    // do not show tip when rows are downsampled
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
	  } else {
	    tip = null;
	  }

	  // gather a subset of row data from the matrix or use all rows
	  var matrix_subset = [];
	  if (row_names === 'all') {
	    matrix_subset = current_matrix;
	  } else {
	    underscore.each(current_matrix, function (inst_row) {
	      if (underscore.contains(row_names, inst_row.name)) {
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

/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	/* eslint-disable */

	var draw_up_tile = __webpack_require__(95);
	var draw_dn_tile = __webpack_require__(96);
	var mouseover_tile = __webpack_require__(97);
	var mouseout_tile = __webpack_require__(98);
	var fine_position_tile = __webpack_require__(99);
	var underscore = __webpack_require__(3);

	module.exports = function make_simple_rows(params, inst_data, tip, row_selection, ds_level = -1) {

	  var inp_row_data = inst_data.row_data;

	  var make_tip = true;
	  var rect_height = params.viz.rect_height;
	  if (ds_level >= 0) {
	    // make_tip = false;
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
	    row_values = underscore.filter(inp_row_data, function (num) {
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
	      for (var inst_len = arguments.length, args = Array(inst_len), inst_key = 0; inst_key < inst_len; inst_key++) {
	        args[inst_key] = arguments[inst_key];
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
	    var row_split_data = underscore.filter(inp_row_data, function (num) {
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
	    }).on('mouseover', function (...args) {
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
	    }).on('mouseover', function (...args) {
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

/***/ }),
/* 95 */
/***/ (function(module, exports) {

	module.exports = function draw_up_tile(params) {

	  var start_x = 0;
	  var final_x = params.viz.x_scale.rangeBand() - params.viz.border_width.x;
	  var start_y = 0;
	  var final_y = params.viz.y_scale.rangeBand() - params.viz.border_width.y;

	  var output_string = 'M' + start_x + ',' + start_y + ' L' + start_x + ', ' + final_y + ' L' + final_x + ',0 Z';

	  return output_string;
	};

/***/ }),
/* 96 */
/***/ (function(module, exports) {

	module.exports = function draw_dn_tile(params) {

	  var start_x = 0;
	  var final_x = params.viz.x_scale.rangeBand() - params.viz.border_width.x;
	  var start_y = params.viz.y_scale.rangeBand() - params.viz.border_width.y;
	  var final_y = params.viz.y_scale.rangeBand() - params.viz.border_width.y;

	  var output_string = 'M' + start_x + ', ' + start_y + '   L' + final_x + ', ' + final_y + ' L' + final_x + ',0 Z';

	  return output_string;
	};

/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function mouseover_tile(params, inst_selection, tip, inst_arguments) {

	  var inst_data = inst_arguments[0];
	  var args = [].slice.call(inst_arguments);
	  var timeout;
	  var delay = 1000;

	  d3.select(inst_selection).classed('hovering', true);

	  underscore.each(['row', 'col'], function (inst_rc) {

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

/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function mouseout_tile(params, inst_selection, tip) {

	  d3.select(inst_selection).classed('hovering', false);

	  d3.selectAll(params.viz.root_tips + '_tile_tip').style('display', 'none');

	  underscore.each(['row', 'col'], function (inst_rc) {

	    d3.selectAll(params.root + ' .' + inst_rc + '_label_group text').style('font-weight', 'normal');
	  });

	  if (tip != null) {
	    tip.hide();
	  }
	};

/***/ }),
/* 99 */
/***/ (function(module, exports) {

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

/***/ }),
/* 100 */
/***/ (function(module, exports) {

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

	    // // hide all d3-tip tooltips
	    // d3.selectAll('.d3-tip')
	    //   .style('display', 'none');

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

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

	var make_row_labels = __webpack_require__(102);

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

/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var add_row_click_hlight = __webpack_require__(103);
	var row_reorder = __webpack_require__(104);
	var make_row_tooltips = __webpack_require__(132);
	var underscore = __webpack_require__(3);

	module.exports = function make_row_labels(cgm, row_names = 'all', text_delay = 0) {

	  // console.log('make_row_labels')
	  // console.log(row_names)

	  var params = cgm.params;
	  var row_nodes = [];

	  if (row_names === 'all') {
	    row_nodes = params.network_data.row_nodes;
	  } else {
	    underscore.each(params.network_data.row_nodes, function (inst_row) {
	      // if (_.contains(row_names, inst_row.name)){
	      if (underscore.contains(row_names, inst_row.name)) {
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
	    var inst_index = underscore.indexOf(row_nodes_names, d.name);
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

/***/ }),
/* 103 */
/***/ (function(module, exports) {

	module.exports = function (params, clicked_row, id_clicked_row) {
	  if (id_clicked_row != params.click_hlight_row) {

	    var rel_width_hlight = 6;
	    var opacity_hlight = 0.85;
	    var hlight_height = rel_width_hlight * params.viz.border_width.x;

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

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

	var reposition_tile_highlight = __webpack_require__(105);
	var toggle_dendro_view = __webpack_require__(106);
	var ini_zoom_info = __webpack_require__(88);
	var get_previous_zoom = __webpack_require__(131);
	var calc_downsampled_levels = __webpack_require__(79);
	var underscore = __webpack_require__(3);

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
	    inst_row = underscore.indexOf(tmp_arr, inst_row);

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
	      var inst_index = underscore.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ')rotate(-90)';
	    });

	    // reorder col_class groups
	    t.selectAll('.col_cat_group').attr('transform', function (d) {
	      var inst_index = underscore.indexOf(col_nodes_names, d.name);
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

/***/ }),
/* 105 */
/***/ (function(module, exports) {

	module.exports = function (params) {

	  // resize click hlight
	  var rel_width_hlight = 6;
	  // var opacity_hlight = 0.85;

	  var hlight_width = rel_width_hlight * params.viz.border_width.x;
	  var hlight_height = rel_width_hlight * params.viz.border_width.y;

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

/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	var make_dendro_triangles = __webpack_require__(107);

	module.exports = function toggle_dendro_view(cgm, inst_rc, wait_time = 1500) {

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

/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_row_dendro_triangles = __webpack_require__(108);
	var calc_col_dendro_triangles = __webpack_require__(109);
	var dendro_group_highlight = __webpack_require__(110);
	var d3_tip_custom = __webpack_require__(100);
	var make_dendro_crop_buttons = __webpack_require__(112);
	var make_cat_breakdown_graph = __webpack_require__(115);

	module.exports = function make_dendro_triangles(cgm, inst_rc, is_change_group = false) {

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

	  if (params.viz.show_dendrogram) {
	    if (inst_rc === 'row') {
	      dendro_info = calc_row_dendro_triangles(params);
	    } else {
	      dendro_info = calc_col_dendro_triangles(params);
	    }

	    if (d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_crop_buttons').empty() === false) {
	      make_dendro_crop_buttons(cgm, inst_rc);
	    }
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
	  }).direction('nw').offset([tmp_y_offset, tmp_x_offset]).style('display', 'none').style('opacity', 0);

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

	    var output_string = 'M' + start_x + ',' + start_y + ' L' + mid_x + ', ' + mid_y + ' L' + final_x + ',' + final_y + ' Z';
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

	    var inst_selector = params.root + ' .dendro_info';

	    // remove old graphs (modals are not within params.root)
	    d3.selectAll('.dendro_info .cluster_info_container .cat_graph').remove();

	    if (params.viz.cat_info[inst_rc] !== null) {
	      make_cat_breakdown_graph(params, inst_rc, d, dendro_info[i], inst_selector);
	    }

	    if (cgm.params.dendro_click_callback != null) {
	      cgm.params.dendro_click_callback(this);
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

/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function calc_row_dendro_triangles(params) {

	  var triangle_info = {};
	  var inst_level = params.group_level.row;
	  var row_nodes = params.network_data.row_nodes;
	  var row_nodes_names = params.network_data.row_nodes_names;

	  underscore.each(row_nodes, function (d) {

	    // console.log('row_node '+d.name)

	    var tmp_group = d.group[inst_level];
	    var inst_index = underscore.indexOf(row_nodes_names, d.name);
	    var inst_top = params.viz.y_scale(inst_index);
	    var inst_bot = inst_top + params.viz.y_scale.rangeBand();

	    if (underscore.has(triangle_info, tmp_group) === false) {
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

	  underscore.each(triangle_info, function (d) {
	    group_info.push(d);
	  });

	  return group_info;
	};

/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function calc_col_dendro_triangles(params) {

	  var triangle_info = {};
	  var inst_level = params.group_level.col;
	  var col_nodes = params.network_data.col_nodes;
	  var col_nodes_names = params.network_data.col_nodes_names;

	  underscore.each(col_nodes, function (d) {

	    var tmp_group = d.group[inst_level];
	    var inst_index = underscore.indexOf(col_nodes_names, d.name);
	    var inst_top = params.viz.x_scale(inst_index);
	    var inst_bot = inst_top + params.viz.x_scale.rangeBand();

	    if (underscore.has(triangle_info, tmp_group) === false) {
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

	  underscore.each(triangle_info, function (d) {
	    group_info.push(d);
	  });

	  return group_info;
		};

/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	var dendro_shade_bars = __webpack_require__(111);

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

	        if (d3.select(params.viz.viz_svg).classed('running_update') === false) {
	          make_shadow_bars();
	        }
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

/***/ }),
/* 111 */
/***/ (function(module, exports) {

	module.exports = function dendro_shade_bars(params, inst_selection, inst_rc, inst_data) {

	  var inst_opacity = 0.2;
	  var bot_height;

	  d3.selectAll(params.root + ' .dendro_shadow').remove();

	  if (inst_rc == 'row') {

	    // top shade
	    d3.select(params.root + ' .clust_group').append('rect').attr('width', params.viz.clust.dim.width + 'px').attr('height', inst_data.pos_top + 'px').attr('fill', 'black').classed('dendro_shadow', true).attr('opacity', inst_opacity);

	    bot_height = params.viz.clust.dim.height - inst_data.pos_bot;
	    // bottom shade
	    d3.select(params.root + ' .clust_group').append('rect').attr('width', params.viz.clust.dim.width + 'px').attr('height', bot_height + 'px').attr('transform', 'translate(0,' + inst_data.pos_bot + ')').attr('fill', 'black').classed('dendro_shadow', true).attr('opacity', inst_opacity);
	  } else if (inst_rc === 'col') {

	    // top shade
	    d3.select(params.root + ' .clust_group').append('rect').attr('width', inst_data.pos_top + 'px').attr('height', params.viz.clust.dim.height + 'px').attr('fill', 'black').classed('dendro_shadow', true).attr('opacity', inst_opacity);

	    // bottom shade
	    bot_height = params.viz.clust.dim.width - inst_data.pos_bot;
	    d3.select(params.root + ' .clust_group').append('rect').attr('width', bot_height + 'px').attr('height', params.viz.clust.dim.height + 'px').attr('transform', 'translate(' + inst_data.pos_bot + ',0)').attr('fill', 'black').classed('dendro_shadow', true).attr('opacity', inst_opacity);
	  }
		};

/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_row_dendro_triangles = __webpack_require__(108);
	var calc_col_dendro_triangles = __webpack_require__(109);
	var d3_tip_custom = __webpack_require__(100);
	var dendro_group_highlight = __webpack_require__(110);
	var run_dendro_filter = __webpack_require__(113);
	var zoom_crop_triangles = __webpack_require__(114);

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
	  var tmp_y_offset = 5;
	  var tmp_x_offset = -5;
	  var dendro_crop_tip = d3_tip_custom().attr('class', function () {
	    var root_tip_selector = params.viz.root_tips.replace('.', '');
	    var class_string = root_tip_selector + ' d3-tip ' + root_tip_selector + '_' + inst_rc + '_dendro_crop_tip';

	    return class_string;
	  }).direction('nw').style('display', 'none').offset([tmp_y_offset, tmp_x_offset]);

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

	      var output_string = 'M' + start_x + ',' + start_y + ' L' + mid_x + ', ' + mid_y + ' L' + final_x + ',' + final_y + ' Z';

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

	      var output_string = 'M' + start_x + ',' + start_y + ' L' + mid_x + ', ' + mid_y + ' L' + final_x + ',' + final_y + ' Z';

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

/***/ }),
/* 113 */
/***/ (function(module, exports) {

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

	    // overwrite with backup of original nodes
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

/***/ }),
/* 114 */
/***/ (function(module, exports) {

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

/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_cat_cluster_breakdown = __webpack_require__(116);
	var underscore = __webpack_require__(3);
	var cat_breakdown_bars = __webpack_require__(129);
	var cat_breakdown_values = __webpack_require__(130);

	module.exports = function make_cat_breakdown_graph(params, inst_rc, inst_data, dendro_info, selector, tooltip = false) {

	  /*
	  This function is used to make the category breakdown graphs for tooltips on
	  dendrogram mousover and on dendrogram click modal popup.
	  */

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
	    var width = 370;
	    var title_height = 27;
	    var shift_tooltip_left = 177;
	    var bar_offset = 23;

	    // these are the indexes where the number-of-nodes and the number of downsampled
	    // nodes are stored
	    var num_nodes_index = 4;
	    var num_nodes_ds_index = 5;
	    var offset_ds_count = 150;

	    var is_downsampled = false;
	    if (cat_breakdown[0].bar_data[0][num_nodes_ds_index] != null) {
	      width = width + 100;
	      shift_tooltip_left = shift_tooltip_left + offset_ds_count - 47;
	      is_downsampled = true;
	    }

	    // the index that will be used to generate the bars (will be different if
	    // downsampled)
	    var cluster_total = dendro_info.all_names.length;
	    var bars_index = num_nodes_index;
	    if (is_downsampled) {
	      bars_index = num_nodes_ds_index;

	      // calculate the total number of nodes in downsampled case
	      var inst_bar_data = cat_breakdown[0].bar_data;
	      cluster_total = 0;
	      underscore.each(inst_bar_data, function (tmp_data) {
	        cluster_total = cluster_total + tmp_data[num_nodes_ds_index];
	      });
	    }

	    // limit on the number of category types shown
	    var max_cats = 3;
	    // limit the number of bars shown
	    var max_bars = 25;

	    // calculate height needed for svg based on cat_breakdown data
	    var svg_height = 20;
	    underscore.each(cat_breakdown.slice(0, max_cats), function (tmp_break) {
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

	    cluster_info_container.style('margin-bottom', '5px');

	    // make background
	    main_dendro_svg.append('rect').classed('cat_background', true).attr('height', svg_height + 'px').attr('width', width + 'px').attr('fill', 'white').attr('opacity', 1);

	    // limit the category-types
	    cat_breakdown = cat_breakdown.slice(0, max_cats);

	    // shift the position of the numbers based on the size of the number
	    // offset the count column based on how large the counts are
	    var digit_offset_scale = d3.scale.linear().domain([0, 100000]).range([20, 30]);

	    // the total amout to shift down the next category
	    var shift_down = title_height;

	    underscore.each(cat_breakdown, function (cat_data) {

	      var max_bar_value = cat_data.bar_data[0][bars_index];

	      var count_offset = digit_offset_scale(max_bar_value);

	      var cat_graph_group = main_dendro_svg.append('g').classed('cat_graph_group', true).attr('transform', 'translate(10, ' + shift_down + ')');

	      var cat_bar_container = cat_graph_group.append('g').classed('cat_bar_container', true).attr('transform', 'translate(0, 10)');

	      // make bar groups (hold bar and text)
	      var cat_bar_groups = cat_bar_container.selectAll('g').data(cat_data.bar_data).enter().append('g').attr('transform', function (d, i) {
	        var inst_y = i * bar_offset;
	        return 'translate(0,' + inst_y + ')';
	      });

	      cat_breakdown_bars(params, cat_data, cat_graph_group, title_height, bars_index, max_bars, cat_bar_groups);

	      cat_breakdown_values(params, cat_graph_group, cat_bar_groups, num_nodes_index, is_downsampled, count_offset, bars_index, cluster_total);

	      // shift down based on number of bars
	      shift_down = shift_down + title_height * (cat_data.bar_data.length + 1);
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
	        shift_top = 0;
	        shift_left = shift_tooltip_left;

	        // // prevent graph from being too high
	        // if (dendro_info.pos_top < svg_height){
	        //   // do not shift position of category breakdown graph
	        //   // shift_top = -(svg_height + (dendro_info.pos_mid - dendro_info.pos_top)/2) ;
	        // }
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

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	var binom_test = __webpack_require__(117);
	var underscore = __webpack_require__(3);

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
	  var num_in_clust_index = null;
	  var is_downsampled = false;

	  var inst_name;
	  underscore.each(all_nodes, function (inst_node) {

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
	    var tmp_types_index = underscore.keys(inst_cat_info);
	    // this will hold the indexes of string-type categories
	    var cat_types_index = [];

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
	      } else {

	        // save number in clust category index if found
	        if (params.viz.cat_names[inst_rc][cat_index] === 'number in clust') {
	          num_in_clust_index = cat_index;
	          is_downsampled = true;
	        }
	      }
	    }

	    var tmp_run_count = {};
	    var inst_breakdown = {};
	    var bar_data;
	    var radix_param = 10;

	    // sort by actual counts (rather than cluster counts)
	    var sorting_index = 4;
	    if (is_downsampled) {
	      sorting_index = 5;
	    }

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

	      // use the cat_hist to get the number of instances of this category in
	      // all rows/cols
	      // params

	      underscore.each(cat_types_index, function (cat_index) {

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

	        // loop through the nodes and keep a running count of categories
	        underscore.each(clust_nodes, function (tmp_node) {

	          cat_name = tmp_node[cat_index];

	          if (cat_name.indexOf(': ') >= 0) {
	            cat_name = cat_name.split(': ')[1];
	          }

	          if (cat_name in tmp_run_count[type_name]) {
	            tmp_run_count[type_name][cat_name].num_nodes = tmp_run_count[type_name][cat_name].num_nodes + 1;

	            if (num_in_clust_index != null) {
	              tmp_run_count[type_name][cat_name].num_nodes_ds = tmp_run_count[type_name][cat_name].num_nodes_ds + parseInt(tmp_node[num_in_clust_index].split(': ')[1], radix_param);
	            }
	          } else {

	            tmp_run_count[type_name][cat_name] = {};
	            tmp_run_count[type_name][cat_name].num_nodes = 1;
	            if (num_in_clust_index != null) {
	              tmp_run_count[type_name][cat_name].num_nodes_ds = parseInt(tmp_node[num_in_clust_index].split(': ')[1], radix_param);
	            }
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

	          var tot_num_cat = params.viz.cat_info[inst_rc][cat_index].cat_hist[inst_cat];
	          var total_nodes = params.network_data[inst_rc + '_nodes'].length;
	          var expect_prob = tot_num_cat / total_nodes;

	          // if no cat-title given
	          if (no_title_given) {
	            cat_title_and_name = inst_cat;
	          } else {
	            cat_title_and_name = type_name + ': ' + inst_cat;
	          }

	          // num_nodes: number of cat-nodes drawn in cluster
	          var num_nodes = inst_run_count[inst_cat].num_nodes;

	          var actual_k = num_nodes;
	          var pval = binom_test(actual_k, num_in_clust, expect_prob);

	          // working on tracking the 'real' number of nodes, which is only different
	          // if downsampling has been done
	          if (_.has(inst_run_count[inst_cat], 'num_nodes_ds')) {
	            var num_nodes_ds = inst_run_count[inst_cat].num_nodes_ds;
	          } else {
	            num_nodes_ds = null;
	          }

	          bar_color = params.viz.cat_colors[inst_rc][cat_index][cat_title_and_name];

	          bar_data.push([cat_index, cat_title_and_name, inst_run_count[inst_cat], bar_color, num_nodes, num_nodes_ds, pval]);
	        }

	        bar_data.sort(function (a, b) {
	          return b[sorting_index] - a[sorting_index];
	        });

	        inst_breakdown.bar_data = bar_data;

	        cat_breakdown.push(inst_breakdown);
	      });
	    }
	  }

	  return cat_breakdown;
	};

/***/ }),
/* 117 */
/***/ (function(module, exports, __webpack_require__) {

	
	// Load the math.js core
	// Create a new, empty math.js instance
	// It will only contain methods `import` and `config`
	// math.import(require('mathjs/lib/type/fraction'));
	var p_dict = __webpack_require__(118);
	var core = __webpack_require__(13);
	var math = core.create();

	math.import(__webpack_require__(119));

	module.exports = function binom_test(actual_k, n, p) {

	  var fact = math.factorial;
	  var pval;

	  function binom_dist(k, n, p) {
	    var bin_coeff = fact(n) / (fact(k) * fact(n - k));
	    p = bin_coeff * (Math.pow(p, k) * Math.pow(1 - p, n - k));
	    return p;
	  }

	  function my_binom_test_2(actual_k, n, p) {
	    var cp = 0;
	    var k;
	    var dp;
	    for (var inst_k = actual_k; inst_k < n + 1; inst_k++) {
	      k = inst_k;
	      dp = binom_dist(k, n, p);
	      cp = cp + dp;
	    }

	    return cp;
	  }

	  // look up p-value from z-score using table
	  function binom_prop_table(actual_k, n, p) {

	    // expected average number of successes
	    var mu = n * p;

	    // standard deviation
	    var sigma = Math.sqrt(n * p * (1 - p));

	    // how many standard deviations is the actual_k away
	    // from the expected value
	    var z = (actual_k - mu) / sigma;

	    var z_vals = p_dict.z;
	    var p_vals = p_dict.p;

	    var found_index = -1;
	    var found = false;

	    for (var index = 0; index < z_vals.length; index++) {
	      var inst_z = z_vals[index];

	      // increasing inst_z until z is less than inst_z
	      if (z < inst_z && found === false) {
	        found_index = index;
	        found = true;
	      }
	    }

	    // give it the smallest p-val if the z-score was larger than
	    // any in the table
	    if (found_index === -1) {
	      found_index = z_vals.length - 1;
	    }
	    pval = p_vals[found_index];

	    return pval;
	  }

	  // calculate pval
	  pval = my_binom_test_2(actual_k, n, p);
	  if (isNaN(pval)) {
	    pval = binom_prop_table(actual_k, n, p);
	  }

	  return pval;
		};

/***/ }),
/* 118 */
/***/ (function(module, exports) {

	module.exports = {
	  "p": [0.5, 0.48006119416162751, 0.46017216272297101, 0.4403823076297575, 0.42074029056089696, 0.4012936743170763, 0.38208857781104733, 0.3631693488243809, 0.34457825838967582, 0.32635522028791997, 0.30853753872598688, 0.29115968678834636, 0.27425311775007355, 0.25784611080586473, 0.24196365222307303, 0.22662735237686821, 0.21185539858339669, 0.19766254312269238, 0.18406012534675947, 0.17105612630848183, 0.15865525393145707, 0.14685905637589591, 0.13566606094638267, 0.12507193563715024, 0.11506967022170828, 0.10564977366685535, 0.096800484585610358, 0.088507991437401956, 0.080756659233771066, 0.073529259609648304, 0.066807201268858071, 0.060570758002059008, 0.054799291699557974, 0.049471468033648075, 0.044565462758543006, 0.040059156863817086, 0.035930319112925789, 0.032156774795613713, 0.028716559816001783, 0.025588059521638611, 0.022750131948179195, 0.020182215405704383, 0.017864420562816542, 0.015777607391090499, 0.013903447513498595, 0.012224472655044696, 0.010724110021675795, 0.0093867055348385662, 0.0081975359245961138, 0.0071428107352714152, 0.0062096653257761323, 0.0053861459540666843, 0.0046611880237187467, 0.0040245885427583027, 0.0034669738030406647, 0.0029797632350545551, 0.002555130330427929, 0.0021859614549132405, 0.0018658133003840339, 0.0015888696473648667, 0.0013498980316300933, 0.0011442068310226977, 0.00096760321321835631, 0.00081635231282856037, 0.00068713793791584708, 0.00057702504239076592, 0.00048342414238377663, 0.0004040578018640207, 0.00033692926567687988, 0.00028029327681617744, 0.00023262907903552502, 0.00019261557563563279, 0.00015910859015753364, 0.00013112015442048433, 0.00010779973347738823, 8.8417285200803773e-05, 7.2348043925119787e-05, 5.9058912418922374e-05, 4.8096344017602614e-05, 3.9075596597787456e-05, 3.1671241833119863e-05, 2.5608816474041489e-05, 2.0657506912546683e-05, 1.6623763729652213e-05, 1.334574901590631e-05, 1.0688525774934402e-05, 8.5399054709917942e-06, 6.8068765993340312e-06, 5.4125439077038407e-06, 4.293514469971858e-06, 3.3976731247300535e-06, 2.6822957796388472e-06, 2.1124547025028419e-06, 1.6596751443714555e-06, 1.3008074539172771e-06, 1.0170832425687032e-06, 7.9332815197558919e-07, 6.1730737200919249e-07, 4.7918327659031855e-07, 3.7106740796333271e-07, 2.8665157187919333e-07, 2.2090503226954194e-07, 1.6982674071475937e-07, 1.3024322953320117e-07, 9.9644263169334701e-08, 7.6049605164887e-08, 5.7901340399645569e-08, 4.3977115940058689e-08, 3.3320448485428448e-08, 2.518491005446105e-08, 1.8989562465887681e-08, 1.4283479893922661e-08, 1.0717590258310852e-08, 8.0223918506634739e-09, 5.9903714010635304e-09, 4.4621724539016108e-09, 3.3157459783261365e-09, 2.4578650618080152e-09, 1.8175078630994235e-09, 1.3407124440918662e-09, 9.8658764503769458e-10, 7.2422917051376055e-10, 5.303423262948808e-10, 3.8741473466756636e-10, 2.8231580370432682e-10, 2.0522634252189396e-10, 1.4882282217622966e-10, 1.0765746385121517e-10, 7.7688475817097756e-11, 5.592507575942645e-11, 4.0160005838590881e-11, 2.8768541736043109e-11, 2.055788909399508e-11, 1.4654650977302715e-11, 1.0420976987965154e-11, 7.3922577780177942e-12, 5.2309575441445253e-12, 3.6924994272355614e-12, 2.600126965638173e-12, 1.8264310619769611e-12, 1.279812543885835e-12, 8.9458895587698439e-13, 6.23784446333152e-13, 4.3388950271780343e-13, 3.0106279811174218e-13, 2.0838581586720548e-13, 1.4388386381575764e-13, 9.9103427495475088e-14, 6.8092248906200155e-14, 4.6670115887190274e-14, 3.1908916729108844e-14, 2.1762912097085575e-14, 1.4806537490047908e-14, 1.0048965656526223e-14, 6.8033115407739012e-15, 4.5946274357785623e-15, 3.095358771958668e-15, 2.0801863521393674e-15, 1.394517146659261e-15, 9.3255757716812045e-16, 6.2209605742717405e-16, 4.1397018162731219e-16, 2.7479593923982212e-16, 1.8196213635266084e-16, 1.2019351542735647e-16, 7.9197263146424757e-17, 5.2055697448902465e-17, 3.4131483264581459e-17, 2.232393197288031e-17, 1.456514112590909e-17, 9.4795348222032499e-18, 6.1544255908503949e-18, 3.985804962848151e-18, 2.5749715380118873e-18, 1.6594208699647519e-18, 1.0667637375474856e-18, 6.840807685935497e-19, 4.3759647993090167e-19, 2.7923343749396233e-19, 1.7774117841455144e-19, 1.1285884059538324e-19, 7.1484170112696837e-20, 4.516591491435403e-20, 2.8466774084602088e-20, 1.7897488120140146e-20, 1.1224633591327901e-20, 7.0222842404415411e-21, 4.3823862990664603e-21, 2.7281535713460872e-21, 1.6941535024881097e-21, 1.0494515075362604e-21, 6.4848144530772079e-22, 3.9972212057261192e-22, 2.4577864834723153e-22, 1.5074931688101589e-22, 9.2234135249393526e-23, 5.6292823113765143e-23, 3.4271987941135974e-23, 2.0813752194932085e-23, 1.2609160670206559e-23],
	  "z": [0.0, 0.050000000000000003, 0.10000000000000001, 0.15000000000000002, 0.20000000000000001, 0.25, 0.30000000000000004, 0.35000000000000003, 0.40000000000000002, 0.45000000000000001, 0.5, 0.55000000000000004, 0.60000000000000009, 0.65000000000000002, 0.70000000000000007, 0.75, 0.80000000000000004, 0.85000000000000009, 0.90000000000000002, 0.95000000000000007, 1.0, 1.05, 1.1000000000000001, 1.1500000000000001, 1.2000000000000002, 1.25, 1.3, 1.3500000000000001, 1.4000000000000001, 1.4500000000000002, 1.5, 1.55, 1.6000000000000001, 1.6500000000000001, 1.7000000000000002, 1.75, 1.8, 1.8500000000000001, 1.9000000000000001, 1.9500000000000002, 2.0, 2.0500000000000003, 2.1000000000000001, 2.1499999999999999, 2.2000000000000002, 2.25, 2.3000000000000003, 2.3500000000000001, 2.4000000000000004, 2.4500000000000002, 2.5, 2.5500000000000003, 2.6000000000000001, 2.6500000000000004, 2.7000000000000002, 2.75, 2.8000000000000003, 2.8500000000000001, 2.9000000000000004, 2.9500000000000002, 3.0, 3.0500000000000003, 3.1000000000000001, 3.1500000000000004, 3.2000000000000002, 3.25, 3.3000000000000003, 3.3500000000000001, 3.4000000000000004, 3.4500000000000002, 3.5, 3.5500000000000003, 3.6000000000000001, 3.6500000000000004, 3.7000000000000002, 3.75, 3.8000000000000003, 3.8500000000000001, 3.9000000000000004, 3.9500000000000002, 4.0, 4.0499999999999998, 4.1000000000000005, 4.1500000000000004, 4.2000000000000002, 4.25, 4.2999999999999998, 4.3500000000000005, 4.4000000000000004, 4.4500000000000002, 4.5, 4.5499999999999998, 4.6000000000000005, 4.6500000000000004, 4.7000000000000002, 4.75, 4.8000000000000007, 4.8500000000000005, 4.9000000000000004, 4.9500000000000002, 5.0, 5.0500000000000007, 5.1000000000000005, 5.1500000000000004, 5.2000000000000002, 5.25, 5.3000000000000007, 5.3500000000000005, 5.4000000000000004, 5.4500000000000002, 5.5, 5.5500000000000007, 5.6000000000000005, 5.6500000000000004, 5.7000000000000002, 5.75, 5.8000000000000007, 5.8500000000000005, 5.9000000000000004, 5.9500000000000002, 6.0, 6.0500000000000007, 6.1000000000000005, 6.1500000000000004, 6.2000000000000002, 6.25, 6.3000000000000007, 6.3500000000000005, 6.4000000000000004, 6.4500000000000002, 6.5, 6.5500000000000007, 6.6000000000000005, 6.6500000000000004, 6.7000000000000002, 6.75, 6.8000000000000007, 6.8500000000000005, 6.9000000000000004, 6.9500000000000002, 7.0, 7.0500000000000007, 7.1000000000000005, 7.1500000000000004, 7.2000000000000002, 7.25, 7.3000000000000007, 7.3500000000000005, 7.4000000000000004, 7.4500000000000002, 7.5, 7.5500000000000007, 7.6000000000000005, 7.6500000000000004, 7.7000000000000002, 7.75, 7.8000000000000007, 7.8500000000000005, 7.9000000000000004, 7.9500000000000002, 8.0, 8.0500000000000007, 8.0999999999999996, 8.1500000000000004, 8.2000000000000011, 8.25, 8.3000000000000007, 8.3499999999999996, 8.4000000000000004, 8.4500000000000011, 8.5, 8.5500000000000007, 8.5999999999999996, 8.6500000000000004, 8.7000000000000011, 8.75, 8.8000000000000007, 8.8499999999999996, 8.9000000000000004, 8.9500000000000011, 9.0, 9.0500000000000007, 9.0999999999999996, 9.1500000000000004, 9.2000000000000011, 9.25, 9.3000000000000007, 9.3499999999999996, 9.4000000000000004, 9.4500000000000011, 9.5, 9.5500000000000007, 9.6000000000000014, 9.6500000000000004, 9.7000000000000011, 9.75, 9.8000000000000007, 9.8500000000000014, 9.9000000000000004, 9.9500000000000011]
		};

/***/ }),
/* 119 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var deepMap = __webpack_require__(120);

	function factory(type, config, load, typed) {
	  var gamma = load(__webpack_require__(121));
	  var latex = __webpack_require__(46);

	  /**
	   * Compute the factorial of a value
	   *
	   * Factorial only supports an integer value as argument.
	   * For matrices, the function is evaluated element wise.
	   *
	   * Syntax:
	   *
	   *    math.factorial(n)
	   *
	   * Examples:
	   *
	   *    math.factorial(5);    // returns 120
	   *    math.factorial(3);    // returns 6
	   *
	   * See also:
	   *
	   *    combinations, gamma, permutations
	   *
	   * @param {number | BigNumber | Array | Matrix} n   An integer number
	   * @return {number | BigNumber | Array | Matrix}    The factorial of `n`
	   */
	  var factorial = typed('factorial', {
	    'number': function (n) {
	      if (n < 0) {
	        throw new Error('Value must be non-negative');
	      }

	      return gamma(n + 1);
	    },

	    'BigNumber': function (n) {
	      if (n.isNegative()) {
	        throw new Error('Value must be non-negative');
	      }

	      return gamma(n.plus(1));
	    },

	    'Array | Matrix': function (n) {
	      return deepMap(n, factorial);
	    }
	  });

	  factorial.toTex = {
	    1: '\\left(${args[0]}\\right)' + latex.operators['factorial']
	  };

	  return factorial;
	}

	exports.name = 'factorial';
	exports.factory = factory;

/***/ }),
/* 120 */
/***/ (function(module, exports) {

	'use strict';

	/**
	 * Execute the callback function element wise for each element in array and any
	 * nested array
	 * Returns an array with the results
	 * @param {Array | Matrix} array
	 * @param {Function} callback   The callback is called with two parameters:
	 *                              value1 and value2, which contain the current
	 *                              element of both arrays.
	 * @param {boolean} [skipZeros] Invoke callback function for non-zero values only.
	 *
	 * @return {Array | Matrix} res
	 */

	module.exports = function deepMap(array, callback, skipZeros) {
	  if (array && typeof array.map === 'function') {
	    // TODO: replace array.map with a for loop to improve performance
	    return array.map(function (x) {
	      return deepMap(x, callback, skipZeros);
	    });
	  } else {
	    return callback(array);
	  }
	};

/***/ }),
/* 121 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var deepMap = __webpack_require__(120);
	var isInteger = __webpack_require__(19).isInteger;

	function factory(type, config, load, typed) {
	  var multiply = load(__webpack_require__(122));
	  var pow = load(__webpack_require__(125));

	  /**
	   * Compute the gamma function of a value using Lanczos approximation for
	   * small values, and an extended Stirling approximation for large values.
	   *
	   * For matrices, the function is evaluated element wise.
	   *
	   * Syntax:
	   *
	   *    math.gamma(n)
	   *
	   * Examples:
	   *
	   *    math.gamma(5);       // returns 24
	   *    math.gamma(-0.5);    // returns -3.5449077018110335
	   *    math.gamma(math.i);  // returns -0.15494982830180973 - 0.49801566811835596i
	   *
	   * See also:
	   *
	   *    combinations, factorial, permutations
	   *
	   * @param {number | Array | Matrix} n   A real or complex number
	   * @return {number | Array | Matrix}    The gamma of `n`
	   */
	  var gamma = typed('gamma', {
	    'number': function (n) {
	      var t, x;

	      if (isInteger(n)) {
	        if (n <= 0) {
	          return isFinite(n) ? Infinity : NaN;
	        }

	        if (n > 171) {
	          return Infinity; // Will overflow
	        }

	        var value = n - 2;
	        var res = n - 1;
	        while (value > 1) {
	          res *= value;
	          value--;
	        }

	        if (res == 0) {
	          res = 1; // 0! is per definition 1
	        }

	        return res;
	      }

	      if (n < 0.5) {
	        return Math.PI / (Math.sin(Math.PI * n) * gamma(1 - n));
	      }

	      if (n >= 171.35) {
	        return Infinity; // will overflow
	      }

	      if (n > 85.0) {
	        // Extended Stirling Approx
	        var twoN = n * n;
	        var threeN = twoN * n;
	        var fourN = threeN * n;
	        var fiveN = fourN * n;
	        return Math.sqrt(2 * Math.PI / n) * Math.pow(n / Math.E, n) * (1 + 1 / (12 * n) + 1 / (288 * twoN) - 139 / (51840 * threeN) - 571 / (2488320 * fourN) + 163879 / (209018880 * fiveN) + 5246819 / (75246796800 * fiveN * n));
	      }

	      --n;
	      x = p[0];
	      for (var i = 1; i < p.length; ++i) {
	        x += p[i] / (n + i);
	      }

	      t = n + g + 0.5;
	      return Math.sqrt(2 * Math.PI) * Math.pow(t, n + 0.5) * Math.exp(-t) * x;
	    },

	    'Complex': function (n) {
	      var t, x;

	      if (n.im == 0) {
	        return gamma(n.re);
	      }

	      n = new type.Complex(n.re - 1, n.im);
	      x = new type.Complex(p[0], 0);
	      for (var i = 1; i < p.length; ++i) {
	        var real = n.re + i; // x += p[i]/(n+i)
	        var den = real * real + n.im * n.im;
	        if (den != 0) {
	          x.re += p[i] * real / den;
	          x.im += -(p[i] * n.im) / den;
	        } else {
	          x.re = p[i] < 0 ? -Infinity : Infinity;
	        }
	      }

	      t = new type.Complex(n.re + g + 0.5, n.im);
	      var twoPiSqrt = Math.sqrt(2 * Math.PI);

	      n.re += 0.5;
	      var result = pow(t, n);
	      if (result.im == 0) {
	        // sqrt(2*PI)*result
	        result.re *= twoPiSqrt;
	      } else if (result.re == 0) {
	        result.im *= twoPiSqrt;
	      } else {
	        result.re *= twoPiSqrt;
	        result.im *= twoPiSqrt;
	      }

	      var r = Math.exp(-t.re); // exp(-t)
	      t.re = r * Math.cos(-t.im);
	      t.im = r * Math.sin(-t.im);

	      return multiply(multiply(result, t), x);
	    },

	    'BigNumber': function (n) {
	      if (n.isInteger()) {
	        return n.isNegative() || n.isZero() ? new type.BigNumber(Infinity) : bigFactorial(n.minus(1));
	      }

	      if (!n.isFinite()) {
	        return new type.BigNumber(n.isNegative() ? NaN : Infinity);
	      }

	      throw new Error('Integer BigNumber expected');
	    },

	    'Array | Matrix': function (n) {
	      return deepMap(n, gamma);
	    }
	  });

	  /**
	   * Calculate factorial for a BigNumber
	   * @param {BigNumber} n
	   * @returns {BigNumber} Returns the factorial of n
	   */
	  function bigFactorial(n) {
	    if (n.isZero()) {
	      return new type.BigNumber(1); // 0! is per definition 1
	    }

	    var precision = config.precision + (Math.log(n.toNumber()) | 0);
	    var Big = type.BigNumber.clone({ precision: precision });

	    var res = new Big(n);
	    var value = n.toNumber() - 1; // number
	    while (value > 1) {
	      res = res.times(value);
	      value--;
	    }

	    return new type.BigNumber(res.toPrecision(type.BigNumber.precision));
	  }

	  gamma.toTex = { 1: '\\Gamma\\left(${args[0]}\\right)' };

	  return gamma;
	}

	// TODO: comment on the variables g and p

	var g = 4.7421875;

	var p = [0.99999999999999709182, 57.156235665862923517, -59.597960355475491248, 14.136097974741747174, -0.49191381609762019978, 0.33994649984811888699e-4, 0.46523628927048575665e-4, -0.98374475304879564677e-4, 0.15808870322491248884e-3, -0.21026444172410488319e-3, 0.21743961811521264320e-3, -0.16431810653676389022e-3, 0.84418223983852743293e-4, -0.26190838401581408670e-4, 0.36899182659531622704e-5];

	exports.name = 'gamma';
	exports.factory = factory;

/***/ }),
/* 122 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var extend = __webpack_require__(15).extend;
	var array = __webpack_require__(29);

	function factory(type, config, load, typed) {
	  var latex = __webpack_require__(46);

	  var matrix = load(__webpack_require__(44));
	  var addScalar = load(__webpack_require__(45));
	  var multiplyScalar = load(__webpack_require__(123));
	  var equalScalar = load(__webpack_require__(40));

	  var algorithm11 = load(__webpack_require__(124));
	  var algorithm14 = load(__webpack_require__(51));

	  var DenseMatrix = type.DenseMatrix;
	  var SparseMatrix = type.SparseMatrix;

	  /**
	   * Multiply two or more values, `x * y`.
	   * For matrices, the matrix product is calculated.
	   *
	   * Syntax:
	   *
	   *    math.multiply(x, y)
	   *    math.multiply(x, y, z, ...)
	   *
	   * Examples:
	   *
	   *    math.multiply(4, 5.2);        // returns number 20.8
	   *    math.multiply(2, 3, 4);       // returns number 24
	   *
	   *    var a = math.complex(2, 3);
	   *    var b = math.complex(4, 1);
	   *    math.multiply(a, b);          // returns Complex 5 + 14i
	   *
	   *    var c = [[1, 2], [4, 3]];
	   *    var d = [[1, 2, 3], [3, -4, 7]];
	   *    math.multiply(c, d);          // returns Array [[7, -6, 17], [13, -4, 33]]
	   *
	   *    var e = math.unit('2.1 km');
	   *    math.multiply(3, e);          // returns Unit 6.3 km
	   *
	   * See also:
	   *
	   *    divide, prod, cross, dot
	   *
	   * @param  {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} x First value to multiply
	   * @param  {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} y Second value to multiply
	   * @return {number | BigNumber | Fraction | Complex | Unit | Array | Matrix} Multiplication of `x` and `y`
	   */
	  var multiply = typed('multiply', extend({
	    // we extend the signatures of multiplyScalar with signatures dealing with matrices

	    'Array, Array': function (x, y) {
	      // check dimensions
	      _validateMatrixDimensions(array.size(x), array.size(y));

	      // use dense matrix implementation
	      var m = multiply(matrix(x), matrix(y));
	      // return array or scalar
	      return type.isMatrix(m) ? m.valueOf() : m;
	    },

	    'Matrix, Matrix': function (x, y) {
	      // dimensions
	      var xsize = x.size();
	      var ysize = y.size();

	      // check dimensions
	      _validateMatrixDimensions(xsize, ysize);

	      // process dimensions
	      if (xsize.length === 1) {
	        // process y dimensions
	        if (ysize.length === 1) {
	          // Vector * Vector
	          return _multiplyVectorVector(x, y, xsize[0]);
	        }
	        // Vector * Matrix
	        return _multiplyVectorMatrix(x, y);
	      }
	      // process y dimensions
	      if (ysize.length === 1) {
	        // Matrix * Vector
	        return _multiplyMatrixVector(x, y);
	      }
	      // Matrix * Matrix
	      return _multiplyMatrixMatrix(x, y);
	    },

	    'Matrix, Array': function (x, y) {
	      // use Matrix * Matrix implementation
	      return multiply(x, matrix(y));
	    },

	    'Array, Matrix': function (x, y) {
	      // use Matrix * Matrix implementation
	      return multiply(matrix(x, y.storage()), y);
	    },

	    'Matrix, any': function (x, y) {
	      // result
	      var c;

	      // process storage format
	      switch (x.storage()) {
	        case 'sparse':
	          c = algorithm11(x, y, multiplyScalar, false);
	          break;
	        case 'dense':
	          c = algorithm14(x, y, multiplyScalar, false);
	          break;
	      }
	      return c;
	    },

	    'any, Matrix': function (x, y) {
	      // result
	      var c;
	      // check storage format
	      switch (y.storage()) {
	        case 'sparse':
	          c = algorithm11(y, x, multiplyScalar, true);
	          break;
	        case 'dense':
	          c = algorithm14(y, x, multiplyScalar, true);
	          break;
	      }
	      return c;
	    },

	    'Array, any': function (x, y) {
	      // use matrix implementation
	      return algorithm14(matrix(x), y, multiplyScalar, false).valueOf();
	    },

	    'any, Array': function (x, y) {
	      // use matrix implementation
	      return algorithm14(matrix(y), x, multiplyScalar, true).valueOf();
	    },

	    'any, any': multiplyScalar,

	    'Array | Matrix | any, Array | Matrix | any, ...any': function (x, y, rest) {
	      var result = multiply(x, y);

	      for (var i = 0; i < rest.length; i++) {
	        result = multiply(result, rest[i]);
	      }

	      return result;
	    }
	  }, multiplyScalar.signatures));

	  var _validateMatrixDimensions = function (size1, size2) {
	    // check left operand dimensions
	    switch (size1.length) {
	      case 1:
	        // check size2
	        switch (size2.length) {
	          case 1:
	            // Vector x Vector
	            if (size1[0] !== size2[0]) {
	              // throw error
	              throw new RangeError('Dimension mismatch in multiplication. Vectors must have the same length');
	            }
	            break;
	          case 2:
	            // Vector x Matrix
	            if (size1[0] !== size2[0]) {
	              // throw error
	              throw new RangeError('Dimension mismatch in multiplication. Vector length (' + size1[0] + ') must match Matrix rows (' + size2[0] + ')');
	            }
	            break;
	          default:
	            throw new Error('Can only multiply a 1 or 2 dimensional matrix (Matrix B has ' + size2.length + ' dimensions)');
	        }
	        break;
	      case 2:
	        // check size2
	        switch (size2.length) {
	          case 1:
	            // Matrix x Vector
	            if (size1[1] !== size2[0]) {
	              // throw error
	              throw new RangeError('Dimension mismatch in multiplication. Matrix columns (' + size1[1] + ') must match Vector length (' + size2[0] + ')');
	            }
	            break;
	          case 2:
	            // Matrix x Matrix
	            if (size1[1] !== size2[0]) {
	              // throw error
	              throw new RangeError('Dimension mismatch in multiplication. Matrix A columns (' + size1[1] + ') must match Matrix B rows (' + size2[0] + ')');
	            }
	            break;
	          default:
	            throw new Error('Can only multiply a 1 or 2 dimensional matrix (Matrix B has ' + size2.length + ' dimensions)');
	        }
	        break;
	      default:
	        throw new Error('Can only multiply a 1 or 2 dimensional matrix (Matrix A has ' + size1.length + ' dimensions)');
	    }
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            Dense Vector   (N)
	   * @param {Matrix} b            Dense Vector   (N)
	   *
	   * @return {number}             Scalar value
	   */
	  var _multiplyVectorVector = function (a, b, n) {
	    // check empty vector
	    if (n === 0) throw new Error('Cannot multiply two empty vectors');

	    // a dense
	    var adata = a._data;
	    var adt = a._datatype;
	    // b dense
	    var bdata = b._data;
	    var bdt = b._datatype;

	    // datatype
	    var dt;
	    // addScalar signature to use
	    var af = addScalar;
	    // multiplyScalar signature to use
	    var mf = multiplyScalar;

	    // process data types
	    if (adt && bdt && adt === bdt && typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signatures that matches (dt, dt)
	      af = typed.find(addScalar, [dt, dt]);
	      mf = typed.find(multiplyScalar, [dt, dt]);
	    }

	    // result (do not initialize it with zero)
	    var c = mf(adata[0], bdata[0]);
	    // loop data
	    for (var i = 1; i < n; i++) {
	      // multiply and accumulate
	      c = af(c, mf(adata[i], bdata[i]));
	    }
	    return c;
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            Dense Vector   (M)
	   * @param {Matrix} b            Matrix         (MxN)
	   *
	   * @return {Matrix}             Dense Vector   (N)
	   */
	  var _multiplyVectorMatrix = function (a, b) {
	    // process storage
	    switch (b.storage()) {
	      case 'dense':
	        return _multiplyVectorDenseMatrix(a, b);
	    }
	    throw new Error('Not implemented');
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            Dense Vector   (M)
	   * @param {Matrix} b            Dense Matrix   (MxN)
	   *
	   * @return {Matrix}             Dense Vector   (N)
	   */
	  var _multiplyVectorDenseMatrix = function (a, b) {
	    // a dense
	    var adata = a._data;
	    var asize = a._size;
	    var adt = a._datatype;
	    // b dense
	    var bdata = b._data;
	    var bsize = b._size;
	    var bdt = b._datatype;
	    // rows & columns
	    var alength = asize[0];
	    var bcolumns = bsize[1];

	    // datatype
	    var dt;
	    // addScalar signature to use
	    var af = addScalar;
	    // multiplyScalar signature to use
	    var mf = multiplyScalar;

	    // process data types
	    if (adt && bdt && adt === bdt && typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signatures that matches (dt, dt)
	      af = typed.find(addScalar, [dt, dt]);
	      mf = typed.find(multiplyScalar, [dt, dt]);
	    }

	    // result
	    var c = [];

	    // loop matrix columns
	    for (var j = 0; j < bcolumns; j++) {
	      // sum (do not initialize it with zero)
	      var sum = mf(adata[0], bdata[0][j]);
	      // loop vector
	      for (var i = 1; i < alength; i++) {
	        // multiply & accumulate
	        sum = af(sum, mf(adata[i], bdata[i][j]));
	      }
	      c[j] = sum;
	    }

	    // return matrix
	    return new DenseMatrix({
	      data: c,
	      size: [bcolumns],
	      datatype: dt
	    });
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            Matrix         (MxN)
	   * @param {Matrix} b            Dense Vector   (N)
	   *
	   * @return {Matrix}             Dense Vector   (M)
	   */
	  var _multiplyMatrixVector = function (a, b) {
	    // process storage
	    switch (a.storage()) {
	      case 'dense':
	        return _multiplyDenseMatrixVector(a, b);
	      case 'sparse':
	        return _multiplySparseMatrixVector(a, b);
	    }
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            Matrix         (MxN)
	   * @param {Matrix} b            Matrix         (NxC)
	   *
	   * @return {Matrix}             Matrix         (MxC)
	   */
	  var _multiplyMatrixMatrix = function (a, b) {
	    // process storage
	    switch (a.storage()) {
	      case 'dense':
	        // process storage
	        switch (b.storage()) {
	          case 'dense':
	            return _multiplyDenseMatrixDenseMatrix(a, b);
	          case 'sparse':
	            return _multiplyDenseMatrixSparseMatrix(a, b);
	        }
	        break;
	      case 'sparse':
	        // process storage
	        switch (b.storage()) {
	          case 'dense':
	            return _multiplySparseMatrixDenseMatrix(a, b);
	          case 'sparse':
	            return _multiplySparseMatrixSparseMatrix(a, b);
	        }
	        break;
	    }
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            DenseMatrix  (MxN)
	   * @param {Matrix} b            Dense Vector (N)
	   *
	   * @return {Matrix}             Dense Vector (M) 
	   */
	  var _multiplyDenseMatrixVector = function (a, b) {
	    // a dense
	    var adata = a._data;
	    var asize = a._size;
	    var adt = a._datatype;
	    // b dense
	    var bdata = b._data;
	    var bdt = b._datatype;
	    // rows & columns
	    var arows = asize[0];
	    var acolumns = asize[1];

	    // datatype
	    var dt;
	    // addScalar signature to use
	    var af = addScalar;
	    // multiplyScalar signature to use
	    var mf = multiplyScalar;

	    // process data types
	    if (adt && bdt && adt === bdt && typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signatures that matches (dt, dt)
	      af = typed.find(addScalar, [dt, dt]);
	      mf = typed.find(multiplyScalar, [dt, dt]);
	    }

	    // result
	    var c = [];

	    // loop matrix a rows
	    for (var i = 0; i < arows; i++) {
	      // current row
	      var row = adata[i];
	      // sum (do not initialize it with zero)
	      var sum = mf(row[0], bdata[0]);
	      // loop matrix a columns
	      for (var j = 1; j < acolumns; j++) {
	        // multiply & accumulate
	        sum = af(sum, mf(row[j], bdata[j]));
	      }
	      c[i] = sum;
	    }

	    // return matrix
	    return new DenseMatrix({
	      data: c,
	      size: [arows],
	      datatype: dt
	    });
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            DenseMatrix    (MxN)
	   * @param {Matrix} b            DenseMatrix    (NxC)
	   *
	   * @return {Matrix}             DenseMatrix    (MxC)
	   */
	  var _multiplyDenseMatrixDenseMatrix = function (a, b) {
	    // a dense
	    var adata = a._data;
	    var asize = a._size;
	    var adt = a._datatype;
	    // b dense
	    var bdata = b._data;
	    var bsize = b._size;
	    var bdt = b._datatype;
	    // rows & columns
	    var arows = asize[0];
	    var acolumns = asize[1];
	    var bcolumns = bsize[1];

	    // datatype
	    var dt;
	    // addScalar signature to use
	    var af = addScalar;
	    // multiplyScalar signature to use
	    var mf = multiplyScalar;

	    // process data types
	    if (adt && bdt && adt === bdt && typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signatures that matches (dt, dt)
	      af = typed.find(addScalar, [dt, dt]);
	      mf = typed.find(multiplyScalar, [dt, dt]);
	    }

	    // result
	    var c = [];

	    // loop matrix a rows
	    for (var i = 0; i < arows; i++) {
	      // current row
	      var row = adata[i];
	      // initialize row array
	      c[i] = [];
	      // loop matrix b columns
	      for (var j = 0; j < bcolumns; j++) {
	        // sum (avoid initializing sum to zero)
	        var sum = mf(row[0], bdata[0][j]);
	        // loop matrix a columns
	        for (var x = 1; x < acolumns; x++) {
	          // multiply & accumulate
	          sum = af(sum, mf(row[x], bdata[x][j]));
	        }
	        c[i][j] = sum;
	      }
	    }

	    // return matrix
	    return new DenseMatrix({
	      data: c,
	      size: [arows, bcolumns],
	      datatype: dt
	    });
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            DenseMatrix    (MxN)
	   * @param {Matrix} b            SparseMatrix   (NxC)
	   *
	   * @return {Matrix}             SparseMatrix   (MxC)
	   */
	  var _multiplyDenseMatrixSparseMatrix = function (a, b) {
	    // a dense
	    var adata = a._data;
	    var asize = a._size;
	    var adt = a._datatype;
	    // b sparse
	    var bvalues = b._values;
	    var bindex = b._index;
	    var bptr = b._ptr;
	    var bsize = b._size;
	    var bdt = b._datatype;
	    // validate b matrix
	    if (!bvalues) throw new Error('Cannot multiply Dense Matrix times Pattern only Matrix');
	    // rows & columns
	    var arows = asize[0];
	    var bcolumns = bsize[1];

	    // datatype
	    var dt;
	    // addScalar signature to use
	    var af = addScalar;
	    // multiplyScalar signature to use
	    var mf = multiplyScalar;
	    // equalScalar signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;

	    // process data types
	    if (adt && bdt && adt === bdt && typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signatures that matches (dt, dt)
	      af = typed.find(addScalar, [dt, dt]);
	      mf = typed.find(multiplyScalar, [dt, dt]);
	      eq = typed.find(equalScalar, [dt, dt]);
	      // convert 0 to the same datatype
	      zero = typed.convert(0, dt);
	    }

	    // result
	    var cvalues = [];
	    var cindex = [];
	    var cptr = [];
	    // c matrix
	    var c = new SparseMatrix({
	      values: cvalues,
	      index: cindex,
	      ptr: cptr,
	      size: [arows, bcolumns],
	      datatype: dt
	    });

	    // loop b columns
	    for (var jb = 0; jb < bcolumns; jb++) {
	      // update ptr
	      cptr[jb] = cindex.length;
	      // indeces in column jb
	      var kb0 = bptr[jb];
	      var kb1 = bptr[jb + 1];
	      // do not process column jb if no data exists
	      if (kb1 > kb0) {
	        // last row mark processed
	        var last = 0;
	        // loop a rows
	        for (var i = 0; i < arows; i++) {
	          // column mark
	          var mark = i + 1;
	          // C[i, jb]
	          var cij;
	          // values in b column j
	          for (var kb = kb0; kb < kb1; kb++) {
	            // row
	            var ib = bindex[kb];
	            // check value has been initialized
	            if (last !== mark) {
	              // first value in column jb
	              cij = mf(adata[i][ib], bvalues[kb]);
	              // update mark
	              last = mark;
	            } else {
	              // accumulate value
	              cij = af(cij, mf(adata[i][ib], bvalues[kb]));
	            }
	          }
	          // check column has been processed and value != 0
	          if (last === mark && !eq(cij, zero)) {
	            // push row & value
	            cindex.push(i);
	            cvalues.push(cij);
	          }
	        }
	      }
	    }
	    // update ptr
	    cptr[bcolumns] = cindex.length;

	    // return sparse matrix
	    return c;
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            SparseMatrix    (MxN)
	   * @param {Matrix} b            Dense Vector (N)
	   *
	   * @return {Matrix}             SparseMatrix    (M, 1) 
	   */
	  var _multiplySparseMatrixVector = function (a, b) {
	    // a sparse
	    var avalues = a._values;
	    var aindex = a._index;
	    var aptr = a._ptr;
	    var adt = a._datatype;
	    // validate a matrix
	    if (!avalues) throw new Error('Cannot multiply Pattern only Matrix times Dense Matrix');
	    // b dense
	    var bdata = b._data;
	    var bdt = b._datatype;
	    // rows & columns
	    var arows = a._size[0];
	    var brows = b._size[0];
	    // result
	    var cvalues = [];
	    var cindex = [];
	    var cptr = [];

	    // datatype
	    var dt;
	    // addScalar signature to use
	    var af = addScalar;
	    // multiplyScalar signature to use
	    var mf = multiplyScalar;
	    // equalScalar signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;

	    // process data types
	    if (adt && bdt && adt === bdt && typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signatures that matches (dt, dt)
	      af = typed.find(addScalar, [dt, dt]);
	      mf = typed.find(multiplyScalar, [dt, dt]);
	      eq = typed.find(equalScalar, [dt, dt]);
	      // convert 0 to the same datatype
	      zero = typed.convert(0, dt);
	    }

	    // workspace
	    var x = [];
	    // vector with marks indicating a value x[i] exists in a given column
	    var w = [];

	    // update ptr
	    cptr[0] = 0;
	    // rows in b
	    for (var ib = 0; ib < brows; ib++) {
	      // b[ib]
	      var vbi = bdata[ib];
	      // check b[ib] != 0, avoid loops
	      if (!eq(vbi, zero)) {
	        // A values & index in ib column
	        for (var ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
	          // a row
	          var ia = aindex[ka];
	          // check value exists in current j
	          if (!w[ia]) {
	            // ia is new entry in j
	            w[ia] = true;
	            // add i to pattern of C
	            cindex.push(ia);
	            // x(ia) = A
	            x[ia] = mf(vbi, avalues[ka]);
	          } else {
	            // i exists in C already
	            x[ia] = af(x[ia], mf(vbi, avalues[ka]));
	          }
	        }
	      }
	    }
	    // copy values from x to column jb of c
	    for (var p1 = cindex.length, p = 0; p < p1; p++) {
	      // row
	      var ic = cindex[p];
	      // copy value
	      cvalues[p] = x[ic];
	    }
	    // update ptr
	    cptr[1] = cindex.length;

	    // return sparse matrix
	    return new SparseMatrix({
	      values: cvalues,
	      index: cindex,
	      ptr: cptr,
	      size: [arows, 1],
	      datatype: dt
	    });
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            SparseMatrix      (MxN)
	   * @param {Matrix} b            DenseMatrix       (NxC)
	   *
	   * @return {Matrix}             SparseMatrix      (MxC)
	   */
	  var _multiplySparseMatrixDenseMatrix = function (a, b) {
	    // a sparse
	    var avalues = a._values;
	    var aindex = a._index;
	    var aptr = a._ptr;
	    var adt = a._datatype;
	    // validate a matrix
	    if (!avalues) throw new Error('Cannot multiply Pattern only Matrix times Dense Matrix');
	    // b dense
	    var bdata = b._data;
	    var bdt = b._datatype;
	    // rows & columns
	    var arows = a._size[0];
	    var brows = b._size[0];
	    var bcolumns = b._size[1];

	    // datatype
	    var dt;
	    // addScalar signature to use
	    var af = addScalar;
	    // multiplyScalar signature to use
	    var mf = multiplyScalar;
	    // equalScalar signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;

	    // process data types
	    if (adt && bdt && adt === bdt && typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signatures that matches (dt, dt)
	      af = typed.find(addScalar, [dt, dt]);
	      mf = typed.find(multiplyScalar, [dt, dt]);
	      eq = typed.find(equalScalar, [dt, dt]);
	      // convert 0 to the same datatype
	      zero = typed.convert(0, dt);
	    }

	    // result
	    var cvalues = [];
	    var cindex = [];
	    var cptr = [];
	    // c matrix
	    var c = new SparseMatrix({
	      values: cvalues,
	      index: cindex,
	      ptr: cptr,
	      size: [arows, bcolumns],
	      datatype: dt
	    });

	    // workspace
	    var x = [];
	    // vector with marks indicating a value x[i] exists in a given column
	    var w = [];

	    // loop b columns
	    for (var jb = 0; jb < bcolumns; jb++) {
	      // update ptr
	      cptr[jb] = cindex.length;
	      // mark in workspace for current column
	      var mark = jb + 1;
	      // rows in jb
	      for (var ib = 0; ib < brows; ib++) {
	        // b[ib, jb]
	        var vbij = bdata[ib][jb];
	        // check b[ib, jb] != 0, avoid loops
	        if (!eq(vbij, zero)) {
	          // A values & index in ib column
	          for (var ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
	            // a row
	            var ia = aindex[ka];
	            // check value exists in current j
	            if (w[ia] !== mark) {
	              // ia is new entry in j
	              w[ia] = mark;
	              // add i to pattern of C
	              cindex.push(ia);
	              // x(ia) = A
	              x[ia] = mf(vbij, avalues[ka]);
	            } else {
	              // i exists in C already
	              x[ia] = af(x[ia], mf(vbij, avalues[ka]));
	            }
	          }
	        }
	      }
	      // copy values from x to column jb of c
	      for (var p0 = cptr[jb], p1 = cindex.length, p = p0; p < p1; p++) {
	        // row
	        var ic = cindex[p];
	        // copy value
	        cvalues[p] = x[ic];
	      }
	    }
	    // update ptr
	    cptr[bcolumns] = cindex.length;

	    // return sparse matrix
	    return c;
	  };

	  /**
	   * C = A * B
	   *
	   * @param {Matrix} a            SparseMatrix      (MxN)
	   * @param {Matrix} b            SparseMatrix      (NxC)
	   *
	   * @return {Matrix}             SparseMatrix      (MxC)
	   */
	  var _multiplySparseMatrixSparseMatrix = function (a, b) {
	    // a sparse
	    var avalues = a._values;
	    var aindex = a._index;
	    var aptr = a._ptr;
	    var adt = a._datatype;
	    // b sparse
	    var bvalues = b._values;
	    var bindex = b._index;
	    var bptr = b._ptr;
	    var bdt = b._datatype;

	    // rows & columns
	    var arows = a._size[0];
	    var bcolumns = b._size[1];
	    // flag indicating both matrices (a & b) contain data
	    var values = avalues && bvalues;

	    // datatype
	    var dt;
	    // addScalar signature to use
	    var af = addScalar;
	    // multiplyScalar signature to use
	    var mf = multiplyScalar;

	    // process data types
	    if (adt && bdt && adt === bdt && typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signatures that matches (dt, dt)
	      af = typed.find(addScalar, [dt, dt]);
	      mf = typed.find(multiplyScalar, [dt, dt]);
	    }

	    // result
	    var cvalues = values ? [] : undefined;
	    var cindex = [];
	    var cptr = [];
	    // c matrix
	    var c = new SparseMatrix({
	      values: cvalues,
	      index: cindex,
	      ptr: cptr,
	      size: [arows, bcolumns],
	      datatype: dt
	    });

	    // workspace
	    var x = values ? [] : undefined;
	    // vector with marks indicating a value x[i] exists in a given column
	    var w = [];
	    // variables
	    var ka, ka0, ka1, kb, kb0, kb1, ia, ib;
	    // loop b columns
	    for (var jb = 0; jb < bcolumns; jb++) {
	      // update ptr
	      cptr[jb] = cindex.length;
	      // mark in workspace for current column
	      var mark = jb + 1;
	      // B values & index in j
	      for (kb0 = bptr[jb], kb1 = bptr[jb + 1], kb = kb0; kb < kb1; kb++) {
	        // b row
	        ib = bindex[kb];
	        // check we need to process values
	        if (values) {
	          // loop values in a[:,ib]
	          for (ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
	            // row
	            ia = aindex[ka];
	            // check value exists in current j
	            if (w[ia] !== mark) {
	              // ia is new entry in j
	              w[ia] = mark;
	              // add i to pattern of C
	              cindex.push(ia);
	              // x(ia) = A
	              x[ia] = mf(bvalues[kb], avalues[ka]);
	            } else {
	              // i exists in C already
	              x[ia] = af(x[ia], mf(bvalues[kb], avalues[ka]));
	            }
	          }
	        } else {
	          // loop values in a[:,ib]
	          for (ka0 = aptr[ib], ka1 = aptr[ib + 1], ka = ka0; ka < ka1; ka++) {
	            // row
	            ia = aindex[ka];
	            // check value exists in current j
	            if (w[ia] !== mark) {
	              // ia is new entry in j
	              w[ia] = mark;
	              // add i to pattern of C
	              cindex.push(ia);
	            }
	          }
	        }
	      }
	      // check we need to process matrix values (pattern matrix)
	      if (values) {
	        // copy values from x to column jb of c
	        for (var p0 = cptr[jb], p1 = cindex.length, p = p0; p < p1; p++) {
	          // row
	          var ic = cindex[p];
	          // copy value
	          cvalues[p] = x[ic];
	        }
	      }
	    }
	    // update ptr
	    cptr[bcolumns] = cindex.length;

	    // return sparse matrix
	    return c;
	  };

	  multiply.toTex = {
	    2: '\\left(${args[0]}' + latex.operators['multiply'] + '${args[1]}\\right)'
	  };

	  return multiply;
	}

	exports.name = 'multiply';
	exports.factory = factory;

/***/ }),
/* 123 */
/***/ (function(module, exports) {

	'use strict';

	function factory(type, config, load, typed) {

	  /**
	   * Multiply two scalar values, `x * y`.
	   * This function is meant for internal use: it is used by the public function
	   * `multiply`
	   *
	   * This function does not support collections (Array or Matrix), and does
	   * not validate the number of of inputs.
	   *
	   * @param  {number | BigNumber | Fraction | Complex | Unit} x   First value to multiply
	   * @param  {number | BigNumber | Fraction | Complex} y          Second value to multiply
	   * @return {number | BigNumber | Fraction | Complex | Unit}                      Multiplication of `x` and `y`
	   * @private
	   */
	  var multiplyScalar = typed('multiplyScalar', {

	    'number, number': function (x, y) {
	      return x * y;
	    },

	    'Complex, Complex': function (x, y) {
	      return x.mul(y);
	    },

	    'BigNumber, BigNumber': function (x, y) {
	      return x.times(y);
	    },

	    'Fraction, Fraction': function (x, y) {
	      return x.mul(y);
	    },

	    'number | Fraction | BigNumber | Complex, Unit': function (x, y) {
	      var res = y.clone();
	      res.value = res.value === null ? res._normalize(x) : multiplyScalar(res.value, x);
	      return res;
	    },

	    'Unit, number | Fraction | BigNumber | Complex': function (x, y) {
	      var res = x.clone();
	      res.value = res.value === null ? res._normalize(y) : multiplyScalar(res.value, y);
	      return res;
	    },

	    'Unit, Unit': function (x, y) {
	      return x.multiply(y);
	    }

	  });

	  return multiplyScalar;
	}

	exports.factory = factory;

/***/ }),
/* 124 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	function factory(type, config, load, typed) {

	  var equalScalar = load(__webpack_require__(40));

	  var SparseMatrix = type.SparseMatrix;

	  /**
	   * Iterates over SparseMatrix S nonzero items and invokes the callback function f(Sij, b). 
	   * Callback function invoked NZ times (number of nonzero items in S).
	   *
	   *
	   *          ┌  f(Sij, b)  ; S(i,j) !== 0
	   * C(i,j) = ┤  
	   *          └  0          ; otherwise
	   *
	   *
	   * @param {Matrix}   s                 The SparseMatrix instance (S)
	   * @param {Scalar}   b                 The Scalar value
	   * @param {Function} callback          The f(Aij,b) operation to invoke
	   * @param {boolean}  inverse           A true value indicates callback should be invoked f(b,Sij)
	   *
	   * @return {Matrix}                    SparseMatrix (C)
	   *
	   * https://github.com/josdejong/mathjs/pull/346#issuecomment-97626813
	   */
	  var algorithm11 = function (s, b, callback, inverse) {
	    // sparse matrix arrays
	    var avalues = s._values;
	    var aindex = s._index;
	    var aptr = s._ptr;
	    var asize = s._size;
	    var adt = s._datatype;

	    // sparse matrix cannot be a Pattern matrix
	    if (!avalues) throw new Error('Cannot perform operation on Pattern Sparse Matrix and Scalar value');

	    // rows & columns
	    var rows = asize[0];
	    var columns = asize[1];

	    // datatype
	    var dt;
	    // equal signature to use
	    var eq = equalScalar;
	    // zero value
	    var zero = 0;
	    // callback signature to use
	    var cf = callback;

	    // process data types
	    if (typeof adt === 'string') {
	      // datatype
	      dt = adt;
	      // find signature that matches (dt, dt)
	      eq = typed.find(equalScalar, [dt, dt]);
	      // convert 0 to the same datatype
	      zero = typed.convert(0, dt);
	      // convert b to the same datatype
	      b = typed.convert(b, dt);
	      // callback
	      cf = typed.find(callback, [dt, dt]);
	    }

	    // result arrays
	    var cvalues = [];
	    var cindex = [];
	    var cptr = [];
	    // matrix
	    var c = new SparseMatrix({
	      values: cvalues,
	      index: cindex,
	      ptr: cptr,
	      size: [rows, columns],
	      datatype: dt
	    });

	    // loop columns
	    for (var j = 0; j < columns; j++) {
	      // initialize ptr
	      cptr[j] = cindex.length;
	      // values in j
	      for (var k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
	        // row
	        var i = aindex[k];
	        // invoke callback
	        var v = inverse ? cf(b, avalues[k]) : cf(avalues[k], b);
	        // check value is zero
	        if (!eq(v, zero)) {
	          // push index & value
	          cindex.push(i);
	          cvalues.push(v);
	        }
	      }
	    }
	    // update ptr
	    cptr[columns] = cindex.length;

	    // return sparse matrix
	    return c;
	  };

	  return algorithm11;
	}

	exports.name = 'algorithm11';
	exports.factory = factory;

/***/ }),
/* 125 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var isInteger = __webpack_require__(19).isInteger;
	var size = __webpack_require__(29).size;

	function factory(type, config, load, typed) {
	  var latex = __webpack_require__(46);
	  var eye = load(__webpack_require__(126));
	  var multiply = load(__webpack_require__(122));
	  var matrix = load(__webpack_require__(44));
	  var fraction = load(__webpack_require__(127));
	  var number = load(__webpack_require__(128));

	  /**
	   * Calculates the power of x to y, `x ^ y`.
	   * Matrix exponentiation is supported for square matrices `x`, and positive
	   * integer exponents `y`.
	   *
	   * For cubic roots of negative numbers, the function returns the principal
	   * root by default. In order to let the function return the real root,
	   * math.js can be configured with `math.config({predictable: true})`.
	   * To retrieve all cubic roots of a value, use `math.cbrt(x, true)`.
	   *
	   * Syntax:
	   *
	   *    math.pow(x, y)
	   *
	   * Examples:
	   *
	   *    math.pow(2, 3);               // returns number 8
	   *
	   *    var a = math.complex(2, 3);
	   *    math.pow(a, 2)                // returns Complex -5 + 12i
	   *
	   *    var b = [[1, 2], [4, 3]];
	   *    math.pow(b, 2);               // returns Array [[9, 8], [16, 17]]
	   *
	   * See also:
	   *
	   *    multiply, sqrt, cbrt, nthRoot
	   *
	   * @param  {number | BigNumber | Complex | Array | Matrix} x  The base
	   * @param  {number | BigNumber | Complex} y                   The exponent
	   * @return {number | BigNumber | Complex | Array | Matrix} The value of `x` to the power `y`
	   */
	  var pow = typed('pow', {
	    'number, number': _pow,

	    'Complex, Complex': function (x, y) {
	      return x.pow(y);
	    },

	    'BigNumber, BigNumber': function (x, y) {
	      if (y.isInteger() || x >= 0 || config.predictable) {
	        return x.pow(y);
	      } else {
	        return new type.Complex(x.toNumber(), 0).pow(y.toNumber(), 0);
	      }
	    },

	    'Fraction, Fraction': function (x, y) {
	      if (y.d !== 1) {
	        if (config.predictable) {
	          throw new Error('Function pow does not support non-integer exponents for fractions.');
	        } else {
	          return _pow(x.valueOf(), y.valueOf());
	        }
	      } else {
	        return x.pow(y);
	      }
	    },

	    'Array, number': _powArray,

	    'Array, BigNumber': function (x, y) {
	      return _powArray(x, y.toNumber());
	    },

	    'Matrix, number': _powMatrix,

	    'Matrix, BigNumber': function (x, y) {
	      return _powMatrix(x, y.toNumber());
	    },

	    'Unit, number': function (x, y) {
	      return x.pow(y);
	    }

	  });

	  /**
	   * Calculates the power of x to y, x^y, for two numbers.
	   * @param {number} x
	   * @param {number} y
	   * @return {number | Complex} res
	   * @private
	   */
	  function _pow(x, y) {

	    // Alternatively could define a 'realmode' config option or something, but
	    // 'predictable' will work for now
	    if (config.predictable && !isInteger(y) && x < 0) {
	      // Check to see if y can be represented as a fraction
	      try {
	        var yFrac = fraction(y);
	        var yNum = number(yFrac);
	        if (y === yNum || Math.abs((y - yNum) / y) < 1e-14) {
	          if (yFrac.d % 2 === 1) {
	            return (yFrac.n % 2 === 0 ? 1 : -1) * Math.pow(-x, y);
	          }
	        }
	      } catch (ex) {}
	      // fraction() throws an error if y is Infinity, etc.


	      // Unable to express y as a fraction, so continue on
	    }

	    // x^Infinity === 0 if -1 < x < 1
	    // A real number 0 is returned instead of complex(0)
	    if (x * x < 1 && y === Infinity || x * x > 1 && y === -Infinity) {
	      return 0;
	    }

	    // **for predictable mode** x^Infinity === NaN if x < -1
	    // N.B. this behavour is different from `Math.pow` which gives
	    // (-2)^Infinity === Infinity
	    if (config.predictable && (x < -1 && y === Infinity || x > -1 && x < 0 && y === -Infinity)) {
	      return NaN;
	    }

	    if (isInteger(y) || x >= 0 || config.predictable) {
	      return Math.pow(x, y);
	    } else {
	      return new type.Complex(x, 0).pow(y, 0);
	    }
	  }

	  /**
	   * Calculate the power of a 2d array
	   * @param {Array} x     must be a 2 dimensional, square matrix
	   * @param {number} y    a positive, integer value
	   * @returns {Array}
	   * @private
	   */
	  function _powArray(x, y) {
	    if (!isInteger(y) || y < 0) {
	      throw new TypeError('For A^b, b must be a positive integer (value is ' + y + ')');
	    }
	    // verify that A is a 2 dimensional square matrix
	    var s = size(x);
	    if (s.length != 2) {
	      throw new Error('For A^b, A must be 2 dimensional (A has ' + s.length + ' dimensions)');
	    }
	    if (s[0] != s[1]) {
	      throw new Error('For A^b, A must be square (size is ' + s[0] + 'x' + s[1] + ')');
	    }

	    var res = eye(s[0]).valueOf();
	    var px = x;
	    while (y >= 1) {
	      if ((y & 1) == 1) {
	        res = multiply(px, res);
	      }
	      y >>= 1;
	      px = multiply(px, px);
	    }
	    return res;
	  }

	  /**
	   * Calculate the power of a 2d matrix
	   * @param {Matrix} x     must be a 2 dimensional, square matrix
	   * @param {number} y    a positive, integer value
	   * @returns {Matrix}
	   * @private
	   */
	  function _powMatrix(x, y) {
	    return matrix(_powArray(x.valueOf(), y));
	  }

	  pow.toTex = {
	    2: '\\left(${args[0]}\\right)' + latex.operators['pow'] + '{${args[1]}}'
	  };

	  return pow;
	}

	exports.name = 'pow';
	exports.factory = factory;

/***/ }),
/* 126 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var array = __webpack_require__(29);
	var isInteger = __webpack_require__(19).isInteger;

	function factory(type, config, load, typed) {

	  var matrix = load(__webpack_require__(44));

	  /**
	   * Create a 2-dimensional identity matrix with size m x n or n x n.
	   * The matrix has ones on the diagonal and zeros elsewhere.
	   *
	   * Syntax:
	   *
	   *    math.eye(n)
	   *    math.eye(n, format)
	   *    math.eye(m, n)
	   *    math.eye(m, n, format)
	   *    math.eye([m, n])
	   *    math.eye([m, n], format)
	   *
	   * Examples:
	   *
	   *    math.eye(3);                    // returns [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
	   *    math.eye(3, 2);                 // returns [[1, 0], [0, 1], [0, 0]]
	   *
	   *    var A = [[1, 2, 3], [4, 5, 6]];
	   *    math.eye(math.size(A));         // returns [[1, 0, 0], [0, 1, 0]]
	   *
	   * See also:
	   *
	   *    diag, ones, zeros, size, range
	   *
	   * @param {...number | Matrix | Array} size   The size for the matrix
	   * @param {string} [format]                   The Matrix storage format
	   *
	   * @return {Matrix | Array | number} A matrix with ones on the diagonal.
	   */
	  var eye = typed('eye', {
	    '': function () {
	      return config.matrix === 'Matrix' ? matrix([]) : [];
	    },

	    'string': function (format) {
	      return matrix(format);
	    },

	    'number | BigNumber': function (rows) {
	      return _eye(rows, rows, config.matrix === 'Matrix' ? 'default' : undefined);
	    },

	    'number | BigNumber, string': function (rows, format) {
	      return _eye(rows, rows, format);
	    },

	    'number | BigNumber, number | BigNumber': function (rows, cols) {
	      return _eye(rows, cols, config.matrix === 'Matrix' ? 'default' : undefined);
	    },

	    'number | BigNumber, number | BigNumber, string': function (rows, cols, format) {
	      return _eye(rows, cols, format);
	    },

	    'Array': function (size) {
	      return _eyeVector(size);
	    },

	    'Array, string': function (size, format) {
	      return _eyeVector(size, format);
	    },

	    'Matrix': function (size) {
	      return _eyeVector(size.valueOf(), size.storage());
	    },

	    'Matrix, string': function (size, format) {
	      return _eyeVector(size.valueOf(), format);
	    }
	  });

	  eye.toTex = undefined; // use default template

	  return eye;

	  function _eyeVector(size, format) {
	    switch (size.length) {
	      case 0:
	        return format ? matrix(format) : [];
	      case 1:
	        return _eye(size[0], size[0], format);
	      case 2:
	        return _eye(size[0], size[1], format);
	      default:
	        throw new Error('Vector containing two values expected');
	    }
	  }

	  /**
	   * Create an identity matrix
	   * @param {number | BigNumber} rows
	   * @param {number | BigNumber} cols
	   * @param {string} [format]
	   * @returns {Matrix}
	   * @private
	   */
	  function _eye(rows, cols, format) {
	    // BigNumber constructor with the right precision
	    var Big = type.isBigNumber(rows) || type.isBigNumber(cols) ? type.BigNumber : null;

	    if (type.isBigNumber(rows)) rows = rows.toNumber();
	    if (type.isBigNumber(cols)) cols = cols.toNumber();

	    if (!isInteger(rows) || rows < 1) {
	      throw new Error('Parameters in function eye must be positive integers');
	    }
	    if (!isInteger(cols) || cols < 1) {
	      throw new Error('Parameters in function eye must be positive integers');
	    }

	    var one = Big ? new type.BigNumber(1) : 1;
	    var defaultValue = Big ? new Big(0) : 0;
	    var size = [rows, cols];

	    // check we need to return a matrix
	    if (format) {
	      // get matrix storage constructor
	      var F = type.Matrix.storage(format);
	      // create diagonal matrix (use optimized implementation for storage format)
	      return F.diagonal(size, one, 0, defaultValue);
	    }

	    // create and resize array
	    var res = array.resize([], size, defaultValue);
	    // fill in ones on the diagonal
	    var minimum = rows < cols ? rows : cols;
	    // fill diagonal
	    for (var d = 0; d < minimum; d++) {
	      res[d][d] = one;
	    }
	    return res;
	  }
	}

	exports.name = 'eye';
	exports.factory = factory;

/***/ }),
/* 127 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var deepMap = __webpack_require__(120);

	function factory(type, config, load, typed) {
	  /**
	   * Create a fraction convert a value to a fraction.
	   *
	   * Syntax:
	   *     math.fraction(numerator, denominator)
	   *     math.fraction({n: numerator, d: denominator})
	   *     math.fraction(matrix: Array | Matrix)         Turn all matrix entries
	   *                                                   into fractions
	   *
	   * Examples:
	   *
	   *     math.fraction(1, 3);
	   *     math.fraction('2/3');
	   *     math.fraction({n: 2, d: 3});
	   *     math.fraction([0.2, 0.25, 1.25]);
	   *
	   * See also:
	   *
	   *    bignumber, number, string, unit
	   *
	   * @param {number | string | Fraction | BigNumber | Array | Matrix} [args]
	   *            Arguments specifying the numerator and denominator of
	   *            the fraction
	   * @return {Fraction | Array | Matrix} Returns a fraction
	   */
	  var fraction = typed('fraction', {
	    'number': function (x) {
	      if (!isFinite(x) || isNaN(x)) {
	        throw new Error(x + ' cannot be represented as a fraction');
	      }

	      return new type.Fraction(x);
	    },

	    'string': function (x) {
	      return new type.Fraction(x);
	    },

	    'number, number': function (numerator, denominator) {
	      return new type.Fraction(numerator, denominator);
	    },

	    'BigNumber': function (x) {
	      return new type.Fraction(x.toString());
	    },

	    'Fraction': function (x) {
	      return x; // fractions are immutable
	    },

	    'Object': function (x) {
	      return new type.Fraction(x);
	    },

	    'Array | Matrix': function (x) {
	      return deepMap(x, fraction);
	    }
	  });

	  return fraction;
	}

	exports.name = 'fraction';
	exports.factory = factory;

/***/ }),
/* 128 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var deepMap = __webpack_require__(120);

	function factory(type, config, load, typed) {
	  /**
	   * Create a number or convert a string, boolean, or unit to a number.
	   * When value is a matrix, all elements will be converted to number.
	   *
	   * Syntax:
	   *
	   *    math.number(value)
	   *    math.number(unit, valuelessUnit)
	   *
	   * Examples:
	   *
	   *    math.number(2);                         // returns number 2
	   *    math.number('7.2');                     // returns number 7.2
	   *    math.number(true);                      // returns number 1
	   *    math.number([true, false, true, true]); // returns [1, 0, 1, 1]
	   *    math.number(math.unit('52cm'), 'm');    // returns 0.52
	   *
	   * See also:
	   *
	   *    bignumber, boolean, complex, index, matrix, string, unit
	   *
	   * @param {string | number | BigNumber | Fraction | boolean | Array | Matrix | Unit | null} [value]  Value to be converted
	   * @param {Unit | string} [valuelessUnit] A valueless unit, used to convert a unit to a number
	   * @return {number | Array | Matrix} The created number
	   */
	  var number = typed('number', {
	    '': function () {
	      return 0;
	    },

	    'number': function (x) {
	      return x;
	    },

	    'string': function (x) {
	      var num = Number(x);
	      if (isNaN(num)) {
	        throw new SyntaxError('String "' + x + '" is no valid number');
	      }
	      return num;
	    },

	    'BigNumber': function (x) {
	      return x.toNumber();
	    },

	    'Fraction': function (x) {
	      return x.valueOf();
	    },

	    'Unit': function (x) {
	      throw new Error('Second argument with valueless unit expected');
	    },

	    'Unit, string | Unit': function (unit, valuelessUnit) {
	      return unit.toNumber(valuelessUnit);
	    },

	    'Array | Matrix': function (x) {
	      return deepMap(x, number);
	    }
	  });

	  number.toTex = {
	    0: '0',
	    1: '\\left(${args[0]}\\right)',
	    2: '\\left(\\left(${args[0]}\\right)${args[1]}\\right)'
	  };

	  return number;
	}

	exports.name = 'number';
	exports.factory = factory;

/***/ }),
/* 129 */
/***/ (function(module, exports) {

	module.exports = function cat_breakdown_bars(params, cat_data, cat_graph_group, title_height, bars_index, max_bars, cat_bar_groups) {

	  var paragraph_string = '<p>';
	  var super_string = ': ';

	  var bar_width = params.viz.cat_bar_width;
	  var bar_height = params.viz.cat_bar_height;

	  var max_string_length = 25;

	  var max_bar_value = cat_data.bar_data[0][bars_index];

	  // only keep the top max_bars categories
	  cat_data.bar_data = cat_data.bar_data.slice(0, max_bars);

	  var inst_title = cat_data.type_name;
	  // ensure that title is not too long
	  if (inst_title.length >= max_string_length) {
	    inst_title = inst_title.slice(0, max_string_length) + '..';
	  }

	  // make title
	  cat_graph_group.append('text').classed('cat_graph_title', true).text(inst_title).style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').style('font-weight', 800);

	  var line_y = 4;
	  cat_graph_group.append('line').attr('x1', 0).attr('x2', bar_width).attr('y1', line_y).attr('y2', line_y).attr('stroke', 'blue').attr('stroke-width', 1).attr('opacity', 1.0);

	  // bar length is max when all nodes in cluster are of
	  // a single cat
	  var bar_scale = d3.scale.linear().domain([0, max_bar_value]).range([0, bar_width]);

	  // make bars
	  cat_bar_groups.append('rect').attr('height', bar_height + 'px').attr('width', function (d) {
	    var inst_width = bar_scale(d[bars_index]);
	    return inst_width + 'px';
	  }).attr('fill', function (d) {
	    // cat color is stored in the third element
	    return d[3];
	  }).attr('opacity', params.viz.cat_colors.opacity).attr('stroke', 'grey').attr('stroke-width', '0.5px');

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
	  }).attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').attr('font-weight', 400).attr('text-anchor', 'right');
		};

/***/ }),
/* 130 */
/***/ (function(module, exports) {

	module.exports = function cat_breakdown_values(params, cat_graph_group, cat_bar_groups, num_nodes_index, is_downsampled, count_offset, bars_index, cluster_total) {

	  var bar_width = params.viz.cat_bar_width;
	  var bar_height = params.viz.cat_bar_height;
	  var offset_ds_count = 150;
	  var binom_pval_index = 6;

	  // Count Title
	  cat_graph_group.append('text').text('Count').attr('transform', function () {
	    var inst_x = bar_width + count_offset;
	    var inst_translate = 'translate(' + inst_x + ', 0)';
	    return inst_translate;
	  });

	  // Percentage Title
	  cat_graph_group.append('text').text('Pct').attr('transform', function () {
	    var inst_x = bar_width + count_offset + 60;
	    var inst_translate = 'translate(' + inst_x + ', 0)';
	    return inst_translate;
	  });

	  // Percentage Title
	  cat_graph_group.append('text').text('P-val').attr('transform', function () {
	    var inst_x = bar_width + count_offset + 115;
	    var inst_translate = 'translate(' + inst_x + ', 0)';
	    return inst_translate;
	  });

	  // Count Downsampled Title
	  if (is_downsampled) {
	    cat_graph_group.append('text').text('Clusters').attr('transform', function () {
	      var inst_x = bar_width + offset_ds_count;
	      var inst_translate = 'translate(' + inst_x + ', 0)';
	      return inst_translate;
	    });
	  }

	  // Counts
	  /////////////////////////////
	  var shift_count_num = 35;

	  cat_bar_groups.append('text').classed('count_labels', true).text(function (d) {
	    var inst_count = d[bars_index];
	    inst_count = inst_count.toLocaleString();
	    return String(inst_count);
	  }).attr('transform', function () {
	    var inst_x = bar_width + count_offset + shift_count_num;
	    var inst_y = 0.75 * bar_height;
	    return 'translate(' + inst_x + ', ' + inst_y + ')';
	  }).attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').attr('font-weight', 400).attr('text-anchor', 'end');

	  // Percentage
	  //////////////////////
	  cat_bar_groups.append('text').classed('count_labels', true).text(function (d) {
	    // calculate the percentage relative to the current cluster
	    var inst_count = d[bars_index] / cluster_total * 100;
	    inst_count = Math.round(inst_count * 10) / 10;
	    inst_count = inst_count.toLocaleString();
	    return String(inst_count);
	  }).attr('transform', function () {
	    var inst_x = bar_width + count_offset + shift_count_num + 47;
	    var inst_y = 0.75 * bar_height;
	    return 'translate(' + inst_x + ', ' + inst_y + ')';
	  }).attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').attr('font-weight', 400).attr('text-anchor', 'end');

	  // Binomial Test Pvals
	  cat_bar_groups.append('text').classed('count_labels', true).text(function (d) {
	    // calculate the percentage relative to the current cluster
	    var inst_count = d[binom_pval_index];

	    if (inst_count < 0.001) {
	      inst_count = parseFloat(inst_count.toPrecision(3));
	      inst_count = inst_count.toExponential();
	    } else {
	      inst_count = parseFloat(inst_count.toPrecision(2));
	    }

	    // inst_count = inst_count.toLocaleString();
	    return inst_count;
	  }).attr('transform', function () {
	    var inst_x = bar_width + count_offset + shift_count_num + 112;
	    var inst_y = 0.75 * bar_height;
	    return 'translate(' + inst_x + ', ' + inst_y + ')';
	  }).attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').attr('font-weight', 400).attr('text-anchor', 'end');

	  if (is_downsampled) {

	    cat_bar_groups.append('text').classed('count_labels', true).text(function (d) {
	      return String(d[num_nodes_index].toLocaleString());
	    }).attr('transform', function () {
	      // downsampled cluster numbers are smaller and need less flexible offsetting
	      var inst_x = bar_width + shift_count_num + offset_ds_count + 20;
	      var inst_y = 0.75 * bar_height;
	      return 'translate(' + inst_x + ', ' + inst_y + ')';
	    }).attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').attr('font-weight', 400).attr('text-anchor', 'end');
	  }
		};

/***/ }),
/* 131 */
/***/ (function(module, exports) {

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

/***/ }),
/* 132 */
/***/ (function(module, exports, __webpack_require__) {

	var d3_tip_custom = __webpack_require__(100);

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

/***/ }),
/* 133 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var add_col_click_hlight = __webpack_require__(134);
	var col_reorder = __webpack_require__(135);
	var row_reorder = __webpack_require__(104);
	var make_col_tooltips = __webpack_require__(139);
	var col_viz_aid_triangle = __webpack_require__(140);

	module.exports = function make_col_label_container(cgm, text_delay = 0) {

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

/***/ }),
/* 134 */
/***/ (function(module, exports) {

	module.exports = function (params, clicked_col, id_clicked_col) {

	  if (id_clicked_col != params.click_hlight_col) {

	    params.click_hlight_col = id_clicked_col;

	    var rel_width_hlight = 6;
	    var opacity_hlight = 0.85;
	    var hlight_width = rel_width_hlight * params.viz.border_width.x;

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

/***/ }),
/* 135 */
/***/ (function(module, exports, __webpack_require__) {

	// var utils = require('../Utils_clust');
	var reposition_tile_highlight = __webpack_require__(105);
	var toggle_dendro_view = __webpack_require__(106);
	var show_visible_area = __webpack_require__(136);
	var ini_zoom_info = __webpack_require__(88);
	var get_previous_zoom = __webpack_require__(131);
	var calc_downsampled_levels = __webpack_require__(79);
	var underscore = __webpack_require__(3);

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
	    var inst_col = underscore.indexOf(tmp_arr, inst_term);

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
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // Move Row Labels
	    t.select('.row_label_zoom_container').selectAll('.row_label_group').attr('transform', function (d) {
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    });

	    // only update matri if not downsampled
	    if (params.viz.ds_level === -1) {
	      // reorder matrix rows
	      t.selectAll('.row').attr('transform', function (d) {
	        var inst_index = underscore.indexOf(row_nodes_names, d.name);
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

/***/ }),
/* 136 */
/***/ (function(module, exports, __webpack_require__) {

	var find_viz_rows = __webpack_require__(137);
	var make_matrix_rows = __webpack_require__(93);
	var make_row_labels = __webpack_require__(102);
	var make_row_visual_aid_triangles = __webpack_require__(138);
	var underscore = __webpack_require__(3);

	module.exports = function show_visible_area(cgm, zooming_stopped = false, zooming_out = false, make_all_rows = false) {

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
	    missing_rows = underscore.difference(params.viz.viz_nodes.row, params.viz.viz_nodes.curr_row);
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
	        if (underscore.contains(params.viz.viz_nodes.row, d.name) === false) {
	          d3.select(this).remove();
	        }
	      });
	    } else {
	      // remove real data rows
	      d3.selectAll(params.root + ' .row').each(function (d) {
	        if (underscore.contains(params.viz.viz_nodes.row, d.name) === false) {
	          d3.select(this).remove();
	        }
	      });
	    }

	    // remove not visible row labels
	    d3.selectAll(params.root + ' .row_label_group').each(function (d) {
	      if (underscore.contains(params.viz.viz_nodes.row, d.name) === false) {
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
	      var missing_row_labels = underscore.difference(params.viz.viz_nodes.row, visible_row_labels);

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

/***/ }),
/* 137 */
/***/ (function(module, exports) {

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

	  // if downsampling redefine variables
	  if (ds_level >= 0) {
	    y_scale = params.viz.ds[ds_level].y_scale;
	    row_names = d3.range(params.matrix.ds_matrix[ds_level].length).map(String);
	    row_class = '.ds' + String(ds_level) + '_row';
	  }

	  // find rows that should be visible
	  for (var i = 0; i < row_names.length; i++) {
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

/***/ }),
/* 138 */
/***/ (function(module, exports) {

	module.exports = function make_row_visual_aid_triangles(params) {

	  if (d3.select(params.root + ' .row_cat_group path').empty() === true) {
	    d3.selectAll(params.root + ' .row_cat_group').append('path').attr('d', function () {
	      var origin_x = params.viz.cat_room.symbol_width - 1;
	      var origin_y = 0;
	      var mid_x = 1;
	      var mid_y = params.viz.y_scale.rangeBand() / 2;
	      var final_x = params.viz.cat_room.symbol_width - 1;
	      var final_y = params.viz.y_scale.rangeBand();
	      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ' L ' + final_x + ',' + final_y + ' Z';
	      return output_string;
	    }).attr('fill', '#eee').style('opacity', params.viz.triangle_opacity);
	  }
		};

/***/ }),
/* 139 */
/***/ (function(module, exports, __webpack_require__) {

	var d3_tip_custom = __webpack_require__(100);

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

/***/ }),
/* 140 */
/***/ (function(module, exports) {

	module.exports = function col_viz_aid_triangle(params) {

	  // x and y are flipped since its rotated
	  var reduce_rect_width = params.viz.x_scale.rangeBand() * 0.36;
	  var origin_y = -params.viz.border_width.x;
	  var start_x = 0;
	  var final_x = params.viz.x_scale.rangeBand() - reduce_rect_width;
	  var start_y = -(params.viz.x_scale.rangeBand() - reduce_rect_width + params.viz.border_width.x);
	  var final_y = -params.viz.border_width.x;
	  var output_string = 'M ' + origin_y + ',0 L ' + start_y + ',' + start_x + ' L ' + final_y + ',' + final_x + ' Z';
	  return output_string;
	};

/***/ }),
/* 141 */
/***/ (function(module, exports) {

	module.exports = function (params) {

	  d3.select(params.viz.viz_svg).append('rect').attr('fill', params.viz.background_color).attr('height', params.viz.super_labels.dim.width + 'px').attr('width', '3000px').classed('super_col_bkg', true).classed('white_bars', true).attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.super_labels.margin.top + ')');

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

/***/ }),
/* 142 */
/***/ (function(module, exports, __webpack_require__) {

	var get_cat_title = __webpack_require__(143);
	var ini_cat_reorder = __webpack_require__(144);
	var make_row_cat_super_labels = __webpack_require__(152);
	var make_dendro_crop_buttons = __webpack_require__(112);

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

	  if (params.viz.show_dendrogram) {
	    make_dendro_crop_buttons(cgm, 'col');
	  }

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

/***/ }),
/* 143 */
/***/ (function(module, exports) {

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

/***/ }),
/* 144 */
/***/ (function(module, exports, __webpack_require__) {

	var all_reorder = __webpack_require__(145);
	var underscore = __webpack_require__(3);

	module.exports = function ini_cat_reorder(cgm) {
	  /* eslint-disable */

	  var params = cgm.params;

	  underscore.each(['row', 'col'], function (inst_rc) {

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

/***/ }),
/* 145 */
/***/ (function(module, exports, __webpack_require__) {

	var toggle_dendro_view = __webpack_require__(106);
	var show_visible_area = __webpack_require__(136);
	var ini_zoom_info = __webpack_require__(88);
	var calc_downsampled_levels = __webpack_require__(79);
	var two_translate_zoom = __webpack_require__(146);
	var get_previous_zoom = __webpack_require__(131);
	var underscore = __webpack_require__(3);

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
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
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
	    var inst_index = underscore.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	  });

	  // Move Col Labels
	  t.select('.col_zoom_container').selectAll('.col_label_text').attr('transform', function (d) {
	    var inst_index = underscore.indexOf(col_nodes_names, d.name);
	    return 'translate(' + params.viz.x_scale(inst_index) + ') rotate(-90)';
	  });

	  // reorder row categories
	  t.selectAll('.row_cat_group').attr('transform', function (d) {
	    var inst_index = underscore.indexOf(row_nodes_names, d.name);
	    return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	  });

	  // reorder col_class groups
	  t.selectAll('.col_cat_group').attr('transform', function (d) {
	    var inst_index = underscore.indexOf(col_nodes_names, d.name);
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

/***/ }),
/* 146 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var label_constrain_and_trim = __webpack_require__(147);
	var show_visible_area = __webpack_require__(136);
	var ini_zoom_info = __webpack_require__(88);
	var toggle_grid_lines = __webpack_require__(151);
	var underscore = __webpack_require__(3);

	module.exports = function two_translate_zoom(cgm, pan_dx, pan_dy, fin_zoom) {

	  // console.log('pan_dy: ' + String(pan_dy))

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
	    var y_pan_room = half_height / fin_zoom;

	    // prevent visualization from panning down too much
	    // when zooming into genes near the top of the clustergram
	    if (pan_dy >= half_height - y_pan_room) {

	      // console.log(' prevent visualization from panning down too much')

	      // explanation of panning rules
	      /////////////////////////////////
	      /*
	        prevent the clustergram from panning down too much
	        if the amount of panning is equal to the half_height then it needs to be reduced
	        effectively, the the visualization needs to be moved up (negative) by some factor
	        of the half-width-of-the-visualization.
	         If there was no zooming involved, then the
	        visualization would be centered first, then panned to center the top term
	        this would require a
	        correction to re-center it. However, because of the zooming the offset is
	        reduced by the zoom factor (this is because the panning is occurring on something
	        that will be zoomed into - this is why the pan_dy value is not scaled in the two
	        translate transformations, but it has to be scaled afterwards to set the translate
	        vector)
	        pan_dy = half_height - (half_height)/fin_zoom
	         if pan_dy is greater than the pan room, then panning has to be restricted
	        start by shifting back up (negative) by half_height/fin_zoom then shift back down
	        by the difference between half_height and pan_dy (so that the top of the clustergram is
	        visible)
	      */

	      var shift_top_viz = half_height - pan_dy;
	      var shift_up_viz = -half_height / fin_zoom + shift_top_viz;

	      // reduce pan_dy so that the visualization does not get panned to far down
	      pan_dy = pan_dy + shift_up_viz;
	    }

	    // prevent visualization from panning up too much
	    // when zooming into genes at the bottom of the clustergram
	    if (pan_dy < -(half_height - y_pan_room)) {

	      shift_top_viz = half_height + pan_dy;

	      shift_up_viz = half_height / fin_zoom - shift_top_viz; //- move_up_one_row;

	      // reduce pan_dy so that the visualization does not get panned to far down
	      pan_dy = pan_dy + shift_up_viz;
	    }

	    // will improve this !!
	    var zoom_y = fin_zoom;
	    var zoom_x = 1;

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
	    underscore.each(['row', 'col'], function (inst_rc) {

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

	    // console.log('zooming x and y')
	    // console.log(zoom_x)
	    // console.log(zoom_y)

	    // need to improve behavior
	    d3.select(params.root + ' .col_dendro_icons_group').attr('transform', function () {
	      var inst_trans =
	      // 'translate(' + [0, 0 + center_y] + ')' +
	      ' scale(' + zoom_x + ',' + zoom_y + ')';
	      // + 'translate(' + [pan_dx, pan_dy ] + ')';
	      return inst_trans;
	    });

	    d3.select(params.root + ' .col_dendro_icons_group').selectAll('path').attr('transform', function (d) {
	      var inst_x = d.pos_mid;
	      var inst_y = params.viz.uni_margin;
	      // return 'translate('+ inst_x +',' + inst_y + ') ' + 'scale('+1/zoom_x+',1)';
	      return 'translate(' + inst_x + ',' + inst_y + ') ' + 'scale(1,1)';
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

/***/ }),
/* 147 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var trim_text = __webpack_require__(148);
	var constrain_font_size = __webpack_require__(149);

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

/***/ }),
/* 148 */
/***/ (function(module, exports) {

	
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
	      if (params.viz.zoom_ratio.y) {
	        inst_zoom = params.zoom_behavior.scale() / params.viz.zoom_ratio.y;
	      } else {
	        inst_zoom = params.zoom_behavior.scale();
	      }
	      // num_trims = params.labels.row_max_char;
	    } else {
	      if (params.viz.zoom_ratio.x > 1) {
	        inst_zoom = params.zoom_behavior.scale() / params.viz.zoom_ratio.x;
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

/***/ }),
/* 149 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_real_font_size = __webpack_require__(150);

	module.exports = function constrain_font_size(params) {

	  var tmp_font_size = params.labels.default_fs_row;
	  var inst_zoom;
	  var min_font_size = 3;

	  var real_font_size = calc_real_font_size(params);

	  // rows
	  ////////////////////////////////////
	  if (real_font_size.row > min_font_size) {

	    if (real_font_size.row > params.labels.max_allow_fs) {

	      if (params.viz.zoom_ratio.y) {
	        inst_zoom = params.zoom_behavior.scale() / params.viz.zoom_ratio.y;
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

	      if (params.viz.zoom_ratio.x > 1) {
	        inst_zoom = params.zoom_behavior.scale() / params.viz.zoom_ratio.x;
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

/***/ }),
/* 150 */
/***/ (function(module, exports) {

	module.exports = function calc_real_font_size(params) {

	  var real_font_size = {};
	  // zoom_switch behavior has to change with zoom_ratio.y
	  if (params.viz.zoom_ratio.x > 1) {
	    real_font_size.row = params.labels.default_fs_row * params.zoom_behavior.scale();
	    real_font_size.col = params.labels.default_fs_col * params.zoom_behavior.scale();
	  } else {
	    real_font_size.row = params.labels.default_fs_row * params.zoom_behavior.scale() / params.viz.zoom_ratio.y;
	    real_font_size.col = params.labels.default_fs_col * params.zoom_behavior.scale();
	  }

	  return real_font_size;
		};

/***/ }),
/* 151 */
/***/ (function(module, exports) {

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

/***/ }),
/* 152 */
/***/ (function(module, exports, __webpack_require__) {

	var get_cat_title = __webpack_require__(143);
	var d3_tip_custom = __webpack_require__(100);

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

	  // show row label categories even if viewing a simmilarity matrix

	  d3.select(params.root + ' .row_cat_label_container').selectAll().data(viz.all_cats.row).enter().append('text').style('width', '100px').style('height', bar_width + 'px').classed('row_cat_super', true).style('font-size', cat_text_size + 'px').style('opacity', cat_super_opacity).style('cursor', 'default').attr('transform', function (d) {
	    var inst_y = extra_y_room * viz.cat_room.symbol_width * parseInt(d.split('-')[1], 10);
	    return 'translate(0,' + inst_y + ')';
	  }).text(function (d) {

	    return get_cat_title(viz, d, 'row');
	  });

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

	  // row category super-label mouseover
	  //////////////////////////////////////
	  if (d3.select(params.root + ' .row_cat_selection_bar').empty() === false) {
	    d3.selectAll(params.root + ' .row_cat_selection_bar').call(cat_tip);
	  }

	  if (_.has(params.network_data, 'row_cat_bars')) {

	    // Enrichrgram title
	    /////////////////////
	    d3.select(params.root + ' .enr_title').remove();

	    var enr_title = d3.select(params.root + ' .viz_svg').append('g').classed('enr_title', true).attr('transform', function () {
	      var trans = d3.select(params.root + ' .row_cat_label_container').attr('transform').split('(')[1].split(')')[0];
	      var x_offset = Number(trans.split(',')[0]) - 10;

	      return 'translate(' + String(x_offset) + ', 0)';
	    });

	    enr_title.append('rect').attr('width', params.viz.cat_room.row).attr('height', 25).attr('fill', 'white');

	    var library_string = params.network_data.enrichrgram_lib.substring(0, 40);

	    enr_title.append('text').attr('transform', 'translate(0, 17)').text(library_string.replace(/_/g, ' ')).style('font-size', '15px').attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif');

	    // Enrichr bars
	    ////////////////////
	    d3.selectAll(params.root + ' .enrichr_bars').remove();

	    var bar_height = params.viz.clust.margin.top - 35;
	    var max_score = params.network_data.row_cat_bars[0];
	    var bar_scale = d3.scale.linear().domain([0, max_score]).range([0, bar_height]);

	    d3.select(params.root + ' .row_cat_label_bar_container').selectAll().data(params.network_data.row_cat_bars).enter().append('rect').classed('enrichr_bars', true).attr('height', bar_width + 'px').attr('fill', 'red').attr('width', function (d) {
	      var bar_length = bar_scale(d);
	      return bar_length + 'px';
	    }).attr('opacity', 0.4).attr('transform', function (d, i) {
	      var inst_y = unit_length * (i - 0.75);
	      return 'translate(0, ' + inst_y + ')';
	    });
	  }
		};

/***/ }),
/* 153 */
/***/ (function(module, exports, __webpack_require__) {

	var resize_viz = __webpack_require__(154);

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
	      return '\uf0b2';
	    } else {
	      // menu button
	      return '\uf0c9';
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
	        return '\uf0c9';
	      });
	      params.viz.is_expand = true;

	      d3.selectAll(params.root + ' .borders').style('fill', 'white');
	      // d3.select(params.root+' .footer_section').style('display', 'none');
	      d3.select(params.root + ' .sidebar_wrapper').style('display', 'none');

	      // contract view
	    } else {

	      d3.select(this).text(function () {
	        // expand button
	        return '\uf0b2';
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

/***/ }),
/* 154 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var run_zoom = __webpack_require__(155);
	var ini_doubleclick = __webpack_require__(163);
	var reset_zoom = __webpack_require__(164);
	var resize_dendro = __webpack_require__(165);
	var resize_super_labels = __webpack_require__(166);
	var resize_spillover = __webpack_require__(167);
	var resize_borders = __webpack_require__(168);
	var resize_row_labels = __webpack_require__(169);
	var resize_highlights = __webpack_require__(170);
	var resize_row_viz = __webpack_require__(171);
	var resize_col_labels = __webpack_require__(172);
	var resize_col_text = __webpack_require__(173);
	var resize_col_triangle = __webpack_require__(174);
	var resize_col_hlight = __webpack_require__(175);
	var recalc_params_for_resize = __webpack_require__(176);
	var resize_row_tiles = __webpack_require__(177);
	var resize_label_bars = __webpack_require__(178);
	var label_constrain_and_trim = __webpack_require__(147);
	var make_dendro_triangles = __webpack_require__(107);
	var toggle_dendro_view = __webpack_require__(106);
	var show_visible_area = __webpack_require__(136);
	var calc_viz_dimensions = __webpack_require__(70);
	var position_play_button = __webpack_require__(179);
	var make_row_cat_super_labels = __webpack_require__(152);
	var ini_cat_reorder = __webpack_require__(144);
	var position_dendro_slider = __webpack_require__(180);
	var position_tree_icon = __webpack_require__(181);
	var position_filter_icon = __webpack_require__(182);
	var position_tree_menu = __webpack_require__(183);
	var ini_zoom_info = __webpack_require__(88);
	var grid_lines_viz = __webpack_require__(184);
	var underscore = __webpack_require__(3);

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
	  underscore.each(params.network_data.links, function (d) {
	    d.x = params.viz.x_scale(d.target);
	    d.y = params.viz.y_scale(d.source);
	  });

	  // disable zoom while transitioning
	  svg_group.on('.zoom', null);

	  params.zoom_behavior.scaleExtent([1, params.viz.square_zoom * params.viz.zoom_ratio.x]).on('zoom', function () {
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
	    var inst_index = underscore.indexOf(row_nodes_names, d.name);
	    return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	  });

	  svg_group.selectAll('.row_cat_group').select('path').attr('d', function () {
	    var origin_x = params.viz.cat_room.symbol_width - 1;
	    var origin_y = 0;
	    var mid_x = 1;
	    var mid_y = params.viz.rect_height / 2;
	    var final_x = params.viz.cat_room.symbol_width - 1;
	    var final_y = params.viz.rect_height;
	    var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ' L ' + final_x + ',' + final_y + ' Z';
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

	  setTimeout(position_dendro_slider, 500, cgm, 'row');
	  setTimeout(position_dendro_slider, 500, cgm, 'col');
	  setTimeout(position_tree_icon, 500, cgm);
	  setTimeout(position_tree_menu, 500, cgm);
	  setTimeout(position_filter_icon, 500, cgm);
		};

/***/ }),
/* 155 */
/***/ (function(module, exports, __webpack_require__) {

	var run_transformation = __webpack_require__(156);
	var zoom_rules_y = __webpack_require__(161);
	var zoom_rules_x = __webpack_require__(162);

	module.exports = function zoomed(cgm) {

	  var params = cgm.params;

	  var zoom_info = {};
	  zoom_info.zoom_x = d3.event.scale;
	  zoom_info.zoom_y = d3.event.scale;

	  // subtract away the margin to easily calculate pan_room etc.
	  zoom_info.trans_x = params.zoom_behavior.translate()[0] - params.viz.clust.margin.left;
	  zoom_info.trans_y = params.zoom_behavior.translate()[1] - params.viz.clust.margin.top;

	  d3.selectAll(params.viz.root_tips).style('display', 'none');

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

/***/ }),
/* 156 */
/***/ (function(module, exports, __webpack_require__) {

	var constrain_font_size = __webpack_require__(149);
	var show_visible_area = __webpack_require__(136);
	var resize_label_val_bars = __webpack_require__(157);
	var zoom_crop_triangles = __webpack_require__(114);
	var get_previous_zoom = __webpack_require__(131);
	var run_when_zoom_stopped = __webpack_require__(158);
	var check_zoom_stop_status = __webpack_require__(160);

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
	  var not_zooming = function () {

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

/***/ }),
/* 157 */
/***/ (function(module, exports, __webpack_require__) {

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

/***/ }),
/* 158 */
/***/ (function(module, exports, __webpack_require__) {

	var constrain_font_size = __webpack_require__(149);
	var trim_text = __webpack_require__(148);
	var num_visible_labels = __webpack_require__(159);
	var toggle_grid_lines = __webpack_require__(151);
	var show_visible_area = __webpack_require__(136);
	var check_zoom_stop_status = __webpack_require__(160);
	var underscore = __webpack_require__(3);

	module.exports = function run_when_zoom_stopped(cgm) {

	  var params = cgm.params;

	  var stop_attributes = check_zoom_stop_status(params);

	  if (stop_attributes === true) {

	    // ///////////////////////////////////////////////
	    // // zooming has stopped
	    // ///////////////////////////////////////////////
	    // console.log('\nZOOMING HAS ACTUALLY STOPPED\n============================');
	    // console.log(params.zoom_info.zoom_y)

	    underscore.each(['row', 'col'], function (inst_rc) {

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
	    underscore.each(['row', 'col'], function (inst_rc) {

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

	    underscore.each(['row', 'col'], function (inst_rc) {

	      d3.selectAll(params.root + ' .' + inst_rc + '_label_group').filter(function () {
	        return d3.select(this).style('display') != 'none';
	      }).select('text').style('font-size', function () {
	        var inst_fs = Number(d3.select(this).style('font-size').replace('px', ''));
	        return inst_fs;
	      });
	    });
	  }
		};

/***/ }),
/* 159 */
/***/ (function(module, exports) {

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

/***/ }),
/* 160 */
/***/ (function(module, exports) {

	module.exports = function check_zoom_stop_status(params) {

	  var inst_zoom = Number(d3.select(params.root + ' .viz_svg').attr('is_zoom'));

	  var check_stop = Number(d3.select(params.root + ' .viz_svg').attr('stopped_zoom'));

	  var stop_attributes = false;
	  if (inst_zoom === 0 && check_stop != 0) {
	    stop_attributes = true;
	  }

	  return stop_attributes;
	};

/***/ }),
/* 161 */
/***/ (function(module, exports) {

	module.exports = function zoom_rules_y(params, zoom_info) {

	  var viz = params.viz;
	  // zoom in the x direction before zooming in the y direction
	  if (viz.zoom_ratio.y > 1) {
	    if (zoom_info.zoom_y < viz.zoom_ratio.y) {
	      zoom_info.trans_y = 0;
	      zoom_info.zoom_y = 1;
	    } else {
	      zoom_info.zoom_y = zoom_info.zoom_y / viz.zoom_ratio.y;
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

/***/ }),
/* 162 */
/***/ (function(module, exports) {

	module.exports = function zoom_rules_x(params, zoom_info) {

	  var viz = params.viz;

	  // zoom in the y direction before zooming in the x direction
	  if (viz.zoom_ratio.x > 1) {

	    if (zoom_info.zoom_x < viz.zoom_ratio.x) {

	      // remove this
	      // zoom_info.trans_x = - params.viz.clust.margin.left;

	      zoom_info.zoom_x = 1;
	    } else {
	      zoom_info.zoom_x = zoom_info.zoom_x / viz.zoom_ratio.x;

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

/***/ }),
/* 163 */
/***/ (function(module, exports, __webpack_require__) {

	var two_translate_zoom = __webpack_require__(146);

	module.exports = function ini_doubleclick(cgm) {

	  var params = cgm.params;
	  // disable double-click zoom
	  d3.selectAll(params.viz.zoom_element).on('dblclick.zoom', null);

	  d3.select(params.viz.zoom_element).on('dblclick', function () {
	    two_translate_zoom(cgm, 0, 0, 1);
	  });
	};

/***/ }),
/* 164 */
/***/ (function(module, exports) {

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

/***/ }),
/* 165 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function resize_dendro(params, svg_group, delay_info = false) {

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
	      var inst_index = underscore.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });

	    svg_group.selectAll('.col_dendro_group')
	    // data binding needed for loss/gain of columns
	    .data(col_nodes, function (d) {
	      return d.name;
	    }).transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var inst_index = underscore.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });
	  } else {

	    dendro_group = svg_group;

	    svg_group.selectAll('.col_cat_group')
	    // data binding needed for loss/gain of columns
	    .data(col_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = underscore.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });

	    d3.select(params.root).selectAll('.col_dendro_group')
	    // data binding needed for loss/gain of columns
	    .data(col_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = underscore.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	    });
	  }

	  var i;
	  var inst_class;

	  underscore.each(['row', 'col'], function (inst_rc) {

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

/***/ }),
/* 166 */
/***/ (function(module, exports) {

	module.exports = function resize_super_labels(params, ini_svg_group, delay_info = false) {

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

	  svg_group.select('.super_col_bkg').attr('height', params.viz.super_labels.dim.width + 'px').attr('transform', 'translate(' + params.viz.clust.margin.left + ',' + params.viz.grey_border_width + ')');

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

/***/ }),
/* 167 */
/***/ (function(module, exports) {

	module.exports = function resize_spillover(viz, ini_svg_group, delay_info = false) {

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

/***/ }),
/* 168 */
/***/ (function(module, exports) {

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

/***/ }),
/* 169 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function resize_row_labels(params, ini_svg_group, delay_info = false) {

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
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    }).attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);

	    svg_group = ini_svg_group.transition().delay(delays.update).duration(duration);
	  } else {

	    ini_svg_group.selectAll('.row_label_group')
	    // data bind necessary for loss/gain of rows
	    .data(row_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
	      return 'translate(0,' + params.viz.y_scale(inst_index) + ')';
	    }).attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);

	    svg_group = ini_svg_group;
	  }

	  svg_group.select(params.root + ' .row_container').attr('transform', 'translate(' + params.viz.norm_labels.margin.left + ',' + params.viz.clust.margin.top + ')');

	  svg_group.select(params.root + ' .row_container').select('.white_bars').attr('width', params.viz.label_background.row).attr('height', 30 * params.viz.clust.dim.height + 'px');

	  svg_group.select(params.root + ' .row_container').select('.row_label_container').attr('transform', 'translate(' + params.viz.norm_labels.width.row + ',0)');
		};

/***/ }),
/* 170 */
/***/ (function(module, exports) {

	module.exports = function resize_highlights(params) {

	  // reposition tile highlight
	  ////////////////////////////////

	  var rel_width_hlight = 6;
	  // var opacity_hlight = 0.85;
	  var hlight_width = rel_width_hlight * params.viz.border_width.x;
	  var hlight_height = rel_width_hlight * params.viz.border_width.y;

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

/***/ }),
/* 171 */
/***/ (function(module, exports) {

	module.exports = function resize_row_viz(params, ini_svg_group, delay_info = false) {

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

/***/ }),
/* 172 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function (params, ini_svg_group, delay_info = false) {

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
	      var inst_index = underscore.indexOf(col_nodes_names, d.name);
	      return 'translate(' + params.viz.x_scale(inst_index) + ', 0) rotate(-90)';
	    });
	  } else {
	    svg_group = ini_svg_group;

	    ini_svg_group.selectAll('.col_label_text').data(col_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = underscore.indexOf(col_nodes_names, d.name);
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

/***/ }),
/* 173 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);

	module.exports = function resize_col_text(params, svg_group) {
	  svg_group.selectAll('.col_label_group').select('text').style('font-size', params.labels.default_fs_col + 'px').text(function (d) {
	    return utils.normal_name(d);
	  });

	  svg_group.selectAll('.col_label_group').each(function () {
	    d3.select(this).select('text')[0][0].getBBox();
	  });
	};

/***/ }),
/* 174 */
/***/ (function(module, exports, __webpack_require__) {

	var col_viz_aid_triangle = __webpack_require__(140);

	module.exports = function resize_col_triangle(params, ini_svg_group, delay_info = false) {

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

/***/ }),
/* 175 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);

	module.exports = function resize_col_hlight(params, svg_group, delay_info = false) {

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

/***/ }),
/* 176 */
/***/ (function(module, exports, __webpack_require__) {

	var get_svg_dim = __webpack_require__(71);
	var calc_clust_height = __webpack_require__(74);
	var calc_clust_width = __webpack_require__(73);
	var calc_default_fs = __webpack_require__(83);
	var calc_zoom_switching = __webpack_require__(82);
	var underscore = __webpack_require__(3);

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
	    underscore.each(params.viz.ds, function (inst_ds) {

	      // y_scale
	      /////////////////////////
	      inst_ds.y_scale = d3.scale.ordinal().rangeBands([0, params.viz.clust.dim.height]);
	      inst_ds.y_scale.domain(d3.range(inst_ds.num_rows + 1));

	      inst_ds.rect_height = inst_ds.y_scale.rangeBand() - params.viz.border_width.y;
	    });
	  }

	  // redefine zoom extent
	  params.viz.square_zoom = params.viz.norm_labels.width.col / (params.viz.rect_width / 2);

	  // the default font sizes are set here
	  params = calc_default_fs(params);

	  return params;
	};

/***/ }),
/* 177 */
/***/ (function(module, exports, __webpack_require__) {

	var draw_up_tile = __webpack_require__(95);
	var draw_dn_tile = __webpack_require__(96);
	var fine_position_tile = __webpack_require__(99);
	var underscore = __webpack_require__(3);

	module.exports = function resize_row_tiles(params, svg_group) {

	  var row_nodes_names = params.network_data.row_nodes_names;

	  if (params.viz.ds_level === -1) {

	    // no downsampling
	    ///////////////////////

	    // resize rows
	    svg_group.selectAll('.row').attr('transform', function (d) {
	      var tmp_index = underscore.indexOf(row_nodes_names, d.name);
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

/***/ }),
/* 178 */
/***/ (function(module, exports, __webpack_require__) {

	var calc_val_max = __webpack_require__(75);
	// var underscore = require('underscore');

	module.exports = function resize_label_bars(cgm, svg_group) {
	  var params = cgm.params;

	  // // set bar scale
	  // var val_max = Math.abs(underscore.max( params.network_data.row_nodes, function(d) {
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

/***/ }),
/* 179 */
/***/ (function(module, exports) {

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

/***/ }),
/* 180 */
/***/ (function(module, exports) {

	module.exports = function position_dendro_slider(cgm, inst_rc = 'row') {

	  var viz = cgm.params.viz;
	  var tmp_left;
	  var tmp_top;
	  if (inst_rc === 'row') {

	    // row dendrogram
	    ///////////////////////

	    // keep slider near clustergram
	    var max_room = viz.svg_dim.width - 3 * viz.uni_margin;

	    // position close to row dendrogram trapezoids
	    tmp_left = viz.clust.margin.left + viz.clust.dim.width + 5.25 * viz.dendro_room.row + 2;

	    if (tmp_left > max_room) {
	      tmp_left = max_room;
	    }

	    // tmp_top =  viz.clust.margin.top + 3 * viz.uni_margin - 50;
	    // 135 is a magic number that moves the slider down to make room for the
	    // reordering tree (use 75 when enabling reclustering icon)
	    tmp_top = viz.clust.margin.top + 3 * viz.uni_margin + 30;
	  } else {

	    // column dendrogram
	    ///////////////////////
	    tmp_left = 2 * viz.uni_margin;
	    // tmp_top =  viz.svg_dim.height - 2.5 * viz.uni_margin;
	    tmp_top = viz.clust.margin.top + viz.clust.dim.height + viz.dendro_room.col - 2 * viz.uni_margin;
	  }

	  // reposiiton slider
	  d3.select(cgm.params.root + ' .' + inst_rc + '_slider_group').attr('transform', function () {
	    var inst_translation;
	    if (inst_rc === 'row') {
	      tmp_left = tmp_left + 0.8 * viz.dendro_room.row;
	      inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')';
	    } else {
	      inst_translation = 'translate(' + tmp_left + ',' + tmp_top + '), rotate(-90)';
	    }
	    return inst_translation;
	  }).style('opacity', 1);
		};

/***/ }),
/* 181 */
/***/ (function(module, exports) {

	module.exports = function position_tree_icon(cgm) {

	  var viz = cgm.params.viz;
	  var tmp_left;
	  var tmp_top;

	  // keep slider near clustergram
	  var max_room = viz.svg_dim.width - 3 * viz.uni_margin;

	  // position close to row dendrogram trapezoids
	  tmp_left = viz.clust.margin.left + viz.clust.dim.width + 5.25 * viz.dendro_room.row;

	  if (tmp_left > max_room) {
	    tmp_left = max_room;
	  }

	  // tmp_top =  viz.clust.margin.top + 3 * viz.uni_margin - 50;
	  tmp_top = viz.clust.margin.top + 3 * viz.uni_margin + 90;

	  // reposition tree icon
	  d3.select(cgm.params.root + ' .' + 'tree_icon').attr('transform', function () {
	    var inst_translation;
	    tmp_top = tmp_top - 75;
	    inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')';
	    return inst_translation;
	  }).style('opacity', 1);
		};

/***/ }),
/* 182 */
/***/ (function(module, exports) {

	module.exports = function position_filter_icon(cgm) {

	  var viz = cgm.params.viz;
	  var tmp_left;
	  var tmp_top;

	  // keep slider near clustergram
	  var max_room = viz.svg_dim.width - 3 * viz.uni_margin;

	  // position close to row dendrogram trapezoids
	  tmp_left = viz.clust.margin.left + viz.clust.dim.width + 4 * viz.dendro_room.row + 7;

	  if (tmp_left > max_room) {
	    tmp_left = max_room;
	  }

	  // tmp_top =  viz.clust.margin.top + 3 * viz.uni_margin - 50;
	  tmp_top = viz.clust.margin.top + 3 * viz.uni_margin + 152;

	  // reposition tree icon
	  d3.select(cgm.params.root + ' .' + 'filter_icon').attr('transform', function () {
	    var inst_translation;
	    tmp_top = tmp_top - 75;
	    inst_translation = 'translate(' + tmp_left + ',' + tmp_top + ')';
	    return inst_translation;
	  }).style('opacity', 1);
		};

/***/ }),
/* 183 */
/***/ (function(module, exports) {

	module.exports = function position_tree_menu(cgm) {

	  var params = cgm.params;

	  if (d3.select(params.root + ' .tree_menu').empty() === false) {

	    var menu_width = cgm.params.viz.tree_menu_width;

	    d3.select(params.root + ' .tree_menu').attr('transform', function () {
	      var shift = {};
	      shift.x = params.viz.clust.dim.width + params.viz.clust.margin.left - menu_width + 30;
	      shift.y = params.viz.clust.margin.top + 15;
	      return 'translate(' + shift.x + ', ' + shift.y + ')';
	    });
	  }
	};

/***/ }),
/* 184 */
/***/ (function(module, exports) {

	module.exports = function grid_lines_viz(params, duration = 0) {

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

/***/ }),
/* 185 */
/***/ (function(module, exports, __webpack_require__) {

	var cat_tooltip_text = __webpack_require__(186);
	var d3_tip_custom = __webpack_require__(100);
	var reset_cat_opacity = __webpack_require__(187);
	var ini_cat_opacity = __webpack_require__(188);
	// var click_filter_cats = require('./click_filter_cats');
	var get_cat_names = __webpack_require__(189);
	var underscore = __webpack_require__(3);

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
	    var inst_index = underscore.indexOf(params.network_data.col_nodes_names, d.name);
	    // return 'translate(' + params.viz.x_scale(d.col_index) + ',0)';
	    return 'translate(' + params.viz.x_scale(inst_index) + ',0)';
	  });

	  d3.select(params.root + ' .col_cat_container').selectAll('.col_cat_group').call(cat_tip);

	  // add category rects
	  d3.selectAll(params.root + ' .col_cat_group').each(function () {

	    var inst_selection = this;
	    var cat_rect;

	    underscore.each(params.viz.all_cats.col, function (inst_cat) {

	      var inst_num = parseInt(inst_cat.split('-')[1], 10);
	      var cat_rect_class = 'col_cat_rect_' + String(inst_num);

	      if (d3.select(inst_selection).select('.' + cat_rect_class).empty()) {
	        cat_rect = d3.select(inst_selection).append('rect').attr('class', cat_rect_class).attr('cat', inst_cat).attr('transform', function () {
	          var cat_room = params.viz.cat_room.symbol_width + params.viz.cat_room.separation;
	          var inst_shift = inst_num * cat_room;
	          return 'translate(0,' + inst_shift + ')';
	        }).on('click', function (d) {

	          if (d3.select(this).classed('cat_strings')) {

	            var found_names = get_cat_names(params, d, this, 'col');

	            $(params.root + ' .dendro_info').modal('toggle');
	            var group_string = found_names.join(', ');
	            d3.select(params.root + ' .dendro_info input').attr('value', group_string);
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
		};

/***/ }),
/* 186 */
/***/ (function(module, exports, __webpack_require__) {

	var get_cat_title = __webpack_require__(143);
	var underscore = __webpack_require__(3);

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

	  /* old category string */
	  // var cat_string = cat_title + ': '+ cat_name;

	  /* new string with click instructions */
	  var cat_string = '<div>' + cat_title + ': ' + cat_name + '</div> <div> <br>Click for Category Menu </div>';

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

	      underscore.each(node_types, function (tmp_rc) {

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

/***/ }),
/* 187 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function reset_cat_opacity(params) {

	  underscore.each(['row', 'col'], function (inst_rc) {

	    d3.selectAll(params.root + ' .' + inst_rc + '_cat_group').selectAll('rect').style('opacity', function () {

	      var inst_opacity = d3.select(this).style('opacity');

	      if (d3.select(this).classed('cat_strings') && d3.select(this).classed('filtered_cat') === false) {
	        inst_opacity = params.viz.cat_colors.opacity;
	      }

	      return inst_opacity;
	    });
	  });
		};

/***/ }),
/* 188 */
/***/ (function(module, exports) {

	module.exports = function ini_cat_opacity(viz, inst_rc, cat_rect, inst_cat, updating = false) {

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

/***/ }),
/* 189 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var underscore = __webpack_require__(3);

	module.exports = function get_cat_names(params, inst_data, inst_selection, inst_rc) {

	  // category index
	  var inst_cat = d3.select(inst_selection).attr('cat');
	  var cat_name = inst_data[inst_cat];
	  var tmp_nodes = params.network_data[inst_rc + '_nodes'];

	  var found_nodes = underscore.filter(tmp_nodes, function (d) {
	    return d[inst_cat] == cat_name;
	  });

	  var found_names = utils.pluck(found_nodes, 'name');

	  return found_names;
	};

/***/ }),
/* 190 */
/***/ (function(module, exports, __webpack_require__) {

	var cat_tooltip_text = __webpack_require__(186);
	var d3_tip_custom = __webpack_require__(100);
	var reset_cat_opacity = __webpack_require__(187);
	var ini_cat_opacity = __webpack_require__(188);
	// var click_filter_cats = require('./click_filter_cats');
	var get_cat_names = __webpack_require__(189);
	var underscore = __webpack_require__(3);

	module.exports = function make_row_cat(cgm, updating = false) {

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
	    var inst_index = underscore.indexOf(params.network_data.row_nodes_names, d.name);
	    return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	  });

	  d3.select(params.root + ' .row_cat_container').selectAll('.row_cat_group').call(cat_tip);

	  var cat_rect;
	  var inst_selection;

	  d3.selectAll(params.root + ' .row_cat_group rect').remove();

	  if (params.viz.show_categories.row) {

	    d3.selectAll(params.root + ' .row_cat_group').each(function () {

	      inst_selection = this;

	      underscore.each(params.viz.all_cats.row, function (inst_cat) {

	        var inst_num = parseInt(inst_cat.split('-')[1], 10);
	        var cat_rect_class = 'row_cat_rect_' + String(inst_num);

	        if (d3.select(inst_selection).select('.' + cat_rect_class).empty()) {
	          cat_rect = d3.select(inst_selection).append('rect').attr('class', cat_rect_class).attr('cat', inst_cat);
	        } else {
	          cat_rect = d3.select(inst_selection).select('.' + cat_rect_class);
	        }

	        cat_rect.attr('width', params.viz.cat_room.symbol_width).attr('height', params.viz.y_scale.rangeBand()).style('fill', function (d) {
	          var cat_name = d[inst_cat];

	          // if (cat_name.indexOf(': ') >= 0){
	          //   cat_name = cat_name.split(': ')[1];
	          // }

	          // console.log(cat_name)

	          var inst_color = params.viz.cat_colors.row[inst_cat][cat_name];

	          // console.log('inst_color: ' + String(inst_color));
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

	            var found_names = get_cat_names(params, d, this, 'row');

	            $(params.root + ' .dendro_info').modal('toggle');
	            var group_string = found_names.join(', ');
	            d3.select(params.root + ' .dendro_info input').attr('value', group_string);
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
		};

/***/ }),
/* 191 */
/***/ (function(module, exports, __webpack_require__) {

	var make_dendro_triangles = __webpack_require__(107);

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

/***/ }),
/* 192 */
/***/ (function(module, exports, __webpack_require__) {

	var make_dendro_triangles = __webpack_require__(107);

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

/***/ }),
/* 193 */
/***/ (function(module, exports, __webpack_require__) {

	var build_single_dendro_slider = __webpack_require__(194);

	module.exports = function build_dendro_sliders(cgm) {

	  build_single_dendro_slider(cgm, 'row');
	  build_single_dendro_slider(cgm, 'col');
		};

/***/ }),
/* 194 */
/***/ (function(module, exports, __webpack_require__) {

	var change_groups = __webpack_require__(195);
	var position_dendro_slider = __webpack_require__(180);

	module.exports = function build_single_dendro_slider(cgm, inst_rc) {

	  var slider_length = 100;

	  var drag = d3.behavior.drag().on("drag", dragging).on('dragend', function () {
	    cgm.params.is_slider_drag = false;
	  });

	  var slider_group = d3.select(cgm.params.root + ' .viz_svg').append('g').classed(inst_rc + '_slider_group', true);

	  position_dendro_slider(cgm, inst_rc);

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

	    var output_string = 'M' + start_x + ',' + start_y + ' L' + mid_x + ', ' + mid_y + ' L' + final_x + ',' + final_y + ' Z';

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

/***/ }),
/* 195 */
/***/ (function(module, exports, __webpack_require__) {

	var make_dendro_triangles = __webpack_require__(107);

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

/***/ }),
/* 196 */
/***/ (function(module, exports, __webpack_require__) {

	var make_dendro_crop_buttons = __webpack_require__(112);

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

/***/ }),
/* 197 */
/***/ (function(module, exports, __webpack_require__) {

	/* eslint-disable */

	var run_segment = __webpack_require__(198);
	var play_intro = __webpack_require__(199);
	var play_zoom = __webpack_require__(201);
	var play_reset_zoom = __webpack_require__(202);
	var play_reorder_row = __webpack_require__(204);
	var play_reorder_buttons = __webpack_require__(205);
	var play_search = __webpack_require__(207);
	var play_filter = __webpack_require__(208);
	var quick_cluster = __webpack_require__(231);
	var play_groups = __webpack_require__(232);
	var play_categories = __webpack_require__(233);
	var play_conclusion = __webpack_require__(234);
	var toggle_play_button = __webpack_require__(235);
	var play_menu_button = __webpack_require__(236);

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

/***/ }),
/* 198 */
/***/ (function(module, exports) {

	
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

/***/ }),
/* 199 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);

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

/***/ }),
/* 200 */
/***/ (function(module, exports) {

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

/***/ }),
/* 201 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var two_translate_zoom = __webpack_require__(146);

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

/***/ }),
/* 202 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var two_translate_zoom = __webpack_require__(146);
	var sim_click = __webpack_require__(203);

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

/***/ }),
/* 203 */
/***/ (function(module, exports) {

	module.exports = function sim_click(params, single_double, pos_x, pos_y) {

	  var click_duration = 200;

	  var click_circle = d3.select(params.root + ' .viz_svg').append('circle').attr('cx', pos_x).attr('cy', pos_y).attr('r', 25).style('stroke', 'black').style('stroke-width', '3px').style('fill', '#007f00').style('opacity', 0.5);

	  if (single_double === 'double') {
	    click_circle.transition().duration(click_duration).style('opacity', 0.0).transition().duration(50).style('opacity', 0.5).transition().duration(click_duration).style('opacity', 0.0).remove();
	  } else {
	    click_circle.transition().duration(click_duration).style('opacity', 0.0).transition().duration(250).remove();
	  }
		};

/***/ }),
/* 204 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var sim_click = __webpack_require__(203);

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

/***/ }),
/* 205 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var highlight_sidebar_element = __webpack_require__(206);

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

/***/ }),
/* 206 */
/***/ (function(module, exports) {

	module.exports = function highlight_sidebar_element(params, highlight_class, duration = 4000) {

	  if (highlight_class.indexOf('slider') < 0) {
	    d3.select(params.root + ' .' + highlight_class).style('background', '#007f00').style('box-shadow', '0px 0px 10px 5px #007f00').transition().duration(1).delay(duration).style('background', '#FFFFFF').style('box-shadow', 'none');
	  } else {
	    d3.select(params.root + ' .' + highlight_class).style('box-shadow', '0px 0px 10px 5px #007f00').transition().duration(1).delay(duration).style('box-shadow', 'none');
	  }
		};

/***/ }),
/* 207 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var highlight_sidebar_element = __webpack_require__(206);
	var two_translate_zoom = __webpack_require__(146);

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

/***/ }),
/* 208 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var highlight_sidebar_element = __webpack_require__(206);
	var update_viz_with_view = __webpack_require__(209);

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

/***/ }),
/* 209 */
/***/ (function(module, exports, __webpack_require__) {

	var make_network_using_view = __webpack_require__(11);
	var disable_sidebar = __webpack_require__(210);
	var update_viz_with_network = __webpack_require__(211);
	var underscore = __webpack_require__(3);

	module.exports = function update_viz_with_view(cgm, requested_view) {

	  disable_sidebar(cgm.params);

	  // make new_network_data by filtering the original network data
	  var new_network_data = make_network_using_view(cgm.config, cgm.params, requested_view);

	  // reset crop button
	  d3.select(cgm.params.root + ' .crop_button').style('color', '#337ab7').classed('fa-crop', true).classed('fa-undo', false).classed('active_cropping', false);

	  // reset dendrogram filtering when updating with a new view
	  // e.g. with the row filter sliders
	  underscore.each(['row', 'col'], function (inst_rc) {

	    // set class to reflect that no filtering was ran
	    d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_icons_group').classed('ran_filter', false);

	    // display all crop buttons when cropping has not been done
	    d3.select(cgm.params.root + ' .' + inst_rc + '_dendro_icons_container').style('display', 'block');
	  });

	  update_viz_with_network(cgm, new_network_data);
		};

/***/ }),
/* 210 */
/***/ (function(module, exports) {

	module.exports = function disable_sidebar(params) {

	  d3.selectAll(params.root + ' .btn').attr('disabled', true);
	  d3.select(params.viz.viz_svg).style('opacity', 0.70);
		};

/***/ }),
/* 211 */
/***/ (function(module, exports, __webpack_require__) {

	var make_params = __webpack_require__(10);
	var define_enter_exit_delays = __webpack_require__(212);
	var enter_exit_update = __webpack_require__(213);
	var initialize_resizing = __webpack_require__(153);
	var make_col_cat = __webpack_require__(185);
	var make_row_cat = __webpack_require__(190);
	var make_row_dendro = __webpack_require__(191);
	var make_col_dendro = __webpack_require__(192);
	var ini_sidebar = __webpack_require__(224);
	var enable_sidebar = __webpack_require__(226);
	var ini_doubleclick = __webpack_require__(163);
	var update_reorder_buttons = __webpack_require__(227);
	var make_row_cat_super_labels = __webpack_require__(152);
	var modify_row_node_cats = __webpack_require__(228);
	var run_zoom = __webpack_require__(155);
	var ds_enter_exit_update = __webpack_require__(230);
	var make_cat_params = __webpack_require__(84);

	module.exports = function update_viz_with_network(cgm, new_network_data) {

	  // set runnning_update class, prevents multiple update from running at once
	  d3.select(cgm.params.viz.viz_svg).classed('running_update', true);

	  // remove downsampled rows always
	  d3.selectAll(cgm.params.root + ' .ds' + String(cgm.params.viz.ds_level) + '_row').remove();

	  // run optional callback function
	  if (cgm.params.matrix_update_callback != null) {
	    cgm.params.matrix_update_callback();
	  }

	  // copy persistent parameters
	  var inst_distance_metric = cgm.params.matrix.distance_metric;
	  var inst_linkage_type = cgm.params.matrix.linkage_type;
	  var inst_filter_state = cgm.params.matrix.filter_state;
	  var inst_normalization_state = cgm.params.matrix.normalization_state;

	  var inst_group_level = cgm.params.group_level;
	  var inst_crop_fitler = cgm.params.crop_filter_nodes;

	  // make tmp config to make new params
	  var tmp_config = jQuery.extend(true, {}, cgm.config);

	  var new_row_cats = null;

	  // bring in 'new' category data
	  if (cgm.params.new_row_cats != null) {
	    modify_row_node_cats(cgm.params.new_row_cats, new_network_data.row_nodes);
	    new_row_cats = cgm.params.new_row_cats;
	    cgm.params.new_row_cats = new_row_cats;
	    // do not preserve the updated (row) cats
	    var predefined_cat_colors = true;
	    cgm.params.viz = make_cat_params(cgm.params, cgm.params.viz, predefined_cat_colors);
	  }

	  tmp_config.network_data = new_network_data;
	  tmp_config.inst_order = cgm.params.viz.inst_order;
	  tmp_config.input_domain = cgm.params.matrix.opacity_scale.domain()[1];

	  update_reorder_buttons(tmp_config, cgm.params);

	  // tmp_config.ini_expand = false;
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
	  cgm.params.zoom_behavior = d3.behavior.zoom().scaleExtent([1, cgm.params.viz.square_zoom * cgm.params.viz.zoom_ratio.x]).on('zoom', function () {
	    run_zoom(cgm);
	  });

	  // Persistent Parameters
	  /////////////////////////
	  cgm.params.matrix.distance_metric = inst_distance_metric;
	  cgm.params.matrix.linkage_type = inst_linkage_type;
	  cgm.params.matrix.filter_state = inst_filter_state;
	  cgm.params.matrix.normalization_state = inst_normalization_state;

	  // have persistent group levels while updating
	  cgm.params.group_level = inst_group_level;

	  // have persistent crop_filter_nodes while updating
	  cgm.params.crop_filter_nodes = inst_crop_fitler;

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

	  // remove all dendro shadows
	  setTimeout(remove_shadows, 50);
	  setTimeout(remove_shadows, 100);
	  setTimeout(remove_shadows, 500);
	  setTimeout(remove_shadows, 1000);
	  setTimeout(remove_shadows, 1500);

	  function remove_shadows() {
	    d3.selectAll('.dendro_shadow').remove();
	  }

	  function finish_update() {
	    d3.select(cgm.params.viz.viz_svg).transition().duration(250).style('opacity', 1.0);

	    setTimeout(finish_update_class, 1000);
	  }

	  setTimeout(finish_update, delays.enter);

	  function finish_update_class() {
	    d3.select(cgm.params.viz.viz_svg).classed('running_update', false);
	  }
		};

/***/ }),
/* 212 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function (old_params, params) {

	  // exit, update, enter

	  // check if exit or enter or both are required
	  var old_row_nodes = old_params.network_data.row_nodes;
	  var old_col_nodes = old_params.network_data.col_nodes;
	  var old_row = underscore.map(old_row_nodes, function (d) {
	    return d.name;
	  });
	  var old_col = underscore.map(old_col_nodes, function (d) {
	    return d.name;
	  });
	  var all_old_nodes = old_row.concat(old_col);

	  var row_nodes = params.network_data.row_nodes;
	  var col_nodes = params.network_data.col_nodes;
	  var row = underscore.map(row_nodes, function (d) {
	    return d.name;
	  });
	  var col = underscore.map(col_nodes, function (d) {
	    return d.name;
	  });
	  var all_nodes = row.concat(col);

	  var exit_nodes = underscore.difference(all_old_nodes, all_nodes).length;
	  var enter_nodes = underscore.difference(all_nodes, all_old_nodes).length;

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

/***/ }),
/* 213 */
/***/ (function(module, exports, __webpack_require__) {

	var reset_size_after_update = __webpack_require__(214);
	var make_row_label_container = __webpack_require__(101);
	var make_col_label_container = __webpack_require__(133);
	var eeu_existing_row = __webpack_require__(215);
	var exit_components = __webpack_require__(219);
	var draw_gridlines = __webpack_require__(91);
	var enter_row_groups = __webpack_require__(220);
	var resize_containers = __webpack_require__(223);
	var label_constrain_and_trim = __webpack_require__(147);
	var d3_tip_custom = __webpack_require__(100);

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

/***/ }),
/* 214 */
/***/ (function(module, exports, __webpack_require__) {

	var utils = __webpack_require__(2);
	var calc_clust_height = __webpack_require__(74);
	var get_svg_dim = __webpack_require__(71);
	var calc_clust_width = __webpack_require__(73);
	var reset_zoom = __webpack_require__(164);
	var resize_dendro = __webpack_require__(165);
	var resize_super_labels = __webpack_require__(166);
	var resize_spillover = __webpack_require__(167);
	var resize_row_labels = __webpack_require__(169);
	var resize_row_viz = __webpack_require__(171);
	var resize_col_labels = __webpack_require__(172);
	var resize_col_text = __webpack_require__(173);
	var resize_col_triangle = __webpack_require__(174);
	var resize_col_hlight = __webpack_require__(175);
	var resize_label_bars = __webpack_require__(178);
	var calc_default_fs = __webpack_require__(83);
	var calc_zoom_switching = __webpack_require__(82);
	// var show_visible_area = require('../zoom/show_visible_area');
	var ini_zoom_info = __webpack_require__(88);
	var underscore = __webpack_require__(3);

	module.exports = function reset_size_after_update(cgm, duration = 0, delays = null) {

	  if (delays === null) {
	    delays = {};
	    delays.enter = 0;
	    delays.update = 0;
	    delays.run_transition = false;
	  }

	  var params = cgm.params;

	  var row_nodes = cgm.params.network_data.row_nodes;

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
	  params.viz.square_zoom = params.viz.norm_labels.width.col / (params.viz.x_scale.rangeBand() / 2);
	  params.zoom_behavior.scaleExtent([1, params.viz.square_zoom * params.viz.zoom_ratio.x]);

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
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
	      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	    });

	    svg_group.selectAll('.row_cat_group').select('path').transition().delay(delays.update).duration(duration).attr('d', function () {
	      var origin_x = params.viz.cat_room.symbol_width - 1;
	      var origin_y = 0;
	      var mid_x = 1;
	      var mid_y = params.viz.y_scale.rangeBand() / 2;
	      var final_x = params.viz.cat_room.symbol_width - 1;
	      var final_y = params.viz.y_scale.rangeBand();
	      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ' L ' + final_x + ',' + final_y + ' Z';
	      return output_string;
	    });

	    svg_group.selectAll('.row_dendro_group').data(row_nodes, function (d) {
	      return d.name;
	    }).transition().delay(delays.update).duration(duration).attr('transform', function (d) {
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
	      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	    });
	  } else {

	    // positioning row text after row text size may have been reduced
	    svg_group.selectAll('.row_label_group').select('text').attr('y', params.viz.rect_height * 0.5 + params.labels.default_fs_row * 0.35);

	    svg_group.selectAll('.row_cat_group').data(row_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
	      return 'translate(0, ' + params.viz.y_scale(inst_index) + ')';
	    });

	    svg_group.selectAll('.row_cat_group').select('path').attr('d', function () {
	      var origin_x = params.viz.cat_room.symbol_width - 1;
	      var origin_y = 0;
	      var mid_x = 1;
	      var mid_y = params.viz.y_scale.rangeBand() / 2;
	      var final_x = params.viz.cat_room.symbol_width - 1;
	      var final_y = params.viz.y_scale.rangeBand();
	      var output_string = 'M ' + origin_x + ',' + origin_y + ' L ' + mid_x + ',' + mid_y + ' L ' + final_x + ',' + final_y + ' Z';
	      return output_string;
	    });

	    svg_group.selectAll('.row_dendro_group').data(row_nodes, function (d) {
	      return d.name;
	    }).attr('transform', function (d) {
	      var inst_index = underscore.indexOf(row_nodes_names, d.name);
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

/***/ }),
/* 215 */
/***/ (function(module, exports, __webpack_require__) {

	var exit_existing_row = __webpack_require__(216);
	var enter_existing_row = __webpack_require__(217);
	var update_split_tiles = __webpack_require__(218);
	var mouseover_tile = __webpack_require__(97);
	var mouseout_tile = __webpack_require__(98);
	var fine_position_tile = __webpack_require__(99);
	var underscore = __webpack_require__(3);

	// TODO add tip back to arguments
	module.exports = function eeu_existing_row(params, ini_inp_row_data, delays, duration, row_selection, tip) {

	  var inp_row_data = ini_inp_row_data.row_data;

	  // remove zero values from
	  var row_values = underscore.filter(inp_row_data, function (num) {
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
	  var update_row_tiles = cur_row_tiles.on('mouseover', function (...args) {
	    mouseover_tile(params, this, tip, args);
	  }).on('mouseout', function mouseout() {
	    mouseout_tile(params, this, tip);
	  });

	  var col_nodes_names = params.network_data.col_nodes_names;

	  if (delays.run_transition) {

	    update_row_tiles.transition().delay(delays.update).duration(duration).attr('width', params.viz.rect_width).attr('height', params.viz.rect_height).attr('transform', function (d) {
	      // if (_.contains(col_nodes_names, d.col_name)){
	      if (underscore.contains(col_nodes_names, d.col_name)) {
	        return fine_position_tile(params, d);
	      } else {
	        return 'translate(0,0)';
	      }
	    });
	  } else {
	    update_row_tiles.attr('width', params.viz.rect_width).attr('height', params.viz.rect_height).attr('transform', function (d) {
	      if (underscore.contains(col_nodes_names, d.col_name)) {
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

/***/ }),
/* 216 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function exit_existing_row(params, delays, cur_row_tiles, inp_row_data, row_selection) {

	  if (delays.run_transition) {
	    cur_row_tiles.exit().transition().duration(300).attr('fill-opacity', 0).remove();
	  } else {
	    cur_row_tiles.exit().attr('fill-opacity', 0).remove();
	  }

	  if (params.matrix.tile_type == 'updn') {

	    // value split
	    var row_split_data = underscore.filter(inp_row_data, function (num) {
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

/***/ }),
/* 217 */
/***/ (function(module, exports, __webpack_require__) {

	var mouseover_tile = __webpack_require__(97);
	var mouseout_tile = __webpack_require__(98);
	var fine_position_tile = __webpack_require__(99);

	module.exports = function enter_existing_row(params, delays, duration, cur_row_tiles, tip) {

	  // enter new tiles
	  var new_tiles = cur_row_tiles.enter().append('rect').attr('class', 'tile row_tile').attr('width', params.viz.rect_width).attr('height', params.viz.rect_height).on('mouseover', function (...args) {
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

/***/ }),
/* 218 */
/***/ (function(module, exports, __webpack_require__) {

	var draw_up_tile = __webpack_require__(95);
	var draw_dn_tile = __webpack_require__(96);
	var mouseover_tile = __webpack_require__(97);
	var mouseout_tile = __webpack_require__(98);
	var fine_position_tile = __webpack_require__(99);
	var underscore = __webpack_require__(3);

	module.exports = function update_split_tiles(params, inp_row_data, row_selection, delays, duration, cur_row_tiles, tip) {

	  // value split
	  var row_split_data = underscore.filter(inp_row_data, function (num) {
	    return num.value_up != 0 || num.value_dn != 0;
	  });

	  // tile_up
	  var cur_tiles_up = d3.select(row_selection).selectAll('.tile_up').data(row_split_data, function (d) {
	    return d.col_name;
	  });

	  // update split tiles_up
	  var update_tiles_up = cur_tiles_up.on('mouseover', function (...args) {
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
	  var update_tiles_dn = cur_tiles_dn.on('mouseover', function (...args) {
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

/***/ }),
/* 219 */
/***/ (function(module, exports) {

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

/***/ }),
/* 220 */
/***/ (function(module, exports, __webpack_require__) {

	var enter_new_rows = __webpack_require__(221);

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

/***/ }),
/* 221 */
/***/ (function(module, exports, __webpack_require__) {

	var enter_split_tiles = __webpack_require__(222);
	var mouseover_tile = __webpack_require__(97);
	var mouseout_tile = __webpack_require__(98);
	var fine_position_tile = __webpack_require__(99);
	var underscore = __webpack_require__(3);

	// make each row in the clustergram
	module.exports = function enter_new_rows(params, ini_inp_row_data, delays, duration, tip, row_selection) {

	  var inp_row_data = ini_inp_row_data.row_data;

	  // remove zero values to make visualization faster
	  var row_data = underscore.filter(inp_row_data, function (num) {
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
	  }).on('mouseover', function (...args) {
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

/***/ }),
/* 222 */
/***/ (function(module, exports, __webpack_require__) {

	var draw_up_tile = __webpack_require__(95);
	var draw_dn_tile = __webpack_require__(96);
	var fine_position_tile = __webpack_require__(99);
	var underscore = __webpack_require__(3);

	module.exports = function enter_split_tiles(params, inp_row_data, row_selection, tip, delays, duration, tile) {

	  // value split
	  var row_split_data = underscore.filter(inp_row_data, function (num) {
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

/***/ }),
/* 223 */
/***/ (function(module, exports) {

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

/***/ }),
/* 224 */
/***/ (function(module, exports, __webpack_require__) {

	/* eslint-disable */

	var change_groups = __webpack_require__(195);
	var all_reorder = __webpack_require__(145);
	var ini_cat_reorder = __webpack_require__(144);
	var run_row_search = __webpack_require__(225);
	var underscore = __webpack_require__(3);

	module.exports = function ini_sidebar(cgm) {

	  var params = cgm.params;

	  var input = d3.select(params.root + ' .gene_search_box')[0][0];
	  var awesomplete = new Awesomplete(input, { minChars: 1, maxItems: 15 });
	  var entities = cgm.params.network_data.row_nodes_names;
	  awesomplete.list = entities;

	  // position awesomplete list elements above other elements in the page
	  d3.selectAll('.awesomplete ul').style('z-index', 99);

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

	  underscore.each(reorder_types, function (inst_rc) {

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

/***/ }),
/* 225 */
/***/ (function(module, exports, __webpack_require__) {

	var two_translate_zoom = __webpack_require__(146);
	var underscore = __webpack_require__(3);

	module.exports = function run_row_search(cgm, search_term, entities) {

	  var prop = 'name';

	  if (entities.indexOf(search_term) !== -1) {

	    // unhighlight
	    d3.selectAll(cgm.params.root + ' .row_label_group').select('rect').style('opacity', 0);

	    // calc pan_dy
	    var idx = underscore.indexOf(entities, search_term);
	    var inst_y_pos = cgm.params.viz.y_scale(idx);
	    var pan_dy = cgm.params.viz.clust.dim.height / 2 - inst_y_pos;

	    var inst_zoom = cgm.params.viz.zoom_ratio.x;

	    // working on improving zoom behavior
	    ///////////////////////////////////////////////////
	    ///////////////////////////////////////////////////

	    // // increase zoom
	    // inst_zoom = 3 * inst_zoom;

	    // // move visualization down less
	    // pan_dy = pan_dy - 5;

	    two_translate_zoom(cgm, 0, pan_dy, inst_zoom);

	    // set y zoom to zoom_switch
	    cgm.params.zoom_info.zoom_y = inst_zoom;

	    // highlight
	    d3.selectAll(cgm.params.root + ' .row_label_group').filter(function (d) {
	      return d[prop] === search_term;
	    }).select('rect').style('opacity', 1);
	  }
		};

/***/ }),
/* 226 */
/***/ (function(module, exports) {

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

/***/ }),
/* 227 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function update_reorder_buttons(tmp_config, params) {
	  underscore.each(['row', 'col'], function (inst_rc) {

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

/***/ }),
/* 228 */
/***/ (function(module, exports, __webpack_require__) {

	var remove_node_cats = __webpack_require__(229);
	var utils = __webpack_require__(2);
	var underscore = __webpack_require__(3);

	module.exports = function modify_row_node_cats(cat_data, inst_nodes, strip_names = false) {

	  // console.log('MODIFY ROW NODE CATS')
	  // console.log('CAT_DATA')
	  // console.log(cat_data)

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
	  underscore.each(inst_nodes, function (inst_node) {

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
	    underscore.each(cat_data, function (inst_cat_data) {

	      inst_cat_title = inst_cat_data.cat_title;
	      inst_cats = inst_cat_data.cats;

	      // initialize with no category
	      inst_category = 'false';
	      inst_index = -1;

	      inst_cat_num = 0;

	      // loop through each category in the category-type
	      underscore.each(inst_cats, function (inst_cat) {

	        inst_cat_name = inst_cat.cat_name;
	        inst_members = inst_cat.members;

	        // add category if node is a member
	        if (underscore.contains(inst_members, inst_name)) {

	          inst_category = inst_cat_name;
	          inst_index = inst_cat_num;
	        }

	        inst_cat_num = inst_cat_num + 1;
	      });

	      if (utils.has(inst_cat_data, 'pval')) {

	        var inst_pval = inst_cat_data.pval.toExponential();
	        inst_full_cat = inst_cat_title + ': ' + inst_category + '<p> Pval ' + String(inst_pval) + '</p>';
	      } else {

	        if (inst_cat_title.indexOf('cat-') === -1) {
	          inst_full_cat = inst_cat_title + ': ' + inst_category;
	        } else {
	          inst_full_cat = inst_category;
	        }
	      }

	      inst_node['cat-' + String(cat_type_num)] = inst_full_cat;
	      inst_node['cat_' + String(cat_type_num) + '_index'] = inst_index;

	      cat_type_num = cat_type_num + 1;
	    });
	  });
		};

/***/ }),
/* 229 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function remove_node_cats(inst_node) {

	  var all_props = underscore.keys(inst_node);

	  underscore.each(all_props, function (inst_prop) {

	    if (inst_prop.indexOf('cat-') > -1) {
	      delete inst_node[inst_prop];
	    }

	    if (inst_prop.indexOf('cat_') > -1) {
	      delete inst_node[inst_prop];
	    }
	  });
		};

/***/ }),
/* 230 */
/***/ (function(module, exports, __webpack_require__) {

	var reset_size_after_update = __webpack_require__(214);
	var make_col_label_container = __webpack_require__(133);
	var show_visible_area = __webpack_require__(136);
	var resize_containers = __webpack_require__(223);

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

/***/ }),
/* 231 */
/***/ (function(module, exports, __webpack_require__) {

	var sim_click = __webpack_require__(203);

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

/***/ }),
/* 232 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var highlight_sidebar_element = __webpack_require__(206);
	var change_groups = __webpack_require__(195);

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

/***/ }),
/* 233 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var sim_click = __webpack_require__(203);

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

/***/ }),
/* 234 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var toggle_play_button = __webpack_require__(235);

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

/***/ }),
/* 235 */
/***/ (function(module, exports) {

	module.exports = function toggle_play_button(params, show) {

	  if (show === false) {
	    d3.select(params.root + ' .play_button').transition().duration(500).style('opacity', 0);
	  } else {
	    d3.select(params.root + ' .play_button').transition().duration(500).style('opacity', 1);

	    $.unblockUI();
	  }
		};

/***/ }),
/* 236 */
/***/ (function(module, exports, __webpack_require__) {

	var demo_text = __webpack_require__(200);
	var sim_click = __webpack_require__(203);

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

/***/ }),
/* 237 */
/***/ (function(module, exports, __webpack_require__) {

	var make_play_button = __webpack_require__(238);
	var make_demo_text_containers = __webpack_require__(239);

	module.exports = function ini_demo() {

	  var cgm = this;
	  var params = cgm.params;

	  make_play_button(cgm);

	  var demo_text_size = 30;
	  make_demo_text_containers(params, demo_text_size);
		};

/***/ }),
/* 238 */
/***/ (function(module, exports, __webpack_require__) {

	var position_play_button = __webpack_require__(179);

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

/***/ }),
/* 239 */
/***/ (function(module, exports) {

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

/***/ }),
/* 240 */
/***/ (function(module, exports, __webpack_require__) {

	var filter_network_using_new_nodes = __webpack_require__(12);
	var update_viz_with_network = __webpack_require__(211);

	module.exports = function filter_viz_using_nodes(new_nodes) {

	  var new_network_data = filter_network_using_new_nodes(this.config, new_nodes);
	  update_viz_with_network(this, new_network_data);
		};

/***/ }),
/* 241 */
/***/ (function(module, exports, __webpack_require__) {

	var filter_network_using_new_nodes = __webpack_require__(12);
	var update_viz_with_network = __webpack_require__(211);
	var underscore = __webpack_require__(3);

	module.exports = function filter_viz_using_names(names, external_cgm = false) {

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

	  underscore.each(['row', 'col'], function (inst_rc) {

	    var orig_nodes = params.inst_nodes[inst_rc + '_nodes'];

	    if (_.has(names, inst_rc)) {

	      if (names[inst_rc].length > 0) {
	        var inst_names = names[inst_rc];
	        found_nodes = $.grep(orig_nodes, function (d) {
	          return $.inArray(d.name, inst_names) > -1;
	        });
	      } else {

	        found_nodes = orig_nodes;
	      }
	    } else {

	      found_nodes = orig_nodes;
	    }

	    new_nodes[inst_rc + '_nodes'] = found_nodes;
	  });

	  // keep backup of the nodes for resetting filtering
	  var inst_row_nodes = cgm.params.network_data.row_nodes;
	  var inst_col_nodes = cgm.params.network_data.col_nodes;

	  var new_network_data = filter_network_using_new_nodes(cgm.config, new_nodes);

	  // takes entire cgm object
	  // last argument tells it to not preserve categoty colors
	  update_viz_with_network(cgm, new_network_data);

	  // only keep backup if previous number of nodes were larger than current number
	  // of nodes
	  if (inst_row_nodes.length > cgm.params.inst_nodes.row_nodes.length) {
	    cgm.params.inst_nodes.row_nodes = inst_row_nodes;
	  }

	  if (inst_col_nodes.length > cgm.params.inst_nodes.col_nodes.length) {
	    cgm.params.inst_nodes.col_nodes = inst_col_nodes;
	  }
		};

/***/ }),
/* 242 */
/***/ (function(module, exports, __webpack_require__) {

	var make_row_cat = __webpack_require__(190);
	var calc_viz_params = __webpack_require__(67);
	var resize_viz = __webpack_require__(154);
	var modify_row_node_cats = __webpack_require__(228);

	module.exports = function update_cats(cgm, cat_data) {

	  // Only accessible from the cgm API, cat_data is provided by externally
	  ///////////////////////////////////////////////////////////////////////////

	  if (cgm.params.cat_update_callback != null) {
	    cgm.params.cat_update_callback(this);
	  }

	  // do not change column category info
	  var col_cat_colors = cgm.params.viz.cat_colors.col;

	  modify_row_node_cats(cat_data, cgm.params.network_data.row_nodes, true);
	  // modify the current inst copy of nodes
	  modify_row_node_cats(cat_data, cgm.params.inst_nodes.row_nodes, true);

	  // recalculate the visualization parameters using the updated network_data
	  cgm.params = calc_viz_params(cgm.params, false);

	  make_row_cat(cgm, true);
	  resize_viz(cgm);

	  cgm.params.new_row_cats = cat_data;

	  cgm.params.viz.cat_colors.col = col_cat_colors;
		};

/***/ }),
/* 243 */
/***/ (function(module, exports, __webpack_require__) {

	var make_row_cat = __webpack_require__(190);
	var calc_viz_params = __webpack_require__(67);
	var resize_viz = __webpack_require__(154);
	var modify_row_node_cats = __webpack_require__(228);
	var generate_cat_data = __webpack_require__(244);

	module.exports = function reset_cats(run_resize_viz = true) {

	  // console.log('RESET CATS')

	  var cgm = this;

	  var cat_data = generate_cat_data(cgm);

	  // do not change column category info
	  var col_cat_colors = cgm.params.viz.cat_colors.col;

	  modify_row_node_cats(cat_data, cgm.params.network_data.row_nodes);
	  // modify the current inst copy of nodes
	  modify_row_node_cats(cat_data, cgm.params.inst_nodes.row_nodes);

	  cgm.params.new_row_cats = cat_data;
	  cgm.params.viz.cat_colors.col = col_cat_colors;

	  if (run_resize_viz) {

	    // resize visualizatino
	    ////////////////////////////
	    // recalculate the visualization parameters using the updated network_data
	    var predefine_cat_colors = true;
	    cgm.params = calc_viz_params(cgm.params, predefine_cat_colors);

	    make_row_cat(cgm, true);
	    resize_viz(cgm);
	  }
		};

/***/ }),
/* 244 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function generate_cat_data(cgm) {

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

	  // console.log('generate_cat_data')
	  // console.log(cgm.params.viz.cat_names.row)

	  // get current list of cateories
	  var check_node = row_nodes[0];
	  var node_keys = underscore.keys(check_node);
	  var current_cats = {};
	  var tmp_cat;
	  var tmp_title;
	  var cat_index;
	  underscore.each(node_keys, function (inst_prop) {

	    if (inst_prop.indexOf('cat-') >= 0) {

	      // generate titles from cat info
	      tmp_cat = check_node[inst_prop];

	      cat_index = parseInt(inst_prop.split('cat-')[1], 10);

	      // use given title
	      if (tmp_cat.indexOf(title_sep) >= 0) {
	        tmp_title = tmp_cat.split(title_sep)[0];
	      } else {
	        tmp_title = inst_prop;
	      }

	      // current_cats.push(tmp_title);

	      current_cats[cat_index] = tmp_title;
	    }
	  });

	  // console.log('current_cats')
	  // console.log(current_cats)

	  // initialize cat_data with categories in the correct order
	  var all_index = underscore.keys(current_cats).sort();

	  var inst_data;
	  underscore.each(all_index, function (inst_index) {

	    inst_data = {};
	    inst_data.cat_title = current_cats[inst_index];
	    inst_data.cats = [];

	    cat_data.push(inst_data);
	  });

	  // // initialize cat_data (keep original order)
	  // var found_title;
	  // underscore.each(cgm.params.viz.cat_names.row, function(inst_title){

	  //   found_title = false;

	  //   console.log('inst_title -> ' + String(inst_title))

	  //   if (current_cats.indexOf(inst_title) >= 0){
	  //     found_title = true;
	  //   }

	  //   // only track cats that are found in the incoming nodes
	  //   if (found_title){
	  //     var inst_data = {};
	  //     inst_data.cat_title = inst_title;
	  //     inst_data.cats = [];
	  //     cat_data.push(inst_data);
	  //   }

	  // });

	  // console.log('cat_data after cross checking with current cats')
	  // console.log(cat_data)
	  // console.log('-------------------------\n')

	  underscore.each(row_nodes, function (inst_node) {

	    var all_props = underscore.keys(inst_node);

	    underscore.each(all_props, function (inst_prop) {

	      if (inst_prop.indexOf('cat-') > -1) {

	        cat_name = inst_node[inst_prop];

	        cat_index = parseInt(inst_prop.split('cat-')[1], 10);

	        // default title and name
	        var cat_title = inst_prop;
	        cat_name = inst_node[inst_prop];
	        var cat_string = inst_node[inst_prop];
	        var cat_row_name = inst_node.name;

	        // console.log('cat_string: '+String(cat_string))
	        // found actual title
	        if (cat_string.indexOf(title_sep) > -1) {
	          cat_title = cat_string.split(title_sep)[0];
	          cat_name = cat_string.split(title_sep)[1];
	        } else {
	          // cat_title = 'Category-'+String(parseInt(inst_prop.split('-')[1]) + 1)
	          cat_title = inst_prop;
	          cat_name = cat_string;
	        }

	        // console.log('cat_index -> ' + String(cat_index))
	        // console.log('cat_name '+cat_name)
	        // console.log('cat_title ' + cat_title)
	        // console.log('--------')

	        // cat_data is empty
	        if (cat_data.length === 0) {

	          add_new_cat_type(cat_title, cat_name, cat_row_name);

	          // cat_data is not empty
	        } else {

	          // look for cat_title in cat_data
	          found_cat_title = false;
	          underscore.each(cat_data, function (inst_cat_type) {

	            // console.log('inst_cat_data title ' + inst_cat_type.cat_title)

	            // check each cat_type object for a matching title
	            if (cat_title === inst_cat_type.cat_title) {
	              found_cat_title = true;

	              // check if cat_name is in cats
	              found_cat_name = false;
	              underscore.each(inst_cat_type.cats, function (inst_cat_obj) {

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

	            // console.log('did not find cat_title: ' + String(cat_title))
	            // add_new_cat_type(cat_title, cat_name, cat_row_name);

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

	  // console.log('RETURNING CAT DATA')
	  // console.log(cat_data)

	  return cat_data;
	};

/***/ }),
/* 245 */
/***/ (function(module, exports, __webpack_require__) {

	var update_viz_with_view = __webpack_require__(209);
	var reset_other_filter_sliders = __webpack_require__(246);

	module.exports = function update_view(cgm, filter_type, inst_state) {

	  // add something to control slider position
	  /////////////////////////////////////////////

	  var requested_view = {};
	  requested_view[filter_type] = inst_state;
	  update_viz_with_view(cgm, requested_view);

	  reset_other_filter_sliders(cgm, filter_type, inst_state);
	};

/***/ }),
/* 246 */
/***/ (function(module, exports, __webpack_require__) {

	var make_filter_title = __webpack_require__(247);
	var underscore = __webpack_require__(3);

	module.exports = function reset_other_filter_sliders(cgm, filter_type, inst_state) {

	  var params = cgm.params;
	  var inst_rc;
	  var reset_rc;

	  d3.select(params.root + ' .slider_' + filter_type).attr('current_state', inst_state);

	  underscore.each(underscore.keys(params.viz.possible_filters), function (reset_filter) {

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

/***/ }),
/* 247 */
/***/ (function(module, exports, __webpack_require__) {

	var get_filter_default_state = __webpack_require__(6);
	var underscore = __webpack_require__(3);

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
	  if (underscore.keys(params.viz.possible_filters).indexOf('enr_score_type') > -1) {
	    if (type.node === 'col') {
	      filter_title.text = 'Top Enriched Terms: ';
	      filter_title.suffix = '';
	    }
	  }

	  return filter_title;
	};

/***/ }),
/* 248 */
/***/ (function(module, exports, __webpack_require__) {

	var file_saver = __webpack_require__(249);
	var make_matrix_string = __webpack_require__(250);

	module.exports = function save_matrix() {

	  var saveAs = file_saver();

	  var params = this.params;

	  var matrix_string = make_matrix_string(params);

	  var blob = new Blob([matrix_string], { type: 'text/plain;charset=utf-8' });
	  saveAs(blob, 'clustergrammer.txt');
		};

/***/ }),
/* 249 */
/***/ (function(module, exports) {

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
	        get_URL = function () {
	      return view.URL || view.webkitURL || view;
	    },
	        URL = view.URL || view.webkitURL || view,
	        save_link = doc.createElementNS("http://www.w3.org/1999/xhtml", "a"),
	        can_use_save_link = "download" in save_link,
	        click = function (node) {
	      var event = doc.createEvent("MouseEvents");
	      event.initMouseEvent("click", true, false, view, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	      node.dispatchEvent(event);
	    },
	        webkit_req_fs = view.webkitRequestFileSystem,
	        req_fs = view.requestFileSystem || webkit_req_fs || view.mozRequestFileSystem,
	        throw_outside = function (ex) {
	      (view.setImmediate || view.setTimeout)(function () {
	        throw ex;
	      }, 0);
	    },
	        force_saveable_type = "application/octet-stream",
	        fs_min_size = 0,
	        deletion_queue = [],
	        process_deletion_queue = function () {
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
	        dispatch = function (filesaver, event_types, event) {
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
	        FileSaver = function (blob, name) {
	      // First try a.download, then web filesystem, then object URLs
	      var filesaver = this,
	          type = blob.type,
	          blob_changed = false,
	          object_url,
	          target_view,
	          get_object_url = function () {
	        var object_url = get_URL().createObjectURL(blob);
	        deletion_queue.push(object_url);
	        return object_url;
	      },
	          dispatch_all = function () {
	        dispatch(filesaver, "writestart progress write writeend".split(" "));
	      }
	      // on any filesys errors revert to saving with object URLs
	      ,
	          fs_error = function () {
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
	          abortable = function (func) {
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
	          var save = function () {
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
	        saveAs = function (blob, name) {
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

/***/ }),
/* 250 */
/***/ (function(module, exports, __webpack_require__) {

	var make_full_name = __webpack_require__(251);
	var underscore = __webpack_require__(3);

	module.exports = function make_matrix_string(params) {

	  var inst_matrix = params.matrix;

	  // get order indexes
	  var order_indexes = {};
	  var inst_name;
	  underscore.each(['row', 'col'], function (tmp_rc) {

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

	  // alternate column entry
	  for (var c_i = 0; c_i < order_indexes.col.length; c_i++) {

	    var inst_index = order_indexes.col[c_i];

	    var inst_col = col_nodes[inst_index];
	    var col_name = make_full_name(params, inst_col, 'col');

	    if (c_i < order_indexes.col.length - 1) {
	      matrix_string = matrix_string + col_name + '\t';
	    } else {
	      matrix_string = matrix_string + col_name;
	    }
	  }

	  var row_data;
	  matrix_string = matrix_string + '\n';

	  underscore.each(order_indexes.row, function (inst_index) {

	    // row names
	    row_data = inst_matrix.matrix[inst_index].row_data;

	    // var row_name = inst_matrix.matrix[inst_index].name;
	    var inst_row = row_nodes[inst_index];

	    // var row_name = inst_row.name;
	    var row_name = make_full_name(params, inst_row, 'row');

	    matrix_string = matrix_string + row_name + '\t';

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

	  return matrix_string;
		};

/***/ }),
/* 251 */
/***/ (function(module, exports) {

	module.exports = function make_full_name(params, inst_node, inst_rc) {

	  var cat_name;
	  var inst_name = inst_node.name;
	  var num_cats = params.viz.all_cats[inst_rc].length;

	  // make tuple if necessary
	  if (num_cats > 0) {

	    inst_name = "('" + inst_name + "'";

	    for (var cat_index = 0; cat_index < num_cats; cat_index++) {
	      cat_name = 'cat-' + String(cat_index);

	      inst_name = inst_name + ", '" + String(inst_node[cat_name]) + "'";
	    }

	    inst_name = inst_name + ')';
	  } else {

	    // always make names strings
	    inst_name = String(inst_name);
	  }

	  return inst_name;
	};

/***/ }),
/* 252 */
/***/ (function(module, exports, __webpack_require__) {

	var deactivate_cropping = __webpack_require__(253);
	var underscore = __webpack_require__(3);

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

	    underscore.each(params.matrix.matrix, function (row_data) {
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

/***/ }),
/* 253 */
/***/ (function(module, exports) {

	module.exports = function deactivate_cropping(cgm) {

	  d3.select(cgm.params.root + ' .brush_group').transition().style('opacity', 0).remove();

	  cgm.params.is_cropping = false;
		};

/***/ }),
/* 254 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/*
	    D3.js Slider
	    Inspired by jQuery UI Slider
	    Copyright (c) 2013, Bjorn Sandvik - http://blog.thematicmapping.org
	    BSD license: http://opensource.org/licenses/BSD-3-Clause
	*/
	(function (root, factory) {
	  if (true) {
	    // AMD. Register as an anonymous module.
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(255)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports === 'object') {
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
	})(this, function (d3) {
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

/***/ }),
/* 255 */
/***/ (function(module, exports) {

	module.exports = d3;

/***/ }),
/* 256 */
/***/ (function(module, exports) {

	/**
	 * Simple, lightweight, usable local autocomplete library for modern browsers
	 * Because there weren’t enough autocomplete scripts in the world? Because I’m completely insane and have NIH syndrome? Probably both. :P
	 * @author Lea Verou http://leaverou.github.io/awesomplete
	 * MIT license
	 */

	(function () {

		var _ = function (input, o) {
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
				"keydown": function (evt) {
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

			$.bind(this.ul, { "mousedown": function (evt) {
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

			close: function (o) {
				if (!this.opened) {
					return;
				}

				this.ul.setAttribute("hidden", "");
				this.index = -1;

				$.fire(this.input, "awesomplete-close", o || {});
			},

			open: function () {
				this.ul.removeAttribute("hidden");

				if (this.autoFirst && this.index === -1) {
					this.goto(0);
				}

				$.fire(this.input, "awesomplete-open");
			},

			next: function () {
				var count = this.ul.children.length;

				this.goto(this.index < count - 1 ? this.index + 1 : -1);
			},

			previous: function () {
				var count = this.ul.children.length;

				this.goto(this.selected ? this.index - 1 : count - 1);
			},

			// Should not be used, highlights specific item without any checks!
			goto: function (i) {
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

			select: function (selected, origin) {
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

			evaluate: function () {
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
			var o = Array.isArray(data) ? { label: data[0], value: data[1] } : typeof data === "object" && "label" in data && "value" in data ? data : { label: data, value: data };

			this.label = o.label || o.value;
			this.value = o.value;
		}
		Object.defineProperty(Suggestion.prototype = Object.create(String.prototype), "length", {
			get: function () {
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
			for (var i = 0; el = el.previousElementSibling; i++);
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
		if (typeof module === "object" && module.exports) {
			module.exports = _;
		}

		return _;
		})();

/***/ }),
/* 257 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(258);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(260)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../../node_modules/css-loader/index.js!./d3.slider.css", function() {
				var newContent = require("!!../../node_modules/css-loader/index.js!./d3.slider.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 258 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(259)();
	// imports


	// module
	exports.push([module.id, ".d3-slider {\n    position: relative;\n    font-family: Verdana,Arial,sans-serif;\n    font-size: 1.1em;\n    border: 1px solid #aaaaaa;\n    z-index: 2;\n}\n\n.d3-slider-horizontal {\n    height: .8em;\n}  \n\n.d3-slider-range {\n  background:#2980b9;\n  left:0px;\n  right:0px;\n  height: 0.8em;\n  position: absolute;\n}\n\n.d3-slider-range-vertical {\n  background:#2980b9;\n  left:0px;\n  right:0px;\n  position: absolute;\n  top:0;\n}\n\n.d3-slider-vertical {\n    width: .8em;\n    height: 100px;\n}      \n\n.d3-slider-handle {\n    position: absolute;\n    width: 1.2em;\n    height: 1.2em;\n    border: 1px solid #d3d3d3;\n    border-radius: 4px;\n    background: #eee;\n    background: linear-gradient(to bottom, #eee 0%, #ddd 100%);\n    z-index: 3;\n}\n\n.d3-slider-handle:hover {\n    border: 1px solid #999999;\n}\n\n.d3-slider-horizontal .d3-slider-handle {\n    top: -.3em;\n    margin-left: -.6em;\n}\n\n.d3-slider-axis {\n    position: relative;\n    z-index: 1;    \n}\n\n.d3-slider-axis-bottom {\n    top: .8em;\n}\n\n.d3-slider-axis-right {\n    left: .8em;\n}\n\n.d3-slider-axis path {\n    stroke-width: 0;\n    fill: none;\n}\n\n.d3-slider-axis line {\n    fill: none;\n    stroke: #aaa;\n    shape-rendering: crispEdges;\n}\n\n.d3-slider-axis text {\n    font-size: 11px;\n}\n\n.d3-slider-vertical .d3-slider-handle {\n    left: -.25em;\n    margin-left: 0;\n    margin-bottom: -.6em;      \n}", ""]);

	// exports


/***/ }),
/* 259 */
/***/ (function(module, exports) {

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

/***/ }),
/* 260 */
/***/ (function(module, exports, __webpack_require__) {

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
			return /msie [6-9]\b/.test(self.navigator.userAgent.toLowerCase());
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


/***/ }),
/* 261 */
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(262);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(260)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!../css-loader/index.js!./awesomplete.css", function() {
				var newContent = require("!!../css-loader/index.js!./awesomplete.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ }),
/* 262 */
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(259)();
	// imports


	// module
	exports.push([module.id, "[hidden] { display: none; }\n\n.visually-hidden {\n\tposition: absolute;\n\tclip: rect(0, 0, 0, 0);\n}\n\ndiv.awesomplete {\n\tdisplay: inline-block;\n\tposition: relative;\n}\n\ndiv.awesomplete > input {\n\tdisplay: block;\n}\n\ndiv.awesomplete > ul {\n\tposition: absolute;\n\tleft: 0;\n\tz-index: 1;\n\tmin-width: 100%;\n\tbox-sizing: border-box;\n\tlist-style: none;\n\tpadding: 0;\n\tborder-radius: .3em;\n\tmargin: .2em 0 0;\n\tbackground: hsla(0,0%,100%,.9);\n\tbackground: linear-gradient(to bottom right, white, hsla(0,0%,100%,.8));\n\tborder: 1px solid rgba(0,0,0,.3);\n\tbox-shadow: .05em .2em .6em rgba(0,0,0,.2);\n\ttext-shadow: none;\n}\n\ndiv.awesomplete > ul[hidden],\ndiv.awesomplete > ul:empty {\n\tdisplay: none;\n}\n\n@supports (transform: scale(0)) {\n\tdiv.awesomplete > ul {\n\t\ttransition: .3s cubic-bezier(.4,.2,.5,1.4);\n\t\ttransform-origin: 1.43em -.43em;\n\t}\n\t\n\tdiv.awesomplete > ul[hidden],\n\tdiv.awesomplete > ul:empty {\n\t\topacity: 0;\n\t\ttransform: scale(0);\n\t\tdisplay: block;\n\t\ttransition-timing-function: ease;\n\t}\n}\n\n\t/* Pointer */\n\tdiv.awesomplete > ul:before {\n\t\tcontent: \"\";\n\t\tposition: absolute;\n\t\ttop: -.43em;\n\t\tleft: 1em;\n\t\twidth: 0; height: 0;\n\t\tpadding: .4em;\n\t\tbackground: white;\n\t\tborder: inherit;\n\t\tborder-right: 0;\n\t\tborder-bottom: 0;\n\t\t-webkit-transform: rotate(45deg);\n\t\ttransform: rotate(45deg);\n\t}\n\n\tdiv.awesomplete > ul > li {\n\t\tposition: relative;\n\t\tpadding: .2em .5em;\n\t\tcursor: pointer;\n\t}\n\t\n\tdiv.awesomplete > ul > li:hover {\n\t\tbackground: hsl(200, 40%, 80%);\n\t\tcolor: black;\n\t}\n\t\n\tdiv.awesomplete > ul > li[aria-selected=\"true\"] {\n\t\tbackground: hsl(205, 40%, 40%);\n\t\tcolor: white;\n\t}\n\t\n\t\tdiv.awesomplete mark {\n\t\t\tbackground: hsl(65, 100%, 50%);\n\t\t}\n\t\t\n\t\tdiv.awesomplete li:hover mark {\n\t\t\tbackground: hsl(68, 100%, 41%);\n\t\t}\n\t\t\n\t\tdiv.awesomplete li[aria-selected=\"true\"] mark {\n\t\t\tbackground: hsl(86, 100%, 21%);\n\t\t\tcolor: inherit;\n\t\t}", ""]);

	// exports


/***/ }),
/* 263 */
/***/ (function(module, exports, __webpack_require__) {

	var ini_sidebar = __webpack_require__(224);
	var set_up_filters = __webpack_require__(264);
	var set_up_search = __webpack_require__(269);
	var set_up_reorder = __webpack_require__(270);
	var set_sidebar_ini_view = __webpack_require__(271);
	var make_icons = __webpack_require__(272);
	var make_modals = __webpack_require__(274);
	var set_up_opacity_slider = __webpack_require__(276);
	var make_colorbar = __webpack_require__(277);
	var underscore = __webpack_require__(3);

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

	  if (cgm.params.make_modals) {
	    make_modals(params);
	  }

	  if (params.sidebar.icons) {
	    make_icons(cgm, sidebar);
	  }

	  set_up_reorder(params, sidebar);

	  set_up_search(sidebar, params);

	  set_up_opacity_slider(sidebar);

	  var possible_filter_names = underscore.keys(params.viz.possible_filters);

	  if (possible_filter_names.indexOf('enr_score_type') > -1) {
	    possible_filter_names.sort(function (a, b) {
	      return a.toLowerCase().localeCompare(b.toLowerCase());
	    });
	  }

	  cgm.slider_functions = {};

	  underscore.each(possible_filter_names, function (inst_filter) {
	    set_up_filters(cgm, inst_filter);
	  });

	  ini_sidebar(cgm);

	  // when initializing the visualization using a view
	  if (params.ini_view !== null) {

	    set_sidebar_ini_view(params);

	    params.ini_view = null;
	  }

	  make_colorbar(cgm);
		};

/***/ }),
/* 264 */
/***/ (function(module, exports, __webpack_require__) {

	var make_slider_filter = __webpack_require__(265);
	var make_button_filter = __webpack_require__(268);

	module.exports = function set_up_filters(cgm, filter_type) {

	  var params = cgm.params;

	  var div_filters = d3.select(params.root + ' .sidebar_wrapper').append('div').classed('div_filters', true).style('padding-left', '10px').style('padding-right', '10px');

	  if (params.viz.possible_filters[filter_type] == 'numerical') {
	    make_slider_filter(cgm, filter_type, div_filters);
	  } else if (params.viz.possible_filters[filter_type] == 'categorical') {
	    make_button_filter(cgm, filter_type, div_filters);
	  }
		};

/***/ }),
/* 265 */
/***/ (function(module, exports, __webpack_require__) {

	var make_filter_title = __webpack_require__(247);
	var run_filter_slider = __webpack_require__(266);
	var get_filter_default_state = __webpack_require__(6);
	var get_subset_views = __webpack_require__(64);
	d3.slider = __webpack_require__(254);
	var underscore = __webpack_require__(3);

	module.exports = function make_slider_filter(cgm, filter_type, div_filters) {

	  var params = cgm.params;
	  var inst_view = {};

	  var possible_filters = underscore.keys(params.viz.possible_filters);

	  underscore.each(possible_filters, function (tmp_filter) {
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

	  var run_filter_slider_db = underscore.debounce(run_filter_slider, 800);
		};

/***/ }),
/* 266 */
/***/ (function(module, exports, __webpack_require__) {

	var update_viz_with_view = __webpack_require__(209);
	var reset_other_filter_sliders = __webpack_require__(246);
	var get_current_orders = __webpack_require__(267);
	var make_requested_view = __webpack_require__(66);
	var underscore = __webpack_require__(3);

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

	    if (underscore.has(available_views[0], 'enr_score_type')) {
	      var enr_state = d3.select(params.root + ' .toggle_enr_score_type').attr('current_state');

	      requested_view.enr_score_type = enr_state;
	    }

	    update_viz_with_view(cgm, requested_view);
	  }
		};

/***/ }),
/* 267 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function get_current_orders(params) {

	  // get current orders
	  var other_rc;
	  underscore.each(['row', 'col'], function (inst_rc) {

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

/***/ }),
/* 268 */
/***/ (function(module, exports, __webpack_require__) {

	// var update_network = require('../network/update_network');
	var make_requested_view = __webpack_require__(66);

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

/***/ }),
/* 269 */
/***/ (function(module, exports) {

	module.exports = function set_up_search(sidebar, params) {

	  var search_container = sidebar.append('div')
	  // .classed('row',true)
	  .classed('gene_search_container', true).style('padding-left', '10px').style('padding-right', '10px').style('margin-top', '10px');

	  search_container.append('input').classed('form-control', true).classed('gene_search_box', true).classed('sidebar_text', true).attr('type', 'text').attr('placeholder', params.sidebar.row_search.placeholder).style('height', params.sidebar.row_search.box.height + 'px').style('margin-top', '10px');

	  search_container.append('div').classed('gene_search_button', true).style('margin-top', '5px').attr('data-toggle', 'buttons').append('button').classed('sidebar_text', true).html('Search').attr('type', 'button').classed('btn', true).classed('btn-primary', true).classed('submit_gene_button', true).style('width', '100%').style('font-size', '14px');
		};

/***/ }),
/* 270 */
/***/ (function(module, exports, __webpack_require__) {

	// var get_cat_title = require('../categories/get_cat_title');
	var underscore = __webpack_require__(3);

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

	  underscore.each(reorder_types, function (inst_rc) {

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

	    underscore.each(tmp_orders, function (inst_name) {

	      if (inst_name.indexOf(other_rc) > -1) {
	        inst_name = inst_name.replace('_row', '').replace('_col', '');

	        if (inst_name.indexOf('cat_') < 0) {
	          possible_orders.push(inst_name);
	        }
	      }
	    });

	    // specific to Enrichr
	    if (underscore.keys(params.viz.filter_data).indexOf('enr_score_type') > -1) {
	      possible_orders = ['clust', 'rank'];
	    }

	    possible_orders = underscore.uniq(possible_orders);

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

/***/ }),
/* 271 */
/***/ (function(module, exports, __webpack_require__) {

	var make_filter_title = __webpack_require__(247);
	var underscore = __webpack_require__(3);

	module.exports = function set_sidebar_ini_view(params) {

	  underscore.each(underscore.keys(params.ini_view), function (inst_filter) {

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

/***/ }),
/* 272 */
/***/ (function(module, exports, __webpack_require__) {

	var file_saver = __webpack_require__(249);
	var two_translate_zoom = __webpack_require__(146);
	var deactivate_cropping = __webpack_require__(253);
	var save_svg_png = __webpack_require__(273);

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

	    cgm.save_matrix();
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

	    var html = d3.select(params.root + " .viz_svg").attr("title", "test2").attr("version", 1.1).attr("xmlns", "http://www.w3.org/2000/svg").node().parentNode.innerHTML;

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

/***/ }),
/* 273 */
/***/ (function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_RESULT__;(function () {
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
	        checkDone = function () {
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
	                match = el.querySelector(selectorText) || el.parentNode.querySelector(selectorText);
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

	                //handle url if relative
	                if (externalFontUrl.startsWith('../')) {
	                  externalFontUrl = sheets[i].href + '/../' + externalFontUrl;
	                } else if (externalFontUrl.startsWith('./')) {
	                  externalFontUrl = sheets[i].href + '/.' + externalFontUrl;
	                }

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

	    var convertToPng = function (src, w, h) {
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
	        saveLink.style.display = 'none';
	        document.body.appendChild(saveLink);
	        try {
	          var blob = uriToBlob(uri);
	          var url = URL.createObjectURL(blob);
	          saveLink.href = url;
	          saveLink.onclick = function () {
	            requestAnimationFrame(function () {
	              URL.revokeObjectURL(url);
	            });
	          };
	        } catch (e) {
	          console.warn('This browser does not support object URLs. Falling back to string URL.');
	          saveLink.href = uri;
	        }
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

/***/ }),
/* 274 */
/***/ (function(module, exports, __webpack_require__) {

	var make_modal_skeleton = __webpack_require__(275);

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

/***/ }),
/* 275 */
/***/ (function(module, exports) {

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

/***/ }),
/* 276 */
/***/ (function(module, exports) {

	module.exports = function set_up_opacity_slider(sidebar) {

	  var slider_container = sidebar.append('div').classed('opacity_slider_container', true).style('margin-top', '5px').style('padding-left', '10px').style('padding-right', '10px');

	  slider_container.append('div').classed('sidebar_text', true).classed('opacity_slider_text', true).style('margin-bottom', '3px').text('Opacity Slider');

	  slider_container.append('div').classed('slider', true).classed('opacity_slider', true);
		};

/***/ }),
/* 277 */
/***/ (function(module, exports, __webpack_require__) {

	var underscore = __webpack_require__(3);

	module.exports = function make_colorbar(cgm) {

	  var params = cgm.params;

	  d3.select(params.root + ' .sidebar_wrapper').append('div').classed('sidebar_text', true).style('padding-left', '10px').style('padding-top', '5px').text('Matrix Values');

	  var colorbar_width = params.sidebar.width - 20;
	  var colorbar_height = 13;
	  var svg_height = 3 * colorbar_height;
	  var svg_width = 1.2 * colorbar_width;
	  var low_left_margin = 10;
	  var top_margin = 33;
	  var high_left_margin = colorbar_width + 10;
	  var bar_margin_left = 10;
	  var bar_margin_top = 3;

	  var network_data = params.network_data;

	  var max_link = underscore.max(network_data.links, function (d) {
	    return d.value;
	  }).value;

	  var min_link = underscore.min(network_data.links, function (d) {
	    return d.value;
	  }).value;

	  var main_svg = d3.select(params.root + ' .sidebar_wrapper').append('svg').attr('height', svg_height + 'px').attr('width', svg_width + 'px');

	  //Append a defs (for definition) element to your SVG
	  var defs = main_svg.append("defs");

	  //Append a linearGradient element to the defs and give it a unique id
	  var linearGradient = defs.append("linearGradient").attr("id", "linear-gradient");

	  var special_case = 'none';

	  // no negative numbers
	  if (min_link >= 0) {

	    //Set the color for the start (0%)
	    linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "white");

	    //Set the color for the end (100%)
	    linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "red");

	    special_case = 'all_postiive';

	    // no positive numbers
	  } else if (max_link <= 0) {

	    //Set the color for the start (0%)
	    linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "blue");

	    //Set the color for the end (100%)
	    linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "white");

	    special_case = 'all_negative';
	  }

	  // both postive and negative numbers
	  else {
	      //Set the color for the start (0%)
	      linearGradient.append("stop").attr("offset", "0%").attr("stop-color", "blue");

	      //Set the color for the end (100%)
	      linearGradient.append("stop").attr("offset", "50%").attr("stop-color", "white");

	      //Set the color for the end (100%)
	      linearGradient.append("stop").attr("offset", "100%").attr("stop-color", "red");
	    }

	  // make colorbar
	  main_svg.append('rect').classed('background', true).attr('height', colorbar_height + 'px').attr('width', colorbar_width + 'px').attr('fill', 'url(#linear-gradient)').attr('transform', 'translate(' + bar_margin_left + ', ' + bar_margin_top + ')').attr('stroke', 'grey').attr('stroke-width', '0.25px');

	  // make title
	  ///////////////

	  var max_abs_val = Math.abs(Math.round(params.matrix.max_link * 10) / 10);
	  var font_size = 13;

	  main_svg.append('text').text(function () {
	    var inst_string;
	    if (special_case === 'all_postiive') {
	      inst_string = 0;
	    } else {
	      inst_string = '-' + max_abs_val.toLocaleString();
	    }
	    return inst_string;
	  }).style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').style('font-weight', 300).style('font-size', font_size).attr('transform', 'translate(' + low_left_margin + ',' + top_margin + ')').attr('text-anchor', 'start');

	  main_svg.append('text').text(max_abs_val.toLocaleString()).text(function () {
	    var inst_string;
	    if (special_case === 'all_negative') {
	      inst_string = 0;
	    } else {
	      inst_string = max_abs_val.toLocaleString();
	    }
	    return inst_string;
	  }).style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif').style('font-weight', 300).style('font-size', font_size).attr('transform', 'translate(' + high_left_margin + ',' + top_margin + ')').attr('text-anchor', 'end');
		};

/***/ })
/******/ ]);
//# sourceMappingURL=clustergrammer.js.map