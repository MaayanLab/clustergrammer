var utils = require('../utils');
var make_filter_title = require('./make_filter_title');
var stop_filter_slider = require('./stop_filter_slider');

module.exports = function set_up_filters(config, params, filter_type) {

  var filter_title = make_filter_title(filter_type);

  var all_filters = d3.select(params.root+' .sidebar_wrapper')
    .append('div')
    .classed('all_filters',true);

  all_filters
    .append('div')
    .classed('viz_medium_text',true)
    .classed('title_'+filter_type,true)
    .text(filter_title.text + filter_title.value + filter_title.suffix);

  all_filters
    .append('div')
    .classed('slider_'+filter_type,true)
    .classed('slider',true)
    .style('width', params.sidebar.slider.width+'px')
    .style('margin-left', params.sidebar.slider.margin_left+'px');
    

  var views = params.network_data.views;

  var available_views = _.filter(views, function(d) { return utils.has(d,filter_type); });

  var inst_max = available_views.length - 1;

  $( '.slider_'+filter_type ).slider({
    value:0,
    min: 0,
    max: inst_max,
    step: 1,
    stop: function() {
      params = stop_filter_slider(config, params, filter_type, available_views);
    }
  });

};
