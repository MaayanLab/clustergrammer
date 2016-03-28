module.exports = function make_filter_title(filter_type){

  var filter_title = {};

  if (filter_type === 'pct_row_sum'){
    filter_title.text = 'Top rows sum: ';
    filter_title.value = '100';
    filter_title.suffix = '%';
  } else if (filter_type === 'pct_row_var'){
    filter_title.text = 'Top rows variance: ';
    filter_title.value = '100';
    filter_title.suffix = '%';    
  } else if (filter_type === 'N_row_sum'){
    filter_title.text = 'Top rows sum: ';
    filter_title.value = 'all';
    filter_title.suffix = ' rows';
  } else if (filter_type === 'N_row_var'){
    filter_title.text = 'Top rows variance: ';
    filter_title.value = 'all';
    filter_title.suffix = ' rows';
  }  

  return filter_title;
};