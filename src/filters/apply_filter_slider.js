var update_network = require('../network/update_network');
var make_filter_title = require('./make_filter_title');

module.exports = function apply_filter_slider(config, params, filter_type, available_views){

  // get value
  var inst_index = $( params.root+' .slider_'+filter_type ).slider( "value" );
  var inst_state = available_views[inst_index][filter_type];
  var requested_view = {};
  
  requested_view[filter_type] = inst_state;

  d3.select(params.root+' .slider_'+filter_type)
    .attr('current_state', inst_state);

  // reset the state of the other filter sliders 
  var possible_filter_names = _.keys(params.viz.possible_filters);
  _.each( possible_filter_names, function(reset_filter){
    if (filter_type != reset_filter){

      var tmp_title = make_filter_title(reset_filter);
      $(params.root+' .slider_'+reset_filter).slider( "value", 0);

      d3.select(params.root+' .title_'+reset_filter)
        .text(tmp_title.text + tmp_title.state + tmp_title.suffix);

      d3.select(params.root+' .slider_'+reset_filter)
        .attr('current_state', tmp_title.state);
    }
  });

  // get current orders 
  var other_rc;
  _.each(['row','col'], function(inst_rc){

    if (inst_rc === 'row'){
      other_rc = 'col';
    } else {
      other_rc = 'row';
    }
    
    if (d3.select(params.root+' .toggle_'+other_rc+'_order .active').empty() === false){

      params.viz.inst_order[inst_rc] = d3.select(params.root+' .toggle_'+other_rc+'_order')
        .select('.active').attr('name');

    } else {

      // default to cluster ordering 
      params.viz.inst_order[inst_rc] = 'clust';

    }

  });
  
  params = update_network(config, params, requested_view);

  var filter_title = make_filter_title(filter_type);

  d3.select(params.root+' .title_'+filter_type)
    .text(filter_title.text + inst_state + filter_title.suffix);

  return params;

};