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
    var width = 225;
    var bar_offset = 23;
    var bar_height = 20;
    var max_string_length = 15;
    var bar_width = 135;
    var title_height = 27;

    // limit on the number of category types shown
    var max_cats = 3;
    // limit the number of bars shown
    var max_bars = 20;

    // calculate height needed for svg based don cat_breakdown data
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
      .style('height', svg_height+'px')
      .style('width', width+'px')
      .style('fill', 'white')
      .style('opacity', 1);

    // the total amout to shift down the next category
    var shift_down = title_height;

    // limit the category-types
    cat_breakdown = cat_breakdown.slice(0, max_cats);

    _.each(cat_breakdown, function(cat_data){


      // only keep the top 5 categories
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
        inst_title = inst_title.slice(0,max_string_length) + '..';
      }

      // make title
      cat_graph_group
        .append('text')
        .classed('cat_graph_title', true)
        .text(inst_title)
        .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
        .style('font-weight',  800);

      var count_offset = 15;
      // make P-value title
      cat_graph_group
        .append('text')
        .text('Count')
        .attr('transform', function(){
          var inst_x = bar_width + count_offset;
          var inst_translate = 'translate('+ inst_x +', 0)';
          return inst_translate;
        });

      var line_y = 4;
      cat_graph_group
        .append('line')
        .attr('x1', 0)
        .attr('x2', bar_width)
        .attr('y1', line_y)
        .attr('y2', line_y)
        .style('stroke', 'blue')
        .style('stroke-width', 1)
        .style('opacity', 1.0);

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

      var bar_scale = d3.scale.linear()
                        // bar length is max when all nodes in cluster are of
                        // a single cat
                        // .domain([0, cat_data.num_in_clust])
                        // bar length is max based on the max number in one cat
                        .domain([0, cat_data.bar_data[0][2]])
                        .range([0, bar_width]);

      // make bars
      cat_bar_groups
        .append('rect')
        .style('height', bar_height+'px')
        .style('width', function(d){
          var inst_width = bar_scale(d[2]);
          return inst_width +'px';
        })
        .style('fill', function(d){
          // cat color is stored in the third element
          return d[3];
        })
        .style('opacity', params.viz.cat_colors.opacity)
        .style('stroke', 'grey')
        .style('stroke-width', '0.5px');

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
        .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
        .style('font-weight', 400);

      // make bar labels
      var shift_count_num = 25;
      cat_bar_groups
        .append('text')
        .classed('count_labels', true)
        .text(function(d){
          return String(d[4]);
        })
        .attr('transform', function(){
          var inst_x = bar_width + count_offset + shift_count_num;
          var inst_y = 0.75 * bar_height;
          return 'translate('+ inst_x +', ' + inst_y + ')' ;
        })
        .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
        .style('font-weight', 400)
        .style('text-anchor', 'end');


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
        // shift_top = svg_height + 30;
        shift_top = 0;
        shift_left = 32;

        // prevent graph from being too high
        if (dendro_info.pos_top < svg_height){
          // do not shift position of category breakdown graph
          // shift_top = -(svg_height + (dendro_info.pos_mid - dendro_info.pos_top)/2) ;
        }

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