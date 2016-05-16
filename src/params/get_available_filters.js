module.exports = function get_available_filters(views){

  var possible_filters = {};
  var filter_data = {};

  _.each(views, function(inst_view){
    var inst_keys = _.keys(inst_view);

    _.each(inst_keys, function(inst_key){

      if (inst_key != 'nodes'){

        if (!_.has(filter_data, inst_key)){
          filter_data[inst_key] = [];
        }

        filter_data[inst_key].push(inst_view[inst_key]);

        filter_data[inst_key] = _.uniq( filter_data[inst_key] );

      }

    });

  });

  var tmp_filters = _.keys(filter_data);
  
  _.each( tmp_filters, function(inst_filter){
     
    var options = filter_data[inst_filter];
    var num_options = options.length; 

    var filter_type = 'categorical';
    _.each(options, function(inst_option){
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