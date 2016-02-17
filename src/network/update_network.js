var make_params = require('../params');
var change_network_view = require('./change_network_view');
var build_col_dendro = require('../dendrogram/build_col_dendro');
var build_row_dendro = require('../dendrogram/build_row_dendro');
var generate_dendro = require('../dendrogram');
var initialize_resizing = require('../initialize_resizing');
var ini_doubleclick = require('../ini_doubleclick');
var enter_exit_update = require('./enter_exit_update');
var define_enter_exit_delays = require('./define_enter_exit_delays');
var search = require('../search');
var all_reorder = require('../reorder/all_reorder');

module.exports = function(old_params, change_view) {

  /*
  This is being run by the cgm object, and has access to config. 
  */

  // make new_network_data by filtering the original network data
  var config_copy = jQuery.extend(true, {}, this.config);

  var new_network_data = change_network_view(old_params, config_copy.network_data, change_view);

  // make Deep copy of this.config object
  var new_config = jQuery.extend(true, {}, this.config);

  new_config.network_data = new_network_data;
  new_config.inst_order = old_params.viz.inst_order;
  // never switch to expand when updating the matrix
  new_config.ini_expand = false;
  new_config.ini_view = null;
  new_config.current_col_cat = old_params.current_col_cat;

  var params = make_params(new_config);
  var delays = define_enter_exit_delays(old_params, params);

  // ordering - necessary for reordering the function called on button click
  this.reorder = all_reorder;

  enter_exit_update(params, new_network_data, delays);

  // update network data in params
  this.params = params;

  // search functions
  var gene_search = search(params, params.network_data.row_nodes, 'name');
  this.get_genes = gene_search.get_entities;
  this.find_gene = gene_search.find_entities;

  // TODO reenable dendrogram updating
  // redefine change_group function
  if (params.viz.show_dendrogram){
    var row_dendrogram = generate_dendro(params, 'row');
    var col_dendrogram = generate_dendro(params, 'col');
  }

  function new_change_groups(params, inst_rc, inst_index) {
    if (inst_rc === 'row') {
      row_dendrogram.change_groups(params, inst_rc,inst_index);
    } else {
      col_dendrogram.change_groups(params, inst_rc,inst_index);
    }
  }

  this.change_groups = new_change_groups;

  // initialize screen resizing - necessary for resizing with new params
  initialize_resizing(params);

  // necessary to have zoom behavior updated on updating clustergram
  d3.select(params.viz.viz_svg).call(params.zoom_behavior);

  // re-initialize the double click behavior
  ini_doubleclick(params);

};
