module.exports = function cat_breakdown_values(params, cat_graph_group, cat_bar_groups, num_nodes_index, is_downsampled, count_offset, bars_index, cluster_total){


  var bar_width = params.viz.cat_bar_width;
  var bar_height = params.viz.cat_bar_height;
  var offset_ds_count = 150;
  var binom_pval_index = 6;


  // Count Title
  cat_graph_group
    .append('text')
    .text('Count')
    .attr('transform', function(){
      var inst_x = bar_width + count_offset;
      var inst_translate = 'translate('+ inst_x +', 0)';
      return inst_translate;
    });

  // Percentage Title
  cat_graph_group
    .append('text')
    .text('Pct')
    .attr('transform', function(){
      var inst_x = bar_width + count_offset + 60;
      var inst_translate = 'translate('+ inst_x +', 0)';
      return inst_translate;
    });

  // Percentage Title
  cat_graph_group
    .append('text')
    .text('P-val')
    .attr('transform', function(){
      var inst_x = bar_width + count_offset + 115;
      var inst_translate = 'translate('+ inst_x +', 0)';
      return inst_translate;
    });

  // Count Downsampled Title
  if (is_downsampled){
    cat_graph_group
      .append('text')
      .text('Clusters')
      .attr('transform', function(){
        var inst_x = bar_width + offset_ds_count ;
        var inst_translate = 'translate('+ inst_x +', 0)';
        return inst_translate;
      });
  }

  // Counts
  /////////////////////////////
  var shift_count_num = 35;

  cat_bar_groups
    .append('text')
    .classed('count_labels', true)
    .text(function(d){
      var inst_count = d[bars_index];
      inst_count = inst_count.toLocaleString();
      return String(inst_count);
    })
    .attr('transform', function(){
      var inst_x = bar_width + count_offset + shift_count_num;
      var inst_y = 0.75 * bar_height;
      return 'translate('+ inst_x +', ' + inst_y + ')' ;
    })
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-weight', 400)
    .attr('text-anchor', 'end');


  // Percentage
  //////////////////////
  cat_bar_groups
    .append('text')
    .classed('count_labels', true)
    .text(function(d){
      // calculate the percentage relative to the current cluster
      var inst_count = d[bars_index] / cluster_total * 100;
      inst_count = Math.round(inst_count * 10)/10;
      inst_count = inst_count.toLocaleString();
      return String(inst_count);
    })
    .attr('transform', function(){
      var inst_x = bar_width + count_offset + shift_count_num + 47;
      var inst_y = 0.75 * bar_height;
      return 'translate('+ inst_x +', ' + inst_y + ')' ;
    })
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-weight', 400)
    .attr('text-anchor', 'end');

  // Binomial Test Pvals
  cat_bar_groups
    .append('text')
    .classed('count_labels', true)
    .text(function(d){
      // calculate the percentage relative to the current cluster
      var inst_count = d[binom_pval_index];

      if (inst_count<0.001){
        inst_count = parseFloat(inst_count.toPrecision(3));
        inst_count = inst_count.toExponential();
      } else {
        inst_count = parseFloat(inst_count.toPrecision(2));
      }

      // inst_count = inst_count.toLocaleString();
      return inst_count;
    })
    .attr('transform', function(){
      var inst_x = bar_width + count_offset + shift_count_num + 112;
      var inst_y = 0.75 * bar_height;
      return 'translate('+ inst_x +', ' + inst_y + ')' ;
    })
    .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
    .attr('font-weight', 400)
    .attr('text-anchor', 'end');

  if (is_downsampled){

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

  }

};