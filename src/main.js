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
// var make_row_cat = require('./dendrogram/make_row_cat');

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

  function update_cats(){
    var tmp_params = this.params;

    // var row_nodes = tmp_params.network_data.row_nodes;

    _.each(this.params.network_data.row_nodes, function(inst_node){

      inst_node['cat_0_index'] = 0
      inst_node['cat-0'] = 'Very Interesting';

      inst_node['cat_1_index'] = 0
      inst_node['cat-1'] = 'Very Interesting';

    });

    // _.each(this.params.network_data.col_nodes, function(inst_node){
    //   delete inst_node['cat_1_index'];
    //   delete inst_node['cat-1'];
    // })

    var names = {};
    names.row = this.params.network_data.row_nodes_names;
    names.col = this.params.network_data.col_nodes_names;

    this.params.viz.all_cats.row = ['cat-0','cat-1'];
    this.params.viz.cat_colors.row['cat-1'] = this.params.viz.cat_colors.row['cat-0']

    // this.params.viz.all_cats.col = ['cat-0'];

    // // possibly update entire visualization
    // filter_viz_using_names(names, cgm);

    this.params.viz = ini_viz_params(this.config, this.params)

    // make_row_cat(this.params, true);
    // resize_viz(this);

    // // only update make_row_cat - probably not going to work
    // // console.log('cgm.update_cats')

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
