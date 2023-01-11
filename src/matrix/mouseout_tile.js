var d3 = require('d3');

module.exports = function mouseout_tile(params, inst_selection, tip) {
  d3.select(inst_selection).classed('hovering', false);
  d3.selectAll(params.viz.root_tips + '_tile_tip').style('display', 'none');
  ['row', 'col'].forEach(function (inst_rc) {
    d3.selectAll(params.root + ' .' + inst_rc + '_label_group text').style(
      'font-weight',
      'normal'
    );
  });
  dispatchEvent(
    new CustomEvent('TILE_MOUSEOUT', {
      detail: inst_selection.__data__
    })
  );
};
