var calc_row_dendro_triangles = require('./calc_row_dendro_triangles');
var dendro_group_highlight = require('./dendro_group_highlight');
var dendro_mouseover = require('./dendro_mouseover');
var dendro_mouseout = require('./dendro_mouseout');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var make_dendro_crop_buttons = require('./make_dendro_crop_buttons');

module.exports = function make_row_dendro_triangles(cgm, is_change_group = false){

  var params = cgm.params;

  // orders are switched!
  if (params.viz.inst_order.col === 'clust'){
    d3.select(params.root+' .row_slider_group')
      .style('opacity', 1);
  }

  var dendro_info = calc_row_dendro_triangles(params);

  if (d3.select(cgm.params.root+' .row_dendro_crop_buttons').empty() === false){
    make_dendro_crop_buttons(cgm, is_change_group);
  }

  // constant dendrogram opacity
  var inst_dendro_opacity = params.viz.dendro_opacity;

  // toggle dendro opacity
  // var inst_dendro_opacity;
  // if (dendro_info.length > 1){
  //   inst_dendro_opacity = params.viz.dendro_opacity;
  // } else {
  //    inst_dendro_opacity = 0.90;
  // }

  // remove any old row dendro tooltips from this visualization
  d3.selectAll(cgm.params.viz.root_tips+'_row_dendro').remove();

  // d3-tooltip
  var tmp_y_offset = 0;
  var tmp_x_offset = -5;
  var dendro_tip = d3_tip_custom()
    .attr('class',function(){
      // add root element to class
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + ' d3-tip ' +
                         root_tip_selector +  '_row_dendro';

      return class_string;
    })
    .direction('nw')
    .offset([tmp_y_offset, tmp_x_offset])
    .style('display','none')
    .style('opacity', 0)
    .html(function(){

      var full_string = 'Click for cluster information <br>'+
                        'and additional options.';
      return full_string;

    });

  // run transition rules
  var run_transition;
  if (d3.selectAll(params.root+' .row_dendro_group').empty()){
    run_transition = false;
  } else {
    run_transition = true;
    d3.selectAll(params.root+' .row_dendro_group').remove();
    d3.selectAll(params.root+' .dendro_tip').remove();
  }

  if (is_change_group){
    run_transition = false;
  }

  d3.select(params.root+' .row_dendro_container')
    .selectAll('path')
    .data(dendro_info, function(d){return d.name;})
    .enter()
    .append('path')
    .style('opacity',0)
    .attr('d', function(d) {

      // up triangle
      var start_x = 0 ;
      var start_y = d.pos_top;

      var mid_x = 30;
      var mid_y = d.pos_mid;

      var final_x = 0;
      var final_y = d.pos_bot;

      var output_string = 'M' + start_x + ',' + start_y + ', L' +
      mid_x + ', ' + mid_y + ', L'
      + final_x + ','+ final_y +' Z';

      return output_string;
    })
    .attr('class', 'row_dendro_group')

    .style('fill','black')
    .on('mouseover', function(d){

      var inst_rc;
      if (params.sim_mat){
        inst_rc = 'both';
      } else {
        inst_rc = 'row';
      }

      dendro_mouseover(cgm, this);
      dendro_group_highlight(params, this, d, inst_rc);

      // need to improve
      d3.selectAll( params.viz.root_tips + '_row_dendro')
        .style('opacity', 1)
        .style('display', 'block');

      dendro_tip.show(d);
    })
    .on('mouseout', function(){
      if (params.viz.inst_order.col === 'clust'){
        d3.select(this)
          .style('opacity', inst_dendro_opacity);
      }

      d3.selectAll(params.root+' .dendro_shadow')
        .remove();

      dendro_mouseout(this);
      dendro_tip.hide(this);

      // need to improve
      d3.selectAll( params.viz.root_tips + '_row_dendro')
        .style('opacity', 0)
        .style('display', 'none');

    })
    .on('click', function(d){

      $(params.root+' .dendro_info').modal('toggle');

      var group_string = d.all_names.join(', ');
      d3.select(params.root+' .dendro_info input')
        .attr('value', group_string);

    })
    .call(dendro_tip);

  var triangle_opacity;
  if (params.viz.inst_order.col === 'clust'){
    triangle_opacity = inst_dendro_opacity;
  } else {
    triangle_opacity = 0;
  }

  if (run_transition){

    d3.select(params.root+' .row_dendro_container')
      .selectAll('path')
      .transition().delay(1000).duration(1000)
      .style('opacity', triangle_opacity);

  } else {

    d3.select(params.root+' .row_dendro_container')
      .selectAll('path')
      .style('opacity', triangle_opacity);

  }

};