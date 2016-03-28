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

  if (type.top === 'pct'){
    filter_title.suffix = '%';
    filter_title.value = '100';
  }

  if (type.measure == 'sum'){
    title.measure = 'sum';
  } else if (type.measure == 'var'){
    title.measure = 'variance';
  }

  if (type.measure === 'sum'){
    filter_title.text = 'Top '+ title.node + ' ' + title.measure+': ';
  } 

  if (type.measure === 'var'){
    filter_title.text = 'Top '+ title.node + ' ' + title.measure+': ';
  }

  return filter_title;
};