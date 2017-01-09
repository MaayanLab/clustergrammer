var utils = require('../Utils_clust');
var colors = require('../Colors');
var check_if_value_cats = require('./check_if_value_cats');

module.exports = function process_category_info(params, viz, preserve_cats=true){

  var super_string = ': ';
  var tmp_super;
  var inst_info;
  var inst_color;

  viz.show_categories = {};
  viz.all_cats = {};
  viz.cat_names = {};
  viz.cat_info = {};

  // this will hold the information for calculating the opacity of the value
  // function
  var ini_val_opacity = {};
  ini_val_opacity.row = null;
  ini_val_opacity.col = null;

  var predefine_colors = false;
  if (viz.cat_colors === null){
    viz.cat_colors = {};
    viz.cat_colors.value_opacity = ini_val_opacity;
    predefine_colors = false;
  } else {
    predefine_colors = true;
  }

  if (preserve_cats === false){
    predefine_colors = false;
  }

  var num_colors = 0;
  _.each(['row','col'], function(inst_rc){

    viz.show_categories[inst_rc] = false;

    viz.all_cats[inst_rc] = [];
    var tmp_keys = _.keys(params.network_data[inst_rc+'_nodes'][0]);

    _.each( tmp_keys, function(d){

      if (d.indexOf('cat-') >= 0){
        viz.show_categories[inst_rc] = true;
        viz.all_cats[inst_rc].push(d);
      }

    });

    viz.cat_info[inst_rc] = null;

    if (viz.show_categories[inst_rc]){

      if (predefine_colors === false){
        viz.cat_colors[inst_rc] = {};
      }

      viz.cat_info[inst_rc] = {};
      viz.cat_names[inst_rc] = {};

      _.each( viz.all_cats[inst_rc], function(cat_title){

        _.each(params.network_data[inst_rc+'_nodes'], function(inst_node){

          // look for title of category in category name
          if (typeof inst_node[cat_title] === 'string' ){

            if (inst_node[cat_title].indexOf(super_string) > 0){
              tmp_super = inst_node[cat_title].split(super_string)[0];
              viz.cat_names[inst_rc][cat_title] = tmp_super;
            } else {
              viz.cat_names[inst_rc][cat_title] = cat_title;
            }

          } else {
            viz.cat_names[inst_rc][cat_title] = cat_title;
          }

        });

        var cat_instances = utils.pluck(params.network_data[inst_rc+'_nodes'], cat_title);
        var cat_states = _.uniq( cat_instances ).sort();

        // check whether all the categories are of value type
        inst_info = check_if_value_cats(cat_states);

        // add histogram to inst_info
        if (inst_info.type === 'cat_strings'){
          var cat_hist = _.countBy(cat_instances);
          inst_info.cat_hist = cat_hist;
        } else {
          inst_info.cat_hist = null;
        }

        // pass info_info object
        viz.cat_info[inst_rc][cat_title] = inst_info;

        if (predefine_colors === false){

          viz.cat_colors[inst_rc][cat_title] = {};

          _.each(cat_states, function(cat_tmp, i){

            inst_color = colors.get_random_color(i+num_colors);

            viz.cat_colors[inst_rc][cat_title][cat_tmp] = inst_color;

            // hack to get 'Not' categories to not be dark colored
            // also doing this for false
            if (typeof cat_tmp === 'string'){
              if (cat_tmp.indexOf('Not ') >= 0 || cat_tmp.indexOf(': false') > 0){
                viz.cat_colors[inst_rc][cat_title][cat_tmp] = '#eee';
              }
            }

            num_colors = num_colors + 1;
          });

        }

      });

    }

    if (params.sim_mat){
      // sending row color info to columns since row color info can be updated
      // using the update_cats endpoint
      viz.cat_colors.col = viz.cat_colors.row;
    }

  });

  viz.cat_colors = viz.cat_colors;

  viz.cat_colors.opacity = 0.6;
  viz.cat_colors.active_opacity = 0.9;

  return viz;
};