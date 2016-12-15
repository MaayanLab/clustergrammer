var two_translate_zoom = require('../zoom/two_translate_zoom');

/* Handles searching rows or columns.
 TODO need to generalize to column and row
 * ----------------------------------------------------------------------- */
module.exports = function(cgm, nodes, prop) {

  // /* Collect entities from row or columns.
  //  */
  // var entities = [];
  // var i;

  // for (i = 0; i < nodes.length; i++) {
  //   entities.push(nodes[i][prop]);
  // }

  // /* Find a gene (row) in the clustergram.
  //  */
  // function find_entity(search_term) {

  //   if (entities.indexOf(search_term) !== -1) {

  //     console.log(cgm)
  //     console.log(cgm.params.root)

  //     // unhighlight
  //     d3.selectAll(cgm.params.root+' .row_label_group')
  //       .select('rect').style('opacity', 0);

  //     // calc pan_dy
  //     var idx = _.indexOf(entities, search_term);
  //     var inst_y_pos = cgm.params.viz.y_scale(idx);
  //     var pan_dy = cgm.params.viz.clust.dim.height / 2 - inst_y_pos;

  //     two_translate_zoom(cgm.params, 0, pan_dy, cgm.params.viz.zoom_switch);

  //     // highlight
  //     d3.selectAll(cgm.params.root+' .row_label_group')
  //       .filter(function(d) {
  //         return d[prop] === search_term;
  //       })
  //       .select('rect')
  //       .style('opacity', 1);
  //   }
  // }

  // return {
  //   find_entity: find_entity
  //   // get_entities: entities
  // };
};
