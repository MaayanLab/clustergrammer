var make_slider_filter = require('./make_slider_filter');
var make_button_filter = require('./make_button_filter');

module.exports = function set_up_filters(config, params, filter_type) {

  var div_filters = d3.select(params.root+' .sidebar_wrapper')
    .append('div')
    .classed('div_filters',true);

  if (params.viz.possible_filters[filter_type] == 'numerical'){
    make_slider_filter(config, params, filter_type, div_filters);
  } else if (params.viz.possible_filters[filter_type] == 'categorical'){
    make_button_filter(config, params, filter_type, div_filters);
  }

};
