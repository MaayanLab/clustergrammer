var fisher = require('fishertest');

module.exports = function run_fisher_exact_clust(k, n, big_k, big_n){

  // Fisher Exact Test
  ///////////////////////////
  // k: number of cat-nodes drawn in cluster
  // n: number drawn in cluster
  // big_k: total number of cat-nodes
  // big_l: total number of nodes

  // contingency table
  /////////////////////
  var a = k;
  var b = big_k - k;
  var c = n - k;
  var d = big_n + k - n - big_k;

  console.log(a)
  console.log(b)
  console.log(c)
  console.log(d)

  var ft = fisher(a, b, c, d);

  // debugger
  console.log('in fuction')
  console.log(ft.toPrecision())
  console.log(ft.toString())
  return ft.toPrecision();


};