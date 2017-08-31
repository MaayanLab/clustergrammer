var calc_cat_cluster_breakdown = require('./calc_cat_cluster_breakdown');
var underscore = require('underscore');
var cat_breakdown_bars = require('./cat_breakdown_bars');
var cat_breakdown_values = require('./cat_breakdown_values');

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
    var width = 370;
    var title_height = 27;
    var shift_tooltip_left = 177;
    var bar_offset = 23;

    // these are the indexes where the number-of-nodes and the number of downsampled
    // nodes are stored
    var num_nodes_index = 4;
    var num_nodes_ds_index = 5;
    var offset_ds_count = 150;

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
      underscore.each(inst_bar_data, function(tmp_data){
        cluster_total = cluster_total + tmp_data[num_nodes_ds_index];
      });
    }

    // limit on the number of category types shown
    var max_cats = 3;
    // limit the number of bars shown
    var max_bars = 25;

    // calculate height needed for svg based on cat_breakdown data
    var svg_height = 20;
    underscore.each(cat_breakdown.slice(0,max_cats), function(tmp_break){
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

    cluster_info_container
      .style('margin-bottom', '5px');


    // make background
    main_dendro_svg
      .append('rect')
      .classed('cat_background', true)
      .attr('height', svg_height+'px')
      .attr('width', width+'px')
      .attr('fill', 'white')
      .attr('opacity', 1);


    // limit the category-types
    cat_breakdown = cat_breakdown.slice(0, max_cats);

    // shift the position of the numbers based on the size of the number
    // offset the count column based on how large the counts are
    var digit_offset_scale = d3.scale.linear()
                               .domain([0,100000]).range([20, 30]);

    // the total amout to shift down the next category
    var shift_down = title_height;

    underscore.each(cat_breakdown, function(cat_data){

      var max_bar_value = cat_data.bar_data[0][bars_index];

      var count_offset = digit_offset_scale(max_bar_value);

      var cat_graph_group = main_dendro_svg
        .append('g')
        .classed('cat_graph_group', true)
        .attr('transform', 'translate(10, '+ shift_down + ')');

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

      cat_breakdown_bars(params, cat_data, cat_graph_group, title_height, bars_index, max_bars, cat_bar_groups);

      cat_breakdown_values(params, cat_graph_group, cat_bar_groups, num_nodes_index, is_downsampled, count_offset, bars_index, cluster_total);

      // shift down based on number of bars
      shift_down = shift_down + title_height * (cat_data.bar_data.length + 1);

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