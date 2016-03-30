var utils = require('../utils');

module.exports = function get_subset_views(views, requested_view){

  var found_views;
  var inst_value;
  var found_filter;

  var request_filters = _.keys(requested_view);

  // find a view that matches all of the requested view/filter-attributes 
  _.each(request_filters, function(inst_filter){

    inst_value = requested_view[inst_filter];

    // if the value is a number, then convert it to an integer 
    if ( /[^a-z_]/i.test( inst_value ) ){
      inst_value = parseInt(inst_value,10);
    } 


    // only run filtering if any of the views has the filter 
    found_filter = false;
    _.each(views, function(tmp_view){
      if ( utils.has(tmp_view, inst_filter) ){
        found_filter = true;
      }
    });


    if (found_filter){
      views = _.filter(views, function(d){
        return d[inst_filter] == inst_value;
      });
    }

  });

  // Enrichr specific rules 
  if (_.has(views[0], 'enr_score_type')){

    var inst_enr = 'combined_score';

    // filter out enr_score_type 
    views = _.filter(views, function(d){
      return d.enr_score_type == inst_enr;
    });

  }

  return views;

};