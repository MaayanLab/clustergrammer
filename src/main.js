var make_config = require('./config');
var make_params = require('./params/');
var ini_viz_params = require('./params/ini_viz_params');
var make_viz = require('./viz');
var resize_viz = require('./reset_size/resize_viz');
var play_demo = require('./demo/play_demo');
var ini_demo = require('./demo/ini_demo');
var update_viz_with_view = require('./network/update_viz_with_view');
var filter_viz_using_nodes = require('./network/filter_viz_using_nodes');
var filter_viz_using_names = require('./network/filter_viz_using_names');
var make_row_cat = require('./dendrogram/make_row_cat');
var calc_viz_params = require('./params/calc_viz_params');

/* clustergrammer 1.0
 * Nick Fernandez, Ma'ayan Lab, Icahn School of Medicine at Mount Sinai
 * (c) 2016
 */
function Clustergrammer(args) {

  /* Main program
   * ----------------------------------------------------------------------- */
  // consume and validate user input
  // build giant config object
  // visualize based on config object
  // handle user events

  // consume and validate user arguments, produce configuration object
  var config = make_config(args);

  var cgm = {};

  // make visualization parameters using configuration object
  cgm.params = make_params(config);
  cgm.config = config;

  if (cgm.params.use_sidebar) {
    var make_sidebar = require('./sidebar/');
    make_sidebar(cgm);
  }

  // make visualization using parameters
  make_viz(cgm);

  function external_resize() {

    d3.select(cgm.params.viz.viz_svg).style('opacity', 0.5);

    var wait_time = 500;
    if (this.params.viz.run_trans === true){
      wait_time = 2500;
    }

    setTimeout(resize_fun, wait_time, this);
  }

  function resize_fun(cgm){
    resize_viz(cgm);
  }

  function external_update_view(requested_view){
    update_viz_with_view(this, requested_view);
  }

  function update_cats(cat_data){

    console.log('---------\nupdate_Cats\n-------------')
    console.log(cat_data)


    var inst_index = 0;
    var inst_cat_title;
    var inst_cats;
    var inst_members;
    var inst_name;
    // loop through row nodes
    //////////////////////////
    _.each(this.params.network_data.row_nodes, function(inst_node){

      inst_name = inst_node.name;

      // var inst_category = false;
      // loop through all categories and check if the row node is of this
      // category
      _.each(cat_data, function(inst_cat_data){


        inst_cat_title = inst_cat_data.cat_title;
        inst_cats = inst_cat_data.cats;


        _.each(inst_cats, function(inst_cat){

          inst_members = inst_cat.members;

          if ( _.contains(inst_members, inst_name) ){

            console.log(inst_name)
            console.log('***************')
            console.log( inst_cat_title )
            console.log(inst_cat.cat_name)
            console.log('inst_members')
            console.log(inst_members)
            console.log('\n\n')

          }


        })


      })


      // var is_interesting = false;
      // if (inst_index < 10){
      //   is_interesting = true;
      // }

      // inst_node['cat_0_index'] = inst_index
      // inst_node['cat-0'] = 'Very Interesting: '+String(is_interesting);

      // inst_node['cat_1_index'] = inst_index
      // inst_node['cat-1'] = 'Very Interesting: '+String(is_interesting);

      // inst_node['cat_2_index'] = inst_index
      // inst_node['cat-2'] = 'Very Interesting: '+String(is_interesting);

      // inst_index = inst_index + 1;

    });

    // recalculate the visualization parameters using the updated network_data
    this.params = calc_viz_params(this.params);
    make_row_cat(this.params, true);
    resize_viz(this);

  }


  // add more API endpoints
  cgm.update_view = external_update_view;
  cgm.resize_viz = external_resize;
  cgm.play_demo = play_demo;
  cgm.ini_demo = ini_demo;
  cgm.filter_viz_using_nodes = filter_viz_using_nodes;
  cgm.filter_viz_using_names = filter_viz_using_names;
  cgm.update_cats = update_cats;
  return cgm;
}

module.exports = Clustergrammer;
