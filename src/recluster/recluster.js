var clusterfck = require('cornhundred-clusterfck');

module.exports = function recluster(){

 var colors = [
   [20, 20, 80],
   [22, 22, 90],
   [250, 255, 253],
   [100, 54, 255]
  ];

  var clusters = clusterfck.hcluster(colors);

  console.log('************')
  console.log(clusters.tree)

  function get_limb_index(limb, side){

    console.log('get-index', side);

    // check if more branches
    if ( _.has(limb, 'left')){
      _.each(['left', 'right'], function(side2){
        get_limb_index(limb[side2], side2);
      })
    } else {
      console.log('terminal leaf', limb.index);
    }
  }


  var tree = clusters.tree;
  _.each(['left','right'], function(side){
    console.log(side)
    get_limb_index(tree[side], side)
  })

  // var branch = {};
  // for (i = 1; i <= tree.size; i++){
  //   branch.l = tree['left'];;
  //   branch.r = tree['right'];

  //   console.log(branch)
  // }

};