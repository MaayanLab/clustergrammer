function Zoom(params){

  console.log('Zoom')

  /* Functions for zooming. Should be turned into a module.
   * ----------------------------------------------------------------------- */
  function zoomed() {

    // // reset the zoom translate and zoom
    // params.zoom.scale(zoom_y);
    // params.zoom.translate([pan_dx, net_y_offset]);

    var zoom_x = d3.event.scale,
      zoom_y = d3.event.scale,
      trans_x = d3.event.translate[0] - params.viz.clust.margin.left,
      trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

    // apply transformation
    apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y);
  }

  function apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y) {

    var d3_scale = zoom_x;

    // y - rules
    ///////////////////////////////////////////////////
    // available panning room in the y direction
    // multiple extra room (zoom - 1) by the width
    // always defined in the same way
    var pan_room_y = (d3_scale - 1) * params.viz.clust.dim.height;

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
    if (d3_scale < params.viz.zoom_switch) {
      // no x translate or zoom
      trans_x = 0;
      zoom_x = 1;
    }
    // zoom in both directions
    // scale is greater than params.viz.zoom_switch
    else {
      // available panning room in the x direction
      // multiple extra room (zoom - 1) by the width
      var pan_room_x = (d3_scale / params.viz.zoom_switch - 1) * params.viz.clust.dim.width;

      // no panning in the positive direction
      if (trans_x > 0) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = 0;
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      }
      // restrict panning to pan_room_x
      else if (trans_x <= -pan_room_x) {
        // restrict transformation parameters
        // no panning in the x direction
        trans_x = -pan_room_x;
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      }
      // allow two dimensional panning
      else {
        // restrict transformation parameters
        // set zoom_x
        zoom_x = d3_scale / params.viz.zoom_switch;
      }
    }

    // update visible links 
    update_viz_links(params, trans_x, trans_y, zoom_x, zoom_y);
    // down_sample(params);

    // apply transformation and reset translate vector
    // the zoom vector (zoom.scale) never gets reset
    ///////////////////////////////////////////////////
    // translate clustergram
    // viz.get_clust_group()
    d3.select('#clust_group')
      .attr('transform', 'translate(' + [trans_x, trans_y] + ') scale(' +
      zoom_x + ',' + zoom_y + ')');

    // transform row labels
    d3.select('#row_label_zoom_container')
      .attr('transform', 'translate(' + [0, trans_y] + ') scale(' + zoom_y +
      ')');

    // transform row_viz_zoom_container
    // use the offset saved in params, only zoom in the y direction
    d3.select('#row_viz_zoom_container')
      .attr('transform', 'translate(' + [0, trans_y] + ') scale( 1,' +
      zoom_y + ')');

    // transform col labels
    // move down col labels as zooming occurs, subtract trans_x - 20 almost works
    d3.select('#col_label_zoom_container')
      .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
      ')');

    // transform col_class
    d3.select('#col_viz_zoom_container')
      .attr('transform', 'translate(' + [trans_x, 0] + ') scale(' + zoom_x +
      ',1)');

    // reset translate vector - add back margins to trans_x and trans_y
    params.zoom
      .translate([trans_x + params.viz.clust.margin.left, trans_y + params.viz.clust.margin.top
      ]);

    var trans = false;
    constrain_font_size(params, trans);





    // resize label bars if necessary
    ////////////////////////////////////

    if (Utils.has( params.network_data.row_nodes[0], 'value')) {
      d3.selectAll('.row_bars')
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

    if (Utils.has( params.network_data.col_nodes[0], 'value')) {
      d3.selectAll('.col_bars')
        .attr('width', function(d) {
          var inst_value = 0;
          if (d.value > 0){
            inst_value = params.labels.bar_scale_col(d.value)/zoom_x;
          }
          return inst_value;
        })
      }

  }

  function two_translate_zoom(params, pan_dx, pan_dy, fin_zoom) {

    // get parameters
    if (!params.viz.run_trans) {

      // define the commonly used variable half_height
      var half_height = params.viz.clust.dim.height / 2;

      // y pan room, the pan room has to be less than half_height since
      // zooming in on a gene that is near the top of the clustergram also causes
      // panning out of the visible region
      var y_pan_room = half_height / params.viz.zoom_switch;

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
        // pan_dy = half_height - (half_height)/params.viz.zoom_switch

        // if pan_dy is greater than the pan room, then panning has to be restricted
        // start by shifting back up (negative) by half_height/params.viz.zoom_switch then shift back down
        // by the difference between half_height and pan_dy (so that the top of the clustergram is
        // visible)
        var shift_top_viz = half_height - pan_dy;
        var shift_up_viz = -half_height / params.viz.zoom_switch +
          shift_top_viz;

        // reduce pan_dy so that the visualization does not get panned to far down
        pan_dy = pan_dy + shift_up_viz;
      }

      // prevent visualization from panning up too much
      // when zooming into genes at the bottom of the clustergram
      if (pan_dy < -(half_height - y_pan_room)) {

        shift_top_viz = half_height + pan_dy;

        shift_up_viz = half_height / params.viz.zoom_switch - shift_top_viz; //- move_up_one_row;

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

      update_viz_links(params, 0, 0, zoom_x, zoom_y);

      // transform clust group
      ////////////////////////////
      // d3.select('#clust_group')
      viz.get_clust_group()
        .transition().duration(search_duration)
        // first apply the margin transformation
        // then zoom, then apply the final transformation
        .attr('transform', 'translate(' + [0, 0 + center_y] + ')' +
        ' scale(' + 1 + ',' + zoom_y + ')' + 'translate(' + [pan_dx,
          pan_dy
        ] + ')');

      // transform row labels
      d3.select('#row_label_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
        zoom_y + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform row_viz_zoom_container
      // use the offset saved in params, only zoom in the y direction
      d3.select('#row_viz_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
        1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform col labels
      d3.select('#col_label_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // transform col_class
      d3.select('#col_viz_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + 1 + ',' + 1 + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // set y translate: center_y is positive, positive moves the visualization down
      // the translate vector has the initial margin, the first y centering, and pan_dy
      // times the scaling zoom_y
      var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

      // reset the zoom translate and zoom
      params.zoom.scale(zoom_y);
      params.zoom.translate([pan_dx, net_y_offset]);

      var trans = true;
      constrain_font_size(params, trans);

      // re-size of the highlighting rects
      /////////////////////////////////////////
      d3.select('#row_label_zoom_container')
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
            .attr('height', params.matrix.y_scale.rangeBand())
            .style('fill', 'yellow');
        });


      // column value bars
      ///////////////////////
      // reduce the height of the column value bars based on the zoom applied
      // recalculate the height and divide by the zooming scale
      // col_label_obj.select('rect')
      if (Utils.has( params.network_data.col_nodes[0], 'value')) {

        d3.selectAll('.col_bars')
          .transition()
          .duration(search_duration)
          .attr('width', function(d) {
          var inst_value = 0;
          if (d.value > 0){
            inst_value = params.labels.bar_scale_col(d.value)/zoom_x;
          }
          return inst_value;
        })
        }

      if (Utils.has( params.network_data.row_nodes[0], 'value')) {

        d3.selectAll('.row_bars')
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
    }
  }

  function update_viz_links(params, trans_x, trans_y, zoom_x, zoom_y){

    // get translation vector absolute values 
    var buffer = 1;
    var min_x = Math.abs(trans_x)/zoom_x - buffer*params.matrix.x_scale.rangeBand() ;
    var min_y = Math.abs(trans_y)/zoom_y - buffer*params.matrix.y_scale.rangeBand() ;

    var max_x = Math.abs(trans_x)/zoom_x + params.viz.clust.dim.width/zoom_x ;
    // var max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height ; 
    var max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height/zoom_y ; 

    // show the full height of the clustergram if force_square 
    if (params.viz.force_square) {
      max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height;       
    }

    if (min_x < 0){
      min_x = 0;
    }
    if (min_y < 0){
      min_y = 0;  
    }

    // test-filter 
    params.cf.dim_x.filter([min_x,max_x]);
    params.cf.dim_y.filter([min_y,max_y ]);

    // redefine links 
    var inst_links = params.cf.dim_x.top(Infinity);

    d3.selectAll('.tile')
      .data(inst_links, function(d){return d.name;})
      .exit()
      .remove();

    // enter new elements 
    //////////////////////////
    d3.select('#clust_group')
      .selectAll('.tile')
      .data(inst_links, function(d){return d.name;})
      .enter()
      .append('rect')
      .style('fill-opacity',0)
      .attr('class','tile new_tile')
      .attr('width', params.matrix.rect_width)
      .attr('height', params.matrix.rect_height)
      .attr('transform', function(d) {
        return 'translate(' + params.matrix.x_scale(d.target) + ','+params.matrix.y_scale(d.source)+')';
      })
      .style('fill', function(d) {
          return d.value > 0 ? params.matrix.tile_colors[0] : params.matrix.tile_colors[1];
      })
      .style('fill-opacity', function(d) {
          // calculate output opacity using the opacity scale
          var output_opacity = params.matrix.opacity_scale(Math.abs(d.value));
          return output_opacity;
      });

    d3.selectAll('.tile')
      .on('mouseover',null)
      .on('mouseout',null);

    // redefine mouseover events for tiles 
    d3.select('#clust_group')
      .selectAll('.tile')
      .on('mouseover', function(p) {
        var row_name = p.name.split('_')[0];
        var col_name = p.name.split('_')[1];
        // highlight row - set text to active if
        d3.selectAll('.row_label_text text')
          .classed('active', function(d) {
            return row_name === d.name;
          });

        d3.selectAll('.col_label_text text')
          .classed('active', function(d) {
            return col_name === d.name;
          });
      })
      .on('mouseout', function mouseout() {
        d3.selectAll('text').classed('active', false);
      })
      .attr('title', function(d) {
        return d.value;
      });

    // check the number of tiles 
    console.log(d3.selectAll('.tile')[0].length);
    console.log('\n\n')
  }



  function constrain_font_size(params, trans){

    var search_duration = 700;

    var fraction_keep = {};


    var keep_width = {};
    keep_width.row = params.bounding_width_max.row*params.labels.row_keep
      *params.zoom.scale();
    keep_width.col = params.bounding_width_max.col*params.labels.col_keep
      *params.zoom.scale()/params.viz.zoom_switch;

    function normal_name(d){
      var inst_name = d.name.replace(/_/g, ' ').split('#')[0];
      if (inst_name.length > params.labels.max_label_char){
        inst_name = inst_name.substring(0,params.labels.max_label_char)+'..';
      }
      return inst_name;
    }

    if (keep_width.row > params.norm_label.width.row) {

      params.viz.zoom_scale_font.row = params.norm_label.width.row / keep_width.row;

      d3.selectAll('.row_label_text').each(function() {
        if (trans){
          d3.select(this).select('text')
            .transition().duration(search_duration)
            .style('font-size', params.labels.default_fs_row * params.viz.zoom_scale_font.row + 'px')
            .attr('y', params.matrix.y_scale.rangeBand() *
              params.scale_font_offset(params.viz.zoom_scale_font.row));
        } else {
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_row * params.viz.zoom_scale_font.row + 'px')
            .attr('y', params.matrix.y_scale.rangeBand() *
              params.scale_font_offset(params.viz.zoom_scale_font.row))
        }
      });
    } else {
      d3.selectAll('.row_label_text').each(function() {
        if (trans){
          d3.select(this).select('text')
            .transition().duration(search_duration)
            .style('font-size', params.labels.default_fs_row + 'px')
            // .attr('y', params.matrix.y_scale.rangeBand() * 
            //   params.scale_font_offset(params.viz.zoom_scale_font.row))
          d3.select(this).select('text')
            .text(function(d){ return normal_name(d);});

        } else {
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_row + 'px')
            // .attr('y', params.matrix.y_scale.rangeBand() * 
            //   params.scale_font_offset(params.viz.zoom_scale_font.row))
            .text(function(d){ return normal_name(d);});
        }
      });
    }


    if (keep_width.col > params.norm_label.width.col) {

      params.viz.zoom_scale_font.col = params.norm_label.width.col / keep_width.col;

      d3.selectAll('.col_label_click').each(function() {
        if (trans){
          d3.select(this).select('text')
            .transition().duration(search_duration)
            .style('font-size', params.labels.default_fs_col *
              params.viz.zoom_scale_font.col + 'px');
        } else {
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_col *
              params.viz.zoom_scale_font.col + 'px')
        }
      });
    } else {
      d3.selectAll('.col_label_click').each(function() {
        if (trans){
          d3.select(this).select('text')
            .transition().duration(search_duration)
            .style('font-size', params.labels.default_fs_col + 'px');
          d3.select(this).select('text')
            .text(function(d){ return normal_name(d);});
        } else {
          d3.select(this).select('text')
            .style('font-size', params.labels.default_fs_col + 'px')
            .text(function(d){ return normal_name(d);});
        }
      });
    }


    var max_row_width = params.norm_label.width.row;
    var max_col_width = params.norm_label.width.col;

    // constrain text after zooming
    if (params.labels.row_keep < 1){
      d3.selectAll('.row_label_text' ).each(function() { trim_text(this, 'row'); });
    }
    if (params.labels.col_keep < 1){
      d3.selectAll('.col_label_click').each(function() { trim_text(this, 'col'); });
    }

    function trim_text(inst_selection, inst_rc){

      var max_width,
          inst_zoom;

      var safe_row_trim_text = 0.9;

      if (inst_rc === 'row'){
        max_width = params.norm_label.width.row*safe_row_trim_text;
        inst_zoom = params.zoom.scale();
      } else {
        // the column label has extra length since its rotated
        max_width = params.norm_label.width.col;
        inst_zoom = params.zoom.scale()/params.viz.zoom_switch;
      }

      var tmp_width = d3.select(inst_selection).select('text').node().getBBox().width;
      var inst_text = d3.select(inst_selection).select('text').text();
      var actual_width = tmp_width*inst_zoom;

      if (actual_width>max_width){

        var trim_fraction = max_width/actual_width;
        var keep_num_char = Math.floor(inst_text.length*trim_fraction)-3;
        var trimmed_text = inst_text.substring(0,keep_num_char)+'..';
        d3.select(inst_selection).select('text')
          .text(trimmed_text);

      }

    }

  }

  function ini_doubleclick(){

    // disable double-click zoom: double click should reset zoom level
    d3.selectAll('svg').on('dblclick.zoom', null);

    // double click to reset zoom - add transition
    d3.select('#main_svg')
      .on('dblclick', function() {
        // programmatic zoom reset
        two_translate_zoom(params, 0, 0, 1);
      });
  }

  return {
    zoomed : zoomed,
    two_translate_zoom : two_translate_zoom,
    ini_doubleclick : ini_doubleclick
  }
}