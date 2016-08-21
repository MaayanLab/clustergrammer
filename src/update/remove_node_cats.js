module.exports = function remove_node_cats(inst_node){

  var all_props = _.keys(inst_node);

  _.each(all_props, function(inst_prop){

    if (inst_prop.indexOf('cat-') > -1){
      delete inst_node[inst_prop];
    }

    if (inst_prop.indexOf('cat_') > -1){
      delete inst_node[inst_prop];
    }

  });

};