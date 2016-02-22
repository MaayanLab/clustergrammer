var utils = require('../utils');
var update_network = require('../network/update_network');
var disable_sidebar = require('../sidebar/disable_sidebar');
var enable_sidebar  = require('../sidebar/enable_sidebar');

module.exports = function set_up_filters(config, params, filter_type, initial_text) {

  var row_filters = d3.select(params.root+' .'+params.sidebar.sidebar_class)
    .append('div')
    .classed('row_filters',true);

  row_filters
    .append('div')
    .classed('viz_medium_text',true)
    .classed(filter_type,true)
    .text(initial_text);

  row_filters
    .append('div')
    .classed('slider_'+filter_type,true)
    .classed('slider',true);

  var views = params.network_data.views;

  var available_views = _.filter(views, function(d) { return utils.has(d,filter_type); });

  // // find views of current category 
  // if ( utils.has(available_views[0],'col_cat') ) {
  //   // get views with current_col_cat
  //   available_views = _.filter(available_views, function(d){
  //     if (d.col_cat == params.current_col_cat){
  //       return d;
  //     }
  //   })
  // }

  var inst_max = available_views.length - 1;

  $( '.slider_'+filter_type ).slider({
    value:0,
    min: 0,
    max: inst_max,
    step: 1,
    stop: function() {

      // get value
      var inst_index = $( params.root+' .slider_'+filter_type ).slider( "value" );

      var inst_view_name = available_views[inst_index][filter_type];

      var requested_view = {};
      requested_view[filter_type] = inst_view_name;

      disable_sidebar(params);

      params = update_network(config, params, requested_view);

      d3.select(params.root+' .'+filter_type).text('Top rows: '+inst_view_name+' rows');

      setTimeout(enable_sidebar, 2500, params);

    }
  });

};
