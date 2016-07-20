var utils = require('../Utils_clust');
var colors = require('../colors');

module.exports = function process_category_info(config){

  var super_string = ': ';
  var tmp_super;

  config.show_categories = {};
  config.all_cats = {};
  config.cat_names = {};

  var predefine_colors = false;
  if (config.cat_colors === null){
    config.cat_colors = {};
    predefine_colors = false;
  } else {
    predefine_colors = true;
  }

  var num_colors = 0;
  _.each(['row','col'], function(inst_rc){

    config.show_categories[inst_rc] = false;

    config.all_cats[inst_rc] = [];
    var tmp_keys = _.keys(config.network_data[inst_rc+'_nodes'][0]);

    _.each( tmp_keys, function(d){
      if (d.indexOf('cat-') >= 0){
        config.show_categories[inst_rc] = true;
        config.all_cats[inst_rc].push(d);
      }
    });


    if (config.show_categories[inst_rc]){

      if (predefine_colors === false){
        config.cat_colors[inst_rc] = {};
      }
      config.cat_names[inst_rc] = {};

      _.each( config.all_cats[inst_rc], function(inst_cat){


        _.each(config.network_data[inst_rc+'_nodes'], function(inst_node){

          if (inst_node[inst_cat].indexOf(super_string) > 0){
            tmp_super = inst_node[inst_cat].split(super_string)[0];
            config.cat_names[inst_rc][inst_cat] = tmp_super;
          } else {
            config.cat_names[inst_rc][inst_cat] = inst_cat;
          }

        });

        var names_of_cat = _.uniq(
            utils.pluck(config.network_data[inst_rc+'_nodes'], inst_cat)
          ).sort();

        if (predefine_colors === false){

          config.cat_colors[inst_rc][inst_cat] = {};

          _.each(names_of_cat, function(cat_tmp, i){

            var inst_color = colors.get_random_color(i+num_colors);

            config.cat_colors[inst_rc][inst_cat][cat_tmp] = inst_color;

            // hack to get 'Not' categories to not be dark colored
            // also doing this for false
            if (cat_tmp.indexOf('Not ') >= 0 || cat_tmp.indexOf(': false') > 0){
              config.cat_colors[inst_rc][inst_cat][cat_tmp] = '#eee';
            }

            num_colors = num_colors + 1;
          });

        }

      });

    }

    if (config.sim_mat){
      config.cat_colors.row = config.cat_colors.col;
    }

  });

  return config;
};