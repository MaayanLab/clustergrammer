
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
    .attr('class', 'sidebar_wrapper' )
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


  if (params.show_categories.col){

    // set up column category key 
    var key_cat_col = d3.select(params.root+' .sidebar_wrapper')
      .append('div')
      .classed('key_cat_col',true)
      .style('margin-top','10px')
      .style('padding','5px')
      .style('border','1px solid #DEDEDE')
      .style('margin-bottom','10px')
      .style('overflow','scroll')
      .style('max-height','200px');

    key_cat_col
      .append('p')
      .text('Column Categories')
      .style('margin-bottom','2px');

    var all_cats = _.keys(params.viz.cat_colors.col['cat-0']);

    all_cats = all_cats.sort();

    _.each(all_cats, function(inst_cat){

      var inst_group = key_cat_col
        .append('g')
        .attr('class','category_section');
        // .on('click', category_key_click);

      inst_group
        .append('div')
        .attr('class','category_color')
        .style('width','15px')
        .style('height','15px')
        .style('float','left')
        .style('margin-right','5px')
        .style('margin-top','2px')
        .style('background-color',function(){
          var inst_color = params.viz.cat_colors.col['cat-0'][inst_cat];
          return inst_color;
        });

      inst_group
        .append('p')
        .style('margin-bottom','2px')
        .append('text')
        .text(inst_cat)
        .attr('class','noselect')
        .style('cursor','pointer');

    });

  }


  // function category_key_click(){
    
    // var inst_cat = d3.select(this).select('text').text();

    // console.log(inst_cat)

    // // update the category 
    // if (cgm.params.current_col_cat === inst_cat){

    //   // show all categories 
    //   cgm.change_category('show_all'); 

    //   // show selection in key 
    //   d3.selectAll('.category_section')
    //     .select('.category_color')
    //     .style('opacity',1);

    //   d3.selectAll('.category_section')
    //     .select('p')
    //     .style('opacity',1);

    //   ini_sliders();

    // } else {

    //   // show one category 
    //   cgm.change_category(inst_cat); 

    //   // show selection in key 
    //   d3.selectAll('.category_section')
    //     .select('.category_color')
    //     .style('opacity',0.35);

    //   d3.selectAll('.category_section')
    //     .select('p')
    //     .style('opacity',0.35);

    //   d3.select(this)
    //     .select('.category_color')
    //     .style('opacity',1);

    //   d3.select(this)
    //     .select('p')
    //     .style('opacity',1);

    //   ini_sliders();
    // }

    // // update the network after changing the category 
    // cgm.update_network('default');

  // }  

};
