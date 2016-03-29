var filter_using_new_nodes = require('./filter_using_new_nodes');

module.exports = function change_network_view(params, orig_network_data, requested_view) {

  var views = orig_network_data.views;
  var inst_view;
  var inst_value;
  var other_value;
  var request_filters = _.keys(requested_view);
  var possible_filters = _.keys(params.viz.possible_filters);
  var check_filters = [];

  // find a view that matches all of the requested view/filter-attributes 
  _.each(request_filters, function(inst_filter){

    inst_value = requested_view[inst_filter];

    views = _.filter(views, function(d){
      return d[inst_filter] == inst_value;
    });

  });

  if (views.length==1){
    inst_view = views[0];
  } else {

    // find filters that are not included in requested view 
    _.each(possible_filters, function(inst_filter){
      if (request_filters.indexOf(inst_filter) <= -1){
        check_filters.push(inst_filter);
      }
    });

    /*
    find all other possible filters
    check if any of hte possible filters are active (check buttons and sliders)
    use the selected value or default to some value and choose a single view
    */

    if (check_filters[0] === 'N_row_sum'){
      other_value = $('.slider_N_row_sum').slider('value');
    }

    if (check_filters[0] === 'enr_score_type'){

      d3.selectAll('.toggle_enr_score_type .btn')
        .each(function(){
          if ( d3.select(this).classed('active') ){
            other_value = d3.select(this).attr('name');
          }
        });

    }

    inst_view = views[0];

  }

  var new_network_data;

  // get new_network_data or default back to old_network_data 
  if (typeof inst_view !== 'undefined'){
    var new_nodes = inst_view.nodes;
    var links = orig_network_data.links;
    new_network_data = filter_using_new_nodes(params, new_nodes, links, views);
  } else {
    new_network_data = orig_network_data;
  }

  return new_network_data;
};
