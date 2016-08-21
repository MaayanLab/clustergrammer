module.exports = function make_default_cat_data(cgm){

  // working for rows only since only rows are supported for updating

  var cat_data = [];

  var row_nodes = cgm.params.network_data.row_nodes;

  _.each(row_nodes, function(inst_node){
    console.log(inst_node.name)

    var all_props = _.keys(inst_node);

    _.each(all_props, function(inst_prop){

      if (inst_prop.indexOf('cat-') > -1){
        var cat_name = inst_node[inst_prop]
        console.log('\t'+cat_name)

      }

    });

  });


  var cat_type = {};
  cat_type.cat_title = 'cat_title';
  cat_type.cats = []

  var inst_cat_obj = {}
  inst_cat_obj.cat_name = 'cat_name'
  inst_cat_obj.members = ['SRC','STK24']
  cat_type.cats.push(inst_cat_obj)

  cat_type.cats.push(cat_type)
  cat_data.push(cat_type)

  return cat_data;
}