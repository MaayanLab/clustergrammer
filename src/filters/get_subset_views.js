var utils = require('../Utils_clust');
var get_filter_default_state = require('./get_filter_default_state');
var underscore = require('underscore');

module.exports = function get_subset_views(params, views, requested_view){

  var inst_value;
  var found_filter;

  var request_filters = underscore.keys(requested_view);

  // find a view that matches all of the requested view/filter-attributes
  underscore.each(request_filters, function(inst_filter){

    inst_value = requested_view[inst_filter];

    // if the value is a number, then convert it to an integer
    if ( /[^a-z_]/i.test( inst_value ) ){
      inst_value = parseInt(inst_value,10);
    }

    // only run filtering if any of the views has the filter
    found_filter = false;
    underscore.each(views, function(tmp_view){
      if ( utils.has(tmp_view, inst_filter) ){
        found_filter = true;
      }
    });

    if (found_filter){
      views = underscore.filter(views, function(d){
        return d[inst_filter] == inst_value;
      });
    }

  });


  // remove duplicate complete default states
  var export_views = [];
  var found_default = false;
  var check_default;
  var inst_default_state;

  // check if each view is a default state: all filters are at default
  // there can only be one of these
  underscore.each(views, function(inst_view){

    check_default = true;

    // check each filter in a view to see if it is in the default state
    underscore.each( underscore.keys(params.viz.possible_filters), function(inst_filter){

      inst_default_state = get_filter_default_state( params.viz.filter_data, inst_filter );

      if (inst_view[inst_filter] != inst_default_state){
        check_default = false;
      }

    });

    // found defaule view, only append if you have not already found a default
    if (check_default){
      if (found_default === false){
        found_default = true;
        export_views.push(inst_view);
      }
    } else {
      export_views.push(inst_view);
    }

  });

  // if (export_views.length > 1){
  //   console.log('found more than one view in get_subset_views')
  //   console.log(requested_view)
  //   console.log(export_views)
  // } else {
  //   console.log('found single view in get_subset_views')
  //   console.log(requested_view)
  //   console.log(export_views[0])
  //   console.log('\n')
  // }

  return export_views;

};