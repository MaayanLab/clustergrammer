var utils = require('../Utils_clust');
var label_constrain_and_trim = require('../labels/label_constrain_and_trim');
var show_visible_area = require('./show_visible_area');
var ini_zoom_info = require('../zoom/ini_zoom_info');
var toggle_grid_lines = require('../matrix/toggle_grid_lines');
var underscore = require('underscore');

module.exports = function two_translate_zoom(cgm, pan_dx, pan_dy, fin_zoom) {

  // console.log('pan_dy: ' + String(pan_dy))

  var params = cgm.params;

  d3.selectAll(params.viz.root_tips)
    .style('display','none');

  params.zoom_info = ini_zoom_info();

  show_visible_area(cgm);

  // do not allow while transitioning, e.g. reordering
  if (!params.viz.run_trans) {

    // define the commonly used variable half_height
    var half_height = params.viz.clust.dim.height / 2;

    // y pan room, the pan room has to be less than half_height since
    // zooming in on a gene that is near the top of the clustergram also causes
    // panning out of the visible region
    var y_pan_room = half_height / fin_zoom;

    // prevent visualization from panning down too much
    // when zooming into genes near the top of the clustergram
    if (pan_dy >= half_height - y_pan_room) {

      // console.log(' prevent visualization from panning down too much')

      // explanation of panning rules
      /////////////////////////////////
      /*
        prevent the clustergram from panning down too much
        if the amount of panning is equal to the half_height then it needs to be reduced
        effectively, the the visualization needs to be moved up (negative) by some factor
        of the half-width-of-the-visualization.

        If there was no zooming involved, then the
        visualization would be centered first, then panned to center the top term
        this would require a
        correction to re-center it. However, because of the zooming the offset is
        reduced by the zoom factor (this is because the panning is occurring on something
        that will be zoomed into - this is why the pan_dy value is not scaled in the two
        translate transformations, but it has to be scaled afterwards to set the translate
        vector)
        pan_dy = half_height - (half_height)/fin_zoom

        if pan_dy is greater than the pan room, then panning has to be restricted
        start by shifting back up (negative) by half_height/fin_zoom then shift back down
        by the difference between half_height and pan_dy (so that the top of the clustergram is
        visible)
      */

      var shift_top_viz = half_height - pan_dy;
      var shift_up_viz = -half_height / fin_zoom +
        shift_top_viz;

      // reduce pan_dy so that the visualization does not get panned to far down
      pan_dy = pan_dy + shift_up_viz;

    }

    // prevent visualization from panning up too much
    // when zooming into genes at the bottom of the clustergram
    if (pan_dy < -(half_height - y_pan_room)) {

      shift_top_viz = half_height + pan_dy;

      shift_up_viz = half_height / fin_zoom - shift_top_viz; //- move_up_one_row;

      // reduce pan_dy so that the visualization does not get panned to far down
      pan_dy = pan_dy + shift_up_viz;

    }

    // will improve this !!
    var zoom_y = fin_zoom;
    var zoom_x = 1;

    // search duration - the duration of zooming and panning
    var search_duration = 700;

    // center_y
    var center_y = -(zoom_y - 1) * half_height;

    // transform clust group
    ////////////////////////////
    d3.select(params.root+' .clust_group')
      .transition().duration(search_duration)
      // first apply the margin transformation
      // then zoom, then apply the final transformation
      .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
      ' scale(' + zoom_x + ',' + zoom_y + ')' + 'translate(' + [pan_dx,
        pan_dy
      ] + ')');

    // transform row labels
    d3.select(params.root+' .row_label_zoom_container')
      .transition()
      .duration(search_duration)
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
      zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

    // transform row_cat_container
    // use the offset saved in params, only zoom in the y direction
    d3.select(params.root+' .row_cat_container')
      .transition()
      .duration(search_duration)
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
      1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

    d3.select(params.root+' .row_dendro_container')
      .transition()
      .duration(search_duration)
      .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' + zoom_x + ',' + zoom_y + ')' + 'translate(' + [params.viz.uni_margin/2, pan_dy] + ')');


    // toggle crop buttons
    var inst_button_opacity;
    underscore.each(['row','col'], function(inst_rc){

      inst_button_opacity = d3.select(params.root+' .'+inst_rc+'_dendro_crop_buttons')
                                  .style('opacity');
      d3.selectAll(params.root+' .'+inst_rc+'_dendro_crop_buttons')
        .style('opacity',0);
      setTimeout(show_crop_buttons, 700, inst_rc, inst_button_opacity);

    });

    // transform col labels
    d3.select(params.root+' .col_zoom_container')
      .transition()
      .duration(search_duration)
      .attr('transform', ' scale(' + zoom_x + ',' + zoom_x + ')' + 'translate(' + [
        pan_dx, 0
      ] + ')');

    // transform col_class
    d3.select(params.root+' .col_cat_container')
      .transition()
      .duration(search_duration)
      .attr('transform', ' scale(' + zoom_x + ',' + 1 + ')' + 'translate(' + [
        pan_dx, 0 ] + ')');

    d3.select(params.root+' .col_dendro_container')
      .transition()
      .duration(search_duration)
      .attr('transform', ' scale(' + zoom_x + ',' + 1 + ')' + 'translate(' + [
        pan_dx, params.viz.uni_margin/2 ] + ')');

    // set y translate: center_y is positive, positive moves the visualization down
    // the translate vector has the initial margin, the first y centering, and pan_dy
    // times the scaling zoom_y
    var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;
    var net_x_offset = params.viz.clust.margin.left + pan_dx;

    // reset the zoom and translate
    params.zoom_behavior
      .scale(zoom_y)
      .translate([net_x_offset, net_y_offset]);

    label_constrain_and_trim(params);

    // re-size of the highlighting rects
    /////////////////////////////////////////
    if (d3.select(params.root+' .row_label_zoom_container text').empty() === false){
      d3.select(params.root+' .row_label_zoom_container')
        .each(function() {
          // get the bounding box of the row label text
          var bbox = d3.select(this)
            .select('text')[0][0]
            .getBBox();

          // use the bounding box to set the size of the rect
          d3.select(this)
            .select('rect')
            .attr('x', bbox.x * 0.5)
            .attr('y', 0)
            .attr('width', bbox.width * 0.5)
            .attr('height', params.viz.y_scale.rangeBand())
            .style('fill', 'yellow');
        });
    }

    // reset crop button zooming
    d3.select(params.root+' .row_dendro_icons_group')
      .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
      ' scale(' + zoom_x + ',' + zoom_y + ')' + 'translate(' + [pan_dx,
        pan_dy
      ] + ')');

    d3.select(params.root+' .row_dendro_icons_group')
      .selectAll('path')
      .attr('transform', function(d){
        var inst_x = params.viz.uni_margin;
        var inst_y = d.pos_mid;
        return 'translate('+ inst_x +',' + inst_y + ') ' + 'scale(1, '+ 1/zoom_y +')';
      });

    // console.log('zooming x and y')
    // console.log(zoom_x)
    // console.log(zoom_y)

    // need to improve behavior
    d3.select(params.root+' .col_dendro_icons_group')
      .attr('transform', function(){
        var inst_trans =
                         // 'translate(' + [0, 0 + center_y] + ')' +
                         ' scale(' + zoom_x + ',' + zoom_y + ')';
                         // + 'translate(' + [pan_dx, pan_dy ] + ')';
        return inst_trans;
      });

    d3.select(params.root+' .col_dendro_icons_group')
      .selectAll('path')
      .attr('transform', function(d){
        var inst_x = d.pos_mid;
        var inst_y = params.viz.uni_margin;
        // return 'translate('+ inst_x +',' + inst_y + ') ' + 'scale('+1/zoom_x+',1)';
        return 'translate('+ inst_x +',' + inst_y + ') ' + 'scale(1,1)';
      });

    // column value bars
    ///////////////////////
    // reduce the height of the column value bars based on the zoom applied
    // recalculate the height and divide by the zooming scale
    // col_label_obj.select('rect')
    if (utils.has(params.network_data.col_nodes[0], 'value')) {

      d3.selectAll(params.root+' .col_bars')
        .attr('width', function(d) {
        var inst_value = 0;
        if (d.value > 0){
          inst_value = params.labels.bar_scale_col(d.value)/zoom_x;
        }
        return inst_value;
      });
    }

    if (utils.has(params.network_data.row_nodes[0], 'value')) {

      d3.selectAll(params.root+' .row_bars')
        .transition()
        .duration(search_duration)
        .attr('width', function(d) {
        var inst_value = 0;
        inst_value = params.labels.bar_scale_row(Math.abs(d.value))/zoom_y;
        return inst_value;
      })
      .attr('x', function(d) {
        var inst_value = 0;
        inst_value = -params.labels.bar_scale_row(Math.abs(d.value))/zoom_y;
        return inst_value;
      });

    }

    toggle_grid_lines(params);

  }

  function show_crop_buttons(inst_rc, inst_button_opacity){
    d3.selectAll(params.root+' .'+inst_rc+'_dendro_crop_buttons')
      .transition()
      .duration(search_duration)
      .style('opacity', inst_button_opacity);
  }

};
