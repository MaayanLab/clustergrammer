module.exports = function make_view_request(params, requested_view){

  // this will add all necessary information to a view request 
  // it will grab necessary view information from the sliders 

  // only one component will be changed at a time 
  var changed_component = _.keys(requested_view)[0];

  // default to row 
  var other_rc;
  if ( changed_component.indexOf('row') > -1 ){
    other_rc = 'col';
  } else if ( changed_component.indexOf('col') > -1 ){
    other_rc = 'row';
  } else {
    // for Enrichr 
    other_rc = 'row';
  }

  var possible_filters = _.keys(params.viz.possible_filters);

  // add additional filter information from othe possible filters 
  _.each(possible_filters, function(inst_filter){
    if ( inst_filter.indexOf(other_rc) > -1 ){

      if (!d3.select(params.root+' .slider_'+inst_filter).empty()){

        var inst_state = d3.select(params.root+' .slider_'+inst_filter)
          .attr('current_state');

        requested_view[inst_filter] = inst_state;
      }

    }
  });

  return requested_view;

};