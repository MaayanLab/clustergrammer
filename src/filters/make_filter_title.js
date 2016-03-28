module.exports = function make_filter_title(filter_type){

  var filter_title = {};
  var title = {};
  var type = {};

  type.top     = filter_type.split('_')[0];
  type.node    = filter_type.split('_')[1];
  type.measure = filter_type.split('_')[2];

  if (type.node === 'row'){
    title.node = 'rows';
  } else {
    title.node = 'columns';
  }

  if (type.top === 'N'){
    filter_title.suffix = ' '+title.node;
    filter_title.value = 'all';
  }

  if (type.measure == 'sum'){
    title.measure = 'sum';
  } else if (type.measure == 'var'){
    title.measure = 'variance';
  }

  if (type.measure === 'sum'){
    filter_title.text = 'Top '+ title.node + ' ' + title.measure+': ';
  }

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