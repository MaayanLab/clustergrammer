function Zoom(params){

  /* Functions for zooming. Should be turned into a module.
   * ----------------------------------------------------------------------- */
  function zoomed() {

    var zoom_x = d3.event.scale,
      zoom_y = d3.event.scale,
      trans_x = d3.event.translate[0] - params.viz.clust.margin.left,
      trans_y = d3.event.translate[1] - params.viz.clust.margin.top;

    apply_transformation(params, trans_x, trans_y, zoom_x, zoom_y);
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
      var zoom_x;
      if (fin_zoom <= params.viz.zoom_switch){
        var zoom_x = 1;
      } else {
        var zoom_x = fin_zoom/params.viz.zoom_switch;
      }

      // search duration - the duration of zooming and panning
      var search_duration = 700;

      // center_y
      var center_y = -(zoom_y - 1) * half_height;

      // transform clust group
      ////////////////////////////
      viz.get_clust_group()
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

      // transform row_zoom_container
      // use the offset saved in params, only zoom in the y direction
      d3.select(params.root+' .row_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', 'translate(' + [0, center_y] + ')' + ' scale(' +
        1 + ',' + zoom_y + ')' + 'translate(' + [0, pan_dy] + ')');

      // transform col labels
      d3.select(params.root+' .col_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + zoom_x + ',' + zoom_x + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // transform col_class
      d3.select('.col_viz_zoom_container')
        .transition()
        .duration(search_duration)
        .attr('transform', ' scale(' + zoom_x + ',' + 1 + ')' + 'translate(' + [
          pan_dx, 0
        ] + ')');

      // set y translate: center_y is positive, positive moves the visualization down
      // the translate vector has the initial margin, the first y centering, and pan_dy
      // times the scaling zoom_y
      var net_y_offset = params.viz.clust.margin.top + center_y + pan_dy * zoom_y;

      // reset the zoom translate and zoom
      params.zoom_behavior.scale(zoom_y);

      var trans = true;
      constrain_font_size(params, trans);

      // re-size of the highlighting rects
      /////////////////////////////////////////
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
          // .transition()
          // .duration(search_duration)
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

  function update_viz_links(params, trans_x, trans_y, zoom_x, zoom_y, trans){

    // get translation vector absolute values 
    var buffer = 1;
    var min_x = Math.abs(trans_x)/zoom_x - buffer*params.matrix.x_scale.rangeBand() ;
    var min_y = Math.abs(trans_y)/zoom_y - buffer*params.matrix.y_scale.rangeBand() ;

    var max_x = Math.abs(trans_x)/zoom_x + params.viz.clust.dim.width/zoom_x ;
    // var max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height ; 
    var max_y = Math.abs(trans_y)/zoom_y + params.viz.clust.dim.height/zoom_y ; 

    // show the full height of the clustergram if force_square 
    if (params.viz.force_square || trans) {
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
    params.cf.dim_y.filter([min_y,max_y]);

    // redefine links 
    var inst_links = params.cf.dim_x.top(Infinity);

    return inst_links;
  }



  function ini_doubleclick(params){

    // disable double-click zoom
    d3.selectAll(params.viz.viz_svg).on('dblclick.zoom', null);

    d3.select(params.viz.viz_svg)
      .on('dblclick', function() {
        two_translate_zoom(params, 0, 0, 1);
      });
  }

  return {
    zoomed : zoomed,
    two_translate_zoom : two_translate_zoom,
    ini_doubleclick : ini_doubleclick
  }
}