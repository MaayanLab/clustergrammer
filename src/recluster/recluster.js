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

  function get_limb_key(limb, side){

    console.log('get-index', side);

    // if there are more branches then there is a distance
    if ( _.has(limb, 'dist')){
      console.log('-- branch --')
      console.log('distance', limb.dist)
      _.each(['left', 'right'], function(side2){
        console.log('side2',side2)
        get_limb_key(limb[side2], side2);
      })
    } else {
      console.log('terminal leaf', limb.index);
    }
  }


  var tree = clusters.tree;
  _.each(['left','right'], function(side){
    console.log(side)
    get_limb_key(tree[side], side)
  })

  // var branch = {};
  // for (i = 1; i <= tree.size; i++){
  //   branch.l = tree['left'];;
  //   branch.r = tree['right'];

  //   console.log(branch)
  // }

};