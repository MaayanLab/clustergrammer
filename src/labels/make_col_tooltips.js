module.exports = function make_col_tooltips(params) {
  if (params.labels.show_label_tooltips) {
    d3.select(params.root + ' .col_zoom_container')
      .selectAll('.col_label_group')
      .on('mouseover', function (d) {
        dispatchEvent(
          new CustomEvent('COL_MOUSEOVER', {
            detail: d
          })
        );
      })
      .on('mouseout', function (d) {
        dispatchEvent(
          new CustomEvent('COL_MOUSEOUT', {
            detail: d
          })
        );
      });
  }
};
