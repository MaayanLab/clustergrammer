var ini_sidebar = require('./ini_sidebar');
var set_up_filters = require('../filters/set_up_filters');
var set_up_dendro_sliders = require('./set_up_dendro_sliders');
var set_up_search = require('./set_up_search');
var set_up_reorder = require('./set_up_reorder');
var set_sidebar_ini_view = require('./set_sidebar_ini_view');
var make_icons = require('./make_icons');
var make_modals = require('./make_modals');

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
      .style('margin-top','5px')
      .style('margin-bottom','0px')
      .text(params.sidebar.title);
  }

  sidebar
    .append('div')
    .classed('about_section',true);

  if (params.sidebar.about != null){
    sidebar
      .select('.about_section')
      .append('h5')
      .classed('sidebar_text',true)
      .style('font-size','15px')
      .style('font-weight',400)
      .style('margin-left','4px')
      .style('margin-top','5px')
      .style('margin-bottom','2px')
      .style('width', params.sidebar.text.width+'px')
      .style('text-align','justify')
      .text(params.sidebar.about);
  }

  sidebar
    .append('div')
    .classed('icons_section',true);

  if (params.sidebar.icons){
    make_modals(params);
    make_icons(params, sidebar);
  }

  // // tmp sim mat button 
  // sidebar
  //   .append('text')
  //   .text('here')
  //   .on('click',function(){
  //     console.log('change to sim_mat')
  //   })

  set_up_reorder(params, sidebar);

  set_up_search(sidebar, params);

  if (params.viz.show_dendrogram){
    set_up_dendro_sliders(sidebar, params);
  }

  var possible_filter_names = _.keys(params.viz.possible_filters);

  if (possible_filter_names.indexOf('enr_score_type')>-1){
    possible_filter_names.sort(function (a, b) {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }

  _.each(possible_filter_names, function(inst_filter){
    set_up_filters(config, params, inst_filter);
  });
  
  ini_sidebar(params);

  // disable for now 
  // make_cat_keys(params);

  // when initializing the visualization using a view
  if (params.ini_view !== null) {

    set_sidebar_ini_view(params);

    params.ini_view = null;

  }

  return params;

};
