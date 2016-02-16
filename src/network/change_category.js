var Params = require('../params');

module.exports = function(inst_cat) {
  var params = Params.get();
  // change the category
  params.current_col_cat = inst_cat;
  console.log('changed category to ' + String(inst_cat));
};
