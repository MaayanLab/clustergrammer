var get_max_distance_in_dm = require('./get_max_distance_in_dm');
var underscore = require('underscore');

module.exports = function get_order_and_groups_clusterfck_tree(clusters, names){

  // console.log('**** checking in get_order ***********************')
  // console.log(clusters.hc.dists[0][5])
  // console.log(clusters.hc.dists[0])

  // console.log('**** checking dists_backup get_order ***********************')
  // console.log(clusters.hc.dists_backup[0][5])
  // console.log(clusters.hc.dists_backup[0])

  var max_distance_in_dm = get_max_distance_in_dm(clusters.hc.dists_backup);

  // get order information from clusterfck tree
  ///////////////////////////////////////////////
  var inst_order = 0;
  var group = [];
  var order_array = [];
  var order_list = [];
  var inst_leaf;
  var inst_key;

  // start hierarchy
  var tree = clusters.tree;
  var ini_level = 1;
  var tree_height = tree.dist;

  // var cutoff_fractions = [];
  var cutoff_vals = [];
  var cutoff_indexes = [];
  var threshold_status = [];
  for (var i = 0; i <= 10; i++) {
    cutoff_vals.push(max_distance_in_dm * i/10);
    // cutoff_vals.push(manual_cutoff);
    threshold_status.push('above');
    group.push(0);
    cutoff_indexes.push(i);
  }

  underscore.each(['left','right'], function(side){

    get_leaves(tree[side], side, ini_level, tree_height, threshold_status);

  });

  function get_leaves(limb, side, inst_level, inst_dist, threshold_status){

    // lock if distance is under resolvable distance
    underscore.each(cutoff_indexes, function(index){
      if (inst_dist <= cutoff_vals[index]){

        // increment group if going from above to below threshold
        if (threshold_status[index] === 'above'){
          group[index] = group[index] + 1;
        }

        // locks[index] = true;
        threshold_status[index] = 'below';

      } else {

        threshold_status[index] = 'above';
      }

    });

    // if there are more branches then there is a distance
    if ( underscore.has(limb, 'dist')){

      inst_dist = limb.dist;
      inst_level = inst_level + 1;

      underscore.each(['left', 'right'], function(side2){
        get_leaves(limb[side2], side2, inst_level, inst_dist,  threshold_status);
      });

    } else {

      inst_key = limb.key;

      // increment group if leaf is above threshold
      underscore.each(cutoff_indexes, function(index){

        if (threshold_status[index] === 'above'){
          group[index] = group[index] + 1;
        }

      });

      inst_leaf = {};
      inst_leaf.level = inst_level;
      inst_leaf.order = inst_order;

      // need to make copy of group not reference
      // inst_leaf.group = group;
      inst_leaf.group = $.extend(true, [], group);

      inst_leaf.key = inst_key;
      inst_leaf.dist = inst_dist;

      inst_leaf.name = names[inst_key];

      order_array.push(inst_leaf);
      order_list.push(inst_key);

      // increment order when terminal node is found
      inst_order = inst_order + 1;

    }
  }

  // sort on key value
  order_array.sort(function(a,b){
    return a.key - b.key;
  });

  // generate ordered names
  var inst_name;
  var ordered_names = [];
  underscore.each(order_list, function(index){
    inst_name = names[index];
    ordered_names.push(inst_name);
  });

  var order_info = {};
  order_info.info = order_array;
  order_info.order = order_list;
  order_info.ordered_names = ordered_names;

  return order_info;

};