var underscore = require('underscore');

module.exports = function check_nodes_for_categories(nodes){

  var super_string = ': ';
  var has_cat = true;

  underscore.each(nodes, function(inst_node){
    var inst_name = String(inst_node.name);
    if (inst_name.indexOf(super_string) < 0){
      has_cat = false;
    }
  });

  return has_cat;

};