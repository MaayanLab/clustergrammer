var Params = require('../params');
var build_row_dendro = require('./build_row_dendro');
var build_col_dendro = require('./build_col_dendro');
var group_colors = require('./group_colors');

/* Dendrogram color bar.
 */
module.exports = function(type) {
  var params = Params.get();
  var dom_class;

  if (type === 'row') {
    dom_class = 'row_class_rect';
    build_row_dendro(dom_class);
  } else {
    dom_class = 'col_class_rect';
    build_col_dendro(dom_class);
  }

  /* Changes the groupings (x- and y-axis color bars).
   */
  function change_groups(inst_rc, inst_index) {
    d3.selectAll('.' + dom_class)
      .style('fill', function(d) {
        return group_colors.get_group_color(d.group[inst_index]);
      });

    if (inst_rc==='row'){
      params.group_level.row = inst_index;
    } else if (inst_rc==='col'){
      params.group_level.col = inst_index;
    }

  }

  return {
    color_group: group_colors.color_group,
    get_group_color: group_colors.get_group_color,
    change_groups: change_groups
  };
};
