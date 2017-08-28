var make_filter_title = require('./make_filter_title');
var run_filter_slider = require('./run_filter_slider');
var get_filter_default_state = require('./get_filter_default_state');
var get_subset_views = require('./get_subset_views');
d3.slider = require('../d3.slider');
var underscore = require('underscore');

module.exports = function make_slider_filter(cgm, filter_type, div_filters){

  var params = cgm.params;
  var inst_view = {};

  var possible_filters = underscore.keys(params.viz.possible_filters);

  underscore.each(possible_filters, function(tmp_filter){
    if (tmp_filter != filter_type){
      var default_state = get_filter_default_state(params.viz.filter_data, tmp_filter);
      inst_view[tmp_filter] = default_state;
    }
  });

  var filter_title = make_filter_title(params, filter_type);

  div_filters
    .append('div')
    .classed('title_'+filter_type,true)
    .classed('sidebar_text', true)
    .classed('slider_description', true)
    .style('margin-top', '5px')
    .style('margin-bottom', '3px')
    .text(filter_title.text + filter_title.state + filter_title.suffix);

  div_filters
    .append('div')
    .classed('slider_'+filter_type,true)
    .classed('slider',true)
    .attr('current_state', filter_title.state);

  var views = params.network_data.views;

  var available_views = get_subset_views(params, views, inst_view);

  // sort available views by filter_type value
  available_views = available_views.sort(function(a, b) {
      return b[filter_type] - a[filter_type];
  });

  var inst_max = available_views.length - 1;


  var ini_value = 0;
  // change the starting position of the slider if necessary
  if (params.requested_view !== null && filter_type in params.requested_view){

    var inst_filter_value = params.requested_view[filter_type];

    if (inst_filter_value != 'all'){

      var found_value = available_views.map(function(e) { return e[filter_type]; }).indexOf(inst_filter_value);

      if (found_value > 0){
        ini_value = found_value;
      }

    }

  }

  // Filter Slider
  //////////////////////////////////////////////////////////////////////
  var slide_filter_fun = d3.slider()
                           .value(ini_value)
                           .min(0)
                           .max(inst_max)
                           .step(1)
                           .on('slide', function(evt, value){
                              run_filter_slider_db(cgm, filter_type, available_views, value);
                           })
                           .on('slideend', function(evt, value){
                              run_filter_slider_db(cgm, filter_type, available_views, value);
                           });


  // save slider function in order to reset value later
  cgm.slider_functions[filter_type] = slide_filter_fun;


  d3.select(cgm.params.root+' .slider_'+filter_type)
    .call(slide_filter_fun);

  //////////////////////////////////////////////////////////////////////

  var run_filter_slider_db = underscore.debounce(run_filter_slider, 800);

};
