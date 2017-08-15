var clusterfck = require('cornhundred-clusterfck');

module.exports = function recluster(){

 var colors = [
   [20, 20, 80],
   [22, 22, 90],
   [250, 255, 253],
   [100, 54, 255]
  ];

  var clusters = clusterfck.hcluster(colors);
  var inst_order = 0;
  var order_array = [];
  var inst_leaf;

  function get_limb_key(limb, side, inst_level){

    // if there are more branches then there is a distance
    if ( _.has(limb, 'dist')){

      inst_level = inst_level + 1;
      _.each(['left', 'right'], function(side2){
        get_limb_key(limb[side2], side2, inst_level);
      })

    } else {


      console.log('terminal leaf key:' + String(limb.key) +
       '\tlevel: '+ String(inst_level)+
       '\torder: ' + String(inst_order) +
       '\n==================\n\n' );

      inst_leaf = {};
      inst_leaf.level = inst_level;
      inst_leaf.order = inst_order;
      inst_leaf.key = limb.key;

      order_array.push(inst_leaf);

      // increment order when terminal node is found
      inst_order = inst_order + 1

    }
  }



  // start hierarchy
  var tree = clusters.tree;
  var start_level = 1;
  _.each(['left','right'], function(side){
    get_limb_key(tree[side], side, start_level)
  })

  console.log(order_array)

};