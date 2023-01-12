var d3 = require('d3');

module.exports = function make_view_request(params, requested_view) {
  // this will add all necessary information to a view request
  // it will grab necessary view information from the sliders

  // only one component will be changed at a time
  var changed_component = Object.keys(requested_view || {})[0];

  // add additional filter information from othe possible filters
  Object.keys(params.viz.possible_filters || {}).forEach(function (
    inst_filter
  ) {
    if (inst_filter != changed_component) {
      if (!d3.select(params.root + ' .slider_' + inst_filter).empty()) {
        var inst_state = d3
          .select(params.root + ' .slider_' + inst_filter)
          .attr('current_state');

        requested_view[inst_filter] = inst_state;
      }
    }
  });

  return requested_view;
};
