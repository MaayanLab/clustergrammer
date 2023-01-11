var d3 = require('d3');

module.exports = function mouseover_tile(
  params,
  inst_selection,
  tip,
  inst_arguments
) {
  var inst_data = inst_arguments[0];
  d3.select(inst_selection).classed('hovering', true);
  ['row', 'col'].forEach(function (inst_rc) {
    d3.selectAll(params.root + ' .' + inst_rc + '_label_group text').style(
      'font-weight',
      function (d) {
        var font_weight;
        var inst_found =
          (inst_data[inst_rc + '_name'] || '').replace(/_/g, ' ') === d.name;
        if (inst_found) {
          font_weight = 'bold';
        } else {
          font_weight = 'normal';
        }
        return font_weight;
      }
    );
  });
  dispatchEvent(
    new CustomEvent('TILE_MOUSEOVER', {
      detail: {
        tile: inst_data,
        rect: inst_selection.getBoundingClientRect()
      }
    })
  );
};
