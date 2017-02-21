var resize_viz = require('./reset_size/resize_viz');

module.exports = function initialize_resizing(cgm) {

  var params = cgm.params;

  var exp_button;

  // d3.select(window).on('resize', null);

  // // resize window
  // if (params.viz.resize) {
  //   d3.select(window).on('resize', function () {

  //     d3.select(params.viz.viz_svg).style('opacity', 0.5);

  //     var wait_time = 500;
  //     if (params.viz.run_trans === true) {
  //       wait_time = 2500;
  //     }

  //     setTimeout(resize_viz, wait_time, params);
  //   });
  // }

  // if (params.viz.expand_button) {

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
        if (params.viz.is_expand === false) {
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
        if (params.viz.is_expand === false) {

          d3.select(this)
            .text(function() {
              // menu button
              return '\uf0c9';
            });
          params.viz.is_expand = true;

          d3.selectAll(params.root+' .borders').style('fill', 'white');
          // d3.select(params.root+' .footer_section').style('display', 'none');
          d3.select(params.root+' .sidebar_wrapper')
            .style('display','none');

        // contract view
        } else {

          d3.select(this)
            .text(function () {
              // expand button
              return '\uf0b2';
            });

          params.viz.is_expand = false;

          d3.selectAll(params.root+' .borders').style('fill', '#eee');
          // d3.select(params.root+' .footer_section').style('display', 'block');
          d3.select(params.root+' .viz_wrapper').style('width','100px');
          d3.select(params.root+' .sidebar_wrapper')
            .style('display','block');
        }

        // // resize parent div
        // set_viz_wrapper_size(params);

        d3.select(params.viz.viz_svg).style('opacity', 0.5);
        var wait_time = 500;
        if (params.viz.run_trans == true) {
          wait_time = 2500;
        }
        setTimeout(resize_viz, wait_time, cgm);
      });
  // }
};
