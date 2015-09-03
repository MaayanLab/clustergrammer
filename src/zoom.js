function Zoom(){

  /* Functions for zooming. Should be turned into a module.
   * ----------------------------------------------------------------------- */
  function zoomed() {

    var zoom_x = d3.event.scale,
      zoom_y = d3.event.scale,
      trans_x = d3.event.translate[0] - globals.params.clust.margin.left,
      trans_y = d3.event.translate[1] - globals.params.clust.margin.top;

    // apply transformation
    apply_transformation(trans_x, trans_y, zoom_x, zoom_y);  
  }

  function apply_transformation(trans_x, trans_y, zoom_x, zoom_y) {

    var params = globals.params;
    var d3_scale = zoom_x;

    // y - rules
    ///////////////////////////////////////////////////
    // available panning room in the y direction
    // multiple extra room (zoom - 1) by the width
    // always defined in the same way
    var pan_room_y = (d3_scale - 1) * params.clust.dim.height;

    // do not translate if translate in y direction is positive
    if (trans_y >= 0) {
      // restrict transformation parameters
      // no panning in either direction
      trans_y = 0;
    }
    // restrict y pan to pan_room_y if necessary
    else if (trans_y <= -pan_room_y) {
      trans_y = -pan_room_y;
    }

    // x - rules
    ///////////////////////////////////////////////////
    // zoom in y direction only - translate in y only
    if (d3_scale < params.zoom_switch) {
      // no x translate or zoom
      trans_x = 0;
      zoom_x = 1;
    }
    // zoom in both directions
    // scale is greater than params.zoom_switch
    else {
      // available panning room in the x direction
      // multiple extra room (zoom - 1) by the width
      var pan_room_x = (d3_scale / params.zoom_switch - 1) * params.clust.dim.width;

      // no panning in the positive direction
      if (trans_x > 0) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = 0;
        // set zoom_x
        zoom_x = d3_scale / params.zoom_switch;
      }
      // restrict panning to pan_room_x
      else if (trans_x <= -pan_room_x) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = -pan_room_x;
        // set zoom_x
        zoom_x = d3_scale / params.zoom_switch;
      }
      // allow two dimensional panning
      else {
        // restrict transformation parameters
        // set zoom_x
        zoom_x = d3_scale / params.zoom_switch;
      }
    }

    // apply transformation and reset translate vector
    // the zoom vector (zoom.scale) never gets reset
    ///////////////////////////////////////////////////
    // translate clustergram
    // d3.select('#clust_group')
    viz.get_clust_group()
      .attr('transform', 'translate(' + [trans_x, trans_y] + ') scale(' +
      zoom_x + ',' + zoom_y + ')');

    // transform row labels
    d3.select('#row_labels')
      .attr('transform', 'translate(' + [0, trans_y] + ') scale(' + zoom_y +
      ')');

    // transform row_label_triangles
    // use the offset saved in params, only zoom in the y direction
    d3.select('#row_label_triangles')
      .attr('transform', 'translate(' + [0, trans_y] + ') scale( 1,' +
      zoom_y + ')');

    // transform col labels
    // move down col labels as zooming occurs, subtract trans_x - 20 almost works
    d3.select('#col_labels')
      .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
      ')');

    // transform col_class
    d3.select('#col_class')
      .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
      ',1)');

    // reset translate vector - add back margins to trans_x and trans_y
    params.zoom
      .translate([trans_x + params.clust.margin.left, trans_y + params.clust
        .margin.top
      ]);

   
    // check if widest row or col are wider than the allowed label width
    ////////////////////////////////////////////////////////////////////////

    if (params.bounding_width_max.row * params.zoom.scale() > params.norm_label.width.row) {
      params.zoom_scale_font.row = params.norm_label.width.row / (params.bounding_width_max
          .row * params.zoom.scale());

      // reduce font size
      d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_row * params.zoom_scale_font.row + 'px')
          .attr('y', params.y_scale.rangeBand() * params.scale_font_offset(
            params.zoom_scale_font.row));
      });

    } else {
      // reset font size
      d3.selectAll('.row_label_text').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_row + 'px')
          .attr('y', params.y_scale.rangeBand() * 0.75);
      });
    }

    if (params.bounding_width_max.col * (params.zoom.scale() / params.zoom_switch) >
      params.norm_label.width.col) {
      params.zoom_scale_font.col = params.norm_label.width.col / (params.bounding_width_max
          .col * (params.zoom.scale() / params.zoom_switch));

      // reduce font size
      d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_col * params.zoom_scale_font
            .col + 'px');
      });

    } else {
      // reset font size
      d3.selectAll('.col_label_click').each(function() {
        d3.select(this).select('text')
          .style('font-size', params.default_fs_col + 'px');
      });
    }


    // column value bars
    ///////////////////////

    if (Utils.has(globals.network_data.col_nodes[0], 'value')) {
      d3.selectAll('.col_bars')
        // column is rotated - effectively width and height are switched
        .attr('width', function(d) {
          return params.bar_scale_col(d.value) / (zoom_x);
        });
    }

    // //!! change the size of the highlighting rects
    // //////////////////////////////////////////////
    // // re-size of the highlighting rects
    // d3.select('#row_labels')
    //   .each(function(){
    //   // get the bounding box of the row label text
    //   var bbox = d3.select(this)
    //          .select('text')[0][0]
    //          .getBBox();
    //   // use the bounding box to set the size of the rect
    //   d3.select(this)
    //     .select('rect')
    //   .attr('x', bbox.x*0.5)
    //   .attr('y', 0)
    //   .attr('width', bbox.width*0.5)
    //   .attr('height', params.y_scale.rangeBand())
    //   .style('fill','yellow');
    // });

    // // col_label_click
    // d3.select('#col_labels')
    //   .each(function(){
    //   // get the bounding box of the row label text
    //   var bbox = d3.select(this)
    //          .select('text')[0][0]
    //          .getBBox();
    //   // use the bounding box to set the size of the rect
    //   d3.select(this)
    //     .select('rect')
    //   .attr('x', bbox.x*1.25)
    //   .attr('y', 0)
    //   .attr('width', bbox.width * 1.25)
    //   // used thd reduced rect width for the columsn
    //   // reduced because thee rects are slanted
    //   .attr('height', params.x_scale.rangeBand()*0.6)
    //   .style('fill','yellow')
    //   .style('opacity',0);
    //   });
  }

  function two_translate_zoom(pan_dx, pan_dy, fin_zoom) {

    // get parameters
    var params = globals.params;

    if (!globals.params.run_trans) {

      // define the commonly used variable half_height
      var half_height = params.clust.dim.height / 2;

      // y pan room, the pan room has to be less than half_height since
      // zooming in on a gene that is near the top of the clustergram also causes
      // panning out of the visible region
      var y_pan_room = half_height / params.zoom_switch;

      // prevent visualization from panning down too much
      // when zooming into genes near the top of the clustergram
      if (pan_dy >= half_height - y_pan_room) {

        // explanation of panning rules
        /////////////////////////////////
        // prevent the clustergram from panning down too much
        // if the amount of panning is equal to the half_height then it needs to be reduced
        // effectively, the the visualization needs to be moved up (negative) by some factor
        // of the half-width-of-the-visualization.
        //
        // If there was no zooming involved, then the
        // visualization would be centered first, then panned to center the top term
        // this would require a
        // correction to re-center it. However, because of the zooming the offset is
        // reduced by the zoom factor (this is because the panning is occurring on something
        // that will be zoomed into - this is why the pan_dy value is not scaled in the two
        // translate transformations, but it has to be scaled afterwards to set the translate
        // vector)
        // pan_dy = half_height - (half_height)/params.zoom_switch

        // if pan_dy is greater than the pan room, then panning has to be restricted
        // start by shifting back up (negative) by half_height/params.zoom_switch then shift back down
        // by the difference between half_height and pan_dy (so that the top of the clustergram is
        // visible)
        var shift_top_viz = half_height - pan_dy;
        var shift_up_viz = -half_height / params.zoom_switch +
          shift_top_viz;

        // reduce pan_dy so that the visualization does not get panned to far down
        pan_dy = pan_dy + shift_up_viz;
      }

      // prevent visualization from panning up too much
      // when zooming into genes at the bottom of the clustergram
      if (pan_dy < -(half_height - y_pan_room)) {

        // console.log('restricting pan up')
        shift_top_viz = half_height + pan_dy;

        shift_up_viz = half_height / params.zoom_switch - shift_top_viz; //- move_up_one_row;

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
      // d3.select('#clust_group')
      viz.get_clust_group()
        .transition()
        .duration(search_duration)
        // first apply the margin transformation
        // then zoom, then apply the final transformation
        .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
        ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,
          pan_dy
        ] + ')');

      // transform row labels
      d3.select('#row_labels')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
        zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform row_label_triangles
      // use the offset saved in params, only zoom in the y direction
      d3.select('#row_label_triangles')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
        1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform col labels
      d3.select('#col_labels')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // transform col_class
      d3.select('#col_class')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // set y translate: center_y is positive, positive moves the visualization down
      // the translate vector has the initial margin, the first y centering, and pan_dy
      // times the scaling zoom_y
      var net_y_offset = params.clust.margin.top + center_y + pan_dy *
        zoom_y;

      // reset the zoom translate and zoom
      params.zoom.scale(zoom_y);
      params.zoom.translate([pan_dx, net_y_offset]);

      // check if widest row or col are wider than the allowed label width
      ////////////////////////////////////////////////////////////////////////

      if (params.bounding_width_max.row * params.zoom.scale() > params.norm_label
          .width.row) {
        params.zoom_scale_font.row = params.norm_label.width.row / (params.bounding_width_max
            .row * params.zoom.scale());

        // reduce font size
        d3.selectAll('.row_label_text').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.default_fs_row * params.zoom_scale_font
              .row + 'px')
            .attr('y', params.y_scale.rangeBand() * params.scale_font_offset(
              params.zoom_scale_font.row));
        });

      } else {
        // reset font size
        d3.selectAll('.row_label_text').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.default_fs_row + 'px')
            .attr('y', params.y_scale.rangeBand() * 0.75);
        });
      }

      if (params.bounding_width_max.col * (params.zoom.scale() / params.zoom_switch) >
        params.norm_label.width.col) {
        params.zoom_scale_font.col = params.norm_label.width.col / (params.bounding_width_max
            .col * (params.zoom.scale() / params.zoom_switch));

        // reduce font size
        d3.selectAll('.col_label_click').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.default_fs_col * params.zoom_scale_font
              .col + 'px');
        });

      } else {
        // reset font size
        d3.selectAll('.col_label_click').each(function() {
          d3.select(this).select('text')
            .transition()
            .duration(search_duration)
            .style('font-size', params.default_fs_col + 'px');
        });
      }

      // re-size of the highlighting rects
      /////////////////////////////////////////
      d3.select('#row_labels')
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
            .attr('height', params.y_scale.rangeBand())
            .style('fill', 'yellow');
        });


      // column value bars
      ///////////////////////
      // reduce the height of the column value bars based on the zoom applied
      // recalculate the height and divide by the zooming scale
      // col_label_obj.select('rect')
      if (Utils.has(globals.network_data.col_nodes[0], 'value')) {
        d3.selectAll('.col_bars')
          .transition()
          .duration(search_duration)
          // column is rotated - effectively width and height are switched
          .attr('width', function(d) {
            return params.bar_scale_col(d.value) / (zoom_x);
          });
      }
    }
  }

  return {
    zoomed:zoomed,
    two_translate_zoom:two_translate_zoom
  }
}