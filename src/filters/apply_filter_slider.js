var update_network = require('../network/update_network');
var make_filter_title = require('./make_filter_title');

module.exports = function apply_filter_slider(config, params, filter_type, available_views){

  // get value
  var inst_index = $( params.root+' .slider_'+filter_type ).slider( "value" );

  var inst_name = available_views[inst_index][filter_type];

  var requested_view = {};
  requested_view[filter_type] = inst_name;

  var possible_filter_names = _.keys(params.viz.possible_filters);
  _.each( possible_filter_names, function(reset_filter){
    if (filter_type != reset_filter){

      var tmp_title = make_filter_title(reset_filter);
      $(params.root+' .slider_'+reset_filter).slider( "value", 0);

      d3.select('.title_'+reset_filter)
        .text(tmp_title.text + tmp_title.value + tmp_title.suffix);
    }
  });

  var rc_other;

  _.each(['row','col'], function(rc_int){

    if (rc_int === 'row'){
      rc_other = 'col';
    } else {
      rc_other = 'row';
    }
    
    if (d3.select(params.root+' .toggle_'+rc_other+'_order .active').empty() === false){
      params.viz.inst_order[rc_int] = d3.select(params.root+' .toggle_'+rc_other+'_order')
        .select('.active').attr('name');
    } else {
      // default to cluster ordering 
      params.viz.inst_order[rc_int] = 'clust';

      d3.select(params.root+' .toggle_'+rc_other+'_order')
        .selectAll('.btn')
        .each(function(d){
          if (d === 'clust'){
            d3.select(this)
              .classed('active',true);
          }
        });
    }

  });

  params = update_network(config, params, requested_view);

  var filter_title = make_filter_title(filter_type);

  d3.select(params.root+' .title_'+filter_type)
    .text(filter_title.text + inst_name + filter_title.suffix);


  return params;

};