var clusterfck = require('cornhundred-clusterfck');

module.exports = function recluster(){

 var colors = [
   [20, 20, 80],
   [22, 22, 90],
   [250, 255, 253],
   [100, 54, 255]
  ];

  var clusters = clusterfck.hcluster(colors);

  console.log(clusters)

  // debugger;
  _.each(['left', 'right'], function(limb){
    console.log(limb)
  })

};