module.exports = function remove_node_cats(inst_node) {
  var all_props = Object.keys(inst_node || {});

  all_props.forEach(function (inst_prop) {
    if (inst_prop.indexOf('cat-') > -1) {
      delete inst_node[inst_prop];
    }

    if (inst_prop.indexOf('cat_') > -1) {
      delete inst_node[inst_prop];
    }
  });
};
