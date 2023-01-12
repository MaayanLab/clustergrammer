var d3 = require('d3');

module.exports = function update_reorder_buttons(tmp_config, params) {
  ['row', 'col'].forEach(function (inst_rc) {
    var other_rc;
    if (inst_rc === 'row') {
      other_rc = 'col';
    } else {
      other_rc = 'row';
    }

    d3.selectAll(params.root + ' .toggle_' + other_rc + '_order .btn')
      .filter(function () {
        return d3.select(this).attr('name') === tmp_config.inst_order[inst_rc];
      })
      .classed('active', true);
  });
};
