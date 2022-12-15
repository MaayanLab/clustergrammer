var each = require('underscore/cjs/each');
var utils = require('../Utils_clust');

module.exports = function get_available_filters(views) {
  var possible_filters = {};
  var filter_data = {};

  each(views, function (inst_view) {
    var inst_keys = Object.keys(inst_view || {});

    inst_keys.forEach(function (inst_key) {
      if (inst_key != 'nodes') {
        if (!utils.has(filter_data, inst_key)) {
          filter_data[inst_key] = [];
        }
        filter_data[inst_key].push(inst_view[inst_key]);
        filter_data[inst_key] = Array.from(new Set([filter_data[inst_key]]));
      }
    });
  });

  var tmp_filters = Object.keys(filter_data);

  tmp_filters.forEach(function (inst_filter) {
    var options = filter_data[inst_filter];
    var num_options = options.length;

    var filter_type = 'categorical';
    each(options, function (inst_option) {
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
