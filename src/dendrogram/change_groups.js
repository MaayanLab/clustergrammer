var make_dendro_triangles = require('./make_dendro_triangles');

/* Changes the groupings (x- and y-axis color bars).
 */
module.exports = function (cgm, inst_rc, inst_index) {

  var params = cgm.params;

  if (inst_rc==='row'){
    params.group_level.row = inst_index;
  } else if (inst_rc==='col'){
    params.group_level.col = inst_index;
  }

  var is_change_group = true;

  make_dendro_triangles(cgm, inst_rc, is_change_group);

};
