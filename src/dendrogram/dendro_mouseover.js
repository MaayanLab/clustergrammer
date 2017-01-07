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

  console.log(cat_breakdown)

    // var tmp_arr = cat_breakdown[type_name];
    // var tmp_fraction;
    // var tmp_name;

    // for (var x=0; x < tmp_arr.length; x++){
    //   // data for individual bar
    //   var tmp_data = tmp_arr[x]

    // }

};