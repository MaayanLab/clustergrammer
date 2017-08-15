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

  function get_limb_key(limb, side, level){

    console.log('inst_side: ' + String(side))
    console.log('inst_level : ' + String(inst_level) + '\n\n')

    // if there are more branches then there is a distance
    if ( _.has(limb, 'dist')){
      console.log('-- branch --')
      console.log('distance', limb.dist)
      _.each(['left', 'right'], function(side2){
        console.log('side2',side2)
        inst_level = inst_level + 1;
        get_limb_key(limb[side2], side2, inst_level);
      })
    } else {
      console.log('terminal leaf key:' + String(limb.key) + '\n==================\n\n' );
    }
  }


  var tree = clusters.tree;
  console.log('--main branch--')
  console.log(tree.dist)
  var inst_level = 0;
  _.each(['left','right'], function(side){
    console.log('\n\nFirst Branch: ' + String(side) + '--------------\n\n')
    get_limb_key(tree[side], side, inst_level)
  })

  // var branch = {};
  // for (i = 1; i <= tree.size; i++){
  //   branch.l = tree['left'];;
  //   branch.r = tree['right'];

  //   console.log(branch)
  // }

};