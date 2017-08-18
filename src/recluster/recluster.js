var clusterfck = require('cornhundred-clusterfck');
var core = require('mathjs/core');
var math = core.create();
var dist_fun = require('./distance_functions');

math.import(require('mathjs/lib/function/matrix/transpose'));
math.import(require('mathjs/lib/type/matrix'));

module.exports = function recluster(mat, names){
  /*
  Rows are clustered. Run transpose before if necessary
  */

  // var transpose = math.transpose;

  // var mat = this.params.network_data.mat;
  // mat = transpose(mat);

  // var dist_type = 'cosine';
  var dist_type = 'euclidean';
  var clusters = clusterfck.hcluster(mat, dist_fun[dist_type]);

  var dm = clusters.hc.dists;

  var max_distance_in_dm = 0;
  _.each(dm, function(row){
    _.each(row, function(inst_val){
      if (isFinite(inst_val)){
        if (inst_val > max_distance_in_dm){
          max_distance_in_dm = inst_val;
        }
      }
    });

  });

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

  _.each(['left','right'], function(side){

    get_leaves(tree[side], side, ini_level, tree_height, threshold_status);

  });

  function get_leaves(limb, side, inst_level, inst_dist, threshold_status){

    // lock if distance is under resolvable distance
    _.each(cutoff_indexes, function(index){
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
    if ( _.has(limb, 'dist')){

      inst_dist = limb.dist;
      inst_level = inst_level + 1;

      _.each(['left', 'right'], function(side2){
        get_leaves(limb[side2], side2, inst_level, inst_dist,  threshold_status);
      });

    } else {

      inst_key = limb.key;

      // increment group if leaf is above threshold
      _.each(cutoff_indexes, function(index){

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
  _.each(order_list, function(index){
    inst_name = names[index];
    ordered_names.push(inst_name);
  });

  var order_info = {};
  order_info.info = order_array;
  order_info.order = order_list;
  order_info.ordered_names = ordered_names;

  return order_info;

};