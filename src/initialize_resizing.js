var parent_div_size = require('./parent_div_size'); 
var reset_visualization_size = require('./reset_size/reset_visualization_size');

module.exports = function(params) {

  var exp_button;

  d3.select(window).on('resize', null);

  // resize window
  if (params.viz.resize) {
    d3.select(window).on('resize', function () {
      d3.select(params.viz.viz_svg).style('opacity', 0.5);
      var wait_time = 500;
      if (params.viz.run_trans == true) {
        wait_time = 2500;
      }
      setTimeout(reset_visualization_size, wait_time, params);
    });
  }

  if (params.viz.expand_button) {

    d3.select(params.root + ' .expand_button').on('click', null);
    var expand_opacity = 0.4;

    if (d3.select(params.root + ' .expand_button').empty()) {
      exp_button = d3.select(params.viz.viz_svg)
        .append('text')
        .attr('class', 'expand_button');
    } else {
      exp_button = d3.select(params.root + ' .expand_button');
    }

    exp_button
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-family', 'FontAwesome')
      .attr('font-size', '30px')
      .text(function () {
        if (params.viz.expand === false) {
          // expand button
          return '\uf0b2';
        } else {
          // menu button
          return '\uf0c9';
        }
      })
      .attr('y', '25px')
      .attr('x', '25px')
      .style('cursor', 'pointer')
      .style('opacity', expand_opacity)
      .on('mouseover', function () {
        d3.select(this).style('opacity', 0.75);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', expand_opacity);
      })
      .on('click', function () {

        // expand view
        if (params.viz.expand === false) {

          d3.select(this)
            .text(function() {
              // menu button
              return '\uf0c9';
            });
          params.viz.expand = true;

          d3.selectAll('.borders').style('fill', 'white');
          d3.select('.footer_section').style('display', 'none');

          // contract view
        } else {

          d3.select(this)
            .text(function () {
              // expand button
              return '\uf0b2';
            });
          params.viz.expand = false;

          d3.selectAll('.borders').style('fill', '#eee');
          d3.select('.footer_section').style('display', 'block');
        }

        // resize parent div
        parent_div_size(params);

        d3.select(params.viz.viz_svg).style('opacity', 0.5);
        var wait_time = 500;
        if (params.viz.run_trans == true) {
          wait_time = 2500;
        }
        setTimeout(reset_visualization_size, wait_time, params);
      });
  }
};
