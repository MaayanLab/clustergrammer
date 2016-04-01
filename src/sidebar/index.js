var ini_sidebar = require('./ini_sidebar');
var set_up_filters = require('../filters/set_up_filters');
var set_up_colorbar = require('./set_up_colorbar');
var set_up_search = require('./set_up_search');
var set_up_reorder = require('./set_up_reorder');
var make_cat_keys = require('./make_cat_keys');
var set_sidebar_ini_view = require('./set_sidebar_ini_view');

/* Represents sidebar with controls.
 */
module.exports = function sidebar(config, params) {

  var sidebar = d3.select(params.root+' .sidebar_wrapper');

  sidebar
    .append('div')
    .classed('title_section',true);

  if (params.sidebar.title != null){
    sidebar
      .select('.title_section')
      .append('h4')
      .style('margin-left','3px')
      .style('margin-bottom','5px')
      .text(params.sidebar.title);
  }

  sidebar
    .append('div')
    .classed('about_section',true);

  if (params.sidebar.about != null){
    sidebar
      .select('.about_section')
      .append('h5')
      .style('font-size','15px')
      .style('font-weight',400)
      .style('margin-left','4px')
      .style('margin-bottom','5px')
      .style('width', params.sidebar.text.width+'px')
      .style('text-align','justify')
      .text(params.sidebar.about);
  }

  set_up_reorder(params, sidebar);

  set_up_search(sidebar, params);

  if (params.viz.show_dendrogram){
    set_up_colorbar(sidebar, params);
  }

  var possible_filter_names = _.keys(params.viz.possible_filters);

  _.each(possible_filter_names, function(inst_filter){
    set_up_filters(config, params, inst_filter);
  });
  
  ini_sidebar(params);

  make_cat_keys(params);

  // when initializing the visualization using a view
  if (params.ini_view !== null) {

    set_sidebar_ini_view(params);

    params.ini_view = null;

  }

  return params;

};
