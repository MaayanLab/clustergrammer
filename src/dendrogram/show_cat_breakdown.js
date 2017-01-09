var calc_cat_cluster_breakdown = require('./calc_cat_cluster_breakdown');

module.exports = function show_cat_breakdown(params, inst_data, inst_rc){

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

      console.log(tmp_name + ' ' + String(tmp_fraction) + ' ' + String(tmp_color) + ' num_in_clust: ' + String(num_in_clust) + ' : '+ String(parseInt(tmp_fraction*num_in_clust, 10)) + ' total: ' + String(tot_inst_cat) + '  ' + String(tmp_pval))

    }

    console.log('----------------\n')

  }

  var dendro_tip_selector = params.viz.root_tips + '_' + inst_rc + '_dendro_tip';
  var dendro_tip = d3.select(dendro_tip_selector);

  if (d3.select(dendro_tip_selector + ' .cat_graph').empty()){

    console.log('show cat breakdown')

    var height = 150;
    var width = 200;

    var graph = dendro_tip
      .append('div')
      .style('margin-top','5px')
      .classed('cat_graph', true)
      .append('svg')
      .style('height', height+'px')
      .style('width', width+'px');
      // .append('g')
      // .classed('cat_group')
      // .attr('transform', 'translate(10,10)');


    // make background
    graph
      .append('rect')
      .classed('cat_background', true)
      .style('height', height+'px')
      .style('width', width+'px')
      .style('fill', 'white')
      .style('opacity', 0.975);

    // make bar graph for category type
    var cat_data = cat_breakdown[0];
    graph
      .append('text')
      .classed('new_text', true)
      .text(cat_data.type_name);



    var old_top = dendro_tip.style('top').split('.px')[0];
    var old_left = dendro_tip.style('left').split('.px')[0];
    var shift_top;
    var shift_left;

    // shifting
    if (inst_rc === 'row'){
      shift_top = 160;
      shift_left = 0;
    } else {
      shift_top = 160;
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