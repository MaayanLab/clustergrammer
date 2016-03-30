var make_filter_title = require('./make_filter_title');
var utils = require('../utils');
var apply_filter_slider = require('./apply_filter_slider');

module.exports = function make_slider_filter(config, params, filter_type, div_filters){

  console.log(filter_type)

  var filter_title = make_filter_title(filter_type);
  
  div_filters
    .append('div')
    .classed('viz_medium_text',true)
    .classed('title_'+filter_type,true)
    .text(filter_title.text + filter_title.state + filter_title.suffix);

  div_filters
    .append('div')
    .classed('slider_'+filter_type,true)
    .classed('slider',true)
    .style('width', params.sidebar.slider.width+'px')
    .style('margin-left', params.sidebar.slider.margin_left+'px')
    .attr('current_state', filter_title.state);
    
  var views = params.network_data.views;

  var available_views = _.filter(views, function(d) { 
    return utils.has( d, filter_type); 
  });

  var inst_max = available_views.length - 1;

  $( '.slider_'+filter_type ).slider({
    value:0,
    min: 0,
    max: inst_max,
    step: 1,
    stop: function() {
      params = apply_filter_slider(config, params, filter_type, available_views);
    }
  });

};