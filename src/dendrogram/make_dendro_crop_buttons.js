var calc_row_dendro_triangles = require('./calc_row_dendro_triangles');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var dendro_group_highlight = require('./dendro_group_highlight');
var row_dendro_filter = require('./row_dendro_filter');

module.exports = function make_dendro_crop_buttons(cgm, inst_rc, is_change_group = false){

  var params = cgm.params;

  var button_opacity = params.viz.dendro_opacity * 0.60;

  // information needed to make dendro
  var dendro_info;
  if (inst_rc === 'row'){
    dendro_info = calc_row_dendro_triangles(params);
  } else {
    dendro_info = calc_col_dendro_triangles(params);
  }


  // d3-tooltip
  var tmp_y_offset = 0;
  var tmp_x_offset = -5;
  var dendro_crop_tip = d3_tip_custom()
    .attr('class',function(){
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + ' d3-tip ' +
                         root_tip_selector +  '_row_dendro_crop_tip';

      return class_string;
    })
    .direction('nw')
    .offset([tmp_y_offset, tmp_x_offset]);

  function still_hovering(inst_selection){

    if (d3.select(inst_selection).classed('hovering')){
      // increase opacity
      d3.selectAll( params.viz.root_tips + '_row_dendro_crop_tip')
        .style('opacity', 1)
        .style('display', 'block');
    }

  }

  var wait_before_tooltip = 500;

  d3.selectAll( params.viz.root_tips + '_row_dendro_crop_tip').remove();

  if (is_change_group){
    // run_transition = false;
  }

  d3.selectAll(params.root+' .row_dendro_crop_buttons')
    .remove();

  var inst_x = params.viz.uni_margin;
  var icons;

  // need to improve to account for zooming
  var min_tri_height = 45;
  var scale_down_tri = 0.25;

  // make crop buttons or undo buttons
  if (d3.select('.row_dendro_icons_group').classed('ran_filter') === false){

    // append path
    icons = d3.select(params.root+' .row_dendro_icons_group')
      .selectAll('path')
      .data(dendro_info, function(d){return d.name;})
      .enter()
      .append('path')
      .classed('row_dendro_crop_buttons', true)
      .attr('d', function(d) {

        var tri_height = 10;

        var tmp_height = d.pos_bot - d.pos_top;
        if (tmp_height < min_tri_height){
          tri_height = tmp_height * scale_down_tri;
        }

        // up triangle
        var start_x = 12 ;
        var start_y = -tri_height;

        var mid_x = 0;
        var mid_y = 0;

        var final_x = 12;
        var final_y = tri_height;

        var output_string = 'M' + start_x + ',' + start_y + ', L' +
        mid_x + ', ' + mid_y + ', L'
        + final_x + ','+ final_y +' Z';

        return output_string;
      });

      dendro_crop_tip
        .html(function(){
          var full_string = 'Click to crop cluster';
          return full_string;
        });

  } else {

    // trantiion in undo icon always
    // run_transition = true;

    // append path
    icons = d3.select(params.root+' .row_dendro_icons_group')
      .selectAll('path')
      .data(dendro_info, function(d){return d.name;})
      .enter()
      .append('path')
      .classed('row_dendro_crop_buttons', true)
      .attr('d', function(d) {

        var tri_height = 10;

        var tmp_height = d.pos_bot - d.pos_top;
        if (tmp_height < min_tri_height){
          tri_height = tmp_height * scale_down_tri;
        }

        // up triangle
        var start_x = 0 ;
        var start_y = -tri_height;

        var mid_x = 12;
        var mid_y = 0;

        var final_x = 0;
        var final_y = tri_height;

        var output_string = 'M' + start_x + ',' + start_y + ', L' +
        mid_x + ', ' + mid_y + ', L'
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
    .style('opacity', button_opacity)
    .attr('transform', function(d){
      var inst_translate;
      // var inst_y = String(100 * i);
      var inst_y = d.pos_mid ;
      inst_translate = 'translate('+ inst_x +',' + inst_y + ')';
      return inst_translate;
    })
    .on('mouseover', function(d){

      d3.select(this)
        .classed('hovering', true);

      dendro_crop_tip.show(d);

      dendro_group_highlight(params, this, d, inst_rc);

      // display with zero opacity
      d3.selectAll( params.viz.root_tips + '_row_dendro_crop_tip')
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
        .style('fill', 'blue')
        .transition()
        .duration(1000)
        .style('opacity', 0);

      /* filter rows using dendrogram */
      if (cgm.params.dendro_filter.row === false &&
          cgm.params.cat_filter.row === false &&
          cgm.params.cat_filter.col === false
        ){

        // use class as 'global' variable
        d3.select(cgm.params.root+' .row_dendro_icons_group')
          .classed('ran_filter', true);

      } else {
        // use class as 'global' variable
        d3.select(cgm.params.root+' .row_dendro_icons_group')
          .classed('ran_filter', false);
      }

      if (inst_rc === 'row'){
        row_dendro_filter(cgm, d);
      } else {
        console.log('set up column filtering')
      }

    })
    .call(dendro_crop_tip);

  var triangle_opacity;
  if (params.viz.inst_order.row === 'clust'){
    triangle_opacity = button_opacity;
  } else {
    triangle_opacity = 0;
  }

  d3.select(params.root+' .row_dendro_icons_group')
    .selectAll('path')
    .style('opacity', triangle_opacity);


};