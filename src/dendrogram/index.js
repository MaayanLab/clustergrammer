var build_row_dendro = require('./build_row_dendro');
var build_col_dendro = require('./build_col_dendro');
var change_groups = require('./change_groups');

/* Dendrogram color bar.
 */
module.exports = function Dendrogram(params, type) {
  var dom_class;

  if (type === 'row') {
    dom_class = 'row_class_rect';
    build_row_dendro(params, dom_class);
  } else {
    dom_class = 'col_class_rect';
    build_col_dendro(params, dom_class);
  }

  return {
    change_groups: change_groups
  };
};
