var utils = require('../utils');
var update_network = require('../network/update_network');
var disable_sidebar = require('../sidebar/disable_sidebar');
var enable_sidebar  = require('../sidebar/enable_sidebar');

module.exports = function(config, params, filter_type) {

  var views = params.network_data.views;
  var all_views = _.filter(views, function(d) { return utils.has(d,filter_type); });

  // // find views of current category 
  // if ( utils.has(all_views[0],'col_cat') ) {
  //   // get views with current_col_cat
  //   all_views = _.filter(all_views, function(d){
  //     if (d.col_cat == params.current_col_cat){
  //       return d;
  //     }
  //   })
  // }

  var inst_max = all_views.length - 1;

  var N_dict = {};

  var all_filt = _.pluck( views, 'N_row_sum');

  all_filt.forEach(function(d){
    var tmp_index = _.indexOf(all_filt, d);

    N_dict[tmp_index] = d;

  });

  $( '.slider_'+filter_type ).slider({
    value:0,
    min: 0,
    max: inst_max,
    step: 1,
    stop: function() {

      // get value
      var inst_index = $( params.root+' .slider_'+filter_type ).slider( "value" );

      var inst_view = N_dict[inst_index];

      var requested_view = {'N_row_sum':inst_view};

      d3.select( params.viz.viz_svg ).style('opacity',0.70);

      d3.select(params.root+' .'+filter_type).text('Top rows: '+inst_view+' rows');

      disable_sidebar(params);

      params = update_network(config, params, requested_view);

      setTimeout(function(){
        params.viz.run_trans = false;
      }, 2500);

      setTimeout(enable_sidebar, 2500, params);

    }
  });

};
