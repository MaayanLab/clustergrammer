
module.exports = function(params, inst_cat) {
  // change the category
  params.current_col_cat = inst_cat;
  console.log('changed category to ' + String(inst_cat));
};
