module.exports = function get_cat_name(viz, inst_data, inst_rc){
  var cat_title;

  // make default title if none is given 
  if(viz.cat_names[inst_rc][inst_data] === inst_data){
    var inst_num = parseInt( inst_data.split('-')[1], 10) + 1;
    cat_title = 'Category ' + inst_num;
  } else {
    cat_title = viz.cat_names[inst_rc][inst_data];
  }

  return cat_title;

};