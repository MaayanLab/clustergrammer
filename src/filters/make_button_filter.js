module.exports = function make_button_filter(config, params, filter_type, div_filters){

  var buttons = div_filters
    .append('div')
    .classed('categorical_filter',true)
    .style('width', params.sidebar.slider.width+'px')
    .style('margin-left', params.sidebar.slider.margin_left+'px')
    .classed('btn-group-vertical',true)
    .style('width','135px')
    .style('margin-left','0px')
    .style('margin-top','10px');

  var filter_options = params.viz.filter_data[filter_type];

  var button_dict = {
    'combined_score':'Combined Score',
    'pval':'P-Value',
    'zscore':'Z-score'
  };

  buttons
    .selectAll('button')
    .data(filter_options)
    .enter()
    .append('button')
    .attr('type','button')
    .classed('btn',true)
    .classed('btn-primary',true)
    .classed('active', function(d){
      var is_active = false;
      if (d == 'combined_score'){
        is_active = true;
      }
      return is_active;
    })
    .attr('name', function(d){
      return d;
    })
    .html(function(d){
      return button_dict[d];
    });


};