module.exports = function make_row_tooltips(params) {
  if (params.labels.show_label_tooltips) {
    d3.select(params.root + ' .row_label_zoom_container')
      .selectAll('g')
      .on('mouseover', function (d) {
        dispatchEvent(
          new CustomEvent('ROW_MOUSEOVER', {
            detail: d
          })
        );
      })
      .on('mouseout', function mouseout(d) {
        dispatchEvent(
          new CustomEvent('ROW_MOUSEOUT', {
            detail: d
          })
        );
      });
  } else {
    d3.select(params.root + ' .row_label_zoom_container')
      .selectAll('g')
      .on('mouseover', function () {
        d3.select(this).select('text').classed('active', true);
      })
      .on('mouseout', function mouseout() {
        d3.select(this).select('text').classed('active', false);
      });
  }
};
