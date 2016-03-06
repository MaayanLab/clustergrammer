var build_color_groups = require('./build_color_groups');

/* Changes the groupings (x- and y-axis color bars).
 */
module.exports = function (params, inst_rc, inst_index) {

  var dom_class;

  var group_colors = build_color_groups(params);

  if (inst_rc=='row'){
    dom_class = 'row_dendro_rect';
  } else {
    dom_class = 'col_dendro_rect';
  }

  d3.selectAll(params.root+' .' + dom_class)
    .style('fill', function(d) {
      var inst_group = d.group[inst_index];
      return group_colors[ inst_group ];
    });

  if (inst_rc==='row'){
    params.group_level.row = inst_index;
  } else if (inst_rc==='col'){
    params.group_level.col = inst_index;
  }
};
