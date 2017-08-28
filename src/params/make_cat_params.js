var calc_cat_params = require('./calc_cat_params');
var utils = require('../Utils_clust');
var colors = require('../Colors');
var check_if_value_cats = require('./check_if_value_cats');
var underscore = require('underscore');

module.exports = function make_cat_params(params, viz, predefined_cat_colors=true){

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

  viz.cat_colors = {};
  viz.cat_colors.value_opacity = ini_val_opacity;

  var num_colors = 0;
  underscore.each(['row','col'], function(inst_rc){

    viz.show_categories[inst_rc] = false;

    viz.all_cats[inst_rc] = [];
    var tmp_keys = underscore.keys(params.network_data[inst_rc+'_nodes'][0]);

    tmp_keys = tmp_keys.sort();

    underscore.each( tmp_keys, function(d){
      if (d.indexOf('cat-') >= 0){
        viz.show_categories[inst_rc] = true;
        viz.all_cats[inst_rc].push(d);
      }
    });

    viz.cat_info[inst_rc] = null;

    if (viz.show_categories[inst_rc]){

      viz.cat_colors[inst_rc] = {};
      viz.cat_info[inst_rc] = {};
      viz.cat_names[inst_rc] = {};

      underscore.each( viz.all_cats[inst_rc], function(cat_title){

        var inst_node = params.network_data[inst_rc+'_nodes'][0];

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

        var cat_instances_titles = utils.pluck(params.network_data[inst_rc+'_nodes'], cat_title);
        var cat_instances = [];

        underscore.each(cat_instances_titles, function(inst_cat){

          var new_cat;
          if (inst_cat.indexOf(': ') >0){
            new_cat = inst_cat.split(': ')[1];
          } else {
            new_cat = inst_cat;
          }

          cat_instances.push(new_cat);
        });

        var cat_states = underscore.uniq( cat_instances_titles ).sort();

        // check whether all the categories are of value type
        inst_info = check_if_value_cats(cat_states);

        // add histogram to inst_info
        if (inst_info.type === 'cat_strings'){
          // remove titles from categories in hist
          var cat_hist = underscore.countBy(cat_instances);
          inst_info.cat_hist = cat_hist;
        } else {
          inst_info.cat_hist = null;
        }

        // pass info_info object
        viz.cat_info[inst_rc][cat_title] = inst_info;

        viz.cat_colors[inst_rc][cat_title] = {};

        underscore.each(cat_states, function(cat_tmp, inst_index){

          inst_color = colors.get_random_color(inst_index + num_colors);

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

      });

    }

    if (_.has(params.network_data, 'cat_colors') && predefined_cat_colors === true){
      viz.cat_colors[inst_rc] = params.network_data.cat_colors[inst_rc];
    }

    if (params.sim_mat){
      // sending row color info to columns since row color info can be updated
      viz.cat_colors.col = viz.cat_colors.row;
    }

  });

  viz.cat_colors = viz.cat_colors;

  viz.cat_colors.opacity = 0.6;
  viz.cat_colors.active_opacity = 0.9;

  viz = calc_cat_params(params, viz);

  return viz;

};