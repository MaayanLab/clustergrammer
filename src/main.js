var make_config = require('./config');
var make_params = require('./params/');
var make_viz = require('./viz');
var resize_viz = require('./reset_size/resize_viz');
var play_demo = require('./demo/play_demo');

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

  // make visualization parameters using configuration object
  var params = make_params(config);

  var cgm = {};
  cgm.params = params;
  cgm.config = config;

  if (params.use_sidebar) {
    var make_sidebar = require('./sidebar/');
    params = make_sidebar(cgm);
  }
  
  // make visualization using parameters
  make_viz(params);

  function external_resize(){

    d3.select(params.viz.viz_svg).style('opacity', 0.5);

    var wait_time = 500;
    if (this.params.viz.run_trans === true){
      wait_time = 2500;
    }

    setTimeout(resize_fun, wait_time, this);
  }

  function resize_fun(cgm){
    // use this params, because this will have the latest params 
    resize_viz(cgm.params);
  }

  function modify_params(){
    this.params.something = 'here';
  }

  cgm.resize_viz = external_resize;
  cgm.modify_params = modify_params;

  cgm.play_demo = play_demo;

  return cgm;
}

module.exports = Clustergrammer;
