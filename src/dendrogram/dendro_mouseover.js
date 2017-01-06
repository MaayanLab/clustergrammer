module.exports = function dendro_mouseover(cgm, inst_selection, inst_data, inst_rc){

  var params = cgm.params;

  var all_names = inst_data.all_names;

  // find cats: cat-strings
  //////////////////////////
  // params.viz.cat_info

  /*

  1. find category-types that are string-type
  2. get category-names that are possible for each category-type
  3. count instances of each category name for each category-type

  */

  var inst_info = params.viz.cat_info[inst_rc];
  var cat_types_index = _.keys(inst_info);


  // var inst_node = params.network_data[inst_rc+'_nodes'][0];

  // get category names
  var cat_types_names = [];
  var inst_name;
  var inst_index;
  for (var i = 0; i < cat_types_index.length; i++) {
    inst_index = 'cat-' + String(i);

    inst_name = params.viz.cat_names[inst_rc][inst_index]
    cat_types_names.push(inst_name)

  }

  // string-category
  console.log(cat_types_names)

  // run instantly on mouseover
  d3.select(inst_selection)
    .classed('hovering', true);

  if (cgm.params.dendro_callback != null){
    cgm.params.dendro_callback(inst_selection);
  }

};