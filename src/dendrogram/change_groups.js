// var build_color_groups = require('./build_color_groups');
var make_row_dendro_triangles = require('./make_row_dendro_triangles');
var make_col_dendro_triangles = require('./make_col_dendro_triangles');

/* Changes the groupings (x- and y-axis color bars).
 */
module.exports = function (params, inst_rc, inst_index) {

  if (inst_rc==='row'){
    params.group_level.row = inst_index;
  } else if (inst_rc==='col'){
    params.group_level.col = inst_index;
  }

  var is_change_group = true;
  make_row_dendro_triangles(params, is_change_group);
  make_col_dendro_triangles(params, is_change_group);

};
