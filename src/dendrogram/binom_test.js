
// Load the math.js core
// Create a new, empty math.js instance
// It will only contain methods `import` and `config`
// math.import(require('mathjs/lib/type/fraction'));
var core = require('mathjs/core');
var math = core.create();
math.import(require('mathjs/lib/type/bignumber'));
math.import(require('mathjs/lib/function/probability/factorial'));
math.config({
  number: 'BigNumber', // Default type of number:
                       // 'number' (default), 'BigNumber', or 'Fraction'
  precision: 64        // Number of significant digits for BigNumbers
});

module.exports = function binom_test(actual_k, n, p){

  console.log('running binom_test!!!!!');

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

  // var n = 150;
  // var p = 0.5;
  // var actual_k = 10;
  cp = my_binom_test_2(actual_k, n, p)
  console.log(cp)

  // console.log(binom_dist(1, 2, 0.5));

};