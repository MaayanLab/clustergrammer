var build_row_dendro = require('./build_row_dendro');
var build_col_dendro = require('./build_col_dendro');
var build_color_groups = require('./build_color_groups');

/* Dendrogram color bar.
 */
module.exports = function(params, type) {
  var dom_class;

  if (type === 'row') {
    dom_class = 'row_class_rect';
    build_row_dendro(params, dom_class);
  } else {
    dom_class = 'col_class_rect';
    build_col_dendro(params, dom_class);
  }

  var group_colors = build_color_groups(params);

  function color_group(index) {
    return group_colors[index];
  }

  function get_group_color(index) {
    return group_colors[index];
  }

  /* Changes the groupings (x- and y-axis color bars).
   */
  function change_groups(inst_rc, inst_index) {
    d3.selectAll('.' + dom_class)
      .style('fill', function(d) {
        return get_group_color(d.group[inst_index]);
      });

    if (inst_rc==='row'){
      params.group_level.row = inst_index;
    } else if (inst_rc==='col'){
      params.group_level.col = inst_index;
    }
  }

  return {
    color_group: color_group,
    get_group_color: get_group_color,
    change_groups: change_groups
  };
};
