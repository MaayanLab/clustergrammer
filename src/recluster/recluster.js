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
  // console.log(clusters.tree)

  function get_limb_id(limb){
    _.each(['left', 'right'], function(side){

      if (_.has(limb, 'left')){
        _.each(['left', 'right'], function(side2){
          get_limb_id(limb[side2])
        })
      } else {
        // console.log('terminal leaf')
        // console.log(limb.value)
      }
    })
  }

  // debugger;
  var tree = clusters.tree;
  _.each(['right'], function(side){
    get_limb_id(tree)
  })

  // var branch = {};
  // for (i = 1; i <= tree.size; i++){
  //   branch.l = tree['left'];;
  //   branch.r = tree['right'];

  //   console.log(branch)
  // }

};