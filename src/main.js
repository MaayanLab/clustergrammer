var make_config = require('./config');
var make_params = require('./params/');
var make_viz = require('./viz');
var resize_viz = require('./reset_size/resize_viz');

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
  var viz = make_viz(params);

  function external_resize(){
    // use this params, because this will have the latest params 
    resize_viz(this.params);
  }

  function modify_params(){
    this.params.something = 'here';
  }

  cgm.resize_viz = external_resize;
  cgm.modify_params = modify_params;

  return cgm;
}

module.exports = Clustergrammer;
