var process_category_info = require('./process_category_info');
var calc_cat_params = require('./calc_cat_params');

module.exports = function make_cat_params(params, viz, preserve_cats=true){

  viz = process_category_info(params, viz, preserve_cats);
  viz = calc_cat_params(params, viz);

  return viz;

};