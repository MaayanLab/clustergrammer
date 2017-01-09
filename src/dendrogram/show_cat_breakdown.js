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

  if (d3.select(dendro_tip_selector + ' .cat_breakdown').empty()){

    console.log('show cat breakdown')

    dendro_tip
      .append('div')
      .classed('cat_breakdown', true)
      .append('text')
      .text('something ')

    var old_top = dendro_tip.style('top').split('.px')[0];

    dendro_tip
      .style('top', function(){
        var new_top = String(parseInt(old_top,10) - 10) + 'px';
        console.log('new_top ' + String(new_top))

        return new_top;
      })

  }

}