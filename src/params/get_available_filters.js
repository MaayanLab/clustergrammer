var underscore = require('underscore');

module.exports = function get_available_filters(views){

  var possible_filters = {};
  var filter_data = {};

  underscore.each(views, function(inst_view){
    var inst_keys = underscore.keys(inst_view);

    underscore.each(inst_keys, function(inst_key){

      if (inst_key != 'nodes'){

        if (!_.has(filter_data, inst_key)){
          filter_data[inst_key] = [];
        }

        filter_data[inst_key].push(inst_view[inst_key]);

        filter_data[inst_key] = underscore.uniq( filter_data[inst_key] );

      }

    });

  });

  var tmp_filters = underscore.keys(filter_data);

  underscore.each( tmp_filters, function(inst_filter){

    var options = filter_data[inst_filter];
    var num_options = options.length;

    var filter_type = 'categorical';
    underscore.each(options, function(inst_option){
      if (typeof inst_option === 'number'){
        filter_type = 'numerical';
      }
    });

    if (num_options > 1){
      possible_filters[inst_filter] = filter_type;
    }

  });

  var filters = {};
  filters.possible_filters = possible_filters;
  filters.filter_data = filter_data;

  return filters;

};