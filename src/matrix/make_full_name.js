module.exports = function make_full_name(params, inst_node, inst_rc){

  var cat_name;
  var inst_name = inst_node.name;
  var num_cats = params.viz.all_cats[inst_rc].length;

  // make tuple if necessary
  if (num_cats>0){

    inst_name = "('" + inst_name + "'";

    for (var cat_index= 0; cat_index < num_cats; cat_index++) {
      cat_name = 'cat-'+ String(cat_index);

      inst_name =  inst_name + ", '" + String(inst_node[cat_name]) + "'";

    }

    inst_name = inst_name + ')';

  } else {

    // always make names strings
    inst_name = String(inst_name);

  }


  return inst_name;
  };