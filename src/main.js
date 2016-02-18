var make_config = require('./config');
var make_params = require('./params');
var make_viz = require('./viz');

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
  // make visualization using parameters
  var viz = make_viz(params);

  if (params.use_sidebar) {
    var generate_sidebar = require('./sidebar');
    generate_sidebar(params);
  }

  return {
    params: params,
    config: config,
    find_entity: viz.find_entity,
    get_entities: viz.get_entities,
    reorder: require('./reorder/all_reorder'),
    opacity_slider: viz.opacity_slider,
    opacity_function: viz.opacity_function,
    resize: viz.run_reset_visualization_size,
    update_network: require('./network/update_network'),
    reset_zoom: viz.reset_zoom,
    change_category: require('./network/change_category'),
    set_up_N_filters: require('./filters/set_up_N_filters')
  };
}

module.exports = Clustergrammer;
