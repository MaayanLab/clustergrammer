var clusterfck = require('cornhundred-clusterfck');
var core = require('mathjs/core');
var math = core.create();

math.import(require('mathjs/lib/function/matrix/transpose'))
math.import(require('mathjs/lib/type/matrix'))

module.exports = function recluster(mat, names){
  /*
  Rows are clustered. Run transpose before if necessary
  */

  var transpose = math.transpose;

  var mat = [
   [20, 20, 80],
   [22, 22, 90],
   [250, 255, 253],
   [100, 54, 255]
  ];

  // var mat = this.params.network_data.mat;

  // console.log('try transposing')
  // mat = transpose(mat);

  function euclidean_distance(v1, v2) {
      var total = 0;
      for (var i = 0; i < v1.length; i++) {
         total += Math.pow(v2[i] - v1[i], 2);
      }
      return Math.sqrt(total);
   }


function vec_dot_product(vecA, vecB) {
  var product = 0;
  for (var i = 0; i < vecA.length; i++) {
    product += vecA[i] * vecB[i];
  }
  return product;
}

function vec_magnitude(vec) {
  var sum = 0;
  for (var i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
}

function cosine_distance(vecA, vecB) {
  var cos_sim = vec_dot_product(vecA, vecB) / (vec_magnitude(vecA) * vec_magnitude(vecB));
  var cos_dist = 1 - cos_sim
  return cos_dist;
}



  var clusters = clusterfck.hcluster(mat, euclidean_distance);
  // var clusters = clusterfck.hcluster(mat, cosine_distance);

  var inst_order = 0;
  var order_array = [];
  var order_list = [];
  var inst_leaf;
  var inst_key;
  var inst_dist;

  function get_leaf_key(limb, side, inst_level, inst_dist){

    // if there are more branches then there is a distance
    if ( _.has(limb, 'dist')){

      inst_dist = limb.dist;
      inst_level = inst_level + 1;
      _.each(['left', 'right'], function(side2){
        get_leaf_key(limb[side2], side2, inst_level, inst_dist);
      })

    } else {

      inst_key = limb.key;

      // console.log('terminal leaf key:' + String(inst_key) +
      //  '\tlevel: '+ String(inst_level)+
      //  '\torder: ' + String(inst_order) +
      //  '\n==================\n\n' );

      inst_leaf = {};
      inst_leaf.level = inst_level;
      inst_leaf.order = inst_order;
      inst_leaf.key = inst_key;
      inst_leaf.dist = inst_dist;

      order_array.push(inst_leaf);
      order_list.push(inst_key)

      // increment order when terminal node is found
      inst_order = inst_order + 1

    }
  }


  // start hierarchy
  var tree = clusters.tree;
  console.log(clusters)
  var start_level = 1;
  var start_distance = tree.dist;
  _.each(['left','right'], function(side){
    get_leaf_key(tree[side], side, start_level, start_distance)
  })

  // generate ordered names
  var inst_name;
  var ordered_names = [];
  _.each(order_list, function(index){
    inst_name = names[index];
    ordered_names.push(inst_name);
  })

  var order_info = {};
  order_info.info = order_array;
  order_info.order = order_list
  order_info.ordered_names = ordered_names;

  return order_info;

};