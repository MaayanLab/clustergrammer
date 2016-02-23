
var utils = require('../utils');
var ini_sidebar = require('../sidebar/ini_sidebar');
var set_up_filters = require('../filters/set_up_filters');

/* Represents sidebar with controls.
 */
module.exports = function sidebar(config, params) {
  var is_active;

  var button_data = [
      {'name':'Cluster',
       'short_name':'clust'},
      {'name':'Rank by Sum',
      'short_name':'rank'}
    ];

  var sidebar = d3
    .select(params.root)
    .append('div')
    .attr('class', params.sidebar.sidebar_class )
    .style('margin-left','10px')
    .style('float', 'left')
    .style('width','180px');

  sidebar
    .append('div')
    .html('Row Order');

  var row_reorder = sidebar
    .append('div')
    .classed('viz_medium_text',true)
    .append('div')
    .classed('btn-group-vertical',true)
    .classed('toggle_col_order',true)
    .attr('role','group');

  row_reorder
    .selectAll('.button')
    .data(button_data)
    .enter()
    .append('button')
    .attr('type','button')
    .classed('btn',true)
    .classed('btn-primary',true)
    .classed('active', function(d){
      is_active = false;
      if (d.name == 'Cluster'){
        is_active = true;
      }
      return is_active;
    })
    .attr('name', function(d){
      return d.short_name;
    })
    .html(function(d){return d.name;});

  sidebar
    .append('div')
    .html('Column Order');

  var col_reorder = sidebar
    .append('div')
    .classed('viz_medium_text',true)
    .append('div')
    .classed('btn-group-vertical',true)
    .classed('toggle_row_order',true)
    .attr('role','group');

  col_reorder
    .selectAll('.button')
    .data(button_data)
    .enter()
    .append('button')
    .attr('type','button')
    .classed('btn',true)
    .classed('btn-primary',true)
    .classed('active', function(d){
      is_active = false;
      if (d.name == 'Cluster'){
        is_active = true;
      }
      return is_active;
    })
    .attr('name', function(d){
      return d.short_name;
    })
    .html(function(d){return d.name;});

  var search_container = sidebar
    .append('div')
    .classed('row',true)
    .classed('gene_search_container',true);

  search_container
    .append('input')
    .classed('form-control',true)
    .classed('gene_search_box',true)
    .attr('type','text')
    .attr('placeholder','Input Gene');

  search_container
    .append('div')
    .classed('btn-group',true)
    .classed('gene_search_button',true)
    .attr('data-toggle','buttons')
    .append('div')
    .append('button')
    .html('Search')
    .attr('type','button')
    .classed('btn',true)
    .classed('btn-primary',true)
    .classed('submit_gene_button',true);

  var colorbar_sliders = sidebar
    .append('div')
    .classed('colorbar_sliders',true);

  colorbar_sliders
    .append('p')
    .classed('viz_medium_text',true)
    .text('Row Group Size');

  colorbar_sliders
    .append('div')
    .classed('slider_row',true)
    .classed('slider',true);

  colorbar_sliders
    .append('p')
    .classed('viz_medium_text',true)
    .text('Column Group Size');

  colorbar_sliders
    .append('div')
    .classed('slider_col',true)
    .classed('slider',true);


  var filter_type;
  var views = params.network_data.views;

  var possible_filters = ['N_row_sum','pct_row_sum'];

  _.each(possible_filters, function(inst_filter){
    var num_views = _.filter(views, function(d) { return utils.has(d,inst_filter); }).length;
    if (num_views > 0){
      set_up_filters(config, params, inst_filter);
    }
  })
  
  ini_sidebar(params);

};
