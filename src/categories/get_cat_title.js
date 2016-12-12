module.exports = function get_cat_title(viz, inst_cat, inst_rc){
  var cat_title;

  // make default title if none is given
  if(viz.cat_names[inst_rc][inst_cat] === inst_cat){
    var inst_num = parseInt( inst_cat.split('-')[1], 10) + 1;
    // generate placeholder title
    cat_title = 'Category ' + inst_num;
  } else {
    // make real title
    cat_title = viz.cat_names[inst_rc][inst_cat];
  }

  return cat_title;

};