// var math = require('mathjs')

// Load the math.js core
var core = require('mathjs/core');
// Create a new, empty math.js instance
// It will only contain methods `import` and `config`
var math = core.create();
// math.import(require('mathjs/lib/type/fraction'));
math.import(require('mathjs/lib/type/bignumber'));
math.import(require('mathjs/lib/function/probability/factorial'));
math.config({
  number: 'BigNumber', // Default type of number:
                       // 'number' (default), 'BigNumber', or 'Fraction'
  precision: 200        // Number of significant digits for BigNumbers
});

module.exports = function binom_test(){

  console.log('running binom_test!!!!!');

  var fact = math.factorial;

  function binom_dist(k, n, p){
    var bin_coeff = (fact(n))/( fact(k) * fact(n-k) );
    p = bin_coeff * (Math.pow(p, k) * Math.pow((1 - p), (n-k)) );
    return p;
  }

  console.log(binom_dist(1, 2, 0.5));

};