var calc_cat_cluster_breakdown = require('./calc_cat_cluster_breakdown');

module.exports = function make_cat_breakdown_graph(params, inst_rc, inst_data, dendro_info, selector, tooltip=false){

  /*
  This function is used to make the category breakdown graphs for tooltips on
  dendrogram mousover and on dendrogram click modal popup.
  */

  // in case sim_mat
  if (inst_rc === 'both'){
    inst_rc = 'row';
  }

  var cat_breakdown = calc_cat_cluster_breakdown(params, inst_data, inst_rc);

  if (cat_breakdown.length > 0){

    // put cluster information in dendro_tip
    ///////////////////////////////////////////
    var cluster_info_container = d3.select( selector + ' .cluster_info_container');

    // loop through cat_breakdown data
    var super_string = ': ';
    var paragraph_string = '<p>';
    var width = 370;
    var bar_offset = 23;
    var bar_height = 20;
    var max_string_length = 25;
    var bar_width = 180;
    var title_height = 27;
    var shift_tooltip_left = 177;

    // these are the indexes where the number-of-nodes and the number of downsampled
    // nodes are stored
    var num_nodes_index = 4;
    var num_nodes_ds_index = 5;
    var offset_ds_count = 150;
    var binom_pval_index = 6;

    var is_downsampled = false;
    if (cat_breakdown[0].bar_data[0][num_nodes_ds_index] != null){
      width = width + 100;
      shift_tooltip_left = shift_tooltip_left + offset_ds_count - 47;
      is_downsampled = true;
    }

    // the index that will be used to generate the bars (will be different if
    // downsampled)
    var cluster_total = dendro_info.all_names.length;
    var bars_index = num_nodes_index;
    if (is_downsampled){
      bars_index = num_nodes_ds_index;

      // calculate the total number of nodes in downsampled case
      var inst_bar_data = cat_breakdown[0].bar_data;
      cluster_total = 0;
      _.each(inst_bar_data, function(tmp_data){
        cluster_total = cluster_total + tmp_data[num_nodes_ds_index];
      });
    }

    // limit on the number of category types shown
    var max_cats = 3;
    // limit the number of bars shown
    var max_bars = 25;

    // calculate height needed for svg based on cat_breakdown data
    var svg_height = 20;
    _.each(cat_breakdown.slice(0,max_cats), function(tmp_break){
      var num_bars = tmp_break.bar_data.length;
      if (num_bars > max_bars){
        num_bars = max_bars;
      }
      svg_height = svg_height + title_height * (num_bars + 1);
    });

    // Cluster Information Title (for tooltip only not modal)
    if (tooltip){
      cluster_info_container
        .append('text')
        .text('Cluster Information');
    }

    var main_dendro_svg = cluster_info_container
      .append('div')
      .style('margin-top','5px')
      .classed('cat_graph', true)
      .append('svg')
      .style('height', svg_height+'px')
      .style('width', width+'px');

    // make background
    main_dendro_svg
      .append('rect')
      .classed('cat_background', true)
      .attr('height', svg_height+'px')
      .attr('width', width+'px')
      .attr('fill', 'white')
      .attr('opacity', 1);

    // the total amout to shift down the next category
    var shift_down = title_height;

    // limit the category-types
    cat_breakdown = cat_breakdown.slice(0, max_cats);

    _.each(cat_breakdown, function(cat_data){

      var max_bar_value = cat_data.bar_data[0][bars_index];

      // offset the count column based on how large the counts are
      var digit_offset_scale = d3.scale.linear()
                                 .domain([0,100000]).range([20, 30]);

      // only keep the top max_bars categories
      cat_data.bar_data = cat_data.bar_data.slice(0, max_bars);

      cluster_info_container
        .style('margin-bottom', '5px');

      var cat_graph_group = main_dendro_svg
        .append('g')
        .classed('cat_graph_group', true)
        .attr('transform', 'translate(10, '+ shift_down + ')');

      // shift down based on number of bars
      shift_down = shift_down + title_height * (cat_data.bar_data.length + 1);

      var inst_title = cat_data.type_name;
      // ensure that title is not too long
      if (inst_title.length >= max_string_length){
        inst_title = inst_title.slice(0, max_string_length) + '..';
      }

      // make title
      cat_graph_group
        .append('text')
        .classed('cat_graph_title', true)
        .text(inst_title)
        .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
        .style('font-weight',  800);

      // shift the position of the numbers based on the size of the number
      var count_offset = digit_offset_scale(max_bar_value);

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

      var line_y = 4;
      cat_graph_group
        .append('line')
        .attr('x1', 0)
        .attr('x2', bar_width)
        .attr('y1', line_y)
        .attr('y2', line_y)
        .attr('stroke', 'blue')
        .attr('stroke-width', 1)
        .attr('opacity', 1.0);

      var cat_bar_container = cat_graph_group
        .append('g')
        .classed('cat_bar_container', true)
        .attr('transform', 'translate(0, 10)');

      // make bar groups (hold bar and text)
      var cat_bar_groups = cat_bar_container
        .selectAll('g')
        .data(cat_data.bar_data)
        .enter()
        .append('g')
        .attr('transform', function(d, i){
          var inst_y = i * bar_offset;
          return 'translate(0,'+ inst_y +')';
        });

      // bar length is max when all nodes in cluster are of
      // a single cat
      var bar_scale = d3.scale.linear()
                        .domain([0, max_bar_value])
                        .range([0, bar_width]);

      // make bars
      cat_bar_groups
        .append('rect')
        .attr('height', bar_height+'px')
        .attr('width', function(d){
          var inst_width = bar_scale(d[bars_index]);
          return inst_width +'px';
        })
        .attr('fill', function(d){
          // cat color is stored in the third element
          return d[3];
        })
        .attr('opacity', params.viz.cat_colors.opacity)
        .attr('stroke', 'grey')
        .attr('stroke-width', '0.5px');

      // make bar labels
      cat_bar_groups
        .append('text')
        .classed('bar_labels', true)
        .text(function(d){
          var inst_text = d[1];
          if (inst_text.indexOf(super_string) > 0){
            inst_text = inst_text.split(super_string)[1];
          }
          if (inst_text.indexOf(paragraph_string) > 0){
            // required for Enrichr category names (needs improvements)
            inst_text = inst_text.split(paragraph_string)[0];
          }
          // ensure that bar name is not too long
          if (inst_text.length >= max_string_length){
            inst_text = inst_text.slice(0,max_string_length) + '..';
          }
          return inst_text;
        })
        .attr('transform', function(){
          return 'translate(5, ' + 0.75 * bar_height + ')' ;
        })
        .attr('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
        .attr('font-weight', 400)
        .attr('text-anchor', 'right');

      // Count/Pct Rows
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

    });

    // reposition tooltip
    /////////////////////////////////////////////////
    if (tooltip){

      var dendro_tip = d3.select(selector);
      var old_top = dendro_tip.style('top').split('.px')[0];
      var old_left = dendro_tip.style('left').split('.px')[0];
      var shift_top = 0;
      var shift_left = 0;

      // shifting
      if (inst_rc === 'row'){

        // rows
        //////////////
        shift_top = 0;
        shift_left = shift_tooltip_left;

        // // prevent graph from being too high
        // if (dendro_info.pos_top < svg_height){
        //   // do not shift position of category breakdown graph
        //   // shift_top = -(svg_height + (dendro_info.pos_mid - dendro_info.pos_top)/2) ;
        // }

      } else {

        // columns
        //////////////
        shift_top = svg_height + 32;
        shift_left = 30;
      }

      dendro_tip
        .style('top', function(){
          var new_top = String(parseInt( old_top,10) - shift_top) + 'px';
          return new_top;
        })
        .style('left', function(){
          var new_left = String(parseInt( old_left,10) - shift_left) + 'px';
          return new_left;
        });

    }
  }

};