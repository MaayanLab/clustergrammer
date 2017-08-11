
// Load the math.js core
// Create a new, empty math.js instance
// It will only contain methods `import` and `config`
// math.import(require('mathjs/lib/type/fraction'));
var p_dict = require('./binom_prop_pval_lookup');
var core = require('mathjs/core');
var math = core.create();

math.import(require('mathjs/lib/function/probability/factorial'));


module.exports = function binom_test(actual_k, n, p){

  console.log(_.keys(p_dict))

  var fact = math.factorial;

  function binom_dist(k, n, p){
    var bin_coeff = (fact(n))/( fact(k) * fact(n-k) );
    p = bin_coeff * (Math.pow(p, k) * Math.pow((1 - p), (n-k)) );
    return p;
  }

  function my_binom_test_2(actual_k, n, p){
    var cp = 0;
    var k;
    for (var inst_k=actual_k; inst_k < n+1; inst_k++ ){
      k = inst_k;
      dp = binom_dist(k, n, p);
      cp = cp + dp;
    }

    return cp;

  }

  // calculate pval
  pval = my_binom_test_2(actual_k, n, p);
  if ( isNaN(pval) ){
    pval = 'need to use approx';
  }

  return pval;

};