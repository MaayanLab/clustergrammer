var utils = require('../utils');
var update_network = require('../network/update_network');
var disable_sidebar = require('../sidebar/disable_sidebar');
var enable_sidebar  = require('../sidebar/enable_sidebar');
var make_filter_title = require('./make_filter_title');

module.exports = function set_up_filters(config, params, filter_type) {

  var filter_title = make_filter_title(filter_type);

  var row_filters = d3.select(params.root+' .sidebar_wrapper')
    .append('div')
    .classed('row_filters',true);

  row_filters
    .append('div')
    .classed('viz_medium_text',true)
    .classed('title_'+filter_type,true)
    .text(filter_title.text + filter_title.value + filter_title.suffix);

  row_filters
    .append('div')
    .classed('slider_'+filter_type,true)
    .classed('slider',true)
    .style('width', params.sidebar.slider.width+'px')
    .style('margin-left', params.sidebar.slider.margin_left+'px');
    

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

      // if (filter_type==='pct_row_sum'){
      //   inst_view_name = String(100-inst_view_name *100);
      //   $(params.root+' .slider_N_row_sum').slider( "value", 0);

      // } else if (filter_type === 'N_row_sum'){
      //   $(params.root+' .slider_pct_row_sum').slider( "value", 0);
      //   $(params.root+' .slider_N_row_var').slider( "value", 0);
      // } else if (filter_type === 'N_row_var'){
      //   $(params.root+' .slider_N_row_sum').slider( "value", 0);
      // }

      // console.log(filter_type)
      _.each(params.viz.possible_filters, function(reset_filter){
        if (filter_type != reset_filter){

          $(params.root+' .slider_'+reset_filter).slider( "value", 0);

          d3.select('.title_'+reset_filter)
            .text(filter_title.text + filter_title.value + filter_title.suffix);
        }
      });


      disable_sidebar(params);

      // get current row ordering from buttons 
      if (d3.select(params.root+' .toggle_row_order .active').empty() === false){
        params.viz.inst_order.col = d3.select(params.root+' .toggle_row_order')
          .select('.active').attr('name');
      } else {
        params.viz.inst_order.col = 'clust';

        d3.select(params.root+' .toggle_row_order')
          .selectAll('.btn')
          .each(function(d){
            if (d === 'clust'){
              d3.select(this)
                .classed('active',true);
            }
          });
      }

      if (d3.select(params.root+' .toggle_col_order .active').empty() === false){
        params.viz.inst_order.row = d3.select(params.root+' .toggle_col_order')
          .select('.active').attr('name');
      } else {
        params.viz.inst_order.row = 'clust';

        d3.select(params.root+' .toggle_col_order')
          .selectAll('.btn')
          .each(function(d){
            if (d === 'clust'){
              d3.select(this)
                .classed('active',true);
            }
          });
      }

      params = update_network(config, params, requested_view);

      d3.select(params.root+' .'+filter_type).text(fitler_title.text + inst_view_name + suffix);

      setTimeout(enable_sidebar, 2500, params);

      return params;

    }
  });

};
