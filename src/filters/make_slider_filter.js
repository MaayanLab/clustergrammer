var make_filter_title = require('./make_filter_title');
var utils = require('../utils');
var apply_filter_slider = require('./apply_filter_slider');

module.exports = function make_slider_filter(config, params, filter_type, div_filters){

  var filter_title = make_filter_title(filter_type);
  
  div_filters
    .append('div')
    .classed('viz_medium_text',true)
    .classed('title_'+filter_type,true)
    .text(filter_title.text + filter_title.value + filter_title.suffix);

  div_filters
    .append('div')
    .classed('slider_'+filter_type,true)
    .classed('slider',true)
    .style('width', params.sidebar.slider.width+'px')
    .style('margin-left', params.sidebar.slider.margin_left+'px');
    
  var views = params.network_data.views;

  var available_views = _.filter(views, function(d) { 
    return utils.has( d, filter_type); 
  });


  // Enrichr specific rules 
  if (_.has(views[0], 'enr_score_type')){

    var inst_enr = 'combined_score';

    d3.selectAll('.toggle_enr_score_type .btn')
      .each(function(){
        if ( d3.select(this).classed('active') ){
          inst_enr = d3.select(this).attr('name');
        }
      }); 

    // filter out enr_score_type 
    available_views = _.filter(available_views, function(d){
      return d.enr_score_type == inst_enr;
    });

  }

  var inst_max = available_views.length - 1;

  $( '.slider_'+filter_type ).slider({
    value:0,
    min: 0,
    max: inst_max,
    step: 1,
    stop: function() {
      params = apply_filter_slider(config, params, filter_type, available_views);
    }
  });

};