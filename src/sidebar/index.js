
var utils = require('../utils');
var ini_sidebar = require('./ini_sidebar');
var set_up_filters = require('../filters/set_up_filters');
var set_up_colorbar = require('./set_up_colorbar');
var set_up_search = require('./set_up_search');
var set_up_reorder = require('./set_up_reorder');

/* Represents sidebar with controls.
 */
module.exports = function sidebar(config, params) {

  var sidebar_height = window.innerHeight - 20;

  var sidebar = d3
    .select(params.root)
    .append('div')
    .attr('class', 'sidebar_wrapper' )
    .style('margin-left','10px')
    .style('float', 'left')
    .style('width','180px')
    .style('height', sidebar_height+'px')
    .style('overflow-y','scroll');

  set_up_reorder(params, sidebar);

  set_up_search(sidebar, params);

  // only checking rows for dendrogram, should always be present and rows and cols 
  var inst_rows = params.network_data.row_nodes;
  var found_colorbar = _.filter(inst_rows, function(d) { return utils.has(d,'group'); }).length;
  if (found_colorbar>0){
    set_up_colorbar(sidebar, params);
  }

  var views = params.network_data.views;

  var possible_filters = [
    'N_row_sum',
    'N_row_var',
    'pct_row_sum',
    'pct_row_var'
  ];

  _.each(possible_filters, function(inst_filter){
    var num_views = _.filter(views, function(d) { 
        return utils.has(d,inst_filter); 
      }).length;

    if (num_views > 0){
      set_up_filters(config, params, inst_filter);
    }
  });
  
  ini_sidebar(params);

  var long_name;

  _.each(['row','col'], function(inst_rc){

    if (params.show_categories[inst_rc]){

      var num_cats = params.viz.all_cats[inst_rc].length;

      _.each( d3.range(num_cats).reverse(), function(i){

        var inst_cat = params.viz.all_cats[inst_rc][i];

        var key_cat = d3.select(params.root+' .sidebar_wrapper')
          .append('div')
          .classed('key_cat_'+inst_rc,true)
          .style('margin-top','10px')
          .style('padding','5px')
          .style('border','1px solid #DEDEDE')
          .style('margin-bottom','10px')
          .style('overflow','scroll')
          .style('max-height','120px');

        var inst_num = parseInt(inst_cat.split('-')[1],10)+1;

        if (inst_rc === 'row'){
          long_name = 'Row';
        } else {
          long_name = 'Column';
        }

        key_cat
          .append('p')
          .text(long_name+' Category ' + String(inst_num))
          .style('margin-bottom','2px');

        var all_cats = _.keys(params.viz.cat_colors[inst_rc][inst_cat]);

        all_cats = all_cats.sort();

        _.each(all_cats, function(inst_name){

          var inst_group = key_cat
            .append('g')
            .attr('class','category_section');

          inst_group
            .append('div')
            .attr('class','category_color')
            .style('width','15px')
            .style('height','15px')
            .style('float','left')
            .style('margin-right','5px')
            .style('margin-top','2px')
            .style('background-color',function(){
              var inst_color = params.viz.cat_colors[inst_rc][inst_cat][inst_name];
              return inst_color;
            })
            .style('opacity', params.viz.cat_colors.opacity);

          inst_group
            .append('p')
            .style('margin-bottom','2px')
            .append('text')
            .text(inst_name)
            .attr('class','noselect')
            .style('cursor','pointer');

        });

      });

    }

  });

};
