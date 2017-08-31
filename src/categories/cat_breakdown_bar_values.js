module.exports = function cat_breakdown_bar_values(params, cat_bar_groups, num_nodes_index){

  console.log('adding downsample values')

  var bar_width = params.viz.cat_bar_width;
  var bar_height = params.viz.cat_bar_height;
  var shift_count_num = 35;
  var offset_ds_count = 150;

  cat_bar_groups
    .append('text')
    .classed('count_labels', true)
    .text(function(d){
      return String(d[num_nodes_index].toLocaleString());
    })
    .attr('transform', function(){
      // downsampled cluster numbers are smaller and need less flexible offsetting
      var inst_x = bar_width + shift_count_num + offset_ds_count  + 20;
      var inst_y = 0.75 * bar_height;
      return 'translate('+ inst_x +', ' + inst_y + ')' ;
    })
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-weight', 400)
    .attr('text-anchor', 'end');


};