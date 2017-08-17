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


  // mat = [
  //  [20, 20, 80],
  //  [22, 22, 90],
  //  [250, 255, 253],
  //  [100, 54, 255]
  // ];

  // var mat = this.params.network_data.mat;
  // mat = transpose(mat);

  // var clusters = clusterfck.hcluster(mat, dist_fun.euclidean);
  var clusters = clusterfck.hcluster(mat, dist_fun['cosine']);

  dm = clusters.hc.dists

  console.log('------- max -------')
  max_val = 0;
  _.each(dm, function(row){
    // console.log(row)
    new_row = []
    _.each(row, function(inst_val){
      if (isFinite(inst_val)){
        if (inst_val > max_val){
          max_val = inst_val;
        }
      }
    })

  })

  console.log('max_val', max_val)


  var inst_order = 0;
  var group = [];
  var order_array = [];
  var order_list = [];
  var inst_leaf;
  var inst_key;

  // start hierarchy
  var tree = clusters.tree;
  var ini_level = 1;
  var ini_distance = tree.dist;



  console.log('tree height', ini_distance);

  // var cutoff_fractions = [];
  var cutoff_vals = [];
  var ini_locks = [];
  var cutoff_indexes = [];
  for (var i = 0; i <= 10; i++) {
    cutoff_vals.push(ini_distance * i/10);
    ini_locks.push(false);
    group.push(1);
    cutoff_indexes.push(i);
  }


  // console.log('cutoff values\n-----------------');
  // console.log(cutoff_vals);

  _.each(['left','right'], function(side){

    get_leaves(tree[side], side, ini_level, ini_distance, ini_locks);

  });

  function get_leaves(limb, side, inst_level, inst_dist, locks){

    // set lock state
    // lock if distance is under resolvable distance

    _.each(cutoff_indexes, function(index){
      if (inst_dist <= cutoff_vals[index]){
        locks[index] = true;
      } else {
        locks[index] = false;
      }
    });

    // if there are more branches then there is a distance
    if ( _.has(limb, 'dist')){

      inst_dist = limb.dist;
      inst_level = inst_level + 1;

      _.each(['left', 'right'], function(side2){
        get_leaves(limb[side2], side2, inst_level, inst_dist,  locks);
      });

    } else {

      inst_key = limb.key;

      _.each(cutoff_indexes, function(index){

        // increment group when group is not locked
        if (locks[index] === false){
          group[index] = group[index] + 1;
        }
        // correct for incrementing too early
        // if first node distance is above cutoff (resolvable) do not increment
        if (group[index] > inst_order + 1){
          group[index] = 1;
        }

      });

      inst_leaf = {};
      inst_leaf.level = inst_level;
      inst_leaf.order = inst_order;

      // need to make copy of group not reference
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