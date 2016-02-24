
var utils = require('../utils');
var ini_sidebar = require('./ini_sidebar');
var set_up_filters = require('../filters/set_up_filters');
var set_up_colorbar = require('./set_up_colorbar');
var set_up_search = require('./set_up_search');
var set_up_reorder = require('./set_up_reorder');

/* Represents sidebar with controls.
 */
module.exports = function sidebar(config, params) {

  var sidebar = d3
    .select(params.root)
    .append('div')
    .attr('class', params.sidebar.sidebar_class )
    .style('margin-left','10px')
    .style('float', 'left')
    .style('width','180px');

  set_up_reorder(params, sidebar);

  set_up_search(sidebar);

  // only checking rows for dendrogram, should always be present and rows and cols 
  var inst_rows = params.network_data.row_nodes;
  var found_colorbar = _.filter(inst_rows, function(d) { return utils.has(d,'group'); }).length;
  if (found_colorbar>0){
    set_up_colorbar(sidebar);
  }

  var views = params.network_data.views;

  var possible_filters = ['N_row_sum','pct_row_sum'];

  _.each(possible_filters, function(inst_filter){
    var num_views = _.filter(views, function(d) { return utils.has(d,inst_filter); }).length;
    if (num_views > 0){
      set_up_filters(config, params, inst_filter);
    }
  });
  
  ini_sidebar(params);

};
