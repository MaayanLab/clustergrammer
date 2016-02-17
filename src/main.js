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
    generate_sidebar(params, viz);
  }

  return {
    params: params,
    config:config,
    find_gene: viz.search.find_entities,
    get_genes: viz.search.get_entities,
    change_groups: viz.change_groups,
    reorder: viz.reorder,
    opacity_slider: viz.opacity_slider,
    opacity_function: viz.opacity_function,
    resize: viz.run_reset_visualization_size,
    update_network: viz.update_network,
    reset_zoom: viz.reset_zoom,
    change_category: require('./network/change_category'),
    set_up_N_filters: require('./filters/set_up_N_filters'),
    ini_sliders: require('./filters/ini_sliders')
  };
}

module.exports = Clustergrammer;
