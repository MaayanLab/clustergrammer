module.exports = function check_nodes_for_categories(nodes){

  var super_string = ': ';
  var has_cat = true;

  _.each(nodes, function(inst_node){
    if (inst_node.name.indexOf(super_string) < 0){
      has_cat = false;
    }
  });

  return has_cat;

};