var underscore = require('underscore');

module.exports = function make_view_request(params, requested_view){

  // this will add all necessary information to a view request
  // it will grab necessary view information from the sliders

  // only one component will be changed at a time
  var changed_component = underscore.keys(requested_view)[0];

  // add additional filter information from othe possible filters
  underscore.each( underscore.keys(params.viz.possible_filters), function(inst_filter){

    if (inst_filter != changed_component){

      if (!d3.select(params.root+' .slider_'+inst_filter).empty()){

        var inst_state = d3.select(params.root+' .slider_'+inst_filter)
          .attr('current_state');

        requested_view[inst_filter] = inst_state;
      }

    }

  });

  return requested_view;

};