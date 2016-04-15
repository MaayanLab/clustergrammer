var get_cat_title = require('../categories/get_cat_title');

module.exports = function cat_tooltip_text(params, d, inst_selection, inst_rc){
  var inst_cat = d3.select(inst_selection).attr('cat');
  var cat_title = get_cat_title(params.viz, inst_cat, inst_rc);
  var cat_name = d[inst_cat];

  if (cat_name.indexOf(': ') >=0){
    cat_name = cat_name.split(': ')[1];
  }

  return cat_title + ': '+ cat_name;
};