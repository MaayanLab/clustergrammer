var clusterfck = require('cornhundred-clusterfck');
var core = require('mathjs/core');
var math = core.create();
var dist_fun = require('./distance_functions');
var get_order_and_groups_clusterfck_tree = require('./get_order_and_groups_clusterfck_tree');

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


  var order_info = get_order_and_groups_clusterfck_tree(clusters, names);

  return order_info;

};