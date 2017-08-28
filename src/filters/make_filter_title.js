var get_filter_default_state = require('./get_filter_default_state');
var underscore = require('underscore');

module.exports = function make_filter_title(params, filter_type){

  var filter_title = {};
  var title = {};
  var type = {};

  filter_title.state = get_filter_default_state(params.viz.filter_data, filter_type);

  type.top     = filter_type.split('_')[0];
  type.node    = filter_type.split('_')[1];
  type.measure = filter_type.split('_')[2];

  if (type.node === 'row'){
    title.node = 'rows';
  } else {
    title.node = 'columns';
  }

  if (type.top === 'N'){
    // filter_title.suffix = ' '+title.node;
    filter_title.suffix = '';
  }

  if (type.top === 'pct'){
    filter_title.suffix = '%';
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

  // Enrichr specific rules
  if ( underscore.keys(params.viz.possible_filters).indexOf('enr_score_type') > -1 ){
    if (type.node === 'col'){
      filter_title.text = 'Top Enriched Terms: ';
      filter_title.suffix = '';
    }
  }

  return filter_title;
};