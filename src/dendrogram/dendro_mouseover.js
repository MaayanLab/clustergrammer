var calc_cluster_cat_breakdown = require('./calc_cluster_cat_breakdown');

module.exports = function dendro_mouseover(cgm, inst_selection, inst_data, inst_rc){

  var params = cgm.params;

  // run instantly on mouseover
  d3.select(inst_selection)
    .classed('hovering', true);

  if (cgm.params.dendro_callback != null){
    cgm.params.dendro_callback(inst_selection);
  }

  var cat_breakdown = calc_cluster_cat_breakdown(cgm.params, inst_data, inst_rc);

  // loop through cat_breakdown data
  var inst_breakdown;
  var bar_data;
  var tmp_fraction;
  var tmp_name;
  for (var i = 0; i < cat_breakdown.length; i++){

    inst_breakdown = cat_breakdown[i];

    bar_data = inst_breakdown.bar_data;

    for (var x=0; x < bar_data.length; x++){
      // data for individual bar
      var tmp_data = bar_data[x]

      tmp_name = bar_data[x][0];
      tmp_fraction = bar_data[x][1];

      console.log(tmp_name + ' ' + String(tmp_fraction))

    }

    console.log('----------------\n')

  }

};