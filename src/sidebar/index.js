var ini_sidebar = require('./ini_sidebar');
var set_up_filters = require('../filters/set_up_filters');
var set_up_search = require('./set_up_search');
var set_up_reorder = require('./set_up_reorder');
var set_sidebar_ini_view = require('./set_sidebar_ini_view');
var make_icons = require('./make_icons');
var make_modals = require('./make_modals');
var set_up_opacity_slider = require('./set_up_opacity_slider');
var make_colorbar = require('./make_colorbar');
var underscore = require('underscore');

/* Represents sidebar with controls.
 */
module.exports = function sidebar(cgm) {

  var params = cgm.params;

  var sidebar = d3.select(params.root+' .sidebar_wrapper');

  // console.log('is_expand ',params.viz.is_expand)

  if (params.viz.is_expand){
    sidebar
      .style('display','none');
  }

  sidebar
    .append('div')
    .classed('title_section',true);

  if (params.sidebar.title != null){
    sidebar
      .select('.title_section')
      .append('h4')
      // .style('margin-left', params.sidebar.title_margin_left+'px')
      .style('margin-left', '20px')
      .style('margin-top','5px')
      .style('margin-bottom','0px')
      .text(params.sidebar.title);
  }

  sidebar
    .append('div')
    .style('padding-right', '2px')
    .classed('about_section',true);

  if (params.sidebar.about != null){

    sidebar
      .select('.about_section')
      .append('h5')
      .classed('sidebar_text',true)
      .style('margin-left','7px')
      .style('margin-top','5px')
      .style('margin-bottom','2px')
      .style('text-align','justify')
      .html(params.sidebar.about);
  }

  sidebar
    .append('div')
    .classed('icons_section',true)
    .style('text-align', 'center');

  if (cgm.params.make_modals){
    make_modals(params);
  }


  if (params.sidebar.icons){
    make_icons(cgm, sidebar);
  }

  set_up_reorder(params, sidebar);

  set_up_search(sidebar, params);

  set_up_opacity_slider(sidebar);

  var possible_filter_names = underscore.keys(params.viz.possible_filters);

  if (possible_filter_names.indexOf('enr_score_type')>-1){
    possible_filter_names.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }

  cgm.slider_functions = {};

  underscore.each(possible_filter_names, function(inst_filter){
    set_up_filters(cgm, inst_filter);
  });

  ini_sidebar(cgm);

  // when initializing the visualization using a view
  if (params.ini_view !== null) {

    set_sidebar_ini_view(params);

    params.ini_view = null;

  }

  make_colorbar(cgm);

};
