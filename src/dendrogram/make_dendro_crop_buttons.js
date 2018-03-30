var calc_row_dendro_triangles = require('./calc_row_dendro_triangles');
var calc_col_dendro_triangles = require('./calc_col_dendro_triangles');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var dendro_group_highlight = require('./dendro_group_highlight');
var run_dendro_filter = require('./run_dendro_filter');
var zoom_crop_triangles = require('../zoom/zoom_crop_triangles');

module.exports = function make_dendro_crop_buttons(cgm, inst_rc){

  var params = cgm.params;

  var button_opacity = params.viz.dendro_opacity * 0.60;

  // information needed to make dendro
  var dendro_info;
  var other_rc;
  if (inst_rc === 'row'){
    dendro_info = calc_row_dendro_triangles(params);
    other_rc = 'col';
  } else {
    dendro_info = calc_col_dendro_triangles(params);
    other_rc = 'row';
  }

  // d3-tooltip
  var tmp_y_offset = 5;
  var tmp_x_offset = -5;
  var dendro_crop_tip = d3_tip_custom()
    .attr('class',function(){
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + ' d3-tip ' +
                         root_tip_selector +  '_'+ inst_rc +'_dendro_crop_tip';

      return class_string;
    })
    .direction('nw')
    .style('display', 'none')
    .offset([tmp_y_offset, tmp_x_offset]);

  var wait_before_tooltip = 500;

  d3.selectAll( params.viz.root_tips + '_'+ inst_rc +'_dendro_crop_tip').remove();
  d3.selectAll(params.root+' .'+ inst_rc +'_dendro_crop_buttons').remove();

  var icons;
  // position triangles
  var start_x;
  var start_y;
  var mid_x;
  var mid_y;
  var final_x;
  var final_y;

  // need to improve to account for zooming
  var min_tri_height = 45;
  var scale_down_tri = 0.25;
  var tri_height;
  var tri_width;
  var tri_dim;

  // make crop buttons or undo buttons
  var button_class = inst_rc + '_dendro_crop_buttons';
  if (d3.select(cgm.params.root+' .'+inst_rc+'_dendro_icons_group').classed('ran_filter') === false){

    // Crop Triangle
    //////////////////////////////
    icons = d3.select(params.root+' .'+inst_rc+'_dendro_icons_group')
      .selectAll('path')
      .data(dendro_info, function(d){return d.name;})
      .enter()
      .append('path')
      .classed(button_class, true)
      .attr('d', function(d) {

        // redefine
        tri_height = 10;
        tri_width = 10;

        var tmp_height = d.pos_bot - d.pos_top;

        // Row Dendrogram Crop Triangle
        if (inst_rc === 'row'){

          if (tmp_height < min_tri_height){
            tri_height = tmp_height * scale_down_tri;
          }

          // pointing left
          start_x = tri_width ;
          start_y = -tri_height;
          mid_x = 0;
          mid_y = 0;
          final_x = tri_width;
          final_y = tri_height;

          tri_dim = tri_height;

        // Column Dendrogram Crop Triangle
        } else {

          if (tmp_height < min_tri_height){
            tri_width = tmp_height * scale_down_tri;
          }

          // pointing upward
          start_x = -tri_width ;
          start_y = tri_height;
          mid_x = 0;
          mid_y = 0;
          final_x = tri_width;
          final_y = tri_height;

          tri_dim = tri_width;

        }

        // save triangle height
        // d3.select(this)[0][0].__data__.tri_dim = tri_dim;
        var data_key = '__data__';
        d3.select(this)[0][0][data_key].tri_dim = tri_dim;

        var output_string = 'M' + start_x + ',' + start_y + ' L' +
        mid_x + ', ' + mid_y + ' L'
        + final_x + ','+ final_y +' Z';

        return output_string;
      });

      dendro_crop_tip
        .html(function(){
          var full_string = 'Click to crop cluster';
          return full_string;
        });

  } else {

    // Undo Triangle
    //////////////////////////////
    icons = d3.select(params.root+' .'+inst_rc+'_dendro_icons_group')
      .selectAll('path')
      .data(dendro_info, function(d){return d.name;})
      .enter()
      .append('path')
      .classed(button_class, true)
      .attr('d', function(d) {

        // redefine
        tri_height = 10;
        tri_width = 12;

        var tmp_height = d.pos_bot - d.pos_top;

        if (inst_rc === 'row'){

          if (tmp_height < min_tri_height){
            tri_height = tmp_height * scale_down_tri;
          }

          // pointing right
          start_x = 0 ;
          start_y = -tri_height;
          mid_x = tri_width;
          mid_y = 0;
          final_x = 0;
          final_y = tri_height;

        } else {

          if (tmp_height < min_tri_height){
            tri_width = tmp_height * scale_down_tri;
          }

          // pointing downward
          start_x = -tri_width;
          start_y = 0;
          mid_x = 0;
          mid_y = tri_height;
          final_x = tri_width;
          final_y = 0;

        }

        // save triangle height
        var data_key = '__data__';
        d3.select(this)[0][0][data_key].tri_dim = 10;

        var output_string = 'M' + start_x + ',' + start_y + ' L' +
        mid_x + ', ' + mid_y + ' L'
        + final_x + ','+ final_y +' Z';

        return output_string;
      });

      dendro_crop_tip
        .html(function(){
          var full_string = 'Click to undo crop';
          return full_string;
        });

  }

  icons
    .style('cursor', 'pointer')
    .style('opacity', function(){

      var inst_opacity;

      // if (d3.select(this).classed('hide_crop')){
      //   inst_opacity = 0;
      // } else {
      //   inst_opacity = button_opacity;
      // }

      inst_opacity = button_opacity;
      return inst_opacity;
    })
    .attr('transform', function(d){
      var inst_translate;

      var inst_x;
      var inst_y;

      if (inst_rc === 'row'){
        inst_x = params.viz.uni_margin;
        inst_y = d.pos_mid ;
      } else {
        inst_x = d.pos_mid ;
        inst_y = params.viz.uni_margin;
      }

      inst_translate = 'translate('+ inst_x +',' + inst_y + ')';
      return inst_translate;
    })
    .on('mouseover', function(d){

      d3.select(this)
        .classed('hovering', true);

      dendro_crop_tip.show(d);

      dendro_group_highlight(params, this, d, inst_rc);

      // display with zero opacity
      d3.selectAll( params.viz.root_tips + '_'+inst_rc+'_dendro_crop_tip')
        .style('opacity', 0)
        .style('display', 'block');

      // check if still hovering
      setTimeout(still_hovering, wait_before_tooltip, this);

    })
    .on('mouseout', function(){

      d3.select(this)
        .classed('hovering', false);

      d3.selectAll(params.root+' .dendro_shadow')
        .remove();

      d3.select(this)
        .style('opacity', button_opacity);

      dendro_crop_tip.hide(this);

    })
    .on('click', function(d){

      // give user visual cue
      d3.select(this)
        .style('opacity', 0.9)
        .transition()
        .duration(1000)
        .style('opacity', 0);

      // remove dendro shadows when clicked
      d3.selectAll(params.root+' .dendro_shadow')
        .remove();

      /* filter using dendrogram */
      if (cgm.params.dendro_filter.row === false &&
          cgm.params.dendro_filter.col === false &&
          cgm.params.cat_filter.row === false &&
          cgm.params.cat_filter.col === false
        ){

        // Run Filtering
        ///////////////////

        // use class as 'global' variable
        d3.select(cgm.params.root+' .'+ inst_rc +'_dendro_icons_group')
          .attr('transform', 'translate(0,0), scale(1,1)')
          .classed('ran_filter', true);

        d3.select(cgm.params.root+' .'+ other_rc +'_dendro_icons_group')
          .attr('transform', 'translate(0,0), scale(1,1)');

        // do not display dendrogram slider if filtering has been run
        d3.select(cgm.params.root+' .'+ inst_rc +'_slider_group')
          .style('display', 'none');

        // do not display other crop buttons since they are inactive
        d3.select(cgm.params.root+' .'+ other_rc +'_dendro_icons_container')
          .style('display', 'none');

        // do not display brush-crop button if performing dendro crop
        d3.select(cgm.params.root+' .crop_button')
          .style('opacity', 0.2);

      } else {

        // Undo Filtering
        ///////////////////
        // use class as 'global' variable
        d3.select(cgm.params.root+' .'+ inst_rc +'_dendro_icons_group')
          .attr('transform', 'translate(0,0), scale(1,1)')
          .classed('ran_filter', false);

        d3.select(cgm.params.root+' .'+ other_rc +'_dendro_icons_group')
          .attr('transform', 'translate(0,0), scale(1,1)');

        if (params.viz.inst_order[other_rc] === 'clust'){
          // display slider when cropping has not been done
          d3.select(cgm.params.root+' .'+ inst_rc +'_slider_group')
            .style('display', 'block');
          }

        // display other crop buttons when cropping has not been done
        d3.select(cgm.params.root+' .'+ other_rc +'_dendro_icons_container')
          .style('display', 'block');

        // display brush-crop button if not performing dendro crop
        d3.select(cgm.params.root+' .crop_button')
          .style('opacity', 1);

      }

      run_dendro_filter(cgm, d, inst_rc);

    })
    .call(dendro_crop_tip);

  // ordering has been reversed
  if (params.viz.inst_order[other_rc] != 'clust'){
    // do not display if not in cluster order
    d3.select(params.root+' .'+inst_rc+'_dendro_icons_group')
      .selectAll('path')
      .style('display', 'none');
  }

  function still_hovering(inst_selection){

    if (d3.select(inst_selection).classed('hovering')){
      // increase opacity
      d3.selectAll( params.viz.root_tips + '_'+ inst_rc +'_dendro_crop_tip')
        .style('opacity', 1)
        .style('display', 'block');
    }

  }

  zoom_crop_triangles(params, params.zoom_info, inst_rc);

};