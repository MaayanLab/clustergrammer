module.exports = function cat_tooltip_text(params, d, inst_selection){
  var inst_cat = d3.select(inst_selection).attr('cat');
  var cat_num = parseInt(inst_cat.split('-')[1],10) + 1;
  return 'Category ' + cat_num + ': ' + d[inst_cat];  
};