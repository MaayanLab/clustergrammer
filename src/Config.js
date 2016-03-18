var utils = require('./utils');
var colors = require('./colors');
var transpose_network = require('./network/transpose_network');

module.exports = function(args) {
  var defaults = {
    // Label options
    row_label_scale: 1,
    col_label_scale: 1,
    super_labels: false,
    show_label_tooltips: false,
    show_tile_tooltips: false,
    // matrix options
    transpose: false,
    tile_colors: ['#FF0000', '#1C86EE'],
    bar_colors: ['#FF0000', '#1C86EE'],
    outline_colors: ['orange','black'],
    highlight_color: '#FFFF00',
    tile_title: false,
    // Default domain is set to 0: the domain will be set automatically
    input_domain: 0,
    opacity_scale: 'linear',
    do_zoom: true,
    background_color: '#FFFFFF',
    super_border_color: '#F5F5F5',
    resize: true,
    outer_margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    },
    outer_margins_expand:{
      top: -666,
      bottom: 0,
      left: 0,
      right: 0
    },
    ini_expand: false,
    grey_border_width: 2,
    uni_margin: 4,
    force_square: 0,
    tile_click_hlight: false,
    super_label_scale: 1,
    make_tile_tooltip: function(d) { return d.info; },
    // initialize view, e.g. initialize with row filtering
    ini_view: null,
    use_sidebar: true
  };
  // Mixin defaults with user-defined arguments.
  var config = utils.extend(defaults, args);

  if (config.outer_margins_expand.top === -666){
    config.expand_button = false;
  } else {
    config.expand_button = true;
  }

  // save network_data to config
  // extend does not properly pass network_data
  config.network_data = args.network_data;

  // replace undersores with space in row/col names
  config.network_data.row_nodes.forEach(function(d){
    d.name = d.name.replace(/_/g, ' ');
  });
  config.network_data.col_nodes.forEach(function(d){
    d.name = d.name.replace(/_/g, ' ');
  });

  // process view row/col names 
  if (_.has(config.network_data,'views')){
    config.network_data.views.forEach(function(inst_view){

      var inst_nodes = inst_view.nodes;

      // fix rows in views
      inst_nodes.row_nodes.forEach(function(d){
        d.name = d.name.replace(/_/g, ' ');
      });

      // fix cols in views
      inst_nodes.col_nodes.forEach(function(d){
        d.name = d.name.replace(/_/g, ' ');
      });

    });
  }

  var col_nodes = config.network_data.col_nodes;
  var row_nodes = config.network_data.row_nodes;

  // add names and instantaneous positions to links
  config.network_data.links.forEach(function(d){
    d.name = row_nodes[d.source].name + '_' + col_nodes[d.target].name;
    d.row_name = row_nodes[d.source].name;
    d.col_name = col_nodes[d.target].name;
  });


  // transpose network if necessary
  if (config.transpose) {
    config.network_data = transpose_network(args.network_data);
    var tmp_col_label = args.col_label;
    var tmp_row_label = args.row_label;
    args.row_label = tmp_col_label;
    args.col_label = tmp_row_label;
  }

  // super-row/col labels
  if (!utils.is_undefined(args.row_label) && !utils.is_undefined(args.col_label)) {
    config.super_labels = true;
    config.super = {};
    config.super.row = args.row_label;
    config.super.col = args.col_label;
  }

  // initialize cluster ordering - both rows and columns
  config.inst_order = {};
  if (!utils.is_undefined(args.order) && utils.is_supported_order(args.order)) {
    config.inst_order.row = args.order;
    config.inst_order.col = args.order;
  } else {
    config.inst_order.row = 'clust';
    config.inst_order.col = 'clust';
  }

  // set row or column order directly -- note that row/col are swapped
  // !! need to swap row/col orderings
  if (!utils.is_undefined(args.row_order) && utils.is_supported_order(args.row_order)) {
    // !! row and col orderings are swapped, need to fix
    config.inst_order.col = args.row_order;
  }

  if (!utils.is_undefined(args.col_order) && utils.is_supported_order(args.col_order)) {
    // !! row and col orderings are swapped, need to fix
    config.inst_order.row = args.col_order;
  }

  var row_has_group = utils.has(args.network_data.row_nodes[0], 'group');
  var col_has_group = utils.has(args.network_data.col_nodes[0], 'group');
  config.show_dendrogram = row_has_group || col_has_group;

  config.show_categories = {};
  config.all_cats = {};
  config.cat_colors = {};

  var num_colors = 0;
  _.each(['row','col'], function(inst_rc){

    config.show_categories[inst_rc] = false;

    config.all_cats[inst_rc] = [];
    var tmp_keys = _.keys(args.network_data[inst_rc+'_nodes'][0]);

    _.each( tmp_keys, function(d){
      if (d.indexOf('cat-') >= 0){
        config.show_categories[inst_rc] = true;
        config.all_cats[inst_rc].push(d);
      }
    });

    if (config.show_categories[inst_rc]){

      config.cat_colors[inst_rc] = {};

      _.each( config.all_cats[inst_rc], function(inst_cat){

        var names_of_cat = _.uniq(_.pluck(args.network_data[inst_rc+'_nodes'], inst_cat));

        config.cat_colors[inst_rc][inst_cat] = {};

        _.each(names_of_cat, function(c_tmp, i){
          config.cat_colors[inst_rc][inst_cat][c_tmp] = colors.get_random_color(i+2+num_colors);
          num_colors = num_colors + 1;
        });

      } );

    }

  });

  // check for category information
  if (config.show_categories.col) {
    // generate a dictionary of columns in each category
    config.cat_dict = {};
    col_nodes.forEach(function(d){

      // initialize array for each category
      if (!utils.has(config.cat_dict, d.cat)){
        config.cat_dict[d.cat] = [];
      }
      // add column name to category array
      config.cat_dict[d.cat].push(d.name);
    });

  }

  return config;
};
