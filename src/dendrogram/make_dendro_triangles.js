var calc_row_dendro_triangles = require('./calc_row_dendro_triangles');
var calc_col_dendro_triangles = require('./calc_col_dendro_triangles');
var dendro_group_highlight = require('./dendro_group_highlight');
var d3_tip_custom = require('../tooltip/d3_tip_custom');
var make_dendro_crop_buttons = require('./make_dendro_crop_buttons');
var make_cat_breakdown_graph = require('../categories/make_cat_breakdown_graph');

module.exports = function make_dendro_triangles(cgm, inst_rc, is_change_group = false)
{

  var params = cgm.params;


  // in case sim_mat
  if (inst_rc === 'both'){
    inst_rc = 'row';
  }

  var other_rc;
  if (inst_rc === 'row'){
    other_rc = 'col';
  } else {
    other_rc = 'row';
  }

  // orders are switched!
  if (params.viz.inst_order[other_rc] === 'clust'){
    d3.select(params.root+' .'+ inst_rc +'_slider_group')
      .style('opacity', 1);
  }

  var dendro_info;

  if (params.viz.show_dendrogram){
    if (inst_rc === 'row'){
      dendro_info = calc_row_dendro_triangles(params);
    } else {
      dendro_info = calc_col_dendro_triangles(params);
    }

    if (d3.select(cgm.params.root+' .'+ inst_rc +'_dendro_crop_buttons').empty() === false){
      make_dendro_crop_buttons(cgm, inst_rc);
    }

  }


  // constant dendrogram opacity
  var inst_dendro_opacity = params.viz.dendro_opacity;

  function still_hovering(inst_selection, inst_data, i){

    if (d3.select(inst_selection).classed('hovering')){

      // define where graph should be built
      var inst_selector = params.viz.root_tips + '_' + inst_rc + '_dendro_tip';

      // prevent mouseover from making multiple graphs
      if (d3.select(inst_selector + ' .cat_graph').empty()){

      if ( params.viz.cat_info[inst_rc] !== null ){
        make_cat_breakdown_graph(params, inst_rc, inst_data, dendro_info[i], inst_selector, true);
      }

      }

      d3.selectAll(params.viz.root_tips + '_'+ inst_rc +'_dendro_tip')
        .style('opacity', 1);

    }

  }

  var wait_before_tooltip = 500;

  // remove any old dendro tooltips from this visualization
  d3.selectAll(cgm.params.viz.root_tips+'_'+ inst_rc +'_dendro_tip').remove();

  // run transition rules
  var run_transition;
  if (d3.selectAll(params.root+' .' + inst_rc + '_dendro_group').empty()){
    run_transition = false;
  } else {
    run_transition = true;
    d3.selectAll(params.root+' .'+ inst_rc +'_dendro_group').remove();
    // d3.selectAll(params.root+' .dendro_tip').remove();
  }

  // d3-tooltip
  var tmp_y_offset = 0;
  var tmp_x_offset = -5;
  var dendro_tip = d3_tip_custom()
    .attr('class',function(){
      // add root element to class
      var root_tip_selector = params.viz.root_tips.replace('.','');
      var class_string = root_tip_selector + ' d3-tip ' +
                         root_tip_selector +  '_' + inst_rc + '_dendro_tip';

      return class_string;
    })
    .direction('nw')
    .offset([tmp_y_offset, tmp_x_offset])
    .style('display','none')
    .style('opacity', 0);

  dendro_tip
    .html(function(){
      var full_string = '<div class="cluster_info_container"></div>Click for cluster information <br>'+
                        'and additional options.';
      return full_string;
    });


  if (is_change_group){
    run_transition = false;
  }

  var dendro_traps = d3.select(params.root+' .'+ inst_rc +'_dendro_container')
    .selectAll('path')
    .data(dendro_info, function(d){return d.name;})
    .enter()
    .append('path')
    .style('opacity',0)
    .attr('class', inst_rc +'_dendro_group')

    .style('fill','black');

  // draw triangles (shown as trapezoids)
  //////////////////////////////////////////
  var start_x;
  var start_y;
  var mid_x;
  var mid_y;
  var final_x;
  var final_y;

  // row triangles
  dendro_traps
    .attr('d', function(d) {

      if (inst_rc === 'row'){
        // row triangles
        start_x = 0 ;
        start_y = d.pos_top;
        mid_x = 30;
        mid_y = d.pos_mid;
        final_x = 0;
        final_y = d.pos_bot;
      } else {
        // column triangles
        start_x = d.pos_top;
        start_y = 0 ;
        mid_x = d.pos_mid;
        mid_y = 30;
        final_x = d.pos_bot;
        final_y = 0;
      }


      var output_string = 'M' + start_x + ',' + start_y + ' L' +
      mid_x + ', ' + mid_y + ' L'
      + final_x + ','+ final_y +' Z';
      return output_string;
    });


  dendro_traps
    .on('mouseover', function(d, i){

      // if (params.sim_mat){
      //   inst_rc = 'both';
      // }

      // run instantly on mouseover
      d3.select(this)
        .classed('hovering', true);

      if (cgm.params.dendro_callback != null){
        cgm.params.dendro_callback(this);
      }

      // display tip
      // this is needed for it to show in the right place and the opacity
      // will be toggled to delay the tooltip for the user
      d3.select( params.viz.root_tips + '_' + inst_rc + '_dendro_tip' )
        .style('display', 'block');

      dendro_group_highlight(params, this, d, inst_rc);

      // show the tip (make sure it is displaying before it is shown)
      dendro_tip.show(d);

      // set opacity to zero
      d3.select( params.viz.root_tips + '_'+ inst_rc +'_dendro_tip')
        .style('opacity', 0);

      // check if still hovering
      setTimeout(still_hovering, wait_before_tooltip, this, d, i);

    })
    .on('mouseout', function(){
      if (params.viz.inst_order[other_rc] === 'clust'){
        d3.select(this)
          .style('opacity', inst_dendro_opacity);
      }

      d3.selectAll(params.root+' .dendro_shadow')
        .remove();

      d3.select(this)
        .classed('hovering',false);
      dendro_tip.hide(this);

    })
    .on('click', function(d, i){

      $(params.root+' .dendro_info').modal('toggle');

      var group_string = d.all_names.join(', ');
      d3.select(params.root+' .dendro_info input')
        .attr('value', group_string);

      var inst_selector = params.root + ' .dendro_info';

      // remove old graphs (modals are not within params.root)
      d3.selectAll('.dendro_info .cluster_info_container .cat_graph')
        .remove();

      if ( params.viz.cat_info[inst_rc] !== null ){
        make_cat_breakdown_graph(params, inst_rc, d, dendro_info[i], inst_selector);
      }

      if (cgm.params.dendro_click_callback != null){
        cgm.params.dendro_click_callback(this);
      }

    })
    .call(dendro_tip);

  var triangle_opacity;
  if (params.viz.inst_order[other_rc] === 'clust'){
    triangle_opacity = inst_dendro_opacity;
  } else {
    triangle_opacity = 0;
  }

  if (run_transition){

    d3.select(params.root+' .'+ inst_rc +'_dendro_container')
      .selectAll('path')
      .transition().delay(1000).duration(1000)
      .style('opacity', triangle_opacity);

  } else {

    d3.select(params.root+' .'+ inst_rc +'_dendro_container')
      .selectAll('path')
      .style('opacity', triangle_opacity);

  }

};