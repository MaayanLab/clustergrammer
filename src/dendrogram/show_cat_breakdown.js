var calc_cat_cluster_breakdown = require('./calc_cat_cluster_breakdown');

module.exports = function show_cat_breakdown(params, inst_data, inst_rc, dendro_info){

  var cat_breakdown = calc_cat_cluster_breakdown(params, inst_data, inst_rc);

  // loop through cat_breakdown data
  var inst_breakdown;
  var bar_data;
  var tmp_fraction;
  var tmp_name;
  var tmp_color;
  var num_in_clust;
  for (var i = 0; i < cat_breakdown.length; i++){

    inst_breakdown = cat_breakdown[i];

    bar_data = inst_breakdown.bar_data;
    num_in_clust = inst_breakdown.num_in_clust;

    for (var x=0; x < bar_data.length; x++){

      // data for individual bar
      var tmp_data = bar_data[x];

      var cat_index = tmp_data[0];
      tmp_name = tmp_data[1];
      tmp_fraction = tmp_data[2]/num_in_clust;
      tmp_color = tmp_data[3];
      var tmp_pval = tmp_data[4];

      // get num instances of cat
      var tot_inst_cat = params.viz.cat_info[inst_rc][cat_index].cat_hist[tmp_name];

      // console.log(tmp_name + ' ' + String(tmp_fraction) + ' ' + String(tmp_color) + ' num_in_clust: ' + String(num_in_clust) + ' : '+ String(parseInt(tmp_fraction*num_in_clust, 10)) + ' total: ' + String(tot_inst_cat) + '  ' + String(tmp_pval))

    }

    // console.log('----------------\n')

  }

  // get cat data
  var cat_data = cat_breakdown[0];

  // only keep the top 5 categories
  cat_data.bar_data = cat_data.bar_data.slice(0,5)

  var selector_dendro_tip = params.viz.root_tips + '_' + inst_rc + '_dendro_tip';
  var cluster_info_container = d3.select(selector_dendro_tip + ' .cluster_info_container');
  var bar_width = 150;
  var bar_scale = d3.scale.linear()
                    .domain([0, cat_data.num_in_clust])
                    .range([0, bar_width]);

  if (d3.select(selector_dendro_tip + ' .cat_graph').empty()){

    // console.log('show cat breakdown')

    var super_string = ': ';
    var paragraph_string = '<p>';
    var height = 150;
    var width = 200;
    var bar_offset = 23;
    var bar_height = 20;

    cluster_info_container
      .style('margin-bottom', '5px')

    cluster_info_container
      .append('text')
      .text('something')

    var graph_container = cluster_info_container
      .append('div')
      .style('margin-top','5px')
      .classed('cat_graph', true)
      .append('svg')
      .style('height', height+'px')
      .style('width', width+'px');

    // make background
    graph_container
      .append('rect')
      .classed('cat_background', true)
      .style('height', height+'px')
      .style('width', width+'px')
      .style('fill', 'white')
      .style('opacity', 1);

    var cat_graph_group = graph_container
      .append('g')
      .classed('cat_graph_group', true)
      .attr('transform', 'translate(10,20)')


    // make title
    cat_graph_group
      .append('text')
      .classed('cat_graph_group', true)
      .text(cat_data.type_name)
      .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
      .style('font-weight', 800);

    var cat_bar_container = cat_graph_group
      .append('g')
      .classed('cat_bar_container', true)
      .attr('transform', 'translate(0, 10)')

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
        // return 'red';
      })
      .style('opacity', params.viz.cat_colors.opacity)
      .style('stroke', 'black')
      .style('stroke-width', '0.5px')
      // .style('opacity', 1);

    // make bar-text
    cat_bar_groups
      .append('text')
      .text(function(d){
        var inst_text = d[1];
        if (inst_text.indexOf(super_string) > 0){
          inst_text = inst_text.split(super_string)[1];
        }
        if (inst_text.indexOf(paragraph_string) > 0){
          // required for Enrichr category names (needs improvements)
          inst_text = inst_text.split(paragraph_string)[0];
        }
        return inst_text;
      })
      .attr('transform', function(d){
        return 'translate(5, ' + 0.75 * bar_height + ')' ;
      })
      .style('font-family', '"Helvetica Neue", Helvetica, Arial, sans-serif')
      .style('font-weight', 400);

    var dendro_tip = d3.select(selector_dendro_tip);
    var old_top = dendro_tip.style('top').split('.px')[0];
    var old_left = dendro_tip.style('left').split('.px')[0];
    var shift_top;
    var shift_left;

    var graph_height = 160;

    // shifting
    if (inst_rc === 'row'){
      shift_top = graph_height;
      shift_left = 0;

      // prevent graph from being too high
      if (dendro_info.pos_top < graph_height){
        shift_top = - (graph_height) ;
      }

    } else {
      shift_top = graph_height;
      shift_left = 0;
    }

    dendro_tip
      .style('top', function(){
        var new_top = String(parseInt( old_top,10) - shift_top) + 'px';
        return new_top;
      })
      .style('left', function(){
        var new_left = String(parseInt( old_left,10) - shift_left) + 'px';
        return new_left;
      })

  }

}