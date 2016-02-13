var generate_config = require('./config');
var generate_viz = require('./viz');

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
  this.config = generate_config(args);
  // make visualization parameters using configuration object
  this.params = generate_params(config);
  // make visualization using parameters
  this.viz = generate_viz();
  if (params.use_sidebar) {
    var sidebar = Sidebar(viz, params);
  }

    /* API
     * ----------------------------------------------------------------------- */
  Clustergrammer.prototype = {
    constructor: Clustergrammer,
    find_gene: viz.search.find_entities,
    get_genes: viz.search.get_entities,
    change_groups: viz.change_groups,
    reorder: viz.reorder,
    opacity_slider: viz.opacity_slider,
    opacity_function: viz.opacity_function,
    resize: viz.run_reset_visualization_size,
    update_network: viz.update_network,
    params: params,
    reset_zoom: viz.reset_zoom,
    config: config,
    change_category: change_category,
    set_up_N_filters: set_up_N_filters,
    ini_sliders:ini_sliders
  };

}
