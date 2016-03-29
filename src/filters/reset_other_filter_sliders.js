var make_filter_title = require('./make_filter_title');

module.exports = function reset_other_filter_sliders(params, filter_type, inst_state){

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

  var filter_title = make_filter_title(filter_type);

  d3.select(params.root+' .title_'+filter_type)
    .text(filter_title.text + inst_state + filter_title.suffix);

};